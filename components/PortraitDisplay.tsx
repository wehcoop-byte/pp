import React, { useState, useRef, useCallback, MouseEvent, TouchEvent } from 'react';

interface PortraitDisplayProps {
    originalImage: string;
    generatedImage: string;
    likenessScore: number | null;
}

const SliderHandle: React.FC = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center pointer-events-none">
        <svg className="w-6 h-6 text-[#513369]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
    </div>
);


export const PortraitDisplay: React.FC<PortraitDisplayProps> = ({ originalImage, generatedImage, likenessScore }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    const handleMove = useCallback((clientX: number) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(position);
    }, []);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isDraggingRef.current = true;
        handleMove(e.clientX);
    };

    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        isDraggingRef.current = true;
        handleMove(e.touches[0].clientX);
    };

    const handleEnd = useCallback(() => {
        isDraggingRef.current = false;
    }, []);
    
    // Add listeners to the window to handle dragging outside the component
    React.useEffect(() => {
        const handleWindowMouseMove = (e: globalThis.MouseEvent) => handleMove(e.clientX);
        const handleWindowTouchMove = (e: globalThis.TouchEvent) => handleMove(e.touches[0].clientX);

        if (isDraggingRef.current) {
            window.addEventListener('mousemove', handleWindowMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleWindowTouchMove);
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleWindowTouchMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDraggingRef.current, handleMove, handleEnd]);

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
            <div
                ref={containerRef}
                className="relative w-full aspect-square select-none overflow-hidden rounded-lg shadow-2xl border-4 border-[#f4953e] bg-gray-200 cursor-e-resize"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {/* Original Image */}
                <img
                    src={originalImage}
                    alt="Original Pet Photo"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    draggable="false"
                />
                
                {/* Generated Image (clipped) */}
                <div
                    className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <img
                        src={generatedImage}
                        alt="Generated Pet Portrait"
                        className="w-full h-full object-cover pointer-events-none"
                        draggable="false"
                    />
                </div>
                
                 {/* Labels */}
                <span className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">The Masterpiece</span>
                <span className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">The Muse</span>


                {/* Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-white/80 backdrop-blur-sm cursor-e-resize"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                   <SliderHandle/>
                </div>
            </div>

            {likenessScore !== null && (
                <div className="text-center p-4 bg-white rounded-lg shadow-md border-2 border-[#a796c4]/30">
                    <span className="text-md font-semibold text-gray-600">Final Likeness Score</span>
                    <p className="text-3xl font-bold text-green-700">{(likenessScore * 100).toFixed(1)}%</p>
                </div>
            )}
        </div>
    );
};