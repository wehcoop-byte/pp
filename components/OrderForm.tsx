import React, { useState } from 'react';
import { Button } from './Button';
import { Product } from '../data/products';

interface OrderFormProps {
    generatedImage: string;
    petName: string;
    product: Product;
    onSubmit: (shippingAddress: { [key: string]: string }) => void;
}

const InputField: React.FC<{ id: string; label: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean }> = ({ id, label, placeholder, value, onChange, required = true }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-[#513369] mb-1">{label}</label>
        <input
            id={id}
            type="text"
            value={value}
            onChange={onChange}
            className="w-full p-2 bg-white border-2 border-[#a796c4] rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-[#f4953e] transition"
            placeholder={placeholder}
            required={required}
        />
    </div>
);

export const OrderForm: React.FC<OrderFormProps> = ({ generatedImage, petName, product, onSubmit }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('USA');

    const isDigitalProduct = product.id === 'digital-pawtrait';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const shippingAddress = isDigitalProduct ? { name: name || 'Digital Customer' } : { name, address, city, state, zip, country };
        onSubmit(shippingAddress);
    };

    const productName = `${petName || 'Your Pet'}'s ${product.name}`;
    const price = product.price;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border-2 border-[#a796c4]/30">
            <h2 className="text-3xl font-serif text-center text-[#513369] mb-6">Complete Your Order</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left side: Image and Order Summary */}
                <div className="flex flex-col items-center">
                    <img src={generatedImage} alt="Generated Portrait" className="w-full max-w-sm rounded-lg shadow-lg border-4 border-[#a796c4]/30" />
                    <div className="mt-4 text-center p-4">
                        <h3 className="text-xl font-serif text-[#513369]">{productName}</h3>
                        <p className="text-2xl font-bold text-[#f4953e]">${price.toFixed(2)}</p>
                        {!isDigitalProduct && <p className="text-sm text-gray-500 mt-2">plus shipping & taxes</p>}
                    </div>
                </div>

                {/* Right side: Shipping/Payment Form */}
                <form onSubmit={handleSubmit} className="flex flex-col justify-center">
                    {isDigitalProduct ? (
                         <div className="text-center p-8 bg-gray-50 rounded-lg">
                            <h3 className="text-xl font-serif text-[#513369] mb-2">Ready for Download!</h3>
                            <p className="text-gray-600">
                                You are purchasing the high-resolution digital file. No shipping is required. After payment, you'll be able to download your pawtrait immediately.
                            </p>
                            <InputField id="name" label="Full Name (For billing)" placeholder="Pawblo Picasso" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                             <h3 className="text-xl font-serif text-center text-[#513369]">Shipping Information</h3>
                            <InputField id="name" label="Full Name" placeholder="Pawblo Picasso" value={name} onChange={(e) => setName(e.target.value)} />
                            <InputField id="address" label="Street Address" placeholder="123 Puppy Lane" value={address} onChange={(e) => setAddress(e.target.value)} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField id="city" label="City" placeholder="Catifornia" value={city} onChange={(e) => setCity(e.target.value)} />
                                <InputField id="state" label="State / Province" placeholder="CA" value={state} onChange={(e) => setState(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField id="zip" label="Zip / Postal Code" placeholder="90210" value={zip} onChange={(e) => setZip(e.target.value)} />
                                <InputField id="country" label="Country" placeholder="USA" value={country} onChange={(e) => setCountry(e.target.value)} />
                            </div>
                        </div>
                    )}
                    <div className="mt-6">
                        <Button type="submit" text="Proceed to Payment" />
                    </div>
                </form>
            </div>
        </div>
    );
};
