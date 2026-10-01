import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../store";
import { useGetUserProfileQuery, useUpdateProfileMutation } from "../api/userApi";
import DashboardShell from "../components/Layout/DashboardShell";
import Sidebar from "../components/Layout/Sidebar";
import AgentSidebar from "../components/Layout/AgentSidebar";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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

export default function ProfilePage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isAgent = user?.currentMode === "agent";

  const { data: profileData, isLoading } = useGetUserProfileQuery(user?.uid ?? "", {
    skip: !isAuthenticated || !user?.uid,
  });
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const [fullName, setFullName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [location, setLocation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [areasOperate, setAreasOperate] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (profileData && !loaded) {
      setFullName(profileData.full_name ?? "");
      setAboutMe(profileData.about_me ?? "");
      setPhoneNumber(profileData.phone_number ?? "");
      setWhatsappNumber(profileData.whatsapp_number ?? "");
      setLocation(profileData.location ?? "");
      setCompanyName(profileData.company_name ?? "");
      setCompanyLocation(profileData.company_location ?? "");
      setAreasOperate(profileData.areas_operate ?? []);
      setLoaded(true);
    }
  }, [profileData, loaded]);

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!whatsappNumber.trim()) {
      setErrorMessage("WhatsApp number is required.");
      return;
    }
    if (isAgent && !companyName.trim()) {
      setErrorMessage("Business/brand name is required for an agent profile.");
      return;
    }

    try {
      await updateProfile({
        fullName,
        avatarUri: avatarFile ?? undefined,
        aboutMe,
        whatsappNumber,
        phoneNumber,
        location,
        areasOperate,
        companyName,
        companyLocation,
        agentProfileCompleted: isAgent ? true : (profileData as any)?.agent_profile_completed ?? false,
      } as any).unwrap();
      setSuccessMessage("Profile updated.");
      setAvatarFile(null);
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong saving your profile.");
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to edit your profile.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  const currentAvatar = avatarPreview ?? profileData?.avatar_url ?? null;

  return (
    <DashboardShell sidebar={isAgent ? <AgentSidebar /> : <Sidebar />}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {isAgent ? "Agent Profile" : "Profile"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {isAgent
            ? "This is how buyers see you across your listings."
            : "Update your personal details."}
        </p>

        {isLoading || !loaded ? (
          <p className="text-sm text-gray-500">Loading profile...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="font-semibold text-gray-900 mb-4">Profile Photo</p>
              <div className="flex items-center gap-4">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={fullName}
                    className="h-20 w-20 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="h-20 w-20 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    {fullName.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
                <label className="text-sm font-medium text-green-700 border border-green-200 rounded-md px-4 py-2 hover:bg-green-50 cursor-pointer">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <p className="font-semibold text-gray-900">Personal Information</p>
              <Field label="Full Name">
                <TextInput value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone Number">
                  <TextInput value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </Field>
                <Field label="WhatsApp Number">
                  <TextInput value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
                </Field>
              </div>
              <Field label="Location">
                <TextInput
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lekki, Lagos"
                />
              </Field>
              <Field label="About Me">
                <textarea
                  rows={4}
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder={
                    isAgent
                      ? "Tell buyers about your experience and what makes you a great agent..."
                      : "A short bio..."
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </Field>
            </div>

            {isAgent && (
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
                <p className="font-semibold text-gray-900">Business Information</p>
                <Field label="Business / Brand Name">
                  <TextInput
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Victoria Islands Realty"
                  />
                </Field>
                <Field label="Business Location">
                  <TextInput
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                  />
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
                        <span
                          key={area}
                          className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                        >
                          {area}
                          <button
                            type="button"
                            onClick={() => removeArea(area)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </Field>
              </div>
            )}

            {isAgent && (
              <Link
                to="/verification"
                className="block bg-green-50 border border-green-200 rounded-xl p-5 hover:bg-green-100"
              >
                <p className="font-semibold text-gray-900">Identity & Business Verification</p>
                <p className="text-xs text-gray-600 mt-2">
                  Upload your ID and business document to earn the Verified Agent badge →
                </p>
              </Link>
            )}

            {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-green-600 text-white font-semibold px-6 py-2.5 text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}