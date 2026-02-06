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

    socket.on("create-room", ({ roomId, word, level }) => {
      rooms[roomId] = { word, guessed: [], wrong: 0, level };
      socket.join(roomId);
      console.log("Rooms after creation:", rooms); // 👈 check this
      socket.emit("room-created", roomId);
    });

    socket.on("join-room", ({ roomId }) => {
      const id = roomId.trim().toUpperCase();
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
        word: rooms[id].word,
        level: rooms[id].level,
      });
    });

    socket.on("guess-letter", ({ roomId, letter }) => {
      const id = roomId.trim().toUpperCase();
      const room = rooms[id];
      if (!room || room.guessed.includes(letter)) return;

      room.guessed.push(letter);
      if (!room.word.includes(letter)) room.wrong++;

      io.to(id).emit("game-update", {
        guessed: room.guessed,
        wrong: room.wrong,
      });

      // Check for win or loss
      const isWin = room.word.split("").every((l) => room.guessed.includes(l));
      const isLose = room.wrong >= 6;

      if (isWin || isLose) {
        io.to(id).emit("game-ended", {
          word: room.word,
          isWin,
          isLose,
        });
      }
    });
  });

  // ✅ Next.js routes
  server.use((req, res) => handle(req, res));

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
