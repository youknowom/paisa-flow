import type { Category, Currency, PaymentMode, SplitType } from "@/lib/constants";

// ── Status types ─────────────────────────────────────────────────────────────

export type TripStatus = "active" | "completed" | "archived";

export type SettlementStatus = "pending" | "completed";

export type WarningLevel = "warning" | "danger" | "exceeded" | null;

// ── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetStatus {
  budgetSet: boolean;
  budget: number;
  spent: number;
  percentage: number;
  warningLevel: WarningLevel;
}

// ── Enriched Trip types ──────────────────────────────────────────────────────

export interface EnrichedTrip {
  _id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  currency: Currency;
  coverEmoji?: string;
  status: TripStatus;
  createdBy: string;
  totalExpenses: number;
  memberCount: number;
  myBalance: number;
}

export interface EnrichedTripExpense {
  _id: string;
  tripId: string;
  title: string;
  amount: number;
  category: Category;
  paidByMemberId: string;
  paidByMemberName: string;
  date: string;
  splitType: SplitType;
  note?: string;
  splits: TripExpenseSplit[];
}

export interface TripExpenseSplit {
  memberId: string;
  memberName: string;
  amount: number;
}

// ── Member Balance & Settlement ──────────────────────────────────────────────

export interface MemberBalance {
  memberId: string;
  name: string;
  totalPaid: number;
  totalShare: number;
  balance: number;
}

export interface SettlementSuggestion {
  from: string;
  to: string;
  amount: number;
}

// ── Analytics ────────────────────────────────────────────────────────────────

export interface MonthlyExpenseSummary {
  totalSpent: number;
  expenseCount: number;
  avgPerDay: number;
  topCategory: Category | null;
  categoryBreakdown: CategoryBreakdownItem[];
}

export interface CategoryBreakdownItem {
  category: Category;
  amount: number;
  percentage: number;
}

export interface WeeklyTrendItem {
  date: string;
  amount: number;
}

// ── Daily Expense (from DB) ──────────────────────────────────────────────────

export interface DailyExpense {
  _id: string;
  userId: string;
  amount: number;
  category: Category;
  note: string;
  paymentMode: PaymentMode;
  date: string;
  isRecurring: boolean;
  createdAt: number;
}

// ── Trip & Trip Member (from DB) ─────────────────────────────────────────────

export interface Trip {
  _id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  currency: Currency;
  coverEmoji?: string;
  status: TripStatus;
  createdBy: string;
}

export interface TripMember {
  _id: string;
  tripId: string;
  name: string;
  email?: string;
  userId?: string;
}

export interface TripExpense {
  _id: string;
  tripId: string;
  title: string;
  amount: number;
  category: Category;
  paidByMemberId: string;
  date: string;
  splitType: SplitType;
  note?: string;
}

// ── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  _id: string;
  clerkUserId: string;
  name: string;
  email: string;
  imageUrl?: string;
  currency: Currency;
  monthlyBudget?: number;
  defaultPaymentMode?: PaymentMode;
  onboardingComplete: boolean;
}

// ── Budget ───────────────────────────────────────────────────────────────────

export interface Budget {
  _id: string;
  userId: string;
  month: number;
  year: number;
  amount: number;
  category?: Category;
}

// ── Settlement ───────────────────────────────────────────────────────────────

export interface Settlement {
  _id: string;
  tripId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  status: SettlementStatus;
  settledAt?: number;
}
