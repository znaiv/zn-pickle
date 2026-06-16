import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/admin/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set({
    name: getAdminCookieName(),
    value: "",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  return res;
}

