"use client";

type Props = {
  word: string;
  guessedLetters: string[];
};

export default function WordDisplay({ word, guessedLetters }: Props) {
  return (
    <div className="flex justify-center gap-2 text-2xl tracking-widest">
      {word.split("").map((letter, index) => (
        <span key={index} className="border-b-2 w-8 text-center">
          {guessedLetters.includes(letter) ? letter.toUpperCase() : "_"}
        </span>
      ))}
    </div>
  );
}
