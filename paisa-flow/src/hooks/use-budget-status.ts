"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { BudgetStatus } from "@/types";

export function useBudgetStatus() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed
  const year = now.getFullYear();

  const budgetStatus = useQuery(api.budgets.getBudgetStatus, { month, year });

  return {
    budgetStatus: budgetStatus as BudgetStatus | undefined,
    isLoading: budgetStatus === undefined,
    month,
    year,
  };
}
