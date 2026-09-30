import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import AuthListener from "./components/AuthListener";
import ListingPage from "./pages/ListingPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import PublicPropertyPage from "./pages/PublicPropertyPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import AgentOnboardingPage from "./pages/AgentOnboardingPage";
import AffordabilityPage from "./pages/AffordabilityPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import BuyerDashboardPage from "./pages/BuyerDashboardPage";
import PostPropertyPage from "./pages/PostPropertyPage";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import MyListingsPage from "./pages/MyListingsPage";
import ListingOverviewPage from "./pages/ListingOverviewPage";
import EditListingPage from "./pages/EditListingPage";
import FeedPage from "./pages/FeedPage";

function App() {
  return (
    <AuthListener>
      <Layout>
        <Routes>
          <Route path="/" element={<ListingPage />} />
          <Route path="/property/:slug" element={<PropertyDetailsPage />} />
          <Route path="/share/:slug" element={<PublicPropertyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/affordability" element={<AffordabilityPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<BuyerDashboardPage />} />
          <Route path="/post-property" element={<PostPropertyPage />} />
          <Route path="/agent-dashboard" element={<AgentDashboardPage />} />
          <Route path="/agent-dashboard" element={<AgentDashboardPage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/my-listings/:id" element={<ListingOverviewPage />} />
          <Route path="/become-agent" element={<AgentOnboardingPage />} />
          <Route path="/my-listings/:id/edit" element={<EditListingPage />} />
          <Route path="/my-listings/:id/edit" element={<EditListingPage />} />
          <Route path="/feed" element={<FeedPage />} />
        </Routes>
      </Layout>
    </AuthListener>
  );
}

export default App;