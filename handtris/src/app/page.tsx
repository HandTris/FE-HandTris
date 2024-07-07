"use client";

import React, { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import SplashScreen from "@/components/SplashScreen";

const LoginPage = () => {
  const [showSplash, setShowSplash] = useState(true);

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
      <LoginForm />
    </div>
  );
};

export default LoginPage;
