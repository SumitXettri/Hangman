"use client";

type Props = {
  onSelect: (mode: "single" | "multi") => void;
};

export default function ModeSelector({ onSelect }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">Choose Game Mode</p>
      <div className="flex gap-4 justify-center">
        <button onClick={() => onSelect("single")} className="btn">
          Single Player
        </button>
        <button onClick={() => onSelect("multi")} className="btn">
          Multiplayer
        </button>
      </div>
    </div>
  );
}
