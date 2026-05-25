"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { MoneyDisplay } from "@/components/shared/money-display";

interface HeroCardProps {
  totalSpent: number;
  currency: string;
  changePercent?: number;
}

export function HeroCard({
  totalSpent,
  currency,
  changePercent = 0,
}: HeroCardProps) {
  const isUp = changePercent >= 0;

  return (
    <div className="rounded-2xl p-5 md:p-6 shadow-md bg-gradient-to-br from-[#f8cb46] to-[#f5be2a] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10">
        <p className="text-[12px] font-bold text-[#5c4a17] font-heading mb-2 tracking-wider uppercase">
          Total Spent This Month
        </p>
        <MoneyDisplay
          amount={totalSpent}
          currency={currency}
          className="text-[32px] md:text-[40px] font-bold font-mono tracking-tight text-[#2d240b] leading-none"
        />
        <div className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-black/8 backdrop-blur-sm">
          {isUp ? (
            <TrendingUp size={14} className="text-[#3a2f0e]" />
          ) : (
            <TrendingDown size={14} className="text-[#e11d48]" />
          )}
          <span className="text-[12px] font-bold text-[#3a2f0e]">
            {Math.abs(changePercent).toFixed(0)}% vs last month
          </span>
        </div>
      </div>
    </div>
  );
}
