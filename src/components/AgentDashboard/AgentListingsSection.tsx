import { useState } from "react";
import { Link } from "react-router-dom";
import { useDeletePropertyMutation } from "../../api/propertyApi";
import { buildShareSlug } from "../../utils/slug";

function badgeFor(listingType?: string): { label: string; color: string } {
  if (listingType === "rent") return { label: "FOR RENT", color: "bg-purple-600" };
  if (listingType === "shortlet") return { label: "SHORTLET", color: "bg-amber-500" };
  return { label: "FOR SALE", color: "bg-green-600" };
}

function ListingCard({
  property,
  onDelete,
}: {
  property: any;
  onDelete: (id: string, title: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const media: any[] = property.property_media ?? [];
  const photos = media.filter((m) => m.media_type !== "video");
  const cover: string | null =
    property.cover_url ??
    photos.find((m) => m.is_cover)?.media_url ??
    photos[0]?.media_url ??
    null;

  const badge = badgeFor(property.listing_type);
  const duration =
    property.listing_type === "sale"
      ? null
      : property.price_duration ?? (property.listing_type === "rent" ? "year" : null);

  const detailsPath = `/my-listings/${property.id}`;

  async function handleShare() {
    setMenuOpen(false);
    const url = `${window.location.origin}/share/${buildShareSlug(property.title, property.id)}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <Link
        to={detailsPath}
        className="block relative aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden"
      >
        {cover && <img src={cover} alt={property.title} className="h-full w-full object-cover" />}
        <span
          className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded ${badge.color}`}
        >
          {badge.label}
        </span>
      </Link>

      <div className="p-4">
        <Link
          to={detailsPath}
          className="block font-semibold text-gray-900 text-sm truncate hover:underline"
        >
          {property.title}
        </Link>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{property.location}</p>
        <p className="text-green-600 font-bold mt-2">
          ₦{Number(property.price ?? 0).toLocaleString()}
          {duration && <span className="text-xs text-gray-400 font-normal"> / {duration}</span>}
        </p>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1" title="Views">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {(property.views_count ?? 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1" title="Saves">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            {(property.favorite_count ?? 0).toLocaleString()}
          </span>

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Listing actions"
              className="h-7 w-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1 text-sm">
                  <Link
                    to={detailsPath}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </Link>
                  <Link
                    to={`${detailsPath}/edit`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(property.id, property.title);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentListingsSection({
  listings,
  loading,
}: {
  listings: any[];
  loading: boolean;
}) {
  const [deleteProperty] = useDeletePropertyMutation();

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    await deleteProperty(id);
  }

  return (
    <section id="listings" className="mt-8 scroll-mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
        {listings.length > 0 && (
          <Link to="/my-listings" className="text-sm font-medium text-green-600 hover:underline">
            View all listings →
          </Link>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {!loading && listings.length === 0 && (
        <p className="text-sm text-gray-500">
          You haven't listed any properties yet.{" "}
          <Link to="/post-property" className="text-green-600 hover:underline">
            List your first one
          </Link>
          .
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {listings.slice(0, 4).map((property) => (
          <ListingCard key={property.id} property={property} onDelete={handleDelete} />
        ))}
      </div>
    </section>
  );
}