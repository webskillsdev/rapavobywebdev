import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../store";
import DashboardShell from "../components/Layout/DashboardShell";
import Sidebar from "../components/Layout/Sidebar";

// Same assumptions as the mortgage estimate on Property Details:
// 20% down payment, 20-year term, 22% annual interest. Not a real quote,
// just a ballpark — kept identical across the app so the two numbers
// never contradict each other.
const DOWN_PAYMENT_RATE = 0.2;
const ANNUAL_RATE = 0.22;
const TERM_YEARS = 20;

function estimateAffordablePrice(monthlyBudget: number): number {
  const monthlyRate = ANNUAL_RATE / 12;
  const months = TERM_YEARS * 12;
  const principal =
    (monthlyBudget * (Math.pow(1 + monthlyRate, months) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, months));
  return Math.round(principal / (1 - DOWN_PAYMENT_RATE));
}

export default function AffordabilityPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [monthlyBudget, setMonthlyBudget] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to use the affordability check.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  const budgetValue = Number(monthlyBudget) || 0;
  const affordablePrice = budgetValue > 0 ? estimateAffordablePrice(budgetValue) : null;
  const downPayment = affordablePrice ? Math.round(affordablePrice * DOWN_PAYMENT_RATE) : null;

  return (
    <DashboardShell sidebar={<Sidebar />}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Check Affordability</h1>
        <p className="text-sm text-gray-500 mb-6">
          A rough estimate of the property price your monthly budget could support.
        </p>

        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How much can you comfortably pay per month?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                ₦
              </span>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {affordablePrice !== null && affordablePrice > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <p className="text-xs text-gray-500">Estimated property price you could afford</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                ₦{affordablePrice.toLocaleString()}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Est. down payment (20%)</p>
                  <p className="text-gray-900 font-medium">₦{downPayment?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Term</p>
                  <p className="text-gray-900 font-medium">{TERM_YEARS} years</p>
                </div>
              </div>
              <Link
                to={`/?maxPrice=${affordablePrice}`}
                className="mt-4 inline-block text-sm font-medium text-green-700 border border-green-200 rounded-md px-4 py-2 hover:bg-green-100"
              >
                Browse properties in this range →
              </Link>
            </div>
          )}

          <p className="text-xs text-gray-400">
            This is a rough estimate only — assumes a 20% down payment, a 20-year term, and a
            22% annual interest rate. It isn't a loan offer or pre-approval.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}