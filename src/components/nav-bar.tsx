"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Compass, LogOut, MapPinned, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const links = [
    { href: "/bucket-list", label: "Our List", icon: MapPinned },
    ...(session.user.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: Settings2 }]
      : []),
  ];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-[var(--line)]/70 bg-[var(--cream)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/bucket-list" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--cream)] transition group-hover:scale-105">
            <Compass className="h-4 w-4" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]">
            Horizons We Chase
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-[var(--ink)] text-[var(--cream)]"
                    : "text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--ink)]",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[var(--muted)] transition hover:bg-[var(--sand)] hover:text-[var(--ink)]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{session.user.name}</span>
          </button>
        </nav>
      </div>
    </motion.header>
  );
}
