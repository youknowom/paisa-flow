"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { FILTER_CATEGORIES } from "@/lib/category-config";
import { PAYMENT_MODES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ExpenseFiltersProps {
  month: number;
  year: number;
  category: string;
  paymentMode: string;
  onMonthChange: (month: number, year: number) => void;
  onCategoryChange: (category: string) => void;
  onPaymentModeChange: (paymentMode: string) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const FILTER_LABELS: Record<string, string> = {
  all: "All",
  food: "Food",
  travel: "Travel",
  shopping: "Shopping",
  rent: "Rent",
  bills: "Bills",
  health: "Health",
  entertainment: "Fun",
  subscriptions: "Subs",
  other: "Other",
};

export function ExpenseFilters({
  month,
  year,
  category,
  paymentMode,
  onMonthChange,
  onCategoryChange,
  onPaymentModeChange,
}: ExpenseFiltersProps) {
  const handlePrevMonth = () => {
    if (month === 1) onMonthChange(12, year - 1);
    else onMonthChange(month - 1, year);
  };

  const handleNextMonth = () => {
    if (month === 12) onMonthChange(1, year + 1);
    else onMonthChange(month + 1, year);
  };

  return (
    <div className="space-y-3 mb-5">
      {/* Month selector — Blinkit pill card style */}
      <div className="flex items-center justify-between pf-card px-2 py-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-[14px] font-bold text-text-primary font-heading">
          {MONTHS[month - 1]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Category chips — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {FILTER_CATEGORIES.map((cat) => {
          const isActive = cat === "all" ? !category : category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat === "all" ? "" : cat)}
              className={cn("chip flex-shrink-0", isActive && "chip-active")}
            >
              {FILTER_LABELS[cat] ?? cat}
            </button>
          );
        })}
      </div>

      {/* Payment mode chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onPaymentModeChange("")}
          className={cn("chip flex-shrink-0", !paymentMode && "chip-active")}
        >
          All modes
        </button>
        {PAYMENT_MODES.map((pm) => (
          <button
            key={pm.value}
            type="button"
            onClick={() => onPaymentModeChange(pm.value)}
            className={cn(
              "chip flex-shrink-0",
              paymentMode === pm.value && "chip-active"
            )}
          >
            {pm.label}
          </button>
        ))}
      </div>
    </div>
  );
}
