import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoWordmark } from "@/components/shared/Logo";
import { BookOpen, Sigma, Trophy, Flame, Sparkles, Blocks } from "lucide-react";

const FEATURES = [
  {
    icon: Blocks,
    title: "Original block-stacking gameplay",
    description: "An 8x8 board, three pieces at a time, satisfying line clears and combo chains — premium puzzle mechanics from the ground up.",
  },
  {
    icon: BookOpen,
    title: "Answer to earn pieces",
    description: "Answer an SAT-style question correctly to earn a fresh set of 3 pieces. Get it wrong, see the explanation, and try again. Studying is the progression.",
  },
  {
    icon: Sigma,
    title: "Reading & Math, every topic",
    description: "Main idea, inference, evidence, vocabulary, algebra, geometry, data analysis, statistics, and more — thousands of original practice questions.",
  },
  {
    icon: Trophy,
    title: "Leaderboards & achievements",
    description: "Climb weekly, monthly, and all-time leaderboards by score, XP, streak, or accuracy. Unlock badges as you improve.",
  },
  {
    icon: Flame,
    title: "Daily challenges & streaks",
    description: "Fresh goals every day keep your study streak alive and reward consistent practice with bonus XP.",
  },
  {
    icon: Sparkles,
    title: "Level up & unlock rewards",
    description: "Earn XP from correct answers, line clears, and combos to unlock new board themes, piece skins, and avatars.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1 bg-blocksat-hero text-white">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <LogoWordmark height={28} />
        <nav className="flex items-center gap-2">
          <Button render={<Link href="/login" />} variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            Log in
          </Button>
          <Button render={<Link href="/signup" />} className="btn-brand text-white btn-glow hover:opacity-90">
            Sign up free
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pt-16 pb-20 text-center md:pt-24">
          <span className="rounded-full glass-card px-4 py-1.5 text-sm font-medium text-scheme-accent">
            Study meets Block Blast
          </span>
          <h1 className="text-glow max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Answer questions. Unlock pieces. <span className="text-scheme-accent">Stack your way to a better score.</span>
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            BlockSAT turns SAT prep into an addictive puzzle game. Answer a question correctly to earn 3 pieces,
            then clear rows, chain combos, and climb the leaderboard while you study.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button render={<Link href="/signup" />} size="lg" className="btn-brand text-white btn-glow hover:opacity-90">
              Start playing free
            </Button>
            <Button render={<Link href="/login" />} size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white">
              I already have an account
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 pb-24 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-6">
              <f.icon className="mb-3 h-8 w-8 text-scheme-accent" />
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-white/70">{f.description}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 text-sm text-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span>© {new Date().getFullYear()} BlockSAT. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/legal/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/legal/privacy" className="hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
