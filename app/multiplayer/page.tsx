"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/hooks/useSocket";
import Keyboard from "@/components/Keyboard";
import WordDisplay from "@/components/WordDisplay";
import HangmanDrawing from "@/components/HangmanDrawing";
import BackButton from "@/components/BackButton";

const MAX_WRONG = 6;

export default function MultiplayerPage() {
  const [socket, setSocket] = useState<Socket | null>(null);

  // Stage: menu → host → join → game
  const [stage, setStage] = useState<"menu" | "host" | "join" | "game">("menu");
  const [roomId, setRoomId] = useState("");
  const [word, setWord] = useState(""); // only host knows
  const [guessed, setGuessed] = useState<string[]>([]);
  const [wrong, setWrong] = useState(0);
  const [input, setInput] = useState("");

  useEffect(() => {
    const s = getSocket(); // ✅ Get singleton socket
    setSocket(s);

    s.on("room-created", (id) => {
      console.log("Room created:", id);
      setRoomId(id);
      setStage("game");
    });

    s.on(
      "room-joined",
      (state: { guessed: string[]; wrong: number; wordLength: number }) => {
        console.log("Joined room:", state);
        setGuessed(state.guessed);
        setWrong(state.wrong);
        setWord("_".repeat(state.wordLength)); // hide actual word
        setStage("game");
      },
    );

    s.on("room-error", (msg) => {
      console.log("Room error:", msg);
    });

    s.on(
      "game-update",
      ({ guessed, wrong }: { guessed: string[]; wrong: number }) => {
        setGuessed(guessed);
        setWrong(wrong);
      },
    );

    return () => {
      s.off();
    };
  }, []);

  function createRoom(word: string) {
    if (!socket) return;
    if (!word.trim()) return alert("Enter a word");

    const id = word.trim().toUpperCase().slice(0, 5); // simple room code

    console.log("Creating room:", id);
    socket.emit("create-room", { roomId: id, word: word.trim() });
  }

  // Joiner joins room

  function joinRoom() {
    if (!socket) return;
    if (!roomId.trim()) return alert("Enter room code");

    console.log("Attempting join:", roomId.trim());
    socket.emit("join-room", { roomId: roomId.trim() });
  }

  // Guess letter
  function guess(letter: string) {
    socket?.emit("guess-letter", { roomId, letter });
  }

  const isWinner = word && word.split("").every((l) => guessed.includes(l));
  const isLoser = wrong >= MAX_WRONG;

  // UI stages
  if (stage === "menu") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-xl space-y-4 w-80 text-center">
          <h1 className="text-2xl font-bold">Multiplayer Hangman</h1>
          <button onClick={() => setStage("host")} className="btn w-full">
            Create Room
          </button>
          <button onClick={() => setStage("join")} className="btn w-full">
            Join Room
          </button>
        </div>
      </main>
    );
  }

  if (stage === "host") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-xl space-y-4 w-80 text-center">
          <BackButton onClick={() => setStage("menu")} />
          <p>Enter secret word</p>
          <input
            type="password"
            value={word}
            onChange={(e) => setWord(e.target.value.toLowerCase())}
            className="w-full px-3 py-2 rounded text-black"
          />
          <button onClick={() => createRoom(word)} className="btn w-full">
            Create Room
          </button>
        </div>
      </main>
    );
  }

  if (stage === "join") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-xl space-y-4 w-80 text-center">
          <BackButton onClick={() => setStage("menu")} />
          <p>Enter room code</p>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-3 py-2 rounded text-black"
          />
          <button onClick={joinRoom} className="btn w-full">
            Join Room
          </button>
        </div>
      </main>
    );
  }

  // Game stage
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl space-y-6 w-full max-w-md text-center">
        <BackButton
          onClick={() => {
            setStage("menu");
            setWord("");
            setGuessed([]);
            setWrong(0);
            setRoomId("");
          }}
        />

        <p className="text-sm text-gray-400">Room: {roomId}</p>

        <HangmanDrawing wrongGuesses={wrong} />
        <WordDisplay word={word} guessedLetters={guessed} />

        {isWinner && <p className="text-green-400 text-lg">🎉 Win!</p>}
        {isLoser && <p className="text-red-400 text-lg">💀 Lose!</p>}

        {!isWinner && !isLoser && (
          <Keyboard guessedLetters={guessed} onGuess={guess} />
        )}
      </div>
    </main>
  );
}
