import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Event Summary Box */}
      <div className="bg-brand-beige/50 border border-brand-pink/30 rounded-3xl p-6 md:p-8 space-y-3 shadow-soft">
        <div className="h-4 bg-brand-rose/25 rounded-md w-1/4 shimmer-bg"></div>
        <div className="h-6 bg-brand-rose/15 rounded-md w-3/4 shimmer-bg"></div>
        <div className="h-4 bg-brand-rose/10 rounded-md w-1/2 shimmer-bg"></div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-soft space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-beige rounded-2xl shimmer-bg"></div>
              <div className="h-5 bg-brand-rose/20 rounded-md w-1/3 shimmer-bg"></div>
            </div>
            {/* Items */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-brand-rose/15 rounded-md w-1/2 shimmer-bg"></div>
                <div className="h-3 bg-brand-rose/25 rounded-full w-12 shimmer-bg"></div>
              </div>
              <div className="h-3 bg-brand-rose/10 rounded-md w-5/6 shimmer-bg"></div>
              <div className="border-t border-dashed border-brand-beige my-2"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-brand-rose/15 rounded-md w-1/3 shimmer-bg"></div>
                <div className="h-3 bg-brand-rose/25 rounded-full w-10 shimmer-bg"></div>
              </div>
              <div className="h-3 bg-brand-rose/10 rounded-md w-4/5 shimmer-bg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Reasoning and metadata block */}
      <div className="bg-white border border-brand-pink/30 rounded-3xl p-6 md:p-8 space-y-4 shadow-soft">
        <div className="h-5 bg-brand-rose/20 rounded-md w-1/3 shimmer-bg"></div>
        <div className="space-y-2">
          <div className="h-3.5 bg-brand-rose/10 rounded-md w-full shimmer-bg"></div>
          <div className="h-3.5 bg-brand-rose/10 rounded-md w-11/12 shimmer-bg"></div>
          <div className="h-3.5 bg-brand-rose/10 rounded-md w-4/5 shimmer-bg"></div>
        </div>
      </div>
      
      {/* CTA upsell block */}
      <div className="bg-brand-pink/20 border border-brand-rose/30 rounded-3xl p-6 text-center space-y-3">
        <div className="h-4 bg-brand-rose/20 rounded-md w-1/4 mx-auto shimmer-bg"></div>
        <div className="h-3 bg-brand-rose/10 rounded-md w-1/2 mx-auto shimmer-bg"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
