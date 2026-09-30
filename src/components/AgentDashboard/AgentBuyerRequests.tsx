import { Link } from "react-router-dom";

function timeAgo(dateString?: string): string {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AgentBuyerRequests({
  requests,
  total,
  loading,
}: {
  requests: any[];
  total: number;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-gray-900">Buyer Requests</p>
        {total > 0 && (
          <Link to="/my-listings" className="text-xs font-medium text-green-600 hover:underline">
            View all ({total})
          </Link>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3">Buyers are looking for properties matching your listings.</p>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {!loading && requests.length === 0 && (
        <p className="text-sm text-gray-500">No buyer requests match your listings yet.</p>
      )}

      <div className="space-y-3">
        {requests.slice(0, 3).map((req) => (
          <div key={req.id} className="flex items-start gap-3">
            <span className="h-9 w-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">{req.short_text}</p>
                {req.highPriority && (
                  <span className="text-[9px] font-bold uppercase bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex-shrink-0">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{req.preferred_location}</p>
              {req.budget != null && (
                <p className="text-xs text-gray-500">Budget: ₦{Number(req.budget).toLocaleString()}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(req.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}