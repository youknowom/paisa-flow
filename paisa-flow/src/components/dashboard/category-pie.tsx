"use client";

import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@/lib/format-money";
import { getCategoryStyle } from "@/lib/category-config";
import { MoneyDisplay } from "@/components/shared/money-display";

interface CategoryPieProps {
  data: { category: string; amount: number; percentage: number }[];
  currency: string;
}

export function CategoryPie({ data, currency }: CategoryPieProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-5"
      >
        <h3 className="text-h3 font-medium text-text-primary font-heading mb-4">
          By Category
        </h3>
        <p className="text-sm text-text-muted py-12 text-center">
          No category data yet
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="card-surface p-5"
    >
      <h3 className="text-h3 font-medium text-text-primary font-heading mb-4">
        By Category
      </h3>
      <div className="h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={2}
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={getCategoryStyle(entry.category).color}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0].payload;
                return (
                  <div className="bg-surface-2 border border-accent/30 rounded-xl px-3 py-2">
                    <p className="text-caption text-text-muted capitalize">
                      {getCategoryStyle(entry.category).label}
                    </p>
                    <p className="text-sm font-mono-amount font-semibold">
                      {formatMoney(entry.amount, currency)}
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <MoneyDisplay
            amount={total}
            currency={currency}
            compact
            className="text-lg font-bold text-text-primary"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {data.slice(0, 5).map((entry) => {
          const style = getCategoryStyle(entry.category);
          return (
            <div
              key={entry.category}
              className="flex items-center gap-1.5 text-caption text-text-muted"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: style.color }}
              />
              <span>{style.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
