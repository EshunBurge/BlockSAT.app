import { NextRequest, NextResponse } from "next/server";
import { Prisma, Difficulty } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { generateAIQuestion } from "@/lib/ai/generateQuestion";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const subjectParam = searchParams.get("subject"); // READING | MATH | null (either)
  const difficultyParam = searchParams.get("difficulty"); // EASY | MEDIUM | HARD | null
  const subjectFilter = subjectParam === "READING" || subjectParam === "MATH" ? subjectParam : undefined;
  const difficultyFilter = difficultyParam ? (difficultyParam as Difficulty) : undefined;

  // Try generating a brand-new question with AI first (see lib/ai/generateQuestion.ts)
  // so the question pool is effectively endless rather than capped at the
  // seeded/imported bank. This is a no-op (returns null immediately) unless
  // GEMINI_API_KEY is configured, and any failure — missing key, network
  // error, malformed output — falls straight through to the existing
  // pick-from-bank logic below, so this can never break the game.
  const aiQuestion = await generateAIQuestion({ subject: subjectFilter, difficulty: difficultyFilter });
  if (aiQuestion) {
    const created = await prisma.question.create({
      data: { ...aiQuestion, source: "ai-generated" },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { correct, explanation, ...safe } = created;
    return NextResponse.json({ question: safe });
  }

  const where: Prisma.QuestionWhereInput = {};
  if (subjectFilter) where.subject = subjectFilter;
  if (difficultyFilter) where.difficulty = difficultyFilter;

  const count = await prisma.question.count({ where });
  if (count === 0) {
    return NextResponse.json({ error: "No questions available for these filters." }, { status: 404 });
  }
  const skip = Math.floor(Math.random() * count);
  const [question] = await prisma.question.findMany({ where, skip, take: 1 });

  // Never leak the correct answer / explanation to the client until answered.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correct, explanation, ...safe } = question;
  return NextResponse.json({ question: safe });
}
