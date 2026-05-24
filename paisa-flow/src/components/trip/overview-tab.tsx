"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "motion/react";
import { formatMoney } from "@/lib/format-money";
import { MoneyDisplay } from "@/components/shared/money-display";
import { CategoryIcon } from "@/components/shared/category-icon";
import { Skeleton } from "@/components/shared/loading-skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, Scale } from "lucide-react";

const COLORS = ["#22c55e", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

interface OverviewTabProps {
  tripId: Id<"trips">;
  currency: string;
}

export function OverviewTab({ tripId, currency }: OverviewTabProps) {
  const overview = useQuery(api.trips.getTripOverview, { tripId });

  if (!overview) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Expenses",
            value: overview.totalExpenses,
            icon: Wallet,
            iconColor: "text-accent",
            iconBg: "bg-accent/10",
          },
          {
            label: "My Paid",
            value: overview.myPaid,
            icon: TrendingUp,
            iconColor: "text-cyan",
            iconBg: "bg-cyan/10",
          },
          {
            label: "My Share",
            value: overview.myShare,
            icon: TrendingDown,
            iconColor: "text-violet",
            iconBg: "bg-violet/10",
          },
          {
            label: "My Balance",
            value: overview.myBalance,
            icon: Scale,
            iconColor: overview.myBalance >= 0 ? "text-accent" : "text-red",
            iconBg: overview.myBalance >= 0 ? "bg-accent/10" : "bg-red/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon size={14} className={stat.iconColor} />
              </div>
              <span className="text-[10px] text-text-muted uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <MoneyDisplay
              amount={stat.value}
              currency={currency}
              className="text-lg font-bold text-text-primary"
              showSign={stat.label === "My Balance"}
            />
          </motion.div>
        ))}
      </div>

      {/* Category Breakdown & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Category Breakdown
          </h3>
          {overview.categoryBreakdown.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">
              No expenses yet
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview.categoryBreakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={55}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {overview.categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const entry = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-xl">
                            <p className="text-xs font-medium text-text-primary">
                              {entry.category}
                            </p>
                            <p className="text-sm font-mono text-text-primary">
                              {formatMoney(entry.amount, currency)}
                            </p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {overview.categoryBreakdown.slice(0, 5).map((item, i) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-xs text-text-secondary flex-1 truncate capitalize">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono text-text-muted">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Trip Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Trip Info
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Members</span>
              <span className="text-text-primary">{overview.memberCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Expenses</span>
              <span className="text-text-primary">{overview.expenseCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Avg per person</span>
              <span className="text-text-primary font-mono">
                {overview.memberCount > 0
                  ? formatMoney(overview.totalExpenses / overview.memberCount, currency)
                  : "—"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      {overview.timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {overview.timeline.slice(0, 10).map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.03 }}
                className="flex items-center gap-3 py-2"
              >
                <CategoryIcon category={item.category} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.paidByName} ·{" "}
                    {new Date(item.date + "T00:00:00").toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span className="text-sm font-mono text-text-primary">
                  {formatMoney(item.amount, currency)}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
