const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const rooms = {};

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create-room", ({ roomId, word }) => {
      rooms[roomId] = { word, guessed: [], wrong: 0 };
      socket.join(roomId);
      console.log("Rooms after creation:", rooms); // 👈 check this
      socket.emit("room-created", roomId);
    });

    socket.on("join-room", ({ roomId }) => {
      const id = roomId.trim();
      console.log("Attempting join:", id, "Current rooms:", rooms); // 👈 critical
      if (!rooms[id]) {
        console.log("Room not found:", id);
        return socket.emit("room-error", "Room not found");
      }

      socket.join(id);
      socket.emit("room-joined", {
        guessed: rooms[id].guessed,
        wrong: rooms[id].wrong,
        wordLength: rooms[id].word.length,
      });
    });

    socket.on("guess-letter", ({ roomId, letter }) => {
      const room = rooms[roomId];
      if (!room || room.guessed.includes(letter)) return;

      room.guessed.push(letter);
      if (!room.word.includes(letter)) room.wrong++;

      io.to(roomId).emit("game-update", {
        guessed: room.guessed,
        wrong: room.wrong,
      });
    });
  });

  // ✅ Next.js routes
  server.use((req, res) => handle(req, res));

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
