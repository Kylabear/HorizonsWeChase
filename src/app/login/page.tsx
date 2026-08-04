import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1f6f7833,transparent_55%)]" />
      <div className="pointer-events-none absolute -left-10 top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,#f0c27a55,transparent_70%)] blur-2xl animate-drift" />
      <div className="pointer-events-none absolute bottom-16 right-0 h-60 w-60 rounded-full bg-[radial-gradient(circle,#d76b5c44,transparent_70%)] blur-2xl animate-drift [animation-delay:2s]" />

      <div className="relative z-10 w-full max-w-md">
        <p className="mb-6 text-center font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Horizons We Chase
        </p>
        <Suspense fallback={<div className="h-80 animate-pulse rounded-[1.75rem] bg-[var(--sand)]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
