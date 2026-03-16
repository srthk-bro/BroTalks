const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", socket => {

  socket.on("join-room", ({ room, username }) => {

    socket.join(room);

    socket.room = room;
    socket.username = username;

    if (!rooms[room]) rooms[room] = [];

    rooms[room].push(username);

    io.to(room).emit("room-users", rooms[room]);
  });

  socket.on("disconnect", () => {

    const room = socket.room;
    const username = socket.username;

    if (!room || !rooms[room]) return;

    rooms[room] = rooms[room].filter(u => u !== username);

    io.to(room).emit("room-users", rooms[room]);
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running");
});