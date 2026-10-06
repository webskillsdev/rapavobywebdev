import { Link } from "react-router-dom";

export function ExploreSkeletonGrid({
  count = 8,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className="mt-6" aria-busy="true" aria-live="polite">
      <p className="text-sm font-semibold text-gray-900">Loading properties...</p>
      <p className="text-xs text-gray-500 mb-4">
        Finding the best properties for you. Please wait a moment.
      </p>
      <div className={`grid ${columns} gap-4`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExploreErrorState({
  onRetry,
  onSearchAgain,
  homeTo = "/",
}: {
  onRetry: () => void;
  onSearchAgain: () => void;
  homeTo?: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
      <span className="mx-auto h-14 w-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
      </span>
      <p className="mt-4 text-lg font-bold text-gray-900">We couldn't load these properties</p>
      <p className="mt-1 text-sm text-gray-500">
        Something went wrong while loading listings. Please try again or check your connection.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-green-600 text-white font-semibold px-5 py-2.5 text-sm hover:bg-green-700"
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={onSearchAgain}
          className="rounded-md border border-gray-300 text-gray-700 font-medium px-5 py-2.5 text-sm hover:bg-gray-50"
        >
          Search Again
        </button>
        <Link to={homeTo} className="text-sm font-medium text-green-700 hover:underline">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

export function ExploreEmptyState({
  onClearFilters,
  onOtherLocations,
}: {
  onClearFilters: () => void;
  onOtherLocations: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
      <span className="mx-auto h-14 w-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </span>
      <p className="mt-4 text-lg font-bold text-gray-900">No properties found yet</p>
      <p className="mt-1 text-sm text-gray-500">
        We couldn't find any properties matching your current search. Try adjusting your
        filters or exploring other locations.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded-md bg-green-600 text-white font-semibold px-5 py-2.5 text-sm hover:bg-green-700"
        >
          Clear Filters
        </button>
        <button
          type="button"
          onClick={onOtherLocations}
          className="rounded-md border border-gray-300 text-gray-700 font-medium px-5 py-2.5 text-sm hover:bg-gray-50"
        >
          Explore Other Locations
        </button>
      </div>
      <p className="mt-6 text-xs text-gray-500">
        Looking to list a property?{" "}
        <Link to="/post-property" className="text-green-700 font-medium hover:underline">
          Post a Property
        </Link>
      </p>
    </div>
  );
}