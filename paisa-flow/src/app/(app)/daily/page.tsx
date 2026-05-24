"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { EmptyState } from "@/components/shared/empty-state";
import { ExpenseCardSkeleton } from "@/components/shared/loading-skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AddExpenseDialog } from "@/components/daily/add-expense-dialog";
import { ExpenseCard } from "@/components/daily/expense-card";
import { ExpenseFilters } from "@/components/daily/expense-filters";
import {
  SummaryPills,
  FloatingMonthSummary,
} from "@/components/daily/monthly-summary";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function DailyExpensesPage() {
  const { user } = useCurrentUser();
  const currency = user?.currency || "INR";

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [category, setCategory] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<{
    id: Id<"dailyExpenses">;
    amount: number;
    category: string;
    note: string;
    paymentMode: string;
    date: string;
    isRecurring: boolean;
  } | null>(null);
  const [deleteId, setDeleteId] = useState<Id<"dailyExpenses"> | null>(null);
  const [deleting, setDeleting] = useState(false);

  const expenses = useQuery(api.dailyExpenses.getDailyExpenses, {
    month,
    year,
    category: category || undefined,
    paymentMode: paymentMode || undefined,
  });

  const monthlySummary = useQuery(api.dailyExpenses.getMonthlyExpenseSummary, {
    month,
    year,
  });

  const deleteExpense = useMutation(api.dailyExpenses.deleteDailyExpense);

  const todayStr = `${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const { weekTotal, todayTotal } = useMemo(() => {
    if (!expenses) return { weekTotal: 0, todayTotal: 0 };
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split("T")[0];
    let week = 0;
    let today = 0;
    for (const e of expenses) {
      if (e.date >= weekStr) week += e.amount;
      if (e.date === todayStr) today += e.amount;
    }
    return { weekTotal: week, todayTotal: today };
  }, [expenses, todayStr]);

  const groupedExpenses = useMemo(() => {
    if (!expenses) return [];
    const groups = new Map<string, typeof expenses>();
    const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
    for (const e of sorted) {
      const list = groups.get(e.date) ?? [];
      list.push(e);
      groups.set(e.date, list);
    }
    return Array.from(groups.entries());
  }, [expenses]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteExpense({ id: deleteId });
      toast.success("Expense deleted");
      setDeleteId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete expense"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (expense: NonNullable<typeof expenses>[number]) => {
    setEditData({
      id: expense._id,
      amount: expense.amount,
      category: expense.category,
      note: expense.note,
      paymentMode: expense.paymentMode,
      date: expense.date,
      isRecurring: expense.isRecurring,
    });
    setDialogOpen(true);
  };

  return (
    <div className="pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="page-title">Daily Spend</h1>
        <button
          type="button"
          onClick={() => {
            setEditData(null);
            setDialogOpen(true);
          }}
          className="btn-primary hidden md:inline-flex"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {monthlySummary && (
        <SummaryPills
          monthTotal={monthlySummary.totalSpent}
          weekTotal={weekTotal}
          todayTotal={todayTotal}
          currency={currency}
        />
      )}

      <ExpenseFilters
        month={month}
        year={year}
        category={category}
        paymentMode={paymentMode}
        onMonthChange={(m, y) => {
          setMonth(m);
          setYear(y);
        }}
        onCategoryChange={setCategory}
        onPaymentModeChange={setPaymentMode}
      />

      {expenses === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ExpenseCardSkeleton key={i} />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Tap the + button below to add your first expense."
          lottieUrl="https://lottie.host/f2a3ec55-5771-4498-b230-7e5070e27e25/gKzXgYHPgI.lottie"
        />
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {groupedExpenses.map(([date, items]) => (
              <div key={date}>
                <p className="text-label text-text-muted mb-3 sticky top-0 bg-background/90 backdrop-blur-sm py-1 z-10">
                  {formatDateHeader(date)}
                </p>
                <div className="space-y-3">
                  {items.map((expense) => (
                    <ExpenseCard
                      key={expense._id}
                      expense={expense}
                      currency={currency}
                      onEdit={() => handleEdit(expense)}
                      onDelete={() => setDeleteId(expense._id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {monthlySummary && (
        <FloatingMonthSummary
          total={monthlySummary.totalSpent}
          currency={currency}
          monthLabel={`${MONTHS[month - 1]} ${year}`}
        />
      )}

      <AddExpenseDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditData(null);
        }}
        currency={currency}
        defaultPaymentMode={user?.defaultPaymentMode ?? undefined}
        editData={editData}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description="This action cannot be undone. The expense will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
