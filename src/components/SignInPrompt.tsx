import { Link } from "react-router-dom";
import { withNext } from "../utils/redirect";

type Props = {
  title: string;
  message: string;
  next: string; // the page to come back to after logging in or signing up
  onClose: () => void;
};

export default function SignInPrompt({ title, message, next, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <span className="h-11 w-11 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{message}</p>

        <div className="mt-5 space-y-2.5">
          <Link
            to={withNext("/login", next)}
            className="flex w-full items-center justify-center rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"
          >
            Log In
          </Link>
          <Link
            to={withNext("/signup", next)}
            className="flex w-full items-center justify-center rounded-lg border border-green-600 px-4 py-3 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
}