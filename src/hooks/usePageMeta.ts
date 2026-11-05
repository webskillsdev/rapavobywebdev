import { useEffect } from "react";

const DEFAULT_TITLE = "RAPAVO — The Smarter Way to Property";
const DEFAULT_DESCRIPTION = "Buy, rent and list properties across Nigeria with verified agents on RAPAVO.";

// Sets the browser-tab title (and the page description) for the page on screen,
// e.g. "Saved Properties | RAPAVO". Goes back to the default when the page is left.
export function usePageMeta(title?: string | null, description?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} | RAPAVO` : DEFAULT_TITLE;

    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description || DEFAULT_DESCRIPTION);

    return () => {
      document.title = DEFAULT_TITLE;
      tag?.setAttribute("content", DEFAULT_DESCRIPTION);
    };
  }, [title, description]);
}