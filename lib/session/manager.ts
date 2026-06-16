import { randomUUID } from "crypto";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { courts, matches, players, sessions, type Court, type Match, type Player, type GameType, type MatchingMode } from "@/db/schema";
import { enqueueJob } from "@/lib/queue/enqueue";
import {
  formatTeamLine,
  gamesPlayed,
  isValidGameType,
  playersRequired,
} from "@/lib/session/game-type";
import {
  findFairDoublesMatch,
  findFairSinglesMatch,
  findFifoDoublesMatch,
  findFifoSinglesMatch,
  RotationHistory,
  sortReturningPlayers,
} from "@/lib/session/rotation";
import { createSlug } from "./utils";

function isValidMatchingMode(value: string): value is MatchingMode {
  return value === "fair" || value === "fifo";
}

type QueuedPlayerRow = {
  id: string;
  name: string;
  wins: number;
  losses: number;
  queuePosition: number | null;
};

function pickNextAssignment(
  session: { gameType: string; matchingMode: string },
  queued: QueuedPlayerRow[],
  history: RotationHistory
) {
  const needed = playersRequired(session.gameType);
  if (queued.length < needed) return null;

  const useFair = session.matchingMode !== "fifo";
  return session.gameType === "singles"
    ? useFair
      ? findFairSinglesMatch(queued, history)
      : findFifoSinglesMatch(queued)
    : useFair
      ? findFairDoublesMatch(queued, history)
      : findFifoDoublesMatch(queued);
}

function enrichPreviewPlayer(p: QueuedPlayerRow) {
  return {
    name: p.name,
    gamesPlayed: gamesPlayed(p.wins, p.losses),
  };
}

function matchPlayerIds(match: Match): string[] {
  return [
    match.team1Player1Id,
    match.team1Player2Id,
    match.team2Player1Id,
    match.team2Player2Id,
  ].filter(Boolean) as string[];
}

async function compactQueuePositions(sessionId: string) {
  const queued = await db
    .select()
    .from(players)
    .where(and(eq(players.sessionId, sessionId), eq(players.status, "queued")))
    .orderBy(asc(players.queuePosition), asc(players.createdAt));

  for (let i = 0; i < queued.length; i++) {
    const pos = i + 1;
    if (queued[i].queuePosition !== pos) {
      await db.update(players).set({ queuePosition: pos }).where(eq(players.id, queued[i].id));
    }
  }
}

export function evaluateMatchUndo(
  match: Match,
  courts: Court[],
  playersById: Map<string, Player>
): { ok: true } | { ok: false; reason: string } {
  if (match.status !== "completed" || !match.completedAt || !match.winningTeam) {
    return { ok: false, reason: "Match is not completed" };
  }

  if (!match.courtId) {
    return { ok: false, reason: "Match has no court assigned" };
  }

  const court = courts.find((c) => c.id === match.courtId);
  if (!court) {
    return { ok: false, reason: "Court not found" };
  }

  if (court.status !== "available") {
    return { ok: false, reason: "Court already has a new match" };
  }

  const playerIds = matchPlayerIds(match);
  for (const id of playerIds) {
    const player = playersById.get(id);
    if (!player) {
      return { ok: false, reason: "A player from this match is missing" };
    }
    if (player.status !== "queued") {
      return { ok: false, reason: "Players from this match are no longer in the queue" };
    }
  }

  return { ok: true };
}

function buildUndoableMatchSummary(
  match: Match,
  courts: Court[],
  playersById: Map<string, Player>,
  gameType: string
) {
  const evaluation = evaluateMatchUndo(match, courts, playersById);
  if (!evaluation.ok) return null;

  const court = courts.find((c) => c.id === match.courtId);
  if (!court) return null;

  const team1Ids = [match.team1Player1Id, match.team1Player2Id].filter(Boolean) as string[];
  const team2Ids = [match.team2Player1Id, match.team2Player2Id].filter(Boolean) as string[];
  const winnerIds = match.winningTeam === 1 ? team1Ids : team2Ids;
  const winnerNames = winnerIds.map((id) => playersById.get(id)?.name ?? "Unknown");

  const winnerLabel =
    gameType === "singles"
      ? winnerNames[0]
      : winnerNames.join(" & ");

  return {
    matchId: match.id,
    courtNumber: court.number,
    winningTeam: match.winningTeam as 1 | 2,
    winnerLabel,
  };
}

export async function previewUpNext(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) return null;

  const availableCourts = await db
    .select()
    .from(courts)
    .where(and(eq(courts.sessionId, sessionId), eq(courts.status, "available")))
    .orderBy(asc(courts.number));

  const queued = await db
    .select({
      id: players.id,
      name: players.name,
      wins: players.wins,
      losses: players.losses,
      queuePosition: players.queuePosition,
    })
    .from(players)
    .where(and(eq(players.sessionId, sessionId), eq(players.status, "queued")))
    .orderBy(asc(players.queuePosition));

  const completed = await db
    .select()
    .from(matches)
    .where(and(eq(matches.sessionId, sessionId), eq(matches.status, "completed")));

  const history = new RotationHistory(completed);
  let remainingQueue = [...queued];
  const previews: Array<{
    courtNumber: number;
    courtId: string;
    team1: ReturnType<typeof enrichPreviewPlayer>[];
    team2: ReturnType<typeof enrichPreviewPlayer>[];
  }> = [];

  for (const court of availableCourts) {
    const assignment = pickNextAssignment(session, remainingQueue, history);
    if (!assignment) break;

    previews.push({
      courtNumber: court.number,
      courtId: court.id,
      team1: assignment.team1.map(enrichPreviewPlayer),
      team2: assignment.team2.map(enrichPreviewPlayer),
    });

    const selectedIds = new Set(assignment.selected.map((p) => p.id));
    remainingQueue = remainingQueue.filter((p) => !selectedIds.has(p.id));
  }

  return {
    previews,
    playersRequired: playersRequired(session.gameType),
    availableCourtCount: availableCourts.length,
    queueLength: queued.length,
  };
}

export async function createSession(input: {
  name: string;
  courtCount: number;
  gameType?: GameType;
  matchingMode?: MatchingMode;
}) {
  const now = new Date().toISOString();
  const sessionId = randomUUID();
  const slug = createSlug(input.name);
  const gameType = input.gameType && isValidGameType(input.gameType) ? input.gameType : "doubles";
  const matchingMode =
    input.matchingMode && isValidMatchingMode(input.matchingMode) ? input.matchingMode : "fair";

  const [session] = await db
    .insert(sessions)
    .values({
      id: sessionId,
      name: input.name.trim(),
      slug,
      courtCount: input.courtCount,
      gameType,
      matchingMode,
      status: "active",
      createdAt: now,
      endedAt: null,
    })
    .returning();

  const courtRows = Array.from({ length: input.courtCount }, (_, i) => ({
    id: randomUUID(),
    sessionId,
    number: i + 1,
    status: "available" as const,
  }));

  await db.insert(courts).values(courtRows);

  return session;
}

export async function getSessionState(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) return null;

  const sessionPlayers = await db
    .select()
    .from(players)
    .where(eq(players.sessionId, sessionId))
    .orderBy(asc(players.queuePosition), asc(players.createdAt));

  const sessionCourts = await db
    .select()
    .from(courts)
    .where(eq(courts.sessionId, sessionId))
    .orderBy(asc(courts.number));

  const sessionMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.sessionId, sessionId))
    .orderBy(asc(matches.createdAt));

  const playerMap = Object.fromEntries(sessionPlayers.map((p) => [p.id, p]));
  const needed = playersRequired(session.gameType);

  const enrichPlayer = (p: (typeof sessionPlayers)[number]) => ({
    ...p,
    gamesPlayed: gamesPlayed(p.wins, p.losses),
  });

  const playersById = new Map(sessionPlayers.map((p) => [p.id, p]));
  const lastCompleted = [...sessionMatches]
    .filter((m) => m.status === "completed" && m.completedAt)
    .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))[0];

  const undoableMatch = lastCompleted
    ? buildUndoableMatchSummary(lastCompleted, sessionCourts, playersById, session.gameType)
    : null;

  return {
    session,
    players: sessionPlayers.map(enrichPlayer),
    courts: sessionCourts,
    matches: sessionMatches.map((m) => ({
      ...m,
      team1: [m.team1Player1Id, m.team1Player2Id]
        .filter(Boolean)
        .map((id) => ({
          name: playerMap[id!]?.name ?? "TBD",
          gamesPlayed: gamesPlayed(
            playerMap[id!]?.wins ?? 0,
            playerMap[id!]?.losses ?? 0
          ),
        })),
      team2: [m.team2Player1Id, m.team2Player2Id]
        .filter(Boolean)
        .map((id) => ({
          name: playerMap[id!]?.name ?? "TBD",
          gamesPlayed: gamesPlayed(
            playerMap[id!]?.wins ?? 0,
            playerMap[id!]?.losses ?? 0
          ),
        })),
    })),
    queue: sessionPlayers
      .filter((p) => p.status === "queued" && p.checkedIn)
      .map(enrichPlayer),
    liveUrl: `/live/${session.slug}`,
    playersRequired: needed,
    undoableMatch,
  };
}

export async function getSessionBySlug(slug: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.slug, slug))
    .limit(1);

  if (!session) return null;
  return getSessionState(session.id);
}

export async function addPlayer(sessionId: string, name: string) {
  const now = new Date().toISOString();
  const [player] = await db
    .insert(players)
    .values({
      id: randomUUID(),
      sessionId,
      name: name.trim(),
      checkedIn: false,
      status: "idle",
      createdAt: now,
    })
    .returning();

  return player;
}

export async function checkInPlayer(sessionId: string, playerId: string) {
  const maxPos = await db
    .select({ max: sql<number>`coalesce(max(${players.queuePosition}), 0)` })
    .from(players)
    .where(and(eq(players.sessionId, sessionId), eq(players.status, "queued")));

  const nextPosition = (maxPos[0]?.max ?? 0) + 1;

  const [player] = await db
    .update(players)
    .set({
      checkedIn: true,
      status: "queued",
      queuePosition: nextPosition,
    })
    .where(and(eq(players.id, playerId), eq(players.sessionId, sessionId)))
    .returning();

  if (player) {
    await enqueueJob("player.check_in", { sessionId, playerId });
  }

  return player;
}

export async function tryStageNextMatch(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session) return null;
  if (session.status !== "active") return null;

  const needed = playersRequired(session.gameType);

  const availableCourt = await db
    .select()
    .from(courts)
    .where(and(eq(courts.sessionId, sessionId), eq(courts.status, "available")))
    .orderBy(asc(courts.number))
    .limit(1);

  const court = availableCourt[0];
  if (!court) return null;

  const queued = await db
    .select()
    .from(players)
    .where(and(eq(players.sessionId, sessionId), eq(players.status, "queued")))
    .orderBy(asc(players.queuePosition));

  if (queued.length < needed) return null;

  const completed = await db
    .select()
    .from(matches)
    .where(and(eq(matches.sessionId, sessionId), eq(matches.status, "completed")));

  const history = new RotationHistory(completed);
  const assignment = pickNextAssignment(session, queued, history);
  if (!assignment) return null;

  const now = new Date().toISOString();
  const matchId = randomUUID();
  const [t1a, t1b] = assignment.team1;
  const [t2a, t2b] = assignment.team2;

  await db.insert(matches).values({
    id: matchId,
    sessionId,
    courtId: court.id,
    status: "in_progress",
    team1Player1Id: t1a.id,
    team1Player2Id: t1b?.id ?? null,
    team2Player1Id: t2a.id,
    team2Player2Id: t2b?.id ?? null,
    createdAt: now,
  });

  await db
    .update(courts)
    .set({ status: "occupied" })
    .where(eq(courts.id, court.id));

  await db
    .update(players)
    .set({ status: "playing", queuePosition: null })
    .where(inArray(players.id, assignment.selected.map((p) => p.id)));

  await enqueueJob("match.stage", {
    sessionId,
    matchId,
    courtId: court.id,
    gameType: session.gameType,
    matchingMode: session.matchingMode,
    pairingScore: assignment.score,
  });

  return matchId;
}

export async function completeMatch(
  sessionId: string,
  matchId: string,
  winningTeam: 1 | 2
) {
  const [match] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.sessionId, sessionId)))
    .limit(1);

  if (!match || match.status === "completed") return null;

  const playerIds = [
    match.team1Player1Id,
    match.team1Player2Id,
    match.team2Player1Id,
    match.team2Player2Id,
  ].filter(Boolean) as string[];

  const team1Ids = [match.team1Player1Id, match.team1Player2Id].filter(Boolean) as string[];
  const team2Ids = [match.team2Player1Id, match.team2Player2Id].filter(Boolean) as string[];
  const winnerIds = winningTeam === 1 ? team1Ids : team2Ids;
  const loserIds = winningTeam === 1 ? team2Ids : team1Ids;

  const now = new Date().toISOString();

  await db
    .update(matches)
    .set({ status: "completed", winningTeam, completedAt: now })
    .where(eq(matches.id, matchId));

  if (match.courtId) {
    await db.update(courts).set({ status: "available" }).where(eq(courts.id, match.courtId));
  }

  for (const id of winnerIds) {
    const [p] = await db.select().from(players).where(eq(players.id, id)).limit(1);
    if (p) {
      await db.update(players).set({ wins: p.wins + 1 }).where(eq(players.id, id));
    }
  }
  for (const id of loserIds) {
    const [p] = await db.select().from(players).where(eq(players.id, id)).limit(1);
    if (p) {
      await db.update(players).set({ losses: p.losses + 1 }).where(eq(players.id, id));
    }
  }

  const maxPos = await db
    .select({ max: sql<number>`coalesce(max(${players.queuePosition}), 0)` })
    .from(players)
    .where(and(eq(players.sessionId, sessionId), eq(players.status, "queued")));

  let pos = maxPos[0]?.max ?? 0;

  const updatedPlayers = await db
    .select()
    .from(players)
    .where(inArray(players.id, playerIds));

  const playersById = new Map(updatedPlayers.map((p) => [p.id, p]));

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const returnOrder =
    session?.matchingMode === "fair"
      ? sortReturningPlayers(playerIds, loserIds, playersById)
      : playerIds;

  for (const id of returnOrder) {
    pos += 1;
    await db
      .update(players)
      .set({ status: "queued", queuePosition: pos })
      .where(eq(players.id, id));
  }

  await enqueueJob("match.complete", { sessionId, matchId, winningTeam });

  return match;
}

export async function undoMatchCompletion(sessionId: string, matchId: string) {
  const [match] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.sessionId, sessionId)))
    .limit(1);

  if (!match) return { error: "Match not found" as const };

  const [lastCompleted] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.sessionId, sessionId), eq(matches.status, "completed")))
    .orderBy(desc(matches.completedAt))
    .limit(1);

  if (!lastCompleted || lastCompleted.id !== matchId) {
    return { error: "Only the most recently completed match can be undone" as const };
  }

  const sessionCourts = await db
    .select()
    .from(courts)
    .where(eq(courts.sessionId, sessionId));

  const sessionPlayers = await db
    .select()
    .from(players)
    .where(eq(players.sessionId, sessionId));

  const playersById = new Map(sessionPlayers.map((p) => [p.id, p]));
  const evaluation = evaluateMatchUndo(match, sessionCourts, playersById);
  if (!evaluation.ok) {
    return { error: evaluation.reason } as const;
  }

  const playerIds = matchPlayerIds(match);
  const team1Ids = [match.team1Player1Id, match.team1Player2Id].filter(Boolean) as string[];
  const team2Ids = [match.team2Player1Id, match.team2Player2Id].filter(Boolean) as string[];
  const winnerIds = match.winningTeam === 1 ? team1Ids : team2Ids;
  const loserIds = match.winningTeam === 1 ? team2Ids : team1Ids;

  for (const id of winnerIds) {
    const player = playersById.get(id);
    if (player) {
      await db
        .update(players)
        .set({ wins: Math.max(0, player.wins - 1) })
        .where(eq(players.id, id));
    }
  }

  for (const id of loserIds) {
    const player = playersById.get(id);
    if (player) {
      await db
        .update(players)
        .set({ losses: Math.max(0, player.losses - 1) })
        .where(eq(players.id, id));
    }
  }

  for (const id of playerIds) {
    await db
      .update(players)
      .set({ status: "playing", queuePosition: null })
      .where(eq(players.id, id));
  }

  await compactQueuePositions(sessionId);

  await db
    .update(matches)
    .set({ status: "in_progress", winningTeam: null, completedAt: null })
    .where(eq(matches.id, matchId));

  if (match.courtId) {
    await db.update(courts).set({ status: "occupied" }).where(eq(courts.id, match.courtId));
  }

  return { ok: true as const, matchId };
}

export async function startAllMatches(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!session || session.status !== "active") return [];

  const courtCount = (
    await db.select().from(courts).where(eq(courts.sessionId, sessionId))
  ).filter((c) => c.status === "available").length;

  const staged = [];
  for (let i = 0; i < courtCount; i++) {
    const id = await tryStageNextMatch(sessionId);
    if (!id) break;
    staged.push(id);
  }
  return staged;
}

export async function endSession(sessionId: string) {
  const activeMatches = await db
    .select()
    .from(matches)
    .where(and(eq(matches.sessionId, sessionId), eq(matches.status, "in_progress")));

  if (activeMatches.length > 0) {
    throw new Error("Cannot end session while matches are in progress");
  }

  const [session] = await db
    .update(sessions)
    .set({ status: "ended", endedAt: new Date().toISOString() })
    .where(eq(sessions.id, sessionId))
    .returning();

  return session ?? null;
}

export async function updateSessionGameType(sessionId: string, gameType: GameType) {
  if (!isValidGameType(gameType)) return null;

  const activeMatches = await db
    .select()
    .from(matches)
    .where(and(eq(matches.sessionId, sessionId), eq(matches.status, "in_progress")));

  if (activeMatches.length > 0) {
    throw new Error("Cannot change game type while matches are in progress");
  }

  const [session] = await db
    .update(sessions)
    .set({ gameType })
    .where(eq(sessions.id, sessionId))
    .returning();

  return session;
}

export async function updateSessionMatchingMode(sessionId: string, matchingMode: MatchingMode) {
  if (!isValidMatchingMode(matchingMode)) return null;

  const activeMatches = await db
    .select()
    .from(matches)
    .where(and(eq(matches.sessionId, sessionId), eq(matches.status, "in_progress")));

  if (activeMatches.length > 0) {
    throw new Error("Cannot change matching mode while matches are in progress");
  }

  const [session] = await db
    .update(sessions)
    .set({ matchingMode })
    .where(eq(sessions.id, sessionId))
    .returning();

  return session;
}

// Re-export for match display helpers used elsewhere
export { formatTeamLine };
