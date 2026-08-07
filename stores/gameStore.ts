import { create } from "zustand";
import { PieceInstance } from "@/types";
import {
  Board,
  createEmptyBoard,
  canPlace,
  canPlaceAnywhere,
  placeShape,
  clearLines,
  computePlacementScore,
  computeClearScore,
} from "@/lib/game/board";
import { randomShape, randomColor } from "@/lib/game/pieces";

function makePiece(): PieceInstance {
  return {
    id: crypto.randomUUID(),
    shape: randomShape(),
    color: randomColor(),
  };
}

function makePieceSet(): PieceInstance[] {
  return [makePiece(), makePiece(), makePiece()];
}

export interface FloatingScorePopup {
  id: string;
  amount: number;
  x: number;
  y: number;
}

interface GameState {
  board: Board;
  pieces: PieceInstance[];
  score: number;
  linesCleared: number;
  comboStreak: number;
  longestCombo: number;
  gameOver: boolean;
  questionsAnswered: number;
  questionsCorrect: number;
  correctStreak: number;
  longestCorrectStreak: number;
  lastClearedLines: { rows: number[]; cols: number[] } | null;
  popups: FloatingScorePopup[];
  /** True whenever the player has no pieces left and needs to answer a question to get three more. */
  awaitingReward: boolean;

  initGame: () => void;
  resolveQuestion: (correct: boolean) => void;
  placePiece: (pieceId: string, row: number, col: number) => boolean;
  dismissPopup: (id: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  board: createEmptyBoard(),
  pieces: [],
  score: 0,
  linesCleared: 0,
  comboStreak: 0,
  longestCombo: 0,
  gameOver: false,
  questionsAnswered: 0,
  questionsCorrect: 0,
  correctStreak: 0,
  longestCorrectStreak: 0,
  lastClearedLines: null,
  popups: [],
  awaitingReward: true,

  initGame: () =>
    set({
      board: createEmptyBoard(),
      pieces: [],
      score: 0,
      linesCleared: 0,
      comboStreak: 0,
      longestCombo: 0,
      gameOver: false,
      questionsAnswered: 0,
      questionsCorrect: 0,
      correctStreak: 0,
      longestCorrectStreak: 0,
      lastClearedLines: null,
      popups: [],
      awaitingReward: true,
    }),

  // Answering correctly grants a fresh set of three pieces. Answering
  // incorrectly leaves the player with none, so the question prompt stays
  // open (a new question is fetched) until they get one right.
  resolveQuestion: (correct) => {
    const { correctStreak, longestCorrectStreak, board } = get();
    const questionsAnswered = get().questionsAnswered + 1;
    const questionsCorrect = get().questionsCorrect + (correct ? 1 : 0);
    const nextStreak = correct ? correctStreak + 1 : 0;

    if (!correct) {
      set({
        questionsAnswered,
        questionsCorrect,
        correctStreak: 0,
        longestCorrectStreak,
      });
      return;
    }

    const nextPieces = makePieceSet();
    const stillPlayable = nextPieces.some((p) => canPlaceAnywhere(board, p.shape));

    set({
      pieces: nextPieces,
      questionsAnswered,
      questionsCorrect,
      correctStreak: nextStreak,
      longestCorrectStreak: Math.max(longestCorrectStreak, nextStreak),
      awaitingReward: false,
      gameOver: !stillPlayable,
    });
  },

  placePiece: (pieceId, row, col) => {
    const state = get();
    const piece = state.pieces.find((p) => p.id === pieceId);
    if (!piece) return false;
    if (!canPlace(state.board, piece.shape, row, col)) return false;

    const cellsPlaced = piece.shape.flat().filter(Boolean).length;
    let board = placeShape(state.board, piece.shape, row, col, piece.color);
    const placementScore = computePlacementScore(cellsPlaced);

    const clearResult = clearLines(board);
    board = clearResult.board;

    const comboStreak = clearResult.totalLines > 0 ? state.comboStreak + 1 : 0;
    const clearScore = computeClearScore(clearResult.totalLines, comboStreak);
    const longestCombo = Math.max(state.longestCombo, comboStreak);

    const nextPieces = state.pieces.filter((p) => p.id !== pieceId);

    const popups: FloatingScorePopup[] = [...state.popups];
    if (placementScore > 0) {
      popups.push({ id: crypto.randomUUID(), amount: placementScore, x: 50, y: 50 });
    }
    if (clearScore > 0) {
      popups.push({ id: crypto.randomUUID(), amount: clearScore, x: 50, y: 35 });
    }

    // Ran out of pieces: time to answer another question for three more,
    // rather than game over.
    const awaitingReward = nextPieces.length === 0;
    const gameOver = !awaitingReward && nextPieces.every((p) => !canPlaceAnywhere(board, p.shape));

    set({
      board,
      pieces: nextPieces,
      score: state.score + placementScore + clearScore,
      linesCleared: state.linesCleared + clearResult.totalLines,
      comboStreak,
      longestCombo,
      lastClearedLines:
        clearResult.totalLines > 0 ? { rows: clearResult.rowsCleared, cols: clearResult.colsCleared } : null,
      popups,
      awaitingReward,
      gameOver,
    });
    return true;
  },

  dismissPopup: (id) => set((s) => ({ popups: s.popups.filter((p) => p.id !== id) })),
}));
