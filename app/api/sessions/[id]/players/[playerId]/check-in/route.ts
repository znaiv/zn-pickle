import { NextResponse } from "next/server";
import { checkInPlayer } from "@/lib/session/manager";
import { processAllPending } from "@/lib/queue/process";

type RouteContext = { params: Promise<{ id: string; playerId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id, playerId } = await context.params;
  const player = await checkInPlayer(id, playerId);

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  await processAllPending(5);
  return NextResponse.json(player);
}
