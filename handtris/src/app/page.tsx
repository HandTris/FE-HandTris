"use client";

import React, { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import SplashScreen from "@/components/SplashScreen";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const [showSplash, setShowSplash] = useState(true);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const authStatus = searchParams.get("auth");
    if (authStatus === "failed") {
      toast({
        title: "인증 실패",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenSplash = localStorage.getItem("hasSeenSplash");
      if (hasSeenSplash) {
        setShowSplash(false);
      }
    }
  }, []);

  const handleSplashFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasSeenSplash", "true");
    }
    setShowSplash(false);
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
