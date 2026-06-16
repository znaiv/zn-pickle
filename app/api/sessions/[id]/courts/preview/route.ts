import { NextResponse } from "next/server";
import { previewUpNext } from "@/lib/session/manager";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const preview = await previewUpNext(id);

  if (!preview) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(preview);
}
