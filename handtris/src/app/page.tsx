"use client";

import React, { useState, useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import SplashScreen from "@/components/SplashScreen";
import LoadingScreen from "@/components/LoadingScreen";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const authStatus = searchParams.get("auth");
    if (authStatus === "failed") {
      toast({
        title: "인증 실패",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
    }

    const hasSeenSplash = localStorage.getItem("hasSeenSplash");
    if (!hasSeenSplash) {
      setShowSplash(true);
    }

    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress === 100) {
          clearInterval(timer);
          setIsLoading(false);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, [isMounted, searchParams, toast]);

  const handleSplashFinish = () => {
    localStorage.setItem("hasSeenSplash", "true");
    setShowSplash(false);
  };

  if (!isMounted) {
    return null; // 또는 초기 로딩 상태를 표시
  }

  if (isLoading) {
    return <LoadingScreen progress={progress} />;
  }

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
