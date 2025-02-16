import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { authRoutes, protectedRoutes } from "./config/routes";

// Environment variables
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function log(message: string, ...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] ${message}`, ...args);
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeJwt(token);
    return exp ? Date.now() >= exp * 1000 : true;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;
  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  async function handleTokenRefresh(): Promise<NextResponse> {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const newToken = data.token;

        const response = NextResponse.redirect(request.nextUrl);
        response.cookies.set("token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });

        log("Token refreshed successfully");
        return response;
      }

      // Refresh failed - clear tokens and redirect
      const loginResponse = NextResponse.redirect(
        new URL("/login", request.url)
      );
      loginResponse.cookies.delete("token");
      return loginResponse;
    } catch (error) {
      log("Refresh error:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // Handle protected routes
  if (isProtectedRoute) {
    if (!token) {
      log("Redirecting to login - no token");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isTokenExpired(token)) {
      log("Token expired, attempting refresh");
      return handleTokenRefresh();
    }

    return NextResponse.next();
  }

  // Handle auth routes
  if (isAuthRoute) {
    if (token && !isTokenExpired(token)) {
      log("Redirecting to dashboard - valid token");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === "/") {
    if (token) {
      if (isTokenExpired(token)) {
        log("Token expired at root, attempting refresh");
        return handleTokenRefresh();
      }
      log("Auto sign-in: Redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    log("No token: Redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
