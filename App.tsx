import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SellerDashboard from './components/SellerDashboard';
import BuyerCatalog from './components/BuyerCatalog';
import ProductDetail from './components/ProductDetail';
  import ErrorBoundary from './components/ErrorBoundary';
import { Product, User, UserRole, CartItem } from './types';
import { v4 as uuidv4 } from 'uuid';
import { Check } from 'lucide-react';

// Mock Initial Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    sellerId: 'seller1',
    title: 'Modern Geometric Lamp',
    description: 'A sleek, minimalist lamp with a cylindrical base and matte finish. Perfect for modern workspaces.',
    price: 129.99,
    category: 'Home Decor',
    images: ['https://images.unsplash.com/photo-1507473888900-52e1adad5474?auto=format&fit=crop&q=80&w=800'],
    modelData: {
      shape: 'cylinder',
      textureMap: 'https://images.unsplash.com/photo-1507473888900-52e1adad5474?auto=format&fit=crop&q=80&w=800', // Using image as texture for demo
      generatedAt: new Date().toISOString(),
      analysis: 'Smooth metallic surface with high reflectivity. Cylindrical geometry detected.'
    },
    createdAt: Date.now()
  },
  {
    id: '2',
    sellerId: 'seller1',
    title: 'Vintage Leather Case',
    description: 'Handcrafted leather storage box. Rustic charm with durable construction.',
    price: 85.00,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1520013573795-385751946616?auto=format&fit=crop&q=80&w=800'],
    modelData: {
      shape: 'box',
      textureMap: 'https://images.unsplash.com/photo-1520013573795-385751946616?auto=format&fit=crop&q=80&w=800',
      generatedAt: new Date().toISOString(),
      analysis: 'Textured leather surface. Cuboid geometry with worn edges.'
    },
    createdAt: Date.now()
  }
];

const Snackbar = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[100] animate-fade-in-up">
      <div className="bg-green-500 rounded-full p-1 flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </div>
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

const App: React.FC = () => {
  // Global State
  const [user, setUser] = useState<User>({
    id: 'user1',
    name: 'Alex Doe',
    role: UserRole.BUYER,
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
  });
  
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  // Actions
  const handleToggleRole = () => {
    setUser(prev => ({
      ...prev,
      role: prev.role === UserRole.BUYER ? UserRole.SELLER : UserRole.BUYER
    }));
    // Reset selection when switching roles to avoid UI confusion
    setSelectedProduct(null);
  };

  const handleLogout = () => {
    setSnackbar("Logged out (Simulation)");
  };

  const handleAddProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    // Switch to Buyer view to see the published product
    setUser(prev => ({ ...prev, role: UserRole.BUYER }));
    setSnackbar("Product Published Successfully!");
    window.scrollTo(0,0);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBackToCatalog = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSnackbar(`Added ${product.title} to cart!`);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col relative">
        <Navbar 
          user={user} 
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
          onLogout={handleLogout}
          onToggleRole={handleToggleRole}
        />
        
        <main className="flex-grow">
          {user.role === UserRole.SELLER ? (
             <SellerDashboard 
               onAddProduct={handleAddProduct} 
               sellerId={user.id} 
             />
          ) : (
             // Buyer Logic
             selectedProduct ? (
               <ProductDetail 
                 product={selectedProduct} 
                 onBack={handleBackToCatalog} 
                 onAddToCart={handleAddToCart}
               />
             ) : (
               <BuyerCatalog 
                 products={products} 
                 onProductClick={handleProductClick} 
               />
             )
          )}
        </main>
        
        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Feel Before You Buy. Powered by Gemini 3 Pro & React Three Fiber.</p>
          </div>
        </footer>

        {snackbar && <Snackbar message={snackbar} onClose={() => setSnackbar(null)} />}
      </div>
    </HashRouter>
  );
};

export default App;