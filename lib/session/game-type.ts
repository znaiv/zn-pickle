import { gameTypes, type GameType } from "@/db/schema";

export function playersRequired(gameType: string): number {
  return gameType === "singles" ? 2 : 4;
}

export function isSingles(gameType: string): boolean {
  return gameType === "singles";
}

export function gameTypeLabel(gameType: string): string {
  return gameType === "singles" ? "Singles" : "Doubles";
}

export function isValidGameType(value: string): value is GameType {
  return (gameTypes as readonly string[]).includes(value);
}

export function formatTeamLine(names: string[]): string {
  const filled = names.filter(Boolean);
  if (filled.length === 0) return "TBD";
  if (filled.length === 1) return filled[0];
  return filled.join(" & ");
}

export function gamesPlayed(wins: number, losses: number): number {
  return wins + losses;
}
