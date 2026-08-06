import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/types/auth";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function POST(request: Request) {
  let body: { id_number?: string; password?: string };

  try {
    body = (await request.json()) as { id_number?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id_number = body.id_number?.trim() ?? "";
  const password = body.password ?? "";

  if (!id_number || !password) {
    return NextResponse.json(
      { error: "ID number and password are required." },
      { status: 400 },
    );
  }

  try {
    const backendRes = await fetch(`${BACKEND}/api/school-heads/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_number, password }),
    });

    const data = (await backendRes.json()) as {
      success?: boolean;
      message?: string;
      token?: string;
      user?: {
        id: number;
        username: string;
        full_name: string;
        department: string;
        role: string;
      };
    };

    if (!backendRes.ok || !data.user) {
      return NextResponse.json(
        { error: data.message ?? "Invalid ID number or password." },
        { status: backendRes.status },
      );
    }

    const user = {
      id: String(data.user.id),
      username: data.user.username,
      name: data.user.full_name,
      role: (data.user.role ?? "faculty") as UserRole,
      department: data.user.department,
    };

    const response = NextResponse.json({ user });

    response.cookies.set("eval_session", JSON.stringify(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    // Store JWT for proxying to backend
    if (data.token) {
      response.cookies.set("eval_token", data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend server. Make sure it is running on port 5000." },
      { status: 500 },
    );
  }
}
