"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, ArrowLeft, ShoppingBag, Clock, CheckCircle2, X, ChevronRight, PackageOpen, Bike, Flame, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export default function UserProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userToken, setUserToken] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("userToken");
    const name = localStorage.getItem("userName");
    const phone = localStorage.getItem("userPhone");
    
    if (token && name && phone) {
      setUserToken(token);
      setUserName(name);
      setUserPhone(phone);
      fetchOrders(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhone");
    toast.success("Logged out successfully");
    router.push("/user/home");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending': return { icon: <ShoppingBag className="w-4 h-4" />, text: "Order Received", color: "text-zinc-500", bg: "bg-zinc-100", border: "border-zinc-200" };
      case 'processing': return { icon: <Flame className="w-4 h-4" />, text: "Preparing Food", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
      case 'ready': return { icon: <PackageOpen className="w-4 h-4" />, text: "Ready for Pickup", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
      case 'shipped': return { icon: <Bike className="w-4 h-4" />, text: "Out for Delivery", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" };
      case 'delivered': return { icon: <CheckCircle2 className="w-4 h-4" />, text: "Delivered", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" };
      case 'cancelled': return { icon: <X className="w-4 h-4" />, text: "Cancelled", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
      default: return { icon: <Clock className="w-4 h-4" />, text: "Unknown", color: "text-zinc-500", bg: "bg-zinc-100", border: "border-zinc-200" };
    }
  };

  if (!mounted) return null;

  if (!userToken && !loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <User className="w-10 h-10 text-zinc-400" />
        </div>
        <h1 className="text-3xl font-black text-zinc-900 mb-2">You are not logged in</h1>
        <p className="text-zinc-500 mb-8 max-w-sm">Please login from the home page to view your profile and order history.</p>
        <Link href="/user/home" className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 shadow-xl hover:shadow-2xl">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans pb-24 selection:bg-zinc-200">
      {/* Navbar */}
      <nav className="sticky top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-zinc-100 h-[72px] flex items-center px-4 sm:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <Link href="/user/home" className="w-11 h-11 rounded-2xl bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors border border-zinc-200/50 mr-4">
          <ArrowLeft className="w-5 h-5 text-zinc-900" />
        </Link>
        <h1 className="text-xl font-black tracking-tight text-zinc-900">My Profile</h1>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-zinc-900/20 border border-zinc-700">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-900 mb-1">{userName}</h2>
                <div className="flex items-center gap-2 text-zinc-500 font-medium">
                  <Phone className="w-4 h-4" /> {userPhone}
                </div>
              </div>
            </div>
            
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Order History */}
        <div>
          <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-zinc-400" /> Order History
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-white rounded-[2rem] border border-zinc-100 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
              <ShoppingBag className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-zinc-400 mb-2">No Past Orders</h3>
              <p className="text-zinc-500 font-medium mb-6">Looks like you haven't ordered anything yet.</p>
              <Link href="/user/home" className="inline-block px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl">
                Start Exploring
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const status = getStatusDisplay(order.status);
                const shop = order.shop_id || {};
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order._id} 
                    className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all group cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 shadow-sm overflow-hidden">
                          {shop.logo && shop.logo !== 'https://via.placeholder.com/150' ? (
                            <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-zinc-400">{shop.name ? shop.name.charAt(0) : 'S'}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-lg text-zinc-900 leading-none mb-1">{shop.name || 'Restaurant'}</h4>
                          <p className="text-xs font-bold text-zinc-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${status.bg} ${status.color} ${status.border}`}>
                        {status.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{status.text}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.orderItems.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-zinc-700"><span className="text-zinc-400 font-bold mr-2">{item.qty}x</span> {item.name}{item.variant && ` (${item.variant})`}</span>
                            <span className="font-bold text-zinc-900">₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Total Paid</span>
                        <span className="text-xl font-black text-zinc-900">₹{order.total_amount}</span>
                      </div>
                      
                      {order.paymentMethod && (
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 block">Payment</span>
                          <span className="text-xs font-bold text-zinc-700 bg-white px-2 py-1 rounded-md border border-zinc-200">{order.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
