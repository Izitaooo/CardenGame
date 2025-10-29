const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});
const players = {};
const cards = {};

io.on("connection", (socket) => {
  console.log("a user connected");
  players[socket.id] = {
  };

  socket.on("cardPos", (data) => {
      cards[data.id] = {
          id: data.id,
          container: data.containerInfo, // This is correct
          playerId: socket.id,
      };
    console.log("card position:", cards);
    // Store the card position

    // Broadcast using the correct property name
    socket.broadcast.emit("playerMoved", {
      id: socket.id,
      container: data.containerInfo, // Use containerInfo instead of data.container
    });
  });

  io.emit("updatePlayers", players);

  socket.on("disconnect", (reason) => {
    console.log(reason);
    delete players[socket.id];
    delete cards[socket.id];
  });

  console.log(players);
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

console.log("server has loaded");
