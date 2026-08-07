"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";

interface Analytics {
  totalUsers: number;
  totalQuestions: number;
  totalGames: number;
  totalResponses: number;
  overallAccuracy: number;
  questionsBySubject: { subject: string; _count: number }[];
  questionsByDifficulty: { difficulty: string; _count: number }[];
  topPlayers: { username: string; highestScore: number; xp: number; level: number }[];
  recentGames: { id: string; username: string; score: number; linesCleared: number; startedAt: string }[];
}

function useAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async (): Promise<Analytics> => {
      const res = await fetch("/api/admin/analytics");
      return res.json();
    },
  });
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-white/60">{label}</p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data } = useAnalytics();

  return (
    <AdminShell>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Total Users" value={data?.totalUsers ?? "—"} />
        <Stat label="Total Questions" value={data?.totalQuestions ?? "—"} />
        <Stat label="Games Completed" value={data?.totalGames ?? "—"} />
        <Stat label="Questions Answered" value={data?.totalResponses ?? "—"} />
        <Stat label="Overall Accuracy" value={data ? `${data.overallAccuracy}%` : "—"} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Top Players</h2>
          <div className="flex flex-col gap-2">
            {data?.topPlayers.map((p, i) => (
              <div key={p.username} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span>#{i + 1} {p.username}</span>
                <span className="text-scheme-accent">{p.highestScore.toLocaleString()} pts · Lvl {p.level}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Recent Games</h2>
          <div className="flex flex-col gap-2">
            {data?.recentGames.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span>{g.username}</span>
                <span className="text-white/60">{g.score.toLocaleString()} pts / {g.linesCleared} lines</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
