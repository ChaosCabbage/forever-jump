const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {pingInterval: 5000});
const port = 80;

app.use(express.static('public'));

server.listen(port, () => console.log(`Ready to jump on port ${port}`));

const gamestate = {};

io.on('connection', function(socket) {
  console.log(`${socket.id} connected`);

  socket.on("position", function(pos) {
      console.log(`${socket.id} is at: ${JSON.stringify(pos)}`)
      gamestate[socket.id] = pos;
  });

  socket.on("disconnect", function() {
      delete gamestate[socket.id];
  })
});

setInterval(() => {
    io.emit("gamestate", gamestate)
}, 500);
