"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Star, Clock, Flame, Utensils, SlidersHorizontal, Store, X, Menu, Plus, Minus, ShoppingBag, CheckCircle2, Loader2, CreditCard, Banknote, ChevronRight, Search, Bike, PackageOpen, MapPin, Navigation, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import { LoginModal } from "@/components/user/LoginModal";
import { CheckoutModal } from "@/components/user/CheckoutModal";

export default function UserHomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar / Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // vegan, non-veg
  const [searchQuery, setSearchQuery] = useState("");
  
  // Location & Advanced Filters
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [shopCategoryFilter, setShopCategoryFilter] = useState('all');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Auth & Checkout State
  const [userToken, setUserToken] = useState("");
  const [userId, setUserId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Live Order State
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  // Fetch active orders polling
  const dismissedOrderIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let interval: any;
    const fetchActiveOrders = async () => {
      if (!userToken) return;
      try {
        const res = await fetch(`${API_URL}/api/users/orders`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        if (res.ok) {
          const orders = await res.json();
          const active = orders.filter((o: any) => {
            if (dismissedOrderIdsRef.current.has(o._id)) return false;
            
            if (['cancelled'].includes(o.status)) {
               const updatedTime = new Date(o.updatedAt).getTime();
               const now = new Date().getTime();
               return (now - updatedTime) < 60000; // Show cancelled for 60s unless dismissed
            }
            if (o.status === 'delivered') {
               const updatedTime = new Date(o.updatedAt).getTime();
               const now = new Date().getTime();
               return (now - updatedTime) < 20000; // Show for 20 seconds after delivery
            }
            return true;
          });
          setActiveOrders(active);
        }
      } catch (error) {
        console.error("Failed to fetch active orders", error);
      }
    };

    if (userToken) {
      fetchActiveOrders();
      interval = setInterval(fetchActiveOrders, 10000); // Poll every 10s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userToken]);

  useEffect(() => {
    // Load User Data
    const token = localStorage.getItem("userToken");
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("userName");
    const phone = localStorage.getItem("userPhone");
    
    if (token && name && phone) {
      setUserToken(token);
      if (id) setUserId(id);
      setCustomerName(name);
      setCustomerPhone(phone);
    }

    fetchData();
  }, []);

  const fetchData = async (lat?: number, lng?: number, type: string = 'all') => {
    setLoading(true);
    try {
      // Fetch Products with location/type
      let url = `${API_URL}/api/shops/products/all?type=${type}`;
      if (lat && lng) {
        url += `&lat=${lat}&lng=${lng}`;
      }
      const prodRes = await fetch(url);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // Fetch Shops for Sidebar
      const shopRes = await fetch(`${API_URL}/api/shops`);
      if (shopRes.ok) {
        const shopData = await shopRes.json();
        setShops(shopData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setShopCategoryFilter(category);
    if (category === 'near_me') {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        setShopCategoryFilter('all');
        return;
      }
      setIsFetchingLocation(true);
      toast.info("Fetching your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setIsFetchingLocation(false);
          toast.success("Location updated! Showing nearby places.");
          fetchData(lat, lng, 'near_me');
        },
        (error) => {
          console.error(error);
          setIsFetchingLocation(false);
          toast.error("Failed to get location. Showing all shops.");
          setShopCategoryFilter('all');
          fetchData();
        }
      );
    } else {
      fetchData(userLocation?.lat, userLocation?.lng, category);
    }
  };

  const getGradientStyle = (themeColors?: string[]) => {
    if (!themeColors || themeColors.length === 0) return { background: "#8b5cf6" };
    if (themeColors.length === 1) return { background: themeColors[0] };
    if (themeColors.length === 2) return { background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})` };
    return { background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})` };
  };

  const getTextGradientStyle = (themeColors?: string[]) => {
    if (!themeColors || themeColors.length === 0) return { color: "#8b5cf6" };
    if (themeColors.length === 1) return { color: themeColors[0] };
    return { 
      backgroundImage: `linear-gradient(to right, ${themeColors[0]}, ${themeColors[1]})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      color: "transparent"
    };
  };

  // Filters logic
  const isNonVeg = (name: string) => {
    const nonVegKeywords = ['chicken', 'mutton', 'meat', 'egg', 'fish', 'prawn', 'beef', 'pork'];
    return nonVegKeywords.some(keyword => name.toLowerCase().includes(keyword));
  };

  const filteredProducts = products.filter(p => {
    let matchesFilter = true;
    if (activeFilter === 'veg') matchesFilter = !isNonVeg(p.name);
    if (activeFilter === 'non-veg') matchesFilter = isNonVeg(p.name);
    
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return matchesFilter && matchesSearch;
  });

  // --- Cart Logic ---
  const addToCart = (product: any) => {
    if (cart.length > 0 && cart[0].shop_id?._id !== product.shop_id?._id) {
      toast.error(`You already have items from ${cart[0].shop_id?.name}. Please checkout or clear your cart first.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      toast.success(`${product.name} added to cart`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    if (!userToken) {
      setIsLoginModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans pb-24 selection:bg-zinc-200 flex flex-col md:flex-row">
      
      {/* 🚀 NAVBAR (Mobile & Desktop) */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-zinc-100 h-[72px] flex items-center justify-between px-4 sm:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-11 h-11 rounded-2xl bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors border border-zinc-200/50"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-zinc-900" /> : <Menu className="w-5 h-5 text-zinc-900" />}
          </button>
          <div className="hidden md:flex flex-col">
             <span className="text-[22px] font-black tracking-tighter text-zinc-900 flex items-center gap-2">FoodUniverse<span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span></span>
          </div>
          <div className="flex flex-col md:hidden">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Delivering To</span>
            <span className="text-sm font-bold text-zinc-900 line-clamp-1 w-32">{customerName || 'Select Location'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* WhatsApp Support Logo */}
          <a 
            href={`https://wa.me/919217571488?text=${encodeURIComponent("Hello Super Admin, I need some help with Samrat Market.")}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="h-11 flex items-center justify-center gap-2 bg-black hover:bg-zinc-900 border border-white/10 rounded-2xl shadow-md transition-all cursor-pointer px-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-zinc-700 to-black border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10">
              <span className="text-white font-black text-[10px] tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">SM</span>
            </div>
            <span className="text-zinc-300 font-medium text-[10px] tracking-wide group-hover:text-white transition-colors relative z-10">Help</span>
          </a>

          {/* Profile */}
          <Link href="/user/profile" className="w-11 h-11 rounded-2xl flex items-center justify-center bg-zinc-900 text-white shadow-md hover:scale-105 transition-transform hover:shadow-lg">
            <User className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* spacer for navbar */}
      <div className="h-16 shrink-0 w-full md:hidden" />

      {/* 📍 DESKTOP SIDEBAR / MOBILE DRAWER */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="md:hidden fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-[72px] left-0 bottom-0 w-[280px] lg:w-[320px] bg-white/60 backdrop-blur-3xl border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 md:z-30 overflow-y-auto flex flex-col shrink-0"
            >
              <div className="p-6">
                
                {/* User Profile Summary - VIP Pass */}
                <Link href="/user/profile" className="hidden md:block mb-10 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[1.5rem] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md border border-white/10">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base leading-tight">My Account</h3>
                      <p className="text-xs text-zinc-400 font-bold mt-1">Orders & Profile</p>
                    </div>
                  </div>
                </Link>

                {/* Filters */}
                <div className="mb-10">
                  <h3 className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="w-3 h-3" /> Explore Menu
                  </h3>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setActiveFilter('all')} className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-3 ${activeFilter === 'all' ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-zinc-900' : 'text-zinc-500 hover:bg-white/50'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeFilter === 'all' ? 'bg-zinc-100 text-zinc-900' : 'bg-transparent text-zinc-400'}`}><Utensils className="w-4 h-4" /></div>
                      All Delicacies
                    </button>
                    <button onClick={() => setActiveFilter('veg')} className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-3 ${activeFilter === 'veg' ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-green-600' : 'text-zinc-500 hover:bg-white/50'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeFilter === 'veg' ? 'bg-green-50 text-green-600' : 'bg-transparent text-zinc-400'}`}>🌱</div>
                      Pure Veg Only
                    </button>
                    <button onClick={() => setActiveFilter('non-veg')} className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-3 ${activeFilter === 'non-veg' ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-red-600' : 'text-zinc-500 hover:bg-white/50'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeFilter === 'non-veg' ? 'bg-red-50 text-red-600' : 'bg-transparent text-zinc-400'}`}>🍗</div>
                      Non-Veg Specials
                    </button>
                  </div>
                </div>

                {/* Restaurants Near You */}
                <div>
                  <h3 className="text-[10px] font-black tracking-widest uppercase text-zinc-400 mb-4 flex items-center gap-2">
                    <Store className="w-3 h-3" /> Live Kitchens
                  </h3>
                  <div className="flex flex-col gap-2">
                    {shops.map(shop => (
                      <Link href={`/shop/${shop.shopSlug || shop.name.toLowerCase().replace(/\s+/g, '-')}`} key={shop._id} className="flex items-center gap-3 group p-2 -ml-2 rounded-2xl hover:bg-white/80 hover:shadow-sm transition-all cursor-pointer">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-[1rem] overflow-hidden shadow-sm border border-white/50 group-hover:scale-105 transition-transform duration-300" style={getGradientStyle(shop.themeColors || [shop.themeColor])}>
                            {shop.logo && shop.logo !== 'https://via.placeholder.com/150' ? (
                              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-white text-lg">{shop.name.charAt(0)}</div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-zinc-900 text-sm truncate group-hover:text-zinc-600 transition-colors">{shop.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest"><Star className="w-2.5 h-2.5 fill-green-700" /> 4.9</span>
                            <span className="text-[10px] font-bold text-zinc-400 truncate">{shop.estimatedDeliveryTime || '30m'}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 🍔 MAIN CONTENT AREA */}
      <main className={`flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 min-w-0 transition-all duration-300 md:mt-16 ${isSidebarOpen ? 'md:ml-[280px] lg:ml-[320px]' : ''}`}>

        {/* 🟢 Live Order Tracker Inline Widget */}
        <AnimatePresence>
          {activeOrders.length > 0 && (
            <motion.div 
              initial={{ y: -50, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: -50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="mb-10 w-full"
            >
              {activeOrders.slice(0, 1).map(order => {
                 const steps = ['pending', 'processing', 'ready', 'shipped'];
                 let currentStepIdx = steps.indexOf(order.status);
                 if (currentStepIdx === -1) currentStepIdx = 0;
                 
                 const progress = ((currentStepIdx + 1) / steps.length) * 100;
                 
                 const handleDismiss = (e: React.MouseEvent) => {
                   e.preventDefault();
                   dismissedOrderIdsRef.current.add(order._id);
                   setActiveOrders(prev => prev.filter(o => o._id !== order._id));
                 };

                 if (order.status === 'delivered') {
                   return (
                     <div key={order._id} className="relative w-full bg-emerald-500 text-white rounded-[2rem] p-5 shadow-sm border border-emerald-400 flex flex-col group overflow-hidden">
                       <button onClick={handleDismiss} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"><X className="w-4 h-4" /></button>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                       <Link href="/user/profile" className="flex items-center justify-between relative z-10 cursor-pointer">
                         <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-inner">
                             <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                           </div>
                           <div>
                             <h4 className="font-black text-2xl tracking-tight mb-1">Successfully Delivered! 🎉</h4>
                             <p className="text-sm font-bold text-emerald-50">Hope you enjoy your meal from {order.shop_id?.name}</p>
                           </div>
                         </div>
                       </Link>
                     </div>
                   )
                 }

                 if (order.status === 'cancelled') {
                   return (
                     <div key={order._id} className="relative w-full bg-red-500 text-white rounded-[2rem] p-5 shadow-sm border border-red-400 flex flex-col group overflow-hidden">
                       <button onClick={handleDismiss} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"><X className="w-4 h-4" /></button>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                       <div className="flex items-center justify-between relative z-10">
                         <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-inner">
                             <X className="w-8 h-8 text-red-500" />
                           </div>
                           <div>
                             <h4 className="font-black text-xl tracking-tight mb-1">Order Cancelled</h4>
                             <p className="text-sm font-bold text-red-50">Restaurant {order.shop_id?.name} has cancelled this order.</p>
                           </div>
                         </div>
                       </div>
                     </div>
                   )
                 }

                 return (
                   <div key={order._id} className="relative w-full bg-zinc-900 text-white rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-800 flex flex-col group overflow-hidden">
                     <button onClick={handleDismiss} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"><X className="w-4 h-4" /></button>
                     <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                     
                     <Link href="/user/profile" className="flex items-center justify-between mb-4 relative z-10 pr-10 cursor-pointer group-hover:opacity-90">
                       <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                           {order.status === 'pending' ? <ShoppingBag className="w-5 h-5 text-zinc-300" /> : 
                            order.status === 'processing' ? <Flame className="w-5 h-5 text-orange-400 animate-pulse" /> :
                            order.status === 'ready' ? <PackageOpen className="w-5 h-5 text-blue-400" /> :
                            <Bike className="w-5 h-5 text-green-400" />}
                         </div>
                         <div>
                           <h4 className="font-black text-lg flex items-center gap-2">
                             {order.status === 'pending' ? 'Order Received' : 
                              order.status === 'processing' ? 'Preparing your food' :
                              order.status === 'ready' ? 'Ready for Pickup' :
                              'Out for Delivery'} 
                             <span className="flex h-2 w-2 relative">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                             </span>
                           </h4>
                           <p className="text-xs font-bold text-zinc-400">{order.shop_id?.name || 'Restaurant'}</p>
                         </div>
                       </div>
                       <div className="text-right hidden sm:block">
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Items</span>
                         <span className="font-bold text-sm bg-white/10 px-2.5 py-1 rounded-lg">{order.orderItems?.length || 0}</span>
                       </div>
                     </Link>

                     {order.status === 'processing' && order.preparationTime && (
                       <div className="mb-4 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 z-10">
                         <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
                           <Clock className="w-4 h-4" />
                         </div>
                         <p className="text-sm font-medium text-zinc-200">
                           ✨ Your food is being prepared. Ready in <span className="font-bold text-white">{order.preparationTime}</span>!
                         </p>
                       </div>
                     )}

                     <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden z-10 mb-2">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className={`absolute top-0 left-0 h-full rounded-full ${order.status === 'pending' ? 'bg-zinc-400' : order.status === 'processing' ? 'bg-orange-500' : order.status === 'ready' ? 'bg-blue-500' : 'bg-green-500'}`} 
                       />
                     </div>
                     <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest z-10">
                       <span className={order.status === 'pending' ? 'text-zinc-300' : ''}>Placed</span>
                       <span className={order.status === 'processing' ? 'text-orange-400' : ''}>Preparing</span>
                       <span className={order.status === 'ready' ? 'text-blue-400' : ''}>Ready</span>
                       <span className={order.status === 'shipped' ? 'text-green-400' : ''}>On the way</span>
                     </div>
                   </div>
                 )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Infinite Food Feed */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter flex items-center gap-2 mb-2">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {customerName ? customerName.split(' ')[0] : 'Foodie'} <span className="text-3xl">👋</span>
              </h2>
              <p className="text-zinc-500 font-bold tracking-wide">What are you craving today?</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full lg:w-[400px]">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-zinc-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search for your favorite food..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 py-4 rounded-[1.5rem] bg-white/80 backdrop-blur-xl border border-zinc-200 outline-none focus:ring-4 focus:ring-zinc-100 focus:bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              />
            </div>
          </div>

          {/* Advanced Category & Location Filters */}
          <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-8 pb-2">
            <button 
              onClick={() => handleCategoryFilter('all')}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all border flex items-center gap-2 ${shopCategoryFilter === 'all' ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
            >
              All Shops
            </button>
            <button 
              onClick={() => handleCategoryFilter('near_me')}
              disabled={isFetchingLocation}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all border flex items-center gap-2 ${shopCategoryFilter === 'near_me' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'} disabled:opacity-50`}
            >
              {isFetchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              {isFetchingLocation ? 'Locating...' : 'Near Me'}
            </button>
            <button 
              onClick={() => handleCategoryFilter('restaurant')}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all border flex items-center gap-2 ${shopCategoryFilter === 'restaurant' ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
            >
              🏢 Restaurants
            </button>
            <button 
              onClick={() => handleCategoryFilter('hotel')}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all border flex items-center gap-2 ${shopCategoryFilter === 'hotel' ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
            >
              🏨 Hotels
            </button>
            <button 
              onClick={() => handleCategoryFilter('mess')}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all border flex items-center gap-2 ${shopCategoryFilter === 'mess' ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
            >
              🍛 Mess
            </button>
            <button 
              onClick={() => handleCategoryFilter('cafe')}
              className={`flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm transition-all border flex items-center gap-2 ${shopCategoryFilter === 'cafe' ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}
            >
              ☕ Cafe
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white rounded-[2rem] overflow-hidden flex flex-col h-[420px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                  {/* Image Skeleton */}
                  <div className="w-full aspect-[4/3] bg-zinc-100 animate-pulse" />
                  
                  {/* Content Skeleton */}
                  <div className="p-6 flex-1 flex flex-col bg-white">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="w-2/3 h-6 bg-zinc-100 rounded-lg animate-pulse" />
                      <div className="shrink-0 w-5 h-5 rounded-md bg-zinc-100 animate-pulse" />
                    </div>
                    
                    <div className="w-1/2 h-8 bg-zinc-50 rounded-xl mb-4 animate-pulse" />
                    
                    <div className="space-y-2 mb-6">
                      <div className="w-full h-3 bg-zinc-50 rounded-full animate-pulse" />
                      <div className="w-4/5 h-3 bg-zinc-50 rounded-full animate-pulse" />
                    </div>
                    
                    {/* Bottom Row Skeleton */}
                    <div className="mt-auto flex items-end justify-between border-t border-zinc-50 pt-5">
                      <div className="w-16 h-10 bg-zinc-100 rounded-xl animate-pulse" />
                      <div className="w-28 h-12 bg-zinc-100 rounded-2xl animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
              <Utensils className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-zinc-400 mb-2">No Items Found</h3>
              <p className="text-zinc-500 font-medium">Try changing your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredProducts.map((product) => {
                const shop = product.shop_id || {};
                const shopUrl = `/shop/${shop.shopSlug || shop.name?.toLowerCase().replace(/\s+/g, '-')}`;
                const cartItem = cart.find(item => item._id === product._id);
                
                return (
                  <div key={product._id} className="group bg-white rounded-[2rem] overflow-hidden flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 border border-white">
                    
                    {/* Image Section */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-50">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      <img 
                        src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"} 
                        alt={product.name} 
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"; e.currentTarget.onerror = null; }}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" 
                      />
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col relative z-20 bg-white">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <h4 className="text-xl font-black text-zinc-900 leading-tight line-clamp-2">{product.name}</h4>
                        {isNonVeg(product.name) ? (
                          <div className="shrink-0 w-5 h-5 rounded-md border-2 border-red-500/30 flex items-center justify-center shadow-sm"><div className="w-2 h-2 rounded-full bg-red-500"></div></div>
                        ) : (
                          <div className="shrink-0 w-5 h-5 rounded-md border-2 border-green-500/30 flex items-center justify-center shadow-sm"><div className="w-2 h-2 rounded-full bg-green-500"></div></div>
                        )}
                      </div>

                      {/* Shop Brand Info */}
                      <Link 
                        href={shopUrl}
                        className="flex items-center gap-2.5 mb-4 px-3 py-2 rounded-xl bg-zinc-50/80 hover:bg-zinc-100 self-start w-fit transition-colors cursor-pointer border border-zinc-100"
                      >
                        {shop.logo && shop.logo !== 'https://via.placeholder.com/150' ? (
                          <img src={shop.logo} alt={shop.name} className="w-5 h-5 rounded-full object-cover shadow-sm" />
                        ) : (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm" style={getGradientStyle(shop.themeColors || [shop.themeColor])}>
                            {shop.name?.charAt(0) || 'S'}
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                          {shop.name || 'Unknown Shop'}
                          {product.shopDistance !== undefined && (
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] lowercase flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" /> {(product.shopDistance / 1000).toFixed(1)} km
                            </span>
                          )}
                        </span>
                      </Link>
                      
                      <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-6 font-medium">{product.description || 'Delicious and fresh ingredients.'}</p>
                      
                      {/* Bottom Row: Price & Actions */}
                      <div className="mt-auto flex items-end justify-between border-t border-zinc-50 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Price</span>
                          <span className="text-xl font-black drop-shadow-sm" style={getTextGradientStyle(shop.themeColors || [shop.themeColor])}>₹{product.price}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {cartItem ? (
                            <div className="h-9 flex items-center justify-between rounded-xl p-1 bg-zinc-50 border border-zinc-200 shadow-inner">
                              <button onClick={() => updateQuantity(product._id, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-zinc-900 shadow-sm font-bold">-</button>
                              <span className="font-black text-sm w-8 text-center text-zinc-900">{cartItem.quantity}</span>
                              <button onClick={() => updateQuantity(product._id, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white shadow-sm font-bold" style={getGradientStyle(shop.themeColors || [shop.themeColor])}>+</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { 
                                addToCart(product); 
                                if (!userToken && !localStorage.getItem("userToken")) setIsLoginModalOpen(true);
                                else setIsCheckoutOpen(true); 
                              }}
                              className="h-9 px-6 flex items-center justify-center rounded-xl text-white font-black uppercase tracking-widest text-[10px] transition-all hover:opacity-90 active:scale-95 shadow-md hover:shadow-lg"
                              style={getGradientStyle(shop.themeColors || [shop.themeColor])}
                            >
                              Order Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 📱 Bottom Navigation (Mobile Only) */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-40 pointer-events-none flex justify-center">
         <div className="bg-zinc-900 text-white rounded-3xl shadow-2xl px-6 py-4 flex items-center justify-between border border-zinc-800 w-full max-w-sm pointer-events-auto">
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex flex-col items-center gap-1 text-white">
              <Utensils className="w-5 h-5" />
              <span className="text-[10px] font-bold">Feed</span>
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
              <Store className="w-5 h-5" />
              <span className="text-[10px] font-bold">Shops</span>
            </button>
            <Link href="/user/profile" className="flex flex-col items-center gap-1 text-zinc-500 hover:text-white transition-colors">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold">Account</span>
            </Link>
         </div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && !isCheckoutOpen && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40">
            <button onClick={() => setIsCartOpen(true)} className="bg-zinc-900 text-white px-6 py-4 rounded-full font-black flex items-center gap-4 shadow-2xl hover:scale-105 transition-transform border border-zinc-700">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-zinc-900">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{cart[0].shop_id?.name}</span>
                <span className="text-lg leading-none tracking-tight">Checkout</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-zinc-200">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
                <h2 className="text-2xl font-black tracking-tight text-zinc-900">Your Order</h2>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
                <div className="space-y-4 mb-6">
                  {cart.map((item, i) => (
                    <div key={i} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
                      <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-bold text-zinc-900 leading-tight mb-1">{item.name}</h4>
                        <span className="font-black text-zinc-900 mb-3">₹{item.price}</span>
                        <div className="flex items-center gap-3 bg-zinc-50 w-fit px-2 py-1 rounded-xl border border-zinc-200">
                          <button onClick={() => updateQuantity(item._id, -1)} className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm"><Minus className="w-3 h-3" /></button>
                          <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1)} className="w-6 h-6 rounded-md bg-zinc-900 text-white flex items-center justify-center shadow-sm"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
                  <h3 className="font-black text-zinc-900 mb-2">Bill Details</h3>
                  <div className="flex justify-between text-sm font-medium text-zinc-500"><span>Item Total</span><span>₹{totalPrice}</span></div>
                  <div className="flex justify-between text-sm font-medium text-green-600"><span>Delivery Fee</span><span>FREE</span></div>
                  <div className="pt-3 border-t border-dashed border-zinc-200 flex justify-between items-center">
                    <span className="font-black text-zinc-900 text-lg">To Pay</span>
                    <span className="font-black text-zinc-900 text-xl">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-zinc-100">
                <button onClick={() => { setIsCartOpen(false); handleProceedToCheckout(); }} className="w-full py-5 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  Proceed to Checkout <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={(user, token) => {
          setUserToken(token);
          setUserId(user._id);
          setCustomerName(user.name);
          setCustomerPhone(user.phone);
          setIsLoginModalOpen(false);
          setIsCheckoutOpen(true);
        }} 
      />

      {isCheckoutOpen && cart.length > 0 && (
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          totalPrice={totalPrice}
          customerName={customerName}
          customerPhone={customerPhone}
          userId={userId}
          shopInfo={cart[0].shop_id}
          onOrderSuccess={() => {
            setCart([]);
            setIsCheckoutOpen(false);
            setIsCartOpen(false);
          }}
          primaryColor={cart[0].shop_id?.themeColors?.[0]}
          gradientStyle={getGradientStyle(cart[0].shop_id?.themeColors)}
          textGradientStyle={getTextGradientStyle(cart[0].shop_id?.themeColors)}
        />
      )}
      {/* End of content */}
    </div>
  );
}
