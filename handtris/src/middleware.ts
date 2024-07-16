// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/lobby", "/main", "/play/tetris", "/oauth2"];
const PUBLIC_ROUTES = ["/", "/register, '/login"];

async function validateToken(accessToken: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/games`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.ok;
  } catch (error) {
    console.error("API call error:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get("accessToken")?.value;

  if (accessToken) {
    const isValidToken = await validateToken(accessToken);

    if (isValidToken) {
      if (PUBLIC_ROUTES.includes(path)) {
        return NextResponse.redirect(new URL("/lobby", request.url));
      }
    } else {
      const response = NextResponse.redirect(
        new URL("/?auth=failed", request.url),
      );
      response.cookies.delete("accessToken");
      return response;
    }
  }

  const isProtectedRoute = PROTECTED_ROUTES.some(
    route => path === route || path.startsWith(`${route}/`),
  );

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/?auth=failed", request.url));
  }

  if (path === "/login" && accessToken) {
    return NextResponse.redirect(new URL("/lobby", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/",
    "/register",
    "/lobby",
    "/main",
    "/play/tetris",
    "/oauth2/:path*",
    "/login",
  ],
};
