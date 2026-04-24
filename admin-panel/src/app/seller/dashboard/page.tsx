"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, ShoppingBag, DollarSign, Package, ArrowUpRight, Store, Clock } from "lucide-react";

export default function SellerDashboardHome() {
  const stats = [
    { name: "Total Revenue", value: "₹45,231.89", change: "+20.1%", icon: DollarSign, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10 dark:bg-emerald-500/20" },
    { name: "Orders Today", value: "24", change: "+12.5%", icon: ShoppingBag, color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/10 dark:bg-violet-500/20" },
    { name: "Active Menu Items", value: "86", change: "+4.3%", icon: Package, color: "text-fuchsia-500 dark:text-fuchsia-400", bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20" },
    { name: "Store Visits", value: "1,204", change: "+18.2%", icon: Users, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10 dark:bg-blue-500/20" },
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:border-violet-500/30 transition-all group cursor-pointer gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center font-bold text-foreground group-hover:bg-violet-500/10 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors shadow-sm">
                    #{1020 + i}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Veg Thali Deluxe</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-muted-foreground">2 items</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Just now</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                  <div className="font-black text-lg text-foreground mb-0 sm:mb-1">₹350.00</div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
                    Preparing
                  </span>
                </div>
              </div>
            ))}
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

          <button className="relative z-10 w-full py-3.5 px-4 bg-foreground text-background hover:bg-foreground/90 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:gap-3 active:scale-[0.98]">
            Customize Store
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </motion.div>

      </div>
    </div>
  );
}
