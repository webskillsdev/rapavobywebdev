import { useState } from "react";
import { Link } from "react-router-dom";
import { useGetFeedsQuery, useToggleSavedPropertyMutation, useGetMatchingPropertiesForMyRequestsQuery } from "../api/propertyApi";
import promoCard from "../assets/list-property-promo.jpg";
const TABS = [
  { label: "For You", filter: {} },
  { label: "For Sale", filter: { listingType: "sale" } },
  { label: "For Rent", filter: { listingType: "rent" } },
  { label: "Land", filter: { propertyType: "land" } },
  { label: "Commercial", filter: { propertyType: "commercial" } },
];

function timeAgo(dateString?: string): string {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState(0);

  const { data, isLoading, error } = useGetFeedsQuery({
    page: 1,
    limit: 15,
    itemType: "property",
    ...TABS[activeTab].filter,
  });

    const items = data?.data ?? [];
  const [toggleSaved] = useToggleSavedPropertyMutation();
  const { data: matchesData } = useGetMatchingPropertiesForMyRequestsQuery();
  const matches = matchesData?.data ?? [];

  async function handleShare(id: string) {
    const url = `${window.location.origin}/property/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // cancelled — not an error worth reporting
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6">
      <div className="max-w-2xl flex-1 min-w-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Feed</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActiveTab(i)}
            className={
              activeTab === i
                ? "px-4 py-2 rounded-full text-sm font-semibold bg-green-600 text-white whitespace-nowrap"
                : "px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading feed...</p>}
      {error ? <p className="text-sm text-red-600">Something went wrong loading the feed.</p> : null}
      {!isLoading && items.length === 0 && (
        <p className="text-sm text-gray-500">No properties match this category yet.</p>
      )}

      <div className="space-y-4">
        {items.map((item: any) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <span className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold flex-shrink-0">
                {(item.agent_name ?? item.user_name ?? "?").charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.agent_name ?? item.user_name ?? "Agent"}</p>
                <p className="text-xs text-gray-500">{timeAgo(item.created_at)} · {item.location}</p>
              </div>
            </div>

            <Link to={`/property/${item.id}`} className="block relative aspect-[4/3] bg-gray-100">
              {item.primary_media && (
                <img src={item.primary_media} alt={item.title} className="h-full w-full object-cover" />
              )}
              {item.listing_type && (
                <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  {item.listing_type.toUpperCase()}
                </span>
              )}
            </Link>

            <div className="p-4">
              <Link to={`/property/${item.id}`} className="font-semibold text-gray-900 hover:underline">
                {item.title}
              </Link>
              <p className="text-green-600 font-bold mt-1">
                ₦{Number(item.price ?? 0).toLocaleString()}
                {item.listing_type === "rent" && <span className="text-xs text-gray-400 font-normal"> /year</span>}
              </p>
              {item.property_type !== "land" && (
                <p className="text-sm text-gray-600 mt-1">
                  {item.bedrooms ?? 0} Beds · {item.bathrooms ?? 0} Baths · {item.sqm ?? 0} SQM
                </p>
              )}
                       {item.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
              )}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-gray-100 text-sm">
                <span title="Coming soon" className="flex items-center gap-1.5 text-gray-300 cursor-not-allowed">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                  Like
                </span>
                <span title="Coming soon" className="flex items-center gap-1.5 text-gray-300 cursor-not-allowed">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  Comment
                </span>
                <button
                  type="button"
                  onClick={() => handleShare(item.id)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                    <path d="M16 6l-4-4-4 4" />
                    <path d="M12 2v13" />
                  </svg>
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => toggleSaved(item.id)}
                  className={item.saved ? "flex items-center gap-1.5 text-green-600 font-medium ml-auto" : "flex items-center gap-1.5 text-gray-600 hover:text-gray-900 ml-auto"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={item.saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  {item.saved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
           <div className="w-72 flex-shrink-0 space-y-4 hidden lg:block">
        {matches.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Property Matches</p>
            <div className="space-y-3">
              {matches.slice(0, 3).map((property: any) => (
                <Link
                  key={property.id}
                  to={`/property/${property.id}`}
                  className="flex gap-2 hover:bg-gray-50 rounded-lg p-1 -m-1"
                >
                  <img
                    src={property.primary_media ?? "/placeholder-property.jpg"}
                    className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{property.title}</p>
                    <p className="text-xs text-green-600 font-medium">₦{Number(property.price ?? 0).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Suggested Agents</p>
            <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>
          </div>
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2 opacity-40">
                <span className="h-9 w-9 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-2.5 w-24 bg-gray-200 rounded" />
                  <div className="h-2 w-16 bg-gray-100 rounded mt-1.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Trending Locations</p>
            <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="aspect-video rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>

               <Link to="/post-property" className="block rounded-xl overflow-hidden shadow-sm hover:opacity-90 transition-opacity">
          <img src={promoCard} alt="List Your Property on Rapavo — get more visibility, more buyers, more results" className="w-full" />
        </Link>
      </div>
    </div>
  );
}