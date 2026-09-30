import { Link, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import NavIcon from "./NavIcon";
import promoCard from "../../assets/sidebar-promo-card.png";

interface NavItem {
  label: string;
  to: string | null;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/agent-dashboard" },
  { label: "Feed", to: "/feed" },
  { label: "Explore", to: "/" },
  { label: "My Listings", to: "/my-listings" },
  { label: "Buyer Requests", to: "/agent-dashboard#requests" },
  { label: "Leads", to: null },
  { label: "Messages", to: null },
  { label: "Property Boost", to: null },
  { label: "Advertisements", to: null },
  { label: "Transactions", to: null },
  { label: "Analytics", to: null },
  { label: "Reviews", to: null },
  { label: "Saved", to: null },
  { label: "Followers", to: null },
  { label: "Profile", to: "/profile" },
  { label: "Settings", to: null },
];

function isItemActive(pathname: string, to: string): boolean {
  if (to.includes("#")) return false;
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}

export default function AgentSidebar() {
  const location = useLocation();

  return (
    <aside className="w-52 min-h-full border-r border-gray-200 bg-white px-3 py-4">
      <div className="px-1 pb-4 mb-2 border-b border-gray-100">
        <BrandLogo to="/agent-dashboard" />
      </div>

      <nav className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          if (!item.to) {
            return (
              <div
                key={item.label}
                title="Coming soon"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-400 cursor-not-allowed"
              >
                <NavIcon label={item.label} />
                <span>{item.label}</span>
                <span className="ml-auto text-[9px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              </div>
            );
          }

          const active = isItemActive(location.pathname, item.to);

          return (
            <Link
              key={item.label}
              to={item.to}
              className={
                active
                  ? "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold bg-green-50 text-green-700"
                  : "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50"
              }
            >
              <NavIcon label={item.label} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">
        <img src={promoCard} alt="List Smarter, Close Faster" className="w-full rounded-xl" />
        <span
          title="Coming soon — needs the Boost/Credits backend"
          className="mt-2 block text-center text-xs font-medium text-gray-400 border border-gray-200 rounded px-3 py-1.5 cursor-not-allowed"
        >
          View Boost Plans (Soon)
        </span>
      </div>
    </aside>
  );
}