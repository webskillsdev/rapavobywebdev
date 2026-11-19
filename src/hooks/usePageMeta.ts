import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "RAPAVO — The Smarter Way to Property";
const DEFAULT_DESCRIPTION = "Buy, rent and list properties across Nigeria with verified agents on RAPAVO.";
// The one official web address. Canonical tags always point here, so Google treats
// www/non-www, /share/ and filter options (?type=...) as the same page.
const SITE_URL = "https://rapavo.com";

// Sets the browser-tab title, the page description and the canonical address for
// the page on screen, e.g. "Saved Properties | RAPAVO".
// canonicalPath: leave out to use the current page's path (without ?filters);
// property pages pass "/property/<title>-<id>".
export function usePageMeta(title?: string | null, description?: string | null, canonicalPath?: string | null) {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title ? `${title} | RAPAVO` : DEFAULT_TITLE;

    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description || DEFAULT_DESCRIPTION);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${SITE_URL}${canonicalPath || pathname}`);

    return () => {
      document.title = DEFAULT_TITLE;
      tag?.setAttribute("content", DEFAULT_DESCRIPTION);
    };
  }, [title, description, canonicalPath, pathname]);
}