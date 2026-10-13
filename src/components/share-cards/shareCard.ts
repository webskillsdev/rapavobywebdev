import type { ResidentialShareCardData } from "./ResidentialShareCard";

// Everything about getting the finished card picture out of Rapavo and into WhatsApp.

// The text that goes with the picture. It contains the property link, because the link
// inside the picture itself can't be tapped, but the link in the caption can.
export function buildShareCaption(data: ResidentialShareCardData): string {
  const suffix = data.listingType === "rent" ? " / year" : data.listingType === "shortlet" ? " / night" : "";
  const price =
    data.price != null && Number(data.price) > 0 ? `₦${Number(data.price).toLocaleString("en-NG")}${suffix}` : "";
  const details = [data.location, price].filter(Boolean).join(" · ");

  return [data.title, details, "View photos, details and contact the agent:", data.shareUrl]
    .filter(Boolean)
    .join("\n");
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export type ShareOutcome =
  | "shared" // the phone's share sheet was used and the person picked an app
  | "cancelled" // the person closed the share sheet
  | "downloaded"; // this device can't share pictures: the picture was saved and WhatsApp opened

// Must be called straight from a button tap (phones only allow sharing right after a tap).
export async function shareCardImage(blob: Blob, fileName: string, caption: string): Promise<ShareOutcome> {
  const file = new File([blob], fileName, { type: "image/png" });

  if (typeof navigator.canShare === "function" && typeof navigator.share === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text: caption });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      throw err;
    }
  }

  // Computers and browsers that can't share pictures: save the picture and open WhatsApp
  // with the caption, so the agent can attach the saved picture.
  downloadBlob(blob, fileName);
  window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank", "noopener");
  return "downloaded";
}