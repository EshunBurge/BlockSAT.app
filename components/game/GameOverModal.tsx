"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, Flame, RotateCcw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface GameOverModalProps {
  open: boolean;
  score: number;
  linesCleared: number;
  longestCombo: number;
  xpEarned: number;
  isNewHighScore: boolean;
  newAchievements: { name: string }[];
  onPlayAgain: () => void;
}

export function GameOverModal({ open, score, linesCleared, longestCombo, xpEarned, isNewHighScore, newAchievements, onPlayAgain }: GameOverModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="max-w-md border-white/10 bg-[var(--scheme-app-c)] text-center text-white">
        <Trophy className="mx-auto mb-2 h-12 w-12 text-scheme-accent" />
        <h2 className="mb-1 text-2xl font-bold">Game Over</h2>
        {isNewHighScore && <p className="mb-3 text-sm font-medium text-scheme-accent">New personal best!</p>}

        <div className="my-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-bold">{score.toLocaleString()}</p>
            <p className="text-white/50">Score</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-bold">{linesCleared}</p>
            <p className="text-white/50">Lines</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xl font-bold">{longestCombo}</p>
            <p className="text-white/50">Best Combo</p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2 text-sm text-scheme-accent">
          <Sparkles className="h-4 w-4" />+{xpEarned} XP earned
        </div>

        {newAchievements.length > 0 && (
          <div className="mb-4 rounded-xl border border-scheme-accent/30 bg-scheme-accent-10 p-3 text-sm">
            <p className="mb-1 flex items-center justify-center gap-1 font-medium"><Flame className="h-4 w-4" />Achievement unlocked!</p>
            {newAchievements.map((a) => (
              <p key={a.name} className="text-white/70">{a.name}</p>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button render={<Link href="/dashboard" />} variant="outline" className="flex-1 border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white">
            <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard
          </Button>
          <Button onClick={onPlayAgain} className="flex-1 btn-brand btn-glow hover:opacity-90">
            <RotateCcw className="mr-2 h-4 w-4" />Play again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
