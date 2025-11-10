import React from 'react';
import { Product } from '../data/products';
import { Button } from './Button';
import { LoadingIndicator } from './LoadingIndicator';

interface ProductSelectorProps {
    generatedImage: string;
    products: Product[];
    onSelectProduct: (product: Product) => void;
    onBack: () => void;
    isLoading: boolean;
}

const ProductCard: React.FC<{ product: Product, onSelect: () => void }> = ({ product, onSelect }) => (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md border-2 border-[#a796c4]/30 text-center transition-transform transform hover:scale-105">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-contain mb-4 rounded-md" />
        <h3 className="text-lg font-serif text-[#513369]">{product.name}</h3>
        <p className="text-sm text-gray-600 flex-grow mb-2">{product.description}</p>
        <p className="text-xl font-bold text-[#513369] mb-4">${product.price.toFixed(2)}</p>
        <Button onClick={onSelect} text="Select" />
    </div>
);

export const ProductSelector: React.FC<ProductSelectorProps> = ({ generatedImage, products, onSelectProduct, onBack, isLoading }) => {
    return (
        <div className="w-full max-w-5xl mx-auto p-6">
            <h2 className="text-3xl font-serif text-center text-[#513369] mb-2">Step 2: Bring Your Art to Life</h2>
            <p className="text-center text-gray-600 mb-8">Your masterpiece deserves to be shown off. Select a premium product to feature your pet's one-of-a-kind pawtrait.</p>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 flex-shrink-0">
                     <img src={generatedImage} alt="Generated Portrait" className="w-full rounded-lg shadow-lg border-4 border-[#f4953e] p-1 bg-white" />
                </div>
                <div className="w-full md:w-2/3">
                    {/* Fix: Add isLoading prop to conditionally render a loading indicator or the product list. */}
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <LoadingIndicator message="Fetching products..." />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} onSelect={() => onSelectProduct(product)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="text-center mt-8">
                <button onClick={onBack} className="text-gray-600 hover:text-[#513369] font-semibold transition">
                    &larr; Back to Pawtrait
                </button>
            </div>
        </div>
    );
};