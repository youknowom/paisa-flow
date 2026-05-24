"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { CategoryIcon } from "@/components/shared/category-icon";
import { getCategoryStyle } from "@/lib/category-config";
import { ArrowRight } from "lucide-react";
import { cardTapScale } from "@/lib/motion-presets";

interface Expense {
  _id: string;
  amount: number;
  category: string;
  note: string;
  paymentMode: string;
  date: string;
}

interface RecentExpensesProps {
  expenses: Expense[];
  currency: string;
  onExpenseClick?: (id: string) => void;
}

export function RecentExpenses({
  expenses,
  currency,
  onExpenseClick,
}: RecentExpensesProps) {
  const sorted = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card-surface mb-8"
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h3 className="text-h3 font-medium text-text-primary font-heading">
          Recent Expenses
        </h3>
        <Link
          href="/daily"
          className="text-caption text-accent hover:text-accent-hover flex items-center gap-1 transition-colors font-heading"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-text-muted py-8 text-center">
          No expenses yet this month
        </p>
      ) : (
        <div>
          <AnimatePresence>
            {sorted.map((expense, i) => {
              const cat = getCategoryStyle(expense.category);
              return (
                <motion.button
                  key={expense._id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.04 }}
                  {...cardTapScale}
                  onClick={() => onExpenseClick?.(expense._id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-surface-2/50 transition-colors ${
                    i < sorted.length - 1
                      ? "border-b border-border-subtle"
                      : ""
                  }`}
                >
                  <CategoryIcon category={expense.category} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {expense.note || cat.label}
                    </p>
                    <p className="text-caption text-text-muted">{cat.label}</p>
                  </div>
                  <span className="text-[15px] font-mono-amount font-semibold text-text-primary">
                    {formatMoney(expense.amount, currency)}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
