import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../../store";

// Picks up src/assets/agent-hero.jpg (or .jpeg/.png) if it exists.
// If the file isn't there yet, a plain dark-green gradient is used instead,
// so a missing image can never break the page.
const heroImages = import.meta.glob("../../assets/agent-hero.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const heroImage = Object.values(heroImages)[0] ?? null;

export default function AgentHero() {
  const { user } = useSelector((state: RootState) => state.auth);

  const firstName = (user?.fullName ?? "").trim().split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const background = heroImage
    ? `linear-gradient(90deg, rgba(0,0,0,0.25), rgba(0,0,0,0) 60%), url(${heroImage})`
    : "linear-gradient(135deg, #064e3b, #0f172a)";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundImage: background,
        backgroundSize: "cover",
        backgroundPosition: "right 35%",
      }}
    >
      <div className="px-8 py-10 min-h-[260px] flex flex-col justify-center">
        <h1 className="m-0 text-3xl font-extrabold text-white leading-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="mt-2 text-sm text-white max-w-sm">
          Here's what's happening with your properties today, {today}.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/post-property"
            className="flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Add New Listing
          </Link>
          <Link
            to="/my-listings"
            className="rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm px-5 py-2.5"
          >
            View My Listings
          </Link>
        </div>
      </div>
    </div>
  );
}