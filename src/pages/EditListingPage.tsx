import { useState, useEffect, type ChangeEvent, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useGetSinglePropertyQuery, useUpdatePropertyMutation } from "../api/propertyApi";
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

const CATEGORIES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

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

function inferCategory(propertyType: string): string {
  if (HOUSE_TYPES.some((t) => t.value === propertyType)) return "house";
  if (COMMERCIAL_TYPES.some((t) => t.value === propertyType)) return "commercial";
  if (propertyType === "land") return "land";
  if (propertyType === "apartment") return "apartment";
  return "";
}

const STEPS = ["Basic Details", "Location", "Media", "Features & Amenities", "Pricing & Availability", "Additional Info"];

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const { data, isLoading, error } = useGetSinglePropertyQuery(id as string, {
    skip: !isAuthenticated,
  });
  const [updateProperty] = useUpdatePropertyMutation();

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [category, setCategory] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listingType, setListingType] = useState("sale");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [toilets, setToilets] = useState("");
  const [sqm, setSqm] = useState("");
  const [furnishedStatus, setFurnishedStatus] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [documentStatus, setDocumentStatus] = useState("");
  const [propertyCondition, setPropertyCondition] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [inspectionFee, setInspectionFee] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [state, setStateField] = useState("");
  const [lga, setLga] = useState("");
  const [area, setArea] = useState("");
  const [estate, setEstate] = useState("");
  const [location, setLocation] = useState("");
    const [existingPhotos, setExistingPhotos] = useState<any[]>([]);
  const [existingVideo, setExistingVideo] = useState<any>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [removeVideo, setRemoveVideo] = useState(false);
    const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const property = data?.data;
    if (property && !loaded) {
      setCategory(inferCategory(property.property_type));
      setPropertyType(property.property_type ?? "");
      setListingType(property.listing_type ?? "sale");
      setTitle(property.title ?? "");
      setPrice(String(property.price ?? ""));
      setNegotiable(!!property.negotiable);
      setBedrooms(property.bedrooms != null ? String(property.bedrooms) : "");
      setBathrooms(property.bathrooms != null ? String(property.bathrooms) : "");
      setToilets(property.toilets != null ? String(property.toilets) : "");
      setSqm(property.sqm != null ? String(property.sqm) : "");
      setFurnishedStatus(property.furnished_status ?? "");
      setYearBuilt(property.year_built != null ? String(property.year_built) : "");
      setDocumentStatus(property.document_status?.[0] ?? "");
      setPropertyCondition(property.property_condition ?? "");
      setServiceCharge(property.service_charge != null ? String(property.service_charge) : "");
      setInspectionFee(property.inspection_fee != null ? String(property.inspection_fee) : "");
      setAgentName(property.agent_name ?? "");
      setAgentPhone(property.agent_phone ?? "");
      setCompanyName(property.company_name ?? "");
      setAgentEmail(property.agent_email ?? "");
      setYoutubeLink(property.youtube_link ?? "");
      setVideoLink(property.video_link ?? "");
      setAmenities(property.amenities ?? []);
      setDescription(property.description ?? "");
      setStateField(property.state ?? "");
      setLga(property.lga ?? "");
      setArea(property.area ?? "");
      setEstate(property.estate ?? "");
      setLocation(property.location ?? "");
           const media = property.property_media ?? [];
      const photos = media.filter((m: any) => m.media_type !== "video");
      setExistingPhotos(photos);
      setExistingVideo(media.find((m: any) => m.media_type === "video") ?? null);
      setCoverUrl(photos.find((p: any) => p.is_cover)?.media_url ?? property.cover_url ?? photos[0]?.media_url ?? "");
      setLoaded(true);
    }
  }, [data, loaded]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to edit this listing.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  if (isLoading || !loaded) return <p className="max-w-6xl mx-auto px-6 py-10 text-gray-500">Loading listing...</p>;
  if (error) return <p className="max-w-6xl mx-auto px-6 py-10 text-red-600">Something went wrong loading this listing.</p>;

  const property = data?.data;
  if (!property) return <p className="max-w-6xl mx-auto px-6 py-10 text-gray-500">Listing not found.</p>;

  const isLand = category === "land";

   function toggleAmenity(item: string) {
    setAmenities((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]));
  }

  const keptPhotos = existingPhotos.filter((p: any) => !removedPhotoUrls.includes(p.media_url));

  function removeExistingPhoto(url: string) {
    setRemovedPhotoUrls((prev) => [...prev, url]);
    if (coverUrl === url) {
      const nextCover = keptPhotos.find((p: any) => p.media_url !== url)?.media_url ?? "";
      setCoverUrl(nextCover);
    }
  }

  function handleNewPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setNewPhotoFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
  }

  function handleNewVideoChange(e: ChangeEvent<HTMLInputElement>) {
    setNewVideoFile(e.target.files?.[0] ?? null);
    setRemoveVideo(false);
  }

  async function handleSubmit() {
    if (!agentName.trim() || !agentPhone.trim()) {
      setSubmitError("Contact name and phone are required.");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    const finalPropertyType = category === "house" || category === "commercial" ? propertyType : category;

    const mediaItems: MediaItem[] = [
      ...newPhotoFiles.map((file) => ({ file, type: "photo" as const })),
      ...(newVideoFile ? [{ file: newVideoFile, type: "video" as const }] : []),
    ];

    const removedImages: string[] = [...removedPhotoUrls];
    if (removeVideo && existingVideo) {
      removedImages.push(existingVideo.media_url);
    }

    const updates: any = {
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
      cover_url: coverUrl,
      ...(area ? { area } : {}),
      ...(estate ? { estate } : {}),
      ...(furnishedStatus ? { furnished_status: furnishedStatus } : {}),
      ...(yearBuilt ? { year_built: yearBuilt } : {}),
      ...(documentStatus ? { document_status: [documentStatus] } : {}),
      ...(propertyCondition ? { property_condition: propertyCondition } : {}),
      ...(serviceCharge ? { service_charge: serviceCharge } : {}),
      ...(inspectionFee ? { inspection_fee: inspectionFee } : {}),
      ...(companyName ? { company_name: companyName } : {}),
      ...(agentEmail ? { agent_email: agentEmail } : {}),
      ...(youtubeLink ? { youtube_link: youtubeLink } : {}),
      ...(videoLink ? { video_link: videoLink } : {}),
      ...(amenities.length ? { amenities } : {}),
      ...(listingType === "rent"
        ? { price_duration: "year" }
        : listingType === "shortlet"
        ? { price_duration: "night" }
        : {}),
         ...(isLand
        ? {}
        : {
            ...(bedrooms !== "" ? { bedrooms } : {}),
            ...(bathrooms !== "" ? { bathrooms } : {}),
            ...(toilets !== "" ? { toilets } : {}),
            ...(sqm !== "" ? { sqm } : {}),
          }),
    };

    try {
      await updateProperty({ propertyId: id, updates, mediaItems, removedImages }).unwrap();
      navigate(`/my-listings/${id}`);
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong saving your changes.");
    } finally {
      setSubmitting(false);
    }
  }

    function goNext() {
    if (step === 1) {
      if ((category === "house" || category === "commercial") && !propertyType) {
        setStepError("Please choose a specific property type.");
        return;
      }
      if (!title.trim()) {
        setStepError("Property title is required.");
        return;
      }
      if (!description.trim()) {
        setStepError("Description is required.");
        return;
      }
    }
       if (step === 2) {
      if (!state.trim() || !lga.trim() || !location.trim()) {
        setStepError("State, City/LGA and Street Address are required.");
        return;
      }
    }
        if (step === 3) {
      if (keptPhotos.length + newPhotoFiles.length === 0) {
        setStepError("A listing needs at least one photo.");
        return;
      }
    }
      if (step === 5) {
      if (!price.trim()) {
        setStepError("Price is required.");
        return;
      }
    }
    setStepError("");
    setStep((s) => s + 1);
  }

  const completenessChecks = [
    description.trim().length > 50,
    amenities.length > 0,
    !!furnishedStatus,
    !!yearBuilt,
    !!documentStatus,
    !!propertyCondition,
    existingPhotos.length >= 5,
    !!existingVideo,
  ];
  const completenessPercent = Math.round(
    (completenessChecks.filter(Boolean).length / completenessChecks.length) * 100
  );

  const previewCover = coverUrl || existingPhotos[previewIndex]?.media_url || null;
  const otherPhotos = existingPhotos.filter((_: any, i: number) => i !== previewIndex);
  const visibleThumbs = otherPhotos.slice(thumbOffset, thumbOffset + 4);
  const remainingCount = otherPhotos.length - (thumbOffset + visibleThumbs.length);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/my-listings/${id}`)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            ← Back to Listing
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
          <p className="text-gray-500 text-sm mt-1">Update your property details, photos and information.</p>
        </div>
        <Link
          to={`/my-listings/${id}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View Listing
        </Link>
      </div>

      <div className="mt-6">
        <WizardStepper steps={STEPS} currentStep={step} />
      </div>

      <div className="flex gap-6">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-1">Basic Details</h2>
                <p className="text-xs text-gray-500 mb-4">Let's start with the main information about your property.</p>

                <div className="space-y-4">
                  <Field label="Property title">
                    <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Property category">
                      <SelectInput value={category} onChange={(e) => { setCategory(e.target.value); setPropertyType(""); }}>
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </SelectInput>
                    </Field>
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
                                ? "flex-1 rounded-md py-2 text-xs font-semibold bg-green-600 text-white"
                                : "flex-1 rounded-md py-2 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>

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

                  <Field label="Property description">
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
                      ✨ Improve with AI (Soon)
                    </button>
                  </Field>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-1">Key Details</h2>
                <p className="text-xs text-gray-500 mb-4">Provide the main specifications of your property.</p>

                {!isLand && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <Field label="Bedrooms">
                      <TextInput type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                    </Field>
                    <Field label="Bathrooms">
                      <TextInput type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                    </Field>
                    <Field label="Toilets">
                      <TextInput type="number" value={toilets} onChange={(e) => setToilets(e.target.value)} />
                    </Field>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="Property size (SQM)">
                    <TextInput type="number" value={sqm} onChange={(e) => setSqm(e.target.value)} />
                  </Field>
                  {!isLand && (
                    <Field label="Furnishing" hint="Values unconfirmed against the backend — flag if rejected.">
                      <SelectInput value={furnishedStatus} onChange={(e) => setFurnishedStatus(e.target.value)}>
                        <option value="">Not specified</option>
                        <option value="fully_furnished">Fully Furnished</option>
                        <option value="semi_furnished">Semi Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                      </SelectInput>
                    </Field>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Field label="Title document" hint="Free text — not a fixed list.">
                    <TextInput value={documentStatus} onChange={(e) => setDocumentStatus(e.target.value)} placeholder="e.g. Certificate of Occupancy" />
                  </Field>
                  <Field label="Property age / year built">
                    <TextInput type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} />
                  </Field>
                            <Field label="Condition" hint="Backend expects specific values (confirmed via error) — leave blank until Azubike provides the real list.">
                    <TextInput value={propertyCondition} onChange={(e) => setPropertyCondition(e.target.value)} placeholder="e.g. Excellent" />
                  </Field>
                </div>
              </div>
            </div>
          )}

                 {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-900 mb-1">Location</h2>
              <p className="text-xs text-gray-500 mb-4">Help buyers find your property.</p>

              <div className="grid grid-cols-2 gap-3">
                <Field label="State">
                  <TextInput value={state} onChange={(e) => setStateField(e.target.value)} />
                </Field>
                <Field label="City / LGA">
                  <TextInput value={lga} onChange={(e) => setLga(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Area / Neighborhood (optional)">
                  <TextInput value={area} onChange={(e) => setArea(e.target.value)} />
                </Field>
                <Field label="Estate (optional)">
                  <TextInput value={estate} onChange={(e) => setEstate(e.target.value)} />
                </Field>
              </div>
              <Field label="Street address">
                <TextInput value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
            </div>
          )}

                   {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-6">
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Current Photos</h2>
                <p className="text-xs text-gray-500 mb-3">Click a photo to make it the cover, or remove it.</p>
                <div className="grid grid-cols-4 gap-2">
                  {keptPhotos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className={
                        coverUrl === photo.media_url
                          ? "relative aspect-square rounded-lg overflow-hidden ring-2 ring-green-600"
                          : "relative aspect-square rounded-lg overflow-hidden ring-1 ring-gray-200"
                      }
                    >
                      <img src={photo.media_url} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverUrl(photo.media_url)}
                        className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5"
                      >
                        {coverUrl === photo.media_url ? "Cover" : "Set as cover"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(photo.media_url)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white/90 text-red-600 text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {keptPhotos.length === 0 && (
                  <p className="text-sm text-gray-400">No existing photos kept — add new ones below.</p>
                )}
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Add New Photos</h2>
                <input type="file" accept="image/*" multiple onChange={handleNewPhotoChange} className="text-sm" />
                {newPhotoFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {newPhotoFiles.map((file, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={URL.createObjectURL(file)} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewPhotoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white/90 text-red-600 text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Video Tour</h2>
                {existingVideo && !removeVideo ? (
                  <div className="flex items-center gap-3">
                    <video src={existingVideo.media_url} className="h-20 w-32 rounded-lg object-cover bg-black" muted playsInline />
                    <button
                      type="button"
                      onClick={() => setRemoveVideo(true)}
                      className="text-xs font-medium text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                    >
                      Remove video
                    </button>
                  </div>
                ) : newVideoFile ? (
                  <div className="flex items-center gap-3">
                    <video src={URL.createObjectURL(newVideoFile)} className="h-20 w-32 rounded-lg object-cover bg-black" muted playsInline />
                    <button
                      type="button"
                      onClick={() => setNewVideoFile(null)}
                      className="text-xs font-medium text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input type="file" accept="video/*" onChange={handleNewVideoChange} className="text-sm" />
                )}
              </div>
            </div>
          )}

                   {step === 4 && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-1">Features & Amenities</h2>
              <p className="text-xs text-gray-500 mb-4">Select all features that apply to this property.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES_LIST.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={amenities.includes(item)} onChange={() => toggleAmenity(item)} />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          )}

                  {step === 5 && (
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-900 mb-1">Pricing & Availability</h2>
              <p className="text-xs text-gray-500 mb-4">Update the price and any related fees.</p>

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

              <div className="grid grid-cols-2 gap-3">
                <Field label="Service charge (optional)">
                  <TextInput type="number" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} />
                </Field>
                <Field label="Inspection fee (optional)">
                  <TextInput type="number" value={inspectionFee} onChange={(e) => setInspectionFee(e.target.value)} />
                </Field>
              </div>
            </div>
          )}

                  {step === 6 && (
            <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
              <h2 className="font-semibold text-gray-900 mb-1">Additional Info</h2>
              <p className="text-xs text-gray-500 mb-4">Contact details and optional extras for this listing.</p>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Contact name">
                  <TextInput value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                </Field>
                <Field label="Contact phone">
                  <TextInput value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Company name (optional)">
                  <TextInput value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </Field>
                <Field label="Contact email (optional)">
                  <TextInput type="email" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="YouTube link (optional)">
                  <TextInput value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} />
                </Field>
                <Field label="Video link (optional)">
                  <TextInput value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
                </Field>
              </div>

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            </div>
          )}

          <div className="mt-8">
            {stepError && <p className="text-sm text-red-600 mb-3">{stepError}</p>}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
                           {step < 6 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-md bg-green-600 text-white font-semibold px-6 py-2 text-sm hover:bg-green-700"
                >
                  Save & Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-md bg-green-600 text-white font-semibold px-6 py-2 text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Live Preview</p>
                        <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video mb-2">
              {previewCover && <img src={previewCover} className="h-full w-full object-cover" />}
            </div>
            {otherPhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-1 mb-3">
                {visibleThumbs.map((photo: any, i: number) => {
                  const isLastTile = i === visibleThumbs.length - 1 && remainingCount > 0;
                  const realIndex = existingPhotos.findIndex((p: any) => p.id === photo.id);
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => {
                        if (isLastTile) {
                          const nextOffset = thumbOffset + 4;
                          setThumbOffset(nextOffset >= otherPhotos.length ? 0 : nextOffset);
                        } else {
                          setPreviewIndex(realIndex);
                          setThumbOffset(0);
                        }
                      }}
                      className="relative aspect-square rounded overflow-hidden bg-gray-100"
                    >
                      <img src={photo.media_url} className="h-full w-full object-cover" />
                      {isLastTile && (
                        <span className="absolute inset-0 bg-black/50 text-white text-[10px] font-semibold flex items-center justify-center">
                          +{remainingCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-sm font-semibold text-gray-900 truncate">{title || "Untitled listing"}</p>
            <p className="text-xs text-gray-500">{[location, lga, state].filter(Boolean).join(", ")}</p>
            <p className="text-green-600 font-bold text-sm mt-1">
              ₦{Number(price || 0).toLocaleString()}
            </p>
          </div>

                  <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Listing Completeness</p>
            <div className="flex items-center gap-3">
              <svg width="56" height="56" viewBox="0 0 56 56" className="flex-shrink-0 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - completenessPercent / 100)}`}
                />
                <text
                  x="28"
                  y="28"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="rotate-90"
                  style={{ transformOrigin: "28px 28px" }}
                  fontSize="13"
                  fontWeight="700"
                  fill="#16a34a"
                >
                  {completenessPercent}%
                </text>
              </svg>
              <p className="text-xs text-gray-500">
                {completenessPercent === 100 ? "All set!" : "Fill in more details to improve visibility."}
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Tips for a better listing</p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Use clear, high-quality photos</li>
              <li>Be accurate about the location</li>
              <li>Write a detailed description</li>
              <li>Keep your price competitive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}