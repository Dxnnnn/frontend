import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/types/auth";

/** GET /api/auth/session — returns the current session user (reads httpOnly cookie server-side) */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("eval_session")?.value;
    if (!raw) return NextResponse.json({ user: null }, { status: 401 });
    const user = JSON.parse(raw) as AuthUser;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

export async function POST(request: Request) {
  let body: { user?: AuthUser };

  try {
    body = (await request.json()) as { user?: AuthUser };
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const user = body.user;

  if (!user?.id || !user.username || !user.name || !user.role) {
    return NextResponse.json(
      { error: "A valid user session is required." },
      { status: 400 },
    );
  }

  if (user.role === "admin") {
    return NextResponse.json(
      { error: "Admin sessions must use the login API." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ user });

  response.cookies.set("eval_session", JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
