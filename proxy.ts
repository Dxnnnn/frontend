import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionUser {
  role: "admin" | "faculty" | "user";
  adminRole?: "Executive Office" | "Data Center" | "Super Admin";
}

/** Returns true for roles that use the /eo portal */
function isEOPortalRole(adminRole?: string): boolean {
  return adminRole === "Executive Office";
}

/** Returns true for roles that use the /dc portal */
function isDCPortalRole(adminRole?: string): boolean {
  return adminRole === "Data Center";
}

/** Returns true for roles that use the /admin portal (Super Admin only) */
function isSuperAdminRole(adminRole?: string): boolean {
  return adminRole === "Super Admin" || !adminRole;
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

  // ── Admin routes (/admin/*) — Super Admin only ────────────────
  if (pathname.startsWith("/admin")) {
    // Allow the login page through without a session
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login")) {
      // Already logged-in → send to their correct portal
      if (user?.role === "admin") {
        let dest = "/admin/settings";
        if (isEOPortalRole(user.adminRole)) dest = "/eo";
        else if (isDCPortalRole(user.adminRole)) dest = "/dc";
        return NextResponse.redirect(new URL(dest, request.url));
      }
      return NextResponse.next();
    }

    // Not authenticated → login
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // EO or Data Center trying to access /admin/* → redirect to their portal
    if (isEOPortalRole(user.adminRole)) {
      return NextResponse.redirect(new URL("/eo", request.url));
    }
    if (isDCPortalRole(user.adminRole)) {
      return NextResponse.redirect(new URL("/dc", request.url));
    }

    return NextResponse.next();
  }

  // ── EO portal routes (/eo/*) — Executive Office only ────────────
  if (pathname.startsWith("/eo")) {
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!isEOPortalRole(user.adminRole)) {
      const dest = isDCPortalRole(user.adminRole) ? "/dc" : "/admin/settings";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // ── DC portal routes (/dc/*) — Data Center only ───────────────
  if (pathname.startsWith("/dc")) {
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!isDCPortalRole(user.adminRole)) {
      const dest = isEOPortalRole(user.adminRole) ? "/eo" : "/admin/settings";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // ── Student portal routes ─────────────────────────────────────
  if (pathname.startsWith("/user")) {
    if (!user || user.role !== "user") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ── School Head / Faculty portal routes ───────────────────────
  if (pathname.startsWith("/faculty")) {
    if (!user || user.role !== "faculty") {
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
    "/eo/:path*",
    "/dc/:path*",
    "/user/:path*",
    "/faculty/:path*",
    "/login",
  ],
};
