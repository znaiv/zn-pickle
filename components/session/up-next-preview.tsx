"use client";

import { Button } from "@/components/ui/button";
import { GamesPlayedBadge } from "@/components/session/games-played-badge";
import { Loader2, Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface PreviewPlayer {
  name: string;
  gamesPlayed: number;
}

interface CourtPreview {
  courtNumber: number;
  courtId: string;
  team1: PreviewPlayer[];
  team2: PreviewPlayer[];
}

interface UpNextPreviewProps {
  sessionId: string;
  gameType: string;
  canStart: boolean;
  onStart: () => Promise<void>;
  starting?: boolean;
}

function PreviewTeam({ label, players }: { label: string; players: PreviewPlayer[] }) {
  return (
    <div className="rounded-xl border border-border bg-slate-50 p-3">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <div className="mt-2 space-y-1">
        {players.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="text-sm font-medium">{p.name}</span>
            <GamesPlayedBadge count={p.gamesPlayed} className="ml-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UpNextPreview({
  sessionId,
  gameType,
  canStart,
  onStart,
  starting = false,
}: UpNextPreviewProps) {
  const [previews, setPreviews] = useState<CourtPreview[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}/courts/preview`);
    if (res.ok) {
      const data = await res.json();
      setPreviews(data.previews ?? []);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    if (!canStart) {
      setPreviews([]);
      setLoading(false);
      return;
    }

    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [canStart, refresh]);

  if (!canStart) return null;

  const isSingles = gameType === "singles";

  return (
    <section className="card border-brand-200 bg-brand-50/50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display font-semibold">Up next</h2>
          <p className="mt-1 text-xs text-muted">
            Preview pairings before sending players to court
          </p>
        </div>
        <Button size="sm" disabled={starting || loading || previews.length === 0} onClick={onStart}>
          {starting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          Start next matches
        </Button>
      </div>

      {loading && previews.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading preview…
        </div>
      ) : previews.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Not enough players in queue to fill courts.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {previews.map((preview) => (
            <div
              key={preview.courtId}
              className="card p-4"
            >
              <p className="text-sm font-semibold">Court {preview.courtNumber}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <PreviewTeam
                  label={isSingles ? "Player 1" : "Team 1"}
                  players={preview.team1}
                />
                <PreviewTeam
                  label={isSingles ? "Player 2" : "Team 2"}
                  players={preview.team2}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
