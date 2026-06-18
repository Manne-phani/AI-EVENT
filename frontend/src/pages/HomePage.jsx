import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Clock, Star, Gift, UtensilsCrossed } from 'lucide-react';

const HomePage = ({ setCurrentPage }) => {
  const { isAuthenticated } = useAuth();

  const handleCtaClick = () => {
    if (isAuthenticated) {
      setCurrentPage('pairing');
    } else {
      setCurrentPage('login');
    }
  };

  // Mock Premium Visual assets/metadata
  const featuredCakes = [
    { name: 'Chocolate Truffle Raspberry', desc: 'Layers of rich Belgian chocolate ganache, infused with fresh raspberry compote.', price: '$45+', rating: 5, tag: 'Best Seller', image: '/images/chocolate_cake.png' },
    { name: 'Red Velvet Rose Gold', desc: 'Moist red velvet crumb topped with luxurious cream cheese frosting and edible rose gold leaf.', price: '$52+', rating: 5, tag: 'Signature', image: '/images/red_velvet.png' },
    { name: 'Salted Caramel Butterscotch', desc: 'Sweet butterscotch sponge covered in house-made salted caramel drip and honeycomb crunch.', price: '$48+', rating: 4.9, tag: 'Trending', image: '/images/butterscotch.png' }
  ];

  const pairingExamples = [
    { category: 'Pastries', name: 'Fresh Raspberry Macarons', pairing: 'Pairs perfectly with Chocolate Truffle Cake to balance rich textures.' },
    { category: 'Dessert Shots', name: 'Zesty Lemon Panna Cotta', pairing: 'Clean citrus profiles that cut through heavy buttercream frostings.' },
    { category: 'Savory Snacks', name: 'Salted Caramel Pecan Tartlets', pairing: 'Sweet and salty bites that prolong the dessert table interest.' }
  ];

  const benefits = [
    { title: 'AI-Powered Customization', desc: 'Our smart algorithm recommends pastries that chemically balance and elevate your main cake flavors.', icon: Sparkles },
    { title: 'Zero Waste Planning', desc: 'Precision quantity guidelines based on your guest counts protect you from over-purchasing.', icon: ShieldCheck },
    { title: 'Handcrafted with Love', desc: 'Every pastry is baked fresh in our Cakes & Crunches kitchen using organic local ingredients.', icon: Heart },
    { title: 'Fast & Timely Delivery', desc: 'Safely packaged and delivered directly to your venue right before your event begins.', icon: Clock }
  ];

  const testimonials = [
    { name: 'Sophia Sterling', role: 'Wedding Organizer', review: 'Cakes & Crunches AI Planner helped us design a stunning 200-guest dessert table. The raspberry macarons paired with red velvet cake were a massive hit! Ordering values increased but the outcome was totally worth it.', rating: 5 },
    { name: 'Marcus Miller', role: 'Corporate Event Lead', review: 'Instead of just ordering a standard chocolate cake, we used the sugested lemon shots and cheese boards. Everyone loved the variety, and it looked extremely professional. Recommended!', rating: 5 }
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 text-center max-w-5xl mx-auto px-4">
        {/* Soft floating background rings */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-brand-pink/20 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-36 h-36 bg-brand-rose/10 rounded-full blur-2xl pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center space-x-2 bg-brand-pink/50 border border-brand-rose/30 px-4 py-1.5 rounded-full text-xs font-extrabold text-brand-chocolate tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 text-brand-rose animate-spin-slow" />
            <span>AI Menu Pairing Suggester</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-brand-chocolate leading-[1.15] max-w-4xl mx-auto">
            Perfect Dessert Pairing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-chocolate-light to-brand-rose font-serif italic font-normal">
              for Every Event
            </span>
          </h1>

          <p className="text-base sm:text-lg text-brand-chocolate-light max-w-2xl mx-auto leading-relaxed">
            Elevate your celebration beyond a single cake. Our smart AI menu engine recommends complementary pastries, desserts, and beverages to build a jaw-dropping dessert table.
          </p>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleCtaClick}
              className="flex items-center bg-brand-chocolate hover:bg-brand-chocolate-light text-brand-cream hover:text-white px-8 py-4.5 rounded-2xl text-base font-extrabold shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:translate-y-[-2px] group"
            >
              <span>Design Your Dessert Table</span>
              <ArrowRight className="h-5 w-5 ml-2.5 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-10 max-w-4xl mx-auto rounded-[32px] overflow-hidden shadow-premium border border-brand-pink/30 relative group"
          >
            <img 
              src="/images/dessert_spread.png" 
              alt="Cakes & Crunches Catering Spread Layout" 
              className="w-full h-[280px] md:h-[360px] object-cover transition-transform duration-700 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-chocolate/65 via-brand-chocolate/20 to-transparent flex items-end p-6 md:p-10">
              <div className="text-left space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-brand-rose bg-white/10 px-2 py-0.5 rounded-full inline-block">
                  Catering Layouts
                </span>
                <p className="text-white font-serif text-lg md:text-2xl font-bold tracking-wide">
                  Complete Sweet spreads handcrafted for your special events
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Featured Centerpiece Cakes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-brand-chocolate">
            Gourmet Centerpiece Cakes
          </h2>
          <p className="text-xs uppercase tracking-widest font-bold text-brand-chocolate-light">
            Choose your centerpiece and let AI suggest the rest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCakes.map((cake, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="bg-white border border-brand-pink/30 rounded-[32px] overflow-hidden shadow-soft hover:shadow-premium transition-all duration-300 p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-44 rounded-2xl overflow-hidden relative shadow-soft bg-brand-beige">
                  <img 
                    src={cake.image} 
                    alt={cake.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                  />
                  <span className="text-xs uppercase tracking-widest font-extrabold text-brand-chocolate bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-soft absolute top-3 left-3 border border-brand-pink/20">
                    {cake.tag}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-brand-chocolate">{cake.name}</h3>
                <p className="text-xs text-brand-chocolate-light leading-relaxed">{cake.desc}</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-brand-pink/25 mt-4">
                <span className="text-sm font-black text-brand-chocolate">{cake.price}</span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(cake.rating) ? 'fill-amber-400 text-amber-400' : 'text-brand-pink'}`} />
                  ))}
                  <span className="text-xs font-bold text-brand-chocolate-light ml-1">{cake.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Dynamic Pairing Ideas banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-beige/50 border border-brand-pink/30 rounded-[40px] p-8 md:p-12 shadow-soft space-y-8">
          <div className="text-center md:text-left md:flex justify-between items-center gap-6 border-b border-brand-pink/30 pb-6">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-brand-chocolate">
                Popular Bakery Combinations
              </h2>
              <p className="text-xs uppercase tracking-widest font-bold text-brand-chocolate-light">
                What expert pastry chefs recommend
              </p>
            </div>
            <button
              onClick={handleCtaClick}
              className="mt-4 md:mt-0 px-6 py-3 bg-brand-chocolate hover:bg-brand-chocolate-light text-brand-cream hover:text-white rounded-xl text-xs font-bold transition-all shadow-premium"
            >
              Try Menu Planner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pairingExamples.map((ex, idx) => (
              <div key={idx} className="bg-white border border-brand-pink/20 rounded-2xl p-5 space-y-2 shadow-soft">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-rose bg-brand-pink/35 px-2 py-0.5 rounded-full inline-block">
                  {ex.category}
                </span>
                <h4 className="font-sans text-sm font-bold text-brand-chocolate">{ex.name}</h4>
                <p className="text-xs text-brand-chocolate-light leading-relaxed">{ex.pairing}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Cakes & Crunches */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-brand-chocolate">
            Cakes & Crunches Experience
          </h2>
          <p className="text-xs uppercase tracking-widest font-bold text-brand-chocolate-light">
            We deliver more than just high-quality flavor
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-brand-pink/30 rounded-3xl p-6 shadow-soft space-y-4 hover:shadow-premium hover:translate-y-[-2px] transition-all duration-300"
              >
                <div className="p-3 bg-brand-pink/40 text-brand-chocolate rounded-2xl w-fit">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-chocolate">{b.title}</h3>
                <p className="text-xs text-brand-chocolate-light leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Customer Testimonials */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-3xl font-extrabold text-brand-chocolate">Client Testimonials</h2>
          <p className="text-xs uppercase tracking-widest font-bold text-brand-chocolate-light">Real ratings from real catering events</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white border border-brand-pink/30 rounded-3xl p-6 md:p-8 shadow-soft space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex space-x-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs italic text-brand-chocolate-light leading-relaxed">
                  "{t.review}"
                </p>
              </div>
              <div className="pt-4 border-t border-brand-pink/20 mt-4 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-brand-chocolate">{t.name}</h4>
                  <span className="text-[10px] text-brand-chocolate-light/60 font-medium block">{t.role}</span>
                </div>
                <div className="text-brand-rose">
                  <Gift className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-brand-chocolate-light to-brand-chocolate text-brand-cream border border-brand-chocolate rounded-[40px] p-8 md:p-12 text-center space-y-6 shadow-premium relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full transform -translate-x-12 -translate-y-12"></div>
          <div className="space-y-2 relative z-10">
            <h2 className="font-serif text-3xl md:text-4xl font-extrabold">Ready to Suggest Your Menu?</h2>
            <p className="text-xs text-brand-cream/80 max-w-md mx-auto leading-relaxed">
              Answer 5 quick questions about your guests, cake, and preferences, and let the Cakes & Crunches AI suggestion box recommend the perfect dessert spread.
            </p>
          </div>
          <div className="pt-2 relative z-10">
            <button
              onClick={handleCtaClick}
              className="bg-brand-pink hover:bg-brand-rose text-brand-chocolate font-bold px-8 py-4 rounded-2xl shadow-soft transition-all duration-300 hover:translate-y-[-1px] inline-flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4 animate-spin-slow" />
              <span>Launch AI Pairing Suggester</span>
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-brand-pink/40 pt-8 mt-12 text-center text-xs text-brand-chocolate-light/60 space-y-1">
        <p className="font-serif font-bold text-brand-chocolate">Cakes & Crunches Bakery Company</p>
        <p className="font-medium">© {new Date().getFullYear()} Cakes & Crunches. All catering rights reserved.</p>
        <p className="text-[10px] text-brand-chocolate-light/40 mt-2">Internship Project - Designed for Cakes and Crunches Event Service Integration.</p>
      </footer>

    </div>
  );
};

export default HomePage;
