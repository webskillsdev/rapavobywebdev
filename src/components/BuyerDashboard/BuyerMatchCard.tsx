import { Link } from "react-router-dom";
import { buildShareSlug } from "../../utils/slug";

export default function BuyerMatchCard({ property }: { property: any }) {
  const matchPercent = Math.min(100, Math.round(property.score ?? 0));

  return (
    <Link
      to={`/property/${buildShareSlug(property.title, property.id)}`}
      className="block rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition bg-white"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {property.primary_media && (
          <img src={property.primary_media} className="h-full w-full object-cover" />
        )}
        {matchPercent > 0 && (
          <span className="absolute top-3 right-3 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            {matchPercent}% Match
          </span>
        )}
        {property.listing_type && (
          <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded">
            {property.listing_type === "sale" ? "FOR SALE" : property.listing_type.toUpperCase()}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm truncate">{property.title}</p>
        <p className="text-xs text-gray-500 truncate">{property.location}</p>
        <p className="text-green-600 font-bold text-sm mt-1">
          ₦{Number(property.price ?? 0).toLocaleString()}
        </p>
        {property.property_type !== "land" && (
          <p className="text-xs text-gray-600 mt-1">
            {property.bedrooms ?? 0} Beds · {property.bathrooms ?? 0} Baths · {property.sqm ?? 0} SQM
          </p>
        )}
      </div>
    </Link>
  );
}