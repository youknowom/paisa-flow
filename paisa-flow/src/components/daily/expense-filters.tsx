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
    <div className="space-y-4 mb-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
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

      <div className="flex items-center justify-between card-surface px-2 py-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-text-primary font-heading">
          {MONTHS[month - 1]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-2 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onPaymentModeChange("")}
          className={cn("chip flex-shrink-0 text-xs", !paymentMode && "chip-active")}
        >
          All modes
        </button>
        {PAYMENT_MODES.map((pm) => (
          <button
            key={pm.value}
            type="button"
            onClick={() => onPaymentModeChange(pm.value)}
            className={cn(
              "chip flex-shrink-0 text-xs",
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
