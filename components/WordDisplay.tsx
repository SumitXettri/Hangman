type Props = {
  word: string;
  guessedLetters: string[];
};

export default function WordDisplay({ word, guessedLetters }: Props) {
  return (
    <div className="flex gap-3 justify-center text-2xl font-bold tracking-widest">
      {word.split("").map((letter, i) => (
        <span key={i} className="border-b-2 border-white w-6 text-center">
          {guessedLetters.includes(letter) ? letter.toUpperCase() : "_"}
        </span>
      ))}
    </div>
  );
}
