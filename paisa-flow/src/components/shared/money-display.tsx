"use client";

import { useMotionValue, animate } from "motion/react";
import { useEffect, useRef } from "react"; // ref for animated span
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";

interface MoneyDisplayProps {
  amount: number;
  currency?: string;
  compact?: boolean;
  className?: string;
  animated?: boolean;
  prefix?: string;
  showSign?: boolean;
  positiveColor?: string;
  negativeColor?: string;
}

export function MoneyDisplay({
  amount,
  currency = "INR",
  compact = false,
  className = "",
  animated = true,
  prefix,
  showSign = false,
  positiveColor,
  negativeColor,
}: MoneyDisplayProps) {
  const motionValue = useMotionValue(amount);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!animated) return;
    const controls = animate(motionValue, amount, {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1],
      onUpdate(v) {
        if (ref.current) {
          const sign = showSign && v > 0 ? "+" : "";
          ref.current.textContent = `${prefix ?? ""}${sign}${formatMoney(v, currency, compact)}`;
        }
      },
    });
    return () => controls.stop();
  }, [amount, currency, compact, animated, prefix, showSign, motionValue]);

  const colorClass =
    amount < 0
      ? negativeColor ?? "text-red"
      : amount > 0 && showSign
        ? positiveColor ?? "text-accent"
        : "";

  if (!animated) {
    const sign = showSign && amount > 0 ? "+" : "";
    return (
      <span className={cn("font-mono-amount", colorClass, className)}>
        {prefix}
        {sign}
        {formatMoney(amount, currency, compact)}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cn("font-mono-amount inline-block", colorClass, className)}
    >
      {prefix}
      {formatMoney(amount, currency, compact)}
    </span>
  );
}
