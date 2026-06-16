"use client";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { saveLastSession } from "@/lib/session/local-resume";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type GameType = "singles" | "doubles";
type MatchingMode = "fair" | "fifo";

export function NewSessionForm() {
  const router = useRouter();
  const [name, setName] = useState("Tuesday Open Play");
  const [courtCount, setCourtCount] = useState(1);
  const [gameType, setGameType] = useState<GameType>("doubles");
  const [matchingMode, setMatchingMode] = useState<MatchingMode>("fair");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, courtCount, gameType, matchingMode }),
    });

    const session = await res.json();
    setLoading(false);

    if (res.ok) {
      saveLastSession({ id: session.id, name });
      router.push(`/session/${session.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-lg space-y-8 p-8 sm:p-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
          New session
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold tracking-tight">Start open play</h1>
        <p className="mt-2 text-sm text-muted">
          Set up in under a minute. No {BRAND.name} account required.
        </p>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-charcoal">Session name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border-strong bg-surface-raised px-4 py-3 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          required
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-charcoal">Game type</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(
            [
              { value: "doubles", label: "Doubles", desc: "4 players per court" },
              { value: "singles", label: "Singles", desc: "2 players per court" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGameType(option.value)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                gameType === option.value
                  ? "border-brand-600 bg-brand-50 shadow-sm ring-1 ring-brand-200"
                  : "border-border bg-surface-raised hover:border-brand-300"
              )}
            >
              <span className="font-display font-semibold">{option.label}</span>
              <p className="mt-1 text-xs text-muted">{option.desc}</p>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-charcoal">Queue rotation</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(
            [
              {
                value: "fair",
                label: "Fair rotation",
                desc: "Avoid repeat partners",
              },
              { value: "fifo", label: "Simple queue", desc: "First in line" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMatchingMode(option.value)}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                matchingMode === option.value
                  ? "border-brand-600 bg-brand-50 shadow-sm ring-1 ring-brand-200"
                  : "border-border bg-surface-raised hover:border-brand-300"
              )}
            >
              <span className="font-display font-semibold">{option.label}</span>
              <p className="mt-1 text-xs text-muted">{option.desc}</p>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-charcoal">Number of courts</span>
        <input
          type="number"
          min={1}
          max={12}
          step={1}
          value={courtCount}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) setCourtCount(next);
          }}
          className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-brand-400"
        />
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create session"}
      </Button>
    </form>
  );
}
