import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink pt-28 pb-20 sm:pt-32 sm:pb-28">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-brand-300" />
            {BRAND.tagline}
          </div>

          <h1 className="font-display text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.08]">
            Run open play without the{" "}
            <span className="bg-gradient-to-r from-brand-200 to-brand-300 bg-clip-text text-transparent">
              chaos
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
            Live queues, fair court rotation, and real-time standings — built for clubs,
            rec centers, and organizers managing multiple courts.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" href="/session/new" className="min-w-[180px]">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              href="/#features"
              className="min-w-[180px] border-white/15 bg-white/5 text-white hover:border-brand-400/50 hover:bg-white/10 hover:text-white"
            >
              See features
            </Button>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            No signup · Multi-court · Shareable live link
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="card overflow-hidden border-white/10 bg-ink-muted/80 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-xs text-slate-500">courtflow.app/session/live</span>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                  Queue
                </p>
                <ul className="mt-3 space-y-2">
                  {["Alex", "Jordan", "Sam", "Riley"].map((name, i) => (
                    <li
                      key={name}
                      className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300"
                    >
                      <span className="font-mono text-xs text-slate-500">{i + 1}</span>
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 sm:col-span-2">
                {[
                  { court: 1, status: "In progress" },
                  { court: 2, status: "Available" },
                ].map((c) => (
                  <div
                    key={c.court}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-white">
                        Court {c.court}
                      </span>
                      <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-medium text-brand-200">
                        {c.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-400">
                      <div className="rounded-lg bg-white/5 px-3 py-2">Team 1</div>
                      <div className="rounded-lg bg-white/5 px-3 py-2">Team 2</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
