"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";

interface AdminDailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  metric: string;
  target: number;
  xpReward: number;
  participants: number;
  completions: number;
}

export default function AdminDailyChallengesPage() {
  const { data } = useQuery({
    queryKey: ["admin-daily-challenges"],
    queryFn: async (): Promise<{ challenges: AdminDailyChallenge[] }> => {
      const res = await fetch("/api/admin/daily-challenges");
      return res.json();
    },
  });

  return (
    <AdminShell>
      <p className="mb-4 text-sm text-white/60">
        Daily challenges are generated deterministically each day from templates in{" "}
        <code className="rounded bg-white/10 px-1">lib/game/dailyChallenges.ts</code>, so every player sees the same
        three challenges. This view shows participation and completion for recent days.
      </p>
      <div className="flex flex-col gap-3">
        {data?.challenges?.map((c: AdminDailyChallenge) => (
          <div key={c.id} className="glass-card flex items-center justify-between rounded-2xl p-5">
            <div>
              <p className="font-semibold">{c.title} — {new Date(c.date).toLocaleDateString()}</p>
              <p className="text-sm text-white/60">{c.description}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-scheme-accent">+{c.xpReward} XP</p>
              <p className="text-white/50">{c.completions}/{c.participants} completed</p>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
