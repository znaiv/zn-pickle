import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  BarChart3,
  Layers,
  MessageSquare,
  Sparkles,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

const features: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  className: string;
  highlight?: boolean;
}> = [
  {
    title: "Smart Workspaces",
    description:
      "Organize projects, docs, and conversations in flexible boards that adapt to how your team actually works.",
    icon: Layers,
    className: "md:col-span-2 md:row-span-2",
    highlight: true,
  },
  {
    title: "Real-time Sync",
    description: "Changes appear instantly for every teammate, everywhere.",
    icon: Zap,
    className: "md:col-span-1",
  },
  {
    title: "Team Chat",
    description: "Context-rich messaging tied directly to your work.",
    icon: MessageSquare,
    className: "md:col-span-1",
  },
  {
    title: "AI Assist",
    description: "Summaries, suggestions, and smart scheduling built in.",
    icon: Sparkles,
    className: "md:col-span-1",
  },
  {
    title: "Analytics",
    description: "Track progress with beautiful, actionable dashboards.",
    icon: BarChart3,
    className: "md:col-span-1",
  },
  {
    title: "Collaboration",
    description: "Invite anyone, assign roles, and keep everyone aligned.",
    icon: Users,
    className: "md:col-span-2",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need, nothing you don't"
          description="A bento-style toolkit designed for clarity, speed, and a little joy in every click."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal
                key={feature.title}
                delay={index * 80}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10",
                  feature.className,
                  feature.highlight && "bg-gradient-to-br from-brand-50 to-white"
                )}
              >
                <div
                  className={cn(
                    "mb-4 inline-flex rounded-2xl p-3",
                    feature.highlight
                      ? "bg-brand-500 text-white"
                      : "bg-brand-100 text-brand-700"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-charcoal">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted">{feature.description}</p>

                {feature.highlight && (
                  <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-brand-200/40 blur-2xl transition-all group-hover:bg-brand-300/50" />
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
