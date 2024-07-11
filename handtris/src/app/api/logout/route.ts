import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().set({
    name: "accessToken",
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return NextResponse.json({ message: "로그아웃 성공" });
}
