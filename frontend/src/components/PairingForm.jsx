import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, Save, User, Calendar, Cake, ShieldCheck, DollarSign, PenTool, Check } from 'lucide-react';

const PairingForm = ({ onGenerateStart, onGenerateSuccess, onGenerateError }) => {
  const { authFetch } = useAuth();
  
  // Form State
  const [formData, setFormData] = useState({
    eventType: '',
    guestCount: '',
    mainCakeType: '',
    preferences: '',
    dietaryRestrictions: [],
    budgetRange: 'Premium',
    specialInstructions: ''
  });

  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch templates/presets on mount
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const data = await authFetch('/templates');
      setTemplates(data);
    } catch (err) {
      console.error('Error loading presets:', err.message);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCheckboxChange = (restriction) => {
    setFormData(prev => {
      const current = prev.dietaryRestrictions;
      const updated = current.includes(restriction)
        ? current.filter(r => r !== restriction)
        : [...current, restriction];
      return {
        ...prev,
        dietaryRestrictions: updated
      };
    });
  };

  const applyPreset = (preset) => {
    setFormData({
      eventType: preset.eventType || '',
      guestCount: preset.guestCount ? preset.guestCount.toString() : '',
      mainCakeType: preset.mainCakeType || '',
      preferences: preset.preferences || '',
      dietaryRestrictions: preset.dietaryRestrictions || [],
      budgetRange: preset.budgetRange || 'Premium',
      specialInstructions: preset.specialInstructions || ''
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.eventType) newErrors.eventType = 'Please select an event type.';
    
    if (!formData.guestCount) {
      newErrors.guestCount = 'Guest count is required.';
    } else {
      const count = parseInt(formData.guestCount, 10);
      if (isNaN(count) || count <= 0) {
        newErrors.guestCount = 'Please enter a valid positive guest count.';
      } else if (count > 2000) {
        newErrors.guestCount = 'For events larger than 2000 guests, please contact catering support directly.';
      }
    }

    if (!formData.mainCakeType) newErrors.mainCakeType = 'Please select your main centerpiece cake.';
    if (!formData.budgetRange) newErrors.budgetRange = 'Budget range selection is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    onGenerateStart();

    try {
      const result = await authFetch('/generate', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      onGenerateSuccess(result, formData);
    } catch (err) {
      console.error(err);
      onGenerateError(err.message || 'Menu suggestion generation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateName.trim()) return;
    if (!validate()) {
      setShowSaveTemplate(false);
      return;
    }

    try {
      await authFetch('/templates', {
        method: 'POST',
        body: JSON.stringify({
          name: templateName,
          ...formData
        })
      });
      setSaveSuccess(true);
      setTemplateName('');
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSaveTemplate(false);
      }, 2000);
      fetchTemplates(); // Refresh presets
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Quick Presets Section */}
      <div className="bg-white border border-brand-pink/40 rounded-3xl p-6 shadow-premium">
        <h3 className="text-xs uppercase tracking-widest font-bold text-brand-chocolate-light mb-3 flex items-center">
          <Sparkles className="h-4 w-4 text-brand-rose mr-1.5 animate-pulse" />
          One-Click Quick Presets
        </h3>
        
        {loadingTemplates ? (
          <div className="flex space-x-3 overflow-x-auto pb-1 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-brand-beige rounded-2xl w-32 shimmer-bg"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => applyPreset(tmpl)}
                className="px-4 py-2.5 bg-brand-cream border border-brand-pink/55 hover:border-brand-rose text-brand-chocolate-light hover:text-brand-chocolate rounded-2xl text-xs font-bold transition-all duration-300 hover:shadow-soft hover:translate-y-[-1px] flex items-center space-x-1"
              >
                <span>✨ {tmpl.name}</span>
                {tmpl.isPreset ? null : <span className="text-[10px] text-brand-rose bg-brand-pink/30 px-1.5 py-0.5 rounded-full ml-1 font-normal">Custom</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Main Pairing Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-brand-pink/40 rounded-3xl p-6 md:p-10 shadow-premium space-y-8">
        
        {/* Row 1: Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-brand-rose" />
              Event Type
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              className={`w-full bg-brand-cream border ${
                errors.eventType ? 'border-red-500' : 'border-brand-pink/50'
              } rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors`}
            >
              <option value="">Select Event Type</option>
              <option value="Birthday">Birthday</option>
              <option value="Wedding">Wedding</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Festival">Festival Celebration</option>
              <option value="Baby Shower">Baby Shower</option>
              <option value="Housewarming">Housewarming</option>
            </select>
            {errors.eventType && <p className="text-xs text-red-600 font-semibold">{errors.eventType}</p>}
          </div>

          {/* Guest Count */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light flex items-center">
              <User className="h-3.5 w-3.5 mr-1.5 text-brand-rose" />
              Guest Count
            </label>
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleInputChange}
              placeholder="e.g. 50"
              className={`w-full bg-brand-cream border ${
                errors.guestCount ? 'border-red-500' : 'border-brand-pink/50'
              } rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors`}
            />
            {errors.guestCount ? (
              <p className="text-xs text-red-600 font-semibold">{errors.guestCount}</p>
            ) : (
              <p className="text-[10px] text-brand-chocolate-light/50">Helps AI recommend suitable dessert quantities.</p>
            )}
          </div>
        </div>

        {/* Row 2: Cake Centerpiece & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Cake Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light flex items-center">
              <Cake className="h-3.5 w-3.5 mr-1.5 text-brand-rose" />
              Main Cake Type
            </label>
            <select
              name="mainCakeType"
              value={formData.mainCakeType}
              onChange={handleInputChange}
              className={`w-full bg-brand-cream border ${
                errors.mainCakeType ? 'border-red-500' : 'border-brand-pink/50'
              } rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors`}
            >
              <option value="">Select Centerpiece Cake</option>
              <option value="Chocolate">Chocolate Cake</option>
              <option value="Vanilla">Vanilla Cake</option>
              <option value="Red Velvet">Red Velvet Cake</option>
              <option value="Fruit Cake">Fruit Cake</option>
              <option value="Butterscotch">Butterscotch Cake</option>
              <option value="Custom Cake">Custom Cake / Special Order</option>
            </select>
            {errors.mainCakeType && <p className="text-xs text-red-600 font-semibold">{errors.mainCakeType}</p>}
          </div>

          {/* Budget Range */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light flex items-center">
              <DollarSign className="h-3.5 w-3.5 mr-1.5 text-brand-rose" />
              Budget Range
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Budget-friendly', 'Premium', 'Luxury'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, budgetRange: b }))}
                  className={`py-3 text-xs font-bold rounded-2xl border transition-all ${
                    formData.budgetRange === b
                      ? 'bg-brand-chocolate text-brand-cream border-brand-chocolate shadow-soft'
                      : 'bg-brand-cream border-brand-pink/50 hover:bg-brand-pink/20 text-brand-chocolate-light'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Dietary Restrictions */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light flex items-center">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-brand-rose" />
            Dietary Restrictions
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Eggless', 'Vegan', 'Sugar-Free', 'Gluten-Free'].map((restriction) => {
              const isChecked = formData.dietaryRestrictions.includes(restriction);
              return (
                <button
                  key={restriction}
                  type="button"
                  onClick={() => handleCheckboxChange(restriction)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border text-xs font-bold transition-all ${
                    isChecked
                      ? 'bg-brand-pink border-brand-rose text-brand-chocolate'
                      : 'bg-brand-cream border-brand-pink/50 hover:bg-brand-pink/20 text-brand-chocolate-light'
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 text-brand-chocolate" />}
                  <span>{restriction}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Preferences & Comments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dessert Preferences */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light flex items-center">
              <PenTool className="h-3.5 w-3.5 mr-1.5 text-brand-rose" />
              Dessert Preferences
            </label>
            <textarea
              name="preferences"
              value={formData.preferences}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g. Prefer creamy items, macaron assortments, soft cookies, children-friendly shapes..."
              className="w-full bg-brand-cream border border-brand-pink/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors placeholder:text-brand-chocolate-light/30"
            />
          </div>

          {/* Special Instructions */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light flex items-center">
              <PenTool className="h-3.5 w-3.5 mr-1.5 text-brand-rose" />
              Special Instructions
            </label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g. Theme is royal pink gold, need suggestions for layout stand, keep warm treats separate..."
              className="w-full bg-brand-cream border border-brand-pink/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors placeholder:text-brand-chocolate-light/30"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-4 border-t border-brand-pink/30 gap-4">
          
          {/* Save as Template Toggle */}
          <div>
            {!showSaveTemplate ? (
              <button
                type="button"
                onClick={() => setShowSaveTemplate(true)}
                className="flex items-center text-xs font-bold text-brand-chocolate-light hover:text-brand-chocolate py-2 hover:underline focus:outline-none"
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save these settings as template preset
              </button>
            ) : (
              <div className="flex items-center space-x-2 animate-fade-in">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template Name (e.g. Aunt Lisa's 60th)"
                  className="bg-brand-cream border border-brand-pink/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-rose"
                />
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                  className="bg-brand-rose hover:bg-brand-rose-dark text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center transition-colors disabled:opacity-50"
                >
                  {saveSuccess ? <Check className="h-3.5 w-3.5 mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                  {saveSuccess ? 'Saved!' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveTemplate(false);
                    setTemplateName('');
                  }}
                  className="text-xs font-semibold text-brand-chocolate-light hover:underline px-2"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center bg-brand-chocolate hover:bg-brand-chocolate-light text-brand-cream hover:text-white px-8 py-4 rounded-2xl font-bold shadow-premium transition-all duration-300 hover:translate-y-[-2px] disabled:opacity-60 text-base"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-brand-cream border-t-transparent rounded-full animate-spin mr-3"></div>
            ) : (
              <Sparkles className="h-5 w-5 mr-2 animate-bounce" />
            )}
            {isSubmitting ? 'Consulting Chef AI...' : 'Suggest Pairing Menu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PairingForm;
