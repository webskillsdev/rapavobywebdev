import { useState, type MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import SignInPrompt from "./SignInPrompt";
import { toWhatsAppNumber, whatsappLink } from "../utils/contact";
import { buildShareSlug } from "../utils/slug";

// The agent strip at the bottom of a property card: photo, name, "Verified Agent",
// and Call / WhatsApp buttons.
// - layout "stacked": name on one line, the two buttons side by side under it (small cards).
// - layout "inline": everything on one row (wide cards, e.g. My Feed).
// Logged-out visitors see the buttons, but tapping them opens the Log In / Create Account pop-up.

type Agent = {
  name: string | null;
  photo: string | null;
  verified: boolean;
  phone: string | null;
  whatsapp: string | null;
  ownerId: string | null;
};

// Listings come from different places, so the agent's details have different names.
export function agentOf(property: any): Agent {
  const profile = property?.profiles ?? {};
  return {
    name: property?.user_name ?? property?.agent_name ?? profile.full_name ?? null,
    photo: property?.user_photo ?? property?.agent_photo ?? profile.avatar_url ?? null,
    verified: !!(property?.agent_verified ?? profile.is_verified),
    phone: property?.agent_phone ?? profile.phone_number ?? null,
    whatsapp: property?.whatsapp_number ?? profile.whatsapp_number ?? null,
    ownerId: property?.owner_id ?? property?.user_id ?? property?.profile_id ?? null,
  };
}

const PhoneIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

const WhatsAppIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21l1.7-4.6A8.5 8.5 0 1 1 8 19.6L3 21z" />
    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.3-1.8-1-.9.8a4 4 0 0 1-2-2l.8-.9-1-1.8L9 9.5z" />
  </svg>
);

const TickIcon = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function AgentContactStrip({
  property,
  layout = "stacked",
}: {
  property: any;
  layout?: "stacked" | "inline";
}) {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [promptOpen, setPromptOpen] = useState(false);

  const agent = agentOf(property);
  if (!agent.name) return null;

  const callNumber = agent.phone ?? agent.whatsapp;
  const waNumber = toWhatsAppNumber(agent.whatsapp ?? agent.phone);
  const isOwnListing = !!user?.uid && user.uid === agent.ownerId;
  const showButtons = !isOwnListing && (!!callNumber || !!waNumber);

  const propertyUrl =
    property?.id && property?.title
      ? `${window.location.origin}/property/${buildShareSlug(property.title, property.id)}`
      : window.location.origin;
  const waMessage = `Hi, I'm interested in "${property?.title ?? "your property"}" on RAPAVO: ${propertyUrl}`;

  // Logged-out: show the Log In / Create Account pop-up instead of calling.
  function guard(e: MouseEvent) {
    e.stopPropagation();
    if (!isAuthenticated) {
      e.preventDefault();
      setPromptOpen(true);
    }
  }

  const avatar = agent.photo ? (
    <img
      src={agent.photo}
      alt=""
      loading="lazy"
      className={`${layout === "inline" ? "h-10 w-10" : "h-7 w-7"} rounded-full object-cover shrink-0 bg-green-50`}
    />
  ) : (
    <span
      className={`${layout === "inline" ? "h-10 w-10 text-sm" : "h-7 w-7 text-[11px]"} rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold shrink-0`}
    >
      {agent.name.charAt(0).toUpperCase()}
    </span>
  );

  const nameBlock = (
    <div className="min-w-0">
      <p className={`${layout === "inline" ? "text-sm" : "text-xs"} font-semibold text-gray-900 truncate`}>{agent.name}</p>
      {agent.verified && (
        <p className="flex items-center gap-1 text-[11px] text-gray-500">
          Verified Agent
          <span className="h-3.5 w-3.5 rounded-full bg-green-600 text-white flex items-center justify-center">{TickIcon}</span>
        </p>
      )}
    </div>
  );

  const callButton = callNumber && (
    <a
      href={`tel:${callNumber.replace(/\s+/g, "")}`}
      onClick={guard}
      className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
    >
      <span className="text-green-600">{PhoneIcon}</span>
      Call
    </a>
  );

  const whatsappButton = waNumber && (
    <a
      href={whatsappLink(waNumber, waMessage)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={guard}
      className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
    >
      {WhatsAppIcon}
      WhatsApp
    </a>
  );

  return (
    // Taps here never open the property page behind the strip.
    <div onClick={(e) => e.stopPropagation()} className="cursor-default">
      {promptOpen && (
        <SignInPrompt
          title="Sign in to contact the agent"
          message={
            <>
              <strong className="font-semibold text-gray-900">Log In</strong> or{" "}
              <strong className="font-semibold text-gray-900">Sign Up</strong> to Call and Chat with agents directly.
            </>
          }
          next={`${location.pathname}${location.search}`}
          onClose={() => setPromptOpen(false)}
        />
      )}

      {layout === "inline" ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {avatar}
            {nameBlock}
          </div>
          {showButtons && (
            <div className="flex items-center gap-2 sm:border-l sm:border-gray-200 sm:pl-3">
              {callButton}
              {whatsappButton}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            {avatar}
            {nameBlock}
          </div>
          {showButtons && (
            <div className={`mt-2 grid gap-2 ${callButton && whatsappButton ? "grid-cols-2" : "grid-cols-1"}`}>
              {callButton}
              {whatsappButton}
            </div>
          )}
        </div>
      )}
    </div>
  );
}