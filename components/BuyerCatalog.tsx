import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Search } from 'lucide-react';

interface BuyerCatalogProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const BuyerCatalog: React.FC<BuyerCatalogProps> = ({ products, onProductClick }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero / Search Section */}
      <div className="bg-indigo-900 rounded-3xl p-8 mb-12 relative overflow-hidden text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Experience Before You Buy</h1>
          <p className="text-indigo-200 text-lg mb-8">
            Interact with products in full 3D. Inspect every angle, texture, and detail as if you were holding it in your hands.
          </p>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search for furniture, electronics, gadgets..." 
              className="w-full py-4 pl-12 pr-4 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        <div className="flex gap-2">
           <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
             <option>All Categories</option>
             <option>Electronics</option>
             <option>Furniture</option>
             <option>Fashion</option>
           </select>
           <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
             <option>Price: Low to High</option>
             <option>Price: High to Low</option>
             <option>Newest First</option>
           </select>
        </div>
      </div>

      {products.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
           <p className="text-gray-500 text-lg">No products listed yet. Switch to Seller mode to add some!</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} onClick={onProductClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerCatalog;