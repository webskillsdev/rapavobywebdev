// ---------- Location ----------

// Normalize + tokenize a location string into meaningful place-name tokens.
// "Lekki, Lagos" -> ["lekki", "lagos"]; "lekki lagos" -> ["lekki", "lagos"]
export const tokenizeLocation = (loc?: string | null): string[] =>
  (loc ?? "")
    .toLowerCase()
    .split(/[,\-\/]|\s+| and /)
    .map((part) => part.trim())
    .filter(Boolean);

// Two locations match only if they share an EXACT token (not substring).
export const locationsMatch = (locA?: string | null, locB?: string | null) => {
  const a = tokenizeLocation(locA);
  const b = tokenizeLocation(locB);
  if (!a.length || !b.length) return false;
  return a.some((tokenA) => b.includes(tokenA));
};

// ---------- Free-text extraction ----------

export const extractBedroomCount = (text: string): number | null => {
  const match = text.match(/\b(\d{1,2})\s*[-]?\s*(bed(room)?s?|bd)\b/i);
  return match ? parseInt(match[1], 10) : null;
};

export const propertyTypeKeywords: Record<string, string[]> = {
  duplex: ["duplex"],
  bungalow: ["bungalow"],
  apartment: ["apartment", "flat"],
  land: ["land", "plot"],
  terrace: ["terrace", "terraced"],
  detached: ["detached"],
  semi_detached: ["semi detached", "semi-detached"],
  mansion: ["mansion"],
  studio: ["studio"],
};

export const extractPropertyTypeMentions = (text: string): string[] => {
  const lower = text.toLowerCase();
  return Object.entries(propertyTypeKeywords)
    .filter(([, keywords]) => keywords.some((kw) => lower.includes(kw)))
    .map(([type]) => type);
};

export const tokenize = (text: string): string[] =>
  (text ?? "")
    .toLowerCase()
    .split(/\W+/)
    .map((w) => w.trim())
    .filter(Boolean);

export const stopWords = new Set([
  "for",
  "the",
  "with",
  "and",
  "looking",
  "need",
  "want",
  "property",
  "house",
  "home",
  "bedroom",
  "bedrooms",
  "new",
  "spacious",
  "available",
  "luxury",
  "modern",
  "beautiful",
  "nice",
  "good",
  "well",
  "fully",
  "newly",
  "built",
  "sale",
  "rent",
  "rentals",
  "apartment",
  "flat",
  "duplex",
  "bungalow",
  "estate",
  "area",
  "location",
  "details",
  "contact",
]);

export const significantKeywords = (title: string): string[] =>
  tokenize(title).filter((w) => w.length > 4 && !stopWords.has(w));

// ---------- Scoring ----------

export const MINIMUM_SCORE = 75;
export const HIGH_PRIORITY_SCORE = 95;

export type MatchScoreResult = {
  score: number;
  matchedFields: string[];
} | null; // null = failed a mandatory gate

/**
 * Scores a property against a request's stated needs. Direction-agnostic —
 * works whether the property is "mine" and the request is "theirs", or
 * vice versa. Returns null if a mandatory gate (location or budget) fails.
 */
export const scoreMatch = ({
  propertyLocation,
  propertyPrice,
  propertyType,
  propertyBedrooms,
  propertyTitle,
  requestLocation,
  requestBudget,
  requestText,
}: {
  propertyLocation?: string | null;
  propertyPrice?: number | null;
  propertyType?: string | null;
  propertyBedrooms?: number | null;
  propertyTitle?: string | null;
  requestLocation?: string | null;
  requestBudget?: number | null;
  requestText: string;
}): MatchScoreResult => {
  const matchedFields: string[] = [];
  let score = 0;

  // --- MANDATORY GATE 1: Location ---
  if (!locationsMatch(propertyLocation, requestLocation)) return null;
  score += 40;
  matchedFields.push("Location");

  // --- MANDATORY GATE 2: Budget must accommodate the property price ---
  const budgetOk =
    requestBudget != null &&
    propertyPrice != null &&
    propertyPrice <= requestBudget;
  if (!budgetOk) return null;
  score += 20;
  matchedFields.push("Budget");

  const requestTokens = new Set(tokenize(requestText));

  // --- Supporting signal: property type mentioned in request text ---
  if (propertyType) {
    const mentionedTypes = extractPropertyTypeMentions(requestText);
    if (mentionedTypes.includes(propertyType)) {
      score += 20;
      matchedFields.push("Property Type");
    }
  }

  // --- Supporting signal: bedroom count exact match ---
  const requestedBedrooms = extractBedroomCount(requestText);
  if (
    requestedBedrooms != null &&
    propertyBedrooms != null &&
    requestedBedrooms === propertyBedrooms
  ) {
    score += 15;
    matchedFields.push("Bedrooms");
  }

  // --- Supporting signal: exact-word title keyword overlap (need 2+) ---
  const keywords = significantKeywords(propertyTitle ?? "");
  const overlap = keywords.filter((kw) => requestTokens.has(kw));
  if (overlap.length >= 2) {
    score += 15;
    matchedFields.push("Title");
  }

  if (score < MINIMUM_SCORE) return null;

  return { score, matchedFields };
};
