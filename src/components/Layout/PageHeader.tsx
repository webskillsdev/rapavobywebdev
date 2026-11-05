import type { ReactNode } from "react";

// The one page-header style used across Rapavo.
// - size "large": the big title band (Search Properties, My Feed).
// - size "compact": a smaller title bar for working pages (Saved, My Listings, Profile…).
// containerClassName lines the header up with the page content below it (e.g. "max-w-6xl").
export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  tagline,
  actions,
  size = "compact",
  containerClassName = "",
}: {
  title: string;
  subtitle?: ReactNode;
  breadcrumb?: string;
  tagline?: [string, string];
  actions?: ReactNode;
  size?: "large" | "compact";
  containerClassName?: string;
}) {
  const large = size === "large";

  return (
    <div className="bg-green-50 border-b border-green-100">
      <div
        className={`${containerClassName} ${containerClassName.includes("max-w") ? "mx-auto" : ""} px-4 sm:px-6 ${
          large ? "pt-8 pb-6" : "py-5"
        } flex items-start justify-between flex-wrap gap-4`}
      >
        <div className="min-w-0">
          {breadcrumb && <p className="text-xs text-gray-400 mb-1">{breadcrumb}</p>}
          <h1
            className={
              large
                ? "text-3xl sm:text-4xl font-extrabold text-gray-900 leading-none"
                : "text-2xl font-bold text-gray-900 leading-tight"
            }
          >
            {title}
          </h1>
          {subtitle && <p className="text-sm text-gray-500 mt-2 leading-snug">{subtitle}</p>}
        </div>

        {(tagline || actions) && (
          <div className="flex items-center gap-3">
            {tagline && (
              <p className="text-lg text-green-600 leading-tight" style={{ fontFamily: "'Caveat', cursive" }}>
                {tagline[0]}
                <br />
                {tagline[1]}
              </p>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}