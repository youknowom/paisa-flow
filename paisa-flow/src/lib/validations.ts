import { z } from "zod";

export const dailyExpenseSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .positive("Amount must be greater than 0")
    .max(10_000_000, "Amount cannot exceed 1 crore"),
  category: z.string({ required_error: "Category is required" }).min(1, "Category is required"),
  note: z.string().default(""),
  paymentMode: z.string({ required_error: "Payment mode is required" }).min(1, "Payment mode is required"),
  date: z
    .string({ required_error: "Date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  isRecurring: z.boolean().default(false),
});

export const tripSchema = z.object({
  name: z
    .string({ required_error: "Trip name is required" })
    .min(1, "Trip name is required"),
  location: z
    .string({ required_error: "Location is required" })
    .min(1, "Location is required"),
  startDate: z.string({ required_error: "Start date is required" }),
  endDate: z.string({ required_error: "End date is required" }),
  currency: z
    .string({ required_error: "Currency is required" })
    .min(1, "Currency is required"),
  coverEmoji: z.string().optional(),
});

export const tripMemberSchema = z.object({
  name: z
    .string({ required_error: "Member name is required" })
    .min(1, "Member name is required"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

export const tripExpenseSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title is required"),
  amount: z
    .number({ required_error: "Amount is required" })
    .positive("Amount must be greater than 0"),
  category: z
    .string({ required_error: "Category is required" })
    .min(1, "Category is required"),
  paidByMemberId: z
    .string({ required_error: "Payer is required" })
    .min(1, "Payer is required"),
  date: z.string({ required_error: "Date is required" }),
  splitType: z.enum(["equal", "custom", "percentage"], {
    required_error: "Split type is required",
  }),
  note: z.string().optional(),
});

export const onboardingSchema = z.object({
  currency: z
    .string({ required_error: "Currency is required" })
    .min(1, "Currency is required"),
  monthlyBudget: z
    .number()
    .positive("Budget must be greater than 0")
    .optional(),
  defaultPaymentMode: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().optional(),
  currency: z.string().optional(),
  monthlyBudget: z
    .number()
    .positive("Budget must be greater than 0")
    .optional(),
  defaultPaymentMode: z.string().optional(),
});

export const budgetSchema = z.object({
  month: z
    .number({ required_error: "Month is required" })
    .int()
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: z
    .number({ required_error: "Year is required" })
    .int(),
  amount: z
    .number({ required_error: "Amount is required" })
    .positive("Amount must be greater than 0"),
  category: z.string().optional(),
});

export type DailyExpenseInput = z.infer<typeof dailyExpenseSchema>;
export type TripInput = z.infer<typeof tripSchema>;
export type TripMemberInput = z.infer<typeof tripMemberSchema>;
export type TripExpenseInput = z.infer<typeof tripExpenseSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
