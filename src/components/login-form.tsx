"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/bucket-list";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Those credentials don’t match our little world.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md space-y-5 rounded-[1.75rem] border border-white/30 bg-[var(--cream)]/90 p-7 shadow-[0_30px_80px_-40px_rgba(15,40,45,0.7)] backdrop-blur-xl sm:p-8"
    >
      <div className="space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--cream)]">
          <Lock className="h-4 w-4" />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Just the two of you — and one quiet admin door.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Username
        </span>
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="field"
          placeholder="Please enter your username, Bitch!"
          autoComplete="username"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Password
        </span>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
          placeholder="••••••••••••"
          autoComplete="current-password"
        />
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--cream)] transition hover:bg-[var(--teal)] disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Enter our list
      </button>
    </motion.form>
  );
}
