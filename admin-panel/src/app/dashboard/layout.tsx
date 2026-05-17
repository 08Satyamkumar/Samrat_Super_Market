"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Menu, 
  LayoutDashboard, 
  Store, 
  Users, 
  ShoppingCart, 
  Settings, 
  User, 
  LogOut,
  Search,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery || searchQuery.trim() === '') {
        setSearchResults(null);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/dashboard/users', icon: User },
    { name: 'Shops', href: '/dashboard/shops', icon: Store },
    { name: 'Sellers', href: '/dashboard/sellers', icon: Users },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Feedbacks', href: '/dashboard/feedbacks', icon: MessageSquare },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} border-r bg-white dark:bg-zinc-900 flex flex-col transition-all duration-300 shadow-sm z-10 flex-shrink-0`}
      >
        <div className={`h-16 flex items-center ${isSidebarOpen ? 'px-6' : 'px-0 justify-center'} border-b font-bold text-xl text-blue-600 dark:text-blue-400 tracking-tight transition-all`}>
          {isSidebarOpen ? 'Samrat Admin Market' : 'SAM'}
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' 
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                } ${!isSidebarOpen && 'justify-center px-0'}`}
                title={!isSidebarOpen ? item.name : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b bg-white dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-6 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-300 flex-shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Global Search */}
            <div className="max-w-md w-full ml-2 relative" ref={searchRef}>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 dark:text-zinc-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search shops, sellers, or orders..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-gray-100/50 dark:bg-zinc-800/80 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 rounded-full pl-10 pr-10 py-2 text-sm outline-none transition-all duration-200 shadow-sm"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearchFocused && searchQuery && searchResults && (
                <div className="absolute top-full mt-2 w-full sm:w-[400px] bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[400px] overflow-y-auto py-2">
                    {/* Shops */}
                    {searchResults.shops && searchResults.shops.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Shops</div>
                        {searchResults.shops.map((shop: any) => (
                          <Link href="/dashboard/shops" key={shop._id} onClick={() => setIsSearchFocused(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <Store className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{shop.name}</p>
                              <p className="text-xs text-gray-500">{shop.category || 'General'}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {/* Sellers */}
                    {searchResults.sellers && searchResults.sellers.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sellers</div>
                        {searchResults.sellers.map((seller: any) => (
                          <Link href="/dashboard/sellers" key={seller._id} onClick={() => setIsSearchFocused(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <Users className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{seller.name}</p>
                              <p className="text-xs text-gray-500">{seller.email}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Orders */}
                    {searchResults.orders && searchResults.orders.length > 0 && (
                      <div className="mb-2">
                        <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Orders</div>
                        {searchResults.orders.map((order: any) => (
                          <Link href="/dashboard/orders" key={order._id} onClick={() => setIsSearchFocused(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <ShoppingCart className="w-4 h-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</p>
                              <p className="text-xs text-gray-500">{order.customerName || 'Customer'}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.shops?.length === 0 && searchResults.sellers?.length === 0 && searchResults.orders?.length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 cursor-pointer group outline-none"
              >
                <span className="text-sm font-medium hidden sm:block group-hover:text-blue-600 transition-colors">Super Admin</span>
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold group-hover:ring-2 ring-blue-300 ring-offset-2 dark:ring-offset-zinc-900 transition-all">
                  A
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b dark:border-zinc-800">
                    <p className="text-sm font-medium">My Account</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800">
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800">
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t dark:border-zinc-800 py-1">
                    <Link href="/login" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
