const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", socket => {

  socket.broadcast.emit("user-connected");

  socket.on("ready", () => {
    socket.broadcast.emit("user-connected");
  });

  socket.on("signal", data => {
    socket.broadcast.emit("signal", data);
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running");
});