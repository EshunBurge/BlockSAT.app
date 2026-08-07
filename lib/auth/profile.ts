import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

function slugifyUsername(email: string) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return base || "player";
}

/** Ensures a Profile row exists for a given auth user id/email, creating one with a unique username on first login. */
export async function ensureProfile(userId: string, email: string) {
  const existing = await prisma.profile.findUnique({ where: { id: userId } });
  if (existing) return existing;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const role: Role = adminEmails.includes(email.toLowerCase()) ? "ADMIN" : "USER";

  let username = slugifyUsername(email);
  let suffix = 0;
  // Guarantee username uniqueness with a numeric suffix if needed.
  while (await prisma.profile.findUnique({ where: { username } })) {
    suffix += 1;
    username = `${slugifyUsername(email)}${suffix}`;
  }

  return prisma.profile.create({
    // No separate onboarding flow anymore — practice focus/difficulty are
    // chosen fresh before every game instead of once at signup.
    data: { id: userId, email, username, role, onboardingDone: true },
  });
}
