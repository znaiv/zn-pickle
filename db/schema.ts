import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sessionStatuses = ["active", "ended"] as const;
export type SessionStatus = (typeof sessionStatuses)[number];

export const gameTypes = ["singles", "doubles"] as const;
export type GameType = (typeof gameTypes)[number];

export const matchingModes = ["fair", "fifo"] as const;
export type MatchingMode = (typeof matchingModes)[number];

export const playerStatuses = ["idle", "queued", "playing"] as const;
export type PlayerStatus = (typeof playerStatuses)[number];

export const matchStatuses = ["up_next", "in_progress", "completed"] as const;
export type MatchStatus = (typeof matchStatuses)[number];

export const jobStatuses = ["pending", "processing", "completed", "failed"] as const;
export type JobStatus = (typeof jobStatuses)[number];

export const jobTypes = [
  "player.check_in",
  "match.stage",
  "match.complete",
] as const;
export type JobType = (typeof jobTypes)[number];

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  courtCount: integer("court_count").notNull().default(2),
  gameType: text("game_type").notNull().default("doubles"),
  matchingMode: text("matching_mode").notNull().default("fair"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  endedAt: text("ended_at"),
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  name: text("name").notNull(),
  checkedIn: integer("checked_in", { mode: "boolean" }).notNull().default(false),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  queuePosition: integer("queue_position"),
  status: text("status").notNull().default("idle"),
  createdAt: text("created_at").notNull(),
});

export const courts = sqliteTable("courts", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  number: integer("number").notNull(),
  status: text("status").notNull().default("available"),
});

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  courtId: text("court_id"),
  status: text("status").notNull().default("up_next"),
  team1Player1Id: text("team1_player1_id"),
  team1Player2Id: text("team1_player2_id"),
  team2Player1Id: text("team2_player1_id"),
  team2Player2Id: text("team2_player2_id"),
  winningTeam: integer("winning_team"),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  payload: text("payload").notNull(),
  result: text("result"),
  error: text("error"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  scheduledAt: text("scheduled_at").notNull(),
  createdAt: text("created_at").notNull(),
  processedAt: text("processed_at"),
});

export type Session = typeof sessions.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Court = typeof courts.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Job = typeof jobs.$inferSelect;
