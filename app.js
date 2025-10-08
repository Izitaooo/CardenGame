const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server); // Create Socket.IO server

const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

// Use server.listen instead of app.listen
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

console.log("server has loaded");
