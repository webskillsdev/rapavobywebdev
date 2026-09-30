import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../store";
import {
  useGetMyPropertiesQuery,
  useGetMatchingBuyerRequestsQuery,
} from "../api/propertyApi";
import { useGetUserProfileQuery } from "../api/userApi";
import DashboardShell from "../components/Layout/DashboardShell";
import AgentSidebar from "../components/Layout/AgentSidebar";
import AgentHero from "../components/AgentDashboard/AgentHero";
import AgentStatsRow from "../components/AgentDashboard/AgentStatsRow";
import AgentListingsSection from "../components/AgentDashboard/AgentListingsSection";
import AgentBuyerRequests from "../components/AgentDashboard/AgentBuyerRequests";
import AgentQuickActions from "../components/AgentDashboard/AgentQuickActions";
import AgentVerifiedCard from "../components/AgentDashboard/AgentVerifiedCard";

function SoonCard({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900">{title}</p>
        <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
          Soon
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-2">Coming once this data is available.</p>
    </div>
  );
}

export default function AgentDashboardPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: listingsData, isLoading: listingsLoading } = useGetMyPropertiesQuery(
    undefined,
    { skip: !isAuthenticated }
  );
  const { data: requestsData, isLoading: requestsLoading } =
    useGetMatchingBuyerRequestsQuery(undefined, { skip: !isAuthenticated });
  const { data: profileData } = useGetUserProfileQuery(user?.uid ?? "", {
    skip: !isAuthenticated || !user?.uid,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to see your agent dashboard.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  if (user.currentMode !== "agent") {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">
          This dashboard is only available in agent mode.
        </p>
        <Link to="/post-property" className="text-green-600 font-medium hover:underline">
          Activate Agent Mode
        </Link>
      </div>
    );
  }

  const listings = listingsData?.data ?? [];
  const requests: any[] = requestsData?.data ?? [];
  const totalViews = listings.reduce((sum: number, p: any) => sum + (p.views_count ?? 0), 0);
  const totalSaves = listings.reduce((sum: number, p: any) => sum + (p.favorite_count ?? 0), 0);
  const buyerMatches: number = (requestsData as any)?.total ?? requests.length;

  return (
    <DashboardShell sidebar={<AgentSidebar />}>
      <div className="px-6 py-6">
        <AgentHero />

             <AgentStatsRow
          totalViews={listingsLoading ? null : totalViews}
          activeListings={profileData ? profileData.active_listings ?? 0 : null}
          totalSaves={listingsLoading ? null : totalSaves}
          profileViews={profileData ? profileData.profile_views ?? 0 : null}
          buyerMatches={requestsLoading ? null : buyerMatches}
        />
        <AgentListingsSection listings={listings} loading={listingsLoading} />

        <div className="mt-8 flex flex-col lg:flex-row gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-4">
            <SoonCard title="Recent Leads" />
            <SoonCard title="Recent Activity" />
            <SoonCard title="Earnings Overview" />
          </div>

                  {/* Side column */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            <SoonCard title="Performance Overview" />
            <div id="requests" className="scroll-mt-6">
              <AgentBuyerRequests
                requests={requests}
                total={buyerMatches}
                loading={requestsLoading}
              />
            </div>
            <AgentQuickActions />
            <AgentVerifiedCard isVerified={!!profileData?.is_verified} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}