"use client"

import { useState } from 'react';
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
  LogOut 
} from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Shops', href: '/dashboard/shops', icon: Store },
    { name: 'Sellers', href: '/dashboard/sellers', icon: Users },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
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
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>
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
