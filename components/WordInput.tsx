"use client";

import { useState } from "react";

type Props = {
  onSubmit: (word: string) => void;
};

export default function WordInput({ onSubmit }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    if (!value.trim()) return;
    onSubmit(value.toLowerCase());
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">Player 1: Enter a secret word</p>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="px-3 py-2 rounded text-black w-full"
        placeholder="Secret word..."
      />
      <button onClick={handleSubmit} className="btn w-full">
        Start Game
      </button>
    </div>
  );
}
