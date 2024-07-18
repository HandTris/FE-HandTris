"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import {
  themeMusic,
  backgroundMusic,
  playSoundEffect as originalPlaySoundEffect,
  menuHoverSound as originalMenuHoverSound,
  menuClickSound as originalMenuClickSound,
} from "@/hook/howl";
import { Howler } from "howler";

type MusicContextType = {
  isMusicPlaying: boolean;
  toggleMusic: () => void;
  setThemeVolume: (volume: number) => void;
  setBackgroundVolume: (volume: number) => void;
  setEffectsVolume: (volume: number) => void;
  themeVolume: number;
  backgroundVolume: number;
  effectsVolume: number;
  playSoundEffect: (soundUrl: string) => void;
  menuHoverSound: () => void;
  menuClickSound: () => void;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [themeVolume, setThemeVolume] = useState(0.4);
  const [backgroundVolume, setBackgroundVolume] = useState(0.5);
  const [effectsVolume, setEffectsVolume] = useState(0.3);

  useEffect(() => {
    themeMusic.play();
    setIsMusicPlaying(true);
  }, []);

  useEffect(() => {
    themeMusic.volume(themeVolume);
  }, [themeVolume]);

  useEffect(() => {
    backgroundMusic.volume(backgroundVolume);
  }, [backgroundVolume]);

  useEffect(() => {
    Howler.volume(effectsVolume);
  }, [effectsVolume]);

  const toggleMusic = () => {
    if (isMusicPlaying) {
      themeMusic.stop();
      backgroundMusic.play();
      setIsMusicPlaying(false);
    } else {
      backgroundMusic.stop();
      themeMusic.play();
      setIsMusicPlaying(true);
    }
  };

  const adjustedPlaySoundEffect = (soundUrl: string) => {
    originalPlaySoundEffect(soundUrl);
  };

  const adjustedMenuHoverSound = () => {
    originalMenuHoverSound();
  };

  const adjustedMenuClickSound = () => {
    originalMenuClickSound();
  };

  return (
    <MusicContext.Provider
      value={{
        isMusicPlaying,
        toggleMusic,
        setThemeVolume,
        setBackgroundVolume,
        setEffectsVolume,
        themeVolume,
        backgroundVolume,
        effectsVolume,
        playSoundEffect: adjustedPlaySoundEffect,
        menuHoverSound: adjustedMenuHoverSound,
        menuClickSound: adjustedMenuClickSound,
      }}
    >
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
