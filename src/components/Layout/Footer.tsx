import type { ReactNode } from "react";
import { useShell } from "./ShellContext";

interface FooterItem {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

const shieldCheck = (
  <>
    <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
    <path d="M9 12l2 2 4-4" />
  </>
);

const users = (
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

const lock = (
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>
);

const mapPin = (
  <>
    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </>
);

const priceTag = (
  <>
    <path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3.24H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83z" />
    <circle cx="7.5" cy="7.5" r="1.25" fill="currentColor" stroke="none" />
  </>
);

function FooterIcon({ children }: { children: ReactNode }) {
  return (
    <span className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

const ITEMS: FooterItem[] = [
  { icon: shieldCheck, title: "Verified Listings", subtitle: "Quality you can trust" },
  { icon: users, title: "Trusted Agents", subtitle: "Work with professionals" },
  { icon: lock, title: "Secure & Reliable", subtitle: "Your data is protected" },
  { icon: mapPin, title: "All in One Place", subtitle: "Buy, rent, invest or sell" },
];

const BUYER_ITEMS: FooterItem[] = [
  { icon: shieldCheck, title: "Verified Properties", subtitle: "Every listing checked" },
  { icon: users, title: "Trusted Agents", subtitle: "Work with professionals" },
  { icon: lock, title: "Secure Transactions", subtitle: "Your data is protected" },
  { icon: priceTag, title: "Best Price Guarantee", subtitle: "Fair value, every time" },
];

function FooterRow({ items, heading }: { items: FooterItem[]; heading?: ReactNode }) {
  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="max-w-7xl mx-auto">
        {heading}
        <div className="flex flex-col items-center sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4">
          <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:gap-6 w-full sm:w-auto">
            {items.map((item) => (
              <div key={item.title} className="flex items-center gap-2">
                <FooterIcon>{item.icon}</FooterIcon>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                  <p className="text-[11px] text-gray-500">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xl text-green-600 text-center" style={{ fontFamily: "'Caveat', cursive" }}>
            A Smarter Tomorrow
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const { showBuyerFooterExtra } = useShell();

  if (showBuyerFooterExtra) {
    return (
      <footer className="mt-auto">
        <FooterRow
          items={BUYER_ITEMS}
          heading={
            <span className="inline-block bg-green-600 text-white text-sm font-bold rounded-full px-4 py-1.5 mb-4">
              Why Buyers Choose Rapavo
            </span>
          }
        />
      </footer>
    );
  }

  return (
    <footer className="mt-auto">
      <FooterRow items={ITEMS} />
    </footer>
  );
}