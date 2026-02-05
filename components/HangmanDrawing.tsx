"use client";

type Props = {
  wrongGuesses: number;
};

export default function HangmanDrawing({ wrongGuesses }: Props) {
  const partClass = "transition-all duration-300 ease-out animate-fadeIn";

  return (
    <div className="flex justify-center">
      <svg
        height="200"
        width="150"
        className="stroke-white fill-transparent stroke-2"
      >
        {/* Gallows */}
        <line x1="10" y1="190" x2="140" y2="190" />
        <line x1="40" y1="190" x2="40" y2="20" />
        <line x1="40" y1="20" x2="100" y2="20" />
        <line x1="100" y1="20" x2="100" y2="40" />

        {wrongGuesses > 0 && (
          <circle cx="100" cy="55" r="15" className={partClass} />
        )}
        {wrongGuesses > 1 && (
          <line x1="100" y1="70" x2="100" y2="120" className={partClass} />
        )}
        {wrongGuesses > 2 && (
          <line x1="100" y1="85" x2="80" y2="100" className={partClass} />
        )}
        {wrongGuesses > 3 && (
          <line x1="100" y1="85" x2="120" y2="100" className={partClass} />
        )}
        {wrongGuesses > 4 && (
          <line x1="100" y1="120" x2="85" y2="150" className={partClass} />
        )}
        {wrongGuesses > 5 && (
          <line x1="100" y1="120" x2="115" y2="150" className={partClass} />
        )}
      </svg>
    </div>
  );
}
