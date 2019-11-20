const opn = require("opn");
const _ = require("lodash");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { pingInterval: 5000 });
const port = 8080;

const states = {
    waiting: "WAITING",
    preparing: "PREPARING",
    jumping: "JUMPING"
};

app.use(express.static("public"));
server.listen(port, () => console.log(`Ready to jump on port ${port}`));

opn(`http://localhost:${port}/admin.html`);

const newGame = () => ({
    state: states.waiting,
    players: {},
    randomSeed: Math.floor(Math.random() * 500),
    goal: 5000,
    winners: [],
    hasDeath: false
});

let currentGame = newGame();

io.on("connection", function(socket) {
    console.log(`${socket.id} connected`);

    if (currentGame.state === states.jumping) {
        socket.emit("begin", {
            seed: currentGame.randomSeed,
            goal: currentGame.goal,
            death: currentGame.hasDeath
        });
    }

    socket.on("position", function(pos) {
        console.log(`${socket.id} is at: ${JSON.stringify(pos)}`);
        const timestamp = Date.now() - pos.ping;
        console.log(`Sent at ${timestamp} (ping ${pos.ping})`);
        currentGame.players[socket.id] = { ...pos, timestamp };
    });

    socket.on("disconnect", function() {
        delete currentGame.players[socket.id];
    });
});

function playersWithAgeTags() {
    const taggedPlayers = {};
    const now = Date.now();
    for (const id of Object.keys(currentGame.players)) {
        const player = currentGame.players[id];
        const age = now - player.timestamp;
        taggedPlayers[id] = { ...player, age };
    }
    return taggedPlayers;
}

function consumableGameState() {
    return {
        players: playersWithAgeTags(),
        state: currentGame.state,
        winners: currentGame.winners.map(id => currentGame.players[id].name),
        rank: calculateRank()
    };
}

function checkForWinners() {
    if (currentGame.state === states.jumping) {
        for (const id of Object.keys(currentGame.players)) {
            if (currentGame.players[id].score > currentGame.goal) {
                if (!currentGame.winners.includes(id)) {
                    currentGame.winners.push(id);
                }
            }
        }
    }
}

function calculateRank()
{
    const ranked = _.sortBy(Object.values(currentGame.players), ["y"]).map(p => p.name);
    console.log("Rank = " + JSON.stringify(ranked));
    return ranked;
}

setInterval(() => {
    calculateRank();
    checkForWinners();
    io.emit("gamestate", consumableGameState());
}, 200);

const admin = io.of("/admin");
admin.on("connection", socket => {
    socket.on("begin", settings => {
        if (currentGame.state !== states.waiting) {
            return;
        }

        currentGame.randomSeed = Math.floor(Math.random() * 500);
        currentGame.state = states.preparing;
        currentGame.goal = settings.goal;
        currentGame.hasDeath = settings.death || false;
        console.log(`Goal = ${currentGame.goal}`);

        io.emit("prepare", { countdown: 3});
        setTimeout(() => {
            io.emit("prepare", { countdown: 2});
        }, 1000)
        setTimeout(() => {
            io.emit("prepare", { countdown: 1});
        }, 2000)
        setTimeout(() => {
            currentGame.state = states.jumping;
            io.emit("begin", {
                seed: currentGame.randomSeed,
                goal: currentGame.goal,
                death: currentGame.hasDeath
            });
        }, 3000)
    });
    socket.on("stop", () => {
        if (currentGame.state !== states.jumping) {
            return;
        }

        currentGame = newGame();
        io.emit("stop");
    });
});