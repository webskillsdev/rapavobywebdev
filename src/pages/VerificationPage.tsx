import { useState, type ChangeEvent, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { RootState } from "../store";
import {
  useGetMyIdVerificationQuery,
  useGetMyDocumentVerificationQuery,
  useSubmitIdVerificationMutation,
  useSubmitDocumentVerificationMutation,
} from "../api/userApi";
import { uploadVerificationDocument } from "../lib/uploadMedia";
import DashboardShell from "../components/Layout/DashboardShell";
import AgentSidebar from "../components/Layout/AgentSidebar";

const DOCUMENT_TYPES = [
  { value: "nin", label: "National ID (NIN)" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "International Passport" },
  { value: "voters_card", label: "Voter's Card" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Approved
      </span>
    );
  }
  return (
    <span className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full capitalize">
      {status}
    </span>
  );
}

export default function VerificationPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: idVerification, isLoading: idLoading } = useGetMyIdVerificationQuery(
    undefined,
    { skip: !isAuthenticated }
  );
  const { data: docVerification, isLoading: docLoading } = useGetMyDocumentVerificationQuery(
    undefined,
    { skip: !isAuthenticated }
  );
  const [submitIdVerification, { isLoading: submittingId }] = useSubmitIdVerificationMutation();
  const [submitDocumentVerification, { isLoading: submittingDoc }] = useSubmitDocumentVerificationMutation();

  const [documentType, setDocumentType] = useState("nin");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [idError, setIdError] = useState("");
  const [idSuccess, setIdSuccess] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);

  const [docName, setDocName] = useState("CAC Certificate");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docError, setDocError] = useState("");
  const [docSuccess, setDocSuccess] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">You need to log in to access verification.</p>
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Go to Log In
        </Link>
      </div>
    );
  }

  if (user.currentMode !== "agent") {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-gray-600 mb-4">Verification is only available in agent mode.</p>
        <Link to="/become-agent" className="text-green-600 font-medium hover:underline">
          Activate Agent Mode
        </Link>
      </div>
    );
  }

  const existingId = idVerification?.data ?? null;
  const existingDoc = docVerification?.data ?? null;

  async function handleIdSubmit(e: FormEvent) {
    e.preventDefault();
    setIdError("");

    if (!frontImage) {
      setIdError("Please upload a photo of the front of your ID.");
      return;
    }

    setUploadingId(true);
    try {
      const frontUrl = await uploadVerificationDocument(frontImage, user!.uid, "id-front");
      const backUrl = backImage
        ? await uploadVerificationDocument(backImage, user!.uid, "id-back")
        : undefined;

      await submitIdVerification({
        document_type: documentType as any,
        document_number: documentNumber || undefined,
        front_image: frontUrl,
        back_image: backUrl,
      }).unwrap();

      setIdSuccess(true);
    } catch (err: any) {
      setIdError(err?.message || "Something went wrong submitting your ID.");
    } finally {
      setUploadingId(false);
    }
  }

  async function handleDocSubmit(e: FormEvent) {
    e.preventDefault();
    setDocError("");

    if (!docFile) {
      setDocError("Please upload your business document.");
      return;
    }
    if (!docName.trim()) {
      setDocError("Please give this document a name.");
      return;
    }

    setUploadingDoc(true);
    try {
      const url = await uploadVerificationDocument(docFile, user!.uid, "business-doc");

      await submitDocumentVerification({
        document_name: docName,
        document_url: url,
      }).unwrap();

      setDocSuccess(true);
    } catch (err: any) {
      setDocError(err?.message || "Something went wrong submitting your document.");
    } finally {
      setUploadingDoc(false);
    }
  }

  return (
    <DashboardShell sidebar={<AgentSidebar />}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verification</h1>
        <p className="text-sm text-gray-500 mb-6">
          Verified agents get a badge buyers can see across every listing.
        </p>

        {/* ID Verification */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900">Identity Verification</h2>
            {idLoading ? null : existingId ? <StatusBadge status={existingId.status} /> : null}
          </div>

          {idLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : existingId || idSuccess ? (
            <p className="text-sm text-gray-500 mt-2">
              {existingId?.status === "approved"
                ? "Your identity has been verified."
                : "Your ID is under review. This usually doesn't take long."}
            </p>
          ) : (
            <form onSubmit={handleIdSubmit} className="space-y-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number (optional)</label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Front of ID</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFrontImage(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Back of ID (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setBackImage(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              </div>

              {idError && <p className="text-sm text-red-600">{idError}</p>}

              <button
                type="submit"
                disabled={uploadingId || submittingId}
                className="rounded-md bg-green-600 text-white font-semibold px-5 py-2.5 text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {uploadingId || submittingId ? "Submitting..." : "Submit for Review"}
              </button>
            </form>
          )}
        </div>

        {/* Business Document Verification */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900">Business Document</h2>
            {docLoading ? null : existingDoc ? <StatusBadge status={existingDoc.status} /> : null}
          </div>

          {docLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : existingDoc || docSuccess ? (
            <p className="text-sm text-gray-500 mt-2">
              {existingDoc?.status === "approved"
                ? "Your business document has been verified."
                : "Your document is under review. This usually doesn't take long."}
            </p>
          ) : (
            <form onSubmit={handleDocSubmit} className="space-y-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. CAC Certificate"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDocFile(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              </div>

              {docError && <p className="text-sm text-red-600">{docError}</p>}

              <button
                type="submit"
                disabled={uploadingDoc || submittingDoc}
                className="rounded-md bg-green-600 text-white font-semibold px-5 py-2.5 text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {uploadingDoc || submittingDoc ? "Submitting..." : "Submit for Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}