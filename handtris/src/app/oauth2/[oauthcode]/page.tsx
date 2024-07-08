"use client";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function OauthPage({ searchParams }: { searchParams: { access?: string } }) {
  const accessToken = searchParams.access;
  const router = useRouter();

  useEffect(() => {
    if (accessToken) {
      (async () => {
        Cookies.set("accessToken", accessToken, {
          path: "/",
          sameSite: "strict",
        });
        router.push("/");
      })();
    }
  }, [accessToken, router]);

  return null;
}

export default OauthPage;
