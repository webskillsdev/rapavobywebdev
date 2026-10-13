import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { toBlob } from "html-to-image";
import { slugify } from "../../utils/slug";
import ResidentialShareCard, {
  CARD_HEIGHT,
  CARD_WIDTH,
  type ResidentialShareCardData,
} from "./ResidentialShareCard";

// Turns the Residential share card into a PNG picture (a Blob) that can be previewed,
// downloaded or handed to the phone's share sheet.
//
// How it works:
// 1. Check that the photos can be used in a picture. A photo that the browser refuses to
//    reuse would make the whole export fail, so such a photo is left out instead
//    (the card then shows its placeholder / the agent's initials).
// 2. Draw the card at its full 1080 x 1350 size in a hidden spot outside the screen.
// 3. Wait until every image and font is ready, then take the picture.
// 4. Remove the hidden card again.

// Resolves true if the browser can load (and therefore reuse) this image.
function canUseImage(url: string | null): Promise<boolean> {
  if (!url) return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    const timer = window.setTimeout(() => resolve(false), 12000);
    img.crossOrigin = "anonymous";
    img.onload = () => {
      window.clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}

function waitForImages(root: HTMLElement): Promise<void> {
  const pending = Array.from(root.querySelectorAll("img"))
    .filter((img) => !img.complete)
    .map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    );
  return Promise.all(pending).then(() => undefined);
}

// Safari (iPhone and Mac) often returns a blank picture on the very first try.
function isSafari(): boolean {
  return /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
}

export async function generateCardImage(data: ResidentialShareCardData): Promise<Blob> {
  const [photoOk, avatarOk] = await Promise.all([canUseImage(data.imageUrl), canUseImage(data.agentAvatarUrl)]);

  const safeData: ResidentialShareCardData = {
    ...data,
    imageUrl: photoOk ? data.imageUrl : null,
    agentAvatarUrl: avatarOk ? data.agentAvatarUrl : null,
  };

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${CARD_WIDTH}px;height:${CARD_HEIGHT}px;pointer-events:none;`;
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    flushSync(() => {
      root.render(createElement(ResidentialShareCard, { data: safeData }));
    });

    await waitForImages(host);
    if (document.fonts?.ready) await document.fonts.ready;

    const node = host.firstElementChild as HTMLElement | null;
    if (!node) throw new Error("The share card could not be drawn.");

    const options = {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: "#ffffff",
      skipFonts: true, // the card uses the phone's own fonts, exactly as on screen
    };

    if (isSafari()) await toBlob(node, options); // warm-up pass
    const blob = await toBlob(node, options);
    if (!blob) throw new Error("The share card picture could not be created.");
    return blob;
  } finally {
    root.unmount();
    host.remove();
  }
}

export function shareCardFileName(title: string): string {
  const slug = slugify(title || "property").slice(0, 40) || "property";
  return `rapavo-${slug}.png`;
}