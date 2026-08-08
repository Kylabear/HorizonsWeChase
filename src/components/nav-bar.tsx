"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Compass, LogOut, MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const links = [{ href: "/bucket-list", label: "Our List", icon: MapPinned }];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-[var(--line)]/70 bg-[var(--cream)]/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-5 sm:py-3.5">
        <Link
          href="/bucket-list"
          className="group flex min-w-0 items-center gap-2 sm:gap-2.5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--cream)] transition group-hover:scale-105 sm:h-9 sm:w-9">
            <Compass className="h-4 w-4" />
          </span>
          <span className="truncate font-[family-name:var(--font-display)] text-base tracking-tight text-[var(--ink)] sm:text-lg">
            Horizons We Chase
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                className={cn(
                  "inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-sm transition sm:px-3 sm:py-1.5",
                  active
                    ? "bg-[var(--ink)] text-[var(--cream)]"
                    : "text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--ink)]",
                )}
              >
                <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign out"
            className="ml-0.5 inline-flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--sand)] hover:text-[var(--ink)] sm:ml-1 sm:px-3 sm:py-1.5"
          >
            <LogOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">{session.user.name}</span>
          </button>
        </nav>
      </div>
    </motion.header>
  );
}
