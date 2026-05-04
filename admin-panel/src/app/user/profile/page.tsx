"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, Clock, MapPin, ChevronLeft, LogOut, CheckCircle2, ChevronRight, Utensils, X, Loader2, ShoppingBag, Flame, PackageOpen, Bike } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export default function UserProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // User State
  const [userToken, setUserToken] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [orders, setOrders] = useState<any[]>([]);

  // Auth State (If not logged in)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputPhone, setInputPhone] = useState("");

  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    checkAuthAndFetchData();

    // Polling for live updates
    const interval = setInterval(() => {
      const token = localStorage.getItem("userToken");
      if (token) {
        fetch(`${API_URL}/api/users/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setOrders(data);
            const active = data.filter((o: any) => {
              if (['cancelled'].includes(o.status)) return false;
              if (o.status === 'delivered') {
                 const updatedTime = new Date(o.updatedAt).getTime();
                 const now = new Date().getTime();
                 return (now - updatedTime) < 20000;
              }
              return true;
            });
            setActiveOrders(active);
          }
        })
        .catch(err => console.error(err));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem("userToken");
    const name = localStorage.getItem("userName");
    const phone = localStorage.getItem("userPhone");

    if (!token) {
      setIsLoginModalOpen(true);
      setLoading(false);
      return;
    }

    setUserToken(token);
    setUserName(name || "User");
    setUserPhone(phone || "");

    // Fetch Orders
    try {
      const res = await fetch(`${API_URL}/api/users/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        const active = data.filter((o: any) => {
          if (['cancelled'].includes(o.status)) return false;
          if (o.status === 'delivered') {
             const updatedTime = new Date(o.updatedAt).getTime();
             const now = new Date().getTime();
             return (now - updatedTime) < 20000;
          }
          return true;
        });
        setActiveOrders(active);
      } else {
        if (res.status === 401) handleLogout();
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!inputName || !inputPhone) {
      toast.error("Please enter Name and Phone number");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/api/users/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputName, phone: inputPhone })
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
        body: JSON.stringify({ phone: inputPhone, otp: otpInput })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userPhone", data.user.phone);
        setUserToken(data.token);
        setUserName(data.user.name);
        setUserPhone(data.user.phone);
        setIsLoginModalOpen(false);
        setOtpStep(false);
        setOtpInput("");
        toast.success(`Welcome, ${data.user.name}!`);
        
        // Fetch orders immediately after login
        setLoading(true);
        checkAuthAndFetchData();
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

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhone");
    setUserToken("");
    setUserName("");
    setUserPhone("");
    setOrders([]);
    toast.success("Logged out successfully");
    router.push("/user/home");
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans pb-24 selection:bg-zinc-200">
      {/* 📍 Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/user/home" className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 transition-colors">
            <ChevronLeft className="w-5 h-5 text-zinc-900" />
          </Link>
          <span className="font-black text-lg tracking-tight">My Account</span>
          <div className="w-10 h-10"></div> {/* Spacer */}
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
        
        {/* User Profile Card */}
        {userToken && (
          <div className="bg-zinc-900 text-white rounded-[2rem] p-6 mb-8 shadow-2xl relative overflow-hidden flex items-center justify-between">
            <div className="absolute right-0 top-0 w-48 h-48 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black shadow-inner border border-white/10 backdrop-blur-md">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{userName}</h2>
                <p className="text-zinc-400 font-medium text-sm flex items-center gap-1 mt-1">
                  {userPhone}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Order History */}
        {userToken && (
          <div>
            <h3 className="text-lg font-black tracking-tight uppercase text-zinc-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-zinc-400" /> Order History
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                <Utensils className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                <h4 className="text-xl font-black text-zinc-400 mb-2">No Orders Yet</h4>
                <p className="text-zinc-500 font-medium text-sm mb-6">Looks like you haven't ordered anything yet.</p>
                <Link href="/user/home">
                  <button className="px-6 py-3 bg-zinc-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shadow-lg">
                    Browse Restaurants
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isLive = ['pending', 'processing', 'ready', 'shipped'].includes(order.status);
                  const shop = order.shop_id || {};
                  
                  return (
                    <div key={order._id} className="bg-white border border-zinc-100 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      
                      {/* Live Order Indicator */}
                      {isLive && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 shadow-sm border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                            {shop?.logo && shop.logo !== 'https://via.placeholder.com/150' ? (
                              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-black text-zinc-400">{shop?.name?.charAt(0) || 'S'}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-zinc-900 tracking-tight leading-none mb-1">{shop.name || 'Restaurant'}</h4>
                            <p className="text-xs text-zinc-500 font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-lg">₹{order.total_amount}</span>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            {isLive ? (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" /> Live: {order.status}
                              </span>
                            ) : order.status === 'delivered' ? (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Delivered
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                <X className="w-3 h-3" /> {order.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-50 rounded-2xl p-4 mb-4">
                        <p className="text-sm font-medium text-zinc-600 line-clamp-2 leading-relaxed">
                          {order.orderItems.map((item: any) => `${item.qty} x ${item.name}`).join(', ')}
                        </p>
                      </div>

                      {order.preparationTime && isLive && (
                        <div className="mb-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center gap-3">
                          <div className="bg-white p-1.5 rounded-lg text-orange-500 shadow-sm">
                            <Clock className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-bold text-orange-600">
                            Ready in {order.preparationTime}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest border border-zinc-200 px-3 py-1.5 rounded-full">
                          {order.paymentMethod}
                        </span>
                        
                        <Link href={`/shop/${shop.name?.toLowerCase().replace(/\s+/g, '-')}`}>
                          <button className="flex items-center gap-1 text-sm font-black text-violet-600 group-hover:text-violet-700 transition-colors">
                            Reorder <ChevronRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 🟢 Live Order Tracker Floating Widget */}
      <AnimatePresence>
        {activeOrders.length > 0 && (
          <motion.div 
            initial={{ y: 150, opacity: 0, scale: 0.9 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 150, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 left-0 right-0 z-50 px-4 md:px-0 flex justify-center pointer-events-none"
          >
            {activeOrders.slice(0, 1).map(order => {
               const steps = ['pending', 'processing', 'ready', 'shipped'];
               let currentStepIdx = steps.indexOf(order.status);
               if (currentStepIdx === -1) currentStepIdx = 0;
               const progress = ((currentStepIdx + 1) / steps.length) * 100;
               
               if (order.status === 'delivered') {
                 return (
                   <div key={order._id} className="pointer-events-auto w-full md:w-[500px] bg-emerald-500 text-white rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(16,185,129,0.3)] border border-emerald-400 flex flex-col overflow-hidden relative">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                     <div className="flex items-center justify-between relative z-10">
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-inner">
                           <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                         </div>
                         <div>
                           <h4 className="font-black text-2xl tracking-tight mb-1">Successfully Delivered! 🎉</h4>
                           <p className="text-sm font-bold text-emerald-50">Hope you enjoy your meal from {order.shop_id?.name}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 )
               }

               return (
                 <div key={order._id} className="pointer-events-auto w-full md:w-[500px] bg-zinc-900 text-white rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-zinc-800 flex flex-col overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                   
                   <div className="flex items-center justify-between mb-4 relative z-10">
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
                     <div className="text-right">
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Items</span>
                       <span className="font-bold text-sm bg-white/10 px-2.5 py-1 rounded-lg">{order.orderItems?.length || 0}</span>
                     </div>
                   </div>

                   {order.status === 'processing' && order.preparationTime && (
                     <div className="mb-4 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 z-10">
                       <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
                         <Clock className="w-4 h-4" />
                       </div>
                       <p className="text-sm font-medium text-zinc-200">
                         ✨ Your food is being prepared with love. Ready in <span className="font-bold text-white">{order.preparationTime}</span>!
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

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => !isLoggingIn && router.push("/user/home")} />
            
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md rounded-[2.5rem] relative z-10 overflow-hidden bg-white shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">Login Required</h2>
                <button onClick={() => router.push("/user/home")} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <p className="text-zinc-500 font-medium mb-6">Please login to view your profile and order history.</p>

              {!otpStep ? (
                <>
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Your Name</label>
                      <input type="text" placeholder="Rahul Kumar" value={inputName} onChange={(e) => setInputName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Phone Number</label>
                      <input type="tel" placeholder="9876543210" value={inputPhone} onChange={(e) => setInputPhone(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-400" />
                    </div>
                  </div>
                  <button 
                    onClick={handleSendOtp} disabled={isLoggingIn || !inputName || !inputPhone}
                    className="w-full py-5 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
                    className="w-full py-5 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
