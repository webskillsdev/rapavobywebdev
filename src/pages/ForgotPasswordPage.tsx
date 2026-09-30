import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setMessage("");
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setMessage("If an account exists for that email, a password reset link has been sent.");
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Forgot Password</h1>

      {message ? (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-md p-4 text-sm">
          {message}
        </p>
      ) : (
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

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-green-600 text-white font-semibold py-2.5 hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="text-sm text-gray-500 mt-6 text-center">
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Back to Log In
        </Link>
      </p>
    </div>
  );
}