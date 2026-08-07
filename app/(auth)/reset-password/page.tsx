"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/hooks/useAuth";
import { CheckCircle2 } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-white/60">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const resetPassword = useResetPassword();
  const [done, setDone] = useState(false);

  const onSubmit = (values: FormValues) => {
    resetPassword.mutate(
      { token, password: values.password },
      { onSuccess: () => setDone(true) }
    );
  };

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-400" />
        <h1 className="mb-2 text-2xl font-bold">Password updated</h1>
        <p className="mb-6 text-sm text-white/70">You can now log in with your new password.</p>
        <Button onClick={() => router.push("/login")} className="w-full btn-brand btn-glow hover:opacity-90">
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Set a new password</h1>
      <p className="mb-6 text-sm text-white/70">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...register("password")} />
          {errors.password && <p className="text-sm text-red-300">{errors.password.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" type="password" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-sm text-red-300">{errors.confirmPassword.message}</p>}
        </div>

        {resetPassword.isError && <p className="text-sm text-red-300">{(resetPassword.error as Error).message}</p>}

        <Button type="submit" disabled={resetPassword.isPending} className="mt-2 btn-brand btn-glow hover:opacity-90">
          {resetPassword.isPending ? "Updating..." : "Update password"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        <Link href="/login" className="font-medium text-scheme-accent hover:underline">Back to login</Link>
      </p>
    </div>
  );
}
