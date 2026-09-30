import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import type { RootState, AppDispatch } from "../store";
import { useGetUserProfileQuery, useUpdateProfileMutation, useSwitchAccountModeMutation } from "../api/userApi";
import { updateUser } from "../store/authSlice";

const STEPS = ["Welcome", "Business Info", "Verification", "Activate"];

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <span
            className={
              i <= current
                ? "h-2 flex-1 rounded-full bg-green-600"
                : "h-2 flex-1 rounded-full bg-gray-200"
            }
          />
        </div>
      ))}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
}

export default function AgentOnboardingPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/agent-dashboard";

  const { data: profileData } = useGetUserProfileQuery(user?.uid ?? "", {
    skip: !isAuthenticated || !user?.uid,
  });
  const [updateProfile] = useUpdateProfileMutation();
  const [switchAccountMode] = useSwitchAccountModeMutation();

  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [areasOperate, setAreasOperate] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (profileData) {
      setWhatsappNumber((prev) => prev || profileData.whatsapp_number || "");
      setCompanyName((prev) => prev || profileData.company_name || "");
      setCompanyLocation((prev) => prev || profileData.company_location || "");
      setAreasOperate((prev) => (prev.length ? prev : profileData.areas_operate ?? []));
    }
  }, [profileData]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to become an agent.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  if (user.currentMode === "agent") {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">Your account is already in agent mode.</p>
        <Link to="/agent-dashboard" className="text-green-600 font-medium hover:underline">
          Go to Agent Dashboard
        </Link>
      </div>
    );
  }

  function addArea() {
    const value = areaInput.trim();
    if (value && !areasOperate.includes(value)) {
      setAreasOperate((prev) => [...prev, value]);
    }
    setAreaInput("");
  }

  function removeArea(area: string) {
    setAreasOperate((prev) => prev.filter((a) => a !== area));
  }

  function goToBusinessInfo() {
    setStep(1);
  }

  function goToVerification() {
    setError("");
    if (!companyName.trim()) {
      setError("Business/brand name is required.");
      return;
    }
    if (!companyLocation.trim()) {
      setError("Business location is required.");
      return;
    }
    if (!whatsappNumber.trim()) {
      setError("A WhatsApp number is required so buyers can reach you.");
      return;
    }
    setStep(2);
  }

  async function handleActivate() {
    setError("");
    setActivating(true);
    try {
      await switchAccountMode("agent").unwrap();
      await updateProfile({
          fullName: profileData?.full_name ?? user?.fullName ?? "",
        whatsappNumber,
        companyName,
        companyLocation,
        areasOperate,
        agentProfileCompleted: true,
      } as any).unwrap();
      dispatch(updateUser({ currentMode: "agent" }));
      setStep(3);
    } catch (err: any) {
      setError(err?.message || "Something went wrong activating your agent account.");
    } finally {
      setActivating(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      {step < 3 && <StepDots current={step} />}

      {step === 0 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Become a RAPAVO Agent</h1>
          <p className="text-gray-600 mb-6">
            Activating agent mode switches your existing account — no new account is created,
            and you can switch back at any time from your profile.
          </p>
          <div className="space-y-3 mb-8">
            {[
              "List and manage properties for sale, rent or shortlet",
              "Appear on your listings with your business name and contact details",
              "Get matched automatically with buyer requests that fit your listings",
              "Build a Verified Agent badge once your identity is confirmed",
            ].map((line) => (
              <div key={line} className="flex items-start gap-2 text-sm text-gray-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {line}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={goToBusinessInfo}
            className="rounded-md bg-green-600 text-white font-semibold px-6 py-2.5 text-sm hover:bg-green-700"
          >
            Get Started
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Tell buyers about your business</h1>
          <p className="text-sm text-gray-500 mb-6">
            This is how you'll appear on every listing you post.
          </p>
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <Field label="Business / Brand Name" required>
              <TextInput
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Victoria Islands Realty"
              />
            </Field>
            <Field label="Business Location" required>
              <TextInput value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} />
            </Field>
            <Field label="WhatsApp Number" required>
              <TextInput value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
            </Field>
            <Field label="Areas You Operate In">
              <div className="flex gap-2">
                <TextInput
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addArea();
                    }
                  }}
                  placeholder="Type an area and press Enter"
                />
                <button
                  type="button"
                  onClick={addArea}
                  className="rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 flex-shrink-0"
                >
                  Add
                </button>
              </div>
              {areasOperate.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {areasOperate.map((area) => (
                    <span key={area} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                      {area}
                      <button type="button" onClick={() => removeArea(area)} className="text-gray-400 hover:text-gray-600">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

          <div className="flex justify-between mt-6">
            <button type="button" onClick={() => setStep(0)} className="text-sm font-medium text-gray-600 hover:underline">
              ← Back
            </button>
            <button
              type="button"
              onClick={goToVerification}
              className="rounded-md bg-green-600 text-white font-semibold px-6 py-2.5 text-sm hover:bg-green-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Verify your identity</h1>
          <p className="text-sm text-gray-500 mb-6">
            Verified agents get a badge buyers can see across every listing.
          </p>
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">ID & Business Document Upload</p>
              <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                Coming next
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Uploading a government ID and CAC document is being built as its own dedicated flow.
              You can activate your account now and complete verification later from your Profile
              page — nothing here is lost by continuing.
            </p>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

          <div className="flex justify-between mt-6">
            <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-gray-600 hover:underline">
              ← Back
            </button>
            <button
              type="button"
              onClick={handleActivate}
              disabled={activating}
              className="rounded-md bg-green-600 text-white font-semibold px-6 py-2.5 text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {activating ? "Activating..." : "Activate Agent Account"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-10">
          <div className="h-14 w-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">You're now an agent 🎉</h1>
          <p className="text-sm text-gray-500 mb-6">
            {companyName} is ready to start listing properties on RAPAVO.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/post-property"
              className="rounded-md bg-green-600 text-white font-semibold px-5 py-2.5 text-sm hover:bg-green-700"
            >
              Post Your First Listing
            </Link>
            <Link
              to={nextPath}
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}