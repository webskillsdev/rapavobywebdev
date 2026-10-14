import { useEffect, useRef, useState } from "react";
import { useLazyGetSinglePropertyQuery } from "../../api/propertyApi";
import type { ResidentialShareCardData } from "./ResidentialShareCard";
import { buildResidentialCardData, shareCardKindOf } from "./buildShareCardData";
import ShareToStatusModal from "./ShareToStatusModal";

// The "Share to Status" button for an agent's own listing.
// It is separate from the normal "Share" button (which only copies the property link).
//
// On tap it loads the full listing (with the agent's profile), builds the card data,
// and opens the Share to Status window. Land listings don't have a card yet.

type Props = {
  propertyId: string;
  className?: string;
  label?: string;
};

export default function ShareToStatusButton({ propertyId, className = "", label = "Share to Status" }: Props) {
  const [loadProperty] = useLazyGetSinglePropertyQuery();
  const [cardData, setCardData] = useState<ResidentialShareCardData | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  function showToast(text: string) {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3500);
  }

  async function open() {
    if (busy) return;
    setBusy(true);
    try {
      // Uses the listing already in memory when there is one, otherwise loads it.
      const result: any = await loadProperty(propertyId, true).unwrap();
      const property = result?.data;
      if (!property) throw new Error("Listing not found");

      if (shareCardKindOf(property) === "land") {
        showToast("Share to Status for land listings is coming soon.");
        return;
      }
      setCardData(buildResidentialCardData(property));
    } catch (err) {
      console.error("[share to status] could not load the listing:", err);
      showToast("We couldn't load this listing. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" onClick={open} disabled={busy} className={className}>
        {busy ? "Preparing..." : label}
      </button>

      {cardData && <ShareToStatusModal data={cardData} onClose={() => setCardData(null)} />}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] rounded-lg bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}