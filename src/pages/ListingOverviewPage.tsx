import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useGetSinglePropertyQuery, useDeletePropertyMutation } from "../api/propertyApi";
import { buildShareSlug } from "../utils/slug";
import DashboardShell from "../components/Layout/DashboardShell";
import AgentSidebar from "../components/Layout/AgentSidebar";

const TABS = ["Overview", "Details", "Location", "Media"];
const SOON_TABS = ["AI Content", "Documents"];

export default function ListingOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState("Overview");
  const [activeImage, setActiveImage] = useState(0);
  const [deleteProperty] = useDeletePropertyMutation();

  const { data, isLoading, error } = useGetSinglePropertyQuery(id as string, {
    skip: !isAuthenticated,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to see this listing.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  if (isLoading) return <p className="max-w-5xl mx-auto px-6 py-10 text-gray-500">Loading...</p>;
  if (error) return <p className="max-w-5xl mx-auto px-6 py-10 text-red-600">Something went wrong loading this listing.</p>;

  const property = data?.data;
  if (!property) return <p className="max-w-5xl mx-auto px-6 py-10 text-gray-500">Listing not found.</p>;

       const images = [...(property.property_media ?? [])].sort((a: any, b: any) => {
      if (a.media_type === "video" && b.media_type !== "video") return -1;
      if (a.media_type !== "video" && b.media_type === "video") return 1;
      return 0;
    });
  const thumbs = images.filter((_: any, i: number) => i !== activeImage).slice(0, 6);
  const extraCount = images.length - 1 - thumbs.length;
   async function handleShare() {
    const url = `${window.location.origin}/share/${buildShareSlug(property.title, property.id)}`;
    await navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${property.title}"? This can't be undone.`)) return;
    await deleteProperty(property.id);
    navigate("/my-listings");
  }

  return (
    <DashboardShell sidebar={<AgentSidebar />}>
      <div className="flex gap-6 px-6 py-8">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/my-listings")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Back to My Listings
          </button>

          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{property.title}</h1>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
                  {property.status}
                </span>
              </div>
              <p className="text-gray-500 mt-1">{property.location}</p>
              <div className="flex gap-4 text-sm text-gray-600 mt-2">
                {property.property_type !== "land" && (
                  <span>{property.bedrooms ?? 0} Beds · {property.bathrooms ?? 0} Baths · {property.sqm ?? 0} SQM</span>
                )}
                <span className="capitalize">{property.listing_type}</span>
              </div>
            </div>
            <div className="flex gap-2">
                            <Link
                to={`/share/${buildShareSlug(property.title, property.id)}`}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View on Public Page
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Share
              </button>
            </div>
          </div>

          {/* Gallery — main image left, thumbnail grid to its right */}
                    <div className="mt-6 grid grid-cols-3 gap-1.5">
                        <div className="col-span-2 rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
              {images[activeImage] && (
                               images[activeImage].media_type === "video" ? (
                        <video
                    key={images[activeImage].id}
                    src={images[activeImage].media_url}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-contain bg-black"
                  />
                ) : (
                  <img src={images[activeImage].media_url} alt={property.title} className="h-full w-full object-cover" />
                )
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 content-start">
              {thumbs.map((media: any, i: number) => {
                const realIndex = images.findIndex((m: any) => m.id === media.id);
                const isLast = i === thumbs.length - 1 && extraCount > 0;
                return (
                                   <button
                    key={media.id}
                    type="button"
                    onClick={() => (isLast ? setActiveTab("Media") : setActiveImage(realIndex))}
                    className="relative rounded-lg overflow-hidden aspect-square bg-gray-900"
                  >
                                    {media.media_type === "video" ? (
                      <video src={media.media_url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                    ) : (
                      <img src={media.media_url} className="h-full w-full object-cover" />
                    )}
                    {media.media_type === "video" && !isLast && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-lg pointer-events-none">▶</span>
                    )}
                    {isLast && (
                      <span className="absolute inset-0 bg-black/50 text-white text-xs font-semibold flex items-center justify-center">
                        +{extraCount} more
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={
                  activeTab === tab
                    ? "px-4 py-2 text-sm font-semibold text-green-700 border-b-2 border-green-600 whitespace-nowrap"
                    : "px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap"
                }
              >
                {tab}
              </button>
            ))}
            {SOON_TABS.map((tab) => (
              <span
                key={tab}
                title="Coming soon"
                className="px-4 py-2 text-sm font-medium text-gray-300 whitespace-nowrap cursor-not-allowed"
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="py-6">
            {activeTab === "Overview" && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
              </div>
            )}
                   {activeTab === "Details" && (
          <>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Property Type</p>
              <p className="text-gray-600 capitalize">{property.property_type}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Listing Purpose</p>
              <p className="text-gray-600 capitalize">{property.listing_type}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Price</p>
              <p className="text-gray-600">
                ₦{Number(property.price ?? 0).toLocaleString()}
                {property.negotiable && " (Negotiable)"}
              </p>
            </div>
                       {property.property_type !== "land" && (
              <div>
                <p className="font-semibold text-gray-700">Specs</p>
                <p className="text-gray-600">
                  {property.bedrooms ?? 0} Beds · {property.bathrooms ?? 0} Baths
                  {property.toilets != null && ` · ${property.toilets} Toilets`} · {property.sqm ?? 0} SQM
                </p>
              </div>
            )}
            {property.furnished_status && (
              <div>
                <p className="font-semibold text-gray-700">Furnishing</p>
                <p className="text-gray-600 capitalize">{String(property.furnished_status).replace("_", " ")}</p>
              </div>
            )}
            {property.year_built && (
              <div>
                <p className="font-semibold text-gray-700">Year Built</p>
                <p className="text-gray-600">{property.year_built}</p>
              </div>
            )}
            {property.document_status?.length > 0 && (
              <div>
                <p className="font-semibold text-gray-700">Title Type</p>
                <p className="text-gray-600">{property.document_status.join(", ")}</p>
              </div>
            )}
                        {property.amenities?.length > 0 && (
              <div className="col-span-2">
                <p className="font-semibold text-gray-700 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((item: string) => (
                    <span
                      key={item}
                      className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
                      )}
          </div>

          {(property.agent_name || property.agent_phone || property.company_name || property.agent_email || property.youtube_link || property.video_link) && (
            <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="font-semibold text-gray-900 mb-3">Contact Information</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {property.agent_name && (
                  <div>
                    <p className="text-xs text-gray-500">Contact Name</p>
                    <p className="text-gray-800">{property.agent_name}</p>
                  </div>
                )}
                {property.agent_phone && (
                  <div>
                    <p className="text-xs text-gray-500">Contact Phone</p>
                    <p className="text-gray-800">{property.agent_phone}</p>
                  </div>
                )}
                {property.company_name && (
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-gray-800">{property.company_name}</p>
                  </div>
                )}
                {property.agent_email && (
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-800">{property.agent_email}</p>
                  </div>
                )}
                {property.youtube_link && (
                  <div>
                    <p className="text-xs text-gray-500">YouTube</p>
                    <a href={property.youtube_link} target="_blank" rel="noreferrer" className="text-green-700 hover:underline break-all">
                      {property.youtube_link}
                    </a>
                  </div>
                )}
                {property.video_link && (
                  <div>
                    <p className="text-xs text-gray-500">Video Link</p>
                    <a href={property.video_link} target="_blank" rel="noreferrer" className="text-green-700 hover:underline break-all">
                      {property.video_link}
                    </a>
                  </div>
                )}
                            </div>
            </div>
          )}
          </>
        )}

        {activeTab === "Location" && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {property.state && (
              <div>
                <p className="font-semibold text-gray-700">State</p>
                <p className="text-gray-600">{property.state}</p>
              </div>
            )}
            {property.lga && (
              <div>
                <p className="font-semibold text-gray-700">City / LGA</p>
                <p className="text-gray-600">{property.lga}</p>
              </div>
            )}
            {property.area && (
              <div>
                <p className="font-semibold text-gray-700">Area</p>
                <p className="text-gray-600">{property.area}</p>
              </div>
            )}
            {property.estate && (
              <div>
                <p className="font-semibold text-gray-700">Estate</p>
                <p className="text-gray-600">{property.estate}</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="font-semibold text-gray-700">Street Address</p>
              <p className="text-gray-600">{property.location}</p>
            </div>
          </div>
        )}

        {activeTab === "Media" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((media: any) => (
              <div key={media.id} className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                                {media.media_type === "video" ? (
                  <video src={media.media_url} controls playsInline className="h-full w-full object-cover" />
                ) : (
                  <img src={media.media_url} className="h-full w-full object-cover" />
                )}
                {media.is_cover && (
                  <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
          </div>
        </div>

        {/* Right column */}
        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Listing Performance</p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900">{property.views_count ?? 0}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{property.favorite_count ?? 0}</p>
                <p className="text-xs text-gray-500">Saves</p>
              </div>
            </div>
          </div>

                              <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={`/my-listings/${property.id}/edit`}
                className="flex items-center gap-2 text-sm font-medium border border-green-200 bg-green-50 rounded-md px-3 py-2 text-green-700 hover:bg-green-100"
              >
                <span className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 text-green-700">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-gray-900">Edit Listing</span>
                  <span className="block text-xs text-gray-500">Update details</span>
                </span>
              </Link>

              <span
                title="Coming soon — needs the Boost/Credits backend"
                className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 cursor-not-allowed"
              >
                <span className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                  </svg>
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-gray-400">Boost</span>
                  <span className="block text-xs text-gray-400">Coming soon</span>
                </span>
              </span>

              <span
                title="Coming soon — need the real status values from Azubike first"
                className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 cursor-not-allowed"
              >
                <span className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-gray-400">Pause</span>
                  <span className="block text-xs text-gray-400">Coming soon</span>
                </span>
              </span>

              <span
                title="Coming soon — need the real status values from Azubike first"
                className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 cursor-not-allowed"
              >
                <span className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-gray-400">Mark as Sold</span>
                  <span className="block text-xs text-gray-400">Coming soon</span>
                </span>
              </span>

              <span
                title="Coming soon — not built yet"
                className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 cursor-not-allowed"
              >
                <span className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-gray-400">Duplicate</span>
                  <span className="block text-xs text-gray-400">Coming soon</span>
                </span>
              </span>

              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 border border-red-200 rounded-md px-3 py-2 hover:bg-red-50"
              >
                <span className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-red-600">Delete</span>
                  <span className="block text-xs text-red-400">Remove listing</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}