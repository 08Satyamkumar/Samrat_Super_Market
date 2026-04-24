"use client";

import { motion } from "framer-motion";
import { Store, Palette, Upload } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Store Settings</h1>
        <p className="text-muted-foreground">Customize your brand, upload your logo, and manage store details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings Navigation/Sidebar */}
        <div className="space-y-2">
          {["Brand & Identity", "Store Details", "Payment Settings", "Notifications"].map((item, i) => (
            <button 
              key={item} 
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                i === 0 ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Main Settings Content */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 space-y-6"
        >
          {/* Logo Upload Section */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Store className="w-5 h-5 text-violet-500" /> Store Logo
            </h3>
            
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-muted border border-border border-dashed flex items-center justify-center shrink-0">
                <Store className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a high-quality logo to represent your brand. Recommended size: 512x512px.
                </p>
                <button className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl font-medium transition-colors border border-border">
                  <Upload className="w-4 h-4" />
                  Choose File
                </button>
              </div>
            </div>
          </div>

          {/* Theme/Color Settings */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-fuchsia-500" /> Brand Color
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a primary color for your storefront buttons and accents.
            </p>
            <div className="flex gap-3">
              {["bg-violet-500", "bg-emerald-500", "bg-blue-500", "bg-rose-500", "bg-amber-500"].map((color) => (
                <button 
                  key={color} 
                  className={`w-10 h-10 rounded-full ${color} cursor-pointer hover:scale-110 transition-transform border-2 border-transparent focus:border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900`} 
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button className="bg-foreground text-background hover:bg-foreground/90 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md">
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
