import { NextResponse } from "next/server";
import { createSession } from "@/lib/session/manager";
import { isValidGameType } from "@/lib/session/game-type";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    courtCount?: number;
    gameType?: string;
    matchingMode?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Session name is required" }, { status: 400 });
  }

  if (body.gameType && !isValidGameType(body.gameType)) {
    return NextResponse.json({ error: "gameType must be singles or doubles" }, { status: 400 });
  }

  if (body.matchingMode && body.matchingMode !== "fair" && body.matchingMode !== "fifo") {
    return NextResponse.json({ error: "matchingMode must be fair or fifo" }, { status: 400 });
  }

  const courtCount = Math.min(Math.max(body.courtCount ?? 1, 1), 12);

  const session = await createSession({
    name: body.name,
    courtCount,
    gameType: body.gameType === "singles" ? "singles" : "doubles",
    matchingMode: body.matchingMode === "fifo" ? "fifo" : "fair",
  });

  return NextResponse.json(session, { status: 201 });
}
