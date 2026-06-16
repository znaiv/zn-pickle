"use client";

import { Button } from "@/components/ui/button";
import { GamesPlayedBadge } from "@/components/session/games-played-badge";
import { LiveLinkQrModal } from "@/components/session/live-link-qr-modal";
import { UpNextPreview } from "@/components/session/up-next-preview";
import { WinConfirmDialog } from "@/components/session/win-confirm-dialog";
import { cn } from "@/lib/utils";
import { gameTypeLabel } from "@/lib/session/game-type";
import { matchingModeLabel } from "@/lib/session/rotation";
import { saveLastSession } from "@/lib/session/local-resume";
import {
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  QrCode,
  RotateCcw,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface PlayerRow {
  id: string;
  name: string;
  checkedIn: boolean;
  wins: number;
  losses: number;
  gamesPlayed: number;
  queuePosition: number | null;
  status: string;
}

interface TeamPlayer {
  name: string;
  gamesPlayed: number;
}

interface SessionState {
  session: {
    id: string;
    name: string;
    slug: string;
    courtCount: number;
    gameType: string;
    matchingMode: string;
    status: string;
  };
  players: PlayerRow[];
  courts: Array<{ id: string; number: number; status: string }>;
  matches: Array<{
    id: string;
    courtId: string | null;
    status: string;
    team1: TeamPlayer[];
    team2: TeamPlayer[];
    winningTeam: number | null;
  }>;
  queue: PlayerRow[];
  liveUrl: string;
  playersRequired: number;
  undoableMatch: {
    matchId: string;
    courtNumber: number;
    winningTeam: 1 | 2;
    winnerLabel: string;
  } | null;
}

interface SessionPanelProps {
  sessionId: string;
  readOnly?: boolean;
}

interface PendingWin {
  matchId: string;
  winningTeam: 1 | 2;
  winnerLabel: string;
  courtNumber: number;
}

function TeamNames({ players }: { players: TeamPlayer[] }) {
  return (
    <div className="space-y-1">
      {players.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="text-sm font-medium">{p.name}</span>
          <GamesPlayedBadge count={p.gamesPlayed} className="ml-0" />
        </div>
      ))}
    </div>
  );
}

export function SessionPanel({ sessionId, readOnly = false }: SessionPanelProps) {
  const [state, setState] = useState<SessionState | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [pendingWin, setPendingWin] = useState<PendingWin | null>(null);
  const [confirmingWin, setConfirmingWin] = useState(false);
  const [pendingUndo, setPendingUndo] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);
  const [startingMatches, setStartingMatches] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [endSessionOpen, setEndSessionOpen] = useState(false);
  const [endSessionError, setEndSessionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (res.ok) {
      const next = (await res.json()) as SessionState;
      setState(next);
      if (!readOnly) {
        if (next.session.status === "active") {
          saveLastSession({ id: next.session.id, name: next.session.name });
        }
      }
    }
    setLoading(false);
  }, [sessionId, readOnly]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!playerName.trim()) return;
    await fetch(`/api/sessions/${sessionId}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName }),
    });
    setPlayerName("");
    await refresh();
  }

  async function checkIn(playerId: string) {
    await fetch(`/api/sessions/${sessionId}/players/${playerId}/check-in`, {
      method: "POST",
    });
    await refresh();
  }

  async function recordWinner(matchId: string, winningTeam: 1 | 2) {
    setConfirmingWin(true);
    await fetch(`/api/sessions/${sessionId}/matches/${matchId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winningTeam }),
    });
    setConfirmingWin(false);
    setPendingWin(null);
    await refresh();
  }

  async function undoLastResult() {
    if (!state?.undoableMatch) return;
    setUndoing(true);
    setUndoError(null);
    const res = await fetch(
      `/api/sessions/${sessionId}/matches/${state.undoableMatch.matchId}/undo`,
      { method: "POST" }
    );
    setUndoing(false);
    setPendingUndo(false);
    if (res.ok) {
      await refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setUndoError(data.error ?? "Could not undo the last result");
    }
  }

  async function fillCourts() {
    setStartingMatches(true);
    await fetch(`/api/sessions/${sessionId}/courts/fill`, { method: "POST" });
    setStartingMatches(false);
    await refresh();
  }

  async function endSessionNow() {
    setEndingSession(true);
    setEndSessionError(null);
    const res = await fetch(`/api/sessions/${sessionId}/end`, { method: "POST" });
    setEndingSession(false);
    setEndSessionOpen(false);
    if (res.ok) {
      await refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setEndSessionError(data.error ?? "Could not end session");
    }
  }

  async function changeGameType(gameType: "singles" | "doubles") {
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameType }),
    });
    if (res.ok) await refresh();
  }

  async function changeMatchingMode(matchingMode: "fair" | "fifo") {
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchingMode }),
    });
    if (res.ok) await refresh();
  }

  function copyLiveLink() {
    if (!state) return;
    const url = `${window.location.origin}${state.liveUrl}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading || !state) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const activeMatches = state.matches.filter((m) => m.status === "in_progress");
  const leaderboard = [...state.players].sort(
    (a, b) => b.wins - a.wins || a.losses - b.losses || b.gamesPlayed - a.gamesPlayed
  );
  const isSingles = state.session.gameType === "singles";
  const playersNeeded = state.playersRequired;
  const totalGames = state.matches.filter((m) => m.status === "completed").length;
  const availableCourts = state.courts.filter((c) => c.status === "available");
  const isEnded = state.session.status === "ended";
  const uncheckedPlayers = state.players.filter((p) => !p.checkedIn);
  const canStartMatches =
    !readOnly &&
    !isEnded &&
    state.queue.length >= playersNeeded &&
    availableCourts.length > 0;

  function requestWin(
    matchId: string,
    winningTeam: 1 | 2,
    winnerLabel: string,
    courtNumber: number
  ) {
    setPendingWin({ matchId, winningTeam, winnerLabel, courtNumber });
  }

  return (
    <div className="space-y-6">
      <header className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Session</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{state.session.name}</h1>
              <span className="rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200">
                {gameTypeLabel(state.session.gameType)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-muted ring-1 ring-border">
                {matchingModeLabel(state.session.matchingMode ?? "fair")}
              </span>
              {isEnded && (
                <span className="rounded-full bg-slate-900 px-3 py-0.5 text-xs font-semibold text-white ring-1 ring-slate-900">
                  Ended
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted">
              {state.session.courtCount} courts · {state.players.length} players ·{" "}
              <span className="font-semibold text-brand-700">{state.queue.length} in queue</span>
              {" · "}
              {playersNeeded} players per match
              {totalGames > 0 && (
                <>
                  {" · "}
                  {totalGames} match{totalGames === 1 ? "" : "es"} completed
                </>
              )}
            </p>
            {(state.session.matchingMode ?? "fair") === "fair" && (
              <p className="mt-2 text-xs text-muted">
                Fair rotation mixes partners and opponents using match history.
              </p>
            )}
          </div>

          {!readOnly && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="secondary" size="sm" href="/session/new">
                Exit
              </Button>
              <Button variant="secondary" size="sm" onClick={copyLiveLink}>
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy live link"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setQrOpen(true)}>
                <QrCode className="h-4 w-4" />
                Show QR
              </Button>
              <Button
                variant="secondary"
                size="sm"
                href={state.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Player view
              </Button>
              {!isEnded && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={activeMatches.length > 0}
                  onClick={() => setEndSessionOpen(true)}
                  title={
                    activeMatches.length > 0
                      ? "Finish active matches before ending the session"
                      : undefined
                  }
                >
                  End session
                </Button>
              )}
            </div>
          )}
        </div>

        {!readOnly && activeMatches.length === 0 && (
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-muted self-center">Game:</span>
              {(["doubles", "singles"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => changeGameType(type)}
                  disabled={isEnded}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                    state.session.gameType === type
                      ? "bg-brand-600 text-white ring-1 ring-brand-700"
                      : "bg-surface-raised text-muted ring-1 ring-border hover:bg-slate-50"
                  )}
                >
                  {gameTypeLabel(type)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-muted self-center">Rotation:</span>
              {(["fair", "fifo"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => changeMatchingMode(mode)}
                  disabled={isEnded}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                    state.session.matchingMode === mode
                      ? "bg-brand-600 text-white ring-1 ring-brand-700"
                      : "bg-surface-raised text-muted ring-1 ring-border hover:bg-slate-50"
                  )}
                >
                  {matchingModeLabel(mode)}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {!readOnly && (
        <LiveLinkQrModal
          open={qrOpen}
          liveUrl={state.liveUrl}
          sessionName={state.session.name}
          onClose={() => setQrOpen(false)}
        />
      )}

      {!readOnly && pendingWin && (
        <WinConfirmDialog
          open
          title="Record match result?"
          description={`Court ${pendingWin.courtNumber}: confirm ${pendingWin.winnerLabel} as the winner. You can undo the last result afterward if needed.`}
          confirmLabel="Confirm winner"
          loading={confirmingWin}
          onConfirm={() => recordWinner(pendingWin.matchId, pendingWin.winningTeam)}
          onCancel={() => !confirmingWin && setPendingWin(null)}
        />
      )}

      {!readOnly && pendingUndo && state.undoableMatch && (
        <WinConfirmDialog
          open
          title="Undo last result?"
          description={`This restores Court ${state.undoableMatch.courtNumber} to in progress and removes the win for ${state.undoableMatch.winnerLabel}. Standings will be updated.`}
          confirmLabel="Undo result"
          loading={undoing}
          onConfirm={undoLastResult}
          onCancel={() => !undoing && setPendingUndo(false)}
        />
      )}

      {!readOnly && endSessionOpen && (
        <WinConfirmDialog
          open
          title="End session?"
          description="This stops any new matches from being staged. You can still view standings and the live link."
          confirmLabel="End session"
          loading={endingSession}
          onConfirm={endSessionNow}
          onCancel={() => !endingSession && setEndSessionOpen(false)}
        />
      )}

      {!readOnly && undoError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {undoError}
        </p>
      )}

      {!readOnly && endSessionError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {endSessionError}
        </p>
      )}

      {!readOnly && isEnded && (
        <p className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm text-muted">
          Session ended — no new matches will be started.
        </p>
      )}

      {!readOnly && state.undoableMatch && !pendingUndo && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warning-border bg-warning-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-charcoal">
            Last result recorded:{" "}
            <span className="font-medium">{state.undoableMatch.winnerLabel}</span> won on{" "}
            <span className="font-medium">Court {state.undoableMatch.courtNumber}</span>.
            Wrong winner?
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="shrink-0"
            onClick={() => setPendingUndo(true)}
          >
            <RotateCcw className="h-4 w-4" />
            Undo last result
          </Button>
        </div>
      )}

      {!readOnly && (
        <form onSubmit={addPlayer} className="flex gap-2">
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Add player name…"
            disabled={isEnded}
            className="flex-1 rounded-xl border border-border-strong bg-surface-raised px-4 py-3 text-charcoal outline-none placeholder:text-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <Button type="submit" disabled={isEnded}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-1">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-600" />
            <h2 className="font-display font-semibold">Live Queue</h2>
          </div>
          <p className="mt-1 text-xs text-muted">GP = games played this session</p>

          <ul className="mt-4 space-y-2">
            {state.queue.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-sm">
                <span className="font-mono text-xs text-muted">{i + 1}</span>
                <span className="font-medium">{p.name}</span>
                <span className="ml-auto flex items-center gap-2">
                  <span
                    className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-subtle ring-1 ring-border"
                    title="Wins / Losses"
                  >
                    {p.wins}W {p.losses}L
                  </span>
                <GamesPlayedBadge count={p.gamesPlayed} />
                </span>
              </li>
            ))}
            {state.queue.length === 0 && (
              <p className="py-4 text-center text-sm text-muted">No players in queue</p>
            )}
          </ul>

          {!readOnly && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Roster — tap to check in
              </p>
              {uncheckedPlayers.length > 0 && (
                <div className="mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={isEnded}
                    onClick={() => {
                      const pick =
                        uncheckedPlayers[Math.floor(Math.random() * uncheckedPlayers.length)];
                      if (pick) checkIn(pick.id);
                    }}
                  >
                    Random check-in
                  </Button>
                </div>
              )}
              <ul className="space-y-1">
                {state.players
                  .filter((p) => !p.checkedIn)
                  .map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => checkIn(p.id)}
                        disabled={isEnded}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-charcoal/[0.04]"
                      >
                        <UserCheck className="h-4 w-4 shrink-0 text-muted" />
                        <span className="font-medium">{p.name}</span>
                        <GamesPlayedBadge count={p.gamesPlayed} />
                      </button>
                    </li>
                  ))}
                {state.players.filter((p) => !p.checkedIn).length === 0 && (
                  <p className="text-xs text-muted">All players checked in</p>
                )}
              </ul>
            </div>
          )}
        </section>

        <section className="space-y-4 lg:col-span-2">
          {!readOnly && (
            <UpNextPreview
              sessionId={sessionId}
              gameType={state.session.gameType}
              canStart={canStartMatches}
              onStart={fillCourts}
              starting={startingMatches}
            />
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Courts</h2>
          </div>
          {state.courts.map((court) => {
            const match = activeMatches.find((m) => m.courtId === court.id);
            return (
              <div
                key={court.id}
                className={cn(
                  "card p-5 transition-colors",
                  match ? "status-active" : "status-idle"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Court {court.number}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      match ? "badge-active" : "badge-idle"
                    )}
                  >
                    {match && (
                      <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
                    )}
                    {match ? "In Progress" : "Available"}
                  </span>
                </div>

                {match ? (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border bg-surface-raised p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                          {isSingles ? "Player 1" : "Team 1"}
                        </p>
                        <div className="mt-2">
                          <TeamNames players={match.team1} />
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-surface-raised p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                          {isSingles ? "Player 2" : "Team 2"}
                        </p>
                        <div className="mt-2">
                          <TeamNames players={match.team2} />
                        </div>
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="court"
                          onClick={() =>
                            requestWin(
                              match.id,
                              1,
                              isSingles ? "Player 1" : "Team 1",
                              court.number
                            )
                          }
                        >
                          {isSingles ? "Player 1 wins" : "Team 1 wins"}
                        </Button>
                        <Button
                          size="sm"
                          variant="court"
                          onClick={() =>
                            requestWin(
                              match.id,
                              2,
                              isSingles ? "Player 2" : "Team 2",
                              court.number
                            )
                          }
                        >
                          {isSingles ? "Player 2 wins" : "Team 2 wins"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-3 text-sm text-muted">
                    Waiting for {playersNeeded} players in queue…
                  </p>
                )}
              </div>
            );
          })}
        </section>
      </div>

      <section className="card p-5">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-brand-600" />
          <h2 className="font-display font-semibold">Standings</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-strong bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-2 py-2.5 pr-4">#</th>
                <th className="py-2.5 pr-4">Player</th>
                <th className="py-2.5 pr-4" title="Games played">GP</th>
                <th className="py-2.5 pr-4">W</th>
                <th className="py-2.5">L</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((p, i) => (
                <tr key={p.id} className="border-b border-border">
                  <td className="px-2 py-2.5 pr-4 text-subtle">{i + 1}</td>
                  <td className="py-2.5 pr-4 font-medium text-charcoal">{p.name}</td>
                  <td className="py-2.5 pr-4 font-medium tabular-nums">{p.gamesPlayed}</td>
                  <td className="py-2.5 pr-4 font-semibold tabular-nums text-success">{p.wins}</td>
                  <td className="py-2.5 tabular-nums text-muted">{p.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
