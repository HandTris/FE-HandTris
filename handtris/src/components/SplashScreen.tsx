"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      const fadeOutTimer = setTimeout(() => {
        onFinish();
      }, 500);

      return () => clearTimeout(fadeOutTimer);
    }
  }, [isVisible, onFinish]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Image
        src="/image/hand_tris_logo.png"
        alt="Game Splash"
        width={800}
        height={800}
      />
    </div>
  );
}
