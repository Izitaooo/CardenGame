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
  res.sendFile(__dirname + "/game.html");
});

const players = {};
const cards = {};






io.on("connection", (socket) => {
  console.log("a user connected");
  players[socket.id] = {

  };

    socket.on("createRoom", (roomName) => {
        socket.join(roomName)
        players[socket.id].room = roomName;

        socket.emit("roomCreated", roomName);

        console.log(`Player ${socket.id} is now in room ${roomName}`);
    })

    socket.on("cardPos", (data) => {
        cards[data.id] = {
            id: data.id,
            container: data.containerInfo,
            playerId: socket.id,
        };
        let lastSentCard = data.id;
        console.log("card position:", cards);

        // Send the card object directly
        socket.broadcast.emit("playerMoved", cards[lastSentCard]);
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
