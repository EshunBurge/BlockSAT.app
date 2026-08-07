"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSignUp } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const schema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    agree: z.boolean().refine((v) => v === true, { message: "You must agree to the Terms of Service and Privacy Policy." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "", agree: false },
  });
  const signUp = useSignUp();
  const router = useRouter();
  const [devLink, setDevLink] = useState<string | null>(null);

  const onSubmit = (values: FormValues) => {
    signUp.mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          if (data.devVerifyLink) {
            setDevLink(data.devVerifyLink);
          } else {
            router.push("/verify-email?sent=1");
          }
        },
      }
    );
  };

  if (devLink) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-400" />
        <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
        <p className="mb-6 text-sm text-white/70">
          We sent a verification link to your inbox. Since this environment doesn&apos;t have a live email provider
          connected, here&apos;s your link directly:
        </p>
        <Button render={<Link href={devLink} />} className="w-full btn-brand btn-glow hover:opacity-90">
          Verify my email
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
      <p className="mb-6 text-sm text-white/70">Start turning study time into game time.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...register("email")} />
          {errors.email && <p className="text-sm text-red-300">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...register("password")} />
          {errors.password && <p className="text-sm text-red-300">{errors.password.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" placeholder="Repeat your password" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="text-sm text-red-300">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="agree"
            checked={watch("agree")}
            onCheckedChange={(v) => setValue("agree", v === true, { shouldValidate: true })}
            className="mt-0.5 border-white/40"
          />
          <Label htmlFor="agree" className="text-sm font-normal text-white/80">
            I agree to the{" "}
            <Link href="/legal/terms" className="text-scheme-accent hover:underline">Terms of Service</Link> and{" "}
            <Link href="/legal/privacy" className="text-scheme-accent hover:underline">Privacy Policy</Link>
          </Label>
        </div>
        {errors.agree && <p className="-mt-2 text-sm text-red-300">{errors.agree.message}</p>}

        {signUp.isError && <p className="text-sm text-red-300">{(signUp.error as Error).message}</p>}

        <Button type="submit" disabled={signUp.isPending} className="mt-2 btn-brand btn-glow hover:opacity-90">
          {signUp.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-scheme-accent hover:underline">Log in</Link>
      </p>
    </div>
  );
}
