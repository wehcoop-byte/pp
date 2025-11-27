import React, { useEffect } from 'react';

interface TechInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TechInfoModal: React.FC<TechInfoModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tech-info-title"
        >
            <div 
                className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl relative animate-[slideIn_0.3s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 id="tech-info-title" className="text-3xl font-serif text-center text-[#513369] mb-4">Our Proprietary Pawtrait Process</h2>
                <div className="text-gray-600 space-y-4">
                    <p>
                       Creating a genuine work of art that captures your pet's spirit is a complex challenge. That's why we developed a unique, multi-stage AI orchestration to ensure every pawtrait is a masterpiece.
                    </p>
                    <div className="p-4 bg-gray-50 border rounded-lg">
                        <h3 className="font-semibold text-lg text-[#513369] mb-2">1. The Pawtrait Generation Engine ✨</h3>
                        <p>
                            Your journey begins with our proprietary generation model. Custom-trained on a vast library of classical and modern art, this AI doesn't just apply a filter—it acts as a true digital artist. It interprets your chosen style and meticulously renders a completely new image from scratch, inspired by your pet's photo.
                        </p>
                    </div>
                     <div className="p-4 bg-gray-50 border rounded-lg">
                        <h3 className="font-semibold text-lg text-[#513369] mb-2">2. The Likeness Verification Model 🧐</h3>
                        <p>
                           Next, a second, highly specialized AI—our Likeness Verification Model—is brought in. Its sole purpose is to act as an expert critic. It performs a multi-point analysis, comparing the generated art to the original photo. It scrutinizes key features, unique markings, and even fur texture to calculate a precise, objective likeness score.
                        </p>
                    </div>
                     <div className="p-4 bg-gray-50 border rounded-lg">
                        <h3 className="font-semibold text-lg text-[#513369] mb-2">3. The Automated Feedback Loop 🎨</h3>
                        <p>
                            We demand perfection. If the likeness score from our critic AI doesn't meet the strict Pet PawtrAI quality standard, the artwork is rejected. The entire process restarts in an automated feedback loop, with the artist AI using the critique to create a new, improved version. This complex orchestration repeats until the pawtrait is a perfect blend of artistic flair and true-to-life resemblance.
                        </p>
                    </div>
                </div>
                 <div className="text-center mt-6">
                    <button onClick={onClose} className="px-6 py-2 bg-[#f4953e] text-white font-bold rounded-full shadow-lg hover:bg-orange-600 transition-transform transform hover:scale-105">
                        Awesome!
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-20px) scale(0.98); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};