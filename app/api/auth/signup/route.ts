import { NextResponse } from "next/server";

import type { SignupRequest } from "@/lib/types/auth";

export async function POST(request: Request) {
  let body: SignupRequest;

  try {
    body = (await request.json()) as SignupRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? "";
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!name || !username || !password) {
    return NextResponse.json(
      { error: "Name, username, and password are required." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      error:
        "Student accounts are managed by the administrator in the Accounts page.",
    },
    { status: 403 },
  );
}
