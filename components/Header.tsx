import React from 'react';

export const Header: React.FC = () => {
    const logoSrc = "https://storage.googleapis.com/aistudio-project-assets/app-assets/pet_pawtrait_logo.png";
    
    return (
        <header className="text-center mb-8 md:mb-12 w-full">
            <div className="flex justify-center items-center gap-3 sm:gap-4 mb-2">
                <img 
                  src={logoSrc}
                  alt="Pet Pawtrait Shield Logo"
                  className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                />

                <h1 className="text-4xl sm:text-5xl font-serif text-[#513369] tracking-tight">
                    Pet Pawtr<span className="text-[#f4953e]">AI</span>t
                </h1>
            </div>
             <p className="text-md sm:text-lg text-[#87799e]">Your Pet's Personal AI Artist</p>
        </header>
    );
};