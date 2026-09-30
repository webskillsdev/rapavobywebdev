import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSignUpMutation } from "../api/authApi";
import { loadUserProfileIntoStore } from "../utils/loadUserProfile";
import type { AppDispatch } from "../store";

type Intent = "buyer" | "agent" | null;

export default function SignUpPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [signUp, { isLoading }] = useSignUpMutation();

  const [intent, setIntent] = useState<Intent>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [checkEmailMessage, setCheckEmailMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setCheckEmailMessage("");

    try {
      const result: any = await signUp({
        fullName,
        email: email.trim(),
        password,
        intent,
      }).unwrap();

      if (result.emailConfirmationRequired) {
        setCheckEmailMessage(result.message);
        return;
      }

      const user = result.data.user;
      await loadUserProfileIntoStore(dispatch, user.id, user.email ?? email);

      if (intent === "agent") {
        navigate("/become-agent?next=/agent-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setFormError(err?.message || "Unable to create your account. Please try again.");
    }
  }

  // Step 1 — how do you want to get started?
  if (!intent) {
    return (
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h1>
        <p className="text-sm text-gray-500 mb-6">How do you want to get started?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setIntent("buyer")}
            className="text-left rounded-xl border-2 border-gray-200 hover:border-green-400 p-5 transition"
          >
            <span className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
            </span>
            <p className="font-semibold text-gray-900">Sign Up as a Buyer</p>
            <p className="text-xs text-gray-500 mt-1">
              Browse listings, save favourites, and get matched with properties.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setIntent("agent")}
            className="text-left rounded-xl border-2 border-gray-200 hover:border-green-400 p-5 transition"
          >
            <span className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </span>
            <p className="font-semibold text-gray-900">Sign Up as an Agent</p>
            <p className="text-xs text-gray-500 mt-1">
              List properties, manage buyer requests, and grow your business.
            </p>
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            Log In
          </Link>
        </p>
      </div>
    );
  }

  // Step 2 — the actual form (same as before, just now aware of intent)
  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <button
        type="button"
        onClick={() => setIntent(null)}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {intent === "agent" ? "Sign Up as an Agent" : "Sign Up as a Buyer"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {intent === "agent"
          ? "We'll walk you through setting up your agent profile right after this."
          : "Create your account to start browsing."}
      </p>

      {checkEmailMessage ? (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-md p-4 text-sm">
          {checkEmailMessage}
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-green-600 text-white font-semibold py-2.5 hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {intent === "buyer" && (
            <>
              <div className="flex items-center gap-3 my-5">
                <span className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <span className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                type="button"
                disabled
                title="Coming soon — needs Google sign-in enabled on the backend"
                className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
                Sign up with Google (Soon)
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}