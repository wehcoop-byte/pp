import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PortraitDisplay } from './components/PortraitDisplay';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Button } from './components/Button';
import { OrderForm } from './components/OrderForm';
import { PaymentModal } from './components/PaymentModal';
import * as geminiService from './services/geminiService';
import * as shopifyService from './services/shopifyService';
import { Product } from './data/products';
import { ProductSelector } from './components/ProductSelector';
import { Style, STYLES } from './data/styles';
import { StyleSelector } from './components/StyleSelector';
import { TechInfoModal } from './components/TechInfoModal';

type AppState = 'idle' | 'image_uploaded' | 'generating' | 'success' | 'error' | 'product_selection' | 'ordering' | 'checkout_redirecting' | 'order_complete';

const LIKENESS_THRESHOLD = 0.8;
const MAX_LIKENESS_RETRIES = 3;
const MAX_ATTEMPTS_PER_PHOTO = 3;
const MAX_DAILY_ATTEMPTS = 10;
const BASE_PROMPT = "It is absolutely essential to preserve the pet's exact likeness, unique features, markings, and fur color from the original photo.";
const NEGATIVE_PROMPT = "Avoid the following: poorly drawn, ugly, deformed, disfigured, extra limbs, blurry, pixelated, cartoon, 3d render, anime, watermark, signature, text.";


const App: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [highResGeneratedImage, setHighResGeneratedImage] = useState<string | null>(null);
    const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
    const [appState, setAppState] = useState<AppState>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [likenessScore, setLikenessScore] = useState<number | null>(null);
    const [error, setError] = useState<string>('');
    const [petName, setPetName] = useState<string>('');
    const [background, setBackground] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isFetchingProducts, setIsFetchingProducts] = useState(true);
    const [isTechInfoModalOpen, setIsTechInfoModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [shippingAddress, setShippingAddress] = useState<object | null>(null);
    const [generationAttempts, setGenerationAttempts] = useState<number>(0);
    const [dailyAttemptsLeft, setDailyAttemptsLeft] = useState<number>(MAX_DAILY_ATTEMPTS);


    useEffect(() => {
        const loadProducts = async () => {
            try {
                setIsFetchingProducts(true);
                const fetchedProducts = await shopifyService.fetchProducts();
                setProducts(fetchedProducts);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError("Could not load products. Please refresh the page.");
                setAppState('error');
            } finally {
                setIsFetchingProducts(false);
            }
        };
        loadProducts();

        // Check daily generation limit from localStorage on initial load
        try {
            const dataStr = localStorage.getItem('pawtrait_generation_data');
            if (dataStr) {
                const data = JSON.parse(dataStr);
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;

                if (now - data.timestamp > oneDay) {
                    localStorage.removeItem('pawtrait_generation_data');
                    setDailyAttemptsLeft(MAX_DAILY_ATTEMPTS);
                } else {
                    const remaining = MAX_DAILY_ATTEMPTS - data.count;
                    setDailyAttemptsLeft(Math.max(0, remaining));
                }
            }
        } catch (e) {
            console.error("Failed to read from localStorage:", e);
        }
    }, []);

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setOriginalImage(result);
            setAppState('image_uploaded');
            setError('');
            setWatermarkedImage(null);
            setHighResGeneratedImage(null);
            setLikenessScore(null);
            setGenerationAttempts(0); // Reset per-photo attempts on new image upload
        };
        reader.onerror = () => {
          setAppState('error');
          setError('Failed to read the image file. Please try again.');
        }
        reader.readAsDataURL(file);
    };

    const handleGenerateClick = useCallback(async () => {
        if (!originalImage || !selectedStyle || generationAttempts >= MAX_ATTEMPTS_PER_PHOTO || dailyAttemptsLeft <= 0) return;
        
        setGenerationAttempts(prev => prev + 1);

        try {
            const dataStr = localStorage.getItem('pawtrait_generation_data');
            let currentCount = 1;
            if (dataStr) {
                const data = JSON.parse(dataStr);
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;
                if (now - data.timestamp > oneDay) {
                    currentCount = 1; // It expired, this is the first one of the new period
                } else {
                    currentCount = data.count + 1;
                }
            }
            localStorage.setItem('pawtrait_generation_data', JSON.stringify({ count: currentCount, timestamp: Date.now() }));
            setDailyAttemptsLeft(prev => prev - 1);
        } catch (e) {
            console.error("Failed to write to localStorage:", e);
        }
        
        const positivePrompt = selectedStyle.prompt
            .replace('{{Pet Name}}', petName || 'My Beloved Pet')
            .replace('{{background}}', background || 'a fitting and complementary');
        
        const finalPrompt = `${positivePrompt}. ${BASE_PROMPT} ${NEGATIVE_PROMPT}`;

        setAppState('generating');
        setWatermarkedImage(null);
        setHighResGeneratedImage(null);
        setLikenessScore(null);
        setError('');
        let currentTry = 0;

        while (currentTry < MAX_LIKENESS_RETRIES) {
            try {
                setStatusMessage(`🎨 Creating pawtrait (Attempt ${currentTry + 1}/${MAX_LIKENESS_RETRIES})...`);
                
                const generated = await geminiService.generatePetPortrait(originalImage, finalPrompt);

                setStatusMessage('🧐 Critiquing the likeness...');
                
                const score = await geminiService.rateImageLikeness(originalImage, generated);

                if (score >= LIKENESS_THRESHOLD) {
                    setHighResGeneratedImage(generated);
                    
                    setStatusMessage('Adding finishing touches...');
                    const watermarked = await geminiService.addWatermark(generated);
                    setWatermarkedImage(watermarked);

                    setLikenessScore(score);
                    setAppState('success');
                    setStatusMessage('Masterpiece complete!');
                    return; // Exit loop on success
                } else {
                    currentTry++;
                    setStatusMessage(`Likeness score (${score.toFixed(2)}) too low. Retrying...`);
                }
            } catch (err) {
                console.error(err);
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setAppState('error');
                setError(`An error occurred: ${errorMessage}`);
                return;
            }
        }

        setAppState('error');
        setError(`Could not achieve a satisfactory likeness after ${MAX_LIKENESS_RETRIES} attempts. Please try a different photo for better results.`);
    }, [originalImage, petName, background, selectedStyle, generationAttempts, dailyAttemptsLeft]);

    const handleReset = () => {
        setOriginalImage(null);
        setWatermarkedImage(null);
        setHighResGeneratedImage(null);
        setLikenessScore(null);
        setAppState('idle');
        setError('');
        setStatusMessage('');
        setPetName('');
        setBackground('');
        setSelectedProduct(null);
        setSelectedStyle(null);
        setGenerationAttempts(0);
    };

    const handleDownload = () => {
        if (!highResGeneratedImage) return;
        const link = document.createElement('a');
        link.href = highResGeneratedImage;
        const filename = (petName ? petName.replace(/\s+/g, '_') : 'pet') + '_pawtrait.png';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePaymentSuccess = async () => {
        if (!selectedProduct || !highResGeneratedImage || !shippingAddress) return;

        setIsPaymentModalOpen(false);
        setAppState('checkout_redirecting');
        let imageForPrinting = highResGeneratedImage;

        try {
            // Upscale image only for physical products
            if (selectedProduct.id !== 'digital-pawtrait') {
                setStatusMessage('Enhancing pawtrait for printing...');
                imageForPrinting = await geminiService.upscaleImage(highResGeneratedImage);
            }

            setStatusMessage('Processing your order securely...');
            
            await shopifyService.createShopifyCheckout({
                productId: selectedProduct.id,
                customImageUrl: imageForPrinting,
                shippingAddress,
            });
            
            setAppState('order_complete');

        } catch (err) {
            console.error("Failed to create Shopify checkout:", err);
            setError("Could not process your order. Please try again.");
            setAppState('error');
        }
    };

    const handleInitiateCheckout = (address: object) => {
        setShippingAddress(address);
        setIsPaymentModalOpen(true);
    };
    
    const renderContent = () => {
        switch (appState) {
            case 'generating':
            case 'checkout_redirecting':
                return <LoadingIndicator message={statusMessage} />;
            case 'success':
                return (
                    <div className="w-full">
                        <h2 className="text-2xl font-serif text-center text-[#513369] mb-4">Behold, Your Pet's Masterpiece!</h2>
                        <PortraitDisplay 
                            originalImage={originalImage!} 
                            generatedImage={watermarkedImage!} 
                            likenessScore={likenessScore}
                        />
                         <div className="text-center mt-8 p-6 bg-white rounded-lg shadow-md border-2 border-[#f4953e]/30 max-w-3xl mx-auto">
                            <h3 className="text-xl font-serif text-[#513369] mb-4">Bring Your Masterpiece Home</h3>
                            <p className="text-gray-600 mb-6">
                                Your pawtrait is ready to shine! Immortalize this moment on a beautiful, custom-made product or get the high-resolution digital file. The perfect gift for any pet lover (including yourself!).
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <Button 
                                    onClick={() => setAppState('product_selection')} 
                                    text="Choose a Product or Digital File" 
                                    disabled={isFetchingProducts}
                                />
                            </div>
                        </div>

                         <div className="text-center mt-8">
                            <Button onClick={handleReset} text="Create Another Pawtrait" />
                         </div>
                    </div>
                );
             case 'product_selection':
                return (
                    <ProductSelector
                        generatedImage={watermarkedImage!}
                        products={products}
                        isLoading={isFetchingProducts}
                        onSelectProduct={(product) => {
                            setSelectedProduct(product);
                            setAppState('ordering');
                        }}
                        onBack={() => setAppState('success')}
                    />
                );
            case 'ordering':
                 return (
                    <OrderForm
                        generatedImage={watermarkedImage!}
                        petName={petName}
                        product={selectedProduct!}
                        onSubmit={handleInitiateCheckout}
                    />
                );
            case 'order_complete':
                 return (
                    <div className="text-center w-full max-w-2xl p-8 bg-green-50 border-2 border-green-500/30 rounded-lg shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-3xl font-serif text-green-800 mb-2">Order Complete!</h2>
                        <p className="text-gray-600 mb-6">Thank you for your purchase! A confirmation email is on its way. Your one-of-a-kind pawtrait will be ready shortly.</p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Button onClick={handleDownload} text="Download Your Pawtrait" />
                            <Button onClick={handleReset} text="Create Another Masterpiece" />
                        </div>
                    </div>
                );
            case 'error':
                return (
                     <div className="text-center w-full max-w-2xl p-8 bg-red-50 border-2 border-red-500/30 rounded-lg shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-3xl font-serif text-red-800 mb-2">An Error Occurred</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Button onClick={handleReset} text="Try Again" />
                    </div>
                );
            default:
                const photoAttemptsLeft = MAX_ATTEMPTS_PER_PHOTO - generationAttempts;
                const hasPhotoAttempts = photoAttemptsLeft > 0;
                const hasDailyAttempts = dailyAttemptsLeft > 0;
                const canGenerate = selectedStyle && hasPhotoAttempts && hasDailyAttempts;

                let buttonText = '✨ Generate Pawtrait';
                if (hasDailyAttempts) {
                    buttonText = `✨ Generate Pawtrait (${photoAttemptsLeft} left for this photo)`;
                } else {
                    buttonText = "Daily Limit Reached";
                }

                let helperText = "Our AI artist will now get to work. This can take a moment.";
                if (!hasDailyAttempts) {
                    helperText = "You've reached your daily generation limit. Please come back tomorrow!";
                } else if (!hasPhotoAttempts) {
                    helperText = "You've used all attempts for this photo. Please upload a new one.";
                }

                return (
                    <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                        {originalImage ? (
                            <div className="w-full flex flex-col items-center gap-6">
                                <img src={originalImage} alt="Uploaded Pet" className="max-h-80 rounded-lg shadow-lg" />
                                <div className="w-full p-6 bg-white rounded-lg shadow-md border-2 border-[#a796c4]/30 space-y-4">
                                    <StyleSelector styles={STYLES} selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
                                    <div>
                                         <label htmlFor="petName" className="block text-lg font-serif text-[#513369] mb-2 text-left">Step 2: Personalize Your Pawtrait (Optional)</label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <input
                                                type="text"
                                                id="petName"
                                                value={petName}
                                                onChange={(e) => setPetName(e.target.value)}
                                                placeholder="Pet's Name (e.g., Captain Fluffy)"
                                                className="flex-grow p-3 bg-white border-2 border-[#a796c4] rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#f4953e] transition"
                                            />
                                            <input
                                                type="text"
                                                id="background"
                                                value={background}
                                                onChange={(e) => setBackground(e.target.value)}
                                                placeholder="Describe a background (e.g., 'a library of books')"
                                                className="flex-grow p-3 bg-white border-2 border-[#a796c4] rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-[#f4953e] transition"
                                            />
                                        </div>
                                         <p className="text-xs text-gray-500 mt-2 text-left">
                                            Give your pet a name for a personal touch, and describe the perfect scene for them! The more creative, the better.
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Button 
                                        onClick={handleGenerateClick} 
                                        text={buttonText}
                                        disabled={!canGenerate} 
                                    />
                                     <p className="text-sm text-gray-500 mt-2">
                                       {helperText}
                                    </p>
                                    { hasDailyAttempts && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        (Daily generations left: {dailyAttemptsLeft})
                                    </p>
                                    )}
                                    <button onClick={() => setIsTechInfoModalOpen(true)} className="text-sm text-[#513369] hover:text-[#f4953e] mt-2 font-semibold underline transition">
                                        How does our AI guarantee a great likeness?
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-center max-w-lg">
                                    <h2 className="text-2xl font-serif text-[#513369] mb-2">Turn Your Pet Into a Work of Art</h2>
                                    <p className="text-gray-600">
                                        Just upload a photo of your furry friend, choose a style, and let our AI create a unique 'pawtrait' that you'll cherish forever.
                                    </p>
                                </div>
                                <ImageUploader onImageUpload={handleImageUpload} />
                            </>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSubmit={handlePaymentSuccess}
                amount={selectedProduct?.price || 0}
            />
            <TechInfoModal isOpen={isTechInfoModalOpen} onClose={() => setIsTechInfoModalOpen(false)} />
            <Header />
            <main className="w-full flex-grow flex flex-col items-center justify-center">
                 {renderContent()}
            </main>
        </div>
    );
};

export default App;
