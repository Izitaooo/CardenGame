const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

// Use environment variable or default to 3000
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/game.html");
});

const players = {};
const cards = {};






io.on("connection", (socket) => {
  console.log("a user connected");
  players[socket.id] = {
      room: null
  };
    // Send room info when player requests it
    socket.on("getRoomInfo", () => {
        const playerRoom = players[socket.id].room;
        if (playerRoom) {
            socket.emit("roomInfo", playerRoom);
        }
    });



    socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        players[socket.id].room = roomName;

        socket.emit("roomJoined", roomName);
        console.log(`Player ${socket.id} joined room ${roomName}`);
    });

    socket.on("cardPos", (data) => {
        const playerRoom = players[socket.id].room; // w rooms

        if (!playerRoom) {
            console.log("dumb mf : " + socket.id + " doesn't have a room lmao");
            return;
        }

        cards[data.id] = {
            id: data.id,
            container: data.containerInfo,
            playerId: socket.id,
        };
        //let lastSentCard = data.id;
        console.log("card position:", cards);

        // Send to room
        socket.to(playerRoom).emit("playerMoved", cards[data.id]);
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
