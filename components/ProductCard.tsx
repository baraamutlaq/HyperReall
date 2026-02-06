import React from 'react';
import { Product } from '../types';
import { Eye, Box } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 flex flex-col h-full"
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.images[0]} 
          alt={product.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Box className="w-4 h-4" />
            View in 3D
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm border border-gray-200">
          {product.modelData.shape.toUpperCase()}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 line-clamp-1 text-lg group-hover:text-indigo-600 transition-colors">{product.title}</h3>
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{product.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;