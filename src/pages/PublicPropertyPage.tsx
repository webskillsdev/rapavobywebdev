import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetPublicPropertyQuery } from "../api/propertyApi";
import { extractIdFromSlug } from "../utils/slug";

export default function PublicPropertyPage() {
  const { slug } = useParams();
  const id = extractIdFromSlug(slug ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useGetPublicPropertyQuery(id as string);

  if (isLoading) return <p className="max-w-3xl mx-auto px-6 py-10 text-gray-500">Loading property...</p>;
  if (error) return <p className="max-w-3xl mx-auto px-6 py-10 text-red-600">Something went wrong loading this property.</p>;

  const property = data?.data;

  if (!property) return <p className="max-w-3xl mx-auto px-6 py-10 text-gray-500">Property not found.</p>;

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
    const toDownload = selected.size > 0 ? images.filter((m: any) => selected.has(m.media_url)) : images;
    toDownload.forEach((media: any) => {
      const link = document.createElement("a");
      link.href = media.media_url;
      link.download = "";
      link.target = "_blank";
      link.click();
    });
  }

  async function handleSaveToPhone() {
    if (!property) return;

    const toShare = selected.size > 0 ? images.filter((m: any) => selected.has(m.media_url)) : images;

    try {
      const files = await Promise.all(
        toShare.map(async (media: any, index: number) => {
          const response = await fetch(media.media_url);
          const blob = await response.blob();
          const extension = blob.type.split("/")[1] || "jpg";
          return new File([blob], `rapavo-property-${index + 1}.${extension}`, {
            type: blob.type,
          });
        })
      );

      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          title: property.title,
          text: `Photos of ${property.title}`,
          files,
        });
      } else {
        handleDownloadAll();
      }
    } catch (err) {
      console.error("Save to phone failed:", err);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Property Images</h1>
        <p className="text-gray-500 mt-1">
          {property.title} • {property.location}
        </p>
        <p className="text-sm text-gray-400 mt-1 mb-4">{images.length} images</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((media: any) => (
            <div
              key={media.media_url}
              onClick={() => toggleSelected(media.media_url)}
              className={
                selected.has(media.media_url)
                  ? "relative rounded-lg overflow-hidden cursor-pointer ring-3 ring-green-600"
                  : "relative rounded-lg overflow-hidden cursor-pointer ring-1 ring-gray-200 hover:ring-gray-300"
              }
            >
              {media.media_type === "video" ? (
                             <video src={media.media_url} className="h-36 w-full object-contain bg-black" muted playsInline preload="metadata" />
              ) : (
                <img src={media.media_url} alt={property.title} className="h-36 w-full object-cover" />
              )}
              {selected.has(media.media_url) && (
                <span className="absolute top-2 left-2 h-6 w-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                  ✓
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
          <span>{selected.size} selected</span>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-green-600 font-medium hover:underline"
            >
              Clear selection
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
            type="button"
            onClick={handleDownloadAll}
            className="flex-1 rounded-lg border border-gray-200 bg-green-50 text-green-700 font-semibold py-3 hover:bg-green-100"
          >
            {selected.size > 0 ? `Download Selected (${selected.size})` : `Download All (${images.length})`}
          </button>
          <button
            type="button"
            onClick={handleShareLink}
            className="flex-1 rounded-lg border border-gray-200 bg-green-50 text-green-700 font-semibold py-3 hover:bg-green-100"
          >
            Share Gallery Link
          </button>
          <button
            type="button"
            onClick={handleSaveToPhone}
            className="flex-1 rounded-lg border border-gray-200 bg-green-600 text-white font-semibold py-3 hover:bg-green-700"
          >
            Share & Save to Phone
          </button>
        </div>
      </div>
    </div>
  );
}