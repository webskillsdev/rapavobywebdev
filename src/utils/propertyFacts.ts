// Helpers for showing a property's key facts (bedrooms, bathrooms, size).
// Missing, empty or zero values are hidden instead of showing "0 Beds" or "0 SQM".

// Returns the value as a number when it is a real, positive number; otherwise null.
export function positiveNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// "4 Beds · 5 Baths · 350 SQM" — only the parts that are actually known.
export function propertyFacts(p: { bedrooms?: unknown; bathrooms?: unknown; sqm?: unknown }): string {
  const beds = positiveNumber(p.bedrooms);
  const baths = positiveNumber(p.bathrooms);
  const size = positiveNumber(p.sqm);
  const parts: string[] = [];
  if (beds) parts.push(`${beds} ${beds === 1 ? "Bed" : "Beds"}`);
  if (baths) parts.push(`${baths} ${baths === 1 ? "Bath" : "Baths"}`);
  if (size) parts.push(`${size.toLocaleString()} SQM`);
  return parts.join(" · ");
}


// The price period shown after the price: "/year", "/night"… or nothing for sales.
// Uses the period saved on the listing; falls back to "/year" for rent and
// "/night" for shortlets when none was saved.
export function pricePeriod(p: { listing_type?: string | null; price_duration?: string | null }): string | null {
  if (!p.listing_type || p.listing_type === "sale") return null;
  const saved = String(p.price_duration ?? "").trim().toLowerCase();
  const names: Record<string, string> = {
    year: "/year", yearly: "/year", annum: "/year", annually: "/year",
    month: "/month", monthly: "/month",
    week: "/week", weekly: "/week",
    night: "/night", nightly: "/night",
    day: "/day", daily: "/day",
  };
  if (saved) return names[saved] ?? `/${saved}`;
  if (p.listing_type === "rent") return "/year";
  if (p.listing_type === "shortlet") return "/night";
  return null;
}