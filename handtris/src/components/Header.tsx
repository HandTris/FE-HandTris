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
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const checkToken = () => {
      const token = Cookies.get("accessToken");
      setIsLoggedIn(!!token);
    };

    checkToken();
  }, [pathname, setIsLoggedIn]);

  useEffect(() => {
    fetchMyStatus();
  }, [fetchMyStatus]);

  useEffect(() => {
    if (pathname === "/lobby" && searchParams.get("refresh") === "true") {
      fetchMyStatus();
      router.replace("/lobby");
    }
  }, [pathname, searchParams, fetchMyStatus, router]);

  //   const handleLogout = () => {
  //     Cookies.remove("accessToken");
  //     setIsLoggedIn(false);
  //     setIsDialogOpen(false);
  //     router.push("/login");
  //     toast({
  //       title: "로그아웃 성공",
  //       description: "로그아웃 되었습니다.",
  //       variant: "default",
  //     });
  //   };
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
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

  return (
    <header className="flex items-center justify-between bg-[#040F2D] p-4 border-t-0 border-2 border-gray-200 relative z-10">
      <Link
        href="/lobby"
        className="text-4xl font-bold text-green-400 hover:text-green-500 pixel"
      >
        HANDTRIS
      </Link>
      <div className="flex items-center space-x-4">
        {isLoggedIn && (
          <>
            <h1 className="text-white text-xl pixel">
              {myInfo?.nickname || `로그인이 만료되었습니다.`}
            </h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <Image
                    src={myInfo?.profileImageUrl || "/image/profile_1.jpeg"}
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
                    src={myInfo?.profileImageUrl || "/image/profile_1.jpeg"}
                    alt="profile"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                  <h2 className="text-2xl font-bold">
                    {myInfo?.nickname || "CHOCO"}
                  </h2>
                  <div className="w-full bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>전적:</span>
                      <span className="font-bold">
                        {myInfo?.win || 0}승 {myInfo?.lose || 0}패
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>승률:</span>
                      <span className="font-bold text-green-400">
                        {myInfo?.winRate || 0}%
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
