"use client";

import { AppShell } from "@/components/shared/AppShell";
import { useProfile } from "@/hooks/useProfile";
import { useRecentGames } from "@/hooks/useRecentGames";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { levelFromXp } from "@/lib/game/leveling";
import { ACHIEVEMENT_DEFS } from "@/lib/game/achievements";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Target, Gamepad2, BookOpen, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function useUnlockedAchievements() {
  return useQuery({
    queryKey: ["my-achievements"],
    queryFn: async (): Promise<string[]> => {
      const res = await fetch("/api/profile/achievements");
      if (!res.ok) return [];
      const data = await res.json();
      return data.slugs;
    },
  });
}

export default function ProfilePage() {
  const { data: profile } = useProfile();
  const { data: recentGames } = useRecentGames();
  const { data: unlockedSlugs } = useUnlockedAchievements();

  if (!profile) return <AppShell><div /></AppShell>;

  const { xpIntoLevel, xpForNext } = levelFromXp(profile.xp);
  const accuracy = profile.questionsAnswered > 0 ? Math.round((profile.correctAnswers / profile.questionsAnswered) * 100) : 0;
  const readingAcc = profile.readingAnswered > 0 ? Math.round((profile.readingCorrect / profile.readingAnswered) * 100) : 0;
  const mathAcc = profile.mathAnswered > 0 ? Math.round((profile.mathCorrect / profile.mathAnswered) * 100) : 0;
  const favoriteSubject = profile.readingAnswered >= profile.mathAnswered ? "Reading" : "Math";

  return (
    <AppShell>
      <div className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Avatar className="h-20 w-20 border-4 border-white/20">
          <AvatarFallback className="bg-gradient-to-br from-amber-300 to-neutral-500 text-2xl text-white">
            {profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          <p className="text-white/60">Level {profile.level} · Favorite subject: {favoriteSubject}</p>
        </div>
      </div>

      <div className="mb-6 glass-card rounded-2xl p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold">XP Progress</span>
          <span className="text-sm text-white/60">{xpIntoLevel} / {xpForNext}</span>
        </div>
        <Progress value={(xpIntoLevel / xpForNext) * 100} className="h-3" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 text-center">
          <Trophy className="mx-auto mb-2 h-6 w-6 text-scheme-accent" />
          <p className="text-xl font-bold">{profile.highestScore.toLocaleString()}</p>
          <p className="text-xs text-white/50">Highest Score</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <Gamepad2 className="mx-auto mb-2 h-6 w-6 text-purple-300" />
          <p className="text-xl font-bold">{profile.gamesPlayed}</p>
          <p className="text-xs text-white/50">Games Played</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <Target className="mx-auto mb-2 h-6 w-6 text-emerald-300" />
          <p className="text-xl font-bold">{accuracy}%</p>
          <p className="text-xs text-white/50">Overall Accuracy</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center">
          <BookOpen className="mx-auto mb-2 h-6 w-6 text-pink-300" />
          <p className="text-xl font-bold">{readingAcc}% / {mathAcc}%</p>
          <p className="text-xs text-white/50">Reading / Math Acc.</p>
        </div>
      </div>

      <div className="mb-6 glass-card rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">Achievements</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ACHIEVEMENT_DEFS.map((a) => {
            const unlocked = unlockedSlugs?.includes(a.slug);
            return (
              <div
                key={a.slug}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-3 text-center",
                  unlocked ? "border-scheme-accent/40 bg-scheme-accent-10" : "border-white/10 bg-white/5 opacity-50"
                )}
              >
                {unlocked ? <Trophy className="h-6 w-6 text-scheme-accent" /> : <Lock className="h-6 w-6 text-white/40" />}
                <p className="text-xs font-medium">{a.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 font-semibold">Recent Activity</h2>
        <div className="flex flex-col gap-2">
          {recentGames?.map((g) => (
            <div key={g.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
              <span className="text-white/60">{new Date(g.startedAt).toLocaleString()}</span>
              <span className="font-semibold text-scheme-accent">{g.score.toLocaleString()} pts</span>
            </div>
          ))}
          {recentGames?.length === 0 && <p className="text-sm text-white/50">No recent games yet.</p>}
        </div>
      </div>
    </AppShell>
  );
}
