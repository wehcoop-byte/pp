import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePawtraitStore } from "../store/usePawtraitStore";
import { OrderForm } from "../components/OrderForm";
import * as geminiService from "../services/geminiService";
import * as shopifyService from "../services/shopifyService";

export default function Checkout() {
  const navigate = useNavigate();
  const { highResGeneratedImage, watermarkedImage, selectedProduct } = usePawtraitStore();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!selectedProduct || !watermarkedImage) {
    navigate("/product", { replace: true });
    return null;
  }

  async function handleSubmit(address: any) {
    setBusy(true);
    setError(null);
    try {
      const source = highResGeneratedImage || watermarkedImage;
      const printReady = await geminiService.upscaleImage(source!);
      await shopifyService.createShopifyCheckout({
        productId: selectedProduct.id,
        customImageUrl: printReady,
        shippingAddress: address,
        fulfillmentKind: selectedProduct.fulfillment,
      });
      navigate("/order-complete");
    } catch (e: any) {
      setError(e?.message || "Could not process order. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      <OrderForm
        generatedImage={watermarkedImage}
        petName={""}
        product={selectedProduct}
        onSubmit={handleSubmit}
      />

      {busy && (
        <p className="mt-4 text-center text-[var(--brand-muted-lavender)]">Processing checkout…</p>
      )}
      {error && (
        <p className="mt-4 text-center text-red-400">{error}</p>
      )}
    </div>
  );
}