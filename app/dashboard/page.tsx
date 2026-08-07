"use client";

import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { useProfile } from "@/hooks/useProfile";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useRecentGames } from "@/hooks/useRecentGames";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { levelFromXp } from "@/lib/game/leveling";
import { Play, Trophy, Flame, Target, Sparkles, Gamepad2, type LucideIcon } from "lucide-react";

function StatTile({ icon: Icon, label, value, accent }: { icon: LucideIcon; label: string; value: string; accent: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: profile } = useProfile();
  const { data: challenges } = useDailyChallenges();
  const { data: recentGames } = useRecentGames();

  if (!profile) return <AppShell><div /></AppShell>;

  const { xpIntoLevel, xpForNext } = levelFromXp(profile.xp);
  const accuracy = profile.questionsAnswered > 0 ? Math.round((profile.correctAnswers / profile.questionsAnswered) * 100) : 0;

  return (
    <AppShell>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile.username}</h1>
          <p className="text-white/60">Ready to unlock some pieces?</p>
        </div>
        <Button render={<Link href="/play" />} size="lg" className="btn-brand btn-glow hover:opacity-90">
          <Play className="mr-2 h-5 w-5" />Continue Playing
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile icon={Trophy} label="Highest Score" value={profile.highestScore.toLocaleString()} accent="bg-scheme-gradient" />
        <StatTile icon={Sparkles} label="Current XP" value={profile.xp.toLocaleString()} accent="bg-scheme-gradient" />
        <StatTile icon={Flame} label="Weekly Streak" value={`${profile.streak} day${profile.streak === 1 ? "" : "s"}`} accent="bg-scheme-gradient" />
        <StatTile icon={Target} label="Accuracy" value={`${accuracy}%`} accent="bg-scheme-gradient" />
      </div>

      <div className="mb-6 glass-card rounded-2xl p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold">Level {profile.level}</span>
          <span className="text-sm text-white/60">{xpIntoLevel} / {xpForNext} XP</span>
        </div>
        <Progress value={(xpIntoLevel / xpForNext) * 100} className="h-3" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><Flame className="h-5 w-5 text-scheme-accent" />Daily Challenges</h2>
          <div className="flex flex-col gap-4">
            {challenges?.map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{c.title}</span>
                  <span className="text-white/60">{Math.min(c.progress, c.target)}/{c.target}</span>
                </div>
                <p className="mb-1.5 text-xs text-white/50">{c.description}</p>
                <Progress value={(Math.min(c.progress, c.target) / c.target) * 100} className="h-2" />
              </div>
            ))}
            {!challenges?.length && <p className="text-sm text-white/50">Loading today&apos;s challenges...</p>}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold"><Gamepad2 className="h-5 w-5 text-scheme-accent" />Recent Games</h2>
          <div className="flex flex-col gap-3">
            {recentGames?.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span>{new Date(g.startedAt).toLocaleDateString()}</span>
                <span className="font-semibold text-scheme-accent">{g.score.toLocaleString()} pts</span>
                <span className="text-white/50">{g.linesCleared} lines</span>
              </div>
            ))}
            {recentGames?.length === 0 && <p className="text-sm text-white/50">No games yet — start your first one!</p>}
            {!recentGames && <p className="text-sm text-white/50">Loading...</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
