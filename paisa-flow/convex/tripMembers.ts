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

// ── Helper: Verify trip ownership ──────────────────────────────────
async function verifyTripOwnership(ctx: any, tripId: any, userId: any) {
  const trip = await ctx.db.get(tripId);
  if (!trip) {
    throw new ConvexError("Trip not found");
  }
  if (trip.ownerId !== userId) {
    throw new ConvexError("Only the trip owner can perform this action");
  }
  return trip;
}

/**
 * Adds a new member to a trip. Only the trip owner can add members.
 */
export const addTripMember = mutation({
  args: {
    tripId: v.id("trips"),
    name: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await verifyTripOwnership(ctx, args.tripId, user._id);

    const memberId = await ctx.db.insert("tripMembers", {
      tripId: args.tripId,
      name: args.name,
      email: args.email,
      createdAt: Date.now(),
    });

    return memberId;
  },
});

/**
 * Updates a trip member's details. Only the trip owner can update members.
 */
export const updateTripMember = mutation({
  args: {
    memberId: v.id("tripMembers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new ConvexError("Trip member not found");
    }

    await verifyTripOwnership(ctx, member.tripId, user._id);

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;

    await ctx.db.patch(args.memberId, updates);

    return args.memberId;
  },
});

/**
 * Removes a trip member. Only the trip owner can remove members.
 * Throws an error if the member has paid for any expenses.
 */
export const removeTripMember = mutation({
  args: {
    memberId: v.id("tripMembers"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new ConvexError("Trip member not found");
    }

    await verifyTripOwnership(ctx, member.tripId, user._id);

    // Check if member has paid for any expenses
    const paidExpenses = await ctx.db
      .query("tripExpenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", member.tripId))
      .filter((q) => q.eq(q.field("paidByMemberId"), args.memberId))
      .first();

    if (paidExpenses) {
      throw new ConvexError(
        "Cannot remove this member because they have paid for expenses. Delete their expenses first."
      );
    }

    // Also check if member is part of any expense splits
    const memberSplits = await ctx.db
      .query("expenseSplits")
      .withIndex("by_tripId_memberId", (q) =>
        q.eq("tripId", member.tripId).eq("memberId", args.memberId)
      )
      .first();

    if (memberSplits) {
      throw new ConvexError(
        "Cannot remove this member because they are included in expense splits. Remove them from expenses first."
      );
    }

    await ctx.db.delete(args.memberId);

    return { success: true };
  },
});

/**
 * Returns all members of a trip.
 */
export const getTripMembers = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const members = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    return members;
  },
});
