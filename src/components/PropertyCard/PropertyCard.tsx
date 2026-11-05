import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import SafeImage from "../SafeImage";
import { propertyFacts, pricePeriod } from "../../utils/propertyFacts";
import { useSaveProperty } from "../../hooks/useSaveProperty";
import SharePropertySheet from "../share-sheet/SharePropertySheet";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  primary_media: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqm?: number | null;
  listing_type?: string | null;
  linkTo?: string;
  // The full listing, when available: used by Save and Share (saved state, share links, card image).
  property?: any;
}

function formatPrice(price: number): string {
  return `₦${Number(price ?? 0).toLocaleString()}`;
}

export default function PropertyCard({
  id,
  title,
  price,
  location,
  primary_media,
  bedrooms,
  bathrooms,
  sqm,
  listing_type,
  linkTo,
  property,
}: PropertyCardProps) {
  const navigate = useNavigate();
  const { save, savePrompt } = useSaveProperty();
  const [sharing, setSharing] = useState(false);

  // What Save and Share work with: the full listing if we have it, otherwise the card's details.
  const target = property ?? { id, title, price, location, primary_media, listing_type };
  const saved = !!target.saved;
  const period = pricePeriod(target);

  const handleCardClick = () => {
    navigate(linkTo ?? `/property/${id}`);
  };

  function handleSave(e: MouseEvent) {
    e.stopPropagation();
    save(target);
  }

  function handleShare(e: MouseEvent) {
    e.stopPropagation();
    setSharing(true);
  }

  return (
    <>
      {savePrompt}
      {sharing && <SharePropertySheet property={target} onClose={() => setSharing(false)} />}

      <div
        className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <SafeImage
            src={primary_media}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {listing_type && (
            <span className="absolute top-3 left-3 rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white">
              {listing_type.toUpperCase()}
            </span>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share property"
              title="Share"
              className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M16 6l-4-4-4 4" />
                <path d="M12 2v13" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleSave}
              aria-label={saved ? "Remove from saved" : "Save property"}
              aria-pressed={saved}
              title={saved ? "Saved" : "Save"}
              className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-green-600 hover:bg-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{location}</p>
          <p className="text-base font-bold text-green-600 mt-1.5">
            {formatPrice(price)}
            {period && <span className="text-xs text-gray-400 font-normal"> {period}</span>}
          </p>

          {propertyFacts({ bedrooms, bathrooms, sqm }) && (
            <p className="mt-2 text-xs text-gray-600 border-t border-gray-100 pt-2">
              {propertyFacts({ bedrooms, bathrooms, sqm })}
            </p>
          )}
        </div>
      </div>
    </>
  );
}