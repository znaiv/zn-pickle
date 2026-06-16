import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "default" | "light";
}

export function BrandLogo({ className, variant = "default" }: BrandLogoProps) {
  const isLight = variant === "light";

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect
        width="40"
        height="40"
        rx="10"
        fill={isLight ? "white" : "url(#cf-logo-gradient)"}
      />
      <path
        d="M10 28V12h4.5l5.5 9.2V12H24v16h-4.4l-5.6-9.4V28H10z"
        fill={isLight ? "#2563eb" : "white"}
        opacity={isLight ? 1 : 0.95}
      />
      <path
        d="M26 20c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4"
        stroke={isLight ? "#3b82f6" : "#93c5fd"}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="cf-logo-gradient" x1="8" y1="8" x2="32" y2="32">
          <stop stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
