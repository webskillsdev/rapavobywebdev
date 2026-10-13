import { buildShareSlug } from "../../utils/slug";
import type { ResidentialShareCardData } from "./ResidentialShareCard";

// Turns a property row from Supabase (the same object the property details page uses,
// with its property_media and profiles) into the plain data the share card draws.
// All the "what do we do when a value is missing" decisions live here, in one place.

export type ShareCardKind = "residential" | "land";

// Land gets its own card later (Phase 7). Everything else uses the Residential card.
export function shareCardKindOf(property: any): ShareCardKind {
  return property?.property_type === "land" ? "land" : "residential";
}

// "12" -> 12, "" / null / "abc" / 0 -> null  (so empty values never show as "0")
function positiveNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Ask Cloudinary for a card-sized copy of an existing image (no re-upload).
// Anything that is not a Cloudinary image is used exactly as it is.
function cloudinary(url: string | null | undefined, transform: string): string | null {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

export function buildResidentialCardData(
  property: any,
  origin: string = window.location.origin,
): ResidentialShareCardData {
  // Photos only (videos can't be a card picture). Cover photo first, otherwise the first photo.
  const media: any[] = Array.isArray(property?.property_media) ? property.property_media : [];
  const photos = media.filter((m) => m?.media_url && m.media_type !== "video");
  const cover = photos.find((m) => m.is_cover) ?? photos[0];

  // The agent profile can arrive as an object or a one-item list.
  const profile = Array.isArray(property?.profiles) ? property.profiles[0] : property?.profiles;
  const agentName: string | null = profile?.full_name?.trim() || property?.agent_name?.trim() || null;

  return {
    title: property?.title ?? "",
    listingType: property?.listing_type ?? "",
    price: positiveNumber(property?.price),
    location: property?.location ?? "",
    imageUrl: cloudinary(cover?.media_url, "w_1080,h_720,c_fill,g_auto"),
    photoCount: photos.length,
    bedrooms: positiveNumber(property?.bedrooms),
    bathrooms: positiveNumber(property?.bathrooms),
    toilets: positiveNumber(property?.toilets),
    sqm: positiveNumber(property?.sqm),
    agentName,
    agentAvatarUrl: cloudinary(profile?.avatar_url, "w_300,h_300,c_fill,g_face"),
    agentVerified: profile?.is_verified === true,
    shareUrl: `${origin}/share/${buildShareSlug(property?.title ?? "property", property?.id ?? "")}`,
  };
}