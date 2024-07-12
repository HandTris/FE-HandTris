import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const host = request.headers.get("host");
  const domain = host?.split(":")[0];

  cookieStore.delete("accessToken");

  const response = NextResponse.json({ message: "로그아웃 성공" });

  const cookieStrings = [
    `accessToken=; Max-Age=-1; Path=/; HttpOnly; Secure; SameSite=Strict${domain ? `; Domain=${domain}` : ""}`,
    `accessToken=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly; Secure; SameSite=Strict${domain ? `; Domain=${domain}` : ""}`,
    `accessToken=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict${domain ? `; Domain=${domain}` : ""}`,
  ];

  cookieStrings.forEach(cookieString => {
    response.headers.append("Set-Cookie", cookieString);
  });

  return response;
}
