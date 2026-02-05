"use client";

import { useState } from "react";

type Props = {
  onSubmit: (word: string) => void;
};

export default function OnlineWordInput({ onSubmit }: Props) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-4">
      <p className="font-semibold">Set secret word</p>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-3 py-2 rounded text-black"
      />
      <button onClick={() => onSubmit(value)} className="btn w-full">
        Start Game
      </button>
    </div>
  );
}
