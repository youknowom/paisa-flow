import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ── Helper: Get authenticated user or throw ────────────────────────
async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) {
    throw new ConvexError("User not found. Please sign in again.");
  }
  return user;
}

/**
 * Creates a new daily expense for the authenticated user.
 */
export const createDailyExpense = mutation({
  args: {
    amount: v.number(),
    category: v.string(),
    note: v.string(),
    paymentMode: v.string(),
    date: v.string(),
    isRecurring: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (args.amount <= 0) {
      throw new ConvexError("Amount must be greater than 0");
    }

    const now = Date.now();
    const expenseId = await ctx.db.insert("dailyExpenses", {
      userId: user._id,
      amount: args.amount,
      category: args.category,
      note: args.note,
      paymentMode: args.paymentMode,
      date: args.date,
      isRecurring: args.isRecurring,
      createdAt: now,
      updatedAt: now,
    });

    return expenseId;
  },
});

/**
 * Updates an existing daily expense. Verifies the caller owns the expense.
 */
export const updateDailyExpense = mutation({
  args: {
    id: v.id("dailyExpenses"),
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    note: v.optional(v.string()),
    paymentMode: v.optional(v.string()),
    date: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const expense = await ctx.db.get(args.id);
    if (!expense) {
      throw new ConvexError("Expense not found");
    }

    if (expense.userId !== user._id) {
      throw new ConvexError("Not authorized to update this expense");
    }

    if (args.amount !== undefined && args.amount <= 0) {
      throw new ConvexError("Amount must be greater than 0");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.category !== undefined) updates.category = args.category;
    if (args.note !== undefined) updates.note = args.note;
    if (args.paymentMode !== undefined) updates.paymentMode = args.paymentMode;
    if (args.date !== undefined) updates.date = args.date;
    if (args.isRecurring !== undefined) updates.isRecurring = args.isRecurring;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

/**
 * Deletes a daily expense. Verifies the caller owns the expense.
 */
export const deleteDailyExpense = mutation({
  args: {
    id: v.id("dailyExpenses"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const expense = await ctx.db.get(args.id);
    if (!expense) {
      throw new ConvexError("Expense not found");
    }

    if (expense.userId !== user._id) {
      throw new ConvexError("Not authorized to delete this expense");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Fetches daily expenses with optional filtering by month/year/category/paymentMode.
 * Results are sorted by date descending.
 */
export const getDailyExpenses = query({
  args: {
    month: v.optional(v.number()),
    year: v.optional(v.number()),
    category: v.optional(v.string()),
    paymentMode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      return [];
    }

    let expenses = await ctx.db
      .query("dailyExpenses")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Filter by month/year if provided
    if (args.month !== undefined && args.year !== undefined) {
      const monthStr = String(args.month).padStart(2, "0");
      const prefix = `${args.year}-${monthStr}`;
      expenses = expenses.filter((e) => e.date.startsWith(prefix));
    }

    // Filter by category
    if (args.category) {
      expenses = expenses.filter((e) => e.category === args.category);
    }

    // Filter by payment mode
    if (args.paymentMode) {
      expenses = expenses.filter((e) => e.paymentMode === args.paymentMode);
    }

    // Sort by date descending
    expenses.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

    return expenses;
  },
});

/**
 * Returns a summary of expenses for a given month/year:
 * totalSpent, expenseCount, avgPerDay, topCategory, categoryBreakdown.
 */
export const getMonthlyExpenseSummary = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      throw new ConvexError("User not found");
    }

    const monthStr = String(args.month).padStart(2, "0");
    const prefix = `${args.year}-${monthStr}`;

    const allExpenses = await ctx.db
      .query("dailyExpenses")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const expenses = allExpenses.filter((e) => e.date.startsWith(prefix));

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const expenseCount = expenses.length;

    // Days in the month
    const daysInMonth = new Date(args.year, args.month, 0).getDate();
    const avgPerDay = expenseCount > 0 ? totalSpent / daysInMonth : 0;

    // Category breakdown
    const categoryMap = new Map<string, number>();
    for (const expense of expenses) {
      const current = categoryMap.get(expense.category) ?? 0;
      categoryMap.set(expense.category, current + expense.amount);
    }

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      })
    );
    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    const topCategory =
      categoryBreakdown.length > 0 ? categoryBreakdown[0].category : null;

    return {
      totalSpent,
      expenseCount,
      avgPerDay: Math.round(avgPerDay * 100) / 100,
      topCategory,
      categoryBreakdown,
    };
  },
});

/**
 * Returns category breakdown for a given month/year.
 * Array of { category, amount, percentage } sorted by amount desc.
 */
export const getCategoryBreakdown = query({
  args: {
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      throw new ConvexError("User not found");
    }

    const monthStr = String(args.month).padStart(2, "0");
    const prefix = `${args.year}-${monthStr}`;

    const allExpenses = await ctx.db
      .query("dailyExpenses")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const expenses = allExpenses.filter((e) => e.date.startsWith(prefix));

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryMap = new Map<string, number>();
    for (const expense of expenses) {
      const current = categoryMap.get(expense.category) ?? 0;
      categoryMap.set(expense.category, current + expense.amount);
    }

    const breakdown = Array.from(categoryMap.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 10000) / 100 : 0,
      })
    );

    breakdown.sort((a, b) => b.amount - a.amount);
    return breakdown;
  },
});

/**
 * Returns expense totals for the last 7 days: array of { date, amount }.
 */
export const getWeeklyTrend = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Build the last 7 days as YYYY-MM-DD strings
    const today = new Date();
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      days.push(`${yyyy}-${mm}-${dd}`);
    }

    const sevenDaysAgo = days[0];

    const allExpenses = await ctx.db
      .query("dailyExpenses")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", user._id).gte("date", sevenDaysAgo)
      )
      .collect();

    // Build a map of date -> total amount
    const dateMap = new Map<string, number>();
    for (const day of days) {
      dateMap.set(day, 0);
    }
    for (const expense of allExpenses) {
      if (dateMap.has(expense.date)) {
        dateMap.set(expense.date, (dateMap.get(expense.date) ?? 0) + expense.amount);
      }
    }

    return days.map((date) => ({
      date,
      amount: dateMap.get(date) ?? 0,
    }));
  },
});
