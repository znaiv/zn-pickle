import { Navbar } from "@/components/navbar";
import { db } from "@/db";
import { sessions, matches, players } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

export const metadata = {
  title: "Session History",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default async function SessionsPage() {
  const rows = await db.select().from(sessions).orderBy(desc(sessions.createdAt));

  const enriched = await Promise.all(
    rows.map(async (s) => {
      const matchCount = (
        await db.select().from(matches).where(eq(matches.sessionId, s.id))
      ).filter((m) => m.status === "completed").length;
      const playerCount = (await db.select().from(players).where(eq(players.sessionId, s.id))).length;

      return { ...s, matchCount, playerCount };
    }),
  );

  const ended = enriched.filter((s) => s.status === "ended");
  const active = enriched.filter((s) => s.status === "active");

  return (
    <>
      <Navbar />
      <main className="bg-surface mx-auto max-w-6xl px-4 py-28 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">History</p>
            <h1 className="font-display mt-2 text-2xl font-bold sm:text-3xl">Session history</h1>
            <p className="mt-1 text-sm text-muted">
              View ended sessions in read-only mode.
            </p>
          </div>
          <Link
            href="/session/new"
            className="inline-flex items-center justify-center rounded-xl border border-border-strong bg-surface-raised px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-slate-50"
          >
            Start new session
          </Link>
        </div>

        {active.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold">Active</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {active.map((s) => (
                <div key={s.id} className="card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Active</p>
                  <p className="mt-2 font-display text-lg font-bold">{s.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {s.courtCount} courts · {s.playerCount} players · {s.matchCount} completed
                  </p>
                  <p className="mt-2 text-xs text-subtle">Created {formatDate(s.createdAt)}</p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/session/${s.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-brand-600/25 hover:bg-brand-700"
                    >
                      Open
                    </Link>
                    <Link
                      href={`/live/${s.slug}`}
                      className="inline-flex items-center justify-center rounded-xl border border-border-strong bg-surface-raised px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-slate-50"
                    >
                      Live link
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold">Ended</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ended.map((s) => (
              <div key={s.id} className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Ended</p>
                <p className="mt-2 font-display text-lg font-bold">{s.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {s.courtCount} courts · {s.playerCount} players · {s.matchCount} completed
                </p>
                <p className="mt-2 text-xs text-subtle">
                  Ended {formatDate(s.endedAt ?? s.createdAt)}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/session/${s.id}?view=1`}
                    className="inline-flex items-center justify-center rounded-xl border border-border-strong bg-surface-raised px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-slate-50"
                  >
                    View
                  </Link>
                  <Link
                    href={`/live/${s.slug}`}
                    className="inline-flex items-center justify-center rounded-xl border border-border-strong bg-surface-raised px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-slate-50"
                  >
                    Live link
                  </Link>
                </div>
              </div>
            ))}
            {ended.length === 0 && (
              <div className="card p-6 text-sm text-muted">
                No ended sessions yet.
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

