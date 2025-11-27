import React from 'react';
import { InfoType } from '../App';
import logoUrl from '../assets/logo/pet-pawtrAIt-light-4k.svg'; // Using Light logo for Dark BG

interface HeaderProps {
  onOpenInfo: (type: InfoType) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenInfo }) => {
  const navLinks: { label: string; type: InfoType }[] = [
    { label: "Styles", type: "styles" },
    { label: "FAQ", type: "faq" },
    { label: "Delivery", type: "delivery" },
    { label: "Contact", type: "contact" },
  ];

  return (
    <header className="w-full py-6 px-4 flex flex-col items-center z-10 relative">
      {/* Logo Block */}
      <div className="mb-6 transition-transform duration-300 hover:scale-105 cursor-pointer">
        <img 
          src={logoUrl} 
          alt="Pet PawtrAIt" 
          className="h-16 md:h-24 object-contain drop-shadow-lg" 
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-wrap justify-center gap-4 md:gap-8 bg-black/20 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-xl">
        {navLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => onOpenInfo(link.type)}
            className="font-heading font-bold text-sm text-[var(--brand-soft-white)] hover:text-[var(--brand-accent-orange)] transition-colors uppercase tracking-widest"
          >
            {link.label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;