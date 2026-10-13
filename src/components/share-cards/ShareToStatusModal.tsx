import { useCallback, useEffect, useState } from "react";
import type { ResidentialShareCardData } from "./ResidentialShareCard";
import { generateCardImage, shareCardFileName } from "./generateCardImage";
import { buildShareCaption, downloadBlob, shareCardImage } from "./shareCard";

// The "Share to Status" window. It makes the card picture as soon as it opens, shows it,
// and offers: Share to WhatsApp, Download image, Copy link.

type Props = {
  data: ResidentialShareCardData;
  onClose: () => void;
};

type Phase = "creating" | "ready" | "failed";

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function ShareToStatusModal({ data, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("creating");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const fileName = shareCardFileName(data.title);

  // Make the picture when the window opens (and again if the person taps "Try again").
  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    generateCardImage(data)
      .then((result) => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(result);
        setBlob(result);
        setPreviewUrl(createdUrl);
        setPhase("ready");
      })
      .catch((err) => {
        console.error("[share card] could not create the picture:", err);
        if (!cancelled) setPhase("failed");
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
    // The card data is created fresh on each open, so only "Try again" should re-run this.
  }, [attempt]);

  // Esc closes the window (but not in the middle of sharing)
  const close = useCallback(() => {
    if (!sharing) onClose();
  }, [sharing, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  function retry() {
    setPhase("creating");
    setPreviewUrl(null);
    setBlob(null);
    setMessage("");
    setAttempt((n) => n + 1);
  }

  async function handleShare() {
    if (!blob) return;
    setSharing(true);
    setMessage("");
    try {
      const outcome = await shareCardImage(blob, fileName, buildShareCaption(data));
      if (outcome === "downloaded") {
        setMessage("Your card was saved to this device. Attach it in WhatsApp, then post it to My Status.");
      } else if (outcome === "shared") {
        setMessage("Choose My Status in WhatsApp to post it.");
      }
    } catch (err) {
      console.error("[share card] sharing failed:", err);
      setMessage("Sharing didn't work on this device. Use Download instead.");
    } finally {
      setSharing(false);
    }
  }

  function handleDownload() {
    if (!blob) return;
    downloadBlob(blob, fileName);
    setMessage("Your card was saved to this device.");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data.shareUrl);
      setMessage("Link copied.");
    } catch {
      setMessage("We couldn't copy the link. Please copy it manually.");
    }
  }

  const ready = phase === "ready";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share to Status"
      onClick={close}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Share to Status</h2>
          <button
            type="button"
            onClick={close}
            disabled={sharing}
            aria-label="Close"
            className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center disabled:opacity-40"
          >
            <svg {...iconProps} width={18} height={18}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">Post this card to your WhatsApp Status. Viewers tap the link to see your property on Rapavo.</p>

        {/* Picture area (4:5, the same shape as the card) */}
        <div className="mt-4 mx-auto w-full max-w-[300px]">
          <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100" style={{ aspectRatio: "4 / 5" }}>
            {phase === "creating" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500">
                <span className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-green-700 animate-spin" />
                <p className="text-sm">Creating your card...</p>
              </div>
            )}
            {phase === "failed" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p role="alert" className="text-sm text-red-600">
                  We couldn't create your card. Please try again.
                </p>
                <button
                  type="button"
                  onClick={retry}
                  className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                >
                  Try again
                </button>
              </div>
            )}
            {ready && previewUrl && (
              <img src={previewUrl} alt="Your Rapavo property card" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          disabled={!ready || sharing}
          className="mt-5 w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg {...iconProps}>
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
          </svg>
          {sharing ? "Opening..." : "Share to WhatsApp"}
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">Pick WhatsApp, then choose My Status.</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!ready}
            className="rounded-lg border border-green-600 px-3 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg {...iconProps} width={18} height={18}>
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
            Download
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <svg {...iconProps} width={18} height={18}>
              <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
            </svg>
            Copy link
          </button>
        </div>

        <p role="status" aria-live="polite" className="mt-3 min-h-[1.25rem] text-center text-sm text-green-700">
          {message}
        </p>
      </div>
    </div>
  );
}