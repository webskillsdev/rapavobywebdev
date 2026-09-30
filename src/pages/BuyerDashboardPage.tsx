import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../store";
import {
  useGetSavedPropertiesQuery,
  useGetMatchingPropertiesForMyRequestsQuery,
  useGetPropertiesByDashboardCategoryQuery,
} from "../api/propertyApi";
import PropertyCard from "../components/PropertyCard/PropertyCard";
import DashboardShell from "../components/Layout/DashboardShell";
import Sidebar from "../components/Layout/Sidebar";
import { useBuyerFooterExtra } from "../components/Layout/ShellContext";
import BuyerHero from "../components/BuyerDashboard/BuyerHero";
import BuyerQuickActions from "../components/BuyerDashboard/BuyerQuickActions";
import BuyerMatchCard from "../components/BuyerDashboard/BuyerMatchCard";

function SoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">{title}</p>
        <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
          Soon
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-2">{description}</p>
    </div>
  );
}

export default function BuyerDashboardPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useBuyerFooterExtra();

  const { data: savedData, isLoading: savedLoading } = useGetSavedPropertiesQuery(
    undefined,
    { skip: !isAuthenticated }
  );
  const { data: matchesData, isLoading: matchesLoading } =
    useGetMatchingPropertiesForMyRequestsQuery(undefined, { skip: !isAuthenticated });
  const { data: recentData, isLoading: recentLoading } =
    useGetPropertiesByDashboardCategoryQuery(
      { category: "recent", limit: 8 },
      { skip: !isAuthenticated }
    );

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to see your dashboard.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  const saved = savedData?.data ?? [];
  const matches = matchesData?.data ?? [];
  const recent = recentData?.data ?? [];

  return (
    <DashboardShell sidebar={<Sidebar />}>
      <div className="px-6 py-6">
        <BuyerHero />
        <BuyerQuickActions />

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Saved Properties</p>
            <p className="text-2xl font-bold text-gray-900">{saved.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Property Matches</p>
            <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
          </div>
        </div>

        {/* Property matches — full width, untouched by the side column below */}
        {matches.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Property Matches</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {matches.map((property: any) => (
                <BuyerMatchCard key={property.id} property={property} />
              ))}
            </div>
          </section>
        )}
        {matches.length === 0 && !matchesLoading && (
          <p className="mt-8 text-sm text-gray-500">
            No property matches yet — submit a property request to get matched automatically.
          </p>
        )}

        {/* Saved properties — full width */}
        <section id="saved" className="mt-8 scroll-mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Saved Properties</h2>
          {savedLoading && <p className="text-sm text-gray-500">Loading...</p>}
          {!savedLoading && saved.length === 0 && (
            <p className="text-sm text-gray-500">You haven't saved any properties yet.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {saved.map((property: any) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price}
                location={property.location}
                primary_media={property.media_urls?.[0] ?? null}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                sqm={property.sqm}
                listing_type={property.listing_type}
              />
            ))}
          </div>
        </section>

        {/* Recommended / recent listings — full width */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recommended for You</h2>
          {recentLoading && <p className="text-sm text-gray-500">Loading...</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recent.map((property: any) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price}
                location={property.location}
                primary_media={property.primary_media}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                sqm={property.sqm}
                listing_type={property.listing_type}
              />
            ))}
          </div>
        </section>

        {/* Only the honestly-Soon content gets the narrower two-column treatment */}
        <div className="mt-8 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SoonCard
              title="Recent Activity"
              description="A live feed of matches, price drops and replies will appear here."
            />
            <SoonCard
              title="Market Insights"
              description="Price trends and rental yields for your saved areas will appear here."
            />
          </div>

          <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            <SoonCard
              title="Saved Searches"
              description="Save a search to get notified when new matches appear."
            />
            <SoonCard
              title="Need Help?"
              description="Chatting with a verified agent needs the Messages feature first."
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}