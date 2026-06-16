import { NextResponse } from "next/server";
import { createAdminCookieValue, getAdminCookieName } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return NextResponse.json({ error: "Admin is not configured" }, { status: 500 });
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (username !== expectedUser || password !== expectedPass) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({
    name: getAdminCookieName(),
    value: createAdminCookieValue({ username }),
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  return res;
}

