import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authRoutes, protectedRoutes } from "./config/routes";

// Add debug logging
function log(message: string, ...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] ${message}`, ...args);
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;
  // Define routes
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

  log("Route check:", {
    pathname,
    isAuthRoute,
    isProtectedRoute,
    hasToken: !!token,
  });

  // Handle authentication redirects
  if (!token && token === undefined && isProtectedRoute) {
    log("Redirecting to login - no token");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthRoute) {
    log("Redirecting to dashboard - already authenticated");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Auto sign-in logic for root ("/")
  if (pathname === "/") {
    if (token) {
      log("Auto sign-in: Redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      log("No token: Redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
