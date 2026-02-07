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

    socket.on("create-room", ({ roomId, word, level }) => {
      rooms[roomId] = { word, guessed: [], wrong: 0, level };
      socket.join(roomId);
      socket.emit("room-created", roomId);
    });

    socket.on("join-room", ({ roomId }) => {
      const id = roomId.trim().toUpperCase();
      if (!rooms[id]) {
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

      // Notify other players in the room that someone joined
      socket.to(id).emit("player-joined");
    });

    socket.on("draw-line", ({ roomId, x0, y0, x1, y1 }) => {
      const id = roomId.trim().toUpperCase();
      io.to(id).emit("draw-line", { x0, y0, x1, y1 });
    });

    socket.on("clear-canvas", ({ roomId }) => {
      const id = roomId.trim().toUpperCase();
      io.to(id).emit("clear-canvas");
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

    socket.on("new-round", ({ roomId, word, level }) => {
      const id = roomId.trim().toUpperCase();
      if (rooms[id]) {
        // Reset game state with new word
        rooms[id] = { word, guessed: [], wrong: 0, level };
        
        // Notify all players in the room
        io.to(id).emit("new-round-started", {
          guessed: [],
          wrong: 0,
          wordLength: word.length,
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
