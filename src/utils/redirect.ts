// Safe "return to where I was" support.
// A `next` value comes from the URL, so it must be treated as untrusted:
// only plain, same-site paths on an allow-list are accepted. Anything else
// (full URLs, //evil.com, javascript:, backslashes, etc.) is ignored.

const ALLOWED_PREFIXES = ["/property/", "/share/", "/feed", "/saved"];

export function safeNext(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();

  if (value.length === 0 || value.length > 400) return null;
  if (!value.startsWith("/")) return null; // must be a path on this site
  if (value.startsWith("//")) return null; // protocol-relative URL
  if (/[\u0000-\u001f\s\\]/.test(value)) return null; // control chars, spaces, backslashes
  if (value.includes("..")) return null; // no path tricks

  // Final check: resolved against a dummy origin, it must stay on that origin.
  try {
    const base = "http://rapavo.invalid";
    const resolved = new URL(value, base);
    if (resolved.origin !== base) return null;
  } catch {
    return null;
  }

  const path = value.split("?")[0].split("#")[0];
  const allowed = ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
  return allowed ? value : null;
}

// Builds /login or /signup with the return path attached (only if it is safe).
export function withNext(path: string, next: string | null | undefined): string {
  const safe = safeNext(next);
  return safe ? `${path}?next=${encodeURIComponent(safe)}` : path;
}