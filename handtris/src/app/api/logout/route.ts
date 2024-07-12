import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const host = request.headers.get("host");
  const domain = host?.split(":")[0]; // 포트 번호 제거

  const cookieOptions = {
    name: "accessToken",
    value: "",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
  };

  cookieStore.set({
    ...cookieOptions,
    expires: new Date(0),
  });

  cookieStore.set({
    ...cookieOptions,
    maxAge: 0,
  });

  const response = NextResponse.json({ message: "로그아웃 성공" });

  const cookieString = `accessToken=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict${domain ? `; Domain=${domain}` : ""}`;
  response.headers.append("Set-Cookie", cookieString);

  return response;
}
