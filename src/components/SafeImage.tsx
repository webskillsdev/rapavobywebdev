import { useEffect, useState, type ImgHTMLAttributes } from "react";

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
};

// A picture that:
// - only downloads when it scrolls into view (saves data on phones),
// - stays hidden until it has fully loaded, then fades in (no half-drawn pictures),
// - tries once more if the download fails, and
// - shows a clean "no photo" placeholder if there is no picture or it still fails.
export default function SafeImage({ src, alt = "", className = "", style, ...rest }: SafeImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Start fresh whenever the picture changes.
  useEffect(() => {
    setAttempt(0);
    setLoaded(false);
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || "No photo"}
        className={`${className} flex items-center justify-center bg-green-50 text-green-600`}
        style={style}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 10.5L12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M10 21v-6h4v6" />
        </svg>
      </div>
    );
  }

  // Second try: same picture with a small extra marker, so the browser fetches it again.
  const url = attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}retry=1`;

  return (
    <img
      {...rest}
      key={url}
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      ref={(el) => {
        // Pictures already in the browser's cache can finish before React is listening.
        if (el && el.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (attempt === 0) setAttempt(1);
        else setFailed(true);
      }}
      className={className}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: "opacity 300ms ease, transform 300ms ease",
      }}
    />
  );
}