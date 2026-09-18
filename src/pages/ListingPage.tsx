import { useState } from "react";
import { useGetPropertiesQuery } from "../api/propertyApi";
import PropertyCard from "../components/PropertyCard/PropertyCard";
import "./ListingPage.css";

const TABS = [
  { label: "Buy", filterKey: "listingType" as const, value: "sale" },
  { label: "Rent", filterKey: "listingType" as const, value: "rent" },
  { label: "Land", filterKey: "propertyType" as const, value: "land" },
  { label: "Shortlet", filterKey: "listingType" as const, value: "shortlet" },
];

export default function ListingPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [propertyType, setPropertyType] = useState("");

  const { data, isLoading, error } = useGetPropertiesQuery({
  page,
  limit: 5,
  search,
  listingType: activeTab.filterKey === "listingType" ? activeTab.value : undefined,
  propertyType:
  activeTab.filterKey === "propertyType"
    ? activeTab.value
    : propertyType || undefined,
  minPrice: minPrice || undefined,
  maxPrice: maxPrice || undefined,
});

  return (
    <div>
      <h1>Properties</h1>

      <div className="search-bar">
        <div className="search-bar__tabs">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={
                activeTab.value === tab.value
                  ? "search-bar__tab search-bar__tab--active"
                  : "search-bar__tab"
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

        <div className="search-bar__filters">
          <input
            type="text"
            placeholder="Search by title, location..."
            value={search}
            onChange={(e) => {
  setSearch(e.target.value);
  setPage(1);
}}
          />
          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>
      <select
  value={propertyType}
  disabled={activeTab.filterKey === "propertyType"}
  onChange={(e) => {
    setPropertyType(e.target.value);
    setPage(1);
  }}
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

      {isLoading && <p>Loading properties...</p>}
      {error ? <p>Something went wrong loading properties.</p> : null}

      <div className="results-grid">
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
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
  <button
    type="button"
    disabled={page === 1}
    onClick={() => setPage((p) => p - 1)}
  >
    Previous
  </button>

  <button
    type="button"
    disabled={(data?.data?.length ?? 0) < 5}
    onClick={() => setPage((p) => p + 1)}
  >
    Next
  </button>
</div>
    </div>
    
  );
}