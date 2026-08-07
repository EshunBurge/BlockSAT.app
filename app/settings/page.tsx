"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/shared/AppShell";
import { useProfile, useUpdateProfile, useUploadAvatar, useRemoveAvatar } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { PracticeFocus, Difficulty } from "@/types";
import { cn } from "@/lib/utils";

const FOCUS_OPTIONS: PracticeFocus[] = ["READING", "MATH", "BOTH"];
const DIFFICULTY_OPTIONS: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const THEMES = [
  { slug: "classic", name: "Classic" },
  { slug: "midnight", name: "Midnight" },
  { slug: "sunset", name: "Sunset" },
  { slug: "forest", name: "Forest" },
  { slug: "aurora", name: "Aurora" },
  { slug: "galaxy", name: "Galaxy" },
];

export default function SettingsPage() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const router = useRouter();
  const [username, setUsername] = useState(profile?.username ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!profile) return <AppShell><div /></AppShell>;

  const unlockedThemes = profile.unlockedThemes.split(",").filter(Boolean);

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller");
      return;
    }
    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success("Profile picture updated"),
      onError: (err) => toast.error((err as Error).message),
    });
  }

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="flex flex-col gap-6">
        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Profile Picture</h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.username} />}
              <AvatarFallback className="bg-gradient-to-br from-amber-300 to-neutral-500 text-lg text-white">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarFile}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploadAvatar.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              >
                {uploadAvatar.isPending ? "Uploading..." : "Upload photo"}
              </Button>
              {profile.avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={removeAvatar.isPending}
                  onClick={() =>
                    removeAvatar.mutate(undefined, {
                      onSuccess: () => toast.success("Profile picture removed"),
                      onError: (err) => toast.error((err as Error).message),
                    })
                  }
                  className="text-white/60 hover:bg-white/10 hover:text-white"
                >
                  Remove photo
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Default Practice Preferences</h2>
          <p className="mb-4 text-sm text-white/50">
            You&apos;ll pick a focus and difficulty fresh before every game — these are just the defaults that get
            pre-selected on that screen.
          </p>
          <div className="mb-4">
            <Label className="mb-2 block text-sm text-white/70">What would you like to practice?</Label>
            <div className="flex gap-2">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => updateProfile.mutate({ practiceFocus: opt })}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm",
                    profile.practiceFocus === opt ? "border-scheme-accent bg-scheme-accent-15" : "border-white/15 hover:border-white/30"
                  )}
                >
                  {opt[0] + opt.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block text-sm text-white/70">Difficulty</Label>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => updateProfile.mutate({ difficulty: opt })}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm",
                    profile.difficulty === opt ? "border-scheme-accent bg-scheme-accent-15" : "border-white/15 hover:border-white/30"
                  )}
                >
                  {opt[0] + opt.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Sound</h2>
          <div className="mb-3 flex items-center justify-between">
            <Label htmlFor="sound">Sound effects</Label>
            <Switch id="sound" checked={profile.soundEnabled} onCheckedChange={(v) => updateProfile.mutate({ soundEnabled: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="music">Background music</Label>
            <Switch id="music" checked={profile.musicEnabled} onCheckedChange={(v) => updateProfile.mutate({ musicEnabled: v })} />
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Board Theme</h2>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => {
              const unlocked = unlockedThemes.includes(t.slug);
              return (
                <button
                  key={t.slug}
                  disabled={!unlocked}
                  onClick={() => updateProfile.mutate({ activeTheme: t.slug })}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm",
                    !unlocked && "opacity-40",
                    profile.activeTheme === t.slug ? "border-scheme-accent bg-scheme-accent-15" : "border-white/15 hover:border-white/30"
                  )}
                >
                  {t.name}{!unlocked && " 🔒"}
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 font-semibold">Account</h2>
          <div className="mb-4 flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-white/10 border-white/20 text-white" />
              <Button
                onClick={() =>
                  updateProfile.mutate(
                    { username },
                    { onSuccess: () => toast.success("Username updated"), onError: (e) => toast.error((e as Error).message) }
                  )
                }
                variant="outline"
                className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              >
                Save
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input value={profile.email} disabled className="bg-white/5 border-white/10 text-white/60" />
          </div>

          <Separator className="my-5 bg-white/10" />

          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" />}>Delete account</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your profile, game history, and stats. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await fetch("/api/profile", { method: "DELETE" });
                    router.push("/");
                  }}
                >
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </AppShell>
  );
}
