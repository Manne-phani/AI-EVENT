import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PairingForm from './components/PairingForm';
import PairingResult from './components/PairingResult';
import SkeletonLoader from './components/SkeletonLoader';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';
import { ShieldAlert, Sparkles, Wand2 } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  
  // Pairing workflow states
  const [loadingPairing, setLoadingPairing] = useState(false);
  const [pairingResult, setPairingResult] = useState(null);
  const [pairingInputs, setPairingInputs] = useState(null);
  const [pairingError, setPairingError] = useState(null);

  // Simple routing listener (hash tracking) for hash links in testimonials or history redirection
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#pairing') {
        setCurrentPage('pairing');
      } else if (hash === '#history') {
        setCurrentPage('history');
      } else if (hash === '#admin') {
        if (isAdmin) {
          setCurrentPage('admin');
        } else {
          setCurrentPage('home');
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdmin]);

  // Authentication Guard: Redirect to login if accessing guarded routes while unauthenticated
  useEffect(() => {
    const guardedPages = ['pairing', 'history', 'admin'];
    if (!loading && guardedPages.includes(currentPage)) {
      if (!isAuthenticated) {
        setCurrentPage('login');
      } else if (currentPage === 'admin' && !isAdmin) {
        setCurrentPage('home');
      }
    }
  }, [currentPage, isAuthenticated, isAdmin, loading]);

  // Admin Guard: If logged in as admin, restrict to admin dashboard and history only
  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) {
      if (currentPage === 'home' || currentPage === 'pairing' || currentPage === 'login') {
        setCurrentPage('admin');
      }
    }
  }, [currentPage, isAuthenticated, isAdmin, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 border-4 border-brand-chocolate border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif text-lg font-bold text-brand-chocolate">Cakes & Crunches AI is rising...</p>
      </div>
    );
  }

  const handleGenerateStart = () => {
    setLoadingPairing(true);
    setPairingResult(null);
    setPairingInputs(null);
    setPairingError(null);
  };

  const handleGenerateSuccess = (result, inputs) => {
    setPairingResult(result);
    setPairingInputs(inputs);
    setLoadingPairing(false);
  };

  const handleGenerateError = (errorMsg) => {
    setPairingError(errorMsg);
    setLoadingPairing(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'login':
        return <LoginPage onLoginSuccess={(targetPage) => setCurrentPage(targetPage || 'pairing')} />;
      case 'pairing':
        if (loadingPairing) {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-2 max-w-md mx-auto py-4">
                <div className="inline-flex p-3 bg-brand-pink/50 text-brand-chocolate rounded-2xl animate-bounce">
                  <Wand2 className="h-6 w-6 animate-pulse" />
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-chocolate">Consulting Chef AI</h3>
                <p className="text-xs text-brand-chocolate-light leading-relaxed">
                  Analyzing cake chemistry and flavor balances to curate your custom dessert table...
                </p>
              </div>
              <SkeletonLoader />
            </div>
          );
        }

        if (pairingResult && pairingInputs) {
          return (
            <PairingResult
              result={pairingResult}
              inputs={pairingInputs}
              onRegenerate={() => {
                setPairingResult(null);
                setPairingInputs(null);
                // Submitting the form automatically triggers loading again
              }}
              onBack={() => {
                setPairingResult(null);
                setPairingInputs(null);
              }}
            />
          );
        }

        return (
          <div className="space-y-8">
            <div className="text-center max-w-md mx-auto space-y-2">
              <h2 className="font-serif text-3xl font-extrabold text-brand-chocolate">Event Catering pairing</h2>
              <p className="text-xs text-brand-chocolate-light font-medium leading-relaxed">
                Provide your celebration specifics and let our recipe models design a complete pairing menu
              </p>
            </div>
            {pairingError && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-sm font-semibold text-center max-w-xl mx-auto flex items-center justify-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <span>Error: {pairingError}</span>
              </div>
            )}
            <PairingForm
              onGenerateStart={handleGenerateStart}
              onGenerateSuccess={handleGenerateSuccess}
              onGenerateError={handleGenerateError}
            />
          </div>
        );
      case 'history':
        return <HistoryPage />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
