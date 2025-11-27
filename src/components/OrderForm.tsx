// src/components/OrderForm.tsx
import React, { useState } from "react";
import { Product } from "../data/products";
import { Button } from "./Button";

type Props = {
  generatedImage: string;
  petName: string;
  product: Product;
  onSubmit: (shippingAddress: any | null) => void; // null for digital
};

export const OrderForm: React.FC<Props> = ({ generatedImage, petName, product, onSubmit }) => {
  const isDigital = product.fulfillment === "digital";

  // For physical shipments
  const [fullName, setFullName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("AU");
  // Common
  const [email, setEmail] = useState("");

  const canSubmitPhysical =
    fullName.trim() &&
    address1.trim() &&
    city.trim() &&
    state.trim() &&
    postcode.trim() &&
    country.trim() &&
    email.trim();

  const canSubmitDigital = email.trim(); // digital needs email for receipt/delivery

  const handleSubmit = () => {
    if (isDigital) {
      onSubmit(null);
    } else {
      const shippingAddress = {
        fullName,
        address1,
        address2,
        city,
        state,
        postcode,
        country,
        email,
      };
      onSubmit(shippingAddress);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-heading text-white mb-4 text-center">
        {isDigital ? "Digital Portrait" : "Shipping details"}
      </h2>

      <div className="flex justify-center mb-6">
        <img src={generatedImage} alt="Your portrait" className="max-h-64 rounded-xl border border-white/10 shadow" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
        {!isDigital && (
          <>
            <input
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
              placeholder="Address line 1"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
            />
            <input
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
              placeholder="Address line 2 (optional)"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <input
                className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <input
                className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                placeholder="Postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
            </div>
            <input
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
              placeholder="Country (ISO code)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </>
        )}

        {/* Always collect email for receipt and digital delivery */}
        <input
          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
          placeholder="Email for receipt and digital copy"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            text={isDigital ? "Continue to payment" : "Continue to payment"}
            disabled={isDigital ? !canSubmitDigital : !canSubmitPhysical}
          />
        </div>

        {isDigital ? (
          <p className="text-xs text-white/70">
            This is a digital-only product. No shipping required. Your upscaled high-resolution pawtrait will be available to download after purchase.
          </p>
        ) : (
          <p className="text-xs text-white/70">
            We’ll confirm your shipping details at checkout. You’ll also receive a bonus digital copy after purchase.
          </p>
        )}
      </div>
    </div>
  );
};
