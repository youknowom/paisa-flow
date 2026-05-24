"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import { formatMoney } from "@/lib/format-money";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalancesTabProps {
  tripId: Id<"trips">;
  currency: string;
}

function MemberBalanceCard({
  name,
  totalPaid,
  totalShare,
  balance,
  currency,
  delay,
}: {
  name: string;
  totalPaid: number;
  totalShare: number;
  balance: number;
  currency: string;
  delay: number;
}) {
  const isPositive = balance >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "card-surface-elevated p-4 flex items-center gap-4 border-l-[3px]",
        isPositive ? "border-l-accent" : "border-l-red"
      )}
    >
      <Avatar name={name} size="2xl" />
      <div className="flex-1 grid grid-cols-3 gap-2">
        <div>
          <p className="text-label text-text-muted">Paid</p>
          <p className="text-base font-mono-amount text-text-primary">
            {formatMoney(totalPaid, currency, true)}
          </p>
        </div>
        <div>
          <p className="text-label text-text-muted">Share</p>
          <p className="text-base font-mono-amount text-text-primary">
            {formatMoney(totalShare, currency, true)}
          </p>
        </div>
        <div>
          <p className="text-label text-text-muted">Balance</p>
          <p
            className={cn(
              "text-base font-mono-amount font-semibold",
              isPositive ? "text-accent" : "text-red"
            )}
          >
            {balance >= 0 ? "+" : ""}
            {formatMoney(balance, currency, true)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function BalancesTab({ tripId, currency }: BalancesTabProps) {
  const balances = useQuery(api.balances.getTripBalances, { tripId });
  const suggestions = useQuery(api.balances.getSettlementSuggestions, {
    tripId,
  });
  const createSettlement = useMutation(api.settlements.createSettlement);
  const markCompleted = useMutation(api.settlements.markSettlementCompleted);
  const [settlingIndex, setSettlingIndex] = useState<number | null>(null);
  const [settledIndices, setSettledIndices] = useState<Set<number>>(new Set());

  const handleSettle = async (
    index: number,
    fromMemberId: Id<"tripMembers">,
    toMemberId: Id<"tripMembers">,
    amount: number
  ) => {
    setSettlingIndex(index);
    try {
      const settlementId = await createSettlement({
        tripId,
        fromMemberId,
        toMemberId,
        amount,
      });
      await markCompleted({ settlementId });
      setSettledIndices((prev) => new Set(prev).add(index));
      toast.success(`Settlement of ${formatMoney(amount, currency)} recorded!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to settle"
      );
    } finally {
      setSettlingIndex(null);
    }
  };

  if (!balances || !suggestions) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-h3 font-medium text-text-primary font-heading mb-4">
          Member Balances
        </h3>
        <div className="space-y-3">
          {balances.map((member, i) => (
            <MemberBalanceCard
              key={member.memberId}
              name={member.memberName}
              totalPaid={member.totalPaid}
              totalShare={member.totalShare}
              balance={member.balance}
              currency={currency}
              delay={i * 0.05}
            />
          ))}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div>
          <h3 className="text-h3 font-medium text-text-primary font-heading mb-2">
            Settlement Suggestions
          </h3>
          <p className="text-caption text-text-muted mb-4">
            Minimum {suggestions.length} payment
            {suggestions.length !== 1 ? "s" : ""} to settle all debts
          </p>
          <div className="space-y-3">
            <AnimatePresence>
              {suggestions.map((suggestion, i) => {
                if (settledIndices.has(i)) return null;
                return (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card-surface p-4 flex items-center gap-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar
                        name={suggestion.fromMemberName}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-text-primary truncate">
                        {suggestion.fromMemberName}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <ArrowRight size={16} className="text-text-muted" />
                      <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-caption font-mono-amount font-semibold">
                        {formatMoney(suggestion.amount, currency, true)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {suggestion.toMemberName}
                      </span>
                      <Avatar
                        name={suggestion.toMemberName}
                        size="sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      loading={settlingIndex === i}
                      onClick={() =>
                        handleSettle(
                          i,
                          suggestion.fromMemberId,
                          suggestion.toMemberId,
                          suggestion.amount
                        )
                      }
                      className="flex-shrink-0 ml-2"
                    >
                      Settle Up
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {suggestions.length === 0 && balances.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 card-surface"
        >
          <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-3">
            <Check size={24} className="text-accent" />
          </div>
          <p className="text-sm text-text-secondary">All settled up!</p>
        </motion.div>
      )}
    </div>
  );
}
