import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";
import { authRoutes, protectedRoutes } from "./config/routes";
import { api } from "./lib/api";

/**
 * Logs messages to the console in development mode.
 *
 * @param {string} message - The log message.
 * @param {...any} args - Additional arguments.
 */
function log(message: string, ...args: any[]) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] ${message}`, ...args);
  }
}

/**
 * Checks if a JWT token is expired.
 *
 * @param {string} token - The JWT token.
 * @returns {boolean} - Returns true if the token is expired, false otherwise.
 */
function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeJwt(token);
    return exp ? Date.now() >= exp * 1000 : true;
  } catch {
    return true;
  }
}

/**
 * Middleware function to handle authentication and authorization for incoming requests.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object to be sent back to the client.
 *
 * This middleware performs the following tasks:
 * - Skips middleware for static files and API routes.
 * - Handles token refresh if the token is expired.
 * - Redirects to login page if no token is present for protected routes.
 * - Redirects to dashboard if a valid token is present for auth routes.
 * - Redirects to login page if no token is present at the root path.
 */
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

  /**
   * Handles token refresh when the token is expired.
   *
   * @returns {Promise<NextResponse>} - The response object with updated token or redirection.
   */
  async function handleTokenRefresh(): Promise<NextResponse> {
    try {
      const refreshResponse = await api.post(`/auth/refresh`, {});

      if (refreshResponse.success) {
        const response = NextResponse.redirect(request.nextUrl);

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
  }

  return NextResponse.next();
}

// Middleware matcher configuration
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
