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

        // Notify everyone in the room about player count
        updateRoomPlayerCount(roomName);
    });

    function updateRoomPlayerCount(roomName) {
        const room = io.sockets.adapter.rooms.get(roomName);
        const playerCount = room ? room.size : 0;

        // Send to everyone in the room
        io.to(roomName).emit("roomPlayerCount", {
            count: playerCount,
            roomName: roomName
        });
    }

    socket.on("switchRoles", () => {
        const playerRoom = players[socket.id].room; // w rooms
        socket.to(playerRoom).emit("rolesSwitched");
    })

    socket.on("spawnedCard", (data) => {
        const playerRoom = players[socket.id].room; // w rooms
        console.log("player in room :" + playerRoom + " spawned card id: " + data.id);
        socket.to(playerRoom).emit("enemySpawnedCard", data.id);
    })

    socket.on("agentsLockedIn", (data) => {
        const playerRoom = players[socket.id].room; // w rooms
        socket.to(playerRoom).emit("enemyChose", data);
    })

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

    socket.on("damageAgent", (agentId, damage) => {
        const playerRoom = players[socket.id].room; // w rooms
        socket.to(playerRoom).emit("damageAgent", agentId, damage);

    })

  //io.emit("updatePlayers", players);

  socket.on("disconnect", (reason) => {
      console.log(reason);
      const playerRoom = players[socket.id].room;

      delete players[socket.id];
      delete cards[socket.id];

      // Update player count for the room they left
      if (playerRoom) {
          updateRoomPlayerCount(playerRoom);
      }
  });

  console.log(players);
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

console.log("server has loaded");
