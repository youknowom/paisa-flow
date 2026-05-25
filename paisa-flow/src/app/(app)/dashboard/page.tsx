"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useBudgetStatus } from "@/hooks/use-budget-status";
import { HeroCard } from "@/components/dashboard/hero-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { ActiveTripsRow } from "@/components/dashboard/active-trips-row";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { AddExpenseDialog } from "@/components/daily/add-expense-dialog";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  MapPin,
  Plus,
  Plane,
  Target,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const currency = user?.currency || "INR";
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const today = `${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<{
    id: Id<"dailyExpenses">;
    amount: number;
    category: string;
    note: string;
    paymentMode: string;
    date: string;
    isRecurring: boolean;
  } | null>(null);

  const monthlySummary = useQuery(api.dailyExpenses.getMonthlyExpenseSummary, {
    month,
    year,
  });
  const dailyExpenses = useQuery(api.dailyExpenses.getDailyExpenses, {
    month,
    year,
  });
  const weeklyTrend = useQuery(api.dailyExpenses.getWeeklyTrend);
  const activeTrips = useQuery(api.trips.getUserTrips, { status: "active" });
  const allTrips = useQuery(api.trips.getUserTrips, {});
  const { budgetStatus } = useBudgetStatus();

  const budgetToastShown = useRef(false);
  useEffect(() => {
    if (budgetStatus && !budgetToastShown.current) {
      budgetToastShown.current = true;
      if (budgetStatus.warningLevel === "exceeded") {
        toast.warning(
          `Budget exceeded! You've spent ${budgetStatus.percentage.toFixed(0)}% of your monthly budget.`
        );
      } else if (budgetStatus.warningLevel === "danger") {
        toast.warning(
          `Budget alert: ${budgetStatus.percentage.toFixed(0)}% used. You're close to your limit!`
        );
      } else if (budgetStatus.warningLevel === "warning") {
        toast.warning(
          `Heads up: ${budgetStatus.percentage.toFixed(0)}% of your monthly budget used.`
        );
      }
    }
  }, [budgetStatus]);

  const todaySpend = dailyExpenses
    ? dailyExpenses
        .filter((e) => e.date === today)
        .reduce((sum, e) => sum + e.amount, 0)
    : 0;

  const youAreOwed = allTrips
    ? allTrips
        .filter((t) => t.status === "active" && t.myBalance > 0)
        .reduce((sum, t) => sum + t.myBalance, 0)
    : 0;

  const youOwe = allTrips
    ? allTrips
        .filter((t) => t.status === "active" && t.myBalance < 0)
        .reduce((sum, t) => sum + Math.abs(t.myBalance), 0)
    : 0;

  const isLoading =
    monthlySummary === undefined ||
    dailyExpenses === undefined ||
    weeklyTrend === undefined;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const handleExpenseClick = (id: string) => {
    const expense = dailyExpenses?.find((e) => e._id === id);
    if (!expense) return;
    setEditData({
      id: expense._id,
      amount: expense.amount,
      category: expense.category,
      note: expense.note,
      paymentMode: expense.paymentMode,
      date: expense.date,
      isRecurring: expense.isRecurring,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Hero Money Card */}
      <HeroCard
        totalSpent={monthlySummary?.totalSpent ?? 0}
        currency={currency}
        changePercent={0}
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Today's Spend"
          value={todaySpend}
          currency={currency}
          icon={CalendarDays}
          iconColor="text-accent"
          iconBg="bg-accent/10"
        />
        <StatCard
          label="You Are Owed"
          value={youAreOwed}
          currency={currency}
          icon={TrendingUp}
          iconColor="text-accent"
          iconBg="bg-accent/10"
          variant="positive"
        />
        <StatCard
          label="You Owe"
          value={youOwe}
          currency={currency}
          icon={TrendingDown}
          iconColor="text-red"
          iconBg="bg-red/10"
          variant="negative"
        />
        <StatCard
          label="Active Trips"
          value={activeTrips?.length ?? 0}
          currency={currency}
          icon={MapPin}
          iconColor="text-violet"
          iconBg="bg-violet/10"
          isCount
        />
      </div>

      {/* Budget Progress */}
      {budgetStatus?.budgetSet && (
        <BudgetProgress
          spent={budgetStatus.spent}
          budget={budgetStatus.budget}
          percentage={budgetStatus.percentage}
          currency={currency}
          warningLevel={budgetStatus.warningLevel}
        />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setEditData(null);
            setDialogOpen(true);
          }}
          className="quick-action"
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Plus size={20} className="text-accent" />
          </div>
          <span className="text-[11px] font-semibold text-text-secondary font-heading">Add Expense</span>
        </button>
        <Link href="/trips" className="quick-action">
          <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center">
            <Plane size={18} className="text-cyan" />
          </div>
          <span className="text-[11px] font-semibold text-text-secondary font-heading">Add Trip</span>
        </Link>
        <Link href="/budget" className="quick-action">
          <div className="w-10 h-10 rounded-full bg-violet/10 flex items-center justify-center">
            <Target size={18} className="text-violet" />
          </div>
          <span className="text-[11px] font-semibold text-text-secondary font-heading">Set Budget</span>
        </Link>
        <Link href="/analytics" className="quick-action">
          <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
            <BarChart3 size={18} className="text-amber" />
          </div>
          <span className="text-[11px] font-semibold text-text-secondary font-heading">Analytics</span>
        </Link>
      </div>

      {/* Weekly Trend Chart */}
      <SpendingChart data={weeklyTrend ?? []} currency={currency} />

      {/* Recent Expenses */}
      <RecentExpenses
        expenses={dailyExpenses ?? []}
        currency={currency}
        onExpenseClick={handleExpenseClick}
      />

      {/* Active Trips */}
      {activeTrips && activeTrips.length > 0 && (
        <ActiveTripsRow trips={activeTrips} currency={currency} />
      )}

      <AddExpenseDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditData(null);
        }}
        currency={currency}
        defaultPaymentMode={user?.defaultPaymentMode ?? undefined}
        editData={editData}
      />
    </div>
  );
}
