import { NextResponse } from "next/server";
import { addPlayer } from "@/lib/session/manager";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as { name?: string };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Player name is required" }, { status: 400 });
  }

  const player = await addPlayer(id, body.name);
  return NextResponse.json(player, { status: 201 });
}
