import { v, ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Returns the balance for each member in a trip.
 * balance = totalPaid - totalShare
 * Positive = owed money, Negative = owes money.
 */
export const getTripBalances = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get all members
    const members = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get all expenses for this trip
    const expenses = await ctx.db
      .query("tripExpenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get all splits for this trip
    const allSplits: any[] = [];
    for (const member of members) {
      const memberSplits = await ctx.db
        .query("expenseSplits")
        .withIndex("by_tripId_memberId", (q) =>
          q.eq("tripId", args.tripId).eq("memberId", member._id)
        )
        .collect();
      allSplits.push(...memberSplits);
    }

    // Calculate balances per member
    const balances = members.map((member) => {
      // Total paid by this member
      const totalPaid = expenses
        .filter((e) => e.paidByMemberId === member._id)
        .reduce((sum, e) => sum + e.amount, 0);

      // Total share for this member (from expense splits)
      const totalShare = allSplits
        .filter((s) => s.memberId === member._id && s.isIncluded)
        .reduce((sum, s) => sum + s.amount, 0);

      const balance = Math.round((totalPaid - totalShare) * 100) / 100;

      return {
        memberId: member._id,
        memberName: member.name,
        email: member.email,
        avatarUrl: member.avatarUrl,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalShare: Math.round(totalShare * 100) / 100,
        balance,
      };
    });

    return balances;
  },
});

/**
 * Generates optimal settlement suggestions using debt simplification.
 * Algorithm: separate creditors/debtors, sort by abs value, two-pointer greedy matching.
 */
export const getSettlementSuggestions = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get all members
    const members = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get all expenses
    const expenses = await ctx.db
      .query("tripExpenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get all splits
    const allSplits: any[] = [];
    for (const member of members) {
      const memberSplits = await ctx.db
        .query("expenseSplits")
        .withIndex("by_tripId_memberId", (q) =>
          q.eq("tripId", args.tripId).eq("memberId", member._id)
        )
        .collect();
      allSplits.push(...memberSplits);
    }

    // Calculate net balance for each member
    const memberBalances = members.map((member) => {
      const totalPaid = expenses
        .filter((e) => e.paidByMemberId === member._id)
        .reduce((sum, e) => sum + e.amount, 0);

      const totalShare = allSplits
        .filter((s) => s.memberId === member._id && s.isIncluded)
        .reduce((sum, s) => sum + s.amount, 0);

      return {
        memberId: member._id,
        memberName: member.name,
        balance: Math.round((totalPaid - totalShare) * 100) / 100,
      };
    });

    // Separate into creditors (positive balance = owed money)
    // and debtors (negative balance = owes money)
    const creditors = memberBalances
      .filter((m) => m.balance > 0.01)
      .map((m) => ({ ...m }))
      .sort((a, b) => b.balance - a.balance);

    const debtors = memberBalances
      .filter((m) => m.balance < -0.01)
      .map((m) => ({ ...m, balance: Math.abs(m.balance) }))
      .sort((a, b) => b.balance - a.balance);

    // Two-pointer greedy settlement
    const suggestions: Array<{
      fromMemberId: Id<"tripMembers">;
      fromMemberName: string;
      toMemberId: Id<"tripMembers">;
      toMemberName: string;
      amount: number;
    }> = [];

    let i = 0; // creditor pointer
    let j = 0; // debtor pointer

    while (i < creditors.length && j < debtors.length) {
      const settlementAmount = Math.min(creditors[i].balance, debtors[j].balance);
      const roundedAmount = Math.round(settlementAmount * 100) / 100;

      if (roundedAmount > 0) {
        suggestions.push({
          fromMemberId: debtors[j].memberId,
          fromMemberName: debtors[j].memberName,
          toMemberId: creditors[i].memberId,
          toMemberName: creditors[i].memberName,
          amount: roundedAmount,
        });
      }

      creditors[i].balance =
        Math.round((creditors[i].balance - settlementAmount) * 100) / 100;
      debtors[j].balance =
        Math.round((debtors[j].balance - settlementAmount) * 100) / 100;

      if (creditors[i].balance < 0.01) i++;
      if (debtors[j].balance < 0.01) j++;
    }

    return suggestions;
  },
});
