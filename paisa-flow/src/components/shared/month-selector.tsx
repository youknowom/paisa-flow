"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { navTapScale } from "@/lib/motion-presets";

interface MonthSelectorProps {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

function getMonthName(m: number): string {
  return new Date(2026, m - 1, 1).toLocaleString("en-IN", { month: "long" });
}

export function MonthSelector({
  month,
  year,
  onPrev,
  onNext,
  className = "",
}: MonthSelectorProps) {
  return (
    <div
      className={`flex items-center gap-2 bg-surface-2 border border-border-subtle rounded-xl p-1 ${className}`}
    >
      <motion.button
        {...navTapScale}
        onClick={onPrev}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </motion.button>
      <span className="text-sm font-semibold text-text-primary px-3 min-w-[140px] text-center select-none font-heading">
        {getMonthName(month)} {year}
      </span>
      <motion.button
        {...navTapScale}
        onClick={onNext}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors"
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </motion.button>
    </div>
  );
}
