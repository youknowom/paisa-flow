"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

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
      className={`flex items-center gap-1.5 bg-white border border-border-subtle rounded-2xl p-1 shadow-md ${className}`}
    >
      <button
        type="button"
        onClick={onPrev}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-[13px] font-bold text-text-primary px-3 min-w-[130px] text-center select-none font-heading">
        {getMonthName(month)} {year}
      </span>
      <button
        type="button"
        onClick={onNext}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
