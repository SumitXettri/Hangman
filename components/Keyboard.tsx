"use client";

type Props = {
  guessedLetters: string[];
  onGuess: (letter: string) => void;
};

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

export default function Keyboard({ guessedLetters, onGuess }: Props) {
  return (
    <div className="grid grid-cols-7 gap-2 mt-4">
      {alphabet.map((letter) => (
        <button
          key={letter}
          onClick={() => onGuess(letter)}
          disabled={guessedLetters.includes(letter)}
          className={`px-2 py-1 rounded text-sm font-semibold transition
${
  guessedLetters.includes(letter)
    ? "bg-gray-600 cursor-not-allowed"
    : "bg-indigo-600 hover:bg-indigo-500"
}`}
        >
          {letter.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
