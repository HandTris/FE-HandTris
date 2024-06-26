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
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="flex flex-col w-full max-w-2xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 rounded-xl p-8 shadow-2xl space-y-4">
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
                  className="w-full bg-white bg-opacity-30 backdrop-filter backdrop-blur-sm border border-pink-500 border-opacity-40 text-pink-500 font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105"
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
                  className="w-full bg-white bg-opacity-30 backdrop-filter backdrop-blur-sm border border-green-500 border-opacity-40 text-green-500 font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105"
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
                  className="w-full bg-white bg-opacity-30 backdrop-filter backdrop-blur-sm border border-blue-500 border-opacity-40 text-blue-500 font-bold py-4 px-8 rounded-lg shadow-lg transform transition hover:scale-105"
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
