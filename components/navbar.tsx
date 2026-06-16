"use client";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "History", href: "/sessions" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === "/";
  const overDarkHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "py-2" : "py-4"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8",
            scrolled && "rounded-2xl border border-border/80 bg-surface-raised/90 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
          )}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-9 w-9" />
            <span
              className={cn(
                "font-display text-lg font-bold tracking-tight transition-colors",
                overDarkHero ? "text-white" : "text-charcoal"
              )}
            >
              {BRAND.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  overDarkHero
                    ? "text-slate-200 hover:bg-white/10 hover:text-white"
                    : "text-muted hover:bg-slate-100 hover:text-charcoal"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Button size="sm" href="/session/new" className="hidden md:inline-flex">
            Start session
          </Button>

          <button
            type="button"
            className={cn(
              "rounded-xl p-2 transition-colors md:hidden",
              overDarkHero
                ? "text-white hover:bg-white/10"
                : "text-charcoal hover:bg-slate-100"
            )}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface-raised p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold">{BRAND.name}</span>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3.5 text-base font-medium hover:bg-slate-100"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Button size="lg" className="mt-auto w-full" href="/session/new">
              Start session
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
