import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface ActionTile {
  label: string;
  to: string | null;
  icon: ReactNode;
}

const ACTIONS: ActionTile[] = [
  {
    label: "Explore Properties",
    to: "/",
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </>
    ),
  },
  {
    label: "Check Affordability",
    to: "/affordability",
    icon: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 9h20M6 15h4" />
      </>
    ),
  },
  {
    label: "New Developments",
    to: null,
    icon: (
      <>
        <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        <path d="M9 9h1M14 9h1M9 13h1M14 13h1" />
      </>
    ),
  },
  {
    label: "Investment Opportunities",
    to: null,
    icon: (
      <>
        <path d="M23 6l-9.5 9.5-5-5L1 18" />
        <path d="M17 6h6v6" />
      </>
    ),
  },
  {
    label: "Book Site Visit",
    to: null,
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
];

export default function BuyerQuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
      <p className="font-semibold text-gray-900 mb-3">Quick Actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {ACTIONS.map((action) =>
          action.to ? (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 py-3 px-2 text-xs font-medium text-center hover:bg-green-100"
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
              className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 text-gray-400 py-3 px-2 text-xs font-medium text-center cursor-not-allowed"
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