import { NextResponse } from "next/server";
import { endSession, getSessionState } from "@/lib/session/manager";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const session = await endSession(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const state = await getSessionState(id);
    return NextResponse.json(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not end session";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

