import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-brand-50 via-surface-raised to-surface-raised px-8 py-14 text-center sm:px-12">
          <h2 className="font-display text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Stop being the human whiteboard
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Start free. No account needed. Most organizers are up and running in under five minutes.
          </p>
          <Button size="lg" className="mt-8" href="/session/new">
            Try {BRAND.name} free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
