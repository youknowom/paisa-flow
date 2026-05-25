"use client";

import { motion } from "motion/react";
import { formatMoney } from "@/lib/format-money";
import { CategoryIcon } from "@/components/shared/category-icon";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";
import { getCategoryStyle } from "@/lib/category-config";
import { Edit3, Trash2, RotateCcw } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

interface ExpenseCardProps {
  expense: {
    _id: Id<"dailyExpenses">;
    amount: number;
    category: string;
    note: string;
    paymentMode: string;
    date: string;
    isRecurring: boolean;
  };
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseCard({
  expense,
  currency,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === expense.category)?.label ??
    getCategoryStyle(expense.category).label;
  const paymentLabel =
    PAYMENT_MODES.find((p) => p.value === expense.paymentMode)?.label ??
    expense.paymentMode;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.98 }}
      className="pf-card p-4 flex items-center gap-3.5 group hover:shadow-lg transition-shadow"
    >
      <CategoryIcon category={expense.category} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-text-primary truncate font-heading">
          {expense.note || categoryLabel}
        </p>
        <p className="text-[11px] text-text-muted mt-0.5 font-medium">
          {categoryLabel} · {paymentLabel}
          {expense.isRecurring && (
            <span className="inline-flex items-center gap-0.5 ml-1.5 text-accent">
              <RotateCcw size={9} /> Recurring
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[15px] font-mono font-bold text-text-primary">
          {formatMoney(expense.amount, currency)}
        </span>
        <div className="flex gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 rounded-lg hover:bg-surface-3 text-text-muted hover:text-accent transition-colors"
            aria-label="Edit"
          >
            <Edit3 size={13} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg hover:bg-red/10 text-text-muted hover:text-red transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
