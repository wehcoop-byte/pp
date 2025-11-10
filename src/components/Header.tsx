import React, { useState } from "react";
import logo from "../assets/shield-logo.png";

function ShieldInline({ className = "h-12 w-12" }) {
  // Inline SVG fallback in case the imported image fails to load
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Shield Logo"
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopOpacity="1" stopColor="#6b4fa8" />
          <stop offset="100%" stopOpacity="1" stopColor="#a787ff" />
        </linearGradient>
      </defs>
      <path
        d="M32 4l20 8v16c0 14.5-9.3 27.8-20 32-10.7-4.2-20-17.5-20-32V12l20-8z"
        fill="url(#g)"
      />
      <path
        d="M23 29c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9z"
        fill="#fff"
        opacity="0.9"
      />
      <circle cx="27" cy="27" r="2.4" fill="#6b4fa8" />
      <circle cx="37" cy="27" r="2.4" fill="#6b4fa8" />
      <path
        d="M26 36c2.2-1.6 5.8-1.6 8 0"
        stroke="#6b4fa8"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function Header() {
  const [imgOk, setImgOk] = useState(true);
  return (
    <header className="text-center mb-8 md:mb-12 w-full">
      <div className="flex justify-center items-center gap-3 sm:gap-4 mb-2">
        {imgOk ? (
          <img
            src={logo}
            alt="Pet Pawtrait Shield Logo"
            className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
            onError={() => setImgOk(false)}
          />
        ) : (
          <ShieldInline className="h-12 w-12 sm:h-16 sm:w-16" />
        )}
        <h1 className="text-4xl sm:text-5xl font-serif text-[#513369] tracking-tight">
          Pet Pawtr<span className="text-[#f4953e]">AI</span>t
        </h1>
      </div>
      <p className="text-md sm:text-lg text-[#87799e]">
        Your Pet's Personal AI Artist
      </p>
    </header>
  );
}
