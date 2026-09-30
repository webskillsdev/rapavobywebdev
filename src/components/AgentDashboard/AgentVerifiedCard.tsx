import { Link } from "react-router-dom";

export default function AgentVerifiedCard({ isVerified }: { isVerified: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2">
        <span
          className={
            isVerified
              ? "h-9 w-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0"
              : "h-9 w-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0"
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
            {isVerified && <path d="M9 12l2 2 4-4" />}
          </svg>
        </span>
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {isVerified ? "Verified Agent" : "Not Verified Yet"}
          </p>
          <p className="text-xs text-gray-500">
            {isVerified ? "Your profile is complete and verified." : "Complete verification to build buyer trust."}
          </p>
        </div>
      </div>
      {!isVerified && (
        <Link
          to="/profile"
          className="mt-3 block text-center text-sm font-medium text-green-700 border border-green-200 rounded-md py-2 hover:bg-green-50"
        >
          Start Verification
        </Link>
      )}
    </div>
  );
}