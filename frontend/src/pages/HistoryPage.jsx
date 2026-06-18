import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PairingResult from '../components/PairingResult';
import SkeletonLoader from '../components/SkeletonLoader';
import { Search, Trash2, Eye, Calendar, Sparkles, Clock, Users, ArrowLeft } from 'lucide-react';

const HistoryPage = () => {
  const { authFetch } = useAuth();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const q = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const data = await authFetch(`/history${q}`);
      setHistoryList(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load generation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(search);
  };

  // Debounced search could be nice, but simple button + enter is 100% reliable
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === '') {
      fetchHistory('');
    }
  };

  const handleViewDetails = async (id) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const data = await authFetch(`/history/${id}`);
      setSelectedItem(data); // contains inputs, pairing, feedback, generationId
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid triggering card click
    if (!window.confirm('Are you sure you want to delete this history item?')) return;

    try {
      await authFetch(`/history/${id}`, { method: 'DELETE' });
      setHistoryList(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.generationId === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete item.');
    }
  };

  const formatTimestamp = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return isoString;
    }
  };

  if (selectedItem) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedItem(null)}
          className="flex items-center text-xs font-bold text-brand-chocolate-light hover:text-brand-chocolate mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to History List
        </button>
        <PairingResult
          result={{
            generationId: selectedItem.generationId,
            ...selectedItem.pairing
          }}
          inputs={selectedItem.inputs}
          existingFeedback={selectedItem.feedback}
          onRegenerate={() => {
            // For historical regenerations, we can load them into the form. 
            // In this layout, we go back to pairing tab and populate form.
            alert('To regenerate, we will copy this history configuration back into the generator.');
            window.location.hash = '#pairing'; // Simple hash routing trigger if applicable, or we alert
          }}
          onBack={() => setSelectedItem(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="text-center md:text-left md:flex justify-between items-center gap-6">
        <div className="space-y-1">
          <h2 className="font-serif text-3xl font-extrabold text-brand-chocolate">Catering Pairing History</h2>
          <p className="text-xs uppercase tracking-widest font-bold text-brand-chocolate-light">
            Review and download your previous dessert menu consultations
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-4 md:mt-0 flex items-center bg-white border border-brand-pink/50 rounded-2xl p-1 shadow-soft max-w-sm w-full">
          <input
            type="text"
            placeholder="Search event type or cake..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-transparent border-none px-3 py-2 text-xs focus:outline-none text-brand-chocolate"
          />
          <button
            type="submit"
            className="p-2.5 bg-brand-chocolate text-brand-cream hover:bg-brand-chocolate-light rounded-xl transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-sm font-semibold text-center">
          ⚠️ {error}
        </div>
      )}

      {loadingDetails ? (
        <div className="space-y-6">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-brand-chocolate-light animate-bounce">
            Fetching menu details from vault...
          </p>
          <SkeletonLoader />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-brand-pink/30 rounded-2xl p-5 shimmer-bg h-20 animate-pulse"></div>
          ))}
        </div>
      ) : historyList.length === 0 ? (
        <div className="bg-white border border-brand-pink/40 rounded-3xl p-12 text-center space-y-4 shadow-soft">
          <Clock className="h-12 w-12 text-brand-rose/60 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-brand-chocolate">No Catering Histories Found</h3>
          <p className="text-sm text-brand-chocolate-light max-w-sm mx-auto leading-relaxed">
            You haven't run any AI dessert pairings yet, or your search query doesn't match past records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {historyList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleViewDetails(item.id)}
              className="bg-white border border-brand-pink/30 hover:border-brand-rose rounded-3xl p-5 shadow-soft hover:shadow-premium transition-all duration-300 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-brand-rose bg-brand-pink/30 px-2 py-0.5 rounded-full border border-brand-pink/10">
                    {item.eventType}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-brand-chocolate-light bg-brand-beige px-2 py-0.5 rounded-full">
                    {item.mainCakeType} Cake
                  </span>
                  <span className="text-[10px] text-brand-chocolate-light font-semibold flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {item.guestCount} Guests
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-brand-chocolate leading-relaxed group-hover:text-brand-rose transition-colors">
                  {item.preview}
                </h4>
                <div className="flex items-center text-[10px] text-brand-chocolate-light/50 font-semibold space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatTimestamp(item.timestamp)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end border-t border-brand-pink/20 pt-3 sm:pt-0 sm:border-none">
                <button
                  type="button"
                  onClick={() => handleViewDetails(item.id)}
                  className="p-2.5 hover:bg-brand-pink/40 text-brand-chocolate-light hover:text-brand-chocolate rounded-xl transition-all"
                  title="View Menu"
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, item.id)}
                  className="p-2.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl transition-all border border-transparent hover:border-red-100"
                  title="Delete Record"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
