import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import rapavoIcon from "../assets/rapavo-icon.png";

// Rapavo's own pop-up for confirmations and messages, used instead of the browser's
// plain "rapavo.com says…" boxes.
//
// How to use it in a page or component:
//   const { confirm, notify, dialog } = useBrandedDialog();
//   ...
//   if (!(await confirm({ tone: "danger", title: "Delete this listing?", ... }))) return;
//   notify({ tone: "success", title: "Link copied" });
//   ...
//   return (<>{dialog} ...rest of the page... </>);

type Tone = "danger" | "success" | "error" | "info";

export interface DialogOptions {
  title: string;
  message?: ReactNode;
  detail?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
}

interface OpenDialog extends DialogOptions {
  single: boolean; // true = one "OK" button (a message); false = Cancel + Confirm
  resolve: (ok: boolean) => void;
}

export function useBrandedDialog() {
  const [open, setOpen] = useState<OpenDialog | null>(null);
  const openRef = useRef<OpenDialog | null>(null);
  openRef.current = open;

  const confirm = useCallback(
    (options: DialogOptions) => new Promise<boolean>((resolve) => setOpen({ ...options, single: false, resolve })),
    [],
  );
  const notify = useCallback(
    (options: DialogOptions) => new Promise<boolean>((resolve) => setOpen({ ...options, single: true, resolve })),
    [],
  );

  const close = useCallback((ok: boolean) => {
    openRef.current?.resolve(ok);
    setOpen(null);
  }, []);

  const dialog = open ? <BrandedDialog {...open} onClose={close} /> : null;
  return { confirm, notify, dialog };
}

const ICONS: Record<Tone, { wrap: string; path: ReactNode }> = {
  danger: {
    wrap: "bg-red-50 text-red-600",
    path: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
  },
  error: {
    wrap: "bg-red-50 text-red-600",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5M12 16h.01" />
      </>
    ),
  },
  success: {
    wrap: "bg-green-50 text-green-600",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-6" />
      </>
    ),
  },
  info: {
    wrap: "bg-green-50 text-green-600",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
  },
};

function BrandedDialog({
  title,
  message,
  detail,
  confirmLabel,
  cancelLabel,
  tone = "info",
  single,
  onClose,
}: OpenDialog & { onClose: (ok: boolean) => void }) {
  const safeButton = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const danger = tone === "danger";
  const icon = ICONS[tone];

  useEffect(() => {
    // Start on the safe choice, so pressing Enter by accident never deletes anything.
    safeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => onClose(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="branded-dialog-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border-t-4 border-green-600"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onClose(false)}
          aria-label="Close"
          className="absolute top-4 right-4 h-9 w-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 pt-7 pb-6 sm:px-8 text-center">
          {/* Rapavo logo */}
          <div className="flex items-center justify-center gap-2">
            <img src={rapavoIcon} alt="" className="h-9 w-auto" />
            <span className="flex flex-col items-start leading-none">
              <span className="text-2xl font-bold text-gray-900 tracking-wide">RAPAVO</span>
              <span className="text-[10px] text-gray-700 whitespace-nowrap">
                The <span className="text-green-600">Smarter</span> Way to Property
              </span>
            </span>
          </div>

          <span className={`mx-auto mt-6 h-16 w-16 rounded-full flex items-center justify-center ${icon.wrap}`}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {icon.path}
            </svg>
          </span>

          <h2 id="branded-dialog-title" className="mt-4 text-2xl font-extrabold text-gray-900">
            {title}
          </h2>
          {message && <p className="mt-2 text-base text-gray-800">{message}</p>}
          {detail && <p className="mt-2 text-sm text-gray-500 leading-relaxed">{detail}</p>}

          <div className={single ? "mt-6" : "mt-6 grid grid-cols-2 gap-3"}>
            {!single && (
              <button
                ref={safeButton}
                type="button"
                onClick={() => onClose(false)}
                className="rounded-xl border-2 border-green-600 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-green-50"
              >
                {cancelLabel ?? "Cancel"}
              </button>
            )}
            <button
              ref={single ? safeButton : undefined}
              type="button"
              onClick={() => onClose(true)}
              className={
                danger
                  ? "w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 flex items-center justify-center gap-2"
                  : "w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
              }
            >
              {danger && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              )}
              {confirmLabel ?? (single ? "OK" : "Confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}