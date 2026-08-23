/**
 * Live AI question generation, backed by Google's Gemini API (which offers
 * a genuinely free tier for the Flash models — no credit card required).
 *
 * This module is fully optional: if GEMINI_API_KEY isn't set in the
 * environment, or the API call fails/times out/returns something that
 * doesn't validate, every function here resolves to `null` rather than
 * throwing. The caller (see app/api/questions/random/route.ts) always
 * falls back to picking a question from the existing bank in that case, so
 * the game never breaks because of this integration — it only ever adds
 * fresh questions on top of what already works.
 *
 * Get a free key at https://aistudio.google.com/apikey and set it as
 * GEMINI_API_KEY in .env to turn this on.
 */
import { Difficulty, MathTopic, ReadingTopic, Subject } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 12000;

const READING_TOPICS: ReadingTopic[] = [
  "MAIN_IDEA",
  "VOCABULARY",
  "INFERENCE",
  "EVIDENCE",
  "AUTHORS_PURPOSE",
  "COMMAND_OF_EVIDENCE",
];

const MATH_TOPICS: MathTopic[] = [
  "ALGEBRA",
  "GEOMETRY",
  "ADVANCED_MATH",
  "FUNCTIONS",
  "DATA_ANALYSIS",
  "WORD_PROBLEMS",
  "STATISTICS",
];

export interface AIGeneratedQuestion {
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
  tags: string | null;
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string", enum: ["READING", "MATH"] },
    readingTopic: { type: "string", enum: [...READING_TOPICS, "NONE"] },
    mathTopic: { type: "string", enum: [...MATH_TOPICS, "NONE"] },
    difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] },
    prompt: { type: "string" },
    passage: { type: "string" },
    choiceA: { type: "string" },
    choiceB: { type: "string" },
    choiceC: { type: "string" },
    choiceD: { type: "string" },
    correct: { type: "string", enum: ["A", "B", "C", "D"] },
    explanation: { type: "string" },
    tags: { type: "string" },
  },
  required: [
    "subject",
    "readingTopic",
    "mathTopic",
    "difficulty",
    "prompt",
    "passage",
    "choiceA",
    "choiceB",
    "choiceC",
    "choiceD",
    "correct",
    "explanation",
    "tags",
  ],
};

function buildPrompt(subject?: Subject, difficulty?: Difficulty): string {
  const subjectLine = subject
    ? `The question must be about: ${subject === "READING" ? "Reading & Writing" : "Math"}.`
    : "Pick either Reading & Writing or Math, whichever you generate a better question for.";
  const difficultyLine = difficulty
    ? `The difficulty must be: ${difficulty}.`
    : "Pick a difficulty (EASY, MEDIUM, or HARD).";

  return `You are writing one original, brand-new SAT-style practice question for a study app called BlockSAT. Do not reuse or lightly paraphrase any real, copyrighted SAT question — write something original.

${subjectLine}
${difficultyLine}

Rules:
- If the subject is MATH: set "passage" to an empty string, set "readingTopic" to "NONE", and set "mathTopic" to one of: ${MATH_TOPICS.join(", ")}.
- If the subject is READING: write a short original passage (3-6 sentences, similar in tone to a real SAT reading passage, on any neutral informational topic — science, history, social studies, the arts, etc.) in "passage", set "mathTopic" to "NONE", and set "readingTopic" to one of: ${READING_TOPICS.join(", ")}.
- Provide exactly four answer choices (choiceA-D) that are all distinct from each other, with exactly one correct answer.
- "correct" must be the letter (A, B, C, or D) of the correct choice.
- "explanation" should clearly explain why the correct answer is right (and, ideally, briefly why the others are wrong), in 1-3 sentences.
- "tags" should be a short comma-separated list of relevant topic keywords (e.g. "linear-equation,two-step" or "main-idea,science"), or an empty string if none fit well.
- Keep the prompt and passage free of markdown formatting — plain text only.

Return only the JSON object described by the schema — no other commentary.`;
}

async function callGemini(prompt: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 1,
        },
      }),
    });

    if (!res.ok) {
      console.error(`[ai/generateQuestion] Gemini API returned ${res.status}: ${await res.text().catch(() => "")}`);
      return null;
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("[ai/generateQuestion] Gemini response had no text content.", JSON.stringify(data).slice(0, 500));
      return null;
    }
    return JSON.parse(text);
  } catch (err) {
    console.error("[ai/generateQuestion] Gemini call failed:", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Basic structural validation — anything that fails this is treated as a
 * generation failure and the caller falls back to the existing bank. We're
 * deliberately strict here since this content goes straight into the game
 * and gets persisted to the database. */
function validate(raw: unknown): AIGeneratedQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;

  if (q.subject !== "READING" && q.subject !== "MATH") return null;
  if (q.difficulty !== "EASY" && q.difficulty !== "MEDIUM" && q.difficulty !== "HARD") return null;
  if (q.correct !== "A" && q.correct !== "B" && q.correct !== "C" && q.correct !== "D") return null;

  const strFields = ["prompt", "choiceA", "choiceB", "choiceC", "choiceD", "explanation"] as const;
  for (const f of strFields) {
    if (typeof q[f] !== "string" || (q[f] as string).trim().length === 0) return null;
  }

  const choices = [q.choiceA, q.choiceB, q.choiceC, q.choiceD] as string[];
  if (new Set(choices.map((c) => c.trim())).size !== 4) return null; // must be 4 distinct choices

  const readingTopic = q.subject === "READING" && READING_TOPICS.includes(q.readingTopic as ReadingTopic)
    ? (q.readingTopic as ReadingTopic)
    : null;
  const mathTopic = q.subject === "MATH" && MATH_TOPICS.includes(q.mathTopic as MathTopic)
    ? (q.mathTopic as MathTopic)
    : null;

  const passage = typeof q.passage === "string" && q.passage.trim().length > 0 ? q.passage.trim() : null;
  if (q.subject === "READING" && !passage) return null; // reading questions need a passage

  return {
    subject: q.subject,
    readingTopic,
    mathTopic,
    difficulty: q.difficulty,
    prompt: (q.prompt as string).trim(),
    passage,
    choiceA: (q.choiceA as string).trim(),
    choiceB: (q.choiceB as string).trim(),
    choiceC: (q.choiceC as string).trim(),
    choiceD: (q.choiceD as string).trim(),
    correct: q.correct,
    explanation: (q.explanation as string).trim(),
    tags: typeof q.tags === "string" && q.tags.trim().length > 0 ? q.tags.trim() : null,
  };
}

/** Generate one fresh, original question via Gemini, or `null` if AI
 * generation isn't configured/available/valid right now. Never throws. */
export async function generateAIQuestion(filters: {
  subject?: Subject;
  difficulty?: Difficulty;
}): Promise<AIGeneratedQuestion | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const raw = await callGemini(buildPrompt(filters.subject, filters.difficulty));
    return validate(raw);
  } catch (err) {
    console.error("[ai/generateQuestion] Unexpected error:", err);
    return null;
  }
}
