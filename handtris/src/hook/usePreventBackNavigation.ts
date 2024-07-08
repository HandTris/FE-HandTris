"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function usePreventBackNavigation() {
  const router = useRouter();

  useEffect(() => {
    const preventNavigation = (event: PopStateEvent) => {
      event.preventDefault();
      // 현재 URL로 다시 푸시하여 뒤로가기를 무효화합니다.
      history.pushState(null, "", window.location.href);
    };

    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventNavigation);

    return () => {
      window.removeEventListener("popstate", preventNavigation);
    };
  }, [router]);
}
