"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { dailyExpenseSchema, type DailyExpenseInput } from "@/lib/validations";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";
import { getCategoryStyle } from "@/lib/category-config";
import { toast } from "sonner";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  currency: string;
  defaultPaymentMode?: string;
  editData?: {
    id: Id<"dailyExpenses">;
    amount: number;
    category: string;
    note: string;
    paymentMode: string;
    date: string;
    isRecurring: boolean;
  } | null;
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency] ?? currency;
}

export function AddExpenseDialog({
  open,
  onClose,
  currency,
  defaultPaymentMode,
  editData,
}: AddExpenseDialogProps) {
  const createExpense = useMutation(api.dailyExpenses.createDailyExpense);
  const updateExpense = useMutation(api.dailyExpenses.updateDailyExpense);
  const isEditing = !!editData;
  const symbol = getCurrencySymbol(currency);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DailyExpenseInput>({
    resolver: zodResolver(dailyExpenseSchema),
    defaultValues: editData
      ? {
          amount: editData.amount,
          category: editData.category,
          note: editData.note,
          paymentMode: editData.paymentMode,
          date: editData.date,
          isRecurring: editData.isRecurring,
        }
      : {
          amount: undefined,
          category: "",
          note: "",
          paymentMode: defaultPaymentMode || "upi",
          date: todayStr,
          isRecurring: false,
        },
  });

  const amountValue = watch("amount");
  const [displayAmount, setDisplayAmount] = useState("");

  useEffect(() => {
    if (open && editData) {
      setDisplayAmount(String(editData.amount));
    } else if (open) {
      setDisplayAmount("");
    }
  }, [open, editData]);

  const onSubmit = async (data: DailyExpenseInput) => {
    try {
      if (isEditing && editData) {
        await updateExpense({ id: editData.id, ...data });
        toast.success(`Expense updated: ${formatMoney(data.amount, currency)}`);
      } else {
        await createExpense(data);
        toast.success(`Expense added: ${formatMoney(data.amount, currency)}`);
      }
      reset();
      setDisplayAmount("");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save expense"
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="modal-sheet w-full md:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle md:hidden" />
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? "Edit Expense" : "Add Expense"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-text-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body pt-2">

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Amount */}
                <div>
                  <div className="flex items-baseline gap-1 border-b border-border-subtle focus-within:border-accent transition-colors pb-2">
                    <span className="text-2xl text-text-muted font-mono-amount">
                      {symbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      autoFocus
                      {...register("amount", {
                        valueAsNumber: true,
                        onChange: (e) =>
                          setDisplayAmount(e.target.value),
                      })}
                      placeholder="0"
                      className="flex-1 bg-transparent text-[28px] font-mono-amount font-semibold text-text-primary outline-none placeholder:text-text-disabled min-w-0"
                      style={{
                        width: `${Math.max(2, (displayAmount || amountValue?.toString() || "0").length)}ch`,
                      }}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red text-caption mt-2">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <div className="grid grid-cols-5 gap-2">
                        {CATEGORIES.map((cat) => {
                          const style = getCategoryStyle(cat.value);
                          const Icon = style.icon;
                          const selected = field.value === cat.value;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => field.onChange(cat.value)}
                              className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                                selected
                                  ? "border-transparent"
                                  : "border-border-subtle bg-surface-2"
                              )}
                              style={
                                selected
                                  ? {
                                      backgroundColor: style.bgTint,
                                      borderColor: style.color,
                                    }
                                  : undefined
                              }
                            >
                              <div className="relative">
                                <Icon
                                  size={18}
                                  style={{
                                    color: selected
                                      ? style.color
                                      : "#6B6B6B",
                                  }}
                                />
                                {selected && (
                                  <Check
                                    size={10}
                                    className="absolute -top-1 -right-1 text-accent"
                                  />
                                )}
                              </div>
                              <span
                                className={cn(
                                  "text-[10px] truncate w-full text-center font-heading",
                                  selected
                                    ? "text-text-primary font-medium"
                                    : "text-text-muted"
                                )}
                              >
                                {cat.label.split(" ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.category && (
                    <p className="text-red text-caption mt-2">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Note */}
                <div className="flex items-center justify-between gap-4 border-b border-border-subtle py-3">
                  <label className="text-sm text-text-muted flex-shrink-0">
                    Note
                  </label>
                  <input
                    type="text"
                    {...register("note")}
                    placeholder="What was this for?"
                    className="flex-1 bg-transparent text-sm text-text-primary text-right outline-none placeholder:text-text-disabled"
                  />
                </div>

                {/* Date */}
                <div className="flex items-center justify-between gap-4 border-b border-border-subtle py-3">
                  <label className="text-sm text-text-muted">Date</label>
                  <input
                    type="date"
                    {...register("date")}
                    className="bg-transparent text-sm text-text-primary outline-none"
                  />
                  {errors.date && (
                    <p className="text-red text-caption">{errors.date.message}</p>
                  )}
                </div>

                {/* Payment mode */}
                <div className="form-group">
                  <label className="form-label">Payment mode</label>
                  <Controller
                    control={control}
                    name="paymentMode"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2">
                        {PAYMENT_MODES.map((pm) => (
                          <button
                            key={pm.value}
                            type="button"
                            onClick={() => field.onChange(pm.value)}
                            className={cn(
                              "chip text-xs",
                              field.value === pm.value && "chip-active"
                            )}
                          >
                            {pm.label}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                  {errors.paymentMode && (
                    <p className="text-red text-caption mt-2">
                      {errors.paymentMode.message}
                    </p>
                  )}
                </div>

                {/* Recurring */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("isRecurring")}
                    className="w-4 h-4 rounded border-border-strong text-accent focus:ring-accent bg-surface-2"
                  />
                  <span className="text-sm text-text-secondary">
                    Recurring expense
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : isEditing ? (
                    "Update Expense"
                  ) : (
                    "Add Expense"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
