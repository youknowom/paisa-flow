import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

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
 * Sets or updates a budget for a given month/year.
 * Upserts: patches if exists for user+month+year+category, inserts if not.
 */
export const setBudget = mutation({
  args: {
    month: v.number(),
    year: v.number(),
    amount: v.number(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    if (args.amount <= 0) {
      throw new ConvexError("Budget amount must be greater than 0");
    }

    if (args.month < 1 || args.month > 12) {
      throw new ConvexError("Month must be between 1 and 12");
    }

    // Look for existing budget for this user + month + year
    const existingBudgets = await ctx.db
      .query("budgets")
      .withIndex("by_userId_month_year", (q) =>
        q.eq("userId", user._id).eq("month", args.month).eq("year", args.year)
      )
      .collect();

    // Find matching budget (same category or both null/undefined)
    const existingBudget = existingBudgets.find((b) => {
      if (args.category === undefined) {
        return b.category === undefined;
      }
      return b.category === args.category;
    });

    if (existingBudget) {
      // Update existing budget
      await ctx.db.patch(existingBudget._id, {
        amount: args.amount,
      });
      return existingBudget._id;
    }

    // Create new budget
    const budgetId = await ctx.db.insert("budgets", {
      userId: user._id,
      month: args.month,
      year: args.year,
      amount: args.amount,
      category: args.category,
      createdAt: Date.now(),
    });

    return budgetId;
  },
});

/**
 * Returns budget status for a given month/year.
 * Uses budgets table first, falls back to user.monthlyBudget.
 * Returns { budgetSet, budget, spent, percentage, warningLevel }.
 */
export const getBudgetStatus = query({
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

    // Get the overall budget (no category) for this month/year
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_userId_month_year", (q) =>
        q.eq("userId", user._id).eq("month", args.month).eq("year", args.year)
      )
      .collect();

    // Find overall budget (no category)
    const overallBudget = budgets.find((b) => b.category === undefined);
    const budgetAmount = overallBudget?.amount ?? user.monthlyBudget ?? 0;
    const budgetSet = budgetAmount > 0;

    // Sum daily expenses for this month/year
    const monthStr = String(args.month).padStart(2, "0");
    const prefix = `${args.year}-${monthStr}`;

    const allExpenses = await ctx.db
      .query("dailyExpenses")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const monthExpenses = allExpenses.filter((e) => e.date.startsWith(prefix));
    const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Compute percentage
    const percentage = budgetSet
      ? Math.round((spent / budgetAmount) * 10000) / 100
      : 0;

    // Determine warning level
    let warningLevel: "safe" | "warning" | "danger" | "exceeded" = "safe";
    if (budgetSet) {
      if (percentage >= 100) {
        warningLevel = "exceeded";
      } else if (percentage >= 90) {
        warningLevel = "danger";
      } else if (percentage >= 75) {
        warningLevel = "warning";
      }
    }

    return {
      budgetSet,
      budget: budgetAmount,
      spent: Math.round(spent * 100) / 100,
      percentage,
      warningLevel,
    };
  },
});
