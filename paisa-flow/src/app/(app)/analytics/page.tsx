"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useBudgetStatus } from "@/hooks/use-budget-status";
import { PageHeader } from "@/components/shared/page-header";
import { MonthSelector } from "@/components/shared/month-selector";
import { ChartTooltipContent } from "@/components/shared/chart-tooltip";
import { EmptyState } from "@/components/shared/empty-state";
import { MoneyDisplay } from "@/components/shared/money-display";
import { CategoryPie } from "@/components/dashboard/category-pie";
import { Skeleton, ChartSkeleton, StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  YAxis,
} from "recharts";

export default function AnalyticsPage() {
  const { user } = useCurrentUser();
  const currency = user?.currency || "INR";

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const monthlySummary = useQuery(api.dailyExpenses.getMonthlyExpenseSummary, {
    month,
    year,
  });
  const dailyExpenses = useQuery(api.dailyExpenses.getDailyExpenses, {
    month,
    year,
  });
  const weeklyTrend = useQuery(api.dailyExpenses.getWeeklyTrend);
  const { budgetStatus } = useBudgetStatus();

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

  const dailyChartData = (() => {
    if (!dailyExpenses) return [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const map = new Map<number, number>();
    for (let d = 1; d <= daysInMonth; d++) map.set(d, 0);
    for (const e of dailyExpenses) {
      const dayNum = parseInt(e.date.split("-")[2]);
      map.set(dayNum, (map.get(dayNum) ?? 0) + e.amount);
    }
    return Array.from(map.entries()).map(([day, amount]) => ({
      day: `${day}`,
      amount,
    }));
  })();

  const paymentModeData = (() => {
    if (!dailyExpenses) return [];
    const map = new Map<string, number>();
    for (const e of dailyExpenses) {
      map.set(e.paymentMode, (map.get(e.paymentMode) ?? 0) + e.amount);
    }
    return Array.from(map.entries()).map(([mode, amount]) => ({
      name: PAYMENT_MODES.find((p) => p.value === mode)?.label ?? mode,
      value: amount,
    }));
  })();

  const isLoading =
    monthlySummary === undefined ||
    dailyExpenses === undefined ||
    weeklyTrend === undefined;

  const hasData = (monthlySummary?.expenseCount ?? 0) > 0;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-14 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <PageHeader
            title="Analytics"
            subtitle="Visualize your spending patterns"
          />
          <MonthSelector
            month={month}
            year={year}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />
        </div>
        <EmptyState
          title="Nothing to analyze yet"
          description="Add some expenses first and come back here to see your spending patterns."
          lottieUrl="https://lottie.host/f2a3ec55-5771-4498-b230-7e5070e27e25/gKzXgYHPgI.lottie"
          action={
            <Link
              href="/daily"
              className="btn-primary"
            >
              Add Expenses
            </Link>
          }
        />
      </div>
    );
  }

  const categoryPieData =
    monthlySummary?.categoryBreakdown.map((item) => ({
      category: item.category,
      amount: item.amount,
      percentage: item.percentage,
    })) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <PageHeader
          title="Analytics"
          subtitle="Visualize your spending patterns"
        />
        <MonthSelector
          month={month}
          year={year}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface-elevated p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-text-muted">Total Spent</span>
            <TrendingUp size={16} className="text-accent" />
          </div>
          <MoneyDisplay
            amount={monthlySummary?.totalSpent ?? 0}
            currency={currency}
            className="text-2xl font-semibold text-text-primary"
          />
          <p className="text-caption text-text-muted mt-2">
            {monthlySummary?.expenseCount ?? 0} transaction
            {(monthlySummary?.expenseCount ?? 0) !== 1 ? "s" : ""}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-surface-elevated p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-text-muted">Average / Day</span>
            <BarChart3 size={16} className="text-violet" />
          </div>
          <MoneyDisplay
            amount={monthlySummary?.avgPerDay ?? 0}
            currency={currency}
            className="text-2xl font-semibold text-text-primary"
          />
          <p className="text-caption text-text-muted mt-2">This month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-surface-elevated p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-label text-text-muted">Top Category</span>
            <Sparkles size={16} className="text-amber" />
          </div>
          <p className="text-xl font-semibold text-text-primary font-heading truncate capitalize">
            {(() => {
              if (!monthlySummary?.topCategory) return "—";
              const cat = CATEGORIES.find(
                (c) => c.value === monthlySummary.topCategory
              );
              return cat ? cat.label : monthlySummary.topCategory;
            })()}
          </p>
          <p className="text-caption text-text-muted mt-2">Highest spend</p>
        </motion.div>
      </div>

      {/* Weekly area + category donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-surface p-5"
        >
          <h3 className="text-h3 font-medium text-text-primary font-heading mb-6">
            Weekly Trend
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend ?? []}>
                <defs>
                  <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0C831F" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0C831F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) =>
                    new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
                      weekday: "short",
                    })
                  }
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B6B6B", fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTooltipContent
                        label={new Date(
                          payload[0].payload.date + "T00:00:00"
                        ).toLocaleDateString("en-IN", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                        })}
                        amount={payload[0].value as number}
                        currency={currency}
                      />
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0C831F"
                  strokeWidth={2}
                  fill="url(#areaGreen)"
                  dot={{ r: 2, fill: "#0C831F" }}
                  activeDot={{ r: 4, fill: "#0C831F" }}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <CategoryPie data={categoryPieData} currency={currency} />
      </div>

      {/* Daily bars + payment modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-surface p-5"
        >
          <h3 className="text-h3 font-medium text-text-primary font-heading mb-6">
            Daily Spending
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} barCategoryGap="15%">
                <defs>
                  <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0C831F" />
                    <stop offset="100%" stopColor="#0A6B19" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B6B6B", fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTooltipContent
                        label={`Day ${payload[0].payload.day}`}
                        amount={payload[0].value as number}
                        currency={currency}
                      />
                    );
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#barGreen)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-surface p-5"
        >
          <h3 className="text-h3 font-medium text-text-primary font-heading mb-6 flex items-center gap-2">
            <CreditCard size={18} className="text-accent" />
            Payment Modes
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentModeData} layout="vertical" margin={{ left: 4, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={72}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#A3A3A3", fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTooltipContent
                        label={payload[0].payload.name}
                        amount={payload[0].value as number}
                        currency={currency}
                      />
                    );
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#7C3AED"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={20}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Budget vs actual */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-surface p-5"
      >
        <h3 className="text-h3 font-medium text-text-primary font-heading mb-6">
          Budget vs. Actual
        </h3>
        {budgetStatus?.budgetSet ? (
          <div className="max-w-xl space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-label text-text-muted mb-1">Budget Limit</p>
                <MoneyDisplay
                  amount={budgetStatus.budget}
                  currency={currency}
                  className="text-xl font-semibold text-text-primary"
                />
              </div>
              <div>
                <p className="text-label text-text-muted mb-1">Spent</p>
                <MoneyDisplay
                  amount={budgetStatus.spent}
                  currency={currency}
                  className="text-xl font-semibold text-text-primary"
                />
              </div>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: Math.min(budgetStatus.percentage, 100) / 100,
                }}
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
            <div className="flex justify-between text-caption">
              <span
                className={cn(
                  "font-medium",
                  budgetStatus.warningLevel === "exceeded" ||
                    budgetStatus.warningLevel === "danger"
                    ? "text-red"
                    : budgetStatus.warningLevel === "warning"
                      ? "text-amber"
                      : "text-accent"
                )}
              >
                {budgetStatus.percentage.toFixed(0)}% consumed
              </span>
              <span className="text-text-muted">
                {budgetStatus.budget >= budgetStatus.spent
                  ? `${formatMoney(budgetStatus.budget - budgetStatus.spent, currency)} left`
                  : `${formatMoney(budgetStatus.spent - budgetStatus.budget, currency)} over`}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted mb-4">
              No monthly budget set yet
            </p>
            <Link
              href="/budget"
              className="btn-primary !h-11 !text-sm"
            >
              Set Budget
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
