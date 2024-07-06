"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { themeMusic } from "@/hook/howl";

type MusicContextType = {
  isMusicPlaying: boolean;
  toggleMusic: () => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    themeMusic.play();
    setIsMusicPlaying(true);
    return () => {
      themeMusic.stop();
    };
  }, []);

  const toggleMusic = () => {
    if (isMusicPlaying) {
      themeMusic.pause();
    } else {
      themeMusic.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <MusicContext.Provider value={{ isMusicPlaying, toggleMusic }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
