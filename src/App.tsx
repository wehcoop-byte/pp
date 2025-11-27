import React, { useState, useCallback, useEffect } from "react";
// Global styles (brand background, glass look, tokens)
import "./styles/globals.css";
import { ErrorBoundary } from "./ErrorBoundary";

// Components
import Header from "./components/Header";
import { ImageUploader } from "./components/ImageUploader";
import { PortraitDisplay } from "./components/PortraitDisplay";
import { Button } from "./components/Button";
import { ProductSelector } from "./components/ProductSelector";
import { StyleSelector } from "./components/StyleSelector";
import { OrderForm } from "./components/OrderForm";
import { PaymentModal } from "./components/PaymentModal";
import { TechInfoModal } from "./components/TechInfoModal";
import { InfoModal } from "./components/InfoModal"; // NEW Component
import { GenerationProgress, StepKey } from "./components/GenerationProgress";
import LandingPage from "./components/landingpage";

// Services & Data
import * as geminiService from "./services/geminiService";
import * as shopifyService from "./services/shopifyService";
import { Product } from "./data/products";
import { Style, STYLES } from "./data/styles";
import { ChevronLeft } from "lucide-react";

// ------------------------ Helper Functions ------------------------

const BASE_PROMPT = "It is essential to preserve the pet's exact likeness, unique features, markings, and fur color.";
const NEGATIVE_PROMPT = "Avoid: poorly drawn, deformed, extra limbs, blurry, pixelated, cartoon, 3d render, anime, watermark.";

function getHeaderNumber(anyRes: any, name: string): number | null {
  try {
    const h = anyRes?.headers?.get?.(name);
    if (!h) return null;
    const num = Number(h);
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

// ------------------------ MAIN APP ------------------------

type AppState =
  | "idle"
  | "image_uploaded"
  | "generating"
  | "success"
  | "error"
  | "product_selection"
  | "ordering"
  | "checkout_redirecting"
  | "order_complete";

export type InfoType = "styles" | "faq" | "terms" | "delivery" | "contact" | null;

const MAX_REFINES = 2;

const App: React.FC = () => {
  // --- Core Data ---
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [highResGeneratedImage, setHighResGeneratedImage] = useState<string | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);

  // --- Flow State ---
  const [appState, setAppState] = useState<AppState>("idle");
  const [hasStarted, setHasStarted] = useState(false);
  // New state for Info Modals
  const [activeInfoModal, setActiveInfoModal] = useState<InfoType>(null);

  // --- Selections ---
  const [petName, setPetName] = useState("");
  const [background, setBackground] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- UI Status ---
  const [generationStep, setGenerationStep] = useState<StepKey>("PREPARING");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [likenessScore, setLikenessScore] = useState<number | null>(null);

  // --- Shop Data ---
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [digitalDownloadUrl, setDigitalDownloadUrl] = useState<string | null>(null);

  // --- Refinement Data ---
  const [refineCount, setRefineCount] = useState(0);
  const [refineDraft, setRefineDraft] = useState("");
  const [refineStaged, setRefineStaged] = useState<string | null>(null);
  const [refineStagedWM, setRefineStagedWM] = useState<string | null>(null);
  const [refineInFlight, setRefineInFlight] = useState(false);

  // --- Initialization & Effects ---

  useEffect(() => {
    const syncFromHash = () => {
      const h = window.location.hash?.toLowerCase();
      if (h === "#get-started" || h === "#upload") setHasStarted(true);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const list = await shopifyService.fetchProducts();
        setProducts(list);
      } catch {
        setError("Could not load products. Please refresh.");
      } finally {
        setIsFetchingProducts(false);
      }
    }
    load();
  }, []);

  // ------------------------ Navigation Logic ------------------------

  const handleBack = () => {
    setError("");
    switch (appState) {
      case "image_uploaded":
        handleReset();
        break;
      case "success":
        setAppState("image_uploaded");
        setHighResGeneratedImage(null);
        setWatermarkedImage(null);
        setRefineCount(0);
        setRefineStaged(null);
        break;
      case "product_selection":
        setAppState("success");
        setSelectedProduct(null);
        break;
      case "ordering":
        setAppState("product_selection");
        break;
      case "error":
        handleReset();
        break;
      default:
        handleReset();
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setWatermarkedImage(null);
    setHighResGeneratedImage(null);
    setSelectedProduct(null);
    setSelectedStyle(null);
    setPetName("");
    setBackground("");
    setLikenessScore(null);
    setAttemptsRemaining(null);
    setError("");
    setRefineCount(0);
    setRefineDraft("");
    setRefineStaged(null);
    setRefineStagedWM(null);
    setRefineInFlight(false);
    setDigitalDownloadUrl(null);
    setAppState("idle");
    setHasStarted(false);
    window.history.replaceState({}, "", window.location.pathname + window.location.search);
  };

  // ------------------------ Handlers (Upload/Gen/Shop) ------------------------

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setHasStarted(true);
      setAppState("image_uploaded");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const buildPrompt = (style: Style, extra?: string) => {
    const core = style.prompt
      .replace("{{Pet Name}}", petName || "My Pet")
      .replace("{{background}}", background || "a complementary background");
    const refine = extra?.trim() ? ` Refinement request: ${extra.trim()}.` : "";
    return `${core}. ${BASE_PROMPT} ${NEGATIVE_PROMPT}.${refine}`.trim();
  };

  const runGeneration = useCallback(
    async (prompt: string, sourceBase64: string, styleId: string, petName: string, email?: string) => {
      setGenerationStep("GENERATING");
      setStatusMessage("Generating portrait…");

      const gen = await geminiService.generatePetPortrait({ prompt, imageBase64: sourceBase64, styleId, petName, email });
      if (!gen.ok) throw new Error(gen.error || "Generate failed");

      const generated = gen.data.imageBase64;
      if (!generated) throw new Error("No image returned.");

      const remain = getHeaderNumber(gen, "X-Gen-Attempts-Remaining");
      if (typeof remain === "number") setAttemptsRemaining(remain);

      if (gen.data.likenessScore) setLikenessScore(gen.data.likenessScore);

      setGenerationStep("FINISHING");
      setStatusMessage("Watermarking…");
      const wm = await geminiService.addWatermark(generated);
      return { generated, wm };
    },
    [originalImage]
  );

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage) return setError("Please upload a photo first.");
    if (!selectedStyle) return setError("Please select a style.");

    setAppState("generating");
    setGenerationStep("PREPARING");
    setStatusMessage("Preparing your pawtrAIt…");
    setError("");

    try {
      const finalPrompt = buildPrompt(selectedStyle);
      const { generated, wm } = await runGeneration(finalPrompt, originalImage, selectedStyle.id, petName, "");

      setHighResGeneratedImage(generated);
      setWatermarkedImage(wm);
      setRefineCount(0);
      setRefineDraft("");
      setRefineStaged(null);
      setRefineStagedWM(null);
      setRefineInFlight(false);
      setDigitalDownloadUrl(null);
      setAppState("success");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setAppState("error");
    }
  }, [originalImage, selectedStyle, petName, runGeneration]);

  const canRefine = refineCount < MAX_REFINES;

  const handleRefineSubmit = async () => {
    if (!canRefine) return;
    if (!originalImage || !selectedStyle) return setError("Missing image or style data.");

    setRefineInFlight(true);
    setAppState("generating");
    setGenerationStep("PREPARING");
    setStatusMessage("Applying your refinements…");
    setError("");

    try {
      const prompt = buildPrompt(selectedStyle, refineDraft);
      const sourceForRefinement = highResGeneratedImage || originalImage;
      const { generated, wm } = await runGeneration(prompt, sourceForRefinement, selectedStyle.id, petName);

      setRefineStaged(generated);
      setRefineStagedWM(wm);
      setAppState("success");
    } catch (err: any) {
      setError(err.message || "Refinement failed. Please try again.");
      setAppState("error");
    } finally {
      setRefineInFlight(false);
    }
  };

  const handleRefineAccept = () => {
    if (!refineStaged || !refineStagedWM) return;
    setHighResGeneratedImage(refineStaged);
    setWatermarkedImage(refineStagedWM);
    setRefineStaged(null);
    setRefineStagedWM(null);
    setRefineDraft("");
    setRefineCount((n) => Math.min(MAX_REFINES, n + 1));
  };

  const handleRefineRevert = () => {
    setRefineStaged(null);
    setRefineStagedWM(null);
  };

  const handleInitiateCheckout = (address: any) => {
    setShippingAddress(address);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedProduct || !highResGeneratedImage) return;
    setAppState("checkout_redirecting");

    try {
      const printReady = await geminiService.upscaleImage(highResGeneratedImage);
      await shopifyService.createShopifyCheckout({
        productId: selectedProduct.id,
        customImageUrl: printReady,
        shippingAddress,
        fulfillmentKind: selectedProduct.fulfillment,
      });
      setDigitalDownloadUrl(printReady);
      setAppState("order_complete");
    } catch {
      setError("Could not process order. Please contact support.");
      setAppState("error");
    }
  };

  // ------------------------ Info Modal Content ------------------------

  const getModalContent = () => {
    switch (activeInfoModal) {
      case "styles":
        return (
          <div>
            <p>Our AI styles are specifically tuned to capture the personality of your pet while applying artistic effects.</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              {STYLES.map(s => <li key={s.id}><strong>{s.label}:</strong> {s.description}</li>)}
            </ul>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-4">
            <h3 className="font-heading text-lg text-white">How long does it take?</h3>
            <p>Generation takes about 30-60 seconds. Physical prints usually ship within 3-5 business days.</p>
            <h3 className="font-heading text-lg text-white">What kind of photo is best?</h3>
            <p>A clear, well-lit photo where your pet is facing the camera works best. Avoid blurry or dark photos.</p>
          </div>
        );
      case "delivery":
        return (
          <div className="space-y-4">
            <p>We partner with global printing services to deliver high-quality prints worldwide.</p>
            <h3 className="font-heading text-lg text-white">Returns Policy</h3>
            <p>As these are custom, one-of-a-kind artworks created specifically for you, we cannot accept returns based on change of mind. However, if your print arrives damaged or has a manufacturing defect, please contact us immediately for a replacement.</p>
          </div>
        );
      case "terms":
        return (
          <div className="space-y-2 text-sm">
            <h3 className="font-heading text-lg text-white">Terms & Conditions / Privacy</h3>
            <p>By uploading an image, you represent that you own the rights to that image. You grant Pawtrait a license to use the image solely for the purpose of generating your artwork and fulfilling your order.</p>
            <p>We value your privacy. Your original photos are stored securely and temporarily. We do not sell your data to third parties. Generated images may be viewed by our team for quality control purposes.</p>
            <p className="text-xs opacity-70 mt-4">Full legal text would be placed here in a production environment.</p>
          </div>
        );
      case "contact":
        return (
          <div className="space-y-4">
            <p>Have an issue or a question? We're here to help!</p>
            <p>Email us at: <a href="mailto:support@pawtrait.com" className="text-[var(--brand-accent-orange)] underline">support@pawtrait.com</a></p>
            <p>Please include your Order ID if applicable.</p>
          </div>
        );
      default: return null;
    }
  };

  // ------------------------ MAIN RENDER ------------------------

  const renderContent = () => {
    const wrap = (c: React.ReactNode) => <div className="w-full max-w-4xl mx-auto px-4 pb-20">{c}</div>;

    const backButton = (
      <div className="w-full max-w-4xl mx-auto px-4 mt-6 mb-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[var(--brand-muted-lavender)] hover:text-white transition-colors group font-heading uppercase tracking-widest text-sm"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back
        </button>
      </div>
    );

    if (appState === "generating")
      return wrap(
        <div className="flex justify-center mt-20">
          <GenerationProgress currentStep={generationStep} message={statusMessage} />
        </div>
      );

    if (appState === "error")
      return wrap(
        <div className="text-center bg-red-900/20 border-2 border-red-500/40 p-8 rounded-2xl mt-10 shadow-xl">
          <h2 className="text-3xl font-heading text-red-300 mb-4">Something went wrong</h2>
          <p className="text-red-100 mb-8 font-body text-lg">{error}</p>
          <Button onClick={handleReset} text="Try Again" />
        </div>
      );

    if (appState === "success") {
      const showImage = (refineStagedWM ?? watermarkedImage)!;

      return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-20">
          {backButton}
          <h2 className="text-4xl font-heading text-center text-[var(--brand-soft-white)] mb-8 tracking-wider leading-tight">
            Your Masterpiece is Ready
          </h2>

          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 items-start">
            {/* LEFT: Image Display */}
            <div className="w-full lg:col-span-7 mb-8 lg:mb-0 sticky top-24">
              <PortraitDisplay
                originalImage={originalImage!}
                generatedImage={showImage}
                likenessScore={likenessScore}
              />
              {refineStagedWM && (
                <div className="mt-6 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-white font-heading mb-2 sm:mb-0">Reviewing refinement...</p>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="secondary" onClick={handleRefineRevert} text="Discard Changes" className="text-sm py-2" />
                    <Button onClick={handleRefineAccept} text="Keep This Version" className="text-sm py-2 bg-emerald-600 hover:bg-emerald-500" />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Controls & Refinement */}
            <div className="w-full lg:col-span-5 space-y-8">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[var(--brand-accent-orange)] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <h3 className="text-2xl font-heading text-white mb-3">Love this look?</h3>
                <p className="text-[var(--brand-muted-lavender)] mb-8 font-body leading-relaxed">
                  Turn this digital artwork into a stunning physical print, canvas, or a high-resolution digital download.
                </p>
                <Button
                  onClick={() => setAppState("product_selection")}
                  text="Select Product & Checkout"
                  className="w-full py-4 text-xl shadow-[0_0_30px_-10px_rgba(255,107,53,0.5)]"
                />
              </div>

              <div id="refine-panel" className="p-8 rounded-3xl border border-white/10 bg-black/20">
                <div className="flex justify-between items-baseline mb-6">
                  <h3 className="font-heading text-white text-xl">Make Adjustments</h3>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${canRefine ? 'border-[var(--brand-accent-orange)] text-[var(--brand-accent-orange)]' : 'border-white/30 text-white/50'}`}>
                    {MAX_REFINES - refineCount} Refinements Left
                  </span>
                </div>

                <div className="space-y-4 font-body text-[var(--brand-muted-lavender)] text-sm mb-6">
                  <p>Use this tool to guide the AI toward a specific result. Be descriptive!</p>
                  <ul className="list-disc pl-5 space-y-2 opacity-80">
                    <li><strong>Correct Features:</strong> "The eyes should be darker brown." or "Add the missing white patch on the chest."</li>
                    <li><strong>Change Mood/Lighting:</strong> "Make the lighting warmer and golden." or "Change background to a cozy library."</li>
                    <li><strong>Adjust Style:</strong> "Make the brushstrokes more visible and textured."</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-4">
                  <textarea
                    value={refineDraft}
                    onChange={(e) => setRefineDraft(e.target.value)}
                    placeholder="Describe exactly what you want to change..."
                    rows={4}
                    disabled={!canRefine || refineInFlight}
                    className="w-full p-4 bg-black/30 border-2 border-white/10 rounded-xl font-body text-white placeholder-white/30 focus:border-[var(--brand-accent-orange)] focus:outline-none resize-none transition-colors disabled:opacity-50"
                  />
                  <Button
                    onClick={handleRefineSubmit}
                    text={refineInFlight ? "Applying Refinements..." : "Generate Refinement"}
                    disabled={!canRefine || refineInFlight || !refineDraft.trim()}
                    className="w-full py-3"
                  />
                  {!canRefine && (
                    <p className="text-center text-xs text-red-400 mt-2">You have used all available refinements for this session.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (appState === "product_selection")
      return wrap(
        <>
          {backButton}
          <ProductSelector
            generatedImage={(watermarkedImage ?? refineStagedWM)!}
            products={products}
            isLoading={isFetchingProducts}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              setAppState("ordering");
            }}
            onBack={() => setAppState("success")}
          />
        </>
      );

    if (appState === "ordering")
      return wrap(
        <>
          {backButton}
          <OrderForm
            generatedImage={(watermarkedImage ?? refineStagedWM)!}
            petName={petName}
            product={selectedProduct!}
            onSubmit={handleInitiateCheckout}
          />
        </>
      );

    if (appState === "order_complete")
      return wrap(
        <div className="text-center bg-emerald-900/30 border-2 border-emerald-500/50 p-10 rounded-3xl mt-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.2)_0%,_transparent_70%)]"></div>
          <h2 className="text-4xl font-heading text-emerald-300 mb-4 relative z-10">Order Confirmed!</h2>
          <p className="text-emerald-100 font-body text-lg mb-8 relative z-10 max-w-md mx-auto">
            {selectedProduct?.fulfillment === "digital"
              ? "Your high-resolution digital portrait is ready for download."
              : "Thank you! Your custom print is being prepared and will ship soon."}
          </p>

          {digitalDownloadUrl && (
            <div className="mt-8 relative z-10 p-6 bg-emerald-950/50 rounded-xl border border-emerald-500/30 mx-auto max-w-md">
              <p className="text-white mb-4 font-heading">Download Your Bonus File</p>
              <a
                href={digitalDownloadUrl}
                download
                className="inline-block w-full rounded-full bg-[var(--brand-gold)] px-8 py-4 text-lg font-heading font-bold text-slate-950 shadow-[0_0_20px_-5px_rgba(255,215,0,0.5)] hover:bg-yellow-300 transition-all hover:scale-105 active:scale-95"
              >
                Download High-Res Pawtrait
              </a>
              <p className="text-emerald-200/70 text-sm mt-4">This link is valid for 24 hours.</p>
            </div>
          )}

          <div className="mt-12 relative z-10">
            <Button onClick={handleReset} text="Create Another Pawtrait" variant="secondary" />
          </div>
        </div>
      );

    // Default: upload & style select
    return wrap(
      <div className="flex flex-col items-center gap-10 mt-10">
        <div className="text-center max-w-2xl px-4">
          <h2 className="text-4xl md:text-5xl font-heading text-[var(--brand-soft-white)] mb-4 leading-tight tracking-wider">
            Create Your Pet's Masterpiece
          </h2>
          <p className="text-[var(--brand-muted-lavender)] text-xl font-body leading-relaxed">
            Upload a photo, choose a style, and let our AI generate a unique work of art.
          </p>
        </div>

        <div className={`w-full transition-all duration-500 ${!originalImage ? "max-w-3xl" : "max-w-5xl"}`}>
          {!originalImage ? (
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
          ) : (
            <>
              {backButton}
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
                {/* Left: image & inputs */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="relative group rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg aspect-[4/5] bg-black/30">
                    <img
                      src={originalImage}
                      alt="Pet Upload"
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[var(--brand-muted-lavender)] text-sm font-heading mb-2 ml-2 uppercase tracking-wider">
                        Pet's Name
                      </label>
                      <input
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="e.g. Luna"
                        className="w-full p-4 bg-black/20 border-2 border-white/10 rounded-xl font-body text-white placeholder-white/30 focus:border-[var(--brand-accent-orange)] focus:bg-black/40 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--brand-muted-lavender)] text-sm font-heading mb-2 ml-2 uppercase tracking-wider">
                        Custom Background <span className="text-white/40 normal-case">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        placeholder="e.g. In a royal garden"
                        className="w-full p-4 bg-black/20 border-2 border-white/10 rounded-xl font-body text-white placeholder-white/30 focus:border-[var(--brand-accent-orange)] focus:bg-black/40 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: styles & action */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
                  <div>
                    <h3 className="text-2xl font-heading text-white mb-6 text-center lg:text-left">Select an Artistic Style</h3>
                    <StyleSelector styles={STYLES} selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[var(--brand-muted-lavender)] text-sm text-center mb-4 font-body">
                      Ready to create magic? Generation takes about 45 seconds.
                    </p>
                    <Button
                      onClick={handleGenerateClick}
                      text="Generate Pawtrait"
                      className="w-full py-5 text-2xl shadow-[0_0_40px_-10px_rgba(255,107,53,0.6)] hover:shadow-[0_0_50px_-5px_rgba(255,107,53,0.8)]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col w-full relative">
        {/* Modals */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handlePaymentSuccess}
          amount={selectedProduct?.price || 0}
          fulfillmentKind={selectedProduct?.fulfillment}
          productTitle={selectedProduct?.title}
        />
        <TechInfoModal isOpen={false} onClose={() => {}} />

        {/* Generic Info Modal for Header Links */}
        <InfoModal
          isOpen={!!activeInfoModal}
          onClose={() => setActiveInfoModal(null)}
          title={activeInfoModal ? activeInfoModal.charAt(0).toUpperCase() + activeInfoModal.slice(1).replace("-", " ") : ""}
          content={getModalContent()}
        />

        {/* Conditional Rendering: Landing Page OR Main App View */}
        {!hasStarted ? (
          <LandingPage onStart={() => setHasStarted(true)} />
        ) : (
          <>
            {/* Persistent Header across all app states */}
            <Header onOpenInfo={setActiveInfoModal} />
            <main className="w-full flex-grow relative z-0">{renderContent()}</main>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
