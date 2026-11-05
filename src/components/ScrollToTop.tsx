import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Opens every new page at the top.
// - Clicking a link (a new page) -> jump to the top.
// - Pressing Back/Forward -> leave it to the browser, so you return to where you were.
// - Links that point to a section on the page (#something) are left alone.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === "POP" || hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
}