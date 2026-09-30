import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface ActionTile {
  label: string;
  to: string | null;
  icon: ReactNode;
}

const ACTIONS: ActionTile[] = [
  {
    label: "Add Listing",
    to: "/post-property",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
  },
  {
    label: "Boost Property",
    to: null,
    icon: (
      <>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </>
    ),
  },
  {
    label: "Add Advert",
    to: null,
    icon: (
      <>
        <path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z" />
        <path d="M16 8a5 5 0 0 1 0 8" />
      </>
    ),
  },
  {
    label: "View Leads",
    to: null,
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    label: "My Transactions",
    to: null,
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M15 9.5a3 3 0 0 0-3-1.5c-1.7 0-3 .9-3 2.25S10.3 12 12 12s3 .75 3 2.25S13.7 16.5 12 16.5a3 3 0 0 1-3-1.5" />
      </>
    ),
  },
  {
    label: "Analytics",
    to: null,
    icon: <path d="M18 20V10M12 20V4M6 20v-6" />,
  },
];

export default function AgentQuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <p className="font-semibold text-gray-900 mb-3">Quick Actions</p>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map((action) =>
          action.to ? (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 py-3 text-xs font-medium hover:bg-green-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {action.icon}
              </svg>
              {action.label}
            </Link>
          ) : (
            <span
              key={action.label}
              title="Coming soon"
              className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 text-gray-400 py-3 text-xs font-medium cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {action.icon}
              </svg>
              {action.label}
            </span>
          )
        )}
      </div>
    </div>
  );
}