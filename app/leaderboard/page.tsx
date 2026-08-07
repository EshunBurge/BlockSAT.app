"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const METRICS = [
  { key: "score", label: "Highest Score" },
  { key: "xp", label: "XP" },
  { key: "streak", label: "Streak" },
  { key: "accuracy", label: "Accuracy" },
];
const PERIODS = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "all", label: "All-Time" },
];

function formatValue(metric: string, value: number) {
  if (metric === "accuracy") return `${value}%`;
  return value.toLocaleString();
}

export default function LeaderboardPage() {
  const [metric, setMetric] = useState("score");
  const [period, setPeriod] = useState("all");
  const { data: entries, isLoading } = useLeaderboard(metric, period);

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">Leaderboard</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={metric} onValueChange={setMetric}>
          <TabsList className="bg-white/10">
            {METRICS.map((m) => (
              <TabsTrigger key={m.key} value={m.key} className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60">
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="bg-white/10">
            {PERIODS.map((p) => (
              <TabsTrigger key={p.key} value={p.key} className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="glass-card rounded-2xl p-4">
        {isLoading && <p className="p-4 text-center text-white/50">Loading leaderboard...</p>}
        {!isLoading && entries?.length === 0 && <p className="p-4 text-center text-white/50">No entries yet — be the first!</p>}
        <div className="flex flex-col divide-y divide-white/10">
          {entries?.map((entry, i) => (
            <div key={entry.id} className="flex items-center gap-3 px-2 py-3">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold",
                  i === 0 && "bg-scheme-rank-1 text-black",
                  i === 1 && "bg-scheme-rank-2 text-black",
                  i === 2 && "bg-scheme-rank-3 text-white",
                  i > 2 && "bg-white/10 text-white/60 text-sm"
                )}
              >
                {i < 3 ? <Trophy className="h-4 w-4" /> : i + 1}
              </span>
              <Avatar className="h-8 w-8">
                {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt={entry.username} />}
                <AvatarFallback className="bg-scheme-gradient text-xs text-white">
                  {entry.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 font-medium">{entry.username}</span>
              <span className="font-bold text-scheme-accent">{formatValue(metric, entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
