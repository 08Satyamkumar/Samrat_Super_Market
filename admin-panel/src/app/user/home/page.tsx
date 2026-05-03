"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Star, Clock, Flame, Utensils, SlidersHorizontal, Store, X, Menu, Plus, Minus, ShoppingBag, CheckCircle2, Loader2, CreditCard, Banknote, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export default function UserHomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sidebar / Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

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
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('cash');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    // Check screen size for initial sidebar state
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    
    // Load User Data
    const token = localStorage.getItem("userToken");
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("userName");
    const phone = localStorage.getItem("userPhone");
    if (token && id && name && phone) {
      setUserToken(token);
      setUserId(id);
      setCustomerName(name);
      setCustomerPhone(phone);
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prodRes = await fetch(`${API_URL}/api/shops/products/all`);
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

  const getGradientStyle = (themeColors?: string[]) => {
    if (!themeColors || themeColors.length === 0) return { background: "#8b5cf6" };
    if (themeColors.length === 1) return { background: themeColors[0] };
    if (themeColors.length === 2) return { background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})` };
    return { background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})` };
  };

  // Filters logic
  const isNonVeg = (name: string) => {
    const nonVegKeywords = ['chicken', 'mutton', 'meat', 'egg', 'fish', 'prawn', 'beef', 'pork'];
    return nonVegKeywords.some(keyword => name.toLowerCase().includes(keyword));
  };

  const filteredProducts = products.filter(p => {
    if (activeFilter === 'veg') return !isNonVeg(p.name);
    if (activeFilter === 'non-veg') return isNonVeg(p.name);
    return true; // 'all'
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

  // --- Auth & Checkout Logic ---
  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    if (!userToken) {
      setIsLoginModalOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleUserLogin = async () => {
    if (!customerName || !customerPhone) {
      toast.error("Please enter Name and Phone number");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customerName, phone: customerPhone })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userPhone", data.user.phone);
        setUserToken(data.token);
        setUserId(data.user._id);
        setIsLoginModalOpen(false);
        setIsCheckoutOpen(true);
        toast.success(`Welcome, ${data.user.name}!`);
      } else {
        toast.error("Failed to login");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!customerName || !customerPhone || cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const activeShopId = cart[0].shop_id?._id;
      const orderData = {
        userId: userId || null,
        customerName, 
        customerPhone,
        orderItems: cart.map(item => ({ name: item.name, qty: item.quantity, image: item.image, price: item.price, product_id: item._id })),
        total_amount: totalPrice,
        paymentMethod: paymentMethod === 'upi' ? 'Online/UPI' : 'Cash on Delivery'
      };

      const res = await fetch(`${API_URL}/api/shops/${activeShopId}/orders`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(orderData)
      });
      
      if (res.ok) {
        setOrderSuccess(true); 
        setCart([]);
        setTimeout(() => { 
          setIsCheckoutOpen(false); 
          setOrderSuccess(false); 
          setIsCartOpen(false); 
        }, 3000);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsPlacingOrder(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans pb-24 selection:bg-zinc-200 flex flex-col md:flex-row">
      
      {/* 🚀 NAVBAR (Mobile & Desktop) */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-zinc-900" /> : <Menu className="w-5 h-5 text-zinc-900" />}
          </button>
          <div className="hidden md:flex flex-col">
             <span className="text-xl font-black tracking-tight text-zinc-900">FoodUniverse</span>
          </div>
          <div className="flex flex-col md:hidden">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Explore</span>
            <span className="text-sm font-bold text-zinc-900 line-clamp-1 w-32">Filters & Shops</span>
          </div>
        </div>

        <Link href="/user/profile" className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900 text-white shadow-md hover:scale-105 transition-transform">
          <User className="w-4 h-4" />
        </Link>
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
              className="fixed top-16 left-0 bottom-0 w-[280px] lg:w-[320px] bg-white border-r border-zinc-200 z-50 md:z-30 overflow-y-auto flex flex-col shrink-0"
            >
              <div className="p-6">
                <Link href="/user/profile" className="hidden md:flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors mb-8 border border-zinc-200">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-md">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-zinc-900">My Account</h3>
                    <p className="text-xs text-zinc-500 font-bold">Orders & Profile</p>
                  </div>
                </Link>

                {/* Filters */}
                <div className="mb-8">
                  <h3 className="text-xs font-black tracking-widest uppercase text-zinc-400 mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </h3>
                  <div className="flex flex-col gap-2">
                    {['all', 'veg', 'non-veg'].map((filter) => (
                      <button 
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeFilter === filter ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                      >
                        {filter === 'all' ? 'All Items' : filter === 'veg' ? '🌿 Pure Veg' : '🍗 Non-Veg'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Restaurants Near You */}
                <div>
                  <h3 className="text-xs font-black tracking-widest uppercase text-zinc-400 mb-4 flex items-center gap-2">
                    <Store className="w-4 h-4" /> Restaurants Near You
                  </h3>
                  <div className="flex flex-col gap-3">
                    {shops.map(shop => (
                      <Link href={`/shop/${shop.shopSlug || shop.name.toLowerCase().replace(/\s+/g, '-')}`} key={shop._id}>
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shadow-sm border border-zinc-200 shrink-0">
                            {shop.logo && shop.logo !== 'https://via.placeholder.com/150' ? (
                              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-white" style={getGradientStyle(shop.themeColors || [shop.themeColor])}>
                                {shop.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-zinc-900 text-sm truncate group-hover:text-violet-600 transition-colors">{shop.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-0.5 text-[10px] font-black text-green-700 bg-green-100 px-1.5 py-0.5 rounded-sm">
                                <Star className="w-2.5 h-2.5 fill-green-700" /> 4.9
                              </span>
                              <span className="text-[10px] font-bold text-zinc-500 truncate">{shop.estimatedDeliveryTime || '30 mins'}</span>
                            </div>
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

        {/* The Infinite Food Feed */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-black tracking-tight uppercase text-zinc-900">Infinite Food Feed</h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[4/5] bg-zinc-100 rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
              <Utensils className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-zinc-400 mb-2">No Items Found</h3>
              <p className="text-zinc-500 font-medium">Try changing your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const shop = product.shop_id || {};
                const shopUrl = `/shop/${shop.shopSlug || shop.name?.toLowerCase().replace(/\s+/g, '-')}`;
                const cartItem = cart.find(item => item._id === product._id);
                
                return (
                  <div key={product._id} className="group bg-white rounded-[2rem] overflow-hidden flex flex-col h-full border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300">
                    
                    {/* Product Image */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100">
                      <img 
                        src={product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"} 
                        alt={product.name} 
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="text-lg font-black text-zinc-900 leading-tight line-clamp-2">
                          {product.name}
                        </h4>
                        {isNonVeg(product.name) ? (
                          <div className="shrink-0 w-4 h-4 rounded-sm border border-red-600 flex items-center justify-center mt-1"><div className="w-2 h-2 rounded-full bg-red-600"></div></div>
                        ) : (
                          <div className="shrink-0 w-4 h-4 rounded-sm border border-green-600 flex items-center justify-center mt-1"><div className="w-2 h-2 rounded-full bg-green-600"></div></div>
                        )}
                      </div>
                      
                      {/* Shop Brand Info (Dynamic & Clickable) */}
                      <Link 
                        href={shopUrl}
                        className="flex items-center gap-2 mb-4 px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 self-start w-fit transition-colors cursor-pointer"
                      >
                        {shop.logo && shop.logo !== 'https://via.placeholder.com/150' ? (
                          <img src={shop.logo} alt={shop.name} className="w-4 h-4 rounded-full object-cover" />
                        ) : (
                          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={getGradientStyle(shop.themeColors || [shop.themeColor])}>
                            {shop.name?.charAt(0)}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{shop.name}</span>
                      </Link>

                      <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-6">
                        {product.description || 'Delicious and fresh ingredients.'}
                      </p>
                      
                      {/* Bottom Row: Price & Actions */}
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">Price</span>
                          <span className="text-2xl font-black drop-shadow-sm text-zinc-900">₹{product.price}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {cartItem ? (
                            <div className="h-12 flex items-center justify-between rounded-2xl p-1 bg-zinc-50 border border-zinc-200">
                              <button onClick={() => updateQuantity(product._id, -1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-zinc-900 shadow-sm font-bold">-</button>
                              <span className="font-black text-sm w-8 text-center text-zinc-900">{cartItem.quantity}</span>
                              <button onClick={() => updateQuantity(product._id, 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm font-bold">+</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => addToCart(product)}
                              className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all active:scale-95"
                              title="Add to Cart"
                            >
                              <Plus className="w-5 h-5" />
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

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Your Name</label>
                  <input type="text" placeholder="Rahul Kumar" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Phone Number</label>
                  <input type="tel" placeholder="9876543210" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900" />
                </div>
              </div>

              <button 
                onClick={handleUserLogin} disabled={isLoggingIn || !customerName || !customerPhone}
                className="w-full py-5 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Continue'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout Flow Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => !isPlacingOrder && !orderSuccess && setIsCheckoutOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md bg-white rounded-[2.5rem] relative z-10 overflow-hidden shadow-2xl border border-zinc-100 flex flex-col max-h-[90vh]">
              
              {!orderSuccess ? (
                <>
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
                    <h2 className="text-2xl font-black tracking-tight text-zinc-900">Checkout</h2>
                    <button onClick={() => setIsCheckoutOpen(false)} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="p-6 overflow-y-auto">
                    {/* User Info Bar */}
                    <div className="bg-zinc-900 text-white p-4 rounded-2xl mb-8 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black leading-tight">{customerName}</p>
                          <p className="text-xs text-zinc-400 font-bold">{customerPhone}</p>
                        </div>
                      </div>
                      <Link href="/user/profile" className="text-xs font-black uppercase tracking-widest text-violet-400">Edit</Link>
                    </div>

                    <h3 className="font-black text-zinc-900 mb-4 text-lg">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      <div onClick={() => setPaymentMethod('upi')} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${paymentMethod === 'upi' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'upi' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <span className={`font-black text-sm ${paymentMethod === 'upi' ? 'text-zinc-900' : 'text-zinc-500'}`}>Pay via UPI</span>
                      </div>
                      <div onClick={() => setPaymentMethod('cash')} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${paymentMethod === 'cash' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                          <Banknote className="w-5 h-5" />
                        </div>
                        <span className={`font-black text-sm ${paymentMethod === 'cash' ? 'text-zinc-900' : 'text-zinc-500'}`}>Pay at Shop</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white border-t border-zinc-100 shrink-0">
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full py-5 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isPlacingOrder ? <Loader2 className="w-6 h-6 animate-spin" /> : `Pay ₹${totalPrice}`}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center bg-white">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Order Placed!</h2>
                  <p className="text-zinc-500 font-medium mb-8">Your order has been sent to the restaurant.</p>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Redirecting to feed...</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
