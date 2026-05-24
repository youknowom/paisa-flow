const CURRENCY_LOCALE_MAP: Record<string, string> = {
  INR: "en-IN",
  USD: "en-US",
  GBP: "en-GB",
  EUR: "de-DE",
  JPY: "ja-JP",
  AUD: "en-AU",
  CAD: "en-CA",
  SGD: "en-SG",
  AED: "ar-AE",
  THB: "th-TH",
};

function getLocale(currency: string): string {
  return CURRENCY_LOCALE_MAP[currency] ?? "en-US";
}

function getCurrencySymbol(currency: string): string {
  try {
    const formatter = new Intl.NumberFormat(getLocale(currency), {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    const parts = formatter.formatToParts(0);
    const symbolPart = parts.find((part) => part.type === "currency");
    return symbolPart?.value ?? currency;
  } catch {
    return currency;
  }
}

function formatCompact(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (currency === "INR" && absAmount >= 100_000) {
    const lakhs = absAmount / 100_000;
    const formatted =
      lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1).replace(/\.0$/, "");
    return `${sign}${symbol}${formatted}L`;
  }

  if (absAmount >= 1_000) {
    const thousands = absAmount / 1_000;
    const formatted =
      thousands % 1 === 0
        ? thousands.toFixed(0)
        : thousands.toFixed(1).replace(/\.0$/, "");
    return `${sign}${symbol}${formatted}K`;
  }

  return `${sign}${symbol}${absAmount.toFixed(absAmount % 1 === 0 ? 0 : 2)}`;
}

function formatIndianNumber(amount: number, decimals: number): string {
  const fixed = Math.abs(amount).toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const grouped =
    rest.length > 0
      ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
  return decimals > 0 && decPart ? `${grouped}.${decPart}` : grouped;
}

export function formatMoney(
  amount: number,
  currency: string = "INR",
  compact?: boolean
): string {
  if (compact) {
    return formatCompact(amount, currency);
  }

  const symbol = getCurrencySymbol(currency);
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  const hasDecimals = abs % 1 !== 0;

  if (currency === "INR") {
    const formatted = formatIndianNumber(abs, hasDecimals ? 2 : 0);
    return `${sign}${symbol}${formatted}`;
  }

  const locale = getLocale(currency);

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount).replace(/\s/g, "");
  } catch {
    return `${sign}${symbol}${abs.toFixed(hasDecimals ? 2 : 0)}`;
  }
}
