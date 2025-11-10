
import React from 'react';

const LoadingSpinner: React.FC = () => (
    <div className="w-20 h-20 border-8 border-dashed rounded-full animate-spin border-[#f4953e]"></div>
);

interface LoadingIndicatorProps {
    message: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <LoadingSpinner />
            <p className="mt-6 text-xl font-semibold text-[#513369] animate-pulse">{message}</p>
        </div>
    );
};
