import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../store";
import { useGetMyPropertiesQuery, useDeletePropertyMutation } from "../api/propertyApi";
import { buildShareSlug } from "../utils/slug";
import DashboardShell from "../components/Layout/DashboardShell";
import AgentSidebar from "../components/Layout/AgentSidebar";

export default function MyListingsPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [deleteProperty] = useDeletePropertyMutation();

  const { data, isLoading, error } = useGetMyPropertiesQuery(undefined, {
    skip: !isAuthenticated,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to see your listings.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  if (user.currentMode !== "agent") {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">This page is only available in agent mode.</p>
        <Link to="/post-property" className="text-green-600 font-medium hover:underline">
          Activate Agent Mode
        </Link>
      </div>
    );
  }

  const listings: any[] = data?.data ?? [];

  // Built from whatever status values actually exist in your data —
  // never guessed, so it can't silently be wrong.
  const statuses = Array.from(new Set(listings.map((p) => p.status).filter(Boolean)));

  const filtered = listings
    .filter((p) => activeStatus === "all" || p.status === activeStatus)
    .filter((p) => `${p.title} ${p.location}`.toLowerCase().includes(search.toLowerCase()));

  const totalViews = listings.reduce((sum, p) => sum + (p.views_count ?? 0), 0);
  const totalSaves = listings.reduce((sum, p) => sum + (p.favorite_count ?? 0), 0);

    async function handleShare(id: string, title: string) {
    const url = `${window.location.origin}/share/${buildShareSlug(title, id)}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    await deleteProperty(id);
  }

  return (
    <DashboardShell sidebar={<AgentSidebar />}>
      <div className="px-6 py-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-500 mt-1">Manage, track and grow your property listings.</p>
          </div>
          <Link
            to="/post-property"
            className="rounded-md bg-green-600 text-white font-semibold px-4 py-2 text-sm hover:bg-green-700"
          >
            + Post a Property
          </Link>
        </div>

        {/* Real stats only — no fabricated "Enquiries" number */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Listings</p>
            <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Views</p>
            <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Saves</p>
            <p className="text-2xl font-bold text-gray-900">{totalSaves}</p>
          </div>
        </div>

                <div className="flex gap-2 mt-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveStatus("all")}
            className={
              activeStatus === "all"
                ? "px-3 py-1.5 rounded-md text-sm font-semibold bg-green-600 text-white whitespace-nowrap"
                : "px-3 py-1.5 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
            }
          >
            All ({listings.length})
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveStatus(s)}
              className={
                activeStatus === s
                  ? "px-3 py-1.5 rounded-md text-sm font-semibold bg-green-600 text-white whitespace-nowrap capitalize"
                  : "px-3 py-1.5 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap capitalize"
              }
            >
              {s} ({listings.filter((p) => p.status === s).length})
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search your listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-6 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="mt-6 space-y-3">
          {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
          {error ? <p className="text-sm text-red-600">Something went wrong loading your listings.</p> : null}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-gray-500">
              {listings.length === 0
                ? "You haven't listed any properties yet."
                : "No listings match your search."}
            </p>
          )}

          {filtered.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
              <img
                src={property.cover_url ?? "/placeholder-property.jpg"}
                alt={property.title}
                className="h-24 w-32 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 truncate">{property.title}</p>
                    <p className="text-sm text-gray-500">{property.location}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap capitalize">
                    {property.status}
                  </span>
                </div>
                <p className="text-green-600 font-bold mt-1">
                  ₦{Number(property.price ?? 0).toLocaleString()}
                  {property.listing_type === "rent" && <span className="text-xs text-gray-400"> /year</span>}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  {property.property_type !== "land" && (
                    <span>{property.bedrooms ?? 0} Beds · {property.bathrooms ?? 0} Baths · {property.sqm ?? 0} SQM</span>
                  )}
                  <span>{property.views_count ?? 0} Views</span>
                  <span>{property.favorite_count ?? 0} Saves</span>
                              <span>
                    Listed {property.created_at ? new Date(property.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                                   <Link
                    to={`/my-listings/${property.id}`}
                    className="text-xs font-medium border border-gray-300 rounded px-2 py-1 text-gray-700 hover:bg-gray-50"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                  onClick={() => handleShare(property.id, property.title)}
                    className="text-xs font-medium border border-gray-300 rounded px-2 py-1 text-gray-700 hover:bg-gray-50"
                  >
                    Share
                  </button>
                                   <Link
                    to={`/my-listings/${property.id}/edit`}
                    className="text-xs font-medium border border-gray-300 rounded px-2 py-1 text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(property.id, property.title)}
                    className="text-xs font-medium border border-red-200 rounded px-2 py-1 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}