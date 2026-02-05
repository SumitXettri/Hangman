import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold">🎯 Hangman</h1>

      <Link href="/single-player" className="btn w-48 text-center">
        Single Player
      </Link>

      <Link href="/multiplayer" className="btn w-48 text-center">
        Multiplayer
      </Link>
    </main>
  );
}
