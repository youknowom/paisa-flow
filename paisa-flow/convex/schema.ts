import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    currency: v.string(),
    monthlyBudget: v.optional(v.number()),
    onboardingCompleted: v.boolean(),
    defaultPaymentMode: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  dailyExpenses: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    category: v.string(),
    note: v.string(),
    paymentMode: v.string(),
    date: v.string(),
    isRecurring: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "date"]),

  trips: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    location: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    currency: v.string(),
    status: v.string(),
    coverEmoji: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_status", ["status"]),

  tripMembers: defineTable({
    tripId: v.id("trips"),
    name: v.string(),
    email: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_tripId", ["tripId"])
    .index("by_userId", ["userId"]),

  tripExpenses: defineTable({
    tripId: v.id("trips"),
    paidByMemberId: v.id("tripMembers"),
    amount: v.number(),
    category: v.string(),
    title: v.string(),
    note: v.optional(v.string()),
    date: v.string(),
    splitType: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tripId", ["tripId"])
    .index("by_tripId_date", ["tripId", "date"]),

  expenseSplits: defineTable({
    tripExpenseId: v.id("tripExpenses"),
    tripId: v.id("trips"),
    memberId: v.id("tripMembers"),
    amount: v.number(),
    percentage: v.optional(v.number()),
    isIncluded: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_tripExpenseId", ["tripExpenseId"])
    .index("by_tripId_memberId", ["tripId", "memberId"]),

  settlements: defineTable({
    tripId: v.id("trips"),
    fromMemberId: v.id("tripMembers"),
    toMemberId: v.id("tripMembers"),
    amount: v.number(),
    status: v.string(),
    createdAt: v.number(),
    settledAt: v.optional(v.number()),
  })
    .index("by_tripId", ["tripId"])
    .index("by_fromMemberId", ["fromMemberId"])
    .index("by_status", ["status"]),

  budgets: defineTable({
    userId: v.id("users"),
    month: v.number(),
    year: v.number(),
    amount: v.number(),
    category: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_month_year", ["userId", "month", "year"]),
});
