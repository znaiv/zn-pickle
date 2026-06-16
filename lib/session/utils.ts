import { randomUUID } from "crypto";

export function createSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${base || "session"}-${randomUUID().slice(0, 6)}`;
}

export function playerName(player: { name: string }) {
  return player.name;
}
