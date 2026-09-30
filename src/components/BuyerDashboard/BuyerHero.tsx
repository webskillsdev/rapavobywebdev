import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store";

// Picks up src/assets/buyer-hero.jpg (or .jpeg/.png) if it exists.
// Falls back to a plain dark-green gradient if the file isn't there yet,
// so a missing image can never break the page.
const heroImages = import.meta.glob("../../assets/buyer-hero.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const heroImage = Object.values(heroImages)[0] ?? null;

const TABS = [
  { label: "Buy", listingType: "sale" },
  { label: "Rent", listingType: "rent" },
  { label: "Land", propertyType: "land" },
  { label: "Shortlet", listingType: "shortlet" },
];

export default function BuyerHero() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [location, setLocation] = useState("");

  const firstName = (user?.fullName ?? "").trim().split(" ")[0] || "there";

  const background = heroImage
    ? `linear-gradient(90deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 55%), url(${heroImage})`
    : "linear-gradient(135deg, #064e3b, #0f172a)";

  function handleSearch() {
    const tab = TABS[activeTab];
    const params = new URLSearchParams();
    if (location.trim()) params.set("q", location.trim());
    if ((tab as any).listingType) params.set("listingType", (tab as any).listingType);
    if ((tab as any).propertyType) params.set("propertyType", (tab as any).propertyType);
    navigate(`/?${params.toString()}`);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden text-white"
      style={{ backgroundImage: background, backgroundSize: "cover", backgroundPosition: "right center" }}
    >
      <div className="px-8 py-10 min-h-[280px] flex flex-col justify-center">
        <h1 className="m-0 text-3xl font-extrabold text-white leading-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-2 text-sm text-white">Let's find your perfect property today.</p>

        <div className="bg-white rounded-xl shadow-lg p-4 mt-6 max-w-xl text-gray-900">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {TABS.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={
                  activeTab === i
                    ? "px-4 py-2 rounded-md text-sm font-semibold bg-green-600 text-white whitespace-nowrap"
                    : "px-4 py-2 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Location (e.g. Lekki, Ajah)"
              className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-md bg-green-600 text-white font-semibold px-5 py-2 text-sm hover:bg-green-700 flex-shrink-0"
            >
              Search Properties
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}