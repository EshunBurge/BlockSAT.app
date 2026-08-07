"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoWordmark } from "@/components/shared/Logo";
import { useProfile } from "@/hooks/useProfile";
import { useLogOut } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Gamepad2, Trophy, User, Settings, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/play", label: "Play", icon: Gamepad2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const logOut = useLogOut();

  useEffect(() => {
    if (isLoading) return;
    if (!profile) {
      router.replace("/login");
    } else if (!profile.onboardingDone) {
      router.replace("/onboarding");
    }
  }, [isLoading, profile, router]);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-blocksat-app text-white/60">
        Loading...
      </div>
    );
  }

  return (
    <div data-theme={profile.activeTheme} className="flex min-h-screen flex-1 flex-col bg-blocksat-app text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link href="/dashboard"><LogoWordmark className="text-lg" /></Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
                  pathname === item.href ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1.5 pr-3 hover:bg-white/15">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-purple-500 text-xs text-white">
                  {profile?.username?.slice(0, 2).toUpperCase() ?? "??"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{profile?.username ?? "..."}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem render={<Link href="/profile" />}><User className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings" />}><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
              {profile?.role === "ADMIN" && (
                <DropdownMenuItem render={<Link href="/admin" />}><Shield className="mr-2 h-4 w-4" />Admin</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logOut.mutate()} className="text-red-400 focus:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                pathname === item.href ? "bg-white/15 text-white" : "text-white/60"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
