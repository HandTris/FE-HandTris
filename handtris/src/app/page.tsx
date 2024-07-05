"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const handleSelect = (option: string, path: string) => {
    setSelected(option);
    setTimeout(() => {
      router.push(path);
    }, 1000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex w-full max-w-2xl flex-col space-y-4 rounded-xl border border-white border-opacity-20 bg-white bg-opacity-10 p-8 shadow-2xl backdrop-blur-lg backdrop-filter">
        {/* <Games /> */}
        <AnimatePresence>
          {selected === null && (
            <>
              <motion.div
                className="w-full"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 1000 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <button
                  className="w-full transform rounded-lg border border-pink-500 border-opacity-40 bg-white bg-opacity-30 px-8 py-4 font-bold text-pink-500 shadow-lg backdrop-blur-sm backdrop-filter transition hover:scale-105"
                  onClick={() => handleSelect("lobby", "/lobby")}
                >
                  <div className="flex items-center justify-between">
                    <Image
                      src="/image/start.png"
                      alt="option"
                      width={150}
                      height={150}
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-left">GAME PLAY</span>
                      <p className="text-sm">
                        Play online with friends and foes
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
              <motion.div
                className="w-full"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 1000 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <button
                  className="w-full transform rounded-lg border border-green-500 border-opacity-40 bg-white bg-opacity-30 px-8 py-4 font-bold text-green-500 shadow-lg backdrop-blur-sm backdrop-filter transition hover:scale-105"
                  onClick={() => handleSelect("config", "/config")}
                >
                  <div className="flex items-center justify-between">
                    <Image
                      src="/image/config.png"
                      alt="option"
                      width={150}
                      height={150}
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-left">CONFIG</span>
                      <p className="text-sm">Tweak your settings</p>
                    </div>
                  </div>
                </button>
              </motion.div>
              <motion.div
                className="w-full"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 1000 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button
                  className="w-full transform rounded-lg border border-blue-500 border-opacity-40 bg-white bg-opacity-30 px-8 py-4 font-bold text-blue-500 shadow-lg backdrop-blur-sm backdrop-filter transition hover:scale-105"
                  onClick={() => handleSelect("about", "/play/tetris")}
                >
                  <div className="flex items-center justify-between">
                    <Image
                      src="/image/tools.png"
                      alt="option"
                      width={150}
                      height={150}
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-left">ABOUT</span>
                      <p className="text-sm">Learn more about us</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
