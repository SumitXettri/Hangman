"use client";

import { useState } from "react";
import words from "@/data/words.json";
import Keyboard from "./Keyboard";
import LevelSelector from "./LevelSelector";
import WordDisplay from "./WordsDisplay";

const MAX_WRONG = 6;
type Level = "easy" | "medium" | "hard";

const hintCountMap: Record<Level, number> = {
  easy: 3,
  medium: 2,
  hard: 1,
};

export default function HangmanGame() {
  const [level, setLevel] = useState<Level | null>(null);
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);

  function getHintLetters(word: string, count: number) {
    const uniqueLetters = Array.from(new Set(word.split("")));
    const shuffled = uniqueLetters.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function startGame(selectedLevel: Level) {
    const wordList = words[selectedLevel];
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const hints = getHintLetters(randomWord, hintCountMap[selectedLevel]);

    setLevel(selectedLevel);
    setWord(randomWord.toLowerCase());
    setGuessedLetters(hints);
    setWrongGuesses(0);
  }

  function handleGuess(letter: string) {
    if (guessedLetters.includes(letter)) return;

    setGuessedLetters((prev) => [...prev, letter]);

    if (!word.includes(letter)) {
      setWrongGuesses((prev) => prev + 1);
    }
  }

  const isWinner =
    word && word.split("").every((l) => guessedLetters.includes(l));
  const isLoser = wrongGuesses >= MAX_WRONG;

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md text-center space-y-6">
      <h1 className="text-3xl font-bold">🎯 Hangman</h1>

      {!level && <LevelSelector onSelect={startGame} />}

      {level && (
        <>
          <p className="text-sm text-gray-300">Level: {level.toUpperCase()}</p>

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

          <button
            onClick={() => setLevel(null)}
            className="mt-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
          >
            Restart
          </button>
        </>
      )}
    </div>
  );
}
