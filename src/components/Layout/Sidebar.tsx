import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useGetSavedPropertiesQuery } from "../../api/propertyApi";
import BrandLogo from "./BrandLogo";
import NavIcon from "./NavIcon";

interface NavItem {
  label: string;
  to: string | null;
  countKey?: "saved";
}

const NAV_ITEMS: NavItem[] = [
  { label: "Buyer Dashboard", to: "/dashboard" },
  { label: "Feed", to: "/feed" },
  { label: "Explore", to: "/" },
  { label: "Saved Properties", to: "/dashboard#saved", countKey: "saved" },
  { label: "Property Alerts", to: null },
  { label: "Comparisons", to: null },
  { label: "Messages", to: null },
  { label: "Site Visits", to: null },
  { label: "Transactions", to: null },
  { label: "Investments", to: null },
  { label: "Shortlets", to: null },
  { label: "Reviews", to: null },
  { label: "Documents", to: null },
  { label: "Profile", to: "/profile" },
];

function isItemActive(pathname: string, to: string): boolean {
  if (to.includes("#")) return false;
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(to + "/");
}

export default function Sidebar() {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: savedData } = useGetSavedPropertiesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const savedCount = savedData?.data?.length ?? 0;

  return (
    <aside className="w-52 min-h-full border-r border-gray-200 bg-white px-3 py-4">
      <div className="px-1 pb-4 mb-2 border-b border-gray-100">
        <BrandLogo to="/dashboard" />
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
              {item.countKey === "saved" && savedCount > 0 && (
                <span className="ml-auto text-[10px] bg-green-600 text-white rounded-full px-1.5 py-0.5">
                  {savedCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}