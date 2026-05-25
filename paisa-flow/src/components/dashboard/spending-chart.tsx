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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="pf-card p-5"
    >
      <h3 className="text-[15px] font-bold text-text-primary font-heading mb-5">
        Weekly Trend
      </h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#8c8c8c",
                fontSize: 11,
                fontFamily: "var(--font-body)",
                fontWeight: 600,
              }}
              dy={8}
            />
            <Tooltip
              cursor={{ fill: "rgba(12, 131, 31, 0.04)", radius: 8 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0];
                return (
                  <div className="bg-white border border-border-subtle rounded-xl px-3 py-2 shadow-lg">
                    <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      {new Date(
                        entry.payload.date + "T00:00:00",
                      ).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-[15px] font-mono font-bold text-text-primary mt-0.5">
                      {formatMoney(entry.value as number, currency)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="amount"
              radius={[8, 8, 4, 4]}
              maxBarSize={32}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.date}
                  fill={
                    entry.date === today ? "#0C831F" : "#e8e4dc"
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
