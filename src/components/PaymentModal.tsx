// src/components/PaymentModal.tsx
import React, { useState, useEffect } from "react";

type FulfillmentKind = "digital" | "physical";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  amount: number;
  fulfillmentKind?: FulfillmentKind;
  productTitle?: string;
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="w-full p-2 bg-white border-2 border-[#a796c4] rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-[#f4953e] transition"
  />
);

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  amount,
  fulfillmentKind,
  productTitle,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSubmit();
      onClose();
    }, 1000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = value.match(/.{1,4}/g)?.join(" ") || "";
    if (formattedValue.length <= 19) setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    let formattedValue = value;
    if (value.length > 2) {
      formattedValue = `${value.slice(0, 2)} / ${value.slice(2, 4)}`;
    }
    if (formattedValue.length <= 7) setExpiry(formattedValue);
  };

  const isDigital = fulfillmentKind === "digital";
  const isFree = amount === 0;

  const blurb = isFree 
    ? "This is a free test download. No payment details required."
    : isDigital
      ? "Once payment is confirmed, your high-resolution 4K pawtrait will be ready to download immediately."
      : "We’ll prepare your print after payment. You’ll also receive a bonus digital copy to download.";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]"
      onClick={onClose}
      style={{ animationFillMode: "forwards" }}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md relative animate-[slideIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-serif text-center text-[#513369] mb-1">
          {isFree ? "Confirm Download" : "Secure Payment"}
        </h2>
        {productTitle && (
          <p className="text-center text-[#513369] font-semibold">{productTitle}</p>
        )}
        <p className="text-center text-gray-500 mb-6">{blurb}</p>

        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          {!isFree && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#513369] mb-1">Card Number</label>
                <Input value={cardNumber} onChange={handleCardNumberChange} placeholder="0000 0000 0000 0000" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#513369] mb-1">Cardholder Name</label>
                <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name" required />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-[#513369] mb-1">Expiry Date</label>
                  <Input value={expiry} onChange={handleExpiryChange} placeholder="MM / YY" required />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-semibold text-[#513369] mb-1">CVC</label>
                  <Input maxLength={4} value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))} placeholder="123" required />
                </div>
              </div>
            </>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full px-8 py-3 text-white font-bold text-lg rounded-full shadow-lg transition-all transform hover:scale-105 focus:outline-none disabled:bg-gray-400 disabled:cursor-wait ${
                isFree ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#f4953e] hover:bg-orange-600"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                isFree ? "Get for Free" : `Pay $${amount.toFixed(2)}`
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(-20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};