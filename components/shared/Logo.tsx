import { cn } from "@/lib/utils";

/** Original BlockSAT mark: a stack of three offset blocks forming an abstract "B", in the brand gradient. */
export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="blocksat-grad-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="blocksat-grad-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="blocksat-grad-c" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect x="4" y="26" width="18" height="18" rx="4" fill="url(#blocksat-grad-a)" />
      <rect x="24" y="16" width="18" height="18" rx="4" fill="url(#blocksat-grad-b)" />
      <rect x="14" y="4" width="18" height="18" rx="4" fill="url(#blocksat-grad-c)" />
    </svg>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-extrabold tracking-tight", className)}>
      <Logo size={28} />
      <span>
        Block<span className="text-scheme-accent">SAT</span>
      </span>
    </div>
  );
}
