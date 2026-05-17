import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, ShoppingBag, Clock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface UserKundaliModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserKundaliModal({ userId, isOpen, onClose }: UserKundaliModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetails();
    }
  }, [userId, isOpen]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        toast.error("Failed to load user details");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-zinc-950 w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4 text-white">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">{data?.user?.name || 'Loading...'}</h2>
                  <p className="text-blue-100 font-medium">{data?.user?.phone || 'Loading...'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-zinc-500 font-medium animate-pulse">Loading User History...</p>
              </div>
            ) : data ? (
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-zinc-900">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{data.stats?.totalOrders}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <span className="text-xl font-black">₹</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Lifetime Value</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">₹{data.stats?.totalSpent?.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* Orders Timeline */}
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" /> Order History
                  </h3>
                  
                  {data.orders?.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-zinc-950 rounded-2xl border border-gray-100 dark:border-zinc-800">
                      <p className="text-gray-500 font-medium">No orders placed yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.orders?.map((order: any) => (
                        <div key={order._id} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                                {order.shop_id?.logo ? (
                                  <img src={order.shop_id.logo} alt="shop" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">S</div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white leading-none mb-1">{order.shop_id?.name || 'Unknown Shop'}</h4>
                                <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-black text-lg text-gray-900 dark:text-white">₹{order.total_amount}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.orderItems?.length || 0} Items</p>
                              </div>
                              <Badge variant="outline" className={
                                order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                                'bg-blue-50 text-blue-600 border-blue-200'
                              }>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
