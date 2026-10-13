import type { CSSProperties, ReactNode } from "react";

// ---------------------------------------------------------------------------
// ResidentialShareCard
//
// A fixed 1080 x 1350 (4:5) Rapavo marketing card for a house / apartment.
// It is a "dumb" component: it only draws what it is given. Nothing about any
// property is written inside it, so the same card works for every listing.
//
// Everything is styled inline with plain pixel values on purpose, so the card
// looks identical on every phone and can be turned into an image reliably.
// ---------------------------------------------------------------------------

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

const GREEN = "#97C736"; // official Rapavo green
const GREEN_DARK = "#5E8F1A"; // deeper tone of the same green, for text on white (readability)
const INK = "#1E2433";
const MUTED = "#6B7280";
const FONT = `"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif`;

export type ResidentialShareCardData = {
  title: string;
  listingType: string; // "sale" | "rent" | "shortlet" (anything else is shown in capitals)
  price: number | null;
  location: string;
  imageUrl: string | null;
  photoCount: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  toilets?: number | null;
  sqm?: number | null;
  agentName: string | null;
  agentAvatarUrl: string | null;
  agentVerified: boolean;
  shareUrl: string;
};

// ----- small helpers -------------------------------------------------------

function listingLabel(type: string): string {
  if (type === "sale") return "FOR SALE";
  if (type === "rent") return "FOR RENT";
  if (type === "shortlet") return "SHORTLET";
  return type ? type.toUpperCase() : "";
}

function ctaLine(type: string): string {
  if (type === "sale") return "Check out this property for sale on Rapavo";
  if (type === "rent") return "Check out this property for rent on Rapavo";
  if (type === "shortlet") return "Check out this shortlet on Rapavo";
  return "Check out this property on Rapavo";
}

function priceText(price: number | null, type: string): string | null {
  if (price == null || !Number.isFinite(Number(price)) || Number(price) <= 0) return null;
  const suffix = type === "rent" ? " / year" : type === "shortlet" ? " / night" : "";
  return `₦${Number(price).toLocaleString("en-NG")}${suffix}`;
}

function initialsOf(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "R";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

// Long titles get a slightly smaller font so they still fit in two lines.
function titleSize(title: string): number {
  if (title.length > 90) return 44;
  if (title.length > 60) return 50;
  return 58;
}
type Stat = { icon: ReactNode; value: string; label: string };

const oneLine: CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

// ----- icons (simple line icons, no emoji) ----------------------------------

function Icon({ children, size = 40, color = INK }: { children: ReactNode; size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const BedIcon = () => (
  <Icon>
    <path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
    <circle cx="7" cy="11" r="1.6" />
  </Icon>
);
const BathIcon = () => (
  <Icon>
    <path d="M4 12h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2zM6 12V6a2 2 0 0 1 3.5-1.3M7 20l-1 1.5M17 20l1 1.5" />
  </Icon>
);
const ToiletIcon = () => (
  <Icon>
    <path d="M7 3h10v6H7zM5 9h14a0 0 0 0 1 0 0 7 7 0 0 1-7 7 7 7 0 0 1-7-7 0 0 0 0 1 0 0zM9 16l-1 5h8l-1-5" />
  </Icon>
);
const SizeIcon = () => (
  <Icon>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    <rect x="8.5" y="8.5" width="7" height="7" rx="0.5" />
  </Icon>
);
const PinIcon = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill={GREEN} stroke="none">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
  </svg>
);
const CameraIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="8.5" cy="9.5" r="1.6" />
    <path d="M21 16l-5-5-8 8" />
  </svg>
);
const LinkIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </svg>
);
const OpenIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={GREEN_DARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </svg>
);

// ----- the card -------------------------------------------------------------

export default function ResidentialShareCard({ data }: { data: ResidentialShareCardData }) {
  const label = listingLabel(data.listingType);
  const price = priceText(data.price, data.listingType);

  // Only real values are shown. A missing or zero value hides that slot (never "0").
   const stats: Stat[] = [];
  if (data.bedrooms) {
    stats.push({ icon: <BedIcon />, value: String(data.bedrooms), label: data.bedrooms === 1 ? "Bedroom" : "Bedrooms" });
  }
  if (data.bathrooms) {
    stats.push({ icon: <BathIcon />, value: String(data.bathrooms), label: data.bathrooms === 1 ? "Bathroom" : "Bathrooms" });
  }
  if (data.toilets) {
    stats.push({ icon: <ToiletIcon />, value: String(data.toilets), label: data.toilets === 1 ? "Toilet" : "Toilets" });
  }
  if (data.sqm) {
    stats.push({ icon: <SizeIcon />, value: `${Number(data.sqm).toLocaleString("en-NG")} sqm`, label: "Size" });
  }

  const agentName = data.agentName?.trim() || "Rapavo Agent";

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        fontFamily: FONT,
        color: INK,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Header: logo + listing type */}
      <div
        style={{
          height: 150,
          flexShrink: 0,
          padding: "0 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src="/rapavo-mark.png" alt="" style={{ height: 104, width: "auto", display: "block" }} />
          <img src="/rapavo-wordmark.png" alt="Rapavo" style={{ height: 96, width: "auto", display: "block" }} />
        </div>
        {label && (
          <div
            style={{
              background: GREEN,
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: 46,
              letterSpacing: 1,
              padding: "16px 44px",
              borderRadius: 22,
              lineHeight: 1,
            }}
          >
            {label}
          </div>
        )}
      </div>

      {/* Photo */}
      <div style={{ position: "relative", flex: "1 1 0", minHeight: 280, background: "#E5E7EB", overflow: "hidden" }}>
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #EEF5DC 0%, #D9E8B0 100%)",
            }}
          >
            <img src="/rapavo-mark.png" alt="" style={{ height: 200, width: "auto", opacity: 0.35 }} />
          </div>
        )}

        {data.photoCount > 1 && (
          <div
            style={{
              position: "absolute",
              right: 40,
              bottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(30,36,51,0.82)",
              color: "#FFFFFF",
              fontSize: 32,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 18,
            }}
          >
            <CameraIcon />
            {data.photoCount} photos
          </div>
        )}
      </div>

      {/* Agent (avatar overlaps the photo, like the mockup) */}
      <div style={{ position: "relative", height: 118, flexShrink: 0 }}>
        <div
          style={{
            position: "absolute",
            left: 48,
            top: -84,
            width: 176,
            height: 176,
            borderRadius: "50%",
            border: `8px solid ${GREEN}`,
            background: "#FFFFFF",
            boxSizing: "border-box",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {data.agentAvatarUrl ? (
            <img
              src={data.agentAvatarUrl}
              alt=""
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: GREEN,
                color: "#FFFFFF",
                fontSize: 64,
                fontWeight: 800,
              }}
            >
              {initialsOf(data.agentName)}
            </div>
          )}
        </div>

        <div style={{ position: "absolute", left: 252, right: 56, top: 8 }}>
          <div style={{ fontSize: 30, color: MUTED, lineHeight: 1.2 }}>Listed by</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 2 }}>
            <span style={{ ...oneLine, fontSize: 44, fontWeight: 800, lineHeight: 1.2, minWidth: 0 }}>{agentName}</span>
            {data.agentVerified && (
              <svg width="40" height="40" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="11" fill={GREEN} />
                <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div style={{ fontSize: 28, color: MUTED, lineHeight: 1.3 }}>
            {data.agentVerified ? "Verified Agent on Rapavo" : "Agent on Rapavo"}
          </div>
        </div>
      </div>

      {/* Title, location, price */}
      <div style={{ padding: "20px 56px 0", flexShrink: 0 }}>
        <div
          style={{
            fontSize: titleSize(data.title),
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: -0.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {data.title}
        </div>

        {data.location && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
            <span style={{ flexShrink: 0, display: "flex" }}>
              <PinIcon />
            </span>
            <span style={{ ...oneLine, fontSize: 36, color: MUTED, minWidth: 0 }}>{data.location}</span>
          </div>
        )}

        {price && (
          <div style={{ ...oneLine, marginTop: 10, fontSize: 56, fontWeight: 800, color: GREEN_DARK, letterSpacing: -0.5 }}>
            {price}
          </div>
        )}
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div style={{ padding: "22px 48px 0", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              background: "#F4F5F7",
              borderRadius: 26,
              padding: "20px 0",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  borderLeft: i === 0 ? "none" : "2px solid #E3E5EA",
                }}
              >
                {s.icon}
                <div style={{ minWidth: 0 }}>
                  <div style={{ ...oneLine, fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>{s.value}</div>
                  <div style={{ ...oneLine, fontSize: 24, color: MUTED, lineHeight: 1.3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to action + link (pinned to the bottom) */}
      <div style={{ padding: "26px 48px 40px", flexShrink: 0 }}>
        <div
          style={{
            position: "relative",
            background: "#EAF3D2",
            borderRadius: 32,
            padding: "24px 36px 26px",
            overflow: "hidden",
          }}
        >
          <img
            src="/rapavo-mark.png"
            alt=""
            style={{ position: "absolute", right: 36, top: 20, height: 140, width: "auto", opacity: 0.32 }}
          />
          <div style={{ position: "relative", maxWidth: 720, fontSize: 38, fontWeight: 800, lineHeight: 1.15 }}>
            {ctaLine(data.listingType)}
          </div>
          <div style={{ position: "relative", marginTop: 10, fontSize: 28, color: MUTED }}>
            View photos, details and contact the agent directly.
          </div>

          <div
            style={{
              position: "relative",
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: GREEN_DARK,
              borderRadius: 24,
              padding: "14px 14px 14px 30px",
            }}
          >
            <span style={{ flexShrink: 0, display: "flex" }}>
              <LinkIcon />
            </span>
            <span style={{ ...oneLine, flex: 1, minWidth: 0, fontSize: 32, fontWeight: 600, color: "#FFFFFF" }}>
              {displayUrl(data.shareUrl)}
            </span>
            <span
              style={{
                flexShrink: 0,
                width: 72,
                height: 72,
                borderRadius: 18,
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <OpenIcon />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}