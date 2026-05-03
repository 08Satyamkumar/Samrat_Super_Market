"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingBag, DollarSign, Package, ArrowUpRight, Store, Clock, Power, Settings, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function SellerDashboardHome() {
  const router = useRouter();
  const [shopSettings, setShopSettings] = useState({
    isOpen: true,
    openingTime: '10:00',
    closingTime: '22:00',
    estimatedDeliveryTime: '30-45 mins',
    upiId: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    ordersToday: 0,
    activeItemsCount: 0,
    recentOrders: []
  });

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/shop/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.shop) {
          setShopSettings({
            isOpen: data.shop.isOpen ?? true,
            openingTime: data.shop.openingTime || '10:00',
            closingTime: data.shop.closingTime || '22:00',
            estimatedDeliveryTime: data.shop.estimatedDeliveryTime || '30-45 mins',
            upiId: data.shop.upiId || ''
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData({
          totalRevenue: data.totalRevenue || 0,
          ordersToday: data.ordersToday || 0,
          activeItemsCount: data.activeItemsCount || 0,
          recentOrders: data.recentOrders || []
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchAnalytics();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/shop/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(shopSettings)
      });
      if (res.ok) {
        toast.success("Shop operations updated successfully! 🚀");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };
  const stats = [
    { name: "Total Revenue", value: `₹${dashboardData.totalRevenue.toLocaleString()}`, change: "Real-time", icon: DollarSign, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
    { name: "Orders Today", value: dashboardData.ordersToday.toString(), change: "Live", icon: ShoppingBag, color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10 dark:bg-violet-500/20" },
    { name: "Active Menu Items", value: dashboardData.activeItemsCount.toString(), change: "Live", icon: Package, color: "text-fuchsia-500 dark:text-fuchsia-400", bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20" },
    { name: "Store Visits", value: "Analytics", change: "Coming Soon", icon: Users, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-500/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your store control panel. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_15px_40px_rgba(139,92,246,0.2)] dark:hover:shadow-[0_15px_40px_rgba(139,92,246,0.15)] hover:-translate-y-1 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-foreground/5 to-transparent rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-semibold bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {stat.change}
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-1 text-foreground">{stat.value}</h3>
                <p className="text-muted-foreground text-sm font-medium">{stat.name}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Setup Guide (Onboarding Progress) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-fuchsia-500/5 dark:bg-fuchsia-500/10 rounded-full blur-2xl translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-foreground">
              <span>🚀</span> Let's get your store ready!
            </h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md leading-relaxed">Complete these simple steps to set up your store perfectly and start receiving orders like a pro.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${dashboardData.activeItemsCount > 0 ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-muted border border-border'}`}>
                  {dashboardData.activeItemsCount > 0 ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full" />}
                </div>
                <span className={`text-sm font-medium ${dashboardData.activeItemsCount > 0 ? 'text-muted-foreground line-through opacity-80' : 'text-foreground'}`}>Add Menu Items to Inventory</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${shopSettings.upiId ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-muted border border-border'}`}>
                  {shopSettings.upiId ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full" />}
                </div>
                <span className={`text-sm font-medium ${shopSettings.upiId ? 'text-muted-foreground line-through opacity-80' : 'text-foreground'}`}>Set Up UPI Payment Details</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${shopSettings.isOpen ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-muted border border-border'}`}>
                  {shopSettings.isOpen ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full" />}
                </div>
                <span className={`text-sm font-medium ${shopSettings.isOpen ? 'text-muted-foreground line-through opacity-80' : 'text-foreground'}`}>Open Shop to accept orders</span>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col items-center justify-center bg-muted/30 p-8 rounded-2xl border border-border shadow-inner">
            <div className="text-5xl font-black mb-1 bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {Math.round(((dashboardData.activeItemsCount > 0 ? 1 : 0) + (shopSettings.upiId ? 1 : 0) + (shopSettings.isOpen ? 1 : 0)) / 3 * 100)}%
            </div>
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">Completed</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Orders & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <button className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 transition-colors">
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {dashboardData.recentOrders.length > 0 ? dashboardData.recentOrders.map((order: any) => (
              <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:border-violet-500/30 transition-all group cursor-pointer gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-bold text-foreground group-hover:bg-violet-500/10 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors shadow-sm text-sm">
                    #{order._id.substring(order._id.length - 4).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground capitalize">{order.customerName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-muted-foreground">{order.orderItems?.length || 0} items</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 
                        {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <div className="font-black text-lg text-foreground mb-0 sm:mb-1">₹{order.total_amount}</div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold shadow-sm border capitalize
                    ${order.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                      'bg-green-500/10 text-green-600 border-green-500/20'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 bg-violet-500/10 rounded-2xl blur-md" />
                  <Package className="w-8 h-8 text-zinc-300 relative z-10" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-lg">Your store is Live!</h3>
                <p className="text-sm text-muted-foreground max-w-[220px]">Waiting for your first order. Keep this dashboard open.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Brand Building Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 dark:from-violet-600/20 dark:to-fuchsia-600/20 border border-violet-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_15px_40px_rgba(139,92,246,0.2)] hover:-translate-y-1 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-violet-500/20 border border-border dark:border-violet-500/30 shadow-sm flex items-center justify-center mb-5 text-violet-600 dark:text-violet-400">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-foreground">Build Your Brand</h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">
              Customize your storefront, upload a logo, and create a unique experience for your customers to boost sales.
            </p>
          </div>

          <button 
            onClick={() => router.push('/seller/dashboard/settings')}
            className="relative z-10 w-full py-3.5 px-4 bg-foreground text-background hover:bg-foreground/90 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:gap-3 active:scale-[0.98]">
            Customize Store
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </motion.div>

      </div>

      {/* Shop Operations Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Live Shop Operations</h2>
            <p className="text-sm text-muted-foreground">Control your storefront visibility and delivery estimates in real-time.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Live Toggle */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-border flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground">Accept Orders</h4>
                <p className="text-xs text-muted-foreground mt-1">Turn off if you're closed or too busy.</p>
              </div>
              <button 
                onClick={() => setShopSettings(prev => ({ ...prev, isOpen: !prev.isOpen }))}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 shadow-inner flex items-center px-1 ${shopSettings.isOpen ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
              >
                <span className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${shopSettings.isOpen ? 'translate-x-6' : 'translate-x-0'}`}>
                  {shopSettings.isOpen && <Power className="w-3.5 h-3.5 text-green-500" />}
                </span>
              </button>
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Estimated Delivery Time</label>
              <input 
                type="text" 
                value={shopSettings.estimatedDeliveryTime}
                onChange={(e) => setShopSettings(prev => ({ ...prev, estimatedDeliveryTime: e.target.value }))}
                placeholder="e.g. 30-45 mins" 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Opening Time</label>
                <input 
                  type="time" 
                  value={shopSettings.openingTime}
                  onChange={(e) => setShopSettings(prev => ({ ...prev, openingTime: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Closing Time</label>
                <input 
                  type="time" 
                  value={shopSettings.closingTime}
                  onChange={(e) => setShopSettings(prev => ({ ...prev, closingTime: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                />
              </div>
            </div>

            {/* Payment Settings */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Shop UPI ID (For Direct Payments)</label>
              <input 
                type="text" 
                value={shopSettings.upiId || ''}
                onChange={(e) => setShopSettings(prev => ({ ...prev, upiId: e.target.value }))}
                placeholder="e.g. shopname@ybl or 9876543210@paytm" 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-mono"
              />
            </div>
            
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full py-3.5 px-4 bg-foreground text-background hover:bg-foreground/90 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-6 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save Operations Settings</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
