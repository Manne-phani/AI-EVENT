import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Star, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FeedbackSection = ({ generationId, existingFeedback = null }) => {
  const { authFetch } = useAuth();
  const [sentiment, setSentiment] = useState(null); // 'like' | 'dislike'
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Pre-populate if existing feedback is supplied
  useEffect(() => {
    if (existingFeedback) {
      setSentiment(existingFeedback.sentiment);
      setRating(existingFeedback.rating);
      setComment(existingFeedback.comment || '');
      setSubmitted(true);
    } else {
      setSentiment(null);
      setRating(0);
      setComment('');
      setSubmitted(false);
    }
    setError(null);
  }, [generationId, existingFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sentiment) {
      setError('Please select 👍 or 👎.');
      return;
    }
    if (rating === 0) {
      setError('Please select a star rating (1-5).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authFetch('/feedback', {
        method: 'POST',
        body: JSON.stringify({
          generationId,
          rating,
          sentiment,
          comment
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted && !existingFeedback) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-3xl p-6 md:p-8 text-center space-y-3 shadow-soft max-w-xl mx-auto animate-fade-in">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
        <h3 className="font-serif text-xl font-bold text-brand-chocolate">Thank you for your feedback!</h3>
        <p className="text-sm text-brand-chocolate-light font-medium">
          Your input helps us train the Cakes & Crunches AI models to recommend better dessert menus.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs font-semibold text-brand-chocolate hover:underline mt-2"
        >
          Edit your feedback
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-pink/40 rounded-3xl p-6 md:p-8 shadow-premium max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h3 className="font-serif text-xl font-bold text-brand-chocolate">How was your AI Pairing recommendation?</h3>
        <p className="text-xs text-brand-chocolate-light uppercase tracking-wider font-semibold">Help us improve Cakes & Crunches catering</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Thumb Sentiment */}
        <div className="flex justify-center space-x-6">
          <button
            type="button"
            onClick={() => {
              setSentiment('like');
              if (rating === 0) setRating(5); // Auto-fill 5 stars if like
            }}
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              sentiment === 'like'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-600 scale-105 shadow-soft'
                : 'border-brand-pink/50 hover:bg-brand-beige/30 text-brand-chocolate-light'
            }`}
          >
            <ThumbsUp className="h-7 w-7" />
            <span className="text-xs font-bold block mt-1 text-center">Good</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSentiment('dislike');
              if (rating === 0 || rating > 3) setRating(2); // Suggest low stars if dislike
            }}
            className={`p-4 rounded-2xl border transition-all duration-300 ${
              sentiment === 'dislike'
                ? 'bg-red-50 border-red-400 text-red-600 scale-105 shadow-soft'
                : 'border-brand-pink/50 hover:bg-brand-beige/30 text-brand-chocolate-light'
            }`}
          >
            <ThumbsDown className="h-7 w-7" />
            <span className="text-xs font-bold block mt-1 text-center">Bad</span>
          </button>
        </div>

        {/* Star Rating */}
        <div className="space-y-2 text-center">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light block">
            Star Rating
          </label>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110 p-1"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredStar || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-brand-pink/80'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-chocolate-light block">
            Add Comments (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Tell us what you liked or what could be improved..."
            className="w-full bg-brand-cream border border-brand-pink/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors placeholder:text-brand-chocolate-light/40"
          />
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-600 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-brand-chocolate hover:bg-brand-chocolate-light text-brand-cream py-3.5 px-6 rounded-2xl font-bold shadow-premium transition-all hover:translate-y-[-1px] disabled:opacity-55"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-brand-cream border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackSection;
