"use client";

import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatMoney } from "@/lib/format-money";

interface SpendingChartProps {
  data: { date: string; amount: number }[];
  currency: string;
}

export function SpendingChart({ data, currency }: SpendingChartProps) {
  const today = new Date().toISOString().split("T")[0];

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-IN", { weekday: "short" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-surface p-5 mb-8"
    >
      <h3 className="text-h3 font-medium text-text-primary font-heading mb-6">
        Weekly Trend
      </h3>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="18%">
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0C831F" />
                <stop offset="100%" stopColor="#0A6B19" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B6B6B", fontSize: 11, fontFamily: "var(--font-inter)" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 210, 106, 0.05)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0];
                return (
                  <div className="bg-surface-2 border border-accent/30 rounded-xl px-3 py-2 shadow-xl">
                    <p className="text-caption text-text-muted">
                      {new Date(
                        entry.payload.date + "T00:00:00"
                      ).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-sm font-mono-amount font-semibold text-text-primary mt-0.5">
                      {formatMoney(entry.value as number, currency)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="amount"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.date}
                  fill={
                    entry.date === today
                      ? "url(#greenGradient)"
                      : "#E5E5E5"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
