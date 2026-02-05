import { Server } from "socket.io";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Attach socket.io to the Next.js server instance so the client can connect to the same origin.
  const { socket } = req as any;

  if (!socket.server.io) {
    const io = new Server(socket.server, {
      cors: { origin: "*" },
    });

    const rooms: Record<
      string,
      { word: string; guessed: string[]; wrong: number }
    > = {};

    io.on("connection", (sock) => {
      sock.on("create-room", ({ roomId, word }) => {
        rooms[roomId] = { word, guessed: [], wrong: 0 };
        sock.join(roomId);
        sock.emit("room-created", roomId);
      });

      sock.on("join-room", ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) {
          sock.emit("room-error", "Room not found");
          return;
        }
        sock.join(roomId);
        sock.emit("room-joined", {
          wordLength: room.word.length,
          guessed: room.guessed,
          wrong: room.wrong,
        });
      });

      sock.on("guess-letter", ({ roomId, letter }) => {
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

    socket.server.io = io;
  }

  return NextResponse.json({ status: "Socket running" });
}
