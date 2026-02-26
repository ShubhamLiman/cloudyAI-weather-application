import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/api/auth/login" || pathname === "/api/auth/logout") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/comments") && request.method === "GET") {
    return NextResponse.next();
  }

  const publicRoutes = [
    "/",
    "/api/auth/me",
    "/api/auth/login",
    "/api/auth/register",
    "/api/weather",
    "/api/weather/summary",
    "/login",
    "/register",
    "/weather",
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") && !token) {
    if (pathname.includes("/auth/")) {
      return NextResponse.next();
    }

    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
