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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pf-card p-5"
      >
        <h3 className="text-[15px] font-bold text-text-primary font-heading mb-4">
          By Category
        </h3>
        <p className="text-[13px] text-text-muted py-12 text-center">
          No category data yet
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="pf-card p-5"
    >
      <h3 className="text-[15px] font-bold text-text-primary font-heading mb-4">
        By Category
      </h3>
      <div className="h-48 relative">
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
              animationDuration={700}
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
                  <div className="bg-white border border-border-subtle rounded-xl px-3 py-2 shadow-lg">
                    <p className="text-[11px] font-semibold text-text-muted capitalize uppercase tracking-wider">
                      {getCategoryStyle(entry.category).label}
                    </p>
                    <p className="text-[14px] font-mono font-bold text-text-primary mt-0.5">
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
            className="text-[17px] font-bold text-text-primary"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {data.slice(0, 5).map((entry) => {
          const style = getCategoryStyle(entry.category);
          return (
            <div
              key={entry.category}
              className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
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
