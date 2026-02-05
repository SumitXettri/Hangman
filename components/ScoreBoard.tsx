"use client";

type Props = {
  score: number;
};

export default function ScoreBoard({ score }: Props) {
  return (
    <div className="text-lg font-semibold text-indigo-400">
      ⭐ Score: {score}
    </div>
  );
}
