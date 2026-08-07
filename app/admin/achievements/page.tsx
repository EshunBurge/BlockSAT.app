"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";

interface AdminAchievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedCount: number;
}

export default function AdminAchievementsPage() {
  const { data } = useQuery({
    queryKey: ["admin-achievements"],
    queryFn: async (): Promise<{ achievements: AdminAchievement[] }> => {
      const res = await fetch("/api/admin/achievements");
      return res.json();
    },
  });

  return (
    <AdminShell>
      <p className="mb-4 text-sm text-white/60">
        Achievement definitions are managed in code (<code className="rounded bg-white/10 px-1">lib/game/achievements.ts</code>) to keep
        unlock logic type-safe; this view shows live unlock counts for each.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.achievements?.map((a: AdminAchievement) => (
          <div key={a.id} className="glass-card rounded-2xl p-5">
            <p className="font-semibold">{a.name}</p>
            <p className="mb-2 text-sm text-white/60">{a.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-scheme-accent">+{a.xpReward} XP</span>
              <span className="text-white/50">{a.unlockedCount} unlocked</span>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
