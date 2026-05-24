import type { LucideIcon } from "lucide-react";
import {
  UtensilsCrossed,
  Plane,
  ShoppingBag,
  Home,
  Zap,
  Heart,
  Music,
  RefreshCw,
  BookOpen,
  MoreHorizontal,
  Car,
  GraduationCap,
  Hotel,
  Ticket,
  Fuel,
} from "lucide-react";

export interface CategoryStyle {
  icon: LucideIcon;
  color: string;
  bgTint: string;
  label: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  food: {
    icon: UtensilsCrossed,
    color: "#F97316",
    bgTint: "rgba(249, 115, 22, 0.15)",
    label: "Food",
  },
  groceries: {
    icon: UtensilsCrossed,
    color: "#F97316",
    bgTint: "rgba(249, 115, 22, 0.15)",
    label: "Groceries",
  },
  travel: {
    icon: Plane,
    color: "#3B82F6",
    bgTint: "rgba(59, 130, 246, 0.15)",
    label: "Travel",
  },
  transport: {
    icon: Car,
    color: "#3B82F6",
    bgTint: "rgba(59, 130, 246, 0.15)",
    label: "Transport",
  },
  shopping: {
    icon: ShoppingBag,
    color: "#EC4899",
    bgTint: "rgba(236, 72, 153, 0.15)",
    label: "Shopping",
  },
  rent: {
    icon: Home,
    color: "#7C3AED",
    bgTint: "rgba(124, 58, 237, 0.15)",
    label: "Rent",
  },
  bills: {
    icon: Zap,
    color: "#F59E0B",
    bgTint: "rgba(245, 158, 11, 0.15)",
    label: "Bills",
  },
  health: {
    icon: Heart,
    color: "#EF4444",
    bgTint: "rgba(239, 68, 68, 0.15)",
    label: "Health",
  },
  entertainment: {
    icon: Music,
    color: "#7C3AED",
    bgTint: "rgba(124, 58, 237, 0.15)",
    label: "Entertainment",
  },
  subscriptions: {
    icon: RefreshCw,
    color: "#14B8A6",
    bgTint: "rgba(20, 184, 166, 0.15)",
    label: "Subscriptions",
  },
  education: {
    icon: BookOpen,
    color: "#6366F1",
    bgTint: "rgba(99, 102, 241, 0.15)",
    label: "Education",
  },
  books: {
    icon: BookOpen,
    color: "#6366F1",
    bgTint: "rgba(99, 102, 241, 0.15)",
    label: "Books",
  },
  other: {
    icon: MoreHorizontal,
    color: "#6B6B6B",
    bgTint: "rgba(107, 107, 107, 0.15)",
    label: "Other",
  },
  stay: {
    icon: Hotel,
    color: "#3B82F6",
    bgTint: "rgba(59, 130, 246, 0.15)",
    label: "Stay",
  },
  tickets: {
    icon: Ticket,
    color: "#7C3AED",
    bgTint: "rgba(124, 58, 237, 0.15)",
    label: "Tickets",
  },
  fuel: {
    icon: Fuel,
    color: "#F97316",
    bgTint: "rgba(249, 115, 22, 0.15)",
    label: "Fuel",
  },
};

const DEFAULT_STYLE: CategoryStyle = {
  icon: MoreHorizontal,
  color: "#6B6B6B",
  bgTint: "rgba(107, 107, 107, 0.15)",
  label: "Other",
};

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? DEFAULT_STYLE;
}

export const FILTER_CATEGORIES = [
  "all",
  "food",
  "travel",
  "shopping",
  "rent",
  "bills",
  "health",
  "entertainment",
  "subscriptions",
  "other",
] as const;
