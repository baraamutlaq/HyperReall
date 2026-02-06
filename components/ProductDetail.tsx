import React from 'react';
import { Product } from '../types';
import React, { Suspense } from 'react';
const ThreeViewer = React.lazy(() => import('./ThreeViewer'));
import { ArrowLeft, ShoppingCart, Star, ShieldCheck, Truck } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-160px)] min-h-[600px]">
        {/* 3D Viewer Section - Takes up 2/3rds */}
        <div className="lg:col-span-2 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">Loading 3D viewer...</div>}>
            <ThreeViewer 
              shape={product.modelData.shape} 
              textureImage={product.modelData.textureMap}
              objData={product.modelData.objData}
            />
          </Suspense>
          <div className="absolute top-6 left-6 pointer-events-none">
             <h1 className="text-3xl font-bold text-white drop-shadow-md">{product.title}</h1>
             <p className="text-white/80 text-sm mt-1 max-w-md drop-shadow-md">{product.category}</p>
          </div>
        </div>

        {/* Details Panel */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
             <div>
               <h2 className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</h2>
               <div className="flex items-center mt-2 gap-1 text-yellow-500">
                 <Star className="w-4 h-4 fill-current" />
                 <Star className="w-4 h-4 fill-current" />
                 <Star className="w-4 h-4 fill-current" />
                 <Star className="w-4 h-4 fill-current" />
                 <Star className="w-4 h-4 text-gray-300" />
                 <span className="text-gray-400 text-xs ml-2">(12 reviews)</span>
               </div>
             </div>
          </div>

          <div className="prose prose-sm text-gray-600 mb-8">
            <h3 className="text-gray-900 font-semibold mb-2">Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 mb-8">
            <h3 className="text-indigo-900 font-semibold text-sm mb-2">AI Model Analysis</h3>
            <p className="text-xs text-indigo-700 leading-relaxed">
              {product.modelData.analysis}
            </p>
          </div>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center text-sm text-gray-500 gap-3">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <span>Verified 3D Representation</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 gap-3">
              <Truck className="w-5 h-5 text-blue-500" />
              <span>Free shipping on orders over $50</span>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <button 
              onClick={() => onAddToCart(product)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-200 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;