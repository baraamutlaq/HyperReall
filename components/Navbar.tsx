import React from 'react';
import { User, UserRole } from '../types';
import { ShoppingCart, Box, User as UserIcon, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  user: User;
  cartCount: number;
  onLogout: () => void;
  onToggleRole: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, cartCount, onLogout, onToggleRole }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Box className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">
                FeelBeforeBuy
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-200 transition" onClick={onToggleRole}>
              <span className={user.role === UserRole.SELLER ? "text-indigo-600" : ""}>Seller View</span>
              <div className={`w-8 h-4 rounded-full p-0.5 ${user.role === UserRole.SELLER ? 'bg-indigo-600 justify-end' : 'bg-gray-300 justify-start'} flex items-center transition-colors duration-300`}>
                 <div className="w-3 h-3 bg-white rounded-full shadow-md" />
              </div>
              <span className={user.role === UserRole.BUYER ? "text-green-600" : ""}>Buyer View</span>
            </div>

            {user.role === UserRole.BUYER && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                <span className="text-xs text-gray-500 uppercase">{user.role}</span>
              </div>
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="h-9 w-9 rounded-full ring-2 ring-white shadow-sm"
              />
              <button onClick={onLogout} className="ml-2 text-gray-400 hover:text-red-500 transition">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;