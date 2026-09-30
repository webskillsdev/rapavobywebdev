import { useEffect, useState, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../lib/supabase";
import { setAuthReady, clearUser } from "../store/authSlice";
import { loadUserProfileIntoStore } from "../utils/loadUserProfile";
import type { AppDispatch } from "../store";

export default function AuthListener({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (user) {
        await loadUserProfileIntoStore(dispatch, user.id, user.email ?? "");
      }

      if (isMounted) {
        dispatch(setAuthReady(true));
        setCheckingSession(false);
      }
    }

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        dispatch(clearUser());
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [dispatch]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}