import React from 'react';
import { Style } from '../data/styles';

interface StyleSelectorProps {
    styles: Style[];
    selectedStyle: Style | null;
    onSelectStyle: (style: Style) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyle, onSelectStyle }) => {
    return (
        <div className="w-full">
            <label className="block text-lg font-serif text-[#513369] mb-1 text-left">Step 1: Choose Your Pet's Artistic Adventure</label>
            <p className="text-sm text-gray-500 mb-3 text-left">Which world does your pet belong in?</p>
            <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4">
                {styles.map((style) => (
                    <div
                        key={style.id}
                        onClick={() => onSelectStyle(style)}
                        className={`cursor-pointer flex-shrink-0 w-32 group transition-all duration-200 ${selectedStyle?.id === style.id ? 'transform scale-105' : 'hover:transform hover:scale-105'}`}
                        aria-label={`Select style: ${style.name}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectStyle(style)}

                    >
                        <div className={`aspect-square w-full rounded-lg overflow-hidden border-4 transition-colors duration-200 ${selectedStyle?.id === style.id ? 'border-[#f4953e]' : 'border-transparent group-hover:border-[#f4953e]/50'}`}>
                            <img src={style.thumbnailUrl} alt={style.name} className="w-full h-full object-cover" />
                        </div>
                        <p className={`mt-2 text-sm font-semibold text-center transition-colors duration-200 ${selectedStyle?.id === style.id ? 'text-[#513369]' : 'text-gray-600 group-hover:text-[#513369]'}`}>
                            {style.name}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};