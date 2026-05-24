import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";

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
 * Creates a new trip and auto-adds the creator as the first member.
 */
export const createTrip = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    currency: v.string(),
    coverEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const now = Date.now();

    const tripId = await ctx.db.insert("trips", {
      ownerId: user._id,
      name: args.name,
      location: args.location,
      startDate: args.startDate,
      endDate: args.endDate,
      currency: args.currency,
      status: "active",
      coverEmoji: args.coverEmoji,
      createdAt: now,
      updatedAt: now,
    });

    // Auto-add creator as the first member
    await ctx.db.insert("tripMembers", {
      tripId,
      name: user.name,
      email: user.email,
      userId: user._id,
      avatarUrl: user.imageUrl,
      createdAt: now,
    });

    return tripId;
  },
});

/**
 * Returns trips the authenticated user owns or is a member of.
 * For each trip: totalExpenses, memberCount, myBalance.
 */
export const getUserTrips = query({
  args: {
    status: v.optional(v.string()),
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

    // Trips owned by user
    let ownedTrips = await ctx.db
      .query("trips")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .collect();

    // Trips user is a member of
    const memberships = await ctx.db
      .query("tripMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const memberTripIds = new Set(memberships.map((m) => m.tripId));

    // Fetch member trips not already owned
    const memberTrips: Doc<"trips">[] = [];
    for (const tripId of memberTripIds) {
      if (!ownedTrips.some((t) => t._id === tripId)) {
        const trip = await ctx.db.get(tripId);
        if (trip) {
          memberTrips.push(trip);
        }
      }
    }

    // Merge and deduplicate
    let allTrips = [...ownedTrips, ...memberTrips];

    // Filter by status if provided
    if (args.status) {
      allTrips = allTrips.filter((t) => t.status === args.status);
    }

    // Enrich each trip
    const enrichedTrips = await Promise.all(
      allTrips.map(async (trip) => {
        // Get members
        const members = await ctx.db
          .query("tripMembers")
          .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
          .collect();

        // Get expenses
        const expenses = await ctx.db
          .query("tripExpenses")
          .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
          .collect();

        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const memberCount = members.length;

        // Find the current user's member record
        const myMember = members.find((m) => m.userId === user._id);
        let myBalance = 0;

        if (myMember) {
          // Calculate my paid total
          const myPaid = expenses
            .filter((e) => e.paidByMemberId === myMember._id)
            .reduce((sum, e) => sum + e.amount, 0);

          // Calculate my share total from splits
          const allSplits = await ctx.db
            .query("expenseSplits")
            .withIndex("by_tripId_memberId", (q) =>
              q.eq("tripId", trip._id).eq("memberId", myMember._id)
            )
            .collect();

          const myShare = allSplits
            .filter((s) => s.isIncluded)
            .reduce((sum, s) => sum + s.amount, 0);

          myBalance = myPaid - myShare;
        }

        return {
          ...trip,
          totalExpenses,
          memberCount,
          myBalance: Math.round(myBalance * 100) / 100,
        };
      })
    );

    // Sort by creation date descending
    enrichedTrips.sort((a, b) => b.createdAt - a.createdAt);

    return enrichedTrips;
  },
});

/**
 * Returns a trip by ID. Verifies user is owner or member.
 */
export const getTripById = query({
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

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new ConvexError("Trip not found");
    }

    // Verify access: owner or member
    if (trip.ownerId !== user._id) {
      const membership = await ctx.db
        .query("tripMembers")
        .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .first();

      if (!membership) {
        throw new ConvexError("Not authorized to view this trip");
      }
    }

    return trip;
  },
});

/**
 * Returns a comprehensive trip overview including:
 * trip details, totalExpenses, myPaid, myShare, myBalance,
 * memberCount, expenseCount, categoryBreakdown, timeline.
 */
export const getTripOverview = query({
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

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new ConvexError("Trip not found");
    }

    // Get members
    const members = await ctx.db
      .query("tripMembers")
      .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
      .collect();

    // Verify access
    const isOwner = trip.ownerId === user._id;
    const myMember = members.find((m) => m.userId === user._id);
    if (!isOwner && !myMember) {
      throw new ConvexError("Not authorized to view this trip");
    }

    // Get expenses
    const expenses = await ctx.db
      .query("tripExpenses")
      .withIndex("by_tripId", (q) => q.eq("tripId", trip._id))
      .collect();

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const memberCount = members.length;
    const expenseCount = expenses.length;

    // My paid and share
    let myPaid = 0;
    let myShare = 0;

    if (myMember) {
      myPaid = expenses
        .filter((e) => e.paidByMemberId === myMember._id)
        .reduce((sum, e) => sum + e.amount, 0);

      const mySplits = await ctx.db
        .query("expenseSplits")
        .withIndex("by_tripId_memberId", (q) =>
          q.eq("tripId", trip._id).eq("memberId", myMember._id)
        )
        .collect();

      myShare = mySplits
        .filter((s) => s.isIncluded)
        .reduce((sum, s) => sum + s.amount, 0);
    }

    const myBalance = Math.round((myPaid - myShare) * 100) / 100;

    // Category breakdown
    const categoryMap = new Map<string, number>();
    for (const expense of expenses) {
      const current = categoryMap.get(expense.category) ?? 0;
      categoryMap.set(expense.category, current + expense.amount);
    }

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalExpenses > 0
            ? Math.round((amount / totalExpenses) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Timeline: expenses sorted by date desc
    const timeline = expenses
      .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt))
      .slice(0, 20)
      .map((e) => {
        const paidBy = members.find((m) => m._id === e.paidByMemberId);
        return {
          _id: e._id,
          title: e.title,
          amount: e.amount,
          category: e.category,
          date: e.date,
          paidByName: paidBy?.name ?? "Unknown",
        };
      });

    return {
      trip,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      myPaid: Math.round(myPaid * 100) / 100,
      myShare: Math.round(myShare * 100) / 100,
      myBalance,
      memberCount,
      expenseCount,
      categoryBreakdown,
      timeline,
    };
  },
});

/**
 * Archives a trip. Only the owner can archive.
 */
export const archiveTrip = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new ConvexError("Trip not found");
    }

    if (trip.ownerId !== user._id) {
      throw new ConvexError("Only the trip owner can archive this trip");
    }

    await ctx.db.patch(args.tripId, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
