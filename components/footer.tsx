import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-raised py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <BrandLogo className="h-8 w-8" />
              <span className="font-display text-lg font-bold">{BRAND.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted">{BRAND.description}</p>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/#how-it-works" className="text-muted hover:text-charcoal">
              How it works
            </Link>
            <Link href="/#features" className="text-muted hover:text-charcoal">
              Features
            </Link>
            <Link href="/session/new" className="text-muted hover:text-charcoal">
              Start session
            </Link>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-8 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} {BRAND.name}. Open play tools stay free.
        </p>
      </div>
    </footer>
  );
}
