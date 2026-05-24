"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion } from "motion/react";
import { formatMoney } from "@/lib/format-money";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { toast } from "sonner";
import { ArrowRight, Check, Clock, CheckCircle } from "lucide-react";

interface SettlementsTabProps {
  tripId: Id<"trips">;
  currency: string;
}

export function SettlementsTab({ tripId, currency }: SettlementsTabProps) {
  const settlements = useQuery(api.settlements.getTripSettlements, { tripId });
  const markCompleted = useMutation(api.settlements.markSettlementCompleted);

  const handleComplete = async (settlementId: Id<"settlements">) => {
    try {
      await markCompleted({ settlementId });
      toast.success("Settlement marked as completed! 🎉");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete");
    }
  };

  if (!settlements) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  const pending = settlements.filter((s) => s.status === "pending");
  const completed = settlements.filter((s) => s.status === "completed");

  return (
    <div className="space-y-6">
      {/* Pending */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Clock size={14} className="text-amber" />
          Pending ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center bg-card border border-border rounded-2xl">
            No pending settlements
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((settlement, i) => (
              <motion.div
                key={settlement._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-amber/20 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-text-primary">
                    {settlement.fromMember?.name ?? "Unknown"}
                  </span>
                  <ArrowRight size={14} className="text-text-muted" />
                  <span className="text-sm font-medium text-text-primary">
                    {settlement.toMember?.name ?? "Unknown"}
                  </span>
                </div>
                <span className="text-sm font-mono font-semibold text-text-primary">
                  {formatMoney(settlement.amount, currency)}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleComplete(settlement._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-background text-xs font-semibold rounded-xl transition-colors"
                >
                  <Check size={12} />
                  Complete
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <CheckCircle size={14} className="text-accent" />
          Completed ({completed.length})
        </h3>
        {completed.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center bg-card border border-border rounded-2xl">
            No completed settlements yet
          </p>
        ) : (
          <div className="space-y-3">
            {completed.map((settlement, i) => (
              <motion.div
                key={settlement._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 opacity-60"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-text-primary">
                    {settlement.fromMember?.name ?? "Unknown"}
                  </span>
                  <ArrowRight size={14} className="text-text-muted" />
                  <span className="text-sm font-medium text-text-primary">
                    {settlement.toMember?.name ?? "Unknown"}
                  </span>
                </div>
                <span className="text-sm font-mono text-text-secondary">
                  {formatMoney(settlement.amount, currency)}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                  ✓ Settled
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
