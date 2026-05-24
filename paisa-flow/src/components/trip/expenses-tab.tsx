"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "motion/react";
import { formatMoney } from "@/lib/format-money";
import { CategoryIcon } from "@/components/shared/category-icon";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AddTripExpenseDialog } from "./add-trip-expense-dialog";
import { ExpenseCardSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface ExpensesTabProps {
  tripId: Id<"trips">;
  currency: string;
}

export function ExpensesTab({ tripId, currency }: ExpensesTabProps) {
  const expenses = useQuery(api.tripExpenses.getTripExpenses, { tripId });
  const deleteExpense = useMutation(api.tripExpenses.deleteTripExpense);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<Id<"tripExpenses"> | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteExpense({ expenseId: deleteId });
      toast.success("Trip expense deleted");
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete expense");
    } finally {
      setDeleting(false);
    }
  };

  if (expenses === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ExpenseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl transition-colors text-sm"
        >
          <Plus size={16} />
          Add Expense
        </motion.button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Add the first expense for this trip."
          lottieUrl="https://lottie.host/f2a3ec55-5771-4498-b230-7e5070e27e25/gKzXgYHPgI.lottie"
          action={
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setDialogOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl transition-colors text-sm"
            >
              <Plus size={16} />
              Add First Expense
            </motion.button>
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {expenses.map((expense, i) => (
              <motion.div
                key={expense._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-2xl p-4 group hover:border-border-hover transition-all"
              >
                <div className="flex items-start gap-3">
                  <CategoryIcon category={expense.category} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {expense.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-semibold text-text-primary">
                          {formatMoney(expense.amount, currency)}
                        </span>
                        <button
                          onClick={() => setDeleteId(expense._id)}
                          className="p-1 rounded-lg hover:bg-red/10 text-text-muted hover:text-red transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-muted">
                        Paid by{" "}
                        <span className="text-accent font-medium">
                          {expense.paidByMemberName}
                        </span>
                      </span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">
                        {new Date(expense.date + "T00:00:00").toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-card-hover text-text-muted capitalize">
                        {expense.splitType}
                      </span>
                    </div>
                    {/* Split details */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {expense.splits
                        .filter((s) => s.isIncluded)
                        .map((split) => (
                          <span
                            key={split.memberId}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-card-hover border border-border text-text-muted"
                          >
                            {split.memberName}: {formatMoney(split.amount, currency)}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddTripExpenseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        tripId={tripId}
        currency={currency}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Trip Expense"
        description="This will also delete all associated splits."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
