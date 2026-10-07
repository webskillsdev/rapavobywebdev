// Serves link-preview crawlers (WhatsApp, Facebook, Telegram, X, LinkedIn...)
// a copy of the app's index.html with real property details in the meta tags.
// Normal visitors never reach this function (see the "has" rules in vercel.json).

const UUID_AT_END = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEFAULT_TITLE = "RAPAVO — The Smarter Way to Property";
const DEFAULT_DESCRIPTION =
  "Buy, rent and list properties across Nigeria with verified agents on RAPAVO.";

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function previewImage(property) {
  const media = Array.isArray(property.property_media) ? property.property_media : [];
  const photos = media.filter((m) => m && m.media_type !== "video" && m.media_url);
  const chosen =
    photos.find((m) => m.is_cover)?.media_url || photos[0]?.media_url || property.cover_url || null;

  if (!chosen) return null;

  // Resize Cloudinary images to the standard 1200x630 preview size, as a JPG
  // (the most widely supported format for link previews).
  if (chosen.includes("res.cloudinary.com") && chosen.includes("/upload/")) {
    return chosen.replace("/upload/", "/upload/w_1200,h_630,c_fill,q_auto,f_jpg/");
  }
  return chosen;
}

function buildDescription(property) {
  const parts = [];

  if (property.price != null && property.price !== "") {
    let price = `₦${Number(property.price).toLocaleString("en-NG")}`;
    if (property.listing_type === "rent") price += " /year";
    if (property.listing_type === "shortlet") price += " /night";
    parts.push(price);
  }

  if (property.property_type !== "land") {
    if (Number(property.bedrooms) > 0) parts.push(`${property.bedrooms} Beds`);
    if (Number(property.bathrooms) > 0) parts.push(`${property.bathrooms} Baths`);
  }
  if (Number(property.sqm) > 0) parts.push(`${property.sqm} SQM`);
  if (property.location) parts.push(property.location);

  let text = parts.join(" · ");

  const body = String(property.description ?? "").replace(/\s+/g, " ").trim();
  if (body) {
    const room = Math.max(0, 200 - text.length - 3);
    if (room > 30) {
      const snippet = body.length > room ? body.slice(0, room).trimEnd() + "…" : body;
      text = text ? `${text}. ${snippet}` : snippet;
    }
  }

  return text || DEFAULT_DESCRIPTION;
}

function injectMeta(html, { title, description, image, url }) {
  const tags = [
    `<meta name="description" content="${esc(description)}" />`,
    `<meta property="og:site_name" content="RAPAVO" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image ? `<meta property="og:image" content="${esc(image)}" />` : "",
    image ? `<meta property="og:image:width" content="1200" />` : "",
    image ? `<meta property="og:image:height" content="630" />` : "",
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    image ? `<meta name="twitter:image" content="${esc(image)}" />` : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  // Remove any default tags first so crawlers never see duplicates.
  let out = html.replace(
    /<meta\s+(?:property|name)="(?:og:[^"]*|twitter:[^"]*|description)"[^>]*>\s*/gi,
    "",
  );
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);
  out = out.replace("</head>", `    ${tags}\n  </head>`);
  return out;
}

const BARE_HTML = `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>${DEFAULT_TITLE}</title></head><body><div id="root"></div></body></html>`;

export default async function handler(req, res) {
  const kind = req.query?.kind === "share" ? "share" : "property";
  const slug = String(req.query?.slug ?? "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `https://${host}`;
  const pageUrl = `${origin}/${kind}/${slug}`;

  let baseHtml = BARE_HTML;
  try {
    const indexRes = await fetch(`${origin}/index.html`);
    if (indexRes.ok) baseHtml = await indexRes.text();
  } catch {
    // fall back to the bare page below
  }

  let meta = { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, image: null, url: pageUrl };

  try {
    const idMatch = slug.match(UUID_AT_END);
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

    if (idMatch && supabaseUrl && supabaseKey) {
      const select =
        "title,description,price,location,listing_type,property_type,bedrooms,bathrooms,sqm,cover_url,property_media(media_url,media_type,is_cover)";
      const apiRes = await fetch(
        `${supabaseUrl}/rest/v1/properties?id=eq.${idMatch[0]}&select=${encodeURIComponent(select)}&limit=1`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: "application/json" } },
      );

      if (apiRes.ok) {
        const rows = await apiRes.json();
        const property = Array.isArray(rows) ? rows[0] : null;
        if (property) {
          meta = {
            title: `${property.title} | RAPAVO`,
            description: buildDescription(property),
            image: previewImage(property),
            url: pageUrl,
          };
        }
      }
    }
  } catch {
    // keep the default RAPAVO preview if anything goes wrong
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.status(200).send(injectMeta(baseHtml, meta));
}