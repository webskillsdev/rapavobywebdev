import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { useLogoutMutation } from "../../api/authApi";
import { clearUser } from "../../store/authSlice";

export default function DashboardTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logout] = useLogoutMutation();
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const isAgent = user?.currentMode === "agent";

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  async function handleLogout() {
    setMenuOpen(false);
    await logout({});
    dispatch(clearUser());
    navigate("/");
  }

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle menu"
        className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 flex-shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-0">
        <div className="relative flex-1 min-w-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search properties, agents, locations..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Link
            to="/"
            title="Open filters on Explore"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </svg>
          </Link>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-green-600 text-white font-semibold px-5 text-sm hover:bg-green-700"
        >
          Search
        </button>
      </form>

           <Link
        to={isAgent ? "/post-property" : "/become-agent"}
        className="hidden sm:flex items-center gap-2 rounded-lg border border-green-300 text-green-700 font-semibold text-sm px-4 py-2.5 hover:bg-green-50 whitespace-nowrap"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        {isAgent ? "Add Listing" : "Become an Agent"}
      </Link>

      <span
        title="Coming soon — Messages"
        className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 cursor-not-allowed flex-shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </span>

      <span
        title="Coming soon — Notifications"
        className="h-10 w-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 cursor-not-allowed flex-shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </span>

      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2"
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.fullName} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="h-9 w-9 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
              {user?.initials || "?"}
            </span>
          )}
          <span className="hidden md:block text-left leading-tight">
            <span className="block text-sm font-semibold text-gray-900">
              {user?.fullName || user?.email}
            </span>
            <span className="block text-xs text-gray-500">{isAgent ? "Agent" : "Buyer"}</span>
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1">
              <Link
                to={isAgent ? "/agent-dashboard" : "/dashboard"}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                My Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Log Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}