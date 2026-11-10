import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { supabase } from "../lib/supabase";
import { clearUser } from "../store/authSlice";
import type { AppDispatch } from "../store";
import { useBrandedDialog } from "../components/BrandedDialog";
import BrandedLoading from "../components/BrandedLoading";

type LinkState = "checking" | "ready" | "done";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { notify, dialog } = useBrandedDialog();
  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const linkStateRef = useRef<LinkState>("checking");
  linkStateRef.current = linkState;
  const expiredShown = useRef(false);

  // Expired / already-used link: branded pop-up, then send them for a new link.
  async function showExpired(reason?: string) {
    if (expiredShown.current) return;
    expiredShown.current = true;
    setLinkState("done");
    const wantsNewLink = await notify({
      tone: "error",
      title: "Reset link expired",
      message: reason || "This password reset link is invalid or has expired.",
      detail: "Reset links can only be used once. Request a new one and use the latest email.",
      confirmLabel: "Send a New Reset Link",
    });
    navigate(wantsNewLink ? "/forgot-password" : "/login", { replace: true });
  }

  // The reset link signs the user in for a moment. Wait for Supabase to
  // finish reading the link (token in the URL) before deciding what to show.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    const urlError =
      hashParams.get("error_description") || queryParams.get("error_description");
    if (urlError) {
      showExpired(urlError.replace(/\+/g, " "));
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setLinkState((current) => (current === "checking" ? "ready" : current));
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        setLinkState("ready");
        return;
      }
      // Give the link a few seconds to be processed before giving up.
      timer = setTimeout(() => {
        if (cancelled) return;
        if (linkStateRef.current === "checking") showExpired();
      }, 4000);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      notify({
        tone: "error",
        title: "Passwords don't match",
        message: "Please type the same new password in both boxes.",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsLoading(false);
      notify({
        tone: "error",
        title: "Couldn't update password",
        message: "Your password was not changed. Please try again.",
        detail: error.message,
      });
      return;
    }

    // Sign out so the user logs in fresh with the new password.
    await supabase.auth.signOut();
    dispatch(clearUser());
    setIsLoading(false);
    setLinkState("done");

    await notify({
      tone: "success",
      title: "Password updated",
      message: "Your password has been changed successfully.",
      detail: "Log in with your new password to continue.",
      confirmLabel: "Go to Log In",
    });
    navigate("/login", { replace: true });
  }

  if (linkState === "checking") {
    return (
      <>
        {dialog}
        <BrandedLoading
          title="Checking your reset link"
          message="Hold on a moment while we verify your link."
        />
      </>
    );
  }

  if (linkState === "done") {
    // Only the branded pop-up shows here; it moves the user on when closed.
    return <div className="min-h-[70vh]">{dialog}</div>;
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      {dialog}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Set a New Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-green-600 text-white font-semibold py-2.5 hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Back to Log In
        </Link>
      </p>
    </div>
  );
}