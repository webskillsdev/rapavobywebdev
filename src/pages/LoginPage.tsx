import { useState, type FormEvent } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../api/authApi";
import { loadUserProfileIntoStore } from "../utils/loadUserProfile";
import type { AppDispatch } from "../store";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [login, { isLoading }] = useLoginMutation();
  const [searchParams] = useSearchParams();
  const justConfirmed = searchParams.get("confirmed") === "1";

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
      navigate("/dashboard");
    } catch (err: any) {
      setFormError(err?.message || "Unable to log in. Check your details and try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Log In</h1>

      {justConfirmed && (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-md p-3 text-sm mb-4">
          Your email is confirmed — you can log in now.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter your password"
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
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-xs text-green-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-green-600 text-white font-semibold py-2.5 hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Don't have an account?{" "}
        <Link to="/signup" className="text-green-600 font-medium hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}