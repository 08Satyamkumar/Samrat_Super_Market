"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function IosInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default to true so it doesn't flash

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if app is already installed (standalone mode)
    // @ts-ignore - Apple specific property
    const isStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;
    
    // Check if user dismissed it previously
    const hasDismissed = localStorage.getItem("iosInstallPromptDismissed") === "true";

    if (isIosDevice && !isStandaloneMode && !hasDismissed) {
      setIsIOS(true);
      setIsStandalone(false);
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("iosInstallPromptDismissed", "true");
  };

  if (!isIOS || isStandalone || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl sm:max-w-sm sm:mx-auto"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col gap-3 pt-2">
            <h3 className="text-white font-bold text-sm">Install Samrat Market App</h3>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Install this application on your iPhone for a faster, full-screen experience.
            </p>
            <div className="flex flex-col gap-2 text-xs text-zinc-400 font-medium bg-black/40 p-3 rounded-xl border border-white/5">
              <div className="flex items-center">
                1. Tap the Share icon <Share className="w-4 h-4 mx-2 text-blue-400" /> at the bottom.
              </div>
              <div className="flex items-center">
                2. Select <span className="font-bold text-white mx-1">Add to Home Screen</span> <PlusSquare className="w-4 h-4 inline-block ml-1 text-zinc-300" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
