"use client"

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue, useSpring, useInView, animate } from 'framer-motion';
import { Utensils, Store, ChefHat, Star, Flame, Users, TrendingUp, ShoppingBag, Globe } from 'lucide-react';

// ======================= ANIMATED COUNTER =======================
const AnimatedCounter = ({ to, suffix = "" }: { to: number, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView && ref.current) {
      animate(0, to, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(val) {
          if (ref.current) ref.current.textContent = Math.round(val).toLocaleString() + suffix;
        }
      });
    }
  }, [inView, to, suffix]);

  return <span ref={ref} className="font-mono">0{suffix}</span>;
};

// ======================= VEG / PREMIUM ITEMS (9 Verified Safe Images) =======================
const vegItems = [
  { id: 1, url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', size: 'w-64 h-64 md:w-[340px] md:h-[340px]', x: 0, y: 0, z: 120, delay: 0, isMain: true, label: "GOURMET BURGER" },
  { id: 2, url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591', size: 'w-48 h-48 md:w-64 md:h-64', x: -350, y: -200, z: 80, delay: 0.5 }, // Pizza
  { id: 3, url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', size: 'w-40 h-40 md:w-56 md:h-56', x: 350, y: -180, z: 90, delay: 1.2 }, // Salad
  { id: 4, url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38', size: 'w-36 h-36 md:w-48 md:h-48', x: -320, y: 250, z: 70, delay: 0.8 }, // Pancakes
  { id: 5, url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b', size: 'w-40 h-40 md:w-52 md:h-52', x: 340, y: 220, z: 60, delay: 1.5 }, // Tacos
  { id: 6, url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601', size: 'w-32 h-32 md:w-44 md:h-44', x: 0, y: -380, z: 50, delay: 0.3 }, // Pasta
  { id: 7, url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf', size: 'w-32 h-32 md:w-40 md:h-40', x: 0, y: 380, z: 45, delay: 1.8 }, // Coffee
  { id: 8, url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', size: 'w-28 h-28 md:w-36 md:h-36', x: -550, y: 50, z: 40, delay: 2.1 }, // Cake
  { id: 9, url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f', size: 'w-28 h-28 md:w-36 md:h-36', x: 550, y: 20, z: 35, delay: 1.1 }, // Ice Cream
];

// ======================= NON-VEG / MEAT ITEMS (9 Verified Safe Images) =======================
const nonVegItems = [
  { id: 1, url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e', size: 'w-64 h-64 md:w-[340px] md:h-[340px]', x: 0, y: 0, z: 120, delay: 0, isMain: true, label: "PREMIUM STEAK" },
  { id: 2, url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', size: 'w-48 h-48 md:w-64 md:h-64', x: -350, y: -200, z: 80, delay: 0.5 }, // Ribs
  { id: 3, url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', size: 'w-40 h-40 md:w-56 md:h-56', x: 350, y: -180, z: 90, delay: 1.2 }, // Meat Plate
  { id: 4, url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d', size: 'w-36 h-36 md:w-48 md:h-48', x: -320, y: 250, z: 70, delay: 0.8 }, // Fried Chicken
  { id: 5, url: 'https://images.unsplash.com/photo-1524114664604-cd8133cd67ad', size: 'w-40 h-40 md:w-52 md:h-52', x: 340, y: 220, z: 60, delay: 1.5 }, // Wings
  { id: 6, url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba', size: 'w-32 h-32 md:w-44 md:h-44', x: 0, y: -380, z: 50, delay: 0.3 }, // BBQ
  { id: 7, url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', size: 'w-32 h-32 md:w-40 md:h-40', x: 0, y: 380, z: 45, delay: 1.8 }, // Burger
  { id: 8, url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591', size: 'w-28 h-28 md:w-36 md:h-36', x: -550, y: 50, z: 40, delay: 2.1 }, // Pizza
  { id: 9, url: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4', size: 'w-28 h-28 md:w-36 md:h-36', x: 550, y: 20, z: 35, delay: 1.1 }, // Kabab
];

// ======================= ANIMATED PREMIUM BACKGROUNDS =======================
const PremiumBackground = ({ type }: { type: 'veg' | 'nonveg' }) => {
  if (type === 'veg') {
    return (
      // The background gradient here now blends seamlessly into the non-veg top color (#2a0800) at the very bottom
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#020617] via-[#064e3b] to-[#2a0800]">
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 100, -100, 0], y: [0, 50, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/20 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div 
          animate={{ x: [0, -100, 100, 0], y: [0, -50, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-amber-500/15 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] bg-teal-500/15 rounded-full blur-[120px] mix-blend-screen"
        />
        {/* Textures */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]"></div>
      </div>
    );
  }

  return (
    // The nonveg background starts with the exact color the veg section ends with (#2a0800)
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#2a0800] via-[#450a0a] to-[#1a0505]">
      {/* Animated Orbs */}
      <motion.div 
        animate={{ x: [0, 100, -100, 0], y: [0, -50, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-red-600/30 rounded-full blur-[150px] mix-blend-screen"
      />
      <motion.div 
        animate={{ x: [0, -100, 100, 0], y: [0, 50, -50, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-orange-600/20 rounded-full blur-[150px] mix-blend-screen"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] bg-rose-600/20 rounded-full blur-[120px] mix-blend-screen"
      />
      {/* Textures */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]"></div>
    </div>
  );
};


// ======================= REUSABLE FLOATING SCENE =======================
const FloatingScene = ({ items, type }: { items: typeof vegItems, type: 'veg' | 'nonveg' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 60, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 60, damping: 20 });
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const rX = (((e.clientY - rect.top) / rect.height) - 0.5) * -35; // Smoother rotation
    const rY = (((e.clientX - rect.left) / rect.width) - 0.5) * 35;
    x.set(rX);
    y.set(rY);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const isVeg = type === 'veg';

  return (
    <div className="relative w-full max-w-6xl h-[600px] md:h-[800px] mx-auto perspective-[1200px] mt-10" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} ref={ref}>
      <motion.div style={{ transformStyle: "preserve-3d", transform }} className="w-full h-full relative flex items-center justify-center">
        {items.map((item) => (
          <motion.div key={item.id} initial={{ x: item.x, y: item.y, z: item.z }}
            animate={{ y: [item.y - 20, item.y + 20, item.y - 20], rotateZ: item.isMain ? [0, 5, 0] : [0, item.x > 0 ? 15 : -15, 0] }}
            transition={{ duration: 6 + (item.delay * 2), repeat: Infinity, ease: "easeInOut", delay: item.delay }}
            style={{ zIndex: item.z > 50 ? 30 : item.z > 20 ? 20 : 10 }}
            className={`absolute ${item.size} rounded-full border ${isVeg ? 'border-emerald-500/20 bg-emerald-950/50' : 'border-red-500/20 bg-red-950/50'} overflow-hidden shadow-2xl flex items-center justify-center ${item.isMain ? `border-4 ring-8 ${isVeg ? 'ring-emerald-500/30 shadow-[0_30px_80px_rgba(16,185,129,0.5)]' : 'ring-red-600/30 shadow-[0_30px_80px_rgba(220,38,38,0.5)]'}` : 'opacity-95 hover:opacity-100 hover:scale-110 transition-transform cursor-pointer'}`}
          >
            <img src={`${item.url}?q=80&w=800&auto=format&fit=crop`} alt="Food" className="w-full h-full object-cover" />
            {item.isMain && (
              <>
                <div className={`absolute inset-0 bg-gradient-to-t ${isVeg ? 'from-emerald-950/90' : 'from-red-950/90'} via-black/10 to-transparent`}></div>
                <div className="absolute bottom-8 text-center w-full font-black text-white tracking-widest text-2xl md:text-3xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">{item.label}</div>
              </>
            )}
          </motion.div>
        ))}
        
        {/* Floating Accent Badges */}
        {isVeg ? (
          <>
            <motion.div initial={{ x: -200, y: -50, z: 150 }} animate={{ y: [-50, -30, -50] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute z-40 px-6 py-4 bg-emerald-950/80 backdrop-blur-xl rounded-full border border-emerald-500/50 text-emerald-400 font-bold text-sm md:text-lg flex items-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <Star className="w-6 h-6 mr-2 fill-emerald-400" /> 4.9 Top Rated Sellers
            </motion.div>
            <motion.div initial={{ x: 200, y: 100, z: 130 }} animate={{ y: [100, 120, 100] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute z-40 px-6 py-4 bg-teal-950/80 backdrop-blur-xl rounded-full border border-teal-500/50 text-teal-400 font-bold text-sm md:text-lg flex items-center shadow-[0_0_30px_rgba(20,184,166,0.4)]">
              <Utensils className="w-6 h-6 mr-2" /> 10,000+ Premium Dishes
            </motion.div>
          </>
        ) : (
          <>
            <motion.div initial={{ x: -200, y: -50, z: 150 }} animate={{ y: [-50, -30, -50] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute z-40 px-6 py-4 bg-red-950/80 backdrop-blur-xl rounded-full border border-red-500/50 text-red-400 font-bold text-sm md:text-lg flex items-center shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              <Flame className="w-6 h-6 mr-2 fill-red-500" /> Spicy & Smoky
            </motion.div>
            <motion.div initial={{ x: 200, y: 100, z: 130 }} animate={{ y: [100, 120, 100] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute z-40 px-6 py-4 bg-orange-950/80 backdrop-blur-xl rounded-full border border-orange-500/50 text-orange-400 font-bold text-sm md:text-lg flex items-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
              <Utensils className="w-6 h-6 mr-2" /> Premium Cuts
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};


// ======================= MAIN PAGE =======================
export default function UnifiedMainWebsite() {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden relative font-sans selection:bg-orange-500/30 text-white">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between p-4 md:px-12 border-b border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-3 cursor-pointer">
           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
             <ChefHat className="text-white w-6 h-6 md:w-7 md:h-7" />
           </div>
           <span className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">Samrat Market</span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/user/home">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-bold transition-colors backdrop-blur-md shadow-lg">
              <Utensils className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              <span className="hidden sm:block tracking-wide">Order Food</span>
              <span className="sm:hidden text-sm">Order</span>
            </motion.div>
          </Link>
          
          <Link href="/seller/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-black">
              <Store className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:block tracking-wide">Open Dukaan</span>
              <span className="sm:hidden text-sm">Sell</span>
            </motion.div>
          </Link>
        </div>
      </nav>

      {/* ================= SECTION 1: VEG PREMIUM MARKET ================= */}
      <section className="relative min-h-screen pt-32 pb-24 flex flex-col items-center">
        <PremiumBackground type="veg" />

        <motion.div initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative z-10 text-center max-w-5xl mx-auto space-y-6 px-4">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 mr-3 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-xs md:text-sm font-bold text-emerald-100 tracking-widest uppercase">The Future of Dining</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-50 to-emerald-900 tracking-tighter leading-[1.05] drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            Pure <br className="hidden sm:block" /> Vegetarian
          </h1>
        </motion.div>

        <div className="relative z-10 w-full mt-4">
          <FloatingScene items={vegItems} type="veg" />
        </div>
      </section>

      {/* ================= SECTION 2: NON-VEG MEAT MARKET ================= */}
      <section className="relative min-h-screen py-32 flex flex-col items-center">
        <PremiumBackground type="nonveg" />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative z-10 text-center max-w-5xl mx-auto space-y-6 px-4">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-red-950/40 border border-red-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            <span className="flex h-3 w-3 rounded-full bg-red-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <span className="text-xs md:text-sm font-bold text-red-200 tracking-widest uppercase">Pure Non-Veg Experience</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-red-100 to-red-900 tracking-tighter leading-[1.05] drop-shadow-[0_0_30px_rgba(220,38,38,0.2)]">
            Pure <br className="hidden sm:block" /> Non-Vegetarian
          </h1>
        </motion.div>

        <div className="relative z-10 w-full mt-4">
          <FloatingScene items={nonVegItems} type="nonveg" />
        </div>
      </section>
      {/* ================= SECTION 3: LIVE STATS SHOWCASE & CTA ================= */}
      <section className="relative py-24 md:py-32 flex flex-col items-center bg-gradient-to-b from-[#1a0505] to-black">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-4 mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight">The Fastest Growing <br/> Food Network</h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">Join thousands of food lovers and top-rated restaurants on a platform built for speed, quality, and premium taste.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-24">
            {[
              { icon: Users, label: "Active Foodies", value: 150000, suffix: "+", color: "from-blue-500 to-cyan-400", shadow: "shadow-blue-500/20", glow: "group-hover:shadow-blue-500/40" },
              { icon: Store, label: "Verified Dukandaar", value: 2500, suffix: "+", color: "from-emerald-500 to-green-400", shadow: "shadow-emerald-500/20", glow: "group-hover:shadow-emerald-500/40" },
              { icon: ChefHat, label: "Premium Dishes", value: 50000, suffix: "+", color: "from-orange-500 to-amber-400", shadow: "shadow-orange-500/20", glow: "group-hover:shadow-orange-500/40" },
              { icon: ShoppingBag, label: "Orders Delivered", value: 5, suffix: "M+", color: "from-purple-500 to-pink-400", shadow: "shadow-purple-500/20", glow: "group-hover:shadow-purple-500/40" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} className={`relative group p-[2px] rounded-[2rem] overflow-hidden transition-all hover:-translate-y-2`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-sm`}></div>
                <div className="relative h-full w-full bg-zinc-950/80 backdrop-blur-xl p-8 rounded-[1.9rem] flex flex-col items-center text-center shadow-2xl border border-white/5">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-[1.9rem]`}></div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-xl ${stat.shadow} ${stat.glow} transition-all duration-500 group-hover:scale-110`}>
                    <stat.icon className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">
                    <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-zinc-400 font-semibold tracking-wide uppercase text-sm mt-1">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Marquee Brands */}
          <div className="w-full overflow-hidden flex flex-col items-center mb-24 border-y border-white/5 py-10 relative">
            <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-10"></div>
            <p className="text-gray-500 uppercase tracking-[0.3em] font-bold text-sm mb-8">Trusted by Premium Partners</p>
            <div className="flex space-x-16 items-center animate-[marquee_20s_linear_infinite] whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity cursor-default">
              {['KFC', 'Domino\'s', 'Burger King', 'Starbucks', 'Subway', 'Pizza Hut', 'McDonald\'s', 'Taco Bell', 'KFC', 'Domino\'s', 'Burger King'].map((brand, i) => (
                <span key={i} className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-400">{brand}</span>
              ))}
            </div>
            <style jsx>{`
              @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            `}</style>
          </div>

          {/* Dual CTA */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative rounded-[3rem] overflow-hidden p-1 bg-gradient-to-b from-white/10 to-transparent">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-black to-emerald-600/20"></div>
            <div className="relative bg-[#0a0a0a] rounded-[2.8rem] p-12 md:p-20 text-center flex flex-col items-center border border-white/5">
              <Globe className="w-16 h-16 text-gray-500 mb-6 opacity-50" />
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6">Ready to Join the <br/> Future of Food?</h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12">Whether you are craving a premium meal or ready to build your food empire, the Samrat Market is waiting for you.</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg mx-auto">
                <Link href="/user/home" className="w-full">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-full bg-white text-black font-black text-lg hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    <Utensils className="w-5 h-5" /> Start Ordering
                  </motion.div>
                </Link>
                <Link href="/seller/register" className="w-full">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-full bg-transparent border border-white/20 text-white font-black text-lg hover:bg-white/5 transition-colors">
                    <Store className="w-5 h-5" /> Become a Seller
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
