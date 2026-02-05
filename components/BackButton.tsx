"use client";

type Props = {
  onClick: () => void;
};

export default function BackButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-indigo-400 hover:underline self-start"
    >
      ← Back
    </button>
  );
}
