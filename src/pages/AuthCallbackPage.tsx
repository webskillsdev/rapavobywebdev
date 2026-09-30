import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const intent = searchParams.get("intent");

  useEffect(() => {
    if (isAuthenticated) {
      if (intent === "agent") {
        navigate("/become-agent?next=/agent-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      // Link didn't produce a session (expired, already used, etc.) —
      // send them to log in rather than leaving a blank page.
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, intent, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      Confirming your account...
    </div>
  );
}