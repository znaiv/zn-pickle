import { NextResponse } from "next/server";
import { startAllMatches } from "@/lib/session/manager";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const staged = await startAllMatches(id);
  return NextResponse.json({ staged: staged.length, matchIds: staged });
}
