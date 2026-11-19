import { usePageMeta } from "../hooks/usePageMeta";
import { useState, type FormEvent } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../api/authApi";
import { loadUserProfileIntoStore } from "../utils/loadUserProfile";
import type { AppDispatch } from "../store";
import { safeNext, withNext } from "../utils/redirect";
import rapavoIcon from "../assets/rapavo-icon.png";
import loginHouse from "../assets/auth-login-house.jpg";

// Same green as the design's picture panel, so the house photo blends into it.
const BRAND_GREEN = "#228544";

const inputClass =
  "w-full h-14 rounded-xl border border-gray-300 bg-[#f7f6f2] px-4 text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent";

export default function LoginPage() {
  usePageMeta("Log In");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [login, { isLoading }] = useLoginMutation();
  const [searchParams] = useSearchParams();
  const justConfirmed = searchParams.get("confirmed") === "1";
  const next = safeNext(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    try {
      const result: any = await login({
        email: email.trim(),
        password,
      }).unwrap();
      const user = result.data.user;
      await loadUserProfileIntoStore(dispatch, user.id, user.email ?? email);
      navigate(next ?? "/feed", { replace: true });
    } catch (err: any) {
      setFormError(err?.message || "Unable to log in. Check your details and try again.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl rounded-3xl bg-white shadow-xl p-3 sm:p-4 grid md:grid-cols-2 gap-4">
        {/* Left: the form */}
        <div className="flex flex-col items-center px-4 py-8 sm:px-12 sm:py-10">
          <Link to="/" className="flex items-center gap-2" aria-label="RAPAVO home">
            <img src={rapavoIcon} alt="" className="h-14 w-auto" />
            <img src="/rapavo-wordmark.png" alt="RAPAVO" className="h-11 w-auto" />
          </Link>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#1f5130]">Welcome Back</h1>
          <p className="mt-2 text-gray-800">Please Login to your account</p>

          <div className="w-full mt-6 space-y-3">
            {next && (
              <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3">
                Log in to continue where you left off.
              </p>
            )}
            {justConfirmed && (
              <p className="text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                Your email is confirmed — you can log in now.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="w-full mt-2 space-y-4">
            <div>
              <label htmlFor="login-email" className="sr-only">Email</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="sr-only">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 px-4 text-gray-700 hover:text-gray-900"
                >
                  {showPassword ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6A17.3 17.3 0 0 0 2 12s3.5 8 10 8a10.5 10.5 0 0 0 5.4-1.6" />
                      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                      <path d="M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-sm text-[#1f6b3a] hover:underline">
                  Forgot Password
                </Link>
              </div>
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-xl text-white text-lg font-medium hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: BRAND_GREEN }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-gray-900 text-center">
            Don't have an account yet?{" "}
            <Link to={withNext("/signup", next)} className="font-semibold text-[#1f6b3a] hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        {/* Right: green picture panel (computers and tablets only) */}
        <div
          className="hidden md:flex flex-col overflow-hidden rounded-3xl"
          style={{ backgroundColor: BRAND_GREEN }}
        >
          <div className="px-12 pt-12">
            <h2 className="text-4xl lg:text-[2.6rem] font-bold leading-tight text-white">
              Discover and own the right property
            </h2>
            <p className="mt-3 text-white/85">Find. Connect. Own.</p>
          </div>
          <img src={loginHouse} alt="" className="mt-auto w-full select-none" />
        </div>
      </div>
    </div>
  );
}