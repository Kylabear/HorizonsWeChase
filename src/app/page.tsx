"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(28,45,48,0.15) 0%, rgba(28,45,48,0.55) 100%), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 horizon-grid opacity-25 mix-blend-soft-light" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,#f0c27a66,transparent_70%)] blur-2xl animate-drift" />
      <div className="pointer-events-none absolute -right-16 top-28 h-64 w-64 rounded-full bg-[radial-gradient(circle,#1f6f7866,transparent_70%)] blur-2xl animate-drift [animation-delay:1.5s]" />

      <section className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-24 sm:justify-center sm:px-8 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur"
          >
            <Compass className="h-3.5 w-3.5" />
            Wanderers
          </motion.p>

          <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(3.4rem,11vw,7rem)] leading-[0.9] tracking-[-0.02em] text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
            Horizons
            <span className="mt-1 block bg-[linear-gradient(110deg,#f7f1e8,#f0c27a,#8eb8c0,#f7f1e8)] bg-clip-text text-transparent animate-shimmer">
              We Chase
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            A private atlas of restaurants, coffee shops, and horizons —
            planned, rated , remembered together.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--cream)] px-6 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-white"
            >
              Open our list
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <span className="inline-flex items-center gap-2 text-sm text-white/80">
              <Heart className="h-4 w-4 fill-[var(--coral)] text-[var(--coral)]" />
            </span>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
