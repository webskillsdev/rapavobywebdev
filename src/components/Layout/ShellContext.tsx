import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";

interface ShellContextValue {
  hideHeader: boolean;
  setHideHeader: (value: boolean) => void;
  showBuyerFooterExtra: boolean;
  setShowBuyerFooterExtra: (value: boolean) => void;
}

const ShellContext = createContext<ShellContextValue>({
  hideHeader: false,
  setHideHeader: () => {},
  showBuyerFooterExtra: false,
  setShowBuyerFooterExtra: () => {},
});

export function ShellProvider({ children }: { children: ReactNode }) {
  const [hideHeader, setHideHeader] = useState(false);
  const [showBuyerFooterExtra, setShowBuyerFooterExtra] = useState(false);
  return (
    <ShellContext.Provider
      value={{ hideHeader, setHideHeader, showBuyerFooterExtra, setShowBuyerFooterExtra }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  return useContext(ShellContext);
}

// Call this inside any page that draws its own top bar (DashboardShell does).
// It hides the global header while that page is on screen, and brings it
// back automatically when the page is left.
export function useHideGlobalHeader() {
  const { setHideHeader } = useShell();
  useLayoutEffect(() => {
    setHideHeader(true);
    return () => setHideHeader(false);
  }, [setHideHeader]);
}

// Call this inside a page that wants the "Why Buyers Choose Rapavo" strip
// shown above the normal global footer, just for as long as that page is on
// screen. Nothing else needs to touch Footer.tsx.
export function useBuyerFooterExtra() {
  const { setShowBuyerFooterExtra } = useShell();
  useLayoutEffect(() => {
    setShowBuyerFooterExtra(true);
    return () => setShowBuyerFooterExtra(false);
  }, [setShowBuyerFooterExtra]);
}