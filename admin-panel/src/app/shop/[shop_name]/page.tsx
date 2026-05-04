"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ShoppingBag, Star, Clock, MapPin, ChevronRight, Search, Flame, X, CheckCircle2, Loader2, Plus, Minus, Info, Phone, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export default function PublicShopPage() {
  const params = useParams();
  const shopName = params.shop_name as string;
  const decodedShopName = shopName ? decodeURIComponent(shopName.replace(/-/g, ' ')) : 'Premium Store';

  // State
  const [activeCategory, setActiveCategory] = useState("All");
  const [mounted, setMounted] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryPref, setDietaryPref] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Checkout & Auth State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [userToken, setUserToken] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('cash');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Dynamic Theme Colors (Used as Accents)
  const themeColors = shopInfo?.themeColors?.length > 0 
    ? shopInfo.themeColors 
    : (shopInfo?.themeColor ? [shopInfo.themeColor] : ["#dc2626", "#ea580c"]); // Fallback Red/Orange

  const primaryColor = themeColors[0];

  const getGradientStyle = () => {
    if (themeColors.length === 1) return { background: themeColors[0] };
    if (themeColors.length === 2) return { background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})` };
    return { background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})` };
  };

  const getTextGradient = () => {
    if (themeColors.length === 1) return { color: themeColors[0] };
    return { 
      backgroundImage: `linear-gradient(to right, ${themeColors[0]}, ${themeColors[1]})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      color: "transparent"
    };
  };

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) => c._id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter((c) => c._id !== itemId);
    });
  };

  const getCartQuantity = (itemId: string) => {
    const item = cart.find(c => c._id === itemId);
    return item ? item.quantity : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const fetchShopData = async () => {
    try {
      const shopRes = await fetch(`${API_URL}/api/shops/${shopName}`);
      if (!shopRes.ok) throw new Error("Shop not found");
      const shopData = await shopRes.json();
      setShopInfo(shopData);

      const productsRes = await fetch(`${API_URL}/api/shops/${shopData._id}/products`);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setMenuItems(productsData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchShopData();

    // Check for logged-in user
    const token = localStorage.getItem("userToken");
    const name = localStorage.getItem("userName");
    const phone = localStorage.getItem("userPhone");
    
    if (token && name && phone) {
      setUserToken(token);
      setCustomerName(name);
      setCustomerPhone(phone);
    }
  }, [shopName]);

  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category || 'General')))];

  const isNonVeg = (name: string) => {
    const nonVegKeywords = ['chicken', 'mutton', 'meat', 'egg', 'fish', 'prawn', 'beef', 'pork'];
    return nonVegKeywords.some(keyword => name.toLowerCase().includes(keyword));
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "All" || (item.category || 'General') === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemIsNonVeg = isNonVeg(item.name);
    const matchesDiet = dietaryPref === 'all' ? true : dietaryPref === 'veg' ? !itemIsNonVeg : itemIsNonVeg;
    return matchesCategory && matchesSearch && matchesDiet;
  });

  const handlePlaceOrder = async () => {
    if (!customerName || !customerPhone) return;
    setIsPlacingOrder(true);
    try {
      const orderData = {
        userId: localStorage.getItem("userId") || null,
        customerName, customerPhone,
        orderItems: cart.map(item => ({ name: item.name, qty: item.quantity, image: item.image, price: item.price, product_id: item._id })),
        total_amount: totalPrice,
        paymentMethod: paymentMethod === 'upi' ? 'Online/UPI' : 'Cash on Delivery'
      };
      const res = await fetch(`${API_URL}/api/shops/${shopInfo._id}/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData)
      });
      if (res.ok) {
        setOrderSuccess(true); setCart([]);
        setTimeout(() => { setIsCheckoutOpen(false); setOrderSuccess(false); setIsCartOpen(false); }, 3000);
      }
    } catch (error) { console.error(error); } finally { setIsPlacingOrder(false); }
  };

  const handleSendOtp = async () => {
    if (!customerName || !customerPhone) {
      toast.error("Please enter Name and Phone number");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/api/users/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customerName, phone: customerPhone })
      });
      if (res.ok) {
        const data = await res.json();
        setOtpStep(true);
        toast.success(`Mock OTP: ${data.mockOtp}`, { duration: 10000 });
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput) {
      toast.error("Please enter OTP");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/api/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customerPhone, otp: otpInput })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userPhone", data.user.phone);
        setUserToken(data.token);
        setIsLoginModalOpen(false);
        setOtpStep(false);
        setOtpInput("");
        setIsCheckoutOpen(true);
        toast.success(`Welcome, ${data.user.name}!`);
      } else {
        toast.error("Invalid or expired OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (userToken) {
      setIsCheckoutOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  if (!mounted || loading) return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-zinc-300" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans overflow-x-hidden selection:bg-zinc-200">
      
      {/* Clean Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={getGradientStyle()}>
              {shopInfo?.logo && shopInfo.logo !== 'https://via.placeholder.com/150' ? (
                <img src={shopInfo.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-xl font-bold text-white uppercase">{shopInfo?.name?.charAt(0) || decodedShopName.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-zinc-900 capitalize">{shopInfo?.name || decodedShopName}</h1>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.9</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {shopInfo?.estimatedDeliveryTime || '30 mins'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 transition-colors">
               <Search className="w-4 h-4 text-zinc-600" />
             </button>
             <button onClick={() => setIsCartOpen(true)} className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-white transition-transform hover:scale-105" style={getGradientStyle()}>
               <ShoppingBag className="w-5 h-5" />
               <AnimatePresence>
                 {totalItems > 0 && (
                   <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-black text-white shadow-lg border-2 border-white">
                     {totalItems}
                   </motion.span>
                 )}
               </AnimatePresence>
             </button>
          </div>
        </div>
      </nav>

      {/* Clean Hero Section */}
      <div className="pt-28 pb-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full h-[250px] md:h-[350px] rounded-[2.5rem] overflow-hidden shadow-xl border border-zinc-100 group">
          <img 
            src={shopInfo?.bannerImage || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1920&q=80"} 
            alt="Restaurant" 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
          />
          {/* Dynamic Magic Overlay */}
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 opacity-40 mix-blend-color" style={getGradientStyle()} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 z-10">
             <span className={`w-2 h-2 rounded-full ${shopInfo?.isOpen !== false ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
             <span className="text-[10px] font-black uppercase tracking-widest text-white">{shopInfo?.isOpen !== false ? 'Accepting Orders' : 'Closed'}</span>
          </div>

          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 pr-8 text-white z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-3 leading-tight drop-shadow-lg tracking-tight whitespace-pre-line">
              {shopInfo?.tagline || "Delicious Food,\nDelivered Fast."}
            </h2>
            <p className="text-white/80 max-w-md text-sm font-medium">
              Explore our premium menu carefully prepared by top chefs.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        
        {/* Navigation & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <h3 className="text-2xl font-black tracking-tight text-zinc-900">Our Menu</h3>
           
           <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
             {/* Diet Filters */}
             <div className="flex items-center p-1 bg-white border border-zinc-200 rounded-xl shadow-sm">
               {(['all', 'veg', 'non-veg'] as const).map(pref => (
                 <button 
                   key={pref} onClick={() => setDietaryPref(pref)}
                   className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                     dietaryPref === pref ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'
                   }`}
                 >
                   {pref}
                 </button>
               ))}
             </div>
           </div>
        </div>

        {/* Categories (Accent Highlight) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide mb-4">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                style={isActive ? getGradientStyle() : {}}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm ${
                  isActive ? "text-white scale-105" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {/* Clean Food Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-[2rem] overflow-hidden flex flex-col h-full border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300"
                style={item.isAvailable === false ? { opacity: 0.6, filter: 'grayscale(100%)' } : {}}
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100">
                  <img 
                    src={item.image} alt={item.name} 
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  {index % 4 === 0 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                      <Flame className="w-3 h-3 text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Trending</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h4 className="text-lg font-black text-zinc-900 leading-tight line-clamp-2">
                      {item.name}
                    </h4>
                    {isNonVeg(item.name) ? (
                      <div className="shrink-0 w-4 h-4 rounded-sm border border-red-600 flex items-center justify-center mt-1"><div className="w-2 h-2 rounded-full bg-red-600"></div></div>
                    ) : (
                      <div className="shrink-0 w-4 h-4 rounded-sm border border-green-600 flex items-center justify-center mt-1"><div className="w-2 h-2 rounded-full bg-green-600"></div></div>
                    )}
                  </div>
                  
                  {/* Shop Brand Info (Dynamic & Clickable) */}
                  {shopInfo && (
                    <a 
                      href={`/shop/${shopInfo.shopSlug || shopName}`}
                      className="flex items-center gap-2 mb-4 px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 self-start w-fit transition-colors cursor-pointer"
                    >
                      <img src={shopInfo.logo || 'https://via.placeholder.com/150'} alt={shopInfo.name} className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{shopInfo.name}</span>
                    </a>
                  )}

                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-6">
                    {item.description}
                  </p>
                  
                  {/* Bottom Row: Price & Actions */}
                  <div className="mt-auto flex items-end justify-between border-t border-zinc-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Price</span>
                      <span className="text-xl font-black drop-shadow-sm" style={getTextGradient()}>₹{item.price}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {shopInfo?.isOpen === false || item.isAvailable === false ? (
                         <button disabled className="h-9 px-4 rounded-xl bg-zinc-100 text-zinc-400 text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                           {shopInfo?.isOpen === false ? 'Closed' : 'Sold Out'}
                         </button>
                      ) : getCartQuantity(item._id) > 0 ? (
                        <div className="h-9 flex items-center justify-between rounded-xl p-1 bg-zinc-50 border border-zinc-200 shadow-inner">
                          <button onClick={() => removeFromCart(item._id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-zinc-900 shadow-sm font-bold">-</button>
                          <span className="font-black text-sm w-8 text-center text-zinc-900">{getCartQuantity(item._id)}</span>
                          <button onClick={() => addToCart(item)} className="w-7 h-7 flex items-center justify-center rounded-lg text-white shadow-sm font-bold" style={getGradientStyle()}>+</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => { if (getCartQuantity(item._id) === 0) addToCart(item); setIsCheckoutOpen(true); }}
                            className="h-9 px-5 flex items-center justify-center rounded-xl text-white font-black uppercase tracking-widest text-[10px] transition-all hover:opacity-90 active:scale-95 shadow-md hover:shadow-lg"
                            style={getGradientStyle()}
                          >
                            Order
                          </button>
                          <button 
                            onClick={() => addToCart(item)}
                            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-all active:scale-95 border border-zinc-200/50"
                            title="Add to Cart"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Magic Cart (Accent Highlight) */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 150, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 150, scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-8 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
          >
            <div 
              onClick={() => setIsCartOpen(true)} 
              className="w-full max-w-lg p-2 rounded-full pointer-events-auto cursor-pointer group shadow-2xl"
            >
              <div className="w-full h-full rounded-full flex items-center justify-between px-6 py-4" style={getGradientStyle()}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/90 font-black uppercase tracking-widest">{totalItems} {totalItems === 1 ? 'Item' : 'Items'} Added</span>
                    <span className="text-2xl font-black text-white leading-none mt-1">₹{totalPrice}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-white text-zinc-900 px-5 py-3 rounded-full font-black uppercase text-xs tracking-widest transition-transform group-hover:scale-105 shadow-md">
                  Checkout <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust Footer (Deep Premium Contrast) */}
      <footer className="relative z-10 bg-[#0a0a0a] border-t border-zinc-800 pt-16 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
             <MapPin className="w-8 h-8 text-white/50" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">About {shopInfo?.name || decodedShopName}</h3>
          <p className="text-white/40 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
            We are committed to delivering the highest quality food with the best hygiene standards. Your satisfaction is our priority.
          </p>

          {/* Direct Contact Buttons */}
          {shopInfo?.owner_id?.phone && (
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <a 
                href={`tel:${shopInfo.owner_id.phone}`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 hover:scale-105 transition-all shadow-lg"
              >
                <Phone className="w-4 h-4 text-white/70" /> Call Shop
              </a>
              <a 
                href={`https://wa.me/91${shopInfo.owner_id.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-bold uppercase tracking-widest text-xs hover:bg-[#25D366]/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(37,211,102,0.1)]"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-12">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center hover:bg-white/10 transition-colors">
               <Info className="w-6 h-6 text-white/50 mb-3" />
               <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">FSSAI License</span>
               <span className="text-white font-mono font-bold">21512345000678</span>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center hover:bg-white/10 transition-colors">
               <Clock className="w-6 h-6 text-white/50 mb-3" />
               <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Operating Hours</span>
               <span className="text-white font-bold">{shopInfo?.openingTime || '10:00 AM'} - {shopInfo?.closingTime || '10:00 PM'}</span>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center hover:bg-white/10 transition-colors">
               <CheckCircle2 className="w-6 h-6 text-white/50 mb-3" />
               <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Verified Partner</span>
               <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> 100% Secure</span>
             </div>
          </div>

          <div className="w-full border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
             <span className="text-xs text-white/30 font-bold uppercase tracking-widest">© {new Date().getFullYear()} {shopInfo?.name || decodedShopName}.</span>
             <span className="text-xs text-white/30 font-bold uppercase tracking-widest flex items-center gap-1">Powered By <span className="text-white font-black tracking-tighter">PREMIUM SAAS</span></span>
          </div>
        </div>
      </footer>

      {/* Slide Cart & Checkout Modals */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(10px)' }} exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[70] bg-zinc-900/60 flex flex-col pt-32 px-4"
          >
            <div className="max-w-3xl mx-auto w-full relative bg-white rounded-3xl p-4 shadow-2xl">
              <input 
                type="text" placeholder="What are you craving?" autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pb-2 text-2xl font-black text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
              />
              <button onClick={() => setIsSearchOpen(false)} className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-900 p-1 bg-zinc-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Cart */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-[80] bg-zinc-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white border-l border-zinc-200 z-[90] shadow-2xl flex flex-col">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">Your Order</h2>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                    <ShoppingBag className="w-20 h-20 mb-6 opacity-50" />
                    <p className="text-xl font-bold uppercase tracking-widest text-zinc-400">Cart is Empty</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item._id} className="flex gap-4 p-3 rounded-3xl bg-zinc-50 border border-zinc-100">
                        <img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover" />
                        <div className="flex-1 flex flex-col justify-between py-1 pr-2">
                          <div>
                            <h4 className="font-bold text-zinc-900 line-clamp-1">{item.name}</h4>
                            <span className="font-black text-lg" style={getTextGradient()}>₹{item.price * item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-3 bg-white rounded-xl p-1 w-max border border-zinc-200 shadow-sm">
                            <button onClick={() => removeFromCart(item._id)} className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 font-black hover:bg-zinc-200">-</button>
                            <span className="font-black text-sm w-4 text-center text-zinc-900">{item.quantity}</span>
                            <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-lg text-white font-black" style={getGradientStyle()}>+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="p-6 border-t border-zinc-100 bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Total</span>
                    <span className="text-4xl font-black text-zinc-900">₹{totalPrice}</span>
                  </div>
                  <button onClick={handleProceedToCheckout} className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-lg transition-transform active:scale-95 shadow-lg" style={getGradientStyle()}>
                    Checkout Now
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => !isPlacingOrder && !orderSuccess && setIsCheckoutOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md rounded-[2.5rem] relative z-10 overflow-hidden bg-white shadow-2xl">
              <div className="h-2 w-full" style={getGradientStyle()} />
              
              <div className="p-8">
                {orderSuccess ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg" style={getGradientStyle()}>
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-black mb-3 text-zinc-900 tracking-tighter">Order Placed!</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed">Your order has been transmitted to the kitchen. Please show this screen at the counter.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">Checkout</h2>
                      <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100 mb-6 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl text-white shadow-md" style={getGradientStyle()}>
                        {customerName ? customerName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Delivering To</p>
                        <p className="font-bold text-zinc-900 text-lg">{customerName || 'User'}</p>
                        <p className="text-xs text-zinc-500">{customerPhone}</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="flex justify-between items-end mb-6 bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Total to Pay</span>
                        <span className="text-4xl font-black" style={getTextGradient()}>₹{totalPrice}</span>
                      </div>
                      
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-4 ml-2">Select Payment</span>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setPaymentMethod('cash')} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'cash' ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}>
                          <span className="font-bold">Cash</span>
                          <span className="text-[10px] mt-1 opacity-70">Pay at counter</span>
                        </button>
                        
                        {shopInfo?.upiId ? (
                          <button onClick={() => setPaymentMethod('upi')} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'upi' ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}>
                            <span className="font-bold">UPI</span>
                            <span className="text-[10px] mt-1 opacity-70">Scan QR</span>
                          </button>
                        ) : (
                          <button disabled className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed">
                            <span className="font-bold">UPI</span>
                            <span className="text-[10px] mt-1">Not Available</span>
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {paymentMethod === 'upi' && shopInfo?.upiId && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 flex flex-col items-center text-center mt-4">
                              <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200 mb-4">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${shopInfo.upiId}&pn=${encodeURIComponent(shopInfo.name)}`} alt="UPI QR Code" className="w-32 h-32" />
                              </div>
                              <p className="font-mono font-bold text-zinc-900 bg-white border border-zinc-200 px-4 py-2 rounded-xl shadow-sm">{shopInfo.upiId}</p>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-4 font-bold">Scan using PhonePe, GPay or Paytm</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      onClick={handlePlaceOrder} disabled={isPlacingOrder || !customerName || !customerPhone}
                      className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      style={getGradientStyle()}
                    >
                      {isPlacingOrder ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Place Order Now'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => !isLoggingIn && setIsLoginModalOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md rounded-[2.5rem] relative z-10 overflow-hidden bg-white shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">Login to Order</h2>
                <button onClick={() => setIsLoginModalOpen(false)} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {!otpStep ? (
                <>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Your Name</label>
                      <input type="text" placeholder="Rahul Kumar" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Phone Number</label>
                      <input type="tel" placeholder="9876543210" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-400" />
                    </div>
                  </div>
                  <button 
                    onClick={handleSendOtp} disabled={isLoggingIn || !customerName || !customerPhone}
                    className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    style={getGradientStyle()}
                  >
                    {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Enter OTP</label>
                      <input type="text" placeholder="123456" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900 tracking-[0.5em] text-center text-xl" maxLength={6} />
                    </div>
                  </div>
                  <button 
                    onClick={handleVerifyOtp} disabled={isLoggingIn || !otpInput || otpInput.length < 6}
                    className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    style={getGradientStyle()}
                  >
                    {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Continue'}
                  </button>
                  <button onClick={() => setOtpStep(false)} className="w-full mt-4 text-zinc-500 font-bold text-sm hover:text-zinc-900 transition-colors">
                    Back to Phone Number
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
