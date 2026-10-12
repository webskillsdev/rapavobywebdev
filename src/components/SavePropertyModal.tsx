import { Link } from "react-router-dom";

export type SaveStep = "confirm" | "saving" | "done";

type Props = {
  property: any;
  step: SaveStep;
  errorMessage: string;
  onConfirm: () => void;
  onClose: () => void;
};

function imageOf(property: any): string | null {
  const media: any[] = Array.isArray(property.property_media) ? property.property_media : [];
  const image =
    media.find((m) => m.is_cover && m.media_type !== "video") ??
    media.find((m) => m.media_type !== "video");
  const url: string | null =
    property.primary_media ?? image?.media_url ?? property.cover_url ?? property.media_urls?.[0] ?? null;
  return url ? url.replace("/upload/", "/upload/w_200,h_150,c_fill,q_auto,f_auto/") : null;
}

function priceText(property: any): string {
  const suffix =
    property.listing_type === "rent" ? " / year" : property.listing_type === "shortlet" ? " / night" : "";
  return `₦${Number(property.price ?? 0).toLocaleString()}${suffix}`;
}

export default function SavePropertyModal({ property, step, errorMessage, onConfirm, onClose }: Props) {
  const image = imageOf(property);
  const saving = step === "saving";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={step === "done" ? "Property saved" : "Save property"}
      onClick={saving ? undefined : onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "done" ? (
          <div className="text-center py-2">
            <span className="mx-auto h-14 w-14 rounded-full bg-green-700 text-white flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Property Saved!</h2>
            <p className="mt-1 text-sm text-gray-500">This property has been added to My Properties.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/saved"
                onClick={onClose}
                className="flex items-center justify-center rounded-lg border border-green-600 px-3 py-3 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                View Saved Properties
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-green-700 px-3 py-3 text-sm font-semibold text-white hover:bg-green-800"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Save Property</h2>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close"
                className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center disabled:opacity-40"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="h-14 w-[74px] flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                {image && <img src={image} alt="" className="h-full w-full object-cover" />}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{property.title}</p>
                {property.location && <p className="text-xs text-gray-500 truncate">{property.location}</p>}
                <p className="text-sm font-bold text-green-700">{priceText(property)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <span className="h-5 w-5 rounded-full border-2 border-green-700 flex items-center justify-center flex-shrink-0">
                <span className="h-2.5 w-2.5 rounded-full bg-green-700" />
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 flex-shrink-0">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">Save to My Properties</p>
                <p className="text-xs text-gray-500">Keep track of this property in your saved list.</p>
              </div>
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-900">
              Add to a collection <span className="font-normal text-gray-500">(Optional)</span>
            </p>
            <div
              title="Coming soon — collections aren't available yet"
              className="mt-2 flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-gray-400 cursor-not-allowed"
            >
              <span className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-sm font-medium">Create new collection</span>
              <span className="ml-auto text-[10px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                Soon
              </span>
            </div>

            {errorMessage && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="mt-5 w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Property"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}