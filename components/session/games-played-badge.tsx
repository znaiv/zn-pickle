import { cn } from "@/lib/utils";

interface GamesPlayedBadgeProps {
  count: number;
  className?: string;
  title?: string;
}

export function GamesPlayedBadge({ count, className, title }: GamesPlayedBadgeProps) {
  return (
    <span
      className={cn(
        "ml-auto shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-subtle ring-1 ring-border",
        count > 0 && "bg-brand-50 text-brand-800 ring-brand-200",
        className
      )}
      title={title ?? `${count} game${count === 1 ? "" : "s"} played`}
    >
      {count} GP
    </span>
  );
}

export function formatPlayerWithGames(name: string, gamesPlayed: number): string {
  return gamesPlayed > 0 ? `${name} (${gamesPlayed} GP)` : name;
}
