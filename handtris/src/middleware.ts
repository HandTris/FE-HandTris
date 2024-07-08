// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/lobby", "/main", "/play/tetris", "/oauth2"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 보호된 경로인지 확인
  const isProtectedRoute = PROTECTED_ROUTES.some(
    route => path === route || path.startsWith(`${route}/`),
  );

  // 보호된 경로가 아니면 다음 미들웨어나 페이지로 진행
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/games`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error("API call failed");
    }

    return NextResponse.next();
  } catch (error) {
    console.error("API call error:", error);
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  }
}

export const config = {
  matcher: ["/lobby", "/main", "/play/tetris", "/oauth2/:path*"],
};
