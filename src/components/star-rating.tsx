"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
  label?: string;
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  label,
}: StarRatingProps) {
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          {label}
        </span>
      )}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value;
          const Comp = readOnly ? "span" : "button";
          return (
            <Comp
              key={star}
              type={readOnly ? undefined : "button"}
              onClick={readOnly ? undefined : () => onChange?.(star)}
              className={cn(
                "transition",
                !readOnly && "hover:scale-110 active:scale-95",
              )}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  iconClass,
                  filled
                    ? "fill-[var(--amber)] text-[var(--amber)]"
                    : "text-[var(--line)]",
                )}
              />
            </Comp>
          );
        })}
      </div>
    </div>
  );
}
