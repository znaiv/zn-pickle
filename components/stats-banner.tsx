const stats = [
  { value: "19K+", label: "Sessions run" },
  { value: "316K+", label: "Players managed" },
  { value: "8K+", label: "Clubs & venues" },
];

export function StatsBanner() {
  return (
    <section className="border-y border-border bg-surface-raised py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">
          Built for real open play
        </p>
        <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-4xl font-bold tracking-tight text-brand-600">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
