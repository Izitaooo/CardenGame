const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/game.html");
});

const players = {};
const cards = {};
const gameRooms = {}; // ✅ Move it HERE, outside the connection handler

io.on("connection", (socket) => {
    console.log("a user connected");
    players[socket.id] = {
        room: null
    };

    socket.on("getRoomInfo", () => {
        const playerRoom = players[socket.id].room;
        if (playerRoom) {
            socket.emit("roomInfo", playerRoom);
        }
    });

    socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        players[socket.id].room = roomName;

        // Initialize room state if doesn't exist
        if (!gameRooms[roomName]) {
            gameRooms[roomName] = {
                gameStarted: false,
                players: []
            };
        }

        gameRooms[roomName].players.push(socket.id);

        socket.emit("roomJoined", roomName);
        console.log(`Player ${socket.id} joined room ${roomName}`);

        updateRoomPlayerCount(roomName);
    });

    function updateRoomPlayerCount(roomName) {
        const room = io.sockets.adapter.rooms.get(roomName);
        const playerCount = room ? room.size : 0;

        io.to(roomName).emit("roomPlayerCount", {
            count: playerCount,
            roomName: roomName
        });
    }

    socket.on("switchRoles", () => {
        const playerRoom = players[socket.id].room;
        socket.to(playerRoom).emit("rolesSwitched");
    })

    socket.on("spawnedCard", (data) => {
        const playerRoom = players[socket.id].room;
        console.log("player in room :" + playerRoom + " spawned card id: " + data.id);
        socket.to(playerRoom).emit("enemySpawnedCard", data.id);
    })

    socket.on("agentsLockedIn", (data) => {
        const playerRoom = players[socket.id].room;
        const room = gameRooms[playerRoom];

        if (room && room.players.length === 2) {
            room.gameStarted = true;
            console.log(`Game started in room ${playerRoom}`); // Debug log
        }

        socket.to(playerRoom).emit("enemyChose", data);
    })

    socket.on("cardPos", (data) => {
        const playerRoom = players[socket.id].room;

        if (!playerRoom) {
            console.log("dumb mf : " + socket.id + " doesn't have a room lmao");
            return;
        }

        cards[data.id] = {
            id: data.id,
            container: data.containerInfo,
            playerId: socket.id,
        };

        console.log("card position:", cards);
        socket.to(playerRoom).emit("playerMoved", cards[data.id]);
    });

    socket.on("effectApplied", (data) => {
        const playerRoom = players[socket.id].room;

        // Send to other player in room
        socket.to(playerRoom).emit("enemyAppliedEffect", data);
    });

    socket.on("damageAgent", (agentId, damage) => {
        const playerRoom = players[socket.id].room;
        socket.to(playerRoom).emit("damageAgent", agentId, damage);
    })
    socket.on("selfDamageAgent", (agentId) => {
        const playerRoom = players[socket.id].room;
        console.log("sending update to server about Dealing 2 self damage due to Razorvine\n")
        socket.to(playerRoom).emit("selfDamageAgent", agentId);
    })
    socket.on("removeDoubleTap", (agentId) => {
        const playerRoom = players[socket.id].room;
        socket.to(playerRoom).emit("removeDoubleTap", agentId);
    })
    socket.on("removeTailwind", (agentId) => {
        const playerRoom = players[socket.id].room;
        socket.to(playerRoom).emit("removeTailwind", agentId);
    })

    // store per-room count
    const roomEndAgree = {}; // e.g. { roomId: 0 }

    socket.on("endAgreeRequest", () => {
        const playerRoom = players[socket.id].room;
        roomEndAgree[playerRoom] = (roomEndAgree[playerRoom] || 0) + 1;
        console.log(roomEndAgree[playerRoom], "server room count");
        io.to(playerRoom).emit("endAgreeCount", roomEndAgree[playerRoom]);
    });

    socket.on("disconnect", (reason) => {
        console.log(reason);
        const playerRoom = players[socket.id].room;

        if (playerRoom) {
            // Check if room exists in gameRooms
            if (gameRooms[playerRoom]) {
                const room = gameRooms[playerRoom];

                // If game started, notify others and RESET the entire room
                if (room.gameStarted) {
                    console.log(`Player disconnected from active game in room ${playerRoom}`);
                    socket.to(playerRoom).emit("crash");

                    // Reset the entire room since the game is broken
                    delete gameRooms[playerRoom];
                    console.log(`Room ${playerRoom} deleted due to mid-game disconnect`);
                } else {
                    // Game hadn't started yet, just remove this player
                    room.players = room.players.filter(id => id !== socket.id);

                    // Delete room if empty
                    if (room.players.length === 0) {
                        delete gameRooms[playerRoom];
                        console.log(`Room ${playerRoom} deleted - no players left`);
                    }
                }
            }

            updateRoomPlayerCount(playerRoom);
        }

        delete players[socket.id];
        delete cards[socket.id];
    });

    console.log(players);
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

console.log("server has loaded");
