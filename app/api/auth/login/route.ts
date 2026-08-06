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
      };
    };

    if (!backendRes.ok || !data.user) {
      return NextResponse.json(
        { error: data.message ?? "Invalid email or password." },
        { status: backendRes.status },
      );
    }

    const user = {
      id: String(data.user.id),
      username: data.user.email,
      name: data.user.full_name || data.user.username,
      role: (data.user.role ?? "admin") as UserRole,
    };

    const sessionMaxAge = body.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8;

    const response = NextResponse.json({ user });

    response.cookies.set("eval_session", JSON.stringify(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: sessionMaxAge,
    });

    // Store JWT for proxying to backend
    if (data.token) {
      response.cookies.set("eval_token", data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: sessionMaxAge,
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
