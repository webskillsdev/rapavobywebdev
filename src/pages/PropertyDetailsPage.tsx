import { useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetSinglePropertyQuery, useToggleSavedPropertyMutation, useGetFeedsQuery } from "../api/propertyApi";
import { extractIdFromSlug, buildShareSlug } from "../utils/slug";
const AMENITY_ICONS: Record<string, ReactNode> = {
  "Swimming Pool": <path d="M2 12h20M2 17h20M7 7a3 3 0 0 1 3-3c1.5 0 2 1 3 1s1.5-1 3-1a3 3 0 0 1 3 3" />,
  "Fitted Kitchen": <><path d="M4 3h16v18H4z" /><path d="M4 10h16M9 3v7" /></>,
  "Parking Space": <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M9 16V8h4a3 3 0 0 1 0 6H9" /></>,
  "24/7 Security": <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />,
  "Generator": <><rect x="3" y="7" width="14" height="10" rx="1" /><path d="M17 10h4v4h-4M7 3v4M13 3v4" /></>,
  "Water Supply": <path d="M12 2s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z" />,
  "Boys' Quarter": <><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6" /></>,
  "Balcony": <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 15h18M8 15v6M16 15v6" /></>,
  "Gym": <><path d="M4 12h16" /><path d="M2 9v6M22 9v6" /><path d="M6 8v8M18 8v8" /></>,
  "Study Room": <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z" /></>,
  "CCTV": <><rect x="2" y="7" width="13" height="9" rx="2" /><path d="M15 10l6-3v10l-6-3" /></>,
  "Garden": <><path d="M12 22V12" /><path d="M12 12C8 12 6 9 6 6c3 0 6 2 6 6z" /><path d="M12 12c4 0 6-3 6-6-3 0-6 2-6 6z" /></>,
};

function estimateMortgage(price: number): number {
  // Rough estimate only: 20% down payment, 20-year term, 22% annual interest —
  // typical Nigerian mortgage assumptions. Not a quote, just a ballpark figure.
  const principal = price * 0.8;
  const monthlyRate = 0.22 / 12;
  const months = 20 * 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(payment);
}

export default function PropertyDetailsPage() {
  const { slug } = useParams();
  const id = extractIdFromSlug(slug ?? "");
  const [activeIndex, setActiveIndex] = useState(0);
  const [toggleSaved] = useToggleSavedPropertyMutation();

  const { data, isLoading, error } = useGetSinglePropertyQuery(id as string);

  if (isLoading) {
    return <p className="max-w-5xl mx-auto px-6 py-10 text-gray-500">Loading property...</p>;
  }
  if (error) {
    return <p className="max-w-5xl mx-auto px-6 py-10 text-red-600">Something went wrong loading this property.</p>;
  }

  const property = data?.data;

  if (!property) {
    return <p className="max-w-5xl mx-auto px-6 py-10 text-gray-500">Property not found.</p>;
  }

     const images = property.property_media ?? [];
  const activeImage = images[activeIndex];

     const shareUrl = `${window.location.origin}/property/${buildShareSlug(property.title, property.id)}`;

  async function handleShare() {
    const url = shareUrl;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, url });
      } catch {
        // cancelled — not an error worth reporting
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Gallery */}
      <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[16/9]">
        {activeImage && (
          activeImage.media_type === "video" ? (
            <video
              key={activeImage.id}
              src={activeImage.media_url}
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={activeImage.media_url}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          )
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((media: any, index: number) => (
            <button
              key={media.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={
                index === activeIndex
                  ? "relative h-20 w-28 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ring-2 ring-green-600"
                  : "relative h-20 w-28 flex-shrink-0 rounded-md overflow-hidden cursor-pointer opacity-80 hover:opacity-100"
              }
            >
              {media.media_type === "video" ? (
                <>
                  <video src={media.media_url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  <span className="absolute inset-0 flex items-center justify-center text-white text-sm pointer-events-none">▶</span>
                </>
              ) : (
                <img src={media.media_url} alt={property.title} className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Header info */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex gap-2 mb-2">
            {property.listing_type && (
              <span className="rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                {property.listing_type.toUpperCase()}
              </span>
            )}
            {property.property_type && (
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                {property.property_type}
              </span>
            )}
          </div>
                 <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-500 mt-1">
            {[property.location, property.area, property.lga, property.state].filter(Boolean).join(", ")}
          </p>
        </div>

                <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toggleSaved(property.id)}
            className={
              property.saved
                ? "rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
                : "rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            }
          >
            {property.saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <p className="text-2xl font-bold text-green-600 mt-4">
        ₦{property.price?.toLocaleString()}
      </p>
      {property.price > 0 && (
        <p className="text-sm text-gray-400 mt-1">
          Est. ₦{estimateMortgage(property.price).toLocaleString()}/month (mortgage estimate)
        </p>
      )}

            {/* Specs */}
      <div className="flex gap-6 mt-4 py-4 border-y border-gray-100 text-sm text-gray-700">
        {property.bedrooms != null && <span>{property.bedrooms} Beds</span>}
        {property.bathrooms != null && <span>{property.bathrooms} Baths</span>}
        {property.sqm != null && <span>{property.sqm} SQM</span>}
      </div>

      {/* Description */}
      <p className="mt-4 text-gray-700 leading-relaxed text-justify">
        {property.description}
      </p>

           {/* Amenities */}
      {property.amenities?.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {property.amenities.map((item: string) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="h-8 w-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {AMENITY_ICONS[item] ?? <path d="M20 6L9 17l-5-5" />}
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent / contact card */}
      {(property.agent_name || property.agent_phone) && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Contact</h2>
          <div className="flex items-center gap-3 mb-4">
            <span className="h-11 w-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold flex-shrink-0">
              {(property.agent_name ?? "?").charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{property.agent_name}</p>
              {property.company_name && <p className="text-xs text-gray-500">{property.company_name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {property.agent_phone ? (
              <a
                href={`tel:${property.agent_phone}`}
                className="text-center text-sm font-medium border border-gray-300 rounded-md px-2 py-2 text-gray-700 hover:bg-white"
              >
                Call Agent
              </a>
            ) : (
              <span className="text-center text-sm font-medium border border-gray-200 rounded-md px-2 py-2 text-gray-300 cursor-not-allowed">
                Call Agent
              </span>
            )}
            <span
              title="Coming soon — needs the Messages feature"
              className="text-center text-sm font-medium border border-gray-200 rounded-md px-2 py-2 text-gray-300 cursor-not-allowed"
            >
              Message
            </span>
            <span
              title="Coming soon — not built yet"
              className="text-center text-sm font-medium border border-gray-200 rounded-md px-2 py-2 text-gray-300 cursor-not-allowed"
            >
              Book Visit
            </span>
          </div>
        </div>
      )}

       {/* Location detail */}
      {(property.state || property.lga || property.area || property.estate) && (
        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-3">Location</h2>
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 border border-gray-200 rounded-xl p-4">
            {property.state && (
              <div><p className="text-xs text-gray-500">State</p><p className="text-gray-800">{property.state}</p></div>
            )}
            {property.lga && (
              <div><p className="text-xs text-gray-500">City / LGA</p><p className="text-gray-800">{property.lga}</p></div>
            )}
            {property.area && (
              <div><p className="text-xs text-gray-500">Area</p><p className="text-gray-800">{property.area}</p></div>
            )}
            {property.estate && (
              <div><p className="text-xs text-gray-500">Estate</p><p className="text-gray-800">{property.estate}</p></div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">A map isn't available yet — exact coordinates aren't collected for listings.</p>
        </div>
      )}

      {/* Price Insights — not built, needs real market-comparison data */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-60">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Price Insights</h2>
          <span className="text-[10px] uppercase tracking-wide bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Market comparisons will appear here once available.</p>
      </div>

      {/* Documents — only shows what was actually entered, never a fake "View" link */}
      {property.document_status?.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-3">Property Documents</h2>
          <div className="flex flex-wrap gap-2">
            {property.document_status.map((doc: string) => (
              <span key={doc} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md">
                {doc}
              </span>
            ))}
          </div>
        </div>
      )}

           {/* Share this property */}
      <div className="mt-8">
        <h2 className="font-semibold text-gray-900 mb-3">Share this property</h2>
                    <div className="flex gap-3">
                  <a
            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            title="Share on WhatsApp"
            className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center"
            style={{ color: "#25D366" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            title="Share on Facebook"
            className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center"
            style={{ color: "#1877F2" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(property.title)}`}
            target="_blank"
            rel="noreferrer"
            title="Share on X"
            className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center"
            style={{ color: "#000000" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l16 16M20 4L4 20" />
            </svg>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer"
            title="Share on LinkedIn"
            className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center"
            style={{ color: "#0A66C2" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
              <path d="M10 9v12M10 13a4 4 0 0 1 8 0v8" />
            </svg>
          </a>
          <button
            type="button"
            onClick={handleShare}
            title="Copy link / more options"
            className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-700"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
            </svg>
                   </button>
        </div>
      </div>

      <SimilarProperties propertyType={property.property_type} currentId={property.id} />
    </div>
  );
}

function SimilarProperties({ propertyType, currentId }: { propertyType: string; currentId: string }) {
  const { data } = useGetFeedsQuery({
    page: 1,
    limit: 5,
    itemType: "property",
    propertyType,
  });

  const items = (data?.data ?? []).filter((item: any) => item.id !== currentId).slice(0, 3);

  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="font-semibold text-gray-900 mb-3">Similar Properties</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item: any) => (
          <Link
            key={item.id}
            to={`/property/${buildShareSlug(item.title, item.id)}`}
            className="rounded-lg overflow-hidden border border-gray-200 hover:shadow-sm"
          >
            <div className="aspect-[4/3] bg-gray-100">
              {item.primary_media && (
                <img src={item.primary_media} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
              <p className="text-xs text-green-600 font-semibold">₦{Number(item.price ?? 0).toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
