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
 * Creates a settlement record between two trip members.
 */
export const createSettlement = mutation({
  args: {
    tripId: v.id("trips"),
    fromMemberId: v.id("tripMembers"),
    toMemberId: v.id("tripMembers"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    // Verify trip exists
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new ConvexError("Trip not found");
    }

    // Verify caller is trip owner or member
    if (trip.ownerId !== user._id) {
      const membership = await ctx.db
        .query("tripMembers")
        .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .first();

      if (!membership) {
        throw new ConvexError("Not authorized to create settlements for this trip");
      }
    }

    if (args.amount <= 0) {
      throw new ConvexError("Settlement amount must be greater than 0");
    }

    if (args.fromMemberId === args.toMemberId) {
      throw new ConvexError("Cannot create a settlement from a member to themselves");
    }

    // Verify both members belong to the trip
    const fromMember = await ctx.db.get(args.fromMemberId);
    const toMember = await ctx.db.get(args.toMemberId);

    if (!fromMember || fromMember.tripId !== args.tripId) {
      throw new ConvexError("'From' member not found in this trip");
    }
    if (!toMember || toMember.tripId !== args.tripId) {
      throw new ConvexError("'To' member not found in this trip");
    }

    const settlementId = await ctx.db.insert("settlements", {
      tripId: args.tripId,
      fromMemberId: args.fromMemberId,
      toMemberId: args.toMemberId,
      amount: args.amount,
      status: "pending",
      createdAt: Date.now(),
    });

    return settlementId;
  },
});

/**
 * Marks a settlement as completed. Only the trip owner can do this.
 */
export const markSettlementCompleted = mutation({
  args: {
    settlementId: v.id("settlements"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const settlement = await ctx.db.get(args.settlementId);
    if (!settlement) {
      throw new ConvexError("Settlement not found");
    }

    const trip = await ctx.db.get(settlement.tripId);
    if (!trip) {
      throw new ConvexError("Trip not found");
    }

    if (trip.ownerId !== user._id) {
      throw new ConvexError("Only the trip owner can mark settlements as completed");
    }

    await ctx.db.patch(args.settlementId, {
      status: "completed",
      settledAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Returns all settlements for a trip, enriched with member details.
 */
export const getTripSettlements = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const settlements = await ctx.db
      .query("settlements")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Enrich with member details
    const enrichedSettlements = await Promise.all(
      settlements.map(async (settlement) => {
        const fromMember = await ctx.db.get(settlement.fromMemberId);
        const toMember = await ctx.db.get(settlement.toMemberId);

        return {
          ...settlement,
          fromMember: fromMember
            ? { _id: fromMember._id, name: fromMember.name, email: fromMember.email }
            : null,
          toMember: toMember
            ? { _id: toMember._id, name: toMember.name, email: toMember.email }
            : null,
        };
      })
    );

    // Sort by creation date descending
    enrichedSettlements.sort((a, b) => b.createdAt - a.createdAt);

    return enrichedSettlements;
  },
});
