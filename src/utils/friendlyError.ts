// Turns technical errors (from the database, uploads or the network) into a message
// a person can act on: a title, what went wrong, and what to do next.

export interface FriendlyError {
  title: string;
  message: string; // what went wrong (the cause)
  detail: string; // what to do about it
}

// Names people understand for the database's field names.
const FIELD_NAMES: Record<string, string> = {
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  toilets: "Toilets",
  sqm: "Size (sqm)",
  price: "Price",
  year_built: "Year built",
  service_charge: "Service charge",
  inspection_fee: "Inspection fee",
  title: "Property title",
  description: "Description",
  location: "Street address",
  lga: "City / LGA",
  state: "State",
  agent_phone: "Contact phone",
};

export function friendlyError(err: any, action = "save your listing"): FriendlyError {
  const code: string = err?.code ?? "";
  const raw: string = String(err?.message ?? err?.error ?? err ?? "");
  const text = raw.toLowerCase();

  // A number box was left empty or has letters in it, e.g. 'invalid input syntax for type integer: ""'
  if (text.includes("invalid input syntax for type")) {
    return {
      title: "Check the number fields",
      message:
        "One of the number fields (Bedrooms, Bathrooms, Size, Price or Year built) is empty or contains letters or symbols.",
      detail:
        "Go back to Property Details and enter numbers only, for example 3 (not \"three\" or \"3 rooms\"). Optional fields can be left empty. Then submit again.",
    };
  }

  // A required field is missing, e.g. 'null value in column "lga" ... violates not-null constraint'
  const missing = raw.match(/null value in column "([^"]+)"/i);
  if (missing) {
    const field = FIELD_NAMES[missing[1]] ?? missing[1];
    return {
      title: "A required detail is missing",
      message: `The "${field}" field is empty, but it's needed to ${action}.`,
      detail: `Go back, fill in "${field}", then try again.`,
    };
  }

  if (text.includes("value too long")) {
    return {
      title: "Some text is too long",
      message: "One of your entries is longer than allowed.",
      detail: "Shorten the title or other long fields, then try again.",
    };
  }

  if (code === "UNAUTHORIZED" || text.includes("jwt") || text.includes("not authenticated")) {
    return {
      title: "Please log in again",
      message: "Your session has expired, so we couldn't confirm it's you.",
      detail: "Log out, log back in, then try again. Your entries on this page may need to be re-entered.",
    };
  }

  if (code === "NETWORK_ERROR" || text.includes("failed to fetch") || text.includes("network") || text.includes("timeout")) {
    return {
      title: "No internet connection",
      message: `We couldn't reach Rapavo to ${action}.`,
      detail: "Check your internet or mobile data, then try again.",
    };
  }

  if (code === "IMAGE_TOO_LARGE" || code === "NO_MEDIA" || code === "INVALID_IMAGE_TYPE" || code === "IMAGE_NOT_FOUND") {
    return {
      title: err?.title || "There's a problem with a photo",
      message: err?.message || "One of the photos couldn't be used.",
      detail: "Go back to Photos & Video, replace the photo (JPG or PNG, under 10MB), then submit again.",
    };
  }

  if (code === "CLOUDINARY_ERROR") {
    return {
      title: "Photos didn't finish uploading",
      message: "The upload of your photos or video was interrupted.",
      detail: "Check your connection and submit again. Your details are still filled in.",
    };
  }

  if (text.includes("duplicate key")) {
    return {
      title: "This already exists",
      message: "A record with the same details is already saved.",
      detail: "Check My Listings before trying again.",
    };
  }

  return {
    title: `We couldn't ${action}`,
    message: "Something unexpected went wrong on our side.",
    detail: `Please try again in a moment. If it keeps happening, contact info@rapavo.com and quote: ${raw || code || "unknown error"}`,
  };
}