"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title with enhanced styling */}
        <div className="text-center space-y-4">
          <div className="inline-block animate-bounce-slow">
            <span className="text-7xl">🎯</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-400 to-yellow-400 animate-gradient">
            Hangman
          </h1>
          <p className="text-gray-300 text-lg font-light tracking-wide">
            Guess the word, save the day!
          </p>
        </div>

        {/* Game mode cards */}
        <div className="flex flex-col gap-6 mt-8">
          <Link href="/single-player" className="group">
            <div className="relative w-72 h-32 bg-linear-to-r from-purple-600 to-purple-800 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>

              <div className="relative h-full flex items-center justify-between px-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">Single Player</span>
                  <span className="text-purple-200 text-sm">
                    Play solo mode
                  </span>
                </div>
                <svg
                  className="w-8 h-8 transform group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/multiplayer" className="group">
            <div className="relative w-72 h-32 bg-linear-to-r from-pink-600 to-pink-800 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-pink-500/50 overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>

              <div className="relative h-full flex items-center justify-between px-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">Multiplayer</span>
                  <span className="text-pink-200 text-sm">
                    Challenge a friend
                  </span>
                </div>
                <svg
                  className="w-8 h-8 transform group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-6 flex gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse animation-delay-400"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}</style>
    </main>
  );
}
