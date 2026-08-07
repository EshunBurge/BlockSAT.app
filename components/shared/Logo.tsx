import { cn } from "@/lib/utils";

/** The official BlockSAT icon mark — the gold squircle from the logo. */
export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-icon.png"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      style={{ height: size, width: "auto" }}
      aria-hidden="true"
    />
  );
}

/** The full BlockSAT wordmark (icon + "BLOCKSAT" text) exactly as designed in the brand logo. */
export function LogoWordmark({ className, height = 28 }: { className?: string; height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="BlockSAT"
      className={cn("shrink-0 object-contain", className)}
      style={{ height }}
    />
  );
}
