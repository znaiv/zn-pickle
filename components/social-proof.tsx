const logos = ["Stripe", "Notion", "Figma", "Linear", "Vercel", "Slack"];

const stats = [
  { value: "10K+", label: "Active users" },
  { value: "4.9★", label: "Average rating" },
  { value: "99.9%", label: "Uptime SLA" },
];

export function SocialProof() {
  return (
    <section className="border-y border-border bg-white py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-muted">
          Trusted by teams worldwide
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((logo) => (
            <span
              key={logo}
              className="font-display text-lg font-semibold tracking-tight text-charcoal/30 transition-colors hover:text-charcoal/50"
            >
              {logo}
            </span>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold text-charcoal">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
