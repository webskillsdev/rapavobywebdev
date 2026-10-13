import { useState } from "react";
import ResidentialShareCard, {
  CARD_HEIGHT,
  CARD_WIDTH,
  type ResidentialShareCardData,
} from "../components/share-cards/ResidentialShareCard";

// TEMPORARY developer page (route: /card-preview).
// It shows the Residential share card with sample data, including the awkward cases
// (very long text, no agent photo, not verified, missing values).
// It is removed once the card is connected to real property data and the share button.

const BASE_URL = "https://app.rapavo.com/share/";

const CASES: { name: string; data: ResidentialShareCardData }[] = [
  {
    name: "4-bedroom house (sale, verified agent, 12 photos)",
    data: {
      title: "Luxury 4 Bedroom Duplex with BQ",
      listingType: "sale",
      price: 85000000,
      location: "Lekki, Lagos",
      imageUrl: "/sample/house.jpg",
      photoCount: 12,
      bedrooms: 4,
      bathrooms: 5,
      toilets: 6,
      sqm: 450,
      agentName: "Lawrence Egbo",
      agentAvatarUrl: "/sample/agent.jpg",
      agentVerified: true,
      shareUrl: `${BASE_URL}luxury-4-bedroom-duplex-with-bq-0b6c1f52-8a3e-4c1d-9d2e-5f1a7c3b9e10`,
    },
  },
  {
    name: "3-bedroom house (rent, no verification, no agent photo)",
    data: {
      title: "3 bedroom flats at Ajah Estate",
      listingType: "rent",
      price: 3500000,
      location: "Ajah, Lagos",
      imageUrl: "/sample/house.jpg",
      photoCount: 5,
      bedrooms: 3,
      bathrooms: 3,
      toilets: 4,
      sqm: null,
      agentName: "Kate williams",
      agentAvatarUrl: null,
      agentVerified: false,
      shareUrl: `${BASE_URL}3-bedroom-flats-at-ajah-estate-1c9d2e5f-1a7c-4b9e-8a3e-0b6c1f528a3e`,
    },
  },
  {
    name: "Very long title and very long location",
    data: {
      title:
        "Exquisitely finished and fully serviced 5 bedroom detached smart home with swimming pool, cinema room, boys quarters and 24 hour power in a gated estate",
      listingType: "sale",
      price: 450000000,
      location:
        "Banana Island Road, Off Glover Road, Ikoyi, Eti-Osa Local Government Area, Lagos Island, Lagos State, Nigeria",
      imageUrl: "/sample/house.jpg",
      photoCount: 24,
      bedrooms: 5,
      bathrooms: 6,
      toilets: 7,
      sqm: 1200,
      agentName: "Oluwaseun Adebayo-Christopherson Properties and Estates Limited",
      agentAvatarUrl: null,
      agentVerified: true,
      shareUrl: `${BASE_URL}exquisitely-finished-and-fully-serviced-5-bedroom-detached-smart-home-0b6c1f52-8a3e-4c1d-9d2e-5f1a7c3b9e10`,
    },
  },
  {
    name: "Missing values (no photo, no price, one photo, no stats)",
    data: {
      title: "Self-contain in Yaba",
      listingType: "shortlet",
      price: null,
      location: "Yaba, Lagos",
      imageUrl: null,
      photoCount: 1,
      bedrooms: null,
      bathrooms: 1,
      toilets: null,
      sqm: null,
      agentName: null,
      agentAvatarUrl: null,
      agentVerified: false,
      shareUrl: `${BASE_URL}self-contain-in-yaba-0b6c1f52-8a3e-4c1d-9d2e-5f1a7c3b9e10`,
    },
  },
];

const SCALES = [0.3, 0.5, 1];

export default function CardPreviewPage() {
  const [scale, setScale] = useState(0.3);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-[1500px] mx-auto">
        <h1 className="text-xl font-bold text-gray-900">Residential share card preview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Temporary developer page. Each card is {CARD_WIDTH} × {CARD_HEIGHT} px, shown scaled down.
        </p>

        <div className="mt-4 flex gap-2">
          {SCALES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium border ${
                scale === s ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {Math.round(s * 100)}%
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-8 items-start">
          {CASES.map((c) => (
            <div key={c.name}>
              <p className="text-sm font-semibold text-gray-700 mb-2" style={{ maxWidth: CARD_WIDTH * scale }}>
                {c.name}
              </p>
              <div
                style={{
                  width: CARD_WIDTH * scale,
                  height: CARD_HEIGHT * scale,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                }}
              >
                <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                  <ResidentialShareCard data={c.data} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}