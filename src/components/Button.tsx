
import React from 'react';

interface ButtonProps {
    onClick?: () => void;
    text: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ onClick, text, disabled = false, type = 'button' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="px-8 py-3 bg-[#f4953e] text-white font-bold text-lg rounded-full shadow-lg hover:bg-orange-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-400 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
        >
            {text}
        </button>
    );
};
