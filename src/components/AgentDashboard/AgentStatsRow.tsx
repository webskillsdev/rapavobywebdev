import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | null;
  caption: string;
  icon: ReactNode;
}

function StatCard({ label, value, caption, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
      <span className="h-11 w-11 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
               <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value == null ? "—" : value.toLocaleString()}
        </p>
        <p className="text-[11px] text-gray-400 truncate">{caption}</p>
      </div>
    </div>
  );
}

interface AgentStatsRowProps {
  totalViews: number | null;
  activeListings: number | null;
  totalSaves: number | null;
  profileViews: number | null;
  buyerMatches: number | null;
}

export default function AgentStatsRow({
  totalViews,
  activeListings,
  totalSaves,
  profileViews,
  buyerMatches,
}: AgentStatsRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
      <StatCard
        label="Total Views"
        value={totalViews}
        caption="Across all your listings"
        icon={
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </>
        }
      />
           <StatCard
        label="Active Listings"
        value={activeListings}
        caption="Status: Approved"
        icon={
          <>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <path d="M9 22V12h6v10" />
          </>
        }
      />
      <StatCard
        label="Total Saves"
        value={totalSaves}
        caption="Saved by buyers"
        icon={
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        }
      />
      <StatCard
        label="Profile Views"
        value={profileViews}
        caption="People viewing your profile"
        icon={
          <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </>
        }
      />
      <StatCard
        label="Buyer Matches"
        value={buyerMatches}
        caption="Requests matching your listings"
        icon={
          <>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </>
        }
      />
    </div>
  );
}