import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetPropertiesQuery } from "../api/propertyApi";
import { useSaveProperty } from "../hooks/useSaveProperty";
import { buildShareSlug } from "../utils/slug";
import { propertyFacts, pricePeriod } from "../utils/propertyFacts";
import SafeImage from "../components/SafeImage";
import type { RootState } from "../store";
import DashboardShell from "../components/Layout/DashboardShell";
import PageHeader from "../components/Layout/PageHeader";
import { ExploreSkeletonGrid, ExploreErrorState, ExploreEmptyState } from "../components/Explore/ExploreStates";
import Sidebar from "../components/Layout/Sidebar";
import AgentSidebar from "../components/Layout/AgentSidebar";
import promoImage from "../assets/list-property-promo.jpg";

const TABS = [
  { label: "Buy", filterKey: "listingType" as const, value: "sale" },
  { label: "Rent", filterKey: "listingType" as const, value: "rent" },
  { label: "Land", filterKey: "propertyType" as const, value: "land" },
  { label: "Commercial", filterKey: "propertyType" as const, value: "commercial" },
  { label: "Shortlet", filterKey: "listingType" as const, value: "shortlet" },
];

const TAB_ICONS: Record<string, ReactNode> = {
  Buy: <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10z" />,
  Rent: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 8h8M8 12h5M8 16h3" /></>,
  Land: <path d="M2 20h20M4 20V10l4-3 4 3v10M12 20v-6l4-3 4 3v6" />,
  Commercial: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 21v-4h6v4M9 8h.01M15 8h.01M9 12h.01M15 12h.01" /></>,
  Shortlet: <><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" /></>,
};

const AMENITIES_LIST = [
  "Swimming Pool", "Fitted Kitchen", "Parking Space", "24/7 Security",
  "Generator", "Water Supply", "Boys' Quarter", "Balcony",
  "Gym", "Study Room", "CCTV", "Garden",
];

const BED_BATH_OPTIONS = ["Any", "1", "2", "3", "4", "5+"];

function ExploreCard({ property }: { property: any }) {
  const { save, savePrompt } = useSaveProperty();

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    save(property);
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition">
      {savePrompt}
      <div className="relative aspect-[16/10] bg-gray-100">
        <SafeImage src={property.primary_media} alt={property.title} className="h-full w-full object-cover" />
        {property.listing_type && (
          <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {property.listing_type === "sale" ? "FOR SALE" : property.listing_type.toUpperCase()}
          </span>
        )}
        <button
          type="button"
          onClick={handleHeartClick}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={property.saved ? "#16a34a" : "none"} stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
      </div>
       <div className="p-3">
        <div className="flex items-center gap-2">
          <p className="text-green-600 font-bold">
            ₦{Number(property.price ?? 0).toLocaleString()}
        {pricePeriod(property) && <span className="text-xs text-gray-400 font-normal"> {pricePeriod(property)}</span>}
          </p>
          {property.agent_verified && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Verified Agent
            </span>
          )}
        </div>
        <p className="font-semibold text-gray-900 text-sm mt-1 truncate">{property.title}</p>
        <p className="text-xs text-gray-500">{property.location}</p>
        {property.property_type !== "land" && propertyFacts(property) && (
          <p className="text-xs text-gray-600 mt-2">{propertyFacts(property)}</p>
        )}
        {property.user_name && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <span className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-semibold">
              {property.user_name.charAt(0).toUpperCase()}
            </span>
            <span className="text-xs text-gray-600">{property.user_name}</span>
          </div>
        )}
        <Link
          to={`/property/${buildShareSlug(property.title, property.id)}`}
          className="mt-2 block text-center text-sm font-medium text-green-700 border border-green-200 rounded-md py-1.5 hover:bg-green-50"
        >
          View Property →
        </Link>
      </div>
    </div>
  );
}

interface ExploreLoggedInProps {
  search: string;
  setSearch: (v: string) => void;
  activeTab: (typeof TABS)[number];
  setActiveTab: (t: (typeof TABS)[number]) => void;
  setPage: (p: number) => void;
  locationGroups: { name: string; count: number; cover: string | null; ids: string[] }[];
}

export default function ExploreLoggedIn({
  search,
  setSearch,
  activeTab,
  setActiveTab,
  setPage,
  locationGroups,
}: ExploreLoggedInProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [localPage, setLocalPage] = useState(1);
  const [sort, setSort] = useState("recent");

  // If the search text is changed from outside (e.g. the top-bar search),
  // jump back to page 1 so the new results don't open on an empty page.
  // What the user is typing; the search only runs on Enter or the Search button.
  const [query, setQuery] = useState(search);

  useEffect(() => {
    setLocalPage(1);
    setQuery(search);
  }, [search]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setLocationPick(null);
    setSearch(query.trim());
    setLocalPage(1);
    setPage(1);
    setScrollPending(true);
  }
  const [view, setView] = useState<"list" | "map">("list");

   const [showAllSuggested, setShowAllSuggested] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [minSqm, setMinSqm] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [specificType, setSpecificType] = useState("");
  // A Suggested Locations card that was clicked: its name and the exact listings it counted.
  const [locationPick, setLocationPick] = useState<{ name: string; ids: string[] } | null>(null);

  function toggleAmenity(item: string) {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
    setLocalPage(1);
  }

  const { data, isLoading, isFetching, error, refetch } = useGetPropertiesQuery({
    page: localPage,
    limit: 12,
    search,
    listingType: activeTab.filterKey === "listingType" ? activeTab.value : undefined,
    propertyType: activeTab.filterKey === "propertyType" ? activeTab.value : specificType || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    bedrooms: bedrooms && bedrooms !== "Any" ? bedrooms.replace("+", "") : undefined,
    bathrooms: bathrooms && bathrooms !== "Any" ? bathrooms.replace("+", "") : undefined,
    minSqm: minSqm || undefined,
    amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    ids: locationPick?.ids,
    sort,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  // After a search, scroll to the results once they have finished loading.
  const [scrollPending, setScrollPending] = useState(false);

  useEffect(() => {
    if (!scrollPending || isFetching) return;
    document.getElementById("results-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setScrollPending(false);
  }, [scrollPending, isFetching]);

  function clearAllFilters() {
    setLocationPick(null);
    setQuery("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setMinSqm("");
    setSelectedAmenities([]);
    setSpecificType("");
    setLocalPage(1);
    setPage(1);
  }

  function handlePageChange(p: number) {
    setLocalPage(p);
    setPage(p);
  }

  return (
    <DashboardShell sidebar={user?.currentMode === "agent" ? <AgentSidebar /> : <Sidebar />}>
      <div>
        <PageHeader
          size="large"
          breadcrumb="Explore > Search"
          title="Search Properties"
          subtitle="Find your ideal property with powerful filters."
          tagline={["Better Properties", "Brighter Futures"]}
        />

        <div className="px-6 py-6">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setLocalPage(1);
                  setPage(1);
                }}
                className={
                  activeTab.value === tab.value
                    ? "px-4 py-2 rounded-md text-sm font-semibold bg-green-600 text-white whitespace-nowrap"
                    : "px-4 py-2 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} role="search" className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Enter location (e.g. Lekki, Ajah, Ikoyi)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-green-600 text-white font-semibold px-6 py-2.5 text-sm hover:bg-green-700 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </button>
          </form>

          <div className="flex items-center gap-2 mb-6">
            <span
              title="Coming soon — search history isn't saved anywhere yet"
              className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full cursor-not-allowed"
            >
              Recent Searches (Soon)
            </span>
          </div>

                {/* While a search is active, show what was searched instead of location suggestions. */}
                {(search || locationPick) && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600">
                {locationPick ? "Showing listings in " : "Showing results for "}
                <span className="font-semibold text-gray-900">
                  {locationPick ? locationPick.name : `"${search}"`}
                </span>
              </span>
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear search
              </button>
            </div>
                )}

                {locationGroups.length > 0 && !search && !locationPick && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-bold text-gray-900">Suggested Locations</p>
                {locationGroups.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSuggested((v) => !v)}
                    className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1"
                  >
                    {showAllSuggested ? "Show less" : "View all"} →
                  </button>
                )}
              </div>
              <div className={showAllSuggested ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" : "flex gap-3 overflow-x-auto pb-1"}>
                {(showAllSuggested ? locationGroups : locationGroups.slice(0, 6)).map((loc) => {
const image = loc.cover;
                  return (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => {
                        setLocationPick({ name: loc.name, ids: loc.ids });
                        setSearch("");
                        setLocalPage(1);
                        setPage(1);
                      }}
                      className={
                        showAllSuggested
                          ? "rounded-lg overflow-hidden border border-gray-200 text-left hover:shadow-sm transition"
                          : "flex-shrink-0 w-40 rounded-lg overflow-hidden border border-gray-200 text-left hover:shadow-sm transition"
                      }
                    >
                      <div className="aspect-video bg-gray-100">
                        <SafeImage src={image} alt={loc.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
                        <p className="text-xs text-gray-500">{loc.count.toLocaleString()} properties</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-6">
            {/* Main column */}
            <div className="flex-1 min-w-0">
              <div id="results-top" className="scroll-mt-4" />
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={
                      view === "list"
                        ? "px-3 py-1.5 rounded-md text-xs font-semibold bg-green-600 text-white"
                        : "px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  >
                    List View
                  </button>
                  <span
                    title="Coming soon — no map coordinates exist for listings yet"
                    className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-300 cursor-not-allowed"
                  >
                    Map View
                  </span>
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="recent">Sort by: Most Recent</option>
                  <option value="price_asc">Sort by: Price (Low to High)</option>
                  <option value="price_desc">Sort by: Price (High to Low)</option>
                </select>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                {isLoading ? "Loading..." : `${total.toLocaleString()} ${total === 1 ? "property" : "properties"} found`}
              </p>

              {isLoading && <ExploreSkeletonGrid count={6} columns="grid-cols-1 sm:grid-cols-2" />}
              {error ? (
                <ExploreErrorState
                  onRetry={() => refetch()}
                  onSearchAgain={clearAllFilters}
                  homeTo={user?.currentMode === "agent" ? "/agent-dashboard" : "/dashboard"}
                />
              ) : null}
              {!isLoading && !error && items.length === 0 && (
                <ExploreEmptyState
                  onClearFilters={clearAllFilters}
                  onOtherLocations={() => {
                    setSearch("");
                    setLocalPage(1);
                    setPage(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )}

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((property: any) => (
                  <ExploreCard key={property.id} property={property} />
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  disabled={localPage === 1}
                  onClick={() => handlePageChange(localPage - 1)}
                  className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={localPage * 12 >= total}
                  onClick={() => handlePageChange(localPage + 1)}
                  className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Filters column */}
            <div className="w-72 flex-shrink-0 hidden lg:block space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4 space-y-5">
                <p className="font-semibold text-gray-900">Filters</p>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Transaction Type</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TABS.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab);
                          setLocalPage(1);
                          setPage(1);
                        }}
                        className={
                          activeTab.value === tab.value
                            ? "flex flex-col items-center gap-1 rounded-md bg-green-50 border border-green-200 text-green-700 py-2 text-[10px] font-medium"
                            : "flex flex-col items-center gap-1 rounded-md bg-gray-50 border border-gray-200 text-gray-600 py-2 text-[10px] font-medium hover:bg-gray-100"
                        }
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {TAB_ICONS[tab.label]}
                        </svg>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Property Type</p>
                  <select
                    value={specificType}
                    onChange={(e) => {
                      setSpecificType(e.target.value);
                      setLocalPage(1);
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Any</option>
                    <option value="duplex">Duplex</option>
                    <option value="bungalow">Bungalow</option>
                    <option value="terrace">Terrace</option>
                    <option value="apartment">Apartment</option>
                    <option value="office">Office</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="shop">Shop</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Price Range (₦)</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); setLocalPage(1); }}
                      className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); setLocalPage(1); }}
                      className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Bedrooms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BED_BATH_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setBedrooms(opt); setLocalPage(1); }}
                        className={
                          (bedrooms === opt || (!bedrooms && opt === "Any"))
                            ? "px-3 py-1 rounded-md text-xs font-semibold bg-green-600 text-white"
                            : "px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Bathrooms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BED_BATH_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setBathrooms(opt); setLocalPage(1); }}
                        className={
                          (bathrooms === opt || (!bathrooms && opt === "Any"))
                            ? "px-3 py-1 rounded-md text-xs font-semibold bg-green-600 text-white"
                            : "px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Minimum Size (SQM)</p>
                  <input
                    type="number"
                    placeholder="Any"
                    value={minSqm}
                    min={0}
                    onChange={(e) => { setMinSqm(e.target.value); setLocalPage(1); }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Amenities</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {AMENITIES_LIST.map((item) => (
                      <label key={item} className="flex items-center gap-1.5 text-xs text-gray-700">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(item)}
                          onChange={() => toggleAmenity(item)}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-500">Listing Status</p>
                    <span className="text-[9px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 opacity-40 pointer-events-none">
                    {["Verified Listings", "New Listings", "With Video", "Price Reduced", "With Virtual Tour", "Direct from Owner"].map((item) => (
                      <label key={item} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <input type="checkbox" disabled />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLocalPage(1);
                    setPage(1);
                  }}
                  className="w-full rounded-md bg-green-600 text-white font-semibold py-2.5 text-sm hover:bg-green-700"
                >
                  Show {total.toLocaleString()} Properties
                </button>
              </div>

              <Link to="/post-property" className="block rounded-xl overflow-hidden shadow-sm hover:opacity-90 transition-opacity">
                <img src={promoImage} alt="List Your Property on Rapavo" className="w-full" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}