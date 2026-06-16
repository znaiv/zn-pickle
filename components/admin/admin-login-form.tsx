"use client";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND } from "@/lib/brand";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const next = sp.get("next") ?? "/session/new";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Login failed");
      return;
    }
    router.replace(next);
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <BrandLogo className="h-10 w-10" />
          <div>
            <p className="font-display text-lg font-bold">{BRAND.name} Admin</p>
            <p className="text-xs text-muted">Sign in to manage sessions</p>
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-charcoal">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border-strong bg-surface-raised px-4 py-3 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-2 w-full rounded-xl border border-border-strong bg-surface-raised px-4 py-3 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}

