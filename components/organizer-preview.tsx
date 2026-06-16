import { Button } from "@/components/ui/button";

export function OrganizerPreview() {
  return (
    <section className="section-pad bg-surface-raised">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Organizer view
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            One screen to run the night
          </h2>
          <p className="mt-4 text-lg text-muted">
            Manage courts and queue from your panel. Share one link so players stay in sync.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-slate-900/10">
          <div className="flex items-center gap-2 border-b border-border bg-slate-50 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs text-muted">courtflow.app/live/tuesday-open</span>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-3 lg:p-6">
            <div className="card p-4 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Live queue
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {["Alex M.", "Jordan K.", "Sam P.", "Riley T.", "Casey L."].map((name, i) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                  >
                    <span className="font-mono text-xs text-muted">{i + 1}</span>
                    {name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 lg:col-span-2">
              {[
                { court: 1, t1: "Chris + Dana", t2: "Morgan + Lee", status: "In progress" },
                { court: 2, t1: "Pat + Quinn", t2: "Taylor + Avery", status: "Available" },
              ].map((c) => (
                <div key={c.court} className="card p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold">Court {c.court}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-charcoal">
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-border bg-slate-50 px-3 py-2.5">
                      {c.t1}
                    </div>
                    <div className="rounded-xl border border-border bg-slate-50 px-3 py-2.5">
                      {c.t2}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" href="/session/new">
            Start your first session
          </Button>
        </div>
      </div>
    </section>
  );
}
