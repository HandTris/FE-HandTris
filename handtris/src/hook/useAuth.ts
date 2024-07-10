import { useState, useEffect } from "react";
import Cookies from "js-cookie";

function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  return { isLoggedIn, setIsLoggedIn };
}

export default useAuth;
