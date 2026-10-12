import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useToggleSavedPropertyMutation } from "../api/propertyApi";
import SignInPrompt from "../components/SignInPrompt";
import SavePropertyModal, { type SaveStep } from "../components/SavePropertyModal";

// What the hook needs to know about a property (any listing object with these fields works).
export type SaveTarget = { id: string; saved?: boolean; [key: string]: any };

// One place that decides what "Save" does everywhere in the app:
// - visitors who are not signed in get a sign-in prompt (and come back here afterwards)
// - saving an unsaved property opens the "Save Property" window, then a "Property Saved!" screen
// - tapping an already-saved property removes it straight away and shows a short message
// - if anything fails, the person is told and nothing is left half-done
export function useSaveProperty() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [toggleSaved] = useToggleSavedPropertyMutation();
  const inFlight = useRef<Set<string>>(new Set());

  const [promptOpen, setPromptOpen] = useState(false);
  const [target, setTarget] = useState<SaveTarget | null>(null);
  const [step, setStep] = useState<SaveStep>("confirm");
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  // Esc closes the window (but not while a save is running)
  useEffect(() => {
    if (!target) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && step !== "saving") setTarget(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, step]);

  function showToast(text: string) {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  }

  // Runs the real save/unsave. Returns the new saved state, or null if it failed.
  async function runToggle(id: string): Promise<boolean | null> {
    if (inFlight.current.has(id)) return null;
    inFlight.current.add(id);
    try {
      const result: any = await toggleSaved(id).unwrap();
      return !!result?.saved;
    } catch {
      return null;
    } finally {
      inFlight.current.delete(id);
    }
  }

  async function save(arg: string | SaveTarget) {
    if (!isAuthenticated) {
      setPromptOpen(true);
      return;
    }

    const property: SaveTarget | null = typeof arg === "string" ? null : arg;
    const id = typeof arg === "string" ? arg : arg.id;

    // Not saved yet: ask first (the "Save Property" window)
    if (property && !property.saved) {
      setErrorMessage("");
      setStep("confirm");
      setTarget(property);
      return;
    }

    // Already saved (or only an id was given): toggle right away
    const nowSaved = await runToggle(id);
    if (nowSaved === null) {
      showToast("We couldn't update your saved properties. Please try again.");
    } else {
      showToast(nowSaved ? "Saved to your properties" : "Removed from your saved properties");
    }
  }

  async function confirmSave() {
    if (!target) return;
    setStep("saving");
    setErrorMessage("");

    let nowSaved = await runToggle(target.id);

    // Safety net: if the page was out of date and the property was already saved,
    // the toggle removed it. Put it back so "Save" never ends up un-saving.
    if (nowSaved === false) nowSaved = await runToggle(target.id);

    if (nowSaved === true) {
      setStep("done");
    } else {
      setStep("confirm");
      setErrorMessage("We couldn't save this property. Please try again.");
    }
  }

  function closeModal() {
    setTarget(null);
  }

  const savePrompt = (
    <>
      {promptOpen && !isAuthenticated && (
        <SignInPrompt
          title="Sign in to save properties"
          message="Log in or create a free account to save properties and find them again later. You'll come straight back to this page."
          next={`${location.pathname}${location.search}`}
          onClose={() => setPromptOpen(false)}
        />
      )}

      {target && isAuthenticated && (
        <SavePropertyModal
          property={target}
          step={step}
          errorMessage={errorMessage}
          onConfirm={confirmSave}
          onClose={closeModal}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] rounded-lg bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );

  return { save, savePrompt };
}