import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import type { RootState as RootStateType } from "../store";
import ExploreLoggedIn from "./ExploreLoggedIn";
import { useGetPropertiesQuery, useToggleSavedPropertyMutation } from "../api/propertyApi";
import PropertyCard from "../components/PropertyCard/PropertyCard";
import exploreHero from "../assets/explore-hero.jpg";
import { buildShareSlug } from "../utils/slug";
import type { RootState } from "../store";

const categoryImages = import.meta.glob("../assets/category-*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const locationImages = import.meta.glob("../assets/location-*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function findAsset(map: Record<string, string>, slug: string): string | null {
  const match = Object.keys(map).find((key) => key.toLowerCase().includes(`-${slug}.`));
  return match ? map[match] : null;
}

function ArrowBadge() {
  return (
    <span className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-green-600 flex items-center justify-center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17L17 7M17 7H8M17 7v9" />
      </svg>
    </span>
  );
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function titleCase(text: string): string {
  return text.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const RECOMMENDED_TABS = [
  { label: "All", filter: {} },
  { label: "For Sale", filter: { listingType: "sale" } },
  { label: "For Rent", filter: { listingType: "rent" } },
  { label: "Land", filter: { propertyType: "land" } },
  { label: "Commercial", filter: { propertyType: "commercial" } },
];

function FeaturedCard({ property }: { property: any }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [toggleSaved] = useToggleSavedPropertyMutation();

  function handleHeartClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleSaved(property.id);
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition">
      <div className="relative aspect-[4/3] bg-gray-100">
        {property.primary_media && (
          <img src={property.primary_media} className="h-full w-full object-cover" />
        )}
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
      <div className="p-4">
        <p className="text-green-600 font-bold">
          ₦{Number(property.price ?? 0).toLocaleString()}
          {property.listing_type === "rent" && <span className="text-xs text-gray-400 font-normal"> /year</span>}
        </p>
        <p className="font-semibold text-gray-900 text-sm mt-1 truncate">{property.title}</p>
        <p className="text-xs text-gray-500">{property.location}</p>
        {property.property_type !== "land" && (
          <p className="text-xs text-gray-600 mt-2">
            {property.bedrooms ?? 0} Beds · {property.bathrooms ?? 0} Baths · {property.sqm ?? 0} SQM
          </p>
        )}
        {(property.user_name || property.agent_phone) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-semibold">
              {(property.user_name ?? "?").charAt(0).toUpperCase()}
            </span>
            <span className="text-xs text-gray-600">{property.user_name ?? "Agent"}</span>
          </div>
        )}
        <Link
          to={`/property/${buildShareSlug(property.title, property.id)}`}
          className="mt-3 block text-center text-sm font-medium text-green-700 border border-green-200 rounded-md py-2 hover:bg-green-50"
        >
          View Property →
        </Link>
      </div>
    </div>
  );
}

function Tile({
  label,
  count,
  image,
  onClick,
}: {
  label: string;
  count: number;
  image: string | null;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="text-left rounded-lg overflow-hidden border border-gray-200 hover:shadow-sm transition">
      <div className="relative aspect-video bg-gray-100">
        {image && <img src={image} className="h-full w-full object-cover" />}
        <ArrowBadge />
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500">{count.toLocaleString()} {count === 1 ? "listing" : "listings"}</p>
      </div>
    </button>
  );
}

const TABS = [
  { label: "Buy", filterKey: "listingType" as const, value: "sale" },
  { label: "Rent", filterKey: "listingType" as const, value: "rent" },
  { label: "Land", filterKey: "propertyType" as const, value: "land" },
  { label: "Commercial", filterKey: "propertyType" as const, value: "commercial" },
  { label: "Shortlet", filterKey: "listingType" as const, value: "shortlet" },
];

export default function ListingPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  // When the top-bar search sends someone here with ?q=..., apply it.
  // Same for ?maxPrice=... from the affordability calculator.
   useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    if (searchParams.get("maxPrice")) {
      setMaxPrice(searchParams.get("maxPrice") ?? "");
    }
    const urlListingType = searchParams.get("listingType");
    const urlPropertyType = searchParams.get("propertyType");
    if (urlListingType) {
      const match = TABS.find((t) => t.filterKey === "listingType" && t.value === urlListingType);
      if (match) setActiveTab(match);
    } else if (urlPropertyType) {
      const match = TABS.find((t) => t.filterKey === "propertyType" && t.value === urlPropertyType);
      if (match) setActiveTab(match);
    }
  }, [searchParams]);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [minPrice, setMinPrice] = useState("");
  const [page, setPage] = useState(1);
  const [propertyType, setPropertyType] = useState("");

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);

  const { data: sampleData } = useGetPropertiesQuery({ page: 1, limit: 200 });
  const sample = sampleData?.data ?? [];

  const categoryGroups = Object.entries(
    sample.reduce((acc: Record<string, number>, p: any) => {
      if (p.property_type) acc[p.property_type] = (acc[p.property_type] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([type, count]) => ({ type, count: count as number }))
    .sort((a, b) => b.count - a.count);

  const locationGroups = Object.entries(
    sample.reduce((acc: Record<string, number>, p: any) => {
      const name = p.lga || p.location?.split(",")[0]?.trim();
      if (name) acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count);

  const { data, isLoading, error } = useGetPropertiesQuery({
    page,
    limit: 16,
    search,
    listingType: activeTab.filterKey === "listingType" ? activeTab.value : undefined,
    propertyType:
      activeTab.filterKey === "propertyType"
        ? activeTab.value
        : propertyType || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
  });

   const { isAuthenticated } = useSelector((state: RootStateType) => state.auth);

  if (isAuthenticated) {
    return (
         <ExploreLoggedIn
        search={search}
        setSearch={setSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setPage={setPage}
          locationGroups={locationGroups}
      />
    );
  }

  return (
    <div>
      {/* Standalone search bar, between header and hero */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search properties, locations, agents, or keywords..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Hero */}
      <div
        className="relative text-white bg-cover bg-center mt-6"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${exploreHero})` }}
      >
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-green-300 text-sm font-semibold tracking-wide uppercase mb-2">Explore</p>
          <h1 className="text-4xl font-bold text-white">
            Find Your
            <br />
            Next Opportunity
          </h1>
          <p className="text-gray-100 mt-2 max-w-lg text-white">
            Houses, apartments, land, commercial and more
            <br />
            — all in one place.
          </p>

          <div className="bg-white rounded-xl shadow-lg p-4 mt-8 max-w-4xl">
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={
                    activeTab.value === tab.value
                      ? "px-4 py-2 rounded-md text-sm font-semibold bg-green-600 text-white whitespace-nowrap"
                      : "px-4 py-2 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                  }
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Enter location (e.g. Lekki, Ajah)"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="flex-1 min-w-[200px] rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={propertyType}
                disabled={activeTab.filterKey === "propertyType"}
                onChange={(e) => {
                  setPropertyType(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 disabled:opacity-50"
              >
                <option value="">Any Type</option>
                <option value="apartment">Apartment</option>
                <option value="duplex">Duplex</option>
                <option value="bungalow">Bungalow</option>
                <option value="terrace">Terrace</option>
                <option value="commercial">Commercial</option>
                <option value="office">Office</option>
                <option value="warehouse">Warehouse</option>
                <option value="shop">Shop</option>
              </select>
              <input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                className="rounded-md bg-green-600 text-white font-semibold px-6 py-2 text-sm hover:bg-green-700"
              >
                Search Properties
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Browse by Property Type</h2>
            <button
              type="button"
              onClick={() => setShowAllCategories((v) => !v)}
              className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1"
            >
              {showAllCategories ? "Show less" : "View all"} →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(showAllCategories ? categoryGroups : categoryGroups.slice(0, 5)).map((group) => (
              <Tile
                key={group.type}
                label={titleCase(group.type)}
                count={group.count}
                             image={findAsset(categoryImages, slugify(group.type))}
                onClick={() => {
                  setPropertyType(group.type);
                  setPage(1);
                  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Popular Locations</h2>
            <button
              type="button"
              onClick={() => setShowAllLocations((v) => !v)}
              className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1"
            >
              {showAllLocations ? "Show less" : "View all"} →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(showAllLocations ? locationGroups : locationGroups.slice(0, 5)).map((group) => (
              <Tile
                key={group.name}
                label={group.name}
                count={group.count}
                              image={findAsset(locationImages, slugify(group.name))}
                onClick={() => {
                  setSearch(group.name);
                  setPage(1);
                  document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            ))}
          </div>
        </section>

        <RecommendedSection />

        <section className="mb-10 bg-green-50 border border-green-100 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">Looking for something specific?</p>
            <p className="text-sm text-gray-600 mt-1">Use our advanced filters to find properties that match your needs.</p>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-md bg-green-600 text-white font-semibold px-5 py-2.5 text-sm hover:bg-green-700 flex-shrink-0"
          >
            Search & Filter →
          </button>
        </section>

            <RecentlyAddedSection />

        {isLoading && <p className="mt-6 text-gray-500">Loading properties...</p>}
        {error ? <p className="mt-6 text-red-600">Something went wrong loading properties.</p> : null}

        <div id="results" className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.data?.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              price={property.price}
              location={property.location}
              primary_media={property.primary_media}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              sqm={property.sqm}
              listing_type={property.listing_type}
            />
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={(data?.data?.length ?? 0) < 16}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function RecommendedSection() {
  const [activeTab, setActiveTab] = useState(0);
  const { data } = useGetPropertiesQuery({ page: 1, limit: 4, ...RECOMMENDED_TABS[activeTab].filter });
  const items = data?.data ?? [];

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
        <div className="flex gap-2">
          {RECOMMENDED_TABS.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(i)}
              className={
                activeTab === i
                  ? "px-3 py-1.5 rounded-md text-xs font-semibold bg-green-600 text-white"
                  : "px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No properties here yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((property: any) => (
            <FeaturedCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
}

function RecentlyAddedSection() {
  const { data } = useGetPropertiesQuery({ page: 1, limit: 4 });
  const items = data?.data ?? [];

  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Recently Added</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((property: any) => (
          <FeaturedCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}