import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle, Box, FileBox } from 'lucide-react';
import { generate3DModelData, fileToGenerativePart } from '../services/geminiService';
import { Product, ProductShape } from '../types';
import { v4 as uuidv4 } from 'uuid';
import ThreeViewer from './ThreeViewer';

interface SellerDashboardProps {
  onAddProduct: (product: Product) => void;
  sellerId: string;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ onAddProduct, sellerId }) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  // New state for OBJ file
  const [objFile, setObjFile] = useState<File | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProduct, setGeneratedProduct] = useState<Partial<Product> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      
      // Create local preview URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleObjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setObjFile(e.target.files[0]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeObj = () => {
    setObjFile(null);
    if (objInputRef.current) objInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    setIsGenerating(true);
    setError(null);

    try {
      // Convert first image to base64 for API
      const base64Image = await fileToGenerativePart(images[0]);
      const mimeType = images[0].type;
      
      // Call Gemini API for metadata and suggested shape (even if we override shape later)
      const analysis = await generate3DModelData(base64Image, mimeType);
      
      // Check if fallback was used due to error/quota
      if (analysis.description.includes("Quota Exceeded") || analysis.description.includes("unavailable")) {
         setError(analysis.description);
      }

      // Prepare OBJ data url if file exists
      let customObjData: string | undefined = undefined;
      let finalShape: ProductShape = analysis.shape;

      if (objFile) {
        customObjData = URL.createObjectURL(objFile);
        finalShape = 'custom';
      }

      // Create provisional product
      const newProduct: Partial<Product> = {
        title: analysis.title,
        description: analysis.description,
        price: analysis.estimatedPrice,
        category: analysis.category,
        modelData: {
          shape: finalShape,
          textureMap: `data:${mimeType};base64,${base64Image}`,
          generatedAt: new Date().toISOString(),
          analysis: analysis.materialAnalysis,
          objData: customObjData
        },
        images: [`data:${mimeType};base64,${base64Image}`] 
      };

      setGeneratedProduct(newProduct);
    } catch (err) {
      setError("Failed to generate product data. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = () => {
    if (generatedProduct && generatedProduct.modelData) {
      const fullProduct: Product = {
        id: uuidv4(),
        sellerId,
        title: generatedProduct.title || "Untitled",
        description: generatedProduct.description || "",
        price: generatedProduct.price || 0,
        category: generatedProduct.category || "General",
        images: generatedProduct.images || [],
        modelData: generatedProduct.modelData,
        createdAt: Date.now()
      };
      
      // Pass the product up to App for adding and navigation
      onAddProduct(fullProduct);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Studio</h1>
        <p className="text-gray-500 mt-2">Upload 2D images and optional 3D models to create listings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload & Config */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Upload Assets
            </h2>
            
            {/* Image Upload */}
            <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Required)</label>
               <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 hover:bg-indigo-50 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
               >
                  <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  />
                  <div className="flex flex-col items-center">
                  <div className="bg-indigo-100 p-2 rounded-full mb-2">
                     <Upload className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Click to upload images</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
               </div>
            </div>

            {previews.length > 0 && (
              <div className="mb-6 grid grid-cols-4 gap-3">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* OBJ Upload */}
             <div className="mb-4">
               <label className="block text-sm font-medium text-gray-700 mb-2">3D Model (.obj) (Optional)</label>
               <div className="flex items-center gap-3">
                 <button 
                    onClick={() => objInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                 >
                    <FileBox className="w-4 h-4" />
                    {objFile ? "Change Model" : "Upload .obj File"}
                 </button>
                 <input 
                    type="file" 
                    ref={objInputRef} 
                    onChange={handleObjChange} 
                    accept=".obj" 
                    className="hidden" 
                 />
                 {objFile && (
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm">
                       <span className="truncate max-w-[150px]">{objFile.name}</span>
                       <button onClick={removeObj} className="text-indigo-400 hover:text-indigo-900"><X className="w-3 h-3"/></button>
                    </div>
                 )}
               </div>
               <p className="text-xs text-gray-500 mt-2">If provided, this mesh will be used instead of the AI-generated shape.</p>
             </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-fade-in-up">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || images.length === 0}
              className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                isGenerating || images.length === 0
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                'Generate Preview'
              )}
            </button>
          </div>

          {generatedProduct && (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in-up">
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Title</label>
                    <input 
                      type="text" 
                      value={generatedProduct.title} 
                      onChange={(e) => setGeneratedProduct({...generatedProduct, title: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-500 uppercase">Estimated Price ($)</label>
                     <input 
                      type="number" 
                      value={generatedProduct.price}
                      onChange={(e) => setGeneratedProduct({...generatedProduct, price: parseFloat(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Description</label>
                    <textarea 
                      rows={3}
                      value={generatedProduct.description}
                      onChange={(e) => setGeneratedProduct({...generatedProduct, description: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                  </div>
                </div>
             </div>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="flex flex-col h-full">
          <div className="bg-gray-900 rounded-2xl p-1 flex-grow overflow-hidden relative shadow-2xl min-h-[500px] flex items-center justify-center">
            {generatedProduct?.modelData ? (
              <ThreeViewer 
                shape={generatedProduct.modelData.shape} 
                textureImage={generatedProduct.modelData.textureMap} 
                objData={generatedProduct.modelData.objData}
                autoRotate={true}
              />
            ) : (
              <div className="text-center text-gray-500">
                 <div className="w-24 h-24 border-4 border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Box className="w-10 h-10" />
                 </div>
                 <p>3D Preview Area</p>
                 <p className="text-sm opacity-60">Upload assets to visualize product</p>
              </div>
            )}
            
            {generatedProduct?.modelData && (
               <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-4 rounded-xl max-w-xs">
                 <h4 className="font-bold text-sm mb-1 text-indigo-400">Model Info</h4>
                 <div className="space-y-2 text-xs">
                   <p><span className="opacity-70">Source:</span> {generatedProduct.modelData.shape === 'custom' ? 'Custom Upload (.obj)' : 'AI Generated Shape'}</p>
                   {generatedProduct.modelData.shape !== 'custom' && (
                     <p><span className="opacity-70">Detected Shape:</span> {generatedProduct.modelData.shape}</p>
                   )}
                   <p><span className="opacity-70">Material:</span> {generatedProduct.modelData.analysis}</p>
                 </div>
               </div>
            )}
          </div>

          <button 
             onClick={handlePublish}
             disabled={!generatedProduct}
             className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
               generatedProduct 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-200' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
             }`}
          >
            <CheckCircle className="w-6 h-6" />
            Publish Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;