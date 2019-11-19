const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { pingInterval: 5000 });
const port = 8080;

app.use(express.static("public"));

server.listen(port, () => console.log(`Ready to jump on port ${port}`));

const gamestate = {};

io.on("connection", function(socket) {
    console.log(`${socket.id} connected`);

    socket.on("position", function(pos) {
        console.log(`${socket.id} is at: ${JSON.stringify(pos)}`);
        const timestamp = Date.now() - pos.ping;
        console.log(`Sent at ${timestamp} (ping ${pos.ping})`);
        gamestate[socket.id] = { ...pos, timestamp };
    });

    socket.on("disconnect", function() {
        delete gamestate[socket.id];
    });
});

function consumableGameState() {
    const filteredGameState = {};
    const now = Date.now();
    for (const id of Object.keys(gamestate)) {
        const player = gamestate[id];
        const age = now - player.timestamp;
        filteredGameState[id] = { ...player, age };
    }
    return filteredGameState;
}

setInterval(() => {
    io.emit("gamestate", consumableGameState());
}, 200);
