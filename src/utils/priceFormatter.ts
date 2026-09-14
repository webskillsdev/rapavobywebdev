export const formatPrice = (value: string): string => {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, "");

  // Add commas for thousands
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const unformatPrice = (value: string): string => {
  // Remove all non-numeric characters
  return value.replace(/\D/g, "");
};

export const PROPERTY_TYPES = [
  "all",
  "Duplex",
  "Bungalow",
  "Apartment",
  "Terrace",
  "Land",
  "Warehouse",
  "Office",
  "Shop",
];

// utils/price.ts



/**
 * True if the search string looks like a price query (digits, ₦/#, commas,
 * decimal point, or a k/m/b suffix) rather than free text.
 */
// export function isPriceQuery(search: string): boolean {
//   const cleaned = search.trim();
//   if (!cleaned) return false;
//   return /^[₦#]?\s*[\d,]+(\.\d+)?\s*[kmb]?$/i.test(cleaned);
// }

/**
 * Converts shorthand price input into a number.
 * "5m" -> 5000000, "500k" -> 500000, "₦5,000,000" -> 5000000, "1200000" -> 1200000
 */
// export function parsePriceShorthand(input: string): number | null {
//   if (!input) return null;
//   const cleaned = input.trim().replace(/[₦#,\s]/g, "");
//   const match = cleaned.match(/^(\d+(\.\d+)?)([kmb])?$/i);
//   if (!match) return null;

//   const value = parseFloat(match[1]);
//   const suffix = match[3]?.toLowerCase();
//   const multipliers: Record<string, number> = {
//     k: 1_000,
//     m: 1_000_000,
//     b: 1_000_000_000,
//   };

//   return suffix ? value * multipliers[suffix] : value;
// }

export function isPriceQuery(search: string): boolean {
  const cleaned = search.trim();
  if (!cleaned) return false;
  return /^(₦|#|NGN|N)?\s*[\d,]+(\.\d+)?\s*[kmb]?$/i.test(cleaned);
}

export function parsePriceShorthand(input: string): number | null {
  if (!input) return null;
  const cleaned = input
    .trim()
    .replace(/^(₦|#|NGN|N)/i, "")
    .replace(/[,\s]/g, "");
  const match = cleaned.match(/^(\d+(\.\d+)?)([kmb])?$/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const suffix = match[3]?.toLowerCase();
  const multipliers: Record<string, number> = {
    k: 1_000,
    m: 1_000_000,
    b: 1_000_000_000,
  };

  return suffix ? value * multipliers[suffix] : value;
}

/**
 * Used for minPrice / maxPrice query params — accepts numbers, raw digit
 * strings, or shorthand like "5m" / "₦5,000,000".
 */
export function parsePrice(value?: string | number): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number") return value;
  return parsePriceShorthand(value);
}

/**
 * For free-text `search`, returns the leading digit string to prefix-match
 * against price_text (e.g. "1200" -> "1200", "5m" -> "5000000").
 * Returns null if there are no usable digits.
 */
export function extractPricePrefix(search: string): string | null {
  const parsed = parsePriceShorthand(search);
  if (parsed === null) return null;
  return String(Math.trunc(parsed));
}

