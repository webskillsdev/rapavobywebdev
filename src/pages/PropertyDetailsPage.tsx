import { useParams } from "react-router-dom";
import "./PropertyDetailsPage.css";
import { useGetSinglePropertyQuery } from "../api/propertyApi";

export default function PropertyDetailsPage() {
  const { id } = useParams();

  const { data, isLoading, error } = useGetSinglePropertyQuery(id as string);

  if (isLoading) return <p>Loading property...</p>;
  if (error) return <p>Something went wrong loading this property.</p>;

  const property = data?.data;

  if (!property) return <p>Property not found.</p>;

  return (
  <div>
    <h1>{property.title}</h1>
    <p>{property.location}</p>
    <p className="details-price">₦{property.price.toLocaleString()}</p>
    <p className="details-description">{property.description}</p>

    <div className="details-media">
      {property.property_media?.map((media: any) => (
        <img
          key={media.id}
          src={media.media_url}
          alt={property.title}
          width={200}
        />
      ))}
    </div>
  </div>
);
}