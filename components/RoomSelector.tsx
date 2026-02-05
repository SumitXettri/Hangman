"use client";

import { useState } from "react";

type Props = {
  onCreate: (roomId: string) => void;
  onJoin: (roomId: string) => void;
};

export default function RoomSelector({ onCreate, onJoin }: Props) {
  const [roomId, setRoomId] = useState("");

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">Online Multiplayer</p>

      <button
        onClick={() => onCreate(Math.random().toString(36).slice(2, 7))}
        className="btn w-full"
      >
        Create Room
      </button>

      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room Code"
        className="w-full px-3 py-2 rounded text-black"
      />

      <button onClick={() => onJoin(roomId)} className="btn w-full">
        Join Room
      </button>
    </div>
  );
}
