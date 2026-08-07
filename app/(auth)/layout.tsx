import Link from "next/link";
import { LogoWordmark } from "@/components/shared/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-blocksat-hero px-4 py-12 text-white">
      <Link href="/" className="mb-8">
        <LogoWordmark height={36} />
      </Link>
      <div className="w-full max-w-md glass-card rounded-2xl p-8">{children}</div>
    </div>
  );
}
