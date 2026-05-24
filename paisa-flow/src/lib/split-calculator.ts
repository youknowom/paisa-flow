export interface SplitMember {
  memberId: string;
  amount: number;
}

export interface SettlementSuggestion {
  from: string;
  to: string;
  amount: number;
}

export interface MemberBalance {
  memberId: string;
  name: string;
  totalPaid: number;
  totalShare: number;
  balance: number;
}

/**
 * Split a total equally among members.
 * Floors each share to 2 decimal places and assigns the remainder to the last member.
 */
export function calculateEqualSplit(
  total: number,
  memberIds: string[]
): SplitMember[] {
  if (memberIds.length === 0) {
    return [];
  }

  const count = memberIds.length;
  const perPerson = Math.floor((total / count) * 100) / 100;

  const splits: SplitMember[] = memberIds.map((memberId) => ({
    memberId,
    amount: perPerson,
  }));

  // Assign remainder (due to flooring) to the last member
  const distributedTotal = perPerson * count;
  const remainder = Math.round((total - distributedTotal) * 100) / 100;

  if (remainder !== 0 && splits.length > 0) {
    splits[splits.length - 1].amount =
      Math.round((splits[splits.length - 1].amount + remainder) * 100) / 100;
  }

  return splits;
}

/**
 * Validate that a custom split sums up to the total amount within a tolerance of 0.01.
 */
export function validateCustomSplit(
  total: number,
  splits: SplitMember[]
): { valid: boolean; error?: string } {
  if (splits.length === 0) {
    return { valid: false, error: "At least one member is required for the split." };
  }

  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  const diff = Math.abs(sum - total);

  if (diff > 0.01) {
    return {
      valid: false,
      error: `Split amounts sum to ${sum.toFixed(2)} but total is ${total.toFixed(2)}. Difference: ${diff.toFixed(2)}.`,
    };
  }

  const negativeEntry = splits.find((s) => s.amount < 0);
  if (negativeEntry) {
    return {
      valid: false,
      error: "Split amounts cannot be negative.",
    };
  }

  return { valid: true };
}

/**
 * Validate that percentage splits sum to 100 within a tolerance of 0.01.
 */
export function validatePercentageSplit(
  percentages: { memberId: string; percentage: number }[]
): { valid: boolean; error?: string } {
  if (percentages.length === 0) {
    return {
      valid: false,
      error: "At least one member is required for the split.",
    };
  }

  const sum = percentages.reduce((acc, p) => acc + p.percentage, 0);
  const diff = Math.abs(sum - 100);

  if (diff > 0.01) {
    return {
      valid: false,
      error: `Percentages sum to ${sum.toFixed(2)}% but must total 100%. Difference: ${diff.toFixed(2)}%.`,
    };
  }

  const negativeEntry = percentages.find((p) => p.percentage < 0);
  if (negativeEntry) {
    return {
      valid: false,
      error: "Percentages cannot be negative.",
    };
  }

  return { valid: true };
}

/**
 * Compute split amounts from percentages of a total.
 */
export function calculatePercentageSplit(
  total: number,
  percentages: { memberId: string; percentage: number }[]
): SplitMember[] {
  if (percentages.length === 0) {
    return [];
  }

  const splits: SplitMember[] = percentages.map(({ memberId, percentage }) => ({
    memberId,
    amount: Math.floor((total * percentage) / 100 * 100) / 100,
  }));

  // Assign remainder to the last member so the total is exact
  const distributedTotal = splits.reduce((acc, s) => acc + s.amount, 0);
  const remainder = Math.round((total - distributedTotal) * 100) / 100;

  if (remainder !== 0 && splits.length > 0) {
    splits[splits.length - 1].amount =
      Math.round((splits[splits.length - 1].amount + remainder) * 100) / 100;
  }

  return splits;
}

/**
 * Simplify debts among members using a greedy algorithm.
 * Members with positive balance are creditors (owed money).
 * Members with negative balance are debtors (owe money).
 * Uses sorted lists and a two-pointer approach to minimize the number of transactions.
 */
export function simplifyDebts(
  balances: MemberBalance[]
): SettlementSuggestion[] {
  const settlements: SettlementSuggestion[] = [];

  // Separate into creditors (positive balance) and debtors (negative balance)
  const creditors: { memberId: string; amount: number }[] = [];
  const debtors: { memberId: string; amount: number }[] = [];

  for (const member of balances) {
    const roundedBalance = Math.round(member.balance * 100) / 100;
    if (roundedBalance > 0) {
      creditors.push({ memberId: member.memberId, amount: roundedBalance });
    } else if (roundedBalance < 0) {
      debtors.push({ memberId: member.memberId, amount: Math.abs(roundedBalance) });
    }
  }

  // Sort both in descending order of amount for optimal pairing
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let creditorIdx = 0;
  let debtorIdx = 0;

  while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
    const creditor = creditors[creditorIdx];
    const debtor = debtors[debtorIdx];

    const transferAmount = Math.round(Math.min(creditor.amount, debtor.amount) * 100) / 100;

    if (transferAmount > 0) {
      settlements.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount: transferAmount,
      });
    }

    creditor.amount = Math.round((creditor.amount - transferAmount) * 100) / 100;
    debtor.amount = Math.round((debtor.amount - transferAmount) * 100) / 100;

    if (creditor.amount === 0) {
      creditorIdx++;
    }
    if (debtor.amount === 0) {
      debtorIdx++;
    }
  }

  return settlements;
}
