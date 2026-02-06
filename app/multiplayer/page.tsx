"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/hooks/useSocket";
import Keyboard from "@/components/Keyboard";
import WordDisplay from "@/components/WordDisplay";
import HangmanDrawing from "@/components/HangmanDrawing";
import BackButton from "@/components/BackButton";
import DrawingBoard from "@/components/DrawingBoard";
import LevelSelector from "@/components/LevelSelector";
import words from "@/data/words.json";

const MAX_WRONG = 6;
type Level = "easy" | "medium" | "hard";

export default function MultiplayerPage() {
  const [socket, setSocket] = useState<Socket | null>(null);

  // Stage: menu → host → join → game
  const [stage, setStage] = useState<"menu" | "host" | "join" | "game">("menu");
  const [level, setLevel] = useState<Level | null>(null);
  const [roomId, setRoomId] = useState("");
  const [word, setWord] = useState(""); // only host knows
  const [actualWord, setActualWord] = useState(""); // revealed at end
  const [guessed, setGuessed] = useState<string[]>([]);
  const [wrong, setWrong] = useState(0);
  const [useCustomWord, setUseCustomWord] = useState(false);

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
      (state: {
        guessed: string[];
        wrong: number;
        wordLength: number;
        word: string;
        level?: Level;
      }) => {
        console.log("Joined room:", state);
        setGuessed(state.guessed);
        setWrong(state.wrong);
        setWord(state.word);
        if (state.level) setLevel(state.level);
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

    s.on("game-ended", ({ word: endWord }: { word: string }) => {
      console.log("Game ended, word revealed:", endWord);
      setActualWord(endWord);
    });

    return () => {
      s.off();
    };
  }, []);

  function createRoom(wordToUse?: string) {
    if (!socket) return;
    if (!level) return alert("Select a difficulty level");

    let selectedWord = wordToUse;

    if (!selectedWord || !selectedWord.trim()) {
      // If custom word is enabled or no word provided, use from list
      const wordList = words[level];
      selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
    }

    const id = selectedWord.trim().toUpperCase().slice(0, 5); // simple room code

    console.log(
      "Creating room:",
      id,
      "Level:",
      level,
      "Word:",
      selectedWord.trim(),
    );
    
    // Set word for host
    setWord(selectedWord.trim().toLowerCase());
    setRoomId(id);
    setStage("game");
    
    socket.emit("create-room", {
      roomId: id,
      word: selectedWord.trim(),
      level,
    });
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
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-pink-900 to-slate-900 text-white relative overflow-hidden px-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 bg-slate-800/80 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-700/50 space-y-6 w-full max-w-md text-center">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-400 to-purple-400">
              Multiplayer
            </h1>
            <p className="text-slate-400 text-sm">Challenge your friends!</p>
          </div>

          <div className="space-y-4 pt-4">
            <button
              onClick={() => setStage("host")}
              className="group relative w-full bg-linear-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-pink-500/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
              <span className="relative flex items-center justify-center gap-2">
                🎮 Create Room
              </span>
            </button>

            <button
              onClick={() => setStage("join")}
              className="group relative w-full bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
              <span className="relative flex items-center justify-center gap-2">
                🚪 Join Room
              </span>
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%,
            100% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </main>
    );
  }

  if (stage === "host") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-pink-900 to-slate-900 text-white relative overflow-hidden px-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 bg-slate-800/80 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-700/50 space-y-6 w-full max-w-md">
          <BackButton
            onClick={() => {
              setStage("menu");
              setLevel(null);
              setWord("");
              setUseCustomWord(false);
            }}
          />

          {!level ? (
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-400 to-purple-400">
                  Create Room
                </h2>
                <p className="text-slate-400 text-sm">
                  Select difficulty first
                </p>
              </div>
              <LevelSelector
                onSelect={(selectedLevel) => setLevel(selectedLevel)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-2 pb-4 border-b border-slate-700">
                <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-400 to-purple-400">
                  Create Room
                </h2>
                <p className="text-slate-400 text-sm">
                  Difficulty:{" "}
                  <span className="text-pink-400 font-semibold capitalize">
                    {level}
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">
                  Word Source
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setUseCustomWord(false);
                      setWord("");
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      !useCustomWord
                        ? "bg-pink-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    📚 From List
                  </button>
                  <button
                    onClick={() => setUseCustomWord(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      useCustomWord
                        ? "bg-pink-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    ✏️ Custom Word
                  </button>
                </div>
              </div>

              {useCustomWord && (
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Enter Your Word
                  </label>
                  <input
                    type="password"
                    value={word}
                    onChange={(e) => setWord(e.target.value.toLowerCase())}
                    placeholder="Enter your word..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 text-white placeholder-slate-500 transition-all outline-none"
                  />
                </div>
              )}

              {!useCustomWord && (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-sm text-slate-400 mb-2">
                    A random{" "}
                    <span className="capitalize font-semibold text-pink-400">
                      {level}
                    </span>{" "}
                    word will be selected
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setLevel(null);
                    setWord("");
                    setUseCustomWord(false);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                >
                  Change Level
                </button>
                <button
                  onClick={() => createRoom(useCustomWord ? word : undefined)}
                  disabled={useCustomWord && !word.trim()}
                  className="flex-1 group relative bg-linear-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-pink-500/50 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
                  <span className="relative">Create Room 🎯</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes blob {
            0%,
            100% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </main>
    );
  }

  if (stage === "join") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-pink-900 to-slate-900 text-white relative overflow-hidden px-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 bg-slate-800/80 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-700/50 space-y-6 w-full max-w-md">
          <BackButton onClick={() => setStage("menu")} />

          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400">
              Join Room
            </h2>
            <p className="text-slate-400 text-sm">Enter the room code</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Room Code
              </label>
              <input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter code..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 text-white placeholder-slate-500 transition-all outline-none uppercase tracking-widest text-center text-lg sm:text-xl font-bold"
              />
            </div>

            <button
              onClick={joinRoom}
              className="group relative w-full bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
              <span className="relative">Join Game 🚀</span>
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%,
            100% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </main>
    );
  }

  // Game stage: responsive layout — stacked on mobile, side-by-side on desktop
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900 via-pink-900 to-slate-900 text-white flex items-start justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Subtle background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-4 sm:gap-6 w-full max-w-7xl">
        {/* Drawing area - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block lg:w-2/5 bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-700/50 h-[85vh]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-slate-300 flex items-center gap-2">
              🎨 Drawing Board
            </h3>
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="h-[calc(100%-3rem)] bg-slate-900/50 rounded-xl border border-slate-700/50">
            <DrawingBoard socket={socket} roomId={roomId} />
          </div>
        </div>

        {/* Hangman UI - full width on mobile, 3/5 width on desktop */}
        <div className="w-full lg:w-3/5 bg-slate-800/60 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-2xl border border-slate-700/50 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between gap-2">
            <BackButton
              onClick={() => {
                setStage("menu");
                setWord("");
                setActualWord("");
                setGuessed([]);
                setWrong(0);
                setRoomId("");
                setLevel(null);
              }}
            />

            <div className="flex items-center gap-2 bg-slate-900/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-700/50">
              <span className="text-xs text-slate-400">Room:</span>
              <span className="text-xs sm:text-sm font-bold text-pink-400 tracking-wider">
                {roomId}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-700/50">
              <span className="text-xs text-slate-400">Level:</span>
              <span className="text-xs sm:text-sm font-bold text-purple-400 capitalize">
                {level || "—"}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/30 p-4 sm:p-6 rounded-xl border border-slate-700/30">
            <HangmanDrawing wrongGuesses={wrong} />
          </div>

          <div className="bg-slate-900/30 p-4 sm:p-6 rounded-xl border border-slate-700/30">
            <WordDisplay word={word} guessedLetters={guessed} />
          </div>

          {isWinner && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 sm:p-6 text-center animate-bounce">
              <p className="text-green-400 text-xl sm:text-2xl font-bold">
                🎉 Victory!
              </p>
              <p className="text-green-300/80 text-xs sm:text-sm mt-2">
                You guessed the word!
              </p>
              {actualWord && (
                <p className="text-green-300 text-lg sm:text-xl font-bold mt-3 uppercase tracking-widest">
                  Answer: {actualWord}
                </p>
              )}
            </div>
          )}

          {isLoser && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 sm:p-6 text-center">
              <p className="text-red-400 text-xl sm:text-2xl font-bold">
                💀 Game Over
              </p>
              <p className="text-red-300/80 text-xs sm:text-sm mt-2">
                Better luck next time!
              </p>
              {actualWord && (
                <p className="text-red-300 text-lg sm:text-xl font-bold mt-3 uppercase tracking-widest">
                  Answer: {actualWord}
                </p>
              )}
            </div>
          )}

          {!isWinner && !isLoser && (
            <div className="bg-slate-900/30 p-3 sm:p-6 rounded-xl border border-slate-700/30">
              <Keyboard guessedLetters={guessed} onGuess={guess} />
            </div>
          )}

          {/* Lives indicator */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400">Lives:</span>
            {[...Array(MAX_WRONG)].map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                  i < wrong ? "bg-red-500" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </main>
  );
}
