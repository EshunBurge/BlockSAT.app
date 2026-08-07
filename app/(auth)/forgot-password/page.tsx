"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/hooks/useAuth";
import { MailCheck } from "lucide-react";

const schema = z.object({ email: z.string().email("Enter a valid email address.") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const forgotPassword = useForgotPassword();
  const [devLink, setDevLink] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = (values: FormValues) => {
    forgotPassword.mutate(values, {
      onSuccess: (data) => {
        setSent(true);
        if (data.devResetLink) setDevLink(data.devResetLink);
      },
    });
  };

  if (sent) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto mb-4 h-12 w-12 text-scheme-accent" />
        <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
        <p className="mb-6 text-sm text-white/70">
          If an account exists for that email, we&apos;ve sent a password reset link.
        </p>
        {devLink && (
          <Button render={<Link href={devLink} />} className="w-full btn-brand btn-glow hover:opacity-90">
            Reset my password
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Forgot your password?</h1>
      <p className="mb-6 text-sm text-white/70">Enter your email and we&apos;ll send you a reset link.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...register("email")} />
          {errors.email && <p className="text-sm text-red-300">{errors.email.message}</p>}
        </div>
        <Button type="submit" disabled={forgotPassword.isPending} className="mt-2 btn-brand btn-glow hover:opacity-90">
          {forgotPassword.isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-scheme-accent hover:underline">Log in</Link>
      </p>
    </div>
  );
}
