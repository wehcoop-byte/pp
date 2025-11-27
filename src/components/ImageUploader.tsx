import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Star } from 'lucide-react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onImageUpload(e.dataTransfer.files[0]);
        }
    }, [onImageUpload]);

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    return (
        <div className="w-full flex flex-col items-center gap-8">
            {/* 3D Interactive Drop Zone */}
            <label 
              className={`interactive-card relative flex flex-col items-center justify-center w-full max-w-xl aspect-[4/3] sm:aspect-[2/1] 
                border-4 border-dashed rounded-3xl cursor-pointer transition-all duration-300 group
                ${isDragging 
                    ? 'border-[var(--brand-accent-orange)] bg-white/10 scale-105 shadow-[0_0_30px_rgba(244,149,62,0.3)]' 
                    : 'border-white/20 bg-black/20 hover:border-[var(--brand-accent-orange)] hover:bg-white/5'
                }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
                <div className={`p-5 rounded-full bg-white/5 mb-4 transition-transform duration-300 ${isDragging ? 'scale-110 bg-[var(--brand-accent-orange)] text-black' : 'text-[var(--brand-accent-orange)] group-hover:scale-110 group-hover:text-white'}`}>
                    <UploadCloud size={48} strokeWidth={1.5} />
                </div>
                
                <p className="text-2xl font-heading text-white text-center mb-2">
                    <span className="text-[var(--brand-accent-orange)] font-bold">Click to upload</span> or drag & drop
                </p>
                <p className="text-[var(--brand-muted-lavender)] text-sm font-body">Supported formats: JPG, PNG, WEBP</p>
                
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleFileChange} 
                    accept="image/png, image/jpeg, image/webp"
                />
            </label>

            {/* Pro Tips Card */}
            <div className="w-full max-w-xl p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Star className="text-[var(--brand-accent-orange)] fill-orange-500" size={20} />
                    <h4 className="font-heading text-lg text-white tracking-wide">Tips for a Perfect Pawtrait</h4>
                </div>
                <ul className="space-y-3 text-sm text-[var(--brand-soft-white)] opacity-80 font-body">
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent-orange)] mt-1.5" />
                        <span>Use natural daylight — avoid harsh flash or dark shadows.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent-orange)] mt-1.5" />
                        <span>Ensure eyes and ears are fully visible and in focus.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent-orange)] mt-1.5" />
                        <span>Get on their eye level! Top-down angles can distort features.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};