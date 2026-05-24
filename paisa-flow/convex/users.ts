import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Creates a new user or updates an existing one based on Clerk identity.
 * Called after Clerk sign-in to sync user data with Convex.
 */
export const createOrUpdateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const clerkId = identity.subject;
    const name = identity.name ?? "Unknown";
    const email = identity.email ?? "";
    const imageUrl = identity.pictureUrl ?? undefined;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    const now = Date.now();

    if (existingUser) {
      // Update existing user with latest identity info
      await ctx.db.patch(existingUser._id, {
        name,
        email,
        imageUrl,
        updatedAt: now,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId,
      name,
      email,
      imageUrl,
      currency: "INR",
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

/**
 * Returns the currently authenticated user's profile, or null if not found.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

/**
 * Completes user onboarding by setting currency, budget, and payment preferences.
 */
export const completeOnboarding = mutation({
  args: {
    currency: v.string(),
    monthlyBudget: v.optional(v.number()),
    defaultPaymentMode: v.optional(v.string()),
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
      throw new ConvexError("User not found. Please sign in again.");
    }

    await ctx.db.patch(user._id, {
      currency: args.currency,
      monthlyBudget: args.monthlyBudget,
      defaultPaymentMode: args.defaultPaymentMode,
      onboardingCompleted: true,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

/**
 * Updates the authenticated user's profile fields.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    currency: v.optional(v.string()),
    monthlyBudget: v.optional(v.number()),
    defaultPaymentMode: v.optional(v.string()),
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
      throw new ConvexError("User not found. Please sign in again.");
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.currency !== undefined) updates.currency = args.currency;
    if (args.monthlyBudget !== undefined) updates.monthlyBudget = args.monthlyBudget;
    if (args.defaultPaymentMode !== undefined) updates.defaultPaymentMode = args.defaultPaymentMode;

    await ctx.db.patch(user._id, updates);

    return user._id;
  },
});
