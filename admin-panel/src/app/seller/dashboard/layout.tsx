"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auth Guard
    const token = localStorage.getItem("sellerToken");
    const infoStr = localStorage.getItem("sellerInfo");

    if (!token || !infoStr) {
      router.push("/seller/login");
      return;
    }

    try {
      const info = JSON.parse(infoStr);
      setSellerName(info.name);
      setShopName(info.shopName);
    } catch (e) {
      console.error("Error parsing seller info", e);
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, [router]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerInfo");
    router.push("/seller/login");
  };

  const navItems = [
    { name: "Overview", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Menu & Items", href: "/seller/dashboard/menu", icon: UtensilsCrossed },
    { name: "Live Orders", href: "/seller/dashboard/orders", icon: ShoppingBag },
    { name: "Store Settings", href: "/seller/dashboard/settings", icon: Settings },
  ];

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-violet-500/30 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className="relative z-50 hidden md:block">
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="sticky top-0 h-screen bg-card border-r border-border flex flex-col overflow-hidden whitespace-nowrap transition-colors duration-300 shadow-xl"
        >
          <div className="p-5 flex items-center justify-between border-b border-border h-[72px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
                <Store className="w-5 h-5 text-white" />
              </div>
              {isSidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
                  <span className="font-bold text-lg tracking-tight text-foreground">{shopName || "My Store"}</span>
                  <span className="text-xs text-muted-foreground">Control Panel</span>
                </motion.div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileSidebarOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                    isActive 
                      ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold border border-violet-500/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground group-hover:text-foreground"}`} />
                    
                    {isSidebarOpen && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}
                    
                    {isActive && (
                      <motion.div layoutId="activeNav" className="absolute left-0 top-2 bottom-2 w-1 bg-violet-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                    )}

                    {/* Tooltip for collapsed state */}
                    {!isSidebarOpen && (
                      <div className="absolute left-14 bg-popover border border-border text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl">
                        {item.name}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border flex flex-col gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-muted-foreground hover:bg-muted hover:text-foreground ${!isSidebarOpen && "justify-center"}`}
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              {isSidebarOpen && <span className="font-medium text-sm text-left flex-1">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </button>

            {/* User Profile */}
            <div className="bg-muted/50 rounded-xl p-3 border border-border flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3 truncate pr-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                  <span className="font-bold text-white text-sm">
                    {sellerName ? sellerName.charAt(0).toUpperCase() : "S"}
                  </span>
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium text-foreground truncate">{sellerName || "Seller"}</span>
                    <span className="text-xs text-muted-foreground">Owner</span>
                  </div>
                )}
              </div>
              
              {isSidebarOpen && (
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive/80 transition-colors shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Logout button for collapsed state */}
            {!isSidebarOpen && (
              <button 
                onClick={handleLogout}
                className="p-3 w-full flex justify-center rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.aside>

        {/* Desktop Collapse Toggle (Moved outside overflow-hidden) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-24 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-violet-600 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all z-50 cursor-pointer shadow-md"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header for Mobile */}
        <header className="md:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">{shopName || "My Store"}</span>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-lg bg-muted text-muted-foreground"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Premium Background Effects */}
          <div className="absolute inset-0 bg-background pointer-events-none -z-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent pointer-events-none -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-fuchsia-500/10 via-transparent to-transparent pointer-events-none -z-10" />
          
          <div className="p-4 md:p-8 relative z-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
