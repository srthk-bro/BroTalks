// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", socket => {

    console.log("User connected:", socket.id);

    socket.on("join-room", room => {
        socket.join(room);
        socket.to(room).emit("user-joined");
    });

    socket.on("signal", data => {
        socket.to(data.room).emit("signal", data.signal);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
  });