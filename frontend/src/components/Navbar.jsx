import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Cookie, History, BarChart3, LogOut, LogIn, Sparkles } from 'lucide-react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Cookie, authRequired: false },
    { id: 'pairing', label: 'Pairing Tool', icon: Sparkles, authRequired: true },
    { id: 'history', label: 'History', icon: History, authRequired: true },
    { id: 'admin', label: 'Admin Dashboard', icon: BarChart3, authRequired: true, adminOnly: true },
  ];

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-cream/85 backdrop-blur-md border-b border-brand-pink/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="p-2.5 bg-brand-pink text-brand-chocolate rounded-2xl shadow-soft mr-3 transform hover:rotate-6 transition-transform">
              <Cookie className="h-7 w-7" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-brand-chocolate block leading-none">
                Cakes & Crunches
              </span>
              <span className="text-xs uppercase tracking-widest text-brand-chocolate-light font-medium block mt-0.5">
                AI Catering Planner
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              if (item.adminOnly && !isAdmin) return null;
              if (isAdmin && (item.id === 'home' || item.id === 'pairing')) return null;
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-chocolate text-brand-cream shadow-premium'
                      : 'text-brand-chocolate-light hover:bg-brand-pink/40 hover:text-brand-chocolate'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Info / Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 bg-brand-beige/60 border border-brand-pink/40 px-4 py-1.5 rounded-2xl">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-brand-chocolate leading-tight">
                    📱 {user?.mobileNumber}
                  </span>
                  <span className="text-[10px] font-semibold text-brand-chocolate-light leading-normal">
                    ✉️ {user?.gmail}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-red-100"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage('login')}
                className="flex items-center bg-brand-pink text-brand-chocolate hover:bg-brand-rose px-5 py-2.5 rounded-2xl text-sm font-bold shadow-soft transition-all hover:translate-y-[-1px]"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-brand-chocolate hover:bg-brand-pink/30 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-pink/40 py-3 px-4 space-y-2 animate-fade-in">
          {navItems.map((item) => {
            if (item.authRequired && !isAuthenticated) return null;
            if (item.adminOnly && !isAdmin) return null;
            if (isAdmin && (item.id === 'home' || item.id === 'pairing')) return null;
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-chocolate text-brand-cream'
                    : 'text-brand-chocolate-light hover:bg-brand-pink/30'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}

          <div className="border-t border-brand-pink/30 pt-3 mt-3">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-4 py-2 bg-brand-beige/40 rounded-xl space-y-0.5">
                  <span className="text-sm block text-brand-chocolate-light font-medium">Logged in as:</span>
                  <span className="text-base font-bold text-brand-chocolate block leading-none">📱 {user?.mobileNumber}</span>
                  <span className="text-xs font-semibold text-brand-chocolate-light block">✉️ {user?.gmail}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    setCurrentPage('home');
                  }}
                  className="flex items-center justify-center w-full px-4 py-3 border border-red-200 text-red-600 rounded-xl text-base font-bold hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentPage('login');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center w-full px-4 py-3 bg-brand-pink text-brand-chocolate rounded-xl text-base font-bold"
              >
                <LogIn className="h-5 w-5 mr-3" />
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
