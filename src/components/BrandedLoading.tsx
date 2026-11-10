import rapavoIcon from "../assets/rapavo-icon.png";

// Rapavo's branded "please wait" card. Same look as BrandedDialog,
// used while a page is checking something (reset links, sign-up confirmation).
export default function BrandedLoading({ title, message }: { title: string; message?: string }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border-t-4 border-green-600"
      >
        <div className="px-6 pt-7 pb-8 sm:px-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <img src={rapavoIcon} alt="" className="h-9 w-auto" />
            <span className="flex flex-col items-start leading-none">
              <span className="text-2xl font-bold text-gray-900 tracking-wide">RAPAVO</span>
              <span className="text-[10px] text-gray-700 whitespace-nowrap">
                The <span className="text-green-600">Smarter</span> Way to Property
              </span>
            </span>
          </div>

          <span className="mx-auto mt-6 h-16 w-16 rounded-full flex items-center justify-center bg-green-50 text-green-600">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-spin"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.22-8.56" />
            </svg>
          </span>

          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">{title}</h2>
          {message && <p className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</p>}
        </div>
      </div>
    </div>
  );
}