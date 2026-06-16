"use client";

import { Button } from "@/components/ui/button";
import { Copy, QrCode, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface LiveLinkQrModalProps {
  open: boolean;
  liveUrl: string;
  sessionName: string;
  onClose: () => void;
}

function buildLocalQrUrl(data: string) {
  return `/api/qr?data=${encodeURIComponent(data)}`;
}

export function LiveLinkQrModal({ open, liveUrl, sessionName, onClose }: LiveLinkQrModalProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${liveUrl}` : "";
  const qrSrc = useMemo(() => (fullUrl ? buildLocalQrUrl(fullUrl) : undefined), [fullUrl]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!open) return null;

  function copyLink() {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface-raised p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-charcoal/5 hover:text-charcoal"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-brand-600" />
          <h3 id="qr-modal-title" className="font-display text-lg font-bold">
            Scan to join live
          </h3>
        </div>
        <p className="mt-1 text-sm text-muted">{sessionName}</p>

        <div className="mt-5 flex justify-center rounded-2xl border border-border bg-white p-4">
          {qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrSrc} alt="QR code for live session link" width={200} height={200} />
          ) : (
            <div className="h-[200px] w-[200px] animate-pulse rounded-lg bg-charcoal/5" />
          )}
        </div>

        <p className="mt-4 break-all text-center text-xs text-muted">{fullUrl}</p>

        <Button type="button" variant="secondary" className="mt-4 w-full" onClick={copyLink}>
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
