"use client";

import { SessionPanel } from "@/components/session/session-panel";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND } from "@/lib/brand";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function LivePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    params.then(async ({ slug: s }) => {
      setSlug(s);
      const res = await fetch(`/api/live/${s}`);
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session.id);
      } else {
        setError(true);
      }
    });
  }, [params]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-muted">Session not found</p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-surface-raised px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <BrandLogo className="h-8 w-8" />
          <div>
            <p className="font-display font-bold">{BRAND.name} Live</p>
            <p className="text-xs text-muted">/{slug}</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-live-bg px-3 py-1 text-xs font-semibold text-live ring-1 ring-red-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-live" />
            Live
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SessionPanel sessionId={sessionId} readOnly />
      </main>
    </div>
  );
}
