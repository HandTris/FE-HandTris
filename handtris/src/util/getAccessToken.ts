import Cookies from "js-cookie";

export const getAccessToken = () => {
  return Cookies.get("accessToken");
};
