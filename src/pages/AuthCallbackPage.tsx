import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../lib/supabase";
import { clearUser } from "../store/authSlice";
import type { RootState, AppDispatch } from "../store";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const intent = searchParams.get("intent");

  useEffect(() => {
    async function handleCallback() {
      if (!isAuthenticated) {
        // Link didn't produce a session (expired, already used, etc.)
        navigate("/login", { replace: true });
        return;
      }

      if (intent === "agent") {
        // Agent path: stay signed in, go straight into onboarding
        navigate("/become-agent?next=/agent-dashboard", { replace: true });
        return;
      }

      // Buyer path: the confirmation link technically signed them in,
      // but we deliberately sign back out so they land on a real
      // login screen instead of an already-authenticated dashboard.
      await supabase.auth.signOut();
      dispatch(clearUser());
      navigate("/login?confirmed=1", { replace: true });
    }

    handleCallback();
  }, [isAuthenticated, intent, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Confirming your account...
    </div>
  );
}