"use client";

import { Button } from "@/components/ui/button";
import { clearLastSession, loadLastSession } from "@/lib/session/local-resume";
import { ArrowRight, History } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function ResumeLastSession() {
  const last = useMemo(() => loadLastSession(), []);
  const [visible, setVisible] = useState<boolean>(() => Boolean(last));

  useEffect(() => {
    let cancelled = false;
    if (!last) {
      setVisible(false);
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      try {
        const res = await fetch(`/api/sessions/${last.id}`);
        if (!res.ok) {
          clearLastSession();
          if (!cancelled) setVisible(false);
          return;
        }
        const data = (await res.json()) as { session?: { status?: string } };
        const ok = data.session?.status === "active";
        if (!ok) clearLastSession();
        if (!cancelled) setVisible(ok);
      } catch {
        clearLastSession();
        if (!cancelled) setVisible(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [last]);

  if (!last) return null;
  if (!visible) return null;

  return (
    <div className="card mx-auto mt-6 max-w-lg p-6 sm:p-7">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-200">
          <History className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-charcoal">Continue where you left off</p>
          <p className="mt-1 truncate text-sm text-muted" title={last.name}>
            {last.name}
          </p>
          <p className="mt-1 text-xs text-subtle">Saved on this device</p>
        </div>
        <Button size="sm" href={`/session/${last.id}`}>
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

