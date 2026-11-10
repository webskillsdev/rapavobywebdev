import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../lib/supabase";
import { clearUser } from "../store/authSlice";
import type { AppDispatch } from "../store";
import { safeNext } from "../utils/redirect";
import BrandedLoading from "../components/BrandedLoading";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");
  const next = safeNext(searchParams.get("next"));

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      // Wait for Supabase to finish reading the confirmation link
      // instead of checking the store on the very first render.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!data.session) {
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
      if (cancelled) return;
      dispatch(clearUser());
      navigate(
        next ? `/login?confirmed=1&next=${encodeURIComponent(next)}` : "/login?confirmed=1",
        { replace: true },
      );
    }

    handleCallback();
    return () => {
      cancelled = true;
    };
  }, [intent, next, navigate, dispatch]);

  return (
    <BrandedLoading
      title="Confirming your account"
      message="Hold on a moment while we verify your email."
    />
  );
}