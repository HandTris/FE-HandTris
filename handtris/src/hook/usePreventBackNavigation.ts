"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function usePreventBackNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const preventBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []); // 의존성 배열을 비워 마운트 시에만 실행
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
  }, [pathname, searchParams]);

  return null;
}
