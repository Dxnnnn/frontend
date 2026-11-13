import { NextResponse } from "next/server";
import type { LoginRequest } from "@/lib/types/auth";
import type { UserRole } from "@/lib/types/auth";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function POST(request: Request) {
  let body: LoginRequest;

  try {
    body = (await request.json()) as LoginRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const identifier = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    // Call the Express backend
    const backendRes = await fetch(`${BACKEND}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier, password }),
    });

    const data = await backendRes.json() as {
      success?: boolean;
      message?: string;
      token?: string;
      user?: {
        id: number;
        username: string;
        email: string;
        full_name: string;
        role: string;
        admin_role?: string;
      };
    };

    if (!backendRes.ok || !data.user) {
      return NextResponse.json(
        { error: data.message ?? "Invalid email or password." },
        { status: backendRes.status },
      );
    }

    // Keep all three roles as-is: "Super Admin", "Executive Office", "Data Center"
    const rawAdminRole = data.user.admin_role ?? "Super Admin";

    // For EO/DC accounts: fetch their permissions so they can be embedded in the session
    let permissionsMap: Record<string, boolean> = {};
    if (rawAdminRole !== "Super Admin" && data.token) {
      try {
        const permRes = await fetch(`${BACKEND}/api/admins/${data.user.id}/permissions`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.token}` },
        });
        if (permRes.ok) {
          const permData = await permRes.json() as { permissions?: Record<string, boolean> };
          permissionsMap = permData.permissions ?? {};
        }
      } catch { /* non-fatal */ }
    }

    const user = {
      id: String(data.user.id),
      username: data.user.email,
      name: data.user.full_name || data.user.username,
      email: data.user.email,
      role: (data.user.role ?? "admin") as UserRole,
      adminRole: rawAdminRole as import("@/lib/types/auth").AdminSubRole,
      permissions: permissionsMap,
    };

    // Admin cookies always persist for 30 days regardless of rememberMe
    const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days

    const response = NextResponse.json({ user });

    response.cookies.set("eval_session", JSON.stringify(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(sessionMaxAge ? { maxAge: sessionMaxAge } : {}),
    });

    // Store JWT for proxying to backend
    if (data.token) {
      response.cookies.set("eval_token", data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        ...(sessionMaxAge ? { maxAge: sessionMaxAge } : {}),
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend server." },
      { status: 500 },
    );
  }
}
