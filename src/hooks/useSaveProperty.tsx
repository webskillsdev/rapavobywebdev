import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useToggleSavedPropertyMutation } from "../api/propertyApi";
import SignInPrompt from "../components/SignInPrompt";

// One place that decides what "Save" does everywhere in the app:
// - visitors who are not signed in get a sign-in prompt (and come back here afterwards)
// - signed-in users save/unsave instantly; if it fails, they are told (and the heart goes back)
export function useSaveProperty() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [toggleSaved] = useToggleSavedPropertyMutation();
  const [promptOpen, setPromptOpen] = useState(false);
  const inFlight = useRef<Set<string>>(new Set());

  async function save(propertyId: string) {
    if (!isAuthenticated) {
      setPromptOpen(true);
      return;
    }
    // ignore rapid double-taps on the same property while one request is running
    if (inFlight.current.has(propertyId)) return;
    inFlight.current.add(propertyId);
    try {
      await toggleSaved(propertyId).unwrap();
    } catch {
      alert("We couldn't update your saved properties. Please try again.");
    } finally {
      inFlight.current.delete(propertyId);
    }
  }

  const savePrompt =
    promptOpen && !isAuthenticated ? (
      <SignInPrompt
        title="Sign in to save properties"
        message="Log in or create a free account to save properties and find them again later. You'll come straight back to this page."
        next={`${location.pathname}${location.search}`}
        onClose={() => setPromptOpen(false)}
      />
    ) : null;

  return { save, savePrompt };
}