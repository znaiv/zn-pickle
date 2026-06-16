import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Pickle replaced three tools for us overnight. The UI is gorgeous and our team actually enjoys using it.",
    name: "Sarah Chen",
    role: "Head of Product, Lumina",
    avatar: "SC",
  },
  {
    quote:
      "Finally, a workspace that feels human. Fast, intuitive, and just the right amount of fun.",
    name: "Marcus Rivera",
    role: "Founder, Stackline",
    avatar: "MR",
  },
  {
    quote:
      "We shipped our last launch two weeks early. Pickle's clarity and AI suggestions are game-changers.",
    name: "Emily Watson",
    role: "Engineering Lead, Nova",
    avatar: "EW",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Stories" title="Loved by teams who ship" />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal
              key={item.name}
              as="blockquote"
              delay={index * 100}
              className="relative flex flex-col rounded-3xl border border-border bg-cream p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
            >
              <Quote className="h-8 w-8 text-brand-300" />
              <p className="mt-4 flex-1 leading-relaxed text-charcoal">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {item.avatar}
                </div>
                <div>
                  <cite className="not-italic font-semibold text-charcoal">
                    {item.name}
                  </cite>
                  <p className="text-sm text-muted">{item.role}</p>
                </div>
              </footer>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
