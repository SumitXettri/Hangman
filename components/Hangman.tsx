"use client";

import { useState } from "react";
import words from "@/data/words.json";
import Keyboard from "./Keyboard";
import WordDisplay from "./WordDisplay";
import LevelSelector from "./LevelSelector";
import HangmanDrawing from "./HangmanDrawing";
import ScoreBoard from "./ScoreBoard";
import ModeSelector from "./ModeSelector";
import WordInput from "./WordInput";
import BackButton from "./BackButton";

const MAX_WRONG = 6;
type Level = "easy" | "medium" | "hard";
type Mode = "single" | "multi";

const hintCountMap: Record<Level, number> = {
  easy: 3,
  medium: 2,
  hard: 1,
};

export default function HangmanGame() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);

  function resetRound() {
    setWord("");
    setGuessedLetters([]);
    setWrongGuesses(0);
    setScore(0);
  }

  function resetAll() {
    resetRound();
    setLevel(null);
    setMode(null);
  }

  function getHintLetters(word: string, count: number) {
    const unique = Array.from(new Set(word.split("")));
    return unique.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  function startSinglePlayer(selectedLevel: Level) {
    const wordList = words[selectedLevel];
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const hints = getHintLetters(randomWord, hintCountMap[selectedLevel]);

    setLevel(selectedLevel);
    setWord(randomWord.toLowerCase());
    setGuessedLetters(hints);
    setWrongGuesses(0);
    setScore(0);
  }

  function startMultiplayer(customWord: string) {
    setWord(customWord.toLowerCase());
    setGuessedLetters([]);
    setWrongGuesses(0);
    setScore(0);
  }

  const levelMultiplier = level === "easy" ? 1 : level === "medium" ? 1.5 : 2;

  function handleGuess(letter: string) {
    if (guessedLetters.includes(letter)) return;

    setGuessedLetters((prev) => [...prev, letter]);

    if (word.includes(letter)) {
      setScore((prev) => prev + Math.floor(10 * levelMultiplier));
    } else {
      setWrongGuesses((prev) => prev + 1);
      setScore((prev) => Math.max(0, prev - 5));
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
  }

  const isWinner =
    word && word.split("").every((l) => guessedLetters.includes(l));
  const isLoser = wrongGuesses >= MAX_WRONG;

  return (
    <div
      className={`bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md text-center space-y-6 ${
        shake ? "animate-shake" : ""
      }`}
    >
      <h1 className="text-3xl font-bold">🎯 Hangman</h1>
      <ScoreBoard score={score} />

      {!mode && <ModeSelector onSelect={setMode} />}

      {mode === "single" && !level && (
        <>
          <BackButton onClick={() => setMode(null)} />
          <LevelSelector onSelect={startSinglePlayer} />
        </>
      )}

      {mode === "multi" && !word && (
        <>
          <BackButton onClick={() => setMode(null)} />
          <WordInput onSubmit={startMultiplayer} />
        </>
      )}

      {word && (
        <>
          <BackButton onClick={resetAll} />

          <HangmanDrawing wrongGuesses={wrongGuesses} />
          <WordDisplay word={word} guessedLetters={guessedLetters} />

          <p>
            ❌ Wrong guesses: {wrongGuesses} / {MAX_WRONG}
          </p>

          {isWinner && <p className="text-green-400 text-lg">🎉 You Win!</p>}
          {isLoser && (
            <p className="text-red-400 text-lg">
              💀 You Lost! Word was: {word}
            </p>
          )}

          {!isWinner && !isLoser && (
            <Keyboard guessedLetters={guessedLetters} onGuess={handleGuess} />
          )}
        </>
      )}
    </div>
  );
}
