import type { ReactNode } from "react";
import buildingImage from "../../assets/browse-building.webp";

// Explore page: "Browse by Property Type" chips and the "Looking for something specific?" banner.
// Only the look lives here; ListingPage still decides what the chips and the button do.

type Group = { type: string; count: number };

function titleCase(text: string): string {
  return text
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function Icon({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const BUILDING = (
  <>
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10.5 21v-3h3v3" />
  </>
);
const HOUSE = <path d="M3 10.5 12 3l9 7.5M5 9v11h14V9M10 20v-5h4v5" />;
const PLOT = (
  <>
    <path d="M12 17s-5-4.4-5-8.5a5 5 0 0 1 10 0C17 12.6 12 17 12 17z" />
    <circle cx="12" cy="8.5" r="1.8" />
    <path d="M4 21h16M6 18.5l-2 2.5M18 18.5l2 2.5" />
  </>
);
const CART = (
  <>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.3a1 1 0 0 0 1-.8L21 7H6" />
  </>
);

function iconFor(type: string): ReactNode {
  const t = type.toLowerCase();
  if (t.includes("land") || t.includes("plot")) return PLOT;
  if (t.includes("shop") || t.includes("retail") || t.includes("store")) return CART;
  if (
    t.includes("duplex") || t.includes("apartment") || t.includes("flat") ||
    t.includes("commercial") || t.includes("office") || t.includes("block")
  ) {
    return BUILDING;
  }
  return HOUSE; // terrace, bungalow, detached and anything else
}

// Magnifying glass with a green house inside, plus a faint skyline and dots behind it.
function SearchIllustration() {
  return (
    <svg viewBox="0 0 160 130" className="h-24 w-auto sm:h-28" aria-hidden="true">
      <g fill="#86efac" opacity="0.7">
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => <circle key={`${r}-${c}`} cx={8 + c * 9} cy={14 + r * 9} r="1.8" />),
        )}
      </g>
      <g fill="#bbf7d0" opacity="0.55">
        <rect x="18" y="46" width="14" height="60" rx="1" />
        <rect x="36" y="30" width="12" height="76" rx="1" />
        <rect x="112" y="40" width="14" height="66" rx="1" />
        <rect x="130" y="56" width="12" height="50" rx="1" />
      </g>
      <path d="M93 92l26 26" stroke="#14532d" strokeWidth="11" strokeLinecap="round" />
      <path d="M95 94l22 22" stroke="#166534" strokeWidth="6" strokeLinecap="round" />
      <circle cx="70" cy="62" r="38" fill="#ffffff" stroke="#15803d" strokeWidth="7" />
      <circle cx="70" cy="62" r="33" fill="#f0fdf4" />
      <path d="M48 64 70 44l22 20" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M53 60v21h34V60L70 45z" fill="#16a34a" />
      <g fill="#ffffff">
        <rect x="64" y="62" width="5" height="5" rx="0.5" />
        <rect x="71" y="62" width="5" height="5" rx="0.5" />
        <rect x="64" y="69" width="5" height="5" rx="0.5" />
        <rect x="71" y="69" width="5" height="5" rx="0.5" />
      </g>
    </svg>
  );
}

export default function BrowseByTypeSection({
  groups,
  selected,
  onSelect,
  onSearchFilter,
}: {
  groups: Group[];
  selected: string;
  onSelect: (type: string) => void;
  onSearchFilter: () => void;
}) {
  return (
    <section className="relative mb-10">
      {/* Building on the right, fading softly into the page (computers and tablets only) */}
      <div aria-hidden="true" className="pointer-events-none absolute right-0 -top-8 hidden md:block w-[46%] max-w-[560px]">
        <div className="absolute inset-x-10 bottom-0 top-10 rounded-full bg-green-100/70 blur-3xl" />
        <img
          src={buildingImage}
          alt=""
          className="relative w-full select-none"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, #000 30%, #000 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 30%, #000 100%)",
          }}
        />
      </div>

      {groups.length > 0 && (
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <svg width="36" height="30" viewBox="0 0 36 30" aria-hidden="true">
              <path d="M2 16 18 3l16 13" fill="none" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <g fill="#16a34a">
                <rect x="14" y="15" width="3.5" height="3.5" rx="0.5" />
                <rect x="18.5" y="15" width="3.5" height="3.5" rx="0.5" />
                <rect x="14" y="19.5" width="3.5" height="3.5" rx="0.5" />
                <rect x="18.5" y="19.5" width="3.5" height="3.5" rx="0.5" />
              </g>
            </svg>
            <span className="h-7 w-px bg-gray-300" aria-hidden="true" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Browse by Property Type</h2>
          </div>

          <div className="mt-5 -mx-1 flex gap-3 overflow-x-auto px-1 pb-3 sm:flex-wrap sm:overflow-visible">
            {groups.map((group) => {
              const active = selected === group.type;
              return (
                <button
                  key={group.type}
                  type="button"
                  onClick={() => onSelect(group.type)}
                  aria-pressed={active}
                  className={
                    active
                      ? "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border-2 border-green-600 bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700 shadow-[0_4px_14px_rgba(22,163,74,0.18)]"
                      : "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border-2 border-transparent bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-[0_4px_14px_rgba(16,24,40,0.08)] transition hover:border-green-300"
                  }
                >
                  <span className={active ? "text-green-700" : "text-gray-800"}>
                    <Icon>{iconFor(group.type)}</Icon>
                  </span>
                  {titleCase(group.type)}
                  <span className={active ? "text-green-700" : "text-gray-500"}>{group.count.toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* "Looking for something specific?" banner */}
      <div className="relative z-10 mt-6 md:mt-14 overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-r from-green-50 via-white to-green-50 shadow-[0_12px_32px_-14px_rgba(22,163,74,0.35)]">
        <svg aria-hidden="true" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-16 w-full">
          <path d="M0 70 C 200 20, 380 120, 600 80 S 1000 30, 1200 70 V120 H0z" fill="#dcfce7" />
          <path d="M0 95 C 250 60, 450 120, 700 100 S 1050 70, 1200 95 V120 H0z" fill="#bbf7d0" opacity="0.7" />
        </svg>

        <div className="relative flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:gap-8 sm:px-10 sm:py-8 sm:text-left">
          <div className="shrink-0">
            <SearchIllustration />
          </div>
          <span className="hidden h-20 w-px bg-green-200 sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">Looking for something specific?</h3>
            <p className="mt-1.5 text-sm text-gray-600 sm:text-base">
              Use our <strong className="font-semibold text-gray-900">advanced filters</strong> to find properties that match your needs.
            </p>
          </div>
          <button
            type="button"
            onClick={onSearchFilter}
            className="shrink-0 whitespace-nowrap rounded-xl bg-green-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-600/30 transition hover:bg-green-700 sm:ml-auto"
          >
            Search &amp; Filter →
          </button>
        </div>
      </div>
    </section>
  );
}