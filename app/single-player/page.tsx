import HangmanGame from "@/components/Hangman";

export default function SinglePlayerPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <HangmanGame />
    </main>
  );
}
