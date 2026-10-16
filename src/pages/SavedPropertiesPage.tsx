import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useGetSavedPropertiesQuery } from "../api/propertyApi";
import { useSaveProperty } from "../hooks/useSaveProperty";
import DashboardShell from "../components/Layout/DashboardShell";
import Sidebar from "../components/Layout/Sidebar";
import AgentSidebar from "../components/Layout/AgentSidebar";
import { ExploreSkeletonGrid } from "../components/Explore/ExploreStates";
import { buildShareSlug } from "../utils/slug";
import { withNext } from "../utils/redirect";
import SharePropertySheet from "../components/share-sheet/SharePropertySheet";

const PAGE_SIZE = 9;
const TIP_KEY = "rapavo_saved_tip_dismissed";

type SortKey = "newest" | "oldest" | "price-low" | "price-high";
type ViewMode = "grid" | "list";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];

// One label per property, used for the badge and for the tabs.
function categoryOf(property: any): "land" | "sale" | "rent" | "shortlet" | "other" {
  if (property.property_type === "land") return "land";
  if (property.listing_type === "sale") return "sale";
  if (property.listing_type === "rent") return "rent";
  if (property.listing_type === "shortlet") return "shortlet";
  return "other";
}

const CATEGORY_LABEL: Record<string, string> = {
  land: "Land",
  sale: "For Sale",
  rent: "For Rent",
  shortlet: "Shortlet",
  other: "Property",
};

const CATEGORY_BADGE: Record<string, string> = {
  land: "bg-amber-800",
  sale: "bg-green-700",
  rent: "bg-blue-900",
  shortlet: "bg-purple-700",
  other: "bg-gray-700",
};

function priceSuffix(property: any): string {
  if (property.listing_type === "rent") return " / year";
  if (property.listing_type === "shortlet") return " / night";
  return "";
}

function savedTime(property: any): number {
  const value = property.saved_at ?? property.created_at;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
}

function SvgIcon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const BED = (
  <>
    <path d="M3 19V7" />
    <path d="M3 15h18v4" />
    <path d="M21 15v-3a3 3 0 0 0-3-3h-7v6" />
    <circle cx="7" cy="12" r="1.5" />
  </>
);
const BATH = (
  <>
    <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z" />
    <path d="M6 12V6a2 2 0 0 1 3.5-1.3" />
    <path d="M7 19l-1 2M17 19l1 2" />
  </>
);
const AREA = (
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </>
);

function SavedCard({
  property,
  layout,
  onUnsave,
}: {
  property: any;
  layout: ViewMode;
  onUnsave: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const category = categoryOf(property);
  const href = `/property/${buildShareSlug(property.title ?? "property", property.id)}`;
  const image: string | null = property.primary_media ?? property.media_urls?.[0] ?? null;
  const isLand = property.property_type === "land";
  const amenities: string[] = Array.isArray(property.amenities) ? property.amenities.slice(0, 3) : [];
  const isList = layout === "list";

  function handleShare() {
    setMenuOpen(false);
    setShareOpen(true);
  }

  return (
    <article
      className={
        isList
          ? "flex flex-col sm:flex-row rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
          : "flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
      }
    >
      <div
        className={
          isList
            ? "relative aspect-[4/3] sm:aspect-auto sm:w-72 sm:min-h-[210px] sm:flex-shrink-0 bg-gray-100 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none overflow-hidden"
            : "relative aspect-[4/3] bg-gray-100 rounded-t-2xl overflow-hidden"
        }
      >
        <Link to={href} className="block h-full w-full" aria-label={property.title}>
          {image ? (
            <img
              src={image}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="h-full w-full flex items-center justify-center text-gray-300">
              <SvgIcon size={36}>
                <path d="M3 21V9l9-6 9 6v12" />
                <path d="M9 21v-6h6v6" />
              </SvgIcon>
            </span>
          )}
        </Link>

        <span
          className={`absolute top-3 left-3 ${CATEGORY_BADGE[category]} text-white text-xs font-semibold px-2.5 py-1 rounded-md`}
        >
          {CATEGORY_LABEL[category]}
        </span>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUnsave(property.id)}
            title="Remove from saved"
            aria-label="Remove from saved"
            className="h-9 w-9 rounded-full bg-white shadow flex items-center justify-center text-red-500 hover:scale-105 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              aria-expanded={menuOpen}
              className="h-9 w-9 rounded-full bg-white shadow flex items-center justify-center text-gray-700 hover:scale-105 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="19" cy="12" r="1.6" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg z-30 py-1">
                  <Link
                    to={href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <SvgIcon>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </SvgIcon>
                    View property
                  </Link>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <SvgIcon>
                      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                      <path d="M16 6l-4-4-4 4" />
                      <path d="M12 2v13" />
                    </SvgIcon>
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onUnsave(property.id);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <SvgIcon>
                      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14" />
                    </SvgIcon>
                    Remove from saved
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 p-4 flex flex-col">
        <Link to={href} className="font-semibold text-gray-900 hover:underline line-clamp-2">
          {property.title}
        </Link>

        {property.location && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
            <SvgIcon size={14}>
              <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </SvgIcon>
            <span className="truncate">{property.location}</span>
          </p>
        )}

        <p className="mt-2 text-xl font-bold text-green-700">
          ₦{Number(property.price ?? 0).toLocaleString()}
          {priceSuffix(property) && (
            <span className="text-sm font-semibold text-green-700">{priceSuffix(property)}</span>
          )}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {!isLand && property.bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <SvgIcon>{BED}</SvgIcon>
              {property.bedrooms}
            </span>
          )}
          {!isLand && property.bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <SvgIcon>{BATH}</SvgIcon>
              {property.bathrooms}
            </span>
          )}
          {property.sqm != null && (
            <span className="flex items-center gap-1.5">
              <SvgIcon>{AREA}</SvgIcon>
              {property.sqm} SQM
            </span>
          )}
        </div>

        {amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((item) => (
              <span
                key={item}
                className="rounded-md bg-gray-50 border border-gray-100 px-2.5 py-1 text-xs text-gray-500"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
      {shareOpen && <SharePropertySheet property={property} onClose={() => setShareOpen(false)} />}
    </article>
  );
}

function SoonChip() {
  return (
    <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
      Soon
    </span>
  );
}

function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // show at most 5 page numbers around the current one
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const numbers: number[] = [];
  for (let n = start; n <= end; n++) numbers.push(n);

  const arrow =
    "h-9 w-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <nav className="flex items-center gap-1.5" aria-label="Pagination">
      <button type="button" className={arrow} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <SvgIcon>
          <path d="M15 18l-6-6 6-6" />
        </SvgIcon>
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={
            n === page
              ? "h-9 min-w-9 px-3 rounded-lg bg-green-700 text-white text-sm font-semibold"
              : "h-9 min-w-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50"
          }
        >
          {n}
        </button>
      ))}
      <button type="button" className={arrow} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <SvgIcon>
          <path d="M9 18l6-6-6-6" />
        </SvgIcon>
      </button>
    </nav>
  );
}

export default function SavedPropertiesPage() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAgent = user?.currentMode === "agent";
  const { save } = useSaveProperty();

  const { data, isLoading, isFetching, error, refetch } = useGetSavedPropertiesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const items: any[] = useMemo(() => data?.data ?? [], [data]);

  const [tab, setTab] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [tipHidden, setTipHidden] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(TIP_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setPage(1);
  }, [tab, sort]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: items.length, sale: 0, rent: 0, land: 0, shortlet: 0 };
    items.forEach((item) => {
      const category = categoryOf(item);
      if (category in result) result[category] += 1;
    });
    return result;
  }, [items]);

  const tabs = [
    { key: "all", label: "All" },
    { key: "sale", label: "For Sale" },
    { key: "rent", label: "For Rent" },
    { key: "land", label: "Land" },
    { key: "shortlet", label: "Shortlet" },
  ].filter((t) => t.key === "all" || counts[t.key] > 0 || t.key === tab);

  const filtered = useMemo(() => {
    const list = tab === "all" ? [...items] : items.filter((item) => categoryOf(item) === tab);
    list.sort((a, b) => {
      if (sort === "newest") return savedTime(b) - savedTime(a);
      if (sort === "oldest") return savedTime(a) - savedTime(b);
      if (sort === "price-low") return Number(a.price ?? 0) - Number(b.price ?? 0);
      return Number(b.price ?? 0) - Number(a.price ?? 0);
    });
    return list;
  }, [items, tab, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function dismissTip() {
    setTipHidden(true);
    try {
      window.localStorage.setItem(TIP_KEY, "1");
    } catch {
      // storage blocked — the tip just comes back next visit
    }
  }

  // Not signed in: no dashboard, just a clear way in (and back to this page afterwards).
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <span className="mx-auto h-14 w-14 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
          <SvgIcon size={26}>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </SvgIcon>
        </span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Your saved properties</h1>
        <p className="mt-1 text-sm text-gray-500">
          Log in or create a free account to see the properties you've saved.
        </p>
        <div className="mt-6 space-y-2.5">
          <Link
            to={withNext("/login", "/saved")}
            className="flex w-full items-center justify-center rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            Log In
          </Link>
          <Link
            to={withNext("/signup", "/saved")}
            className="flex w-full items-center justify-center rounded-lg border border-green-600 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            Create a free account
          </Link>
        </div>
      </div>
    );
  }

  const gridClass =
    view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5" : "space-y-4";

  return (
    <DashboardShell sidebar={isAgent ? <AgentSidebar /> : <Sidebar />}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saved Properties</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500">Properties you've saved for later</p>
          </div>
          <button
            type="button"
            disabled
            title="Coming soon — folders aren't available yet"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-400 cursor-not-allowed"
          >
            <SvgIcon>
              <path d="M12 5v14M5 12h14" />
            </SvgIcon>
            Create Folder
            <SoonChip />
          </button>
        </div>

        {/* Tabs + sort + view */}
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={
                  tab === t.key
                    ? "whitespace-nowrap rounded-lg bg-green-700 text-white px-4 py-2.5 text-sm font-semibold"
                    : "whitespace-nowrap rounded-lg border border-gray-200 bg-white text-gray-700 px-4 py-2.5 text-sm hover:bg-gray-50"
                }
              >
                {t.label} ({counts[t.key] ?? 0})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="saved-sort">
              Sort saved properties
            </label>
            <select
              id="saved-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="flex-1 lg:flex-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                className={
                  view === "grid"
                    ? "h-9 w-9 rounded-md bg-green-700 text-white flex items-center justify-center"
                    : "h-9 w-9 rounded-md text-gray-500 hover:bg-gray-50 flex items-center justify-center"
                }
              >
                <SvgIcon>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </SvgIcon>
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="List view"
                aria-pressed={view === "list"}
                className={
                  view === "list"
                    ? "h-9 w-9 rounded-md bg-green-700 text-white flex items-center justify-center"
                    : "h-9 w-9 rounded-md text-gray-500 hover:bg-gray-50 flex items-center justify-center"
                }
              >
                <SvgIcon>
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </SvgIcon>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6 items-start">
          {/* Side column — desktop only */}
          <aside className="hidden lg:block space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="font-semibold text-gray-900">Folders</p>
              <div className="mt-3 flex items-center gap-3 rounded-lg bg-green-50 px-3 py-2.5 text-sm font-semibold text-green-800">
                <span className="text-green-700">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                </span>
                All Saved
                <span className="ml-auto text-sm">{items.length}</span>
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div
                  title="Coming soon — folders aren't available yet"
                  className="flex items-center gap-2 px-1 text-sm font-medium text-gray-400 cursor-not-allowed"
                >
                  <SvgIcon>
                    <path d="M12 5v14M5 12h14" />
                  </SvgIcon>
                  Create New Folder
                  <span className="ml-auto">
                    <SoonChip />
                  </span>
                </div>
              </div>
            </div>

            {!tipHidden && (
              <div className="rounded-2xl bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-semibold text-green-800">
                    <SvgIcon>
                      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" />
                    </SvgIcon>
                    Tip
                  </p>
                  <button
                    type="button"
                    onClick={dismissTip}
                    aria-label="Dismiss tip"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <SvgIcon>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </SvgIcon>
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Tap the heart on any property to save it. Your saved list stays with your account on any device.
                </p>
              </div>
            )}

            <div className="rounded-2xl bg-green-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span className="h-7 w-7 rounded-full bg-green-700 text-white flex items-center justify-center">
                  <SvgIcon size={14}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </SvgIcon>
                </span>
                Get Notified
                <span className="ml-auto">
                  <SoonChip />
                </span>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Alerts for your saved searches are on the way. You'll hear first when new properties match your interests.
              </p>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-300 cursor-not-allowed"
              >
                <SvgIcon>
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                </SvgIcon>
                Create an Alert
              </button>
            </div>
          </aside>

          {/* Results */}
          <section className="min-w-0">
            {isLoading && (
              <ExploreSkeletonGrid count={6} columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" />
            )}

            {!isLoading && !!error && (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
                <span className="mx-auto h-14 w-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <SvgIcon size={26}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v5M12 16h.01" />
                  </SvgIcon>
                </span>
                <p className="mt-4 text-lg font-bold text-gray-900">We couldn't load your saved properties</p>
                <p className="mt-1 text-sm text-gray-500">Please check your connection and try again.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !error && items.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
                <span className="mx-auto h-14 w-14 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
                  <SvgIcon size={26}>
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </SvgIcon>
                </span>
                <p className="mt-4 text-lg font-bold text-gray-900">No saved properties yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Tap the heart on any property and it will show up here.
                </p>
                <Link
                  to="/"
                  className="mt-5 inline-flex rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                  Explore properties
                </Link>
              </div>
            )}

            {!isLoading && !error && items.length > 0 && filtered.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
                <p className="text-base font-semibold text-gray-900">Nothing saved in this category</p>
                <button
                  type="button"
                  onClick={() => setTab("all")}
                  className="mt-3 text-sm font-semibold text-green-700 hover:underline"
                >
                  Show all saved properties
                </button>
              </div>
            )}

            {!isLoading && !error && pageItems.length > 0 && (
              <>
                <div className={`${gridClass} ${isFetching ? "opacity-70 transition-opacity" : ""}`}>
                  {pageItems.map((property) => (
                    <SavedCard key={property.id} property={property} layout={view} onUnsave={save} />
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Showing {pageItems.length} of {filtered.length} saved{" "}
                    {filtered.length === 1 ? "property" : "properties"}
                  </p>
                  <Pager page={safePage} totalPages={totalPages} onChange={setPage} />
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}