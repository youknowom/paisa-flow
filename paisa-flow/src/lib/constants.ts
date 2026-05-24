export const CATEGORIES = [
  { value: "food", label: "Food & Dining", emoji: "🍔" },
  { value: "transport", label: "Transport", emoji: "🚗" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "bills", label: "Bills & Utilities", emoji: "📄" },
  { value: "health", label: "Health", emoji: "🏥" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "groceries", label: "Groceries", emoji: "🥦" },
  { value: "subscriptions", label: "Subscriptions", emoji: "📱" },
  { value: "other", label: "Other", emoji: "📦" },
] as const;

export const PAYMENT_MODES = [
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
] as const;

export const CURRENCIES = [
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
  { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
  { value: "SGD", label: "Singapore Dollar (S$)", symbol: "S$" },
  { value: "AED", label: "UAE Dirham (د.إ)", symbol: "د.إ" },
  { value: "THB", label: "Thai Baht (฿)", symbol: "฿" },
] as const;

export const SPLIT_TYPES = [
  { value: "equal", label: "Equal Split" },
  { value: "custom", label: "Custom Amount" },
  { value: "percentage", label: "Percentage" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export type PaymentMode = (typeof PAYMENT_MODES)[number]["value"];
export type Currency = (typeof CURRENCIES)[number]["value"];
export type SplitType = (typeof SPLIT_TYPES)[number]["value"];
