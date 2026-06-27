import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, Star, Sparkles, ThumbsUp, ThumbsDown, Calendar, Cake, ShieldAlert, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await authFetch('/admin/analytics');
        setStats(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch admin analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-brand-beige rounded-2xl w-1/4 shimmer-bg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white border border-brand-pink/30 rounded-3xl shimmer-bg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-white border border-brand-pink/30 rounded-3xl md:col-span-2 shimmer-bg"></div>
          <div className="h-64 bg-white border border-brand-pink/30 rounded-3xl shimmer-bg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-3xl text-sm font-semibold text-center max-w-xl mx-auto">
        <ShieldAlert className="h-12 w-12 text-red-600 mx-auto mb-3" />
        <h3 className="font-serif text-lg font-bold">Access Error</h3>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  const {
    totalGenerations = 0,
    averageRating = 0,
    likes = 0,
    dislikes = 0,
    topEvents = [],
    topCakes = [],
    totalUsers = 0,
    activeUsers = 0,
    dailyChart = [],
    recentFeedbacks = []
  } = stats || {};

  const totalReviews = likes + dislikes;
  const likePercentage = totalReviews > 0 ? Math.round((likes / totalReviews) * 100) : 100;

  // Custom SVG Area Chart Helper for Daily Generations
  // Viewbox: 500 x 200
  const renderAreaChart = () => {
    if (dailyChart.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-xs text-brand-chocolate-light/40">
          No trend data recorded.
        </div>
      );
    }

    const padding = 30;
    const chartWidth = 500 - padding * 2;
    const chartHeight = 200 - padding * 2;

    const maxVal = Math.max(...dailyChart.map(d => d.count), 5); // Fallback max scale to 5
    const pointsCount = dailyChart.length;

    // Calculate Coordinates
    const points = dailyChart.map((d, index) => {
      const x = padding + (index / (pointsCount - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - (d.count / maxVal) * chartHeight;
      return { x, y, ...d };
    });

    const pathData = points.length > 0 
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';

    const areaPathData = points.length > 0
      ? `${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`
      : '';

    return (
      <svg viewBox="0 0 500 200" className="w-full h-full text-brand-chocolate">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5A99E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E5A99E" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines (horizontal) */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * ratio;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={500 - padding}
              y2={y}
              stroke="#F5EDE4"
              strokeWidth="0.8"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Shaded Area */}
        {areaPathData && <path d={areaPathData} fill="url(#chartGrad)" />}

        {/* Trend Line */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke="#3D271D"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data Vertices */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#E5A99E"
              stroke="#3D271D"
              strokeWidth="1.5"
              className="hover:scale-125 transition-transform"
            />
            {/* Tooltip on Hover */}
            <title>{`${p.date}: ${p.count} pairings`}</title>
          </g>
        ))}

        {/* Labels for Dates */}
        {points.filter((_, i) => i === 0 || i === Math.floor(pointsCount / 2) || i === pointsCount - 1).map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={200 - 8}
            fontSize="8"
            fontWeight="bold"
            fill="#6E4D3C"
            textAnchor="middle"
          >
            {p.date.substring(5)} {/* MM-DD */}
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="font-serif text-3xl font-extrabold text-brand-chocolate">Admin Analytics & Trends</h2>
        <p className="text-xs uppercase tracking-widest font-bold text-brand-chocolate-light">
          Monitor request volumes, feedback sentiment, and popular cake designs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Generations */}
        <div className="bg-white border border-brand-pink/35 rounded-3xl p-6 shadow-soft flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-chocolate-light">Total Consultations</span>
            <h3 className="text-3xl font-extrabold text-brand-chocolate">{totalGenerations}</h3>
          </div>
          <div className="p-3 bg-brand-pink/30 text-brand-chocolate rounded-2xl">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        {/* Average Stars */}
        <div className="bg-white border border-brand-pink/35 rounded-3xl p-6 shadow-soft flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-chocolate-light">Average Rating</span>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-3xl font-extrabold text-brand-chocolate">{averageRating}</h3>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Star className="h-6 w-6 fill-amber-600" />
          </div>
        </div>

        {/* AI Satisfaction Rate */}
        <div className="bg-white border border-brand-pink/35 rounded-3xl p-6 shadow-soft flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-chocolate-light">Chef Satisfaction</span>
            <h3 className="text-3xl font-extrabold text-brand-chocolate">{likePercentage}%</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl flex space-x-1">
            <ThumbsUp className="h-5 w-5 fill-emerald-600" />
          </div>
        </div>

        {/* Users Count */}
        <div className="bg-white border border-brand-pink/35 rounded-3xl p-6 shadow-soft flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-chocolate-light">Active Catering Users</span>
            <h3 className="text-3xl font-extrabold text-brand-chocolate">{activeUsers} <span className="text-xs font-normal text-brand-chocolate-light">/ {totalUsers}</span></h3>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trend Area Chart */}
        <div className="bg-white border border-brand-pink/35 rounded-[32px] p-6 shadow-premium lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-brand-pink/20 pb-3">
            <h4 className="font-serif text-lg font-bold text-brand-chocolate flex items-center">
              <BarChart3 className="h-5 w-5 text-brand-rose mr-2" />
              Daily Pairing Generations
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-chocolate-light">Trend (Last 15 days)</span>
          </div>
          
          <div className="h-52 w-full pt-2">
            {renderAreaChart()}
          </div>
        </div>

        {/* Popular Event Categories */}
        <div className="bg-white border border-brand-pink/35 rounded-[32px] p-6 shadow-premium space-y-4">
          <div className="flex justify-between items-center border-b border-brand-pink/20 pb-3">
            <h4 className="font-serif text-lg font-bold text-brand-chocolate flex items-center">
              <Calendar className="h-5 w-5 text-brand-rose mr-2" />
              Top Event Types
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-chocolate-light">Share</span>
          </div>

          <div className="space-y-4 pt-2">
            {topEvents.length === 0 ? (
              <p className="text-center text-xs text-brand-chocolate-light/40 py-8">No events registered.</p>
            ) : (
              topEvents.map((evt, idx) => {
                const total = topEvents.reduce((acc, curr) => acc + curr.count, 0);
                const percent = total > 0 ? Math.round((evt.count / total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-brand-chocolate">
                      <span>{evt.event_type}</span>
                      <span>{evt.count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-brand-cream h-2.5 rounded-full overflow-hidden border border-brand-pink/20">
                      <div
                        className="bg-brand-rose h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Cake Types and Feedback Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cake Preferences Chart */}
        <div className="bg-white border border-brand-pink/35 rounded-[32px] p-6 shadow-premium space-y-4">
          <div className="flex justify-between items-center border-b border-brand-pink/20 pb-3">
            <h4 className="font-serif text-lg font-bold text-brand-chocolate flex items-center">
              <Cake className="h-5 w-5 text-brand-rose mr-2" />
              Popular Cake Choices
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-chocolate-light">Count</span>
          </div>

          <div className="space-y-4 pt-2">
            {topCakes.length === 0 ? (
              <p className="text-center text-xs text-brand-chocolate-light/40 py-8">No cake choices registered.</p>
            ) : (
              topCakes.map((cake, idx) => {
                const totalCakes = topCakes.reduce((acc, curr) => acc + curr.count, 0);
                const pct = totalCakes > 0 ? Math.round((cake.count / totalCakes) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-brand-chocolate">
                      <span>{cake.main_cake_type}</span>
                      <span>{cake.count} counts</span>
                    </div>
                    <div className="w-full bg-brand-cream h-2.5 rounded-full overflow-hidden border border-brand-pink/20">
                      <div
                        className="bg-brand-chocolate h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Feedbacks Logs */}
        <div className="bg-white border border-brand-pink/35 rounded-[32px] p-6 shadow-premium lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-brand-pink/20 pb-3">
            <h4 className="font-serif text-lg font-bold text-brand-chocolate flex items-center">
              <ThumbsUp className="h-5 w-5 text-brand-rose mr-2" />
              Recent AI Quality Feedback Logs
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-chocolate-light">Reviews</span>
          </div>

          <div className="space-y-3 pt-2">
            {recentFeedbacks.length === 0 ? (
              <p className="text-center text-xs text-brand-chocolate-light/40 py-8">No client reviews submitted yet.</p>
            ) : (
              recentFeedbacks.map((f, idx) => (
                <div key={idx} className="p-3 bg-brand-cream border border-brand-pink/25 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-brand-chocolate">{f.event_type} ({f.main_cake_type} Cake)</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center ${
                        f.sentiment === 'like' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {f.sentiment === 'like' ? <ThumbsUp className="h-2.5 w-2.5 mr-0.5" /> : <ThumbsDown className="h-2.5 w-2.5 mr-0.5" />}
                        {f.sentiment.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-amber-500 space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-brand-pink/40'}`} />
                      ))}
                    </div>
                  </div>
                  {f.comment && (
                    <p className="text-brand-chocolate-light font-medium leading-relaxed italic">
                      "{f.comment}"
                    </p>
                  )}
                  <span className="text-[9px] text-brand-chocolate-light/40 block text-right font-semibold">
                    {new Date(f.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
