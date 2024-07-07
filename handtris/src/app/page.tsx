"use client";

import React, { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import SplashScreen from "@/components/SplashScreen";
import { useMusic } from "@/components/MusicProvider";

const LoginPage = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isMusicPlaying, toggleMusic } = useMusic();

  useEffect(() => {
    const hasSeenSplash = localStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    localStorage.setItem("hasSeenSplash", "true");
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <button
        onClick={toggleMusic}
        className="absolute top-4 right-4 bg-white bg-opacity-20 p-2 rounded-full"
      >
        {isMusicPlaying ? "🔇" : "🔊"}
      </button>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
