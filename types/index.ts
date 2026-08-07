export type PracticeFocus = "READING" | "MATH" | "BOTH";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type Subject = "READING" | "MATH";

export type ReadingTopic =
  | "MAIN_IDEA"
  | "VOCABULARY"
  | "INFERENCE"
  | "EVIDENCE"
  | "AUTHORS_PURPOSE"
  | "COMMAND_OF_EVIDENCE";

export type MathTopic =
  | "ALGEBRA"
  | "GEOMETRY"
  | "ADVANCED_MATH"
  | "FUNCTIONS"
  | "DATA_ANALYSIS"
  | "WORD_PROBLEMS"
  | "STATISTICS";

export interface QuestionDTO {
  id: string;
  subject: Subject;
  readingTopic: ReadingTopic | null;
  mathTopic: MathTopic | null;
  difficulty: Difficulty;
  prompt: string;
  passage: string | null;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correct: "A" | "B" | "C" | "D";
  explanation: string;
}

/** Block Blast piece shapes are represented as a grid of booleans. */
export type PieceShape = boolean[][];

export interface PieceInstance {
  id: string;
  shape: PieceShape;
  color: string;
}

export interface ProfileDTO {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  xp: number;
  level: number;
  highestScore: number;
  totalScore: number;
  gamesPlayed: number;
  streak: number;
  longestStreak: number;
  questionsAnswered: number;
  correctAnswers: number;
  readingAnswered: number;
  readingCorrect: number;
  mathAnswered: number;
  mathCorrect: number;
  avgResponseMs: number;
  longestCombo: number;
  totalLinesCleared: number;
  onboardingDone: boolean;
  practiceFocus: PracticeFocus;
  difficulty: Difficulty;
  soundEnabled: boolean;
  musicEnabled: boolean;
  activeTheme: string;
  activePieceSkin: string;
  activeAvatar: string;
  unlockedThemes: string;
  unlockedSkins: string;
  unlockedAvatars: string;
}
