import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Updated</h1>
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-md p-4 text-sm mb-6">
          Your password has been changed successfully.
        </p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full rounded-md bg-green-600 text-white font-semibold py-2.5 hover:bg-green-700"
        >
          Go to Log In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
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

        {formError && <p className="text-sm text-red-600">{formError}</p>}

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