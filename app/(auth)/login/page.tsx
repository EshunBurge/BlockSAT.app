"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLogIn } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const logIn = useLogIn();

  const onSubmit = (values: FormValues) => {
    logIn.mutate(values);
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Welcome back</h1>
      <p className="mb-6 text-sm text-white/70">Log in to continue your streak.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...register("email")} />
          {errors.email && <p className="text-sm text-red-300">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-scheme-accent hover:underline">Forgot password?</Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...register("password")} />
          {errors.password && <p className="text-sm text-red-300">{errors.password.message}</p>}
        </div>

        {logIn.isError && <p className="text-sm text-red-300">{(logIn.error as Error).message}</p>}

        <Button type="submit" disabled={logIn.isPending} className="mt-2 btn-brand btn-glow hover:opacity-90">
          {logIn.isPending ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-scheme-accent hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
