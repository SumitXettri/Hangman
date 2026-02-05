"use client";

type Props = {
  onSelect: (level: "easy" | "medium" | "hard") => void;
};

export default function LevelSelector({ onSelect }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-lg">Choose Difficulty</p>
      <div className="flex gap-4 justify-center">
        <button onClick={() => onSelect("easy")} className="btn">
          Easy
        </button>
        <button onClick={() => onSelect("medium")} className="btn">
          Medium
        </button>
        <button onClick={() => onSelect("hard")} className="btn">
          Hard
        </button>
      </div>
    </div>
  );
}
