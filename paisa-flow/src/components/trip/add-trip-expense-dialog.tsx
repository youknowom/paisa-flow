"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, AlertCircle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { tripExpenseSchema, type TripExpenseInput } from "@/lib/validations";
import { CATEGORIES } from "@/lib/constants";
import { formatMoney } from "@/lib/format-money";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

interface AddTripExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  tripId: Id<"trips">;
  currency: string;
}

interface MemberSplitState {
  memberId: Id<"tripMembers">;
  memberName: string;
  isIncluded: boolean;
  amount: number;
  percentage: number;
}

export function AddTripExpenseDialog({
  open,
  onClose,
  tripId,
  currency,
}: AddTripExpenseDialogProps) {
  const members = useQuery(api.tripMembers.getTripMembers, { tripId });
  const createExpense = useMutation(api.tripExpenses.createTripExpense);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TripExpenseInput>({
    resolver: zodResolver(tripExpenseSchema),
    defaultValues: {
      title: "",
      amount: undefined,
      category: "",
      paidByMemberId: "",
      date: todayStr,
      splitType: "equal",
      note: "",
    },
  });

  const splitType = watch("splitType");
  const expenseAmount = watch("amount") || 0;

  // Member split state
  const [memberSplits, setMemberSplits] = useState<MemberSplitState[]>([]);

  // Initialize splits when members load
  useMemo(() => {
    if (members && members.length > 0 && memberSplits.length !== members.length) {
      setMemberSplits(
        members.map((m) => ({
          memberId: m._id,
          memberName: m.name,
          isIncluded: true,
          amount: 0,
          percentage: members.length > 0 ? Math.round((100 / members.length) * 100) / 100 : 0,
        }))
      );
    }
  }, [members, memberSplits.length]);

  // Computed equal split
  const includedMembers = memberSplits.filter((m) => m.isIncluded);
  const equalShare = includedMembers.length > 0
    ? Math.floor((expenseAmount / includedMembers.length) * 100) / 100
    : 0;

  // Custom split total
  const customTotal = memberSplits
    .filter((m) => m.isIncluded)
    .reduce((sum, m) => sum + m.amount, 0);
  const customDiff = Math.abs(customTotal - expenseAmount);

  // Percentage total
  const percentageTotal = memberSplits
    .filter((m) => m.isIncluded)
    .reduce((sum, m) => sum + m.percentage, 0);

  const toggleMemberInclusion = (memberId: Id<"tripMembers">) => {
    setMemberSplits((prev) =>
      prev.map((m) =>
        m.memberId === memberId ? { ...m, isIncluded: !m.isIncluded } : m
      )
    );
  };

  const updateMemberAmount = (memberId: Id<"tripMembers">, amount: number) => {
    setMemberSplits((prev) =>
      prev.map((m) =>
        m.memberId === memberId ? { ...m, amount } : m
      )
    );
  };

  const updateMemberPercentage = (memberId: Id<"tripMembers">, percentage: number) => {
    setMemberSplits((prev) =>
      prev.map((m) =>
        m.memberId === memberId ? { ...m, percentage } : m
      )
    );
  };

  // Validation
  const isSplitValid = useMemo(() => {
    if (includedMembers.length === 0) return false;
    if (expenseAmount <= 0) return false;

    if (splitType === "equal") return true;
    if (splitType === "custom") return customDiff <= 0.01;
    if (splitType === "percentage") return Math.abs(percentageTotal - 100) <= 0.01;
    return false;
  }, [splitType, includedMembers.length, expenseAmount, customDiff, percentageTotal]);

  const onSubmit = async (data: TripExpenseInput) => {
    if (!isSplitValid) {
      toast.error("Please fix split configuration before submitting");
      return;
    }

    try {
      const splits = memberSplits.map((m) => {
        if (splitType === "equal") {
          return {
            memberId: m.memberId,
            isIncluded: m.isIncluded,
            amount: m.isIncluded ? equalShare : 0,
          };
        } else if (splitType === "custom") {
          return {
            memberId: m.memberId,
            isIncluded: m.isIncluded,
            amount: m.isIncluded ? m.amount : 0,
          };
        } else {
          return {
            memberId: m.memberId,
            isIncluded: m.isIncluded,
            percentage: m.isIncluded ? m.percentage : 0,
          };
        }
      });

      await createExpense({
        tripId,
        paidByMemberId: data.paidByMemberId as Id<"tripMembers">,
        amount: data.amount,
        category: data.category,
        title: data.title,
        note: data.note || undefined,
        date: data.date,
        splitType: data.splitType,
        splits,
      });

      toast.success(
        `Expense "${data.title}" added: ${formatMoney(data.amount, currency)}`
      );
      reset();
      setMemberSplits(
        members?.map((m) => ({
          memberId: m._id,
          memberName: m.name,
          isIncluded: true,
          amount: 0,
          percentage: members.length > 0 ? Math.round((100 / members.length) * 100) / 100 : 0,
        })) ?? []
      );
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add expense"
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                Add Trip Expense
              </h2>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">Title</label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="e.g. Dinner at beach restaurant"
                  className="w-full bg-card-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted/50"
                />
                {errors.title && <p className="text-red text-xs mt-1">{errors.title.message}</p>}
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-muted mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("amount", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full bg-card-hover border border-border rounded-xl px-4 py-2.5 text-lg font-mono text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted/30"
                  />
                  {errors.amount && <p className="text-red text-xs mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1.5 block">Category</label>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full bg-card-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors [color-scheme:dark]"
                      >
                        <option value="">Select</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.emoji} {c.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.category && <p className="text-red text-xs mt-1">{errors.category.message}</p>}
                </div>
              </div>

              {/* Paid By */}
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">Paid By</label>
                <Controller
                  control={control}
                  name="paidByMemberId"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {members?.map((m) => (
                        <button
                          key={m._id}
                          type="button"
                          onClick={() => field.onChange(m._id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            field.value === m._id
                              ? "bg-accent/10 border-accent/40 text-accent"
                              : "bg-card-hover border-border text-text-secondary"
                          }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.paidByMemberId && (
                  <p className="text-red text-xs mt-1">{errors.paidByMemberId.message}</p>
                )}
              </div>

              {/* Date & Note */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-muted mb-1.5 block">Date</label>
                  <input
                    type="date"
                    {...register("date")}
                    className="w-full bg-card-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1.5 block">Note</label>
                  <input
                    type="text"
                    {...register("note")}
                    placeholder="Optional"
                    className="w-full bg-card-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent transition-colors placeholder:text-text-muted/50"
                  />
                </div>
              </div>

              {/* Split Type */}
              <div>
                <label className="text-sm text-text-muted mb-1.5 block">Split Type</label>
                <Controller
                  control={control}
                  name="splitType"
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {[
                        { value: "equal" as const, label: "Equal" },
                        { value: "custom" as const, label: "Custom" },
                        { value: "percentage" as const, label: "Percentage" },
                      ].map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                            field.value === type.value
                              ? "bg-accent/10 border-accent/40 text-accent"
                              : "bg-card-hover border-border text-text-secondary"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Split Configuration */}
              <div className="bg-card-hover border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-muted uppercase tracking-wide">
                    Split among
                  </span>
                  {splitType === "custom" && (
                    <span
                      className={`text-xs font-mono ${customDiff <= 0.01 ? "text-accent" : "text-red"}`}
                    >
                      {formatMoney(customTotal, currency)} / {formatMoney(expenseAmount, currency)}
                    </span>
                  )}
                  {splitType === "percentage" && (
                    <span
                      className={`text-xs font-mono ${Math.abs(percentageTotal - 100) <= 0.01 ? "text-accent" : "text-red"}`}
                    >
                      {percentageTotal.toFixed(1)}% / 100%
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {memberSplits.map((member) => (
                    <div
                      key={member.memberId}
                      className="flex items-center gap-3"
                    >
                      {/* Checkbox for inclusion */}
                      <button
                        type="button"
                        onClick={() => toggleMemberInclusion(member.memberId)}
                        className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${
                          member.isIncluded
                            ? "bg-accent border-accent"
                            : "bg-card-hover border-border"
                        }`}
                      >
                        {member.isIncluded && (
                          <Check size={12} className="text-background" />
                        )}
                      </button>

                      <span
                        className={`text-sm flex-1 ${
                          member.isIncluded ? "text-text-primary" : "text-text-muted line-through"
                        }`}
                      >
                        {member.memberName}
                      </span>

                      {/* Split value based on type */}
                      {splitType === "equal" && member.isIncluded && (
                        <span className="text-xs font-mono text-text-secondary">
                          {formatMoney(equalShare, currency)}
                        </span>
                      )}
                      {splitType === "custom" && member.isIncluded && (
                        <input
                          type="number"
                          step="0.01"
                          value={member.amount || ""}
                          onChange={(e) =>
                            updateMemberAmount(
                              member.memberId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                          className="w-24 bg-card border border-border rounded-lg px-2 py-1 text-xs font-mono text-text-primary outline-none focus:border-accent text-right"
                        />
                      )}
                      {splitType === "percentage" && member.isIncluded && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            value={member.percentage || ""}
                            onChange={(e) =>
                              updateMemberPercentage(
                                member.memberId,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            className="w-16 bg-card border border-border rounded-lg px-2 py-1 text-xs font-mono text-text-primary outline-none focus:border-accent text-right"
                          />
                          <span className="text-xs text-text-muted">%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Validation message */}
                {expenseAmount > 0 && !isSplitValid && includedMembers.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 text-red">
                    <AlertCircle size={14} />
                    <span className="text-xs">
                      {splitType === "custom"
                        ? `Amounts differ by ${formatMoney(customDiff, currency)} from the total`
                        : splitType === "percentage"
                          ? `Percentages sum to ${percentageTotal.toFixed(1)}%, not 100%`
                          : "Select at least one member"}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !isSplitValid}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
              >
                {isSubmitting ? "Adding..." : "Add Expense"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
