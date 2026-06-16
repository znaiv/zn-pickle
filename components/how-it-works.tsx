const steps = [
  {
    number: "1",
    title: "Set up courts & players",
    description:
      "Add players, choose singles or doubles, pick fair rotation or simple queue, and set court count.",
  },
  {
    number: "2",
    title: "Run open play from one screen",
    description:
      "Check players in, preview up-next pairings, start matches, and record winners as courts finish.",
  },
  {
    number: "3",
    title: "Share a live link",
    description:
      "Copy the URL or show a QR code so players can follow queue position and standings on their phones.",
  },
  {
    number: "4",
    title: "Finish with stats",
    description:
      "End the night with a leaderboard, games-played counts, and shareable results for your club.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-pad">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            How it works
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Up and running in minutes
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {steps.map((step) => (
            <article key={step.number} className="card card-hover p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
                {step.number}
              </span>
              <h3 className="font-display mt-5 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
