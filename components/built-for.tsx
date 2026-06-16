import { Building2, CalendarDays, Users } from "lucide-react";

const audiences = [
  {
    icon: Building2,
    title: "Rec centers & gyms",
    description:
      "Less front-desk chaos, clearer rotation, and a more professional member experience.",
  },
  {
    icon: Users,
    title: "Pickleball clubs",
    description:
      "Track recurring sessions, share live links, and give members standings they actually check.",
  },
  {
    icon: CalendarDays,
    title: "Community organizers",
    description:
      "Keep multi-court nights moving without whiteboards, group chats, or constant shouting.",
  },
];

export function BuiltFor() {
  return (
    <section id="features" className="section-pad">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Built for</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everyone running open play
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {audiences.map((item) => (
            <article key={item.title} className="card card-hover p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display mt-5 text-xl font-bold">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
