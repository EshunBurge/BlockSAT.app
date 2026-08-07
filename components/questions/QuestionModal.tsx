"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useFetchQuestion, useSubmitAnswer, AnswerResult } from "@/hooks/useQuestion";
import { PracticeFocus, Difficulty, Subject } from "@/types";
import { CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionModalProps {
  open: boolean;
  practiceFocus: PracticeFocus;
  difficulty: Difficulty;
  questionNumber: number;
  onResolved: (result: AnswerResult) => void;
  /** Lets the player back out of the question without answering it. */
  onExit: () => void;
}

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  EASY: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  HARD: "bg-red-500/20 text-red-300 border-red-500/30",
};

function pickSubject(focus: PracticeFocus): Subject | undefined {
  if (focus === "BOTH") return Math.random() > 0.5 ? "READING" : "MATH";
  return focus;
}

export function QuestionModal({ open, practiceFocus, difficulty, questionNumber, onResolved, onExit }: QuestionModalProps) {
  const fetchQuestion = useFetchQuestion();
  const submitAnswer = useSubmitAnswer();
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitAnswer.mutateAsync>> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // NOTE: this component is remounted (via a `key` prop keyed on the
    // question number) every time a new question is needed, so `selected`/
    // `result` are already fresh here — no manual reset required. This
    // effect only needs to kick off the fetch for the freshly-mounted
    // question attempt.
    if (open) {
      fetchQuestion.mutate(
        { subject: pickSubject(practiceFocus), difficulty },
        { onSuccess: () => (startTimeRef.current = Date.now()) }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const question = fetchQuestion.data;

  const handleSelect = (choice: "A" | "B" | "C" | "D") => {
    if (selected || !question) return;
    setSelected(choice);
    // Date.now() is read here only in response to a user click (an event
    // handler), never during render, so this is safe despite being impure.
    // eslint-disable-next-line react-hooks/purity
    const responseMs = Date.now() - startTimeRef.current;
    submitAnswer.mutate(
      { questionId: question.id, selected: choice, responseMs },
      { onSuccess: (data) => setResult(data) }
    );
  };

  const choices: { key: "A" | "B" | "C" | "D"; text: string }[] = question
    ? [
        { key: "A", text: question.choiceA },
        { key: "B", text: question.choiceB },
        { key: "C", text: question.choiceC },
        { key: "D", text: question.choiceD },
      ]
    : [];

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="max-w-xl border-white/10 bg-[var(--scheme-app-c)] text-white sm:max-w-xl">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onExit}
          aria-label="Exit question"
          className="absolute top-3 right-3 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
        {fetchQuestion.isPending || !question ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/60">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading your next question...</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                  {question.subject === "READING" ? "Reading" : "Math"}
                </Badge>
                <Badge variant="outline" className={cn("border", DIFFICULTY_COLOR[question.difficulty])}>
                  {question.difficulty[0] + question.difficulty.slice(1).toLowerCase()}
                </Badge>
              </div>
              <span className="text-xs text-white/50">Question #{questionNumber}</span>
            </div>

            {question.passage && (
              <div className="mb-4 max-h-40 overflow-y-auto rounded-lg bg-white/5 p-4 text-sm leading-relaxed text-white/80">
                {question.passage}
              </div>
            )}

            <p className="mb-4 text-lg font-medium leading-snug">{question.prompt}</p>

            <div className="flex flex-col gap-2.5">
              {choices.map((choice) => {
                const isSelected = selected === choice.key;
                const isCorrectChoice = result && choice.key === result.correctAnswer;
                const showCorrect = result && isCorrectChoice;
                const showIncorrect = result && isSelected && !result.correct;

                return (
                  <motion.button
                    key={choice.key}
                    whileTap={!selected ? { scale: 0.98 } : undefined}
                    disabled={!!selected}
                    onClick={() => handleSelect(choice.key)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                      !selected && "border-white/15 bg-white/5 hover:border-scheme-accent/60 hover:bg-white/10",
                      selected && !showCorrect && !showIncorrect && "border-white/10 bg-white/5 opacity-50",
                      showCorrect && "border-emerald-400 bg-emerald-400/15",
                      showIncorrect && "border-red-400 bg-red-400/15"
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-xs font-semibold">
                      {choice.key}
                    </span>
                    <span className="flex-1">{choice.text}</span>
                    {showCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
                    {showIncorrect && <XCircle className="h-5 w-5 shrink-0 text-red-400" />}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div
                    className={cn(
                      "rounded-xl border p-4 text-sm",
                      result.correct ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/15 bg-white/5"
                    )}
                  >
                    <p className="mb-1 font-semibold">{result.correct ? `Correct! +${result.xpEarned} XP` : "Not quite — here's why:"}</p>
                    <p className="text-white/70">{result.explanation}</p>
                  </div>
                  <Button
                    onClick={() => onResolved(result)}
                    className="mt-4 w-full btn-brand btn-glow hover:opacity-90"
                  >
                    {result.correct ? "Get my 3 pieces" : "Try another question"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
