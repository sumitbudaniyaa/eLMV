import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Official Swachh Bharat Abhiyan Vector Logo
 * Features the canonical spectacles emblem and the statutory motto "एक कदम स्वच्छता की ओर"
 */
export const SwachhBharatLogo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const heights = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 160 60"
        className={`${heights[size]} w-auto`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Swachh Bharat Abhiyan Logo"
      >
        {/* Left spectacle rim */}
        <circle cx="36" cy="24" r="18" stroke="#18181b" strokeWidth="3.5" fill="#ffffff" />
        <line x1="22" y1="24" x2="50" y2="24" stroke="#e4e4e7" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="36" y="27" textAnchor="middle" fontSize="9" fontWeight="700" fill="#18181b" fontFamily="system-ui">
          स्वच्छ
        </text>

        {/* Bridge */}
        <path d="M54 24 Q65 15 76 24" stroke="#18181b" strokeWidth="3" fill="none" />

        {/* Right spectacle rim */}
        <circle cx="94" cy="24" r="18" stroke="#18181b" strokeWidth="3.5" fill="#ffffff" />
        <line x1="80" y1="24" x2="108" y2="24" stroke="#e4e4e7" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="94" y="27" textAnchor="middle" fontSize="9" fontWeight="700" fill="#18181b" fontFamily="system-ui">
          भारत
        </text>

        {/* Temple earpiece curve */}
        <path d="M18 22 C14 16 8 18 4 24" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M112 22 C116 16 122 18 126 24" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Official Motto */}
        <text x="65" y="52" textAnchor="middle" fontSize="8" fontWeight="600" fill="#27272a" fontFamily="system-ui">
          एक कदम स्वच्छता की ओर
        </text>
      </svg>
    </div>
  );
};

/**
 * Official Digital India Vector Logo
 * Features the signature tricolor swoosh and motto "Power To Empower"
 */
export const DigitalIndiaLogo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const heights = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 170 54"
        className={`${heights[size]} w-auto`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Digital India Logo"
      >
        {/* Tricolor Emblem Circle / Swoosh */}
        <g transform="translate(4, 4)">
          {/* Orange top wave */}
          <path
            d="M23 2 C33 2 41 9 43 20 C37 14 29 11 20 12 C14 13 8 16 3 20 C6 9 14 2 23 2 Z"
            fill="#FF9933"
          />
          {/* Center Blue Accent */}
          <circle cx="23" cy="23" r="7" fill="#000080" />
          <circle cx="23" cy="23" r="4.5" fill="#ffffff" />
          <circle cx="23" cy="23" r="2.5" fill="#000080" />
          {/* Green bottom wave */}
          <path
            d="M3 26 C8 30 14 33 20 34 C29 35 37 32 43 26 C41 37 33 44 23 44 C14 44 6 37 3 26 Z"
            fill="#138808"
          />
          {/* WiFi Wave accents */}
          <path d="M16 8 A12 12 0 0 1 30 8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M19 11 A8 8 0 0 1 27 11" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </g>

        {/* Digital India Typography */}
        <text x="56" y="24" fontSize="16" fontWeight="900" fontStyle="italic" fill="#09090b" fontFamily="system-ui" letterSpacing="-0.3">
          Digital
        </text>
        <text x="110" y="24" fontSize="16" fontWeight="900" fontStyle="italic" fill="#FF9933" fontFamily="system-ui" letterSpacing="-0.3">
          India
        </text>

        {/* Official Motto */}
        <text x="57" y="38" fontSize="8" fontWeight="600" fill="#71717a" fontFamily="system-ui" letterSpacing="0.2">
          Power To Empower
        </text>
      </svg>
    </div>
  );
};

