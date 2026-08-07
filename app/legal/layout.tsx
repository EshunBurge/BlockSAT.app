import Link from "next/link";
import { LogoWordmark } from "@/components/shared/Logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark flex flex-1 flex-col bg-blocksat-app text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <Link href="/">
          <LogoWordmark height={28} />
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">{children}</main>
    </div>
  );
}
