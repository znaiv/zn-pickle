import type { Match, Player } from "@/db/schema";
import { gamesPlayed } from "@/lib/session/game-type";

export type QueuedPlayer = Pick<
  Player,
  "id" | "name" | "wins" | "losses" | "queuePosition"
>;

export interface TeamAssignment {
  selected: QueuedPlayer[];
  team1: QueuedPlayer[];
  team2: QueuedPlayer[];
  score: number;
  reasons: string[];
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

export class RotationHistory {
  private partnerCounts = new Map<string, number>();
  private opponentCounts = new Map<string, number>();

  constructor(completedMatches: Match[]) {
    for (const match of completedMatches) {
      const t1 = [match.team1Player1Id, match.team1Player2Id].filter(Boolean) as string[];
      const t2 = [match.team2Player1Id, match.team2Player2Id].filter(Boolean) as string[];

      if (t1.length === 2) {
        this.bump(this.partnerCounts, pairKey(t1[0], t1[1]));
      }
      if (t2.length === 2) {
        this.bump(this.partnerCounts, pairKey(t2[0], t2[1]));
      }

      for (const a of t1) {
        for (const b of t2) {
          this.bump(this.opponentCounts, pairKey(a, b));
        }
      }
    }
  }

  private bump(map: Map<string, number>, key: string) {
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  partnerCount(a: string, b: string): number {
    return this.partnerCounts.get(pairKey(a, b)) ?? 0;
  }

  opponentCount(a: string, b: string): number {
    return this.opponentCounts.get(pairKey(a, b)) ?? 0;
  }
}

const WEIGHTS = {
  repeatPartner: 120,
  repeatOpponent: 45,
  gamesPlayed: 8,
  queuePosition: 2,
  skipHighQueue: 35,
};

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];

  const [first, ...rest] = items;
  const withFirst = combinations(rest, size - 1).map((combo) => [first, ...combo]);
  const withoutFirst = combinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

function queueRank(player: QueuedPlayer): number {
  return player.queuePosition ?? 9999;
}

function scoreDoublesMatch(
  team1: [QueuedPlayer, QueuedPlayer],
  team2: [QueuedPlayer, QueuedPlayer],
  pool: QueuedPlayer[],
  history: RotationHistory
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const partnerRepeat = history.partnerCount(team1[0].id, team1[1].id);
  if (partnerRepeat > 0) {
    score += partnerRepeat * WEIGHTS.repeatPartner;
    reasons.push(`${team1[0].name} & ${team1[1].name} partnered before`);
  }

  const partnerRepeat2 = history.partnerCount(team2[0].id, team2[1].id);
  if (partnerRepeat2 > 0) {
    score += partnerRepeat2 * WEIGHTS.repeatPartner;
    reasons.push(`${team2[0].name} & ${team2[1].name} partnered before`);
  }

  for (const a of team1) {
    for (const b of team2) {
      const opp = history.opponentCount(a.id, b.id);
      if (opp > 0) {
        score += opp * WEIGHTS.repeatOpponent;
        reasons.push(`${a.name} vs ${b.name} again`);
      }
    }
  }

  const selected = [...team1, ...team2];
  score += selected.reduce((sum, p) => sum + gamesPlayed(p.wins, p.losses), 0) * WEIGHTS.gamesPlayed;
  score += selected.reduce((sum, p) => sum + queueRank(p), 0) * WEIGHTS.queuePosition;

  const selectedIds = new Set(selected.map((p) => p.id));
  for (const waiting of pool) {
    if (!selectedIds.has(waiting.id) && queueRank(waiting) <= 4) {
      score += WEIGHTS.skipHighQueue;
      reasons.push(`Skipped ${waiting.name} near front of queue`);
    }
  }

  return { score, reasons };
}

function scoreSinglesMatch(
  p1: QueuedPlayer,
  p2: QueuedPlayer,
  pool: QueuedPlayer[],
  history: RotationHistory
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const opp = history.opponentCount(p1.id, p2.id);
  if (opp > 0) {
    score += opp * WEIGHTS.repeatOpponent;
    reasons.push(`${p1.name} vs ${p2.name} again`);
  }

  score +=
    (gamesPlayed(p1.wins, p1.losses) + gamesPlayed(p2.wins, p2.losses)) * WEIGHTS.gamesPlayed;
  score += (queueRank(p1) + queueRank(p2)) * WEIGHTS.queuePosition;

  const selectedIds = new Set([p1.id, p2.id]);
  for (const waiting of pool) {
    if (!selectedIds.has(waiting.id) && queueRank(waiting) <= 2) {
      score += WEIGHTS.skipHighQueue;
      reasons.push(`Skipped ${waiting.name} near front of queue`);
    }
  }

  return { score, reasons };
}

function doublesSplits(players: QueuedPlayer[]): Array<[QueuedPlayer, QueuedPlayer, QueuedPlayer, QueuedPlayer]> {
  const [a, b, c, d] = players;
  return [
    [a, b, c, d],
    [a, c, b, d],
    [a, d, b, c],
  ];
}

export function findFairDoublesMatch(
  queued: QueuedPlayer[],
  history: RotationHistory
): TeamAssignment | null {
  if (queued.length < 4) return null;

  const poolSize = Math.min(queued.length, 8);
  const pool = queued.slice(0, poolSize);

  let best: TeamAssignment | null = null;

  const playerSets = pool.length === 4 ? [pool] : combinations(pool, 4);

  for (const four of playerSets) {
    for (const [t1a, t1b, t2a, t2b] of doublesSplits(four)) {
      const { score, reasons } = scoreDoublesMatch([t1a, t1b], [t2a, t2b], pool, history);
      const candidate: TeamAssignment = {
        selected: four,
        team1: [t1a, t1b],
        team2: [t2a, t2b],
        score,
        reasons,
      };

      if (!best || candidate.score < best.score) {
        best = candidate;
      } else if (candidate.score === best.score) {
        const candQueue = four.reduce((s, p) => s + queueRank(p), 0);
        const bestQueue = best.selected.reduce((s, p) => s + queueRank(p), 0);
        if (candQueue < bestQueue) best = candidate;
      }
    }
  }

  return best;
}

export function findFairSinglesMatch(
  queued: QueuedPlayer[],
  history: RotationHistory
): TeamAssignment | null {
  if (queued.length < 2) return null;

  const poolSize = Math.min(queued.length, 6);
  const pool = queued.slice(0, poolSize);

  let best: TeamAssignment | null = null;

  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const p1 = pool[i];
      const p2 = pool[j];
      const { score, reasons } = scoreSinglesMatch(p1, p2, pool, history);
      const candidate: TeamAssignment = {
        selected: [p1, p2],
        team1: [p1],
        team2: [p2],
        score,
        reasons,
      };

      if (!best || candidate.score < best.score) {
        best = candidate;
      } else if (candidate.score === best.score) {
        const candQueue = queueRank(p1) + queueRank(p2);
        const bestQueue =
          queueRank(best.team1[0]) + queueRank(best.team2[0]);
        if (candQueue < bestQueue) best = candidate;
      }
    }
  }

  return best;
}

export function findFifoDoublesMatch(queued: QueuedPlayer[]): TeamAssignment | null {
  if (queued.length < 4) return null;
  const four = queued.slice(0, 4);
  return {
    selected: four,
    team1: [four[0], four[1]],
    team2: [four[2], four[3]],
    score: 0,
    reasons: ["First four in queue"],
  };
}

export function findFifoSinglesMatch(queued: QueuedPlayer[]): TeamAssignment | null {
  if (queued.length < 2) return null;
  return {
    selected: queued.slice(0, 2),
    team1: [queued[0]],
    team2: [queued[1]],
    score: 0,
    reasons: ["First two in queue"],
  };
}

export function sortReturningPlayers(
  playerIds: string[],
  loserIds: string[],
  playersById: Map<string, Pick<Player, "id" | "wins" | "losses" | "queuePosition">>
): string[] {
  return [...playerIds].sort((a, b) => {
    const pa = playersById.get(a);
    const pb = playersById.get(b);
    const gpA = pa ? gamesPlayed(pa.wins, pa.losses) : 0;
    const gpB = pb ? gamesPlayed(pb.wins, pb.losses) : 0;
    if (gpA !== gpB) return gpA - gpB;

    const loserA = loserIds.includes(a);
    const loserB = loserIds.includes(b);
    if (loserA !== loserB) return loserA ? -1 : 1;

    return (pa?.queuePosition ?? 9999) - (pb?.queuePosition ?? 9999);
  });
}

export function matchingModeLabel(mode: string): string {
  return mode === "fifo" ? "Simple queue" : "Fair rotation";
}
