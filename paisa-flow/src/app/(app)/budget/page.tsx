"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { MonthSelector } from "@/components/shared/month-selector";
import { MoneyDisplay } from "@/components/shared/money-display";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Target,
  AlertCircle,
  Edit,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";

function getMonthName(m: number): string {
  return new Date(2026, m - 1, 1).toLocaleString("en-IN", { month: "long" });
}

export default function BudgetPage() {
  const { user } = useCurrentUser();
  const currency = user?.currency || "INR";

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [isEditing, setIsEditing] = useState(false);
  const [newAmount, setNewAmount] = useState("");

  const budgetStatus = useQuery(api.budgets.getBudgetStatus, { month, year });
  const setBudget = useMutation(api.budgets.setBudget);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleSaveBudget = async () => {
    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }
    try {
      await setBudget({ month, year, amount: parsedAmount });
      toast.success("Monthly budget successfully set!");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to set budget"
      );
    }
  };

  if (!budgetStatus) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        <Skeleton className="h-14 w-64" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const barPercent = budgetStatus.budgetSet
    ? Math.min(budgetStatus.percentage, 100)
    : 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Month selector */}
      <div className="flex justify-end">
        <MonthSelector
          month={month}
          year={year}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
      </div>

      {/* Hero budget card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pf-card p-5 md:p-7 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-60 h-60 bg-accent/4 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Budget Status</p>
                <h3 className="text-[16px] font-bold text-text-primary font-heading">
                  {getMonthName(month)} {year}
                </h3>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setNewAmount(
                    budgetStatus.budget > 0
                      ? budgetStatus.budget.toString()
                      : ""
                  );
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface-2 border border-border-subtle rounded-xl text-[13px] font-semibold text-text-primary hover:bg-surface-3 transition-colors font-heading"
              >
                <Edit size={13} />
                {budgetStatus.budgetSet ? "Adjust Budget" : "Set Budget"}
              </button>
            )}
          </div>

          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-2xl bg-surface-2 border border-border-subtle p-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-4"
            >
              <div className="flex-1 border-b-2 border-border-strong focus-within:border-accent transition-colors pb-2">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                  Monthly limit
                </label>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl text-text-muted font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="30000"
                    className="flex-1 bg-transparent text-2xl font-mono text-text-primary outline-none min-w-0"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  <X size={14} />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveBudget}>
                  <Check size={14} />
                  Save
                </Button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5 border-t border-border-subtle">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Spent So Far</p>
              <MoneyDisplay
                amount={budgetStatus.spent}
                currency={currency}
                className="text-[26px] font-bold text-text-primary"
              />
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Budget Limit</p>
              {budgetStatus.budgetSet ? (
                <MoneyDisplay
                  amount={budgetStatus.budget}
                  currency={currency}
                  className="text-[26px] font-bold text-text-secondary"
                />
              ) : (
                <span className="text-[26px] font-bold text-text-disabled font-heading">
                  Not set
                </span>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                {budgetStatus.budgetSet &&
                budgetStatus.budget >= budgetStatus.spent
                  ? "Remaining"
                  : "Over Budget"}
              </p>
              {budgetStatus.budgetSet ? (
                <MoneyDisplay
                  amount={Math.abs(
                    budgetStatus.budget - budgetStatus.spent
                  )}
                  currency={currency}
                  className={cn(
                    "text-[26px] font-bold",
                    budgetStatus.budget >= budgetStatus.spent
                      ? "text-accent"
                      : "text-red"
                  )}
                />
              ) : (
                <span className="text-[26px] font-bold text-text-disabled">—</span>
              )}
            </div>
          </div>

          {budgetStatus.budgetSet && (
            <div className="space-y-3">
              <div className="h-3 bg-surface-3 rounded-full overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: barPercent / 100 }}
                  transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                  style={{ transformOrigin: "left" }}
                  className={cn(
                    "h-full rounded-full",
                    budgetStatus.percentage >= 90
                      ? "bg-red"
                      : budgetStatus.percentage >= 70
                        ? "bg-amber"
                        : "bg-accent"
                  )}
                />
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-secondary font-semibold">
                  {budgetStatus.percentage.toFixed(0)}% consumed
                </span>
                <span
                  className={cn(
                    "font-semibold flex items-center gap-1",
                    budgetStatus.warningLevel === "exceeded" ||
                      budgetStatus.warningLevel === "danger"
                      ? "text-red"
                      : budgetStatus.warningLevel === "warning"
                        ? "text-amber"
                        : "text-accent"
                  )}
                >
                  {budgetStatus.warningLevel === "exceeded" && (
                    <>
                      <ShieldAlert size={13} />
                      Over budget
                    </>
                  )}
                  {budgetStatus.warningLevel === "danger" && (
                    <>
                      <AlertCircle size={13} />
                      Dangerously high
                    </>
                  )}
                  {budgetStatus.warningLevel === "warning" && (
                    <>
                      <AlertCircle size={13} />
                      Approaching limit
                    </>
                  )}
                  {budgetStatus.warningLevel === "safe" &&
                    "Within healthy limits"}
                </span>
              </div>
            </div>
          )}

          {!budgetStatus.budgetSet && (
            <div className="rounded-2xl bg-surface-2 border border-border-subtle p-8 text-center">
              <AlertCircle
                size={28}
                className="text-amber mx-auto mb-3"
              />
              <p className="text-[14px] font-bold text-text-primary font-heading">
                No budget for this month
              </p>
              <p className="text-[12px] text-text-muted mt-2 max-w-sm mx-auto mb-5">
                Set a limit to get alerts at 70%, 90%, and 100% of your budget.
              </p>
              <Button onClick={() => setIsEditing(true)}>
                Set Monthly Budget
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="pf-card p-5"
      >
        <h4 className="text-[15px] font-bold text-text-primary font-heading mb-2">
          Smart Budget Alerts
        </h4>
        <p className="text-[13px] text-text-muted leading-relaxed">
          PaisaFlow monitors your spending in real time. When you approach 70%,
          90%, or exceed your monthly limit, you&apos;ll see live warnings on
          your dashboard so you can adjust before it&apos;s too late.
        </p>
      </motion.div>
    </div>
  );
}
