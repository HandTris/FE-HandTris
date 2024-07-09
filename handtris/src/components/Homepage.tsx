"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { handleHover, menuClickSound } from "@/hook/howl";

export default function HomePage() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement>(null);

  const handleSelect = (path: string) => {
    menuClickSound();
    setTimeout(() => {
      router.push(path);
    }, 1000);
  };

  return (
    <main
      tabIndex={-1}
      ref={mainRef}
      className="flex min-h-screen flex-col items-center justify-center p-8 bg-transparent focus:outline-none"
    >
      <Image
        src="/image/hand_tris_logo.png"
        alt="Game Splash"
        width={800}
        height={800}
      />
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          className="w-full transform rounded-lg border-2 border-pink-500 bg-pink-500 px-8 py-4 font-bold text-white shadow-lg transition hover:scale-105 hover:bg-pink-600 active:bg-pink-700"
          onClick={() => handleSelect("/lobby")}
          onMouseEnter={handleHover}
        >
          <div className="flex items-center justify-center">
            <Image
              src="/image/start.png"
              alt="Start Game"
              width={50}
              height={50}
            />
            <span className="ml-4 text-2xl">PLAY GAME</span>
          </div>
        </button>
      </motion.div>
    </main>
  );
}
