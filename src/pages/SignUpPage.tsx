import { usePageMeta } from "../hooks/usePageMeta";
import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSignUpMutation } from "../api/authApi";
import { loadUserProfileIntoStore } from "../utils/loadUserProfile";
import type { AppDispatch } from "../store";
import { safeNext, withNext } from "../utils/redirect";
import rapavoIcon from "../assets/rapavo-icon.png";
import signupHouse from "../assets/auth-signup-house.jpg";

// Everyone signs up as a buyer. Agents set up their agent profile later from
// "List a Property" in the top bar. Old links with ?intent=agent simply open this page.

const BRAND_GREEN = "#1f8f45";
const PANEL_BG = "#f1f2ef"; // matches the bottom of the house picture

const inputClass =
  "w-full h-10 rounded-lg border border-transparent bg-gray-100 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white";

function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="RAPAVO home">
      <img src={rapavoIcon} alt="" className="h-9 w-auto" />
      <img src="/rapavo-wordmark.png" alt="RAPAVO" className="h-7 w-auto" />
    </Link>
  );
}

function EyeButton({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-700"
    >
      {shown ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6A17.3 17.3 0 0 0 2 12s3.5 8 10 8a10.5 10.5 0 0 0 5.4-1.6" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          <path d="M3 3l18 18" />
        </svg>
      )}
    </button>
  );
}

function FeatureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-green-600/60 bg-green-50/50 px-3.5 py-3">
      <span className="text-green-700">{icon}</span>
      <p className="mt-2 text-sm font-medium text-gray-900 leading-snug">{title}</p>
      <p className="mt-0.5 text-xs text-gray-600 leading-snug">{text}</p>
    </div>
  );
}

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export default function SignUpPage() {
  usePageMeta("Create Account", "Create your free RAPAVO account to save properties, contact agents and get matched with listings.");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [signUp, { isLoading }] = useSignUpMutation();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [checkEmailMessage, setCheckEmailMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setCheckEmailMessage("");

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      const result: any = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        next,
      }).unwrap();

      if (result.emailConfirmationRequired) {
        setCheckEmailMessage(result.message);
        return;
      }

      const user = result.data.user;
      await loadUserProfileIntoStore(dispatch, user.id, user.email ?? email);
      navigate(next ?? "/feed", { replace: true });
    } catch (err: any) {
      setFormError(err?.message || "Unable to create your account. Please try again.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-6xl rounded-3xl bg-white shadow-lg p-3 sm:p-3.5 grid lg:grid-cols-[1.8fr_1fr] gap-4 lg:items-center">
        {/* Left: welcome panel (large screens only) */}
        <div
          className="hidden lg:flex flex-col overflow-hidden rounded-3xl border-2 border-green-600"
          style={{ backgroundColor: PANEL_BG }}
        >
          {/* The panel keeps its own height (a simple rectangle); it doesn't stretch to match the form */}
          <div className="relative">
            <img src={signupHouse} alt="" className="w-full select-none" />
            <Logo className="absolute left-7 top-6" />
          </div>
          <div className="px-8 pb-7 -mt-7 relative">
            <span className="inline-block rounded-full border border-green-600 bg-white/70 px-3.5 py-1 text-sm text-green-800">
              Find. Connect. Own.
            </span>
            <h2 className="mt-3 text-4xl leading-tight font-semibold tracking-tight text-[#24382c]">Welcome to RAPAVO</h2>
            <p className="mt-1.5 text-[15px] text-gray-700">
              The smart way to discover, connect and own the right property
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <FeatureCard
                icon={
                  <svg {...svgProps}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                }
                title="Find the right property"
                text="Search, filter and discover properties that fit your needs"
              />
              <FeatureCard
                icon={
                  <svg {...svgProps}>
                    <circle cx="9" cy="8" r="3.5" />
                    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
                    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-3-5.5" />
                  </svg>
                }
                title="Connect with trusted agents"
                text="Chat directly with verified real estate professionals"
              />
              <FeatureCard
                icon={
                  <svg {...svgProps}>
                    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
                    <path d="M8.5 12l2.5 2.5 4.5-5" />
                  </svg>
                }
                title="Safe & Transparency"
                text="Real listings. Real people. Real opportunities"
              />
            </div>
          </div>
        </div>

        {/* Right: the form */}
        <div className="flex flex-col justify-center w-full max-w-sm mx-auto px-4 py-8 sm:px-2">
          <Logo className="lg:hidden self-center mb-5" />
          <h1 className="text-[1.7rem] font-semibold text-gray-900 text-center">Create Account</h1>

          {checkEmailMessage ? (
            <div className="mt-8 text-center">
              <p className="text-green-800 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                {checkEmailMessage}
              </p>
              <Link to={withNext("/login", next)} className="mt-5 inline-block font-semibold text-green-700 hover:underline">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
                <div>
                  <label htmlFor="su-email" className="block text-xs font-medium text-gray-800 mb-1">Email address</label>
                  <input
                    id="su-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="su-name" className="block text-xs font-medium text-gray-800 mb-1">Full Name</label>
                  <input
                    id="su-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="su-password" className="block text-xs font-medium text-gray-800 mb-1">Password</label>
                    <div className="relative">
                      <input
                        id="su-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} pr-10`}
                      />
                      <EyeButton shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="su-confirm" className="block text-xs font-medium text-gray-800 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        id="su-confirm"
                        type={showConfirm ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pr-10`}
                      />
                      <EyeButton shown={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
                    </div>
                  </div>
                </div>
                <p className="-mt-1.5 text-[11px] text-gray-600">At least 6 characters.</p>

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-lg text-sm text-white font-medium hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: BRAND_GREEN }}
                >
                  {isLoading ? "Creating account..." : "Continue"}
                </button>
              </form>

              <p className="mt-3 text-xs text-gray-800 text-center">
                Already have an account?{" "}
                <Link to={withNext("/login", next)} className="font-medium text-green-700 hover:underline">
                  Login
                </Link>
              </p>

              <div className="flex items-center gap-3 my-4 px-10">
                <span className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-500">Or</span>
                <span className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                disabled
                title="Coming soon — needs Google sign-in enabled on the backend"
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
                Sign up with Google (Soon)
              </button>

              <p className="mt-5 text-[11px] text-gray-700 text-center leading-relaxed">
                By signing up I confirm that I have carefully read and agree to the{" "}
                <a href="/privacy/" className="font-medium text-green-700 hover:underline">Rapavo Privacy Policy</a> and{" "}
                <a href="/privacy/" className="font-medium text-green-700 hover:underline">Terms of Service</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}