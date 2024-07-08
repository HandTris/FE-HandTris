// usePreventBackNavigation.ts

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
  }, [pathname, searchParams]);
}
