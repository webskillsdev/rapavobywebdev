import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetPublicPropertyQuery } from "../api/propertyApi";
import "./PublicPropertyPage.css";

export default function PublicPropertyPage() {
  const { id } = useParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useGetPublicPropertyQuery(id as string);

  if (isLoading) return <p>Loading property...</p>;
  if (error) return <p>Something went wrong loading this property.</p>;

  const property = data?.data;

  if (!property) return <p>Property not found.</p>;

  const images = property.property_media ?? [];

  function toggleSelected(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }

  async function handleShareLink() {
  if (!property) return;

  const url = window.location.href;

  if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url,
        });
      } catch {
        // user cancelled the share sheet — not an error worth reporting
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  }

  function handleDownloadAll() {
    images.forEach((media: any) => {
      const link = document.createElement("a");
      link.href = media.media_url;
      link.download = "";
      link.target = "_blank";
      link.click();
    });
  }

  return (
    <div className="gallery-modal">
      <h1>Property Images</h1>
      <p className="gallery-modal__subtitle">
        {property.title} • {property.location}
      </p>
      <p className="gallery-modal__count">{images.length} images</p>

      <div className="gallery-modal__grid">
        {images.map((media: any) => (
          <div
            key={media.media_url}
            className={
              selected.has(media.media_url)
                ? "gallery-modal__thumb gallery-modal__thumb--selected"
                : "gallery-modal__thumb"
            }
            onClick={() => toggleSelected(media.media_url)}
          >
            <img src={media.media_url} alt={property.title} />
            {selected.has(media.media_url) && (
              <span className="gallery-modal__check">✓</span>
            )}
          </div>
        ))}
      </div>

      <div className="gallery-modal__selection-bar">
        <span>{selected.size} selected</span>
        {selected.size > 0 && (
          <button type="button" onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        )}
      </div>

      <div className="gallery-modal__actions">
        <button type="button" onClick={handleDownloadAll}>
          Download All ({images.length})
        </button>
        <button type="button" onClick={handleShareLink}>
          Share Gallery Link
        </button>
      </div>
    </div>
  );
}