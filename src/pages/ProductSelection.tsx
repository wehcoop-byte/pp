
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePawtraitStore } from "../store/usePawtraitStore";
import { useProductStore } from "../store/products";
import { ProductSelector } from "../components/ProductSelector";

export default function ProductSelection() {
  const navigate = useNavigate();
  const { watermarkedImage, setSelectedProduct } = usePawtraitStore();
  const { products, loading, load } = useProductStore();

  useEffect(() => { load(); }, [load]);

  if (!watermarkedImage) {
    navigate("/create", { replace: true });
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      <ProductSelector
        generatedImage={watermarkedImage}
        products={products}
        isLoading={loading}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          navigate("/checkout");
        }}
        onBack={() => navigate("/create")}
      />
    </div>
  );
}
