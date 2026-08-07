"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/AppShell";
import { GameBoard } from "@/components/game/GameBoard";
import { PieceTray } from "@/components/game/PieceTray";
import { DragGhost } from "@/components/game/DragGhost";
import { FloatingScorePopups } from "@/components/game/FloatingScorePopups";
import { GameOverModal } from "@/components/game/GameOverModal";
import { QuestionModal } from "@/components/questions/QuestionModal";
import { useGameStore } from "@/stores/gameStore";
import { useProfile } from "@/hooks/useProfile";
import { canPlace, BOARD_SIZE } from "@/lib/game/board";
import { useSound } from "@/hooks/useSound";
import { Trophy, Flame, Layers } from "lucide-react";

interface DragState {
  pieceId: string;
  x: number;
  y: number;
  shape: boolean[][];
  color: string;
}

export default function PlayPage() {
  const { data: profile } = useProfile();
  const {
    board,
    pieces,
    score,
    linesCleared,
    comboStreak,
    longestCombo,
    gameOver,
    correctStreak,
    questionsAnswered,
    questionsCorrect,
    popups,
    awaitingReward,
    initGame,
    resolveQuestion,
    placePiece,
    dismissPopup,
  } = useGameStore();

  const { play } = useSound(profile?.soundEnabled ?? true, profile?.musicEnabled ?? false);

  const boardRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [preview, setPreview] = useState<{ row: number; col: number; valid: boolean }[] | null>(null);
  // Anchor is only ever read from pointer-event handlers (never during
  // render), so a ref is appropriate here and doesn't need to trigger
  // re-renders on every pointermove.
  const previewAnchorRef = useRef<{ row: number; col: number; validAll: boolean } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [gameEnded, setGameEnded] = useState<{ xpEarned: number; newAchievements: { name: string }[] } | null>(null);
  const [cellSize, setCellSize] = useState(48);

  useEffect(() => {
    initGame();
    fetch("/api/game/start", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setSessionId(d.sessionId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const updateSize = () => setCellSize(el.clientWidth / BOARD_SIZE);
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const updatePreview = useCallback(
    (clientX: number, clientY: number, piece: { shape: boolean[][]; color: string }) => {
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const cs = rect.width / BOARD_SIZE;
      const rows = piece.shape.length;
      const cols = piece.shape[0]?.length ?? 0;
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const anchorCol = Math.round(localX / cs - cols / 2);
      const anchorRow = Math.round(localY / cs - rows / 2);

      const cells: { row: number; col: number; valid: boolean }[] = [];
      const valid = canPlace(board, piece.shape, anchorRow, anchorCol);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (!piece.shape[r][c]) continue;
          const br = anchorRow + r;
          const bc = anchorCol + c;
          if (br < 0 || br >= BOARD_SIZE || bc < 0 || bc >= BOARD_SIZE) continue;
          cells.push({ row: br, col: bc, valid });
        }
      }
      setPreview(cells);
      previewAnchorRef.current = { row: anchorRow, col: anchorCol, validAll: valid };
    },
    [board]
  );

  useEffect(() => {
    if (!drag) return;
    const handleMove = (e: PointerEvent) => {
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      updatePreview(e.clientX, e.clientY, { shape: drag.shape, color: drag.color });
    };
    const handleUp = () => {
      const anchor = previewAnchorRef.current;
      if (anchor?.validAll) {
        const success = placePiece(drag.pieceId, anchor.row, anchor.col);
        if (success) play("placePiece");
      }
      previewAnchorRef.current = null;
      setDrag(null);
      setPreview(null);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [drag, placePiece, play, updatePreview]);

  // Sound + toast feedback on line clears / combos (watch score deltas via linesCleared/comboStreak changes)
  const prevLinesCleared = useRef(linesCleared);
  useEffect(() => {
    if (linesCleared > prevLinesCleared.current) {
      if (comboStreak > 1) {
        play("combo", comboStreak);
        toast.success(`Combo x${comboStreak}!`, { duration: 1200 });
      } else {
        play("lineClear");
      }
      if (comboStreak >= 3) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    }
    prevLinesCleared.current = linesCleared;
  }, [linesCleared, comboStreak, play]);

  useEffect(() => {
    if (gameOver && sessionId && !gameEnded) {
      play("gameOver");
      fetch(`/api/game/${sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          linesCleared,
          longestCombo,
          questionsCorrect,
          questionsTotal: questionsAnswered,
          durationMs: 0,
          sessionCorrectStreak: correctStreak,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          setGameEnded({ xpEarned: data.xpEarned ?? 0, newAchievements: data.newAchievements ?? [] });
          if (data.newAchievements?.length) {
            play("achievement");
            confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
          }
          if (data.leveledUp) {
            play("levelUp");
            toast.success(`Level up! You're now level ${data.newLevel}`, { duration: 2500 });
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, sessionId]);

  const handleDragStart = (pieceId: string, e: React.PointerEvent) => {
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece) return;
    setDrag({ pieceId, x: e.clientX, y: e.clientY, shape: piece.shape, color: piece.color });
  };

  const handleQuestionResolved = (result: { correct: boolean; leveledUp: boolean; newLevel: number }) => {
    resolveQuestion(result.correct);
    setQuestionCount((n) => n + 1);
    if (result.correct) {
      play("correct");
      toast.success("Correct! Here are your 3 pieces.", { duration: 1800 });
    } else {
      play("incorrect");
    }
    if (result.leveledUp) {
      play("levelUp");
      toast.success(`Level up! You're now level ${result.newLevel}`, { duration: 2500 });
    }
  };

  const handlePlayAgain = () => {
    setGameEnded(null);
    setQuestionCount(0);
    initGame();
    fetch("/api/game/start", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setSessionId(d.sessionId));
  };

  if (!profile) return <AppShell><div /></AppShell>;

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <div className="grid w-full grid-cols-3 gap-3">
          <div className="glass-card flex items-center gap-2 rounded-xl px-4 py-2.5">
            <Trophy className="h-5 w-5 text-orange-300" />
            <div><p className="text-lg font-bold leading-none">{score.toLocaleString()}</p><p className="text-xs text-white/50">Score</p></div>
          </div>
          <div className="glass-card flex items-center gap-2 rounded-xl px-4 py-2.5">
            <Layers className="h-5 w-5 text-purple-300" />
            <div><p className="text-lg font-bold leading-none">{linesCleared}</p><p className="text-xs text-white/50">Lines</p></div>
          </div>
          <div className="glass-card flex items-center gap-2 rounded-xl px-4 py-2.5">
            <Flame className="h-5 w-5 text-pink-300" />
            <div><p className="text-lg font-bold leading-none">x{comboStreak}</p><p className="text-xs text-white/50">Combo</p></div>
          </div>
        </div>

        <div className="relative w-full">
          <GameBoard ref={boardRef} board={board} previewCells={preview} clearingCells={null} />
          <FloatingScorePopups popups={popups} onDone={dismissPopup} />
        </div>

        <PieceTray pieces={pieces} draggingPieceId={drag?.pieceId ?? null} onDragStart={handleDragStart} />

        {!awaitingReward && (
          <p className="text-center text-xs text-white/40">
            Place all 3 pieces to earn another question and 3 more.
          </p>
        )}
      </div>

      {drag && (
        <DragGhost shape={drag.shape} color={drag.color} x={drag.x} y={drag.y} cellSize={cellSize} />
      )}

      <QuestionModal
        key={questionCount}
        open={awaitingReward && !gameOver}
        practiceFocus={profile.practiceFocus}
        difficulty={profile.difficulty}
        questionNumber={questionCount + 1}
        onResolved={handleQuestionResolved}
      />

      <GameOverModal
        open={gameOver && !!gameEnded}
        score={score}
        linesCleared={linesCleared}
        longestCombo={longestCombo}
        xpEarned={gameEnded?.xpEarned ?? 0}
        isNewHighScore={score > profile.highestScore}
        newAchievements={gameEnded?.newAchievements ?? []}
        onPlayAgain={handlePlayAgain}
      />
    </AppShell>
  );
}
