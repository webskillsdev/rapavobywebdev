import "./PropertyCard.css";
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
}: PropertyCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/property/${id}`);
  };

  return (
    <div
      className="property-card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="property-card__image-wrapper">
        <img
          src={primary_media ?? "/placeholder-property.jpg"}
          alt={title}
          className="property-card__image"
        />
        {listing_type && (
          <span className="property-card__badge">
            {listing_type.toUpperCase()}
          </span>
        )}
      </div>

      <div className="property-card__body">
        <h3 className="property-card__title">{title}</h3>
        <p className="property-card__location">{location}</p>
        <p className="property-card__price">{formatPrice(price)}</p>

        <div className="property-card__specs">
          {bedrooms != null && <span>{bedrooms} Beds</span>}
          {bathrooms != null && <span>{bathrooms} Baths</span>}
          {sqm != null && <span>{sqm} SQM</span>}
        </div>
      </div>
    </div>
  );
}