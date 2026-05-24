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

// ── Helper: Verify trip access (owner or member) ───────────────────
async function verifyTripAccess(ctx: any, tripId: Id<"trips">, userId: Id<"users">) {
  const trip = await ctx.db.get(tripId);
  if (!trip) {
    throw new ConvexError("Trip not found");
  }

  if (trip.ownerId !== userId) {
    const membership = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q: any) => q.eq("tripId", tripId))
      .filter((q: any) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new ConvexError("Not authorized to access this trip");
    }
  }

  return trip;
}

/**
 * Creates a trip expense with splits.
 * Supports equal, custom, and percentage split types.
 */
export const createTripExpense = mutation({
  args: {
    tripId: v.id("trips"),
    paidByMemberId: v.id("tripMembers"),
    amount: v.number(),
    category: v.string(),
    title: v.string(),
    note: v.optional(v.string()),
    date: v.string(),
    splitType: v.string(), // "equal" | "custom" | "percentage"
    splits: v.array(
      v.object({
        memberId: v.id("tripMembers"),
        amount: v.optional(v.number()),
        percentage: v.optional(v.number()),
        isIncluded: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await verifyTripAccess(ctx, args.tripId, user._id);

    if (args.amount <= 0) {
      throw new ConvexError("Amount must be greater than 0");
    }

    const now = Date.now();

    // Create the expense
    const expenseId = await ctx.db.insert("tripExpenses", {
      tripId: args.tripId,
      paidByMemberId: args.paidByMemberId,
      amount: args.amount,
      category: args.category,
      title: args.title,
      note: args.note,
      date: args.date,
      splitType: args.splitType,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    // Compute splits based on split type
    const includedSplits = args.splits.filter((s) => s.isIncluded);

    if (includedSplits.length === 0) {
      throw new ConvexError("At least one member must be included in the split");
    }

    if (args.splitType === "equal") {
      // Floor division with remainder going to the last member
      const perPerson = Math.floor((args.amount / includedSplits.length) * 100) / 100;
      const totalDistributed = perPerson * (includedSplits.length - 1);
      const lastPersonAmount = Math.round((args.amount - totalDistributed) * 100) / 100;

      for (let i = 0; i < args.splits.length; i++) {
        const split = args.splits[i];
        let splitAmount = 0;

        if (split.isIncluded) {
          // Find if this is the last included member
          const includedIndex = includedSplits.indexOf(split);
          splitAmount =
            includedIndex === includedSplits.length - 1
              ? lastPersonAmount
              : perPerson;
        }

        await ctx.db.insert("expenseSplits", {
          tripExpenseId: expenseId,
          tripId: args.tripId,
          memberId: split.memberId,
          amount: splitAmount,
          isIncluded: split.isIncluded,
          createdAt: now,
        });
      }
    } else if (args.splitType === "custom") {
      // Validate custom amounts sum to total
      const customTotal = includedSplits.reduce(
        (sum, s) => sum + (s.amount ?? 0),
        0
      );

      if (Math.abs(customTotal - args.amount) > 0.01) {
        throw new ConvexError(
          `Custom split amounts (${customTotal.toFixed(2)}) must equal the total (${args.amount.toFixed(2)})`
        );
      }

      for (const split of args.splits) {
        await ctx.db.insert("expenseSplits", {
          tripExpenseId: expenseId,
          tripId: args.tripId,
          memberId: split.memberId,
          amount: split.isIncluded ? (split.amount ?? 0) : 0,
          isIncluded: split.isIncluded,
          createdAt: now,
        });
      }
    } else if (args.splitType === "percentage") {
      // Validate percentages sum to 100
      const percentTotal = includedSplits.reduce(
        (sum, s) => sum + (s.percentage ?? 0),
        0
      );

      if (Math.abs(percentTotal - 100) > 0.01) {
        throw new ConvexError(
          `Split percentages (${percentTotal.toFixed(2)}%) must sum to 100%`
        );
      }

      for (const split of args.splits) {
        const percentage = split.isIncluded ? (split.percentage ?? 0) : 0;
        const splitAmount = split.isIncluded
          ? Math.round(args.amount * (percentage / 100) * 100) / 100
          : 0;

        await ctx.db.insert("expenseSplits", {
          tripExpenseId: expenseId,
          tripId: args.tripId,
          memberId: split.memberId,
          amount: splitAmount,
          percentage: split.isIncluded ? percentage : undefined,
          isIncluded: split.isIncluded,
          createdAt: now,
        });
      }
    } else {
      throw new ConvexError(
        `Invalid split type: ${args.splitType}. Must be "equal", "custom", or "percentage".`
      );
    }

    return expenseId;
  },
});

/**
 * Updates a trip expense: deletes old splits and recreates with new data.
 */
export const updateTripExpense = mutation({
  args: {
    expenseId: v.id("tripExpenses"),
    paidByMemberId: v.optional(v.id("tripMembers")),
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    title: v.optional(v.string()),
    note: v.optional(v.string()),
    date: v.optional(v.string()),
    splitType: v.optional(v.string()),
    splits: v.optional(
      v.array(
        v.object({
          memberId: v.id("tripMembers"),
          amount: v.optional(v.number()),
          percentage: v.optional(v.number()),
          isIncluded: v.boolean(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const expense = await ctx.db.get(args.expenseId);
    if (!expense) {
      throw new ConvexError("Expense not found");
    }

    // Verify the user created this expense or is trip owner
    const trip = await ctx.db.get(expense.tripId);
    if (!trip) {
      throw new ConvexError("Trip not found");
    }

    if (expense.createdBy !== user._id && trip.ownerId !== user._id) {
      throw new ConvexError("Not authorized to update this expense");
    }

    const effectiveAmount = args.amount ?? expense.amount;
    const effectiveSplitType = args.splitType ?? expense.splitType;

    if (effectiveAmount <= 0) {
      throw new ConvexError("Amount must be greater than 0");
    }

    // Update expense fields
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.paidByMemberId !== undefined) updates.paidByMemberId = args.paidByMemberId;
    if (args.amount !== undefined) updates.amount = args.amount;
    if (args.category !== undefined) updates.category = args.category;
    if (args.title !== undefined) updates.title = args.title;
    if (args.note !== undefined) updates.note = args.note;
    if (args.date !== undefined) updates.date = args.date;
    if (args.splitType !== undefined) updates.splitType = args.splitType;

    await ctx.db.patch(args.expenseId, updates);

    // If splits are provided, delete old and recreate
    if (args.splits) {
      // Delete old splits
      const oldSplits = await ctx.db
        .query("expenseSplits")
        .withIndex("by_tripExpenseId", (q) =>
          q.eq("tripExpenseId", args.expenseId)
        )
        .collect();

      for (const oldSplit of oldSplits) {
        await ctx.db.delete(oldSplit._id);
      }

      // Recreate splits (same logic as create)
      const now = Date.now();
      const includedSplits = args.splits.filter((s) => s.isIncluded);

      if (includedSplits.length === 0) {
        throw new ConvexError("At least one member must be included in the split");
      }

      if (effectiveSplitType === "equal") {
        const perPerson =
          Math.floor((effectiveAmount / includedSplits.length) * 100) / 100;
        const totalDistributed = perPerson * (includedSplits.length - 1);
        const lastPersonAmount =
          Math.round((effectiveAmount - totalDistributed) * 100) / 100;

        for (let i = 0; i < args.splits.length; i++) {
          const split = args.splits[i];
          let splitAmount = 0;

          if (split.isIncluded) {
            const includedIndex = includedSplits.indexOf(split);
            splitAmount =
              includedIndex === includedSplits.length - 1
                ? lastPersonAmount
                : perPerson;
          }

          await ctx.db.insert("expenseSplits", {
            tripExpenseId: args.expenseId,
            tripId: expense.tripId,
            memberId: split.memberId,
            amount: splitAmount,
            isIncluded: split.isIncluded,
            createdAt: now,
          });
        }
      } else if (effectiveSplitType === "custom") {
        const customTotal = includedSplits.reduce(
          (sum, s) => sum + (s.amount ?? 0),
          0
        );

        if (Math.abs(customTotal - effectiveAmount) > 0.01) {
          throw new ConvexError(
            `Custom split amounts (${customTotal.toFixed(2)}) must equal the total (${effectiveAmount.toFixed(2)})`
          );
        }

        for (const split of args.splits) {
          await ctx.db.insert("expenseSplits", {
            tripExpenseId: args.expenseId,
            tripId: expense.tripId,
            memberId: split.memberId,
            amount: split.isIncluded ? (split.amount ?? 0) : 0,
            isIncluded: split.isIncluded,
            createdAt: now,
          });
        }
      } else if (effectiveSplitType === "percentage") {
        const percentTotal = includedSplits.reduce(
          (sum, s) => sum + (s.percentage ?? 0),
          0
        );

        if (Math.abs(percentTotal - 100) > 0.01) {
          throw new ConvexError(
            `Split percentages (${percentTotal.toFixed(2)}%) must sum to 100%`
          );
        }

        for (const split of args.splits) {
          const percentage = split.isIncluded ? (split.percentage ?? 0) : 0;
          const splitAmount = split.isIncluded
            ? Math.round(effectiveAmount * (percentage / 100) * 100) / 100
            : 0;

          await ctx.db.insert("expenseSplits", {
            tripExpenseId: args.expenseId,
            tripId: expense.tripId,
            memberId: split.memberId,
            amount: splitAmount,
            percentage: split.isIncluded ? percentage : undefined,
            isIncluded: split.isIncluded,
            createdAt: now,
          });
        }
      }
    }

    return args.expenseId;
  },
});

/**
 * Deletes a trip expense and its splits. Verifies creator or trip owner.
 */
export const deleteTripExpense = mutation({
  args: {
    expenseId: v.id("tripExpenses"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const expense = await ctx.db.get(args.expenseId);
    if (!expense) {
      throw new ConvexError("Expense not found");
    }

    const trip = await ctx.db.get(expense.tripId);
    if (!trip) {
      throw new ConvexError("Trip not found");
    }

    if (expense.createdBy !== user._id && trip.ownerId !== user._id) {
      throw new ConvexError("Not authorized to delete this expense");
    }

    // Delete all splits first
    const splits = await ctx.db
      .query("expenseSplits")
      .withIndex("by_tripExpenseId", (q) =>
        q.eq("tripExpenseId", args.expenseId)
      )
      .collect();

    for (const split of splits) {
      await ctx.db.delete(split._id);
    }

    // Delete the expense
    await ctx.db.delete(args.expenseId);

    return { success: true };
  },
});

/**
 * Returns all expenses for a trip, enriched with paidBy member name
 * and split details including member names.
 */
export const getTripExpenses = query({
  args: {
    tripId: v.id("trips"),
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

    // Get all members for name lookup
    const members = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const memberMap = new Map(members.map((m) => [m._id.toString(), m]));

    // Get all expenses
    const expenses = await ctx.db
      .query("tripExpenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Enrich each expense
    const enrichedExpenses = await Promise.all(
      expenses.map(async (expense) => {
        const paidByMember = memberMap.get(expense.paidByMemberId.toString());

        // Get splits for this expense
        const splits = await ctx.db
          .query("expenseSplits")
          .withIndex("by_tripExpenseId", (q) =>
            q.eq("tripExpenseId", expense._id)
          )
          .collect();

        const enrichedSplits = splits.map((split) => {
          const member = memberMap.get(split.memberId.toString());
          return {
            ...split,
            memberName: member?.name ?? "Unknown",
          };
        });

        return {
          ...expense,
          paidByMemberName: paidByMember?.name ?? "Unknown",
          splits: enrichedSplits,
        };
      })
    );

    // Sort by date descending, then by createdAt descending
    enrichedExpenses.sort((a, b) =>
      b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt
    );

    return enrichedExpenses;
  },
});
