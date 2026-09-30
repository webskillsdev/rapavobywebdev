import { useNavigate } from "react-router-dom";

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
}

function formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`;
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
}: PropertyCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(linkTo ?? `/property/${id}`);
  };

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={primary_media ?? "/placeholder-property.jpg"}
          alt={title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {listing_type && (
          <span className="absolute top-3 left-3 rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white">
            {listing_type.toUpperCase()}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{location}</p>
        <p className="text-lg font-bold text-green-600 mt-2">{formatPrice(price)}</p>

        <div className="mt-3 flex gap-3 text-sm text-gray-600 border-t border-gray-100 pt-3">
          {bedrooms != null && <span>{bedrooms} Beds</span>}
          {bathrooms != null && <span>{bathrooms} Baths</span>}
          {sqm != null && <span>{sqm} SQM</span>}
        </div>
      </div>
    </div>
  );
}