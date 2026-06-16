import { NextResponse } from "next/server";
import { getSessionState, updateSessionGameType, updateSessionMatchingMode } from "@/lib/session/manager";
import { isValidGameType } from "@/lib/session/game-type";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const state = await getSessionState(id);

  if (!state) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(state);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as { gameType?: string; matchingMode?: string };

  if (!body.gameType && !body.matchingMode) {
    return NextResponse.json({ error: "Provide gameType or matchingMode" }, { status: 400 });
  }

  try {
    if (body.gameType) {
      if (!isValidGameType(body.gameType)) {
        return NextResponse.json({ error: "gameType must be singles or doubles" }, { status: 400 });
      }
      const session = await updateSessionGameType(id, body.gameType);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    }

    if (body.matchingMode) {
      if (body.matchingMode !== "fair" && body.matchingMode !== "fifo") {
        return NextResponse.json({ error: "matchingMode must be fair or fifo" }, { status: 400 });
      }
      const session = await updateSessionMatchingMode(id, body.matchingMode);
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    }

    const state = await getSessionState(id);
    return NextResponse.json(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
