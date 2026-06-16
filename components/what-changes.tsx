const benefits = [
  {
    title: "Less crowd around the tablet",
    description:
      "Players follow the live queue, up-next matches, and standings from their own phones.",
  },
  {
    title: "Fairer rotation, fewer complaints",
    description:
      "Visible queue order, matching modes, and session stats make decisions easier to trust.",
  },
  {
    title: "Faster session management",
    description:
      "Check people in, record winners, preview pairings, and keep multiple courts moving from one screen.",
  },
];

export function WhatChanges() {
  return (
    <section className="section-pad bg-surface">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            What changes
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            A calmer night for organizers
          </h2>
        </div>
        <div className="mt-14 space-y-4">
          {benefits.map((item, i) => (
            <div
              key={item.title}
              className="card flex flex-col gap-4 p-8 sm:flex-row sm:items-start sm:gap-8 sm:p-10"
            >
              <span className="font-display text-3xl font-bold text-brand-200">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-xl font-bold sm:text-2xl">{item.title}</h3>
                <p className="mt-2 max-w-2xl leading-relaxed text-muted">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
