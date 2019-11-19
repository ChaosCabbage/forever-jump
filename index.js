const _ = require("lodash");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { pingInterval: 5000 });
const port = 8080;

const states = {
    waiting: "WAITING",
    jumping: "JUMPING",
    won: "WON"
};

app.use(express.static("public"));
server.listen(port, () => console.log(`Ready to jump on port ${port}`));

const currentGame = {
    state: states.waiting,
    players: {},
    randomSeed: Math.floor(Math.random() * 500),
    //goal: 5000 + 40,
    goal: 100 + 40,
    winners: []
};

io.on("connection", function(socket) {
    console.log(`${socket.id} connected`);

    socket.join("current game");

    socket.on("position", function(pos) {
        console.log(`${socket.id} is at: ${JSON.stringify(pos)}`);
        const timestamp = Date.now() - pos.ping;
        console.log(`Sent at ${timestamp} (ping ${pos.ping})`);
        currentGame.players[socket.id] = { ...pos, timestamp };
    });

    socket.on("disconnect", function() {
        socket.leave("current game");
        if (currentGame.state === states.waiting) {
            delete currentGame.players[socket.id];
        }
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
        winners: currentGame.winners.map(id => currentGame.players[id].name)
    };
}

function checkForWinners() {
    for (const id of Object.keys(currentGame.players)) {
        if (currentGame.players[id].score > currentGame.goal) {
            if (!currentGame.winners.includes(id)) {
                currentGame.winners.push(id);
            }
        }
    }
}

setInterval(() => {
    checkForWinners();
    io.emit("gamestate", consumableGameState());
}, 200);

const admin = io.of("/admin");
admin.on("connection", socket => {
    socket.on("begin", settings => {
        currentGame.randomSeed = Math.floor(Math.random() * 500);
        currentGame.state = states.jumping;
        currentGame.goal = settings.goal + 40;
        console.log(`Goal = ${currentGame.goal}`);
        io.to("current game").emit("begin", {
            seed: currentGame.randomSeed,
            goal: currentGame.goal
        });
    });
    socket.on("stop", () => {
        currentGame.state = states.waiting;
        currentGame.players = {};
        currentGame.winners = [];
        io.to("current game").emit("stop");
    });
});
