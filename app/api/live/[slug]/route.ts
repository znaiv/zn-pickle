import { NextResponse } from "next/server";
import { getSessionBySlug } from "@/lib/session/manager";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const state = await getSessionBySlug(slug);

  if (!state) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(state);
}
