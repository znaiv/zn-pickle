import { NextResponse } from "next/server";
import { completeMatch } from "@/lib/session/manager";
import { processAllPending } from "@/lib/queue/process";

type RouteContext = { params: Promise<{ id: string; matchId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id, matchId } = await context.params;
  const body = (await request.json()) as { winningTeam?: 1 | 2 };

  if (body.winningTeam !== 1 && body.winningTeam !== 2) {
    return NextResponse.json({ error: "winningTeam must be 1 or 2" }, { status: 400 });
  }

  const match = await completeMatch(id, matchId, body.winningTeam);

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  await processAllPending(5);
  return NextResponse.json({ ok: true });
}
