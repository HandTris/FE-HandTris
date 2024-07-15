"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import useAuth from "@/hook/useAuth";
import LogoutDialog from "./LogoutDialog";
import { useToast } from "./ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { myStatus } from "@/services/gameService";
import { UserInfo } from "@/types";

function Header() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [myInfo, setMyInfo] = useState<UserInfo>();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const fetchMyStatus = useCallback(async () => {
    if (isLoggedIn) {
      try {
        const data = await myStatus();
        setMyInfo(data.data);
      } catch (error) {
        console.error("Failed to fetch user status:", error);
        handleLogout();
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const checkToken = () => {
      const token = Cookies.get("accessToken");
      const isTokenValid = !!token;
      setIsLoggedIn(isTokenValid);
      if (!isTokenValid && pathname === "/lobby") {
        router.push("/login");
      }
    };
    checkToken();
  }, [pathname, setIsLoggedIn, router]);

  useEffect(() => {
    fetchMyStatus();
  }, [fetchMyStatus]);

  useEffect(() => {
    if (pathname === "/lobby" && searchParams.get("refresh") === "true") {
      fetchMyStatus();
      router.replace("/lobby");
    }
  }, [pathname, searchParams, fetchMyStatus, router]);

  const handleLogout = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");
      const headers = new Headers();
      headers.set("Authorization", `Bearer ${accessToken}`);
      headers.set("Authorization-Refresh", `Bearer ${refreshToken}`);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signout`,
        {
          method: "POST",
          headers: headers,
        },
      );
      if (response.ok) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        setIsLoggedIn(false);
        setIsDialogOpen(false);
        router.push("/login");
        toast({
          title: "로그아웃 성공",
          description: "로그아웃 되었습니다.",
          variant: "default",
        });
      } else {
        throw new Error("로그아웃 실패");
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      router.push("/login");
    }
  };
  if (pathname === "/play/tetris") {
    return null;
  }
  return (
    <header className="flex items-center justify-between bg-[#040F2D] p-4 pl-8 border-t-0 border-4 border-gray-200 relative z-10">
      <Link
        href="/lobby"
        className="text-4xl font-bold text-green-400 hover:text-green-500 pixel"
        onClick={handleLogoClick}
      >
        HANDTRIS
      </Link>
      <div className="flex items-center space-x-4">
        {isLoggedIn && myInfo && (
          <>
            <h1 className="text-white text-xl pixel">{myInfo.nickname}</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <Image
                    src={myInfo.profileImageUrl || "/image/profile_1.jpeg"}
                    alt="profile"
                    width={50}
                    height={50}
                    className="rounded-full border-2 border-white cursor-pointer"
                  />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-96 bg-gray-800 text-white border-2 border-green-500 rounded-lg shadow-lg">
                <SheetHeader>
                  <SheetTitle className="text-white">프로필 정보</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col items-center space-y-4">
                  <Image
                    src={myInfo.profileImageUrl || "/image/profile_1.jpeg"}
                    alt="profile"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                  <h2 className="text-2xl font-bold">{myInfo.nickname}</h2>
                  <div className="w-full bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>전적:</span>
                      <span className="font-bold">
                        {myInfo.win}승 {myInfo.lose}패
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>승률:</span>
                      <span className="font-bold text-green-400">
                        {myInfo.winRate}%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="mt-6 w-full bg-red-500 text-white py-3 rounded-lg"
                >
                  로그아웃
                </button>
              </SheetContent>
            </Sheet>
            <LogoutDialog
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              onLogout={handleLogout}
            />
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
