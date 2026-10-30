import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Public-site footer: Quick Links, Legal, Contact and social links.
// The About / How It Works / Contact / Privacy pages are plain HTML files in
// /public, so these use normal <a href> links (a full page load), not <Link>.

const linkClass = "text-gray-400 hover:text-white transition";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-gray-400 hover:text-white transition"
    >
      {children}
    </a>
  );
}

export default function SiteFooter() {
  return (
    <div className="bg-gray-950 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <Link to="/" className="inline-flex flex-col leading-none">
            <span className="text-xl font-bold text-white">RAPAVO</span>
            <span className="text-[11px] text-gray-400 mt-1">
              The <span className="text-green-500">Smarter</span> Way to Property
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <SocialLink href="https://youtube.com/@rapavoapp-b3j" label="YouTube">
              <svg {...iconProps}>
                <rect x="2" y="5" width="20" height="14" rx="4" />
                <path d="M10 9.5v5l4.5-2.5L10 9.5z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://www.facebook.com/profile.php?id=61590841934114" label="Facebook">
              <svg {...iconProps}>
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </SocialLink>
            <SocialLink href="https://www.instagram.com/rapavoapp?igsh=MW9lejI1a29rZ3Ztag==" label="Instagram">
              <svg {...iconProps}>
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </SocialLink>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-bold tracking-wider uppercase text-xs">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className={linkClass}>Home</Link></li>
            <li><a href="/about/" className={linkClass}>About Us</a></li>
            <li><a href="/how-it-works/" className={linkClass}>How It Works</a></li>
            <li><a href="/contact/" className={linkClass}>Contact</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-bold tracking-wider uppercase text-xs">Legal</h4>
          <ul className="space-y-2">
            <li><a href="/privacy/" className={linkClass}>Privacy Policy</a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-bold tracking-wider uppercase text-xs">Contact</h4>
          <ul className="space-y-2">
            <li>
              <a href="mailto:info@rapavo.com" className={linkClass}>info@rapavo.com</a>
            </li>
            <li>Lagos, Nigeria</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        &copy; 2026 Rapavo. All rights reserved.
      </div>
    </div>
  );
}