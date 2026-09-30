import { useState, type ChangeEvent, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import type { RootState } from "../store";
import { useCreatePropertyMutation } from "../api/propertyApi";
import type { MediaItem } from "../lib/uploadMedia";
import WizardStepper from "../components/PostPropertyWizard/WizardStepper";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
}

function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
}

const HOUSE_TYPES = [
  { value: "duplex", label: "Duplex" },
  { value: "bungalow", label: "Bungalow" },
  { value: "terrace", label: "Terrace" },
];

const COMMERCIAL_TYPES = [
  { value: "commercial", label: "Commercial (general)" },
  { value: "office", label: "Office" },
  { value: "warehouse", label: "Warehouse" },
  { value: "shop", label: "Shop" },
];

const AMENITIES_LIST = [
  "Swimming Pool", "Fitted Kitchen", "Parking Space", "24/7 Security",
  "Generator", "Water Supply", "Boys' Quarter", "Balcony",
  "Gym", "Study Room", "CCTV", "Garden",
];
const CATEGORIES = [
  { value: "house", label: "House", desc: "Detached, duplex, terrace, bungalow etc." },
  { value: "apartment", label: "Apartment", desc: "Flats, serviced apartments etc." },
  { value: "land", label: "Land", desc: "Residential, commercial, industrial land etc." },
  { value: "commercial", label: "Commercial", desc: "Offices, shops, warehouses etc." },
];

const STEPS = ["Property Type", "Details", "Location", "Media", "Review", "Complete"];

export default function PostPropertyPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [createProperty, { isLoading: submitting }] = useCreatePropertyMutation();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listingType, setListingType] = useState("sale");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [sqm, setSqm] = useState("");
  const [furnishedStatus, setFurnishedStatus] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [documentStatus, setDocumentStatus] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  const isLand = category === "land";
  
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [area, setArea] = useState("");
  const [estate, setEstate] = useState("");
  const [location, setLocation] = useState("");


    function toggleAmenity(item: string) {
    setAmenities((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]));
  }

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [agentName, setAgentName] = useState(user?.fullName ?? "");
  const [agentPhone, setAgentPhone] = useState(user?.phoneNumber ?? "");
  const [submitError, setSubmitError] = useState("");

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setPhotoFiles(Array.from(e.target.files));
  }

  function handleVideoChange(e: ChangeEvent<HTMLInputElement>) {
    setVideoFile(e.target.files?.[0] ?? null);
  }

  function setCover(index: number) {
    setPhotoFiles((prev) => {
      const next = [...prev];
      const [chosen] = next.splice(index, 1);
      next.unshift(chosen);
      return next;
    });
  }
    function resetWizard() {
    setStep(1);
    setCategory("");
    setPropertyType("");
    setListingType("sale");
    setTitle("");
    setPrice("");
    setNegotiable(false);
    setBedrooms("");
    setBathrooms("");
    setSqm("");
    setFurnishedStatus("");
    setYearBuilt("");
    setDocumentStatus("");
    setAmenities([]);
    setDescription("");
    setState("");
    setLga("");
    setArea("");
    setEstate("");
    setLocation("");
    setPhotoFiles([]);
    setVideoFile(null);
    setSubmitError("");
  }

  async function handleSubmit() {
    setSubmitError("");

    const finalPropertyType =
      category === "house" || category === "commercial" ? propertyType : category;

    const mediaItems: MediaItem[] = [
      ...photoFiles.map((file) => ({ file, type: "photo" as const })),
      ...(videoFile ? [{ file: videoFile, type: "video" as const }] : []),
    ];

    const propertyData: any = {
      title,
      description,
      price,
      property_type: finalPropertyType,
      listing_type: listingType,
      location,
      agent_name: agentName,
      agent_phone: agentPhone,
      negotiable,
      state,
      lga,
      ...(area ? { area } : {}),
      ...(estate ? { estate } : {}),
      ...(furnishedStatus ? { furnished_status: furnishedStatus } : {}),
      ...(yearBuilt ? { year_built: yearBuilt } : {}),
      ...(documentStatus ? { document_status: [documentStatus] } : {}),
      ...(amenities.length ? { amenities } : {}),
      ...(listingType === "rent"
        ? { price_duration: "year" }
        : listingType === "shortlet"
        ? { price_duration: "night" }
        : {}),
      ...(isLand ? {} : { bedrooms, bathrooms, sqm }),
    };

    try {
      await createProperty({ propertyData, mediaItems }).unwrap();
      setStep(6);
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong creating your listing.");
    }
  }
  const [stepError, setStepError] = useState("");

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to list a property.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  if (user.currentMode !== "agent") {
    return <Navigate to="/become-agent?next=/post-property" replace />;
  }
    function goNext() {
    if (step === 1 && !category) {
      setStepError("Please choose a property category.");
      return;
    }
    if (step === 2) {
      if ((category === "house" || category === "commercial") && !propertyType) {
        setStepError("Please choose a specific property type.");
        return;
      }
      if (!title.trim()) {
        setStepError("Property title is required.");
        return;
      }
      if (!price.trim()) {
        setStepError("Price is required.");
        return;
      }
           if (!description.trim()) {
        setStepError("Description is required.");
        return;
      }
    }
      if (step === 3) {
      if (!state.trim() || !lga.trim() || !location.trim()) {
        setStepError("State, City/LGA and Street Address are required.");
        return;
      }
    }
    if (step === 4) {
      if (photoFiles.length === 0) {
        setStepError("Please add at least one photo.");
        return;
      }
    }
    setStepError("");
    setStep((s) => s + 1);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">List a Property</h1>
      <p className="text-gray-500 mb-6">Step {step} of 6</p>

      <WizardStepper steps={STEPS} currentStep={step} />

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Choose the category that best fits your property.</p>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={
                  category === c.value
                    ? "text-left rounded-lg border-2 border-green-600 bg-green-50 p-4"
                    : "text-left rounded-lg border border-gray-200 p-4 hover:border-gray-300"
                }
              >
                <p className="font-semibold text-gray-900">{c.label}</p>
                <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

            {step === 2 && (
        <div className="space-y-4">
          <Field label="Listing purpose">
            <div className="flex gap-2">
              {[
                { value: "sale", label: "For Sale" },
                { value: "rent", label: "For Rent" },
                { value: "shortlet", label: "Short Let" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setListingType(opt.value)}
                  className={
                    listingType === opt.value
                      ? "flex-1 rounded-md py-2 text-sm font-semibold bg-green-600 text-white"
                      : "flex-1 rounded-md py-2 text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {(category === "house" || category === "commercial") && (
            <Field label="Specific property type">
              <SelectInput value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                <option value="">Select...</option>
                {(category === "house" ? HOUSE_TYPES : COMMERCIAL_TYPES).map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </SelectInput>
            </Field>
          )}

          <Field label="Property title">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 4 Bedroom Fully Detached Duplex with Swimming Pool" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₦)">
              <TextInput type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} />
                Price is negotiable
              </label>
            </div>
          </div>

          {!isLand && (
            <div className="grid grid-cols-3 gap-3">
              <Field label="Bedrooms">
                <TextInput type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
              </Field>
              <Field label="Bathrooms">
                <TextInput type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
              </Field>
              <Field label="Size (SQM)">
                <TextInput type="number" value={sqm} onChange={(e) => setSqm(e.target.value)} />
              </Field>
            </div>
          )}

          {!isLand && (
            <Field label="Furnishing status" hint="Not yet confirmed against the backend — flag it here if submission rejects this value.">
              <SelectInput value={furnishedStatus} onChange={(e) => setFurnishedStatus(e.target.value)}>
                <option value="">Not specified</option>
                               <option value="fully_furnished">Fully Furnished</option>
                <option value="semi_furnished">Semi Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </SelectInput>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Year built (optional)">
              <TextInput type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} />
            </Field>
            <Field label="Title type (optional)" hint="Free text for now — not validated against a fixed list.">
              <TextInput value={documentStatus} onChange={(e) => setDocumentStatus(e.target.value)} placeholder="e.g. Certificate of Occupancy" />
            </Field>
          </div>

          <Field label="Amenities">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_LIST.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={amenities.includes(item)} onChange={() => toggleAmenity(item)} />
                  {item}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              disabled
              title="Coming soon — needs a backend AI endpoint that doesn't exist yet"
              className="mt-2 text-xs font-medium text-gray-400 border border-gray-200 rounded px-2 py-1 cursor-not-allowed"
            >
              ✨ Write with AI (Soon)
            </button>
          </Field>
        </div>
      )}

           {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="State">
              <TextInput value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Lagos" />
            </Field>
            <Field label="City / LGA">
              <TextInput value={lga} onChange={(e) => setLga(e.target.value)} placeholder="e.g. Lekki" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area / Neighborhood (optional)">
              <TextInput value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Chevron" />
            </Field>
            <Field label="Estate (optional)">
              <TextInput value={estate} onChange={(e) => setEstate(e.target.value)} />
            </Field>
          </div>
          <Field label="Street address" hint="A map pin and exact/approximate visibility aren't available yet — this text field is what buyers will see.">
            <TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Orchid Road, Chevron, Lekki, Lagos" />
          </Field>
        </div>
      )}

            {step === 4 && (
        <div className="space-y-4">
          <Field label="Photos" hint="The first photo (or whichever you set as cover) becomes the listing's cover image.">
            <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="text-sm" />
          </Field>

          {photoFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photoFiles.map((file, i) => (
                <div
                  key={i}
                  className={
                    i === 0
                      ? "relative rounded-md overflow-hidden ring-2 ring-green-600"
                      : "relative rounded-md overflow-hidden ring-1 ring-gray-200"
                  }
                >
                  <img src={URL.createObjectURL(file)} className="h-24 w-full object-cover" />
                  {i === 0 ? (
                    <span className="absolute bottom-0 inset-x-0 bg-green-600 text-white text-[10px] text-center py-0.5">
                      Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCover(i)}
                      className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5"
                    >
                      Set as cover
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <Field label="Video tour (optional)">
            <input type="file" accept="video/*" onChange={handleVideoChange} className="text-sm" />
          </Field>

          <div className="flex gap-2">
            <span title="Coming soon" className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-1">
              Floor Plan (Soon)
            </span>
            <span title="Coming soon" className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-1">
              Documents (Soon)
            </span>
          </div>
        </div>
      )}

            {step === 5 && (
        <div className="space-y-6">
          {photoFiles[0] && (
            <img src={URL.createObjectURL(photoFiles[0])} className="w-full h-56 object-cover rounded-lg" />
          )}

          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-gray-500">{location}, {lga}, {state}</p>
            <p className="text-xl font-bold text-green-600 mt-1">
              ₦{Number(price || 0).toLocaleString()}{" "}
              {negotiable && <span className="text-sm text-gray-400 font-normal">(Negotiable)</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Property Type</p>
              <p className="text-gray-600">{category} {propertyType && `— ${propertyType}`}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Listing Purpose</p>
              <p className="text-gray-600">{listingType}</p>
            </div>
            {!isLand && (
              <div>
                <p className="font-semibold text-gray-700">Specs</p>
                <p className="text-gray-600">{bedrooms} Beds · {bathrooms} Baths · {sqm} SQM</p>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-700">Media</p>
              <p className="text-gray-600">{photoFiles.length} photo(s){videoFile ? ", 1 video" : ""}</p>
            </div>
            {amenities.length > 0 && (
              <div className="col-span-2">
                <p className="font-semibold text-gray-700">Amenities</p>
                <p className="text-gray-600">{amenities.join(", ")}</p>
              </div>
            )}
          </div>

                 <div>
            <p className="font-semibold text-gray-700 text-sm">Description</p>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact name">
              <TextInput value={agentName} onChange={(e) => setAgentName(e.target.value)} />
            </Field>
            <Field label="Contact phone">
              <TextInput value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} />
            </Field>
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </div>
      )}

           {step === 6 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Property submitted for review</h2>
          <p className="text-gray-500 mb-6">You'll be notified once it's approved and published.</p>
          <div className="flex justify-center gap-3">
            <Link
              to="/agent-dashboard#listings"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View My Listings
            </Link>
            <button
              type="button"
              onClick={resetWizard}
              className="rounded-md bg-green-600 text-white font-semibold px-4 py-2 text-sm hover:bg-green-700"
            >
              List Another Property
            </button>
          </div>
        </div>
      )}

            {step <= 5 && (
        <div className="mt-8">
          {stepError && <p className="text-sm text-red-600 mb-3">{stepError}</p>}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {step < 5 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-md bg-green-600 text-white font-semibold px-6 py-2 text-sm hover:bg-green-700"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-green-600 text-white font-semibold px-6 py-2 text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}