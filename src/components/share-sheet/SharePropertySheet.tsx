import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLazyGetSinglePropertyQuery } from "../../api/propertyApi";
import { buildShareSlug } from "../../utils/slug";
import type { ResidentialShareCardData } from "../share-cards/ResidentialShareCard";
import { buildShareCardData } from "../share-cards/buildShareCardData";
import { downloadBlob } from "../share-cards/shareCard";
import ShareToStatusModal from "../share-cards/ShareToStatusModal";

// The "Share Property" sheet. Every Share button in the app opens this instead of
// copying a link straight away. The person then chooses how to share:
//
//   Share             the phone's share menu, with the property details and link
//   Share to Status   the branded card for WhatsApp Status (opens the card window)
//   Share Public Link the public gallery link (anyone can view and save the photos)
//   Copy Link         copies the public gallery link
//   Save Image        saves the cover photo to the phone / computer
//
// It accepts the property object each page already has (their shapes differ a little,
// so every value is read carefully and a missing one is simply left out).

type Props = {
  property: any;
  onClose: () => void;
};

type Busy = "status" | "image" | null;

const iconProps = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// ----- small helpers -------------------------------------------------------

function coverOf(property: any): string | null {
  if (property?.cover_url) return property.cover_url;
  if (property?.primary_media) return property.primary_media;
  const media: any[] = Array.isArray(property?.property_media) ? property.property_media : [];
  const photos = media.filter((m) => m?.media_url && m.media_type !== "video");
  const cover = photos.find((m) => m.is_cover) ?? photos[0];
  if (cover?.media_url) return cover.media_url;
  if (Array.isArray(property?.media_urls) && property.media_urls[0]) return property.media_urls[0];
  return null;
}

function priceOf(property: any): string {
  const n = Number(property?.price);
  if (!Number.isFinite(n) || n <= 0) return "";
  const suffix = property?.listing_type === "rent" ? " / year" : property?.listing_type === "shortlet" ? " / night" : "";
  return `₦${n.toLocaleString("en-NG")}${suffix}`;
}

// Photos from Cloudinary can arrive as WebP/AVIF, which phone galleries often refuse.
// Anything that is not already JPEG or PNG is converted to JPEG first.
async function toGalleryFriendly(blob: Blob): Promise<Blob> {
  if (blob.type === "image/jpeg" || blob.type === "image/png") return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return blob;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const converted = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  return converted ?? blob;
}

// ----- one row of the sheet --------------------------------------------------

function MainRow({
  icon,
  title,
  text,
  onClick,
  disabled,
  highlighted,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 rounded-2xl border p-3 text-left transition-colors disabled:opacity-60 ${
        highlighted ? "border-green-100 bg-green-50 hover:bg-green-100/60" : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-green-700 text-white">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-gray-900">{title}</span>
        <span className="block text-sm leading-snug text-gray-500">{text}</span>
      </span>
      <Chevron />
    </button>
  );
}

function MoreRow({
  icon,
  title,
  text,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-4 p-3 text-left hover:bg-gray-50 disabled:opacity-60"
    >
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-800">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-gray-900">{title}</span>
        <span className="block text-sm leading-snug text-gray-500">{text}</span>
      </span>
      <Chevron />
    </button>
  );
}

function Chevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-gray-800">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// ----- the sheet -------------------------------------------------------------

export default function SharePropertySheet({ property, onClose }: Props) {
  const [loadProperty] = useLazyGetSinglePropertyQuery();
  const [cardData, setCardData] = useState<ResidentialShareCardData | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState("");

  const id: string = property?.id ?? "";
  const title: string = property?.title ?? "Property";
  const location: string = property?.location ?? "";
  const price = priceOf(property);
  const image = coverOf(property);

  const slug = buildShareSlug(title, id);
  const detailsUrl = `${window.location.origin}/property/${slug}`;
  const publicUrl = `${window.location.origin}/share/${slug}`;

  const close = useCallback(() => {
    if (!busy) onClose();
  }, [busy, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  // Opens the phone's share menu. On a computer with no share menu, the link is copied instead.
  async function shareLink(url: string, text: string) {
    setMessage("");
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return; // person closed the menu
      }
    }
    setMessage((await copy(url)) ? "Link copied." : `Copy this link: ${url}`);
  }

  function handleShare() {
    const details = [location, price].filter(Boolean).join(" · ");
    void shareLink(detailsUrl, [title, details].filter(Boolean).join("\n"));
  }

  function handleShareGallery() {
    void shareLink(publicUrl, `Photos of ${title}`);
  }

  async function handleCopy() {
    setMessage((await copy(publicUrl)) ? "Link copied." : `Copy this link: ${publicUrl}`);
  }

  async function handleStatus() {
    if (busy) return;
    setBusy("status");
    setMessage("");
    try {
      const result: any = await loadProperty(id, true).unwrap();
      const full = result?.data;
      if (!full) throw new Error("Listing not found");
      setCardData(buildShareCardData(full));
    } catch (err) {
      console.error("[share sheet] could not load the listing:", err);
      setMessage("We couldn't load this listing. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleSaveImage() {
    if (busy) return;
    setBusy("image");
    setMessage("");
    try {
      let url = image;
      if (!url) {
        const result: any = await loadProperty(id, true).unwrap();
        url = coverOf(result?.data);
      }
      if (!url) {
        setMessage("This listing has no photo to save.");
        return;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Photo request failed (${response.status})`);
      const blob = await toGalleryFriendly(await response.blob());
      const ext = blob.type === "image/png" ? "png" : "jpg";
      const fileName = `rapavo-${slug.slice(0, 40)}.${ext}`;
      const file = new File([blob], fileName, { type: blob.type });

      if (typeof navigator.canShare === "function" && typeof navigator.share === "function" && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title });
          setMessage("Choose Save Image to keep it in your gallery.");
        } catch (err) {
          if (!(err instanceof DOMException && err.name === "AbortError")) throw err;
        }
      } else {
        downloadBlob(blob, fileName);
        setMessage("The photo was saved to this device.");
      }
    } catch (err) {
      console.error("[share sheet] could not save the photo:", err);
      setMessage("We couldn't save the photo. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  // The card window takes over the screen; closing it closes the sheet as well.
  if (cardData) {
    return <ShareToStatusModal data={cardData} onClose={onClose} />;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="Share Property"
      onClick={close}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white px-5 pb-6 pt-3 shadow-xl max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 sm:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900">Share Property</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* The property being shared */}
        <div className="mt-4 flex items-center gap-4">
          <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
            {image && <img src={image} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-900">{title}</p>
            {location && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
                <span className="truncate">{location}</span>
              </p>
            )}
            {price && <p className="mt-1 text-lg font-extrabold text-green-700">{price}</p>}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <MainRow
            highlighted
            title="Share"
            text="Share the property link and details with anyone."
            onClick={handleShare}
            icon={
              <svg {...iconProps}>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            }
          />
          <MainRow
            title="Share to Status"
            text="Share a branded property card to your WhatsApp status."
            onClick={handleStatus}
            disabled={busy === "status"}
            icon={
              <svg {...iconProps}>
                <circle cx="12" cy="12" r="9" strokeDasharray="3.2 3.2" />
                <path d="M12 8.5v7M8.5 12h7" />
              </svg>
            }
          />
          <MainRow
            title="Share Public Link"
            text="Let anyone view the property and download its images."
            onClick={handleShareGallery}
            icon={
              <svg {...iconProps}>
                <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
              </svg>
            }
          />
        </div>

        <div className="my-4 flex items-center gap-3 text-sm text-gray-500">
          <span className="h-px flex-1 bg-gray-200" />
          More Options
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200">
          <MoreRow
            title="Copy Link"
            text="Copy the public property link to your clipboard."
            onClick={handleCopy}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h8" />
              </svg>
            }
          />
          <MoreRow
            title="Save Image"
            text="Save the property image to your gallery."
            onClick={handleSaveImage}
            disabled={busy === "image"}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2.5" />
                <circle cx="8.5" cy="9.5" r="1.6" />
                <path d="M21 16l-5-5-8 8" />
              </svg>
            }
          />
        </div>

        <p role="status" aria-live="polite" className="mt-3 min-h-[1.25rem] break-words text-center text-sm text-green-700">
          {busy === "status" ? "Preparing your card..." : busy === "image" ? "Getting the photo..." : message}
        </p>
      </div>
    </div>
  );
}