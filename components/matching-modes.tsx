import { Check } from "lucide-react";

const modes = [
  { name: "Fair rotation", desc: "Avoid repeat partners and opponents using match history" },
  { name: "Simple queue", desc: "First-in-first-out pairing for casual nights" },
  { name: "Singles & doubles", desc: "Switch game type before the first match starts" },
  { name: "Up-next preview", desc: "See pairings before sending players to court" },
  { name: "Live player link", desc: "Share queue and standings via URL or QR code" },
  { name: "Undo results", desc: "Fix mistaken winners before the court is reused" },
];

const dayOne = [
  "Start a session in minutes — no signup required",
  "Add players and check them into a live queue",
  "Run multiple courts from one organizer panel",
  "Share a public live view for players on their phones",
];

export function MatchingModes() {
  return (
    <section className="section-pad bg-surface">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Capabilities
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            What you get on day one
          </h2>
          <p className="mt-4 text-muted">
            Enough to run a cleaner session immediately, without a long setup project.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="card p-8">
            <h3 className="font-display text-xl font-bold">Session tools</h3>
            <ul className="mt-6 space-y-4">
              {modes.map((mode) => (
                <li key={mode.name} className="border-b border-border pb-4 last:border-0">
                  <p className="font-semibold text-charcoal">{mode.name}</p>
                  <p className="mt-1 text-sm text-muted">{mode.desc}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-surface-raised p-8">
            <h3 className="font-display text-xl font-bold">Included free</h3>
            <ul className="mt-6 space-y-3">
              {dayOne.map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
