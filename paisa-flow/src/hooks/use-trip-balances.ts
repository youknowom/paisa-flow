"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useTripBalances(tripId: Id<"trips">) {
  const balances = useQuery(api.balances.getTripBalances, { tripId });
  const settlements = useQuery(api.balances.getSettlementSuggestions, { tripId });

  return {
    balances: balances ?? [],
    settlements: settlements ?? [],
    isLoading: balances === undefined || settlements === undefined,
  };
}
