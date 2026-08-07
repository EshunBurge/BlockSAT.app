"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PracticeFocus, Difficulty } from "@/types";
import { BookOpen, Sigma, Layers, Feather, Flame, Skull, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUS_OPTIONS: { value: PracticeFocus; label: string; description: string; icon: LucideIcon }[] = [
  { value: "READING", label: "Reading", description: "Main idea, inference, evidence, vocabulary, and more.", icon: BookOpen },
  { value: "MATH", label: "Math", description: "Algebra, geometry, functions, data analysis, and more.", icon: Sigma },
  { value: "BOTH", label: "Both", description: "A balanced mix of Reading and Math questions.", icon: Layers },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; description: string; icon: LucideIcon }[] = [
  { value: "EASY", label: "Easy", description: "Foundational questions to build confidence and core skills.", icon: Feather },
  { value: "MEDIUM", label: "Medium", description: "Test-like difficulty for steady, balanced practice.", icon: Flame },
  { value: "HARD", label: "Hard", description: "Challenging questions to sharpen your top-end score.", icon: Skull },
];

interface GameSetupCardProps {
  defaultFocus: PracticeFocus;
  defaultDifficulty: Difficulty;
  onStart: (focus: PracticeFocus, difficulty: Difficulty) => void;
}

export function GameSetupCard({ defaultFocus, defaultDifficulty, onStart }: GameSetupCardProps) {
  const [focus, setFocus] = useState<PracticeFocus>(defaultFocus);
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);

  return (
    <div className="mx-auto w-full max-w-xl glass-card rounded-2xl p-8">
      <h1 className="mb-1 text-2xl font-bold">What are we practicing?</h1>
      <p className="mb-6 text-sm text-white/70">Pick a focus and difficulty for this game — you&apos;ll choose again next time.</p>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-white/70">Practice focus</p>
        <div className="flex flex-col gap-2.5">
          {FOCUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFocus(opt.value)}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-3.5 text-left transition",
                focus === opt.value ? "border-scheme-accent bg-scheme-accent-10" : "border-white/15 hover:border-white/30"
              )}
            >
              <opt.icon className="h-5 w-5 shrink-0 text-scheme-accent" />
              <div>
                <p className="font-semibold">{opt.label}</p>
                <p className="text-sm text-white/70">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-white/70">Difficulty</p>
        <div className="flex flex-col gap-2.5">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDifficulty(opt.value)}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-3.5 text-left transition",
                difficulty === opt.value ? "border-scheme-accent bg-scheme-accent-10" : "border-white/15 hover:border-white/30"
              )}
            >
              <opt.icon className="h-5 w-5 shrink-0 text-scheme-accent" />
              <div>
                <p className="font-semibold">{opt.label}</p>
                <p className="text-sm text-white/70">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={() => onStart(focus, difficulty)} className="w-full btn-brand btn-glow hover:opacity-90">
        Start playing
      </Button>
    </div>
  );
}
