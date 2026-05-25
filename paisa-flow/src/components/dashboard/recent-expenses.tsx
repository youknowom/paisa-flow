"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { CategoryIcon } from "@/components/shared/category-icon";
import { getCategoryStyle } from "@/lib/category-config";
import { ArrowRight } from "lucide-react";

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="pf-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
        <h3 className="text-[15px] font-bold text-text-primary font-heading">
          Recent Expenses
        </h3>
        <Link
          href="/daily"
          className="text-[12px] font-bold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors uppercase tracking-wider"
        >
          View all <ArrowRight size={12} strokeWidth={2.5} />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-surface-3 rounded-full flex items-center justify-center mb-3">
            <span className="text-xl">💸</span>
          </div>
          <p className="text-[13px] font-medium text-text-muted font-heading">
            No expenses yet this month
          </p>
        </div>
      ) : (
        <div>
          <AnimatePresence>
            {sorted.map((expense, i) => {
              const cat = getCategoryStyle(expense.category);
              return (
                <motion.button
                  key={expense._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onExpenseClick?.(expense._id)}
                  className={`w-full flex items-center gap-3.5 px-5 py-3 text-left hover:bg-surface-2 transition-colors ${
                    i < sorted.length - 1
                      ? "border-b border-border-subtle"
                      : ""
                  }`}
                >
                  <CategoryIcon category={expense.category} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-text-primary truncate font-heading leading-tight mb-0.5">
                      {expense.note || cat.label}
                    </p>
                    <p className="text-[11px] font-medium text-text-muted">
                      {cat.label} · {expense.paymentMode.toUpperCase()}
                    </p>
                  </div>
                  <span className="text-[15px] font-mono font-bold text-text-primary flex-shrink-0">
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
