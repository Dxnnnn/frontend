import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionUser {
  role: "admin" | "faculty" | "user";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const raw = request.cookies.get("eval_session")?.value;
  let user: SessionUser | null = null;

  if (raw) {
    try {
      user = JSON.parse(raw) as SessionUser;
    } catch {
      user = null;
    }
  }

  // ── Admin routes ──────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Allow the login page through without a session
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) {
      // If already logged in as admin, redirect to dashboard
      if (user?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // Protect all other /admin routes
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // ── Student portal routes ─────────────────────────────────────
  if (pathname.startsWith("/user")) {
    if (!user || user.role !== "user") {
      // Not logged in or wrong role — redirect to login page
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ── School Head / Faculty portal routes ───────────────────────
  if (pathname.startsWith("/faculty")) {
    if (!user || user.role !== "faculty") {
      // Not logged in or wrong role — redirect to login page
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Login page: redirect already-authenticated users ─────────
  if (pathname === "/login") {
    if (user?.role === "user") {
      return NextResponse.redirect(new URL("/user", request.url));
    }
    if (user?.role === "faculty") {
      return NextResponse.redirect(new URL("/faculty", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/faculty/:path*",
    "/login",
  ],
};
