import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
}

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);


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
        <div className="w-full flex flex-col items-center gap-6">
            <label 
              className={`relative flex flex-col items-center justify-center w-full max-w-lg p-10 border-4 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-[#f4953e] bg-[#f1e9ed]' : 'border-[#a796c4]/50 bg-white hover:border-[#f4953e] hover:bg-[#f1e9ed]'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
                <UploadIcon className="w-16 h-16 text-[#87799e] mb-4" />
                <p className="text-xl font-semibold text-[#513369]">
                    <span className="font-bold text-[#f4953e]">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-1">Upload Your Favorite Pet Photo</p>
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleFileChange} 
                    accept="image/png, image/jpeg, image/webp"
                />
            </label>
            <div className="w-full max-w-lg text-left p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800">💡 Pro Tips for the Best Pawtrait:</h4>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-1 space-y-1">
                    <li>Use a photo with <span className="font-semibold">good lighting</span> (daylight is best!).</li>
                    <li>Make sure your pet's <span className="font-semibold">face is in clear focus</span>.</li>
                    <li><span className="font-semibold">Close-ups work better</span> than distant shots.</li>
                    <li>Avoid blurry or heavily filtered images.</li>
                </ul>
            </div>
        </div>
    );
};