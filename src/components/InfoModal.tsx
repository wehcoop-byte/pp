import React from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#351B41] border-2 border-[#513369] rounded-3xl shadow-2xl p-6 lg:p-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
          <h2 className="text-3xl font-heading text-[var(--brand-accent-orange)]">{title}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            <X size={28} />
          </button>
        </div>

        {/* Content Body */}
        <div className="font-body text-lg text-[var(--brand-soft-white)] space-y-5 leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
};