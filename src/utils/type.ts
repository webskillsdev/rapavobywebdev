export interface ListType {
  createdAt?: { _methodName: "serverTimestamp" };
  description?: string;
  id: string;
  media?: { publicId: string; type: string; url: string }[];
  price: string;
  primaryMedia: { publicId: string; type: string; url: string };
  title: string;
  uid: string;
  ownername: string;
  userPhoto: string;
}

export interface PropertyFormType {
  title: string;

  price_duration: string;

  description: string;

  price: string;

  property_type: string;

  listing_type: string;

  location: string;

  bedrooms?: string;

  bathrooms?: string;

  state?: string;

  lga?: string;

  area?: string;
  estate?: string;

  toilets?: string;

  sqm?: string;

  parking_spaces?: string;

  year_built?: string;

  property_size?: string;

  service_charge?: string;

  inspection_fee?: string;

  furnished_status?: string;

  property_condition?: string;

  document_status?: string[];

  youtube_link?: string;

  video_link?: string;

  agent_name: string;

  agent_phone: string;

  company_name?: string;

  agent_email?: string;

  amenities?: string[];

  negotiable?: boolean;
}

export type FeedItemType = "property" | "request";

export interface BaseFeedItem {
  agent_email: "egbolawrenceandyou@gmail.com";
  agent_name: "Jude";
  agent_phone: "08032536589";
  agent_photo: null;
  amenities: [];
  availability_status: true;
  media_urls?: string[];
  bathrooms: null;
  bedrooms: null;
  company_name: "Hz";
  cover_url: "https://res.cloudinary.com/dtbi4peax/image/upload/q_auto,f_auto/v1780198195/listings/listings/a26ecf98-f0c5-45ea-9101-733e7922406e/photo_0.jpg";
  created_at: "2026-05-31T03:29:52.618867+00:00";
  description: "This stunning 3 bedroom duplex is located at Chevron, Lekki. Features include a spacious living room, modern kitchen, master bedroom with en-suite bathroom complete with bathtub, free high-speed internet, 24/7 power supply, fitted wardrobes, and a private parking space. The estate has excellent security and is close to major shopping centres and schools.";
  document_status: "c_of_o";
  favorite_count: 0;
  furnished_status: null;
  id: "a26ecf98-f0c5-45ea-9101-733e7922406e";
  inspection_fee: 0;
  is_featured: false;
  is_verified: false;
  latitude: null;
  listing_type: "sale";
  location: "lekki lagos";
  longitude: null;
  negotiable: false;
  owner_id: "b01888cf-0443-4f20-94f9-aa5e25900af1";
  parking_spaces: null;
  price: 150000000;
  property_condition: null;
  property_media: [
    {
      created_at: "2026-05-31T03:30:00.766563+00:00";
      id: "20449038-d0ff-44e9-8aec-7d8890e750e1";
      is_cover: true;
      media_type: "photo";
      media_url: "https://res.cloudinary.com/dtbi4peax/image/upload/q_auto,f_auto/v1780198195/listings/listings/a26ecf98-f0c5-45ea-9101-733e7922406e/photo_0.jpg";
      property_id: "a26ecf98-f0c5-45ea-9101-733e7922406e";
    },
    {
      created_at: "2026-05-31T03:30:00.766563+00:00";
      id: "95aa08ba-fb94-447a-be51-23289b3f8968";
      is_cover: false;
      media_type: "photo";
      media_url: "https://res.cloudinary.com/dtbi4peax/image/upload/q_auto,f_auto/v1780198196/listings/listings/a26ecf98-f0c5-45ea-9101-733e7922406e/photo_1.jpg";
      property_id: "a26ecf98-f0c5-45ea-9101-733e7922406e";
    },
    {
      created_at: "2026-05-31T03:30:00.766563+00:00";
      id: "4d51b13d-b82e-4a29-b8ac-eba3490cad37";
      is_cover: false;
      media_type: "photo";
      media_url: "https://res.cloudinary.com/dtbi4peax/image/upload/q_auto,f_auto/v1780198197/listings/listings/a26ecf98-f0c5-45ea-9101-733e7922406e/photo_2.jpg";
      property_id: "a26ecf98-f0c5-45ea-9101-733e7922406e";
    },
    {
      created_at: "2026-05-31T03:30:00.766563+00:00";
      id: "aa5134c5-8f38-4441-b6be-5f7c59ced4b7";
      is_cover: false;
      media_type: "photo";
      media_url: "https://res.cloudinary.com/dtbi4peax/image/upload/q_auto,f_auto/v1780198198/listings/listings/a26ecf98-f0c5-45ea-9101-733e7922406e/photo_3.jpg";
      property_id: "a26ecf98-f0c5-45ea-9101-733e7922406e";
    },
    {
      created_at: "2026-05-31T03:30:00.766563+00:00";
      id: "f59479c5-4567-463a-85e7-bd41926eda05";
      is_cover: false;
      media_type: "photo";
      media_url: "https://res.cloudinary.com/dtbi4peax/image/upload/q_auto,f_auto/v1780198199/listings/listings/a26ecf98-f0c5-45ea-9101-733e7922406e/photo_4.jpg";
      property_id: "a26ecf98-f0c5-45ea-9101-733e7922406e";
    },
  ];
  property_size: null;
  property_size_unit: "sqm";
  property_type: "duplex";
  service_charge: 0;
  sqm: null;
  status: "pending";
  title: "5 Bedroom Duplex in Lekki";
  toilets: null;
  updated_at: "2026-05-31T03:29:52.618867+00:00";
  video_link: null;
  views_count: 0;
  year_built: null;
  youtube_link: null;
}

export interface PropertyFeedItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  primary_media: string | null;
  agent_name: string | null;
  property_type: string | null;
  listing_type: string | null;
  item_type: "property";
  created_at: string;
}

export interface RequestFeedItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  short_text: string;
  budget: number;
  preferred_location: string;
  item_type: "request";
  created_at: string;
  // optional UI-only fields (from SQL view)
  primary_media: null;
  agent_name: null;
  property_type: null;
  listing_type: null;
}

// export type FeedItem = PropertyFeedItem | RequestFeedItem;

export interface FeedItem {
  id: string;
  profile_id: string;
  price_duration: string;
  title: string;
  description: string;
  price: number;
  location: string;
  media_urls?: string[];
  primary_media?: string | null;
  saved?: boolean;
  item_type: "property" | "request";
  property_type?: string | null;
  listing_type?: string | null;
  status?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqm?: number | null;
  // Property owner
  user_name?: string | null;
  user_photo?: string | null;

  // Request fields
  preferred_location?: string | null;
  contact_option?: string | null;
  contact_phone?: string | null;

  created_at: string;

  score?: number;
  matchedFields?: string[];
  highPriority?: boolean;
  matchedRequestsCount?: number;
}

export interface GetFeedsParams {
  page?: number;
  limit?: number;
  search?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: string;
  maxPrice?: string;
  itemType?: FeedItemType | "all";
  status?: string;
  sortBy?: string;
  userId?: string;
}

export interface CreateRequestPayload {
  short_text: string;
  description: string;
  budget: number;
  preferred_location: string;
  contact_option: "whatsapp" | "call" | "email";
  contact_phone: string;
}

export interface Request {
  id?: string;

  user_id: string;

  short_text: string;
  description: string;

  budget: number;
  preferred_location: string;

  contact_option: "whatsapp" | "call" | "email";

  contact_phone: string;

  approval_status: "pending" | "approved" | "rejected";

  created_at?: string;
}

export interface SubmitIdVerificationPayload {
  document_type: "nin" | "drivers_license" | "passport" | "voters_card";

  document_number?: string;

  front_image: string;
  back_image?: string;
}

export interface SubmitDocumentVerificationPayload {
  document_name: string;
  document_url: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  avatarUri?: string;
  aboutMe?: string;
  whatsappNumber: string;
  phoneNumber?: string;
  location?: string;
  areasOperate?: string[];
  companyName: string;
  companyLocation: string;
  cac?: string;
  meansOfIdentification?: string;
  currentMode?: string;
  agentProfileCompleted: boolean;
}

export interface Profile {
  about_me: string;
  active_listings: number;
  areas_operate: string[];
  avatar_url: string;
  company_location: string;
  company_name: string;
  created_at: string;
  email: string;
  full_name: string;
  id: string;
  is_verified: boolean;
  location: string;
  phone_number: string;
  profile_views: number;
  updated_at: string;
  whatsapp_number: string;
  meansOfIdentification?: string;
  cac?: string;
}

export interface GetUserProfileResponse extends Profile {
  active_listings: number;
  profile_views: number;
  success: true;
}

// export type Step =
//   | "POST_PROPERTY"
//   | "CAMERA"
//   | "CHOOSE_SOURCE"
//   | "PHOTO_REVIEW"
//   | "PROPERTY_DETAILS"
//   | "PREVIEW"
//   | "SUCCESS";

export interface Photo {
  id: string;
  uri: string;
}

export interface PropertyDetails {
  title: string;
  type: string;
  price: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
}

export type CameraFacing = "front" | "back";
export type FlashMode = "off" | "on";

export const STEPS = {
  POST: "post",
  CAMERA: "camera",
  REVIEW: "review",
  DETAILS: "details",
  PREVIEW: "preview",
  SUCCESS: "success",
} as const;
export interface MatchedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string | null;
}

export type OpportunityCardProps = MatchedProperty & {
  requestId: string;
  matchedListingsCount: number;
};

// export interface MatchingBuyerRequest extends Request {
//   score: number;
//   matchedFields: string[];
//   matchedProperty: MatchedProperty;
//   matchedListingsCount: number;
// }

export type Step = (typeof STEPS)[keyof typeof STEPS];

export const durationLabels = {
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
  night: "Night",
};

export type MatchingBuyerRequest = {
  id: string;
  user_id: string;
  short_text: string;
  description: string;
  budget: number;
  preferred_location: string;
  contact_option: string;
  contact_phone: string;
  created_at: string;
  score: number;
  matchedFields: string[];
  highPriority: boolean;
  matchedListingsCount: number;
  matchedProperty: {
    id: string;
    title: string;
    location: string;
    price: number;
    image: string | null;
  };
};

export type MatchingProperty = {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string | null;
  score: number;
  matchedFields: string[];
  highPriority: boolean;
  matchedRequestsCount: number;
  matchedRequest: {
    id: string;
    short_text: string;
    budget: number;
    preferred_location: string;
  };
};

export type PropertyCreationErrorCode =
  | "UNAUTHORIZED"
  | "NO_MEDIA"
  | "IMAGE_NOT_FOUND"
  | "IMAGE_TOO_LARGE"
  | "INVALID_IMAGE_TYPE"
  | "NETWORK_ERROR"
  | "CLOUDINARY_ERROR"
  | "DATABASE_ERROR"
  | "MEDIA_DATABASE_ERROR"
  | "UNKNOWN_ERROR";