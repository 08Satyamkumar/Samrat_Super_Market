"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function WhatsAppSupport() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Determine if we are in a dashboard area where the support button should be visible
  const isUserArea = pathname?.startsWith("/user/");
  const isSellerArea = pathname?.startsWith("/seller/dashboard");
  
  if (!isSellerArea) {
    return null;
  }

  const phoneNumber = "919217571488"; // Standardized WhatsApp number with country code
  const message = "Hello Super Admin, I need some help with Samrat Market.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="hidden md:flex fixed top-[85px] right-4 md:top-auto md:bottom-6 md:right-6 z-[100] flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-xl shadow-2xl mb-1 pointer-events-auto flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Super Admin</span>
              <span className="text-sm font-medium">Chat on WhatsApp</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-12 bg-black hover:bg-zinc-900 border border-white/10 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all cursor-pointer px-4 gap-3 relative overflow-hidden group"
        >
          {/* Subtle button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-zinc-700 to-black border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10">
            <span className="text-white font-black text-xs tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">SM</span>
          </div>
          
          <div className="w-px h-5 bg-white/10 relative z-10"></div>
          
          <span className="text-zinc-300 font-medium text-xs tracking-wide group-hover:text-white transition-colors relative z-10">Help Center</span>
        </motion.div>
      </a>
    </div>
  );
}
