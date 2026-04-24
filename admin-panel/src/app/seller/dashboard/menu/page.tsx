"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed, Plus } from "lucide-react";

export default function MenuPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Menu & Items</h1>
          <p className="text-muted-foreground">Manage your food items, categories, and prices here.</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/25">
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center bg-card border border-border rounded-2xl p-12 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground border border-border">
          <UtensilsCrossed className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-3">No items yet</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          Your menu is currently empty. Start adding delicious items to your store to attract customers.
        </p>
        <button className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-6 py-3 rounded-xl font-bold transition-all active:scale-95">
          <Plus className="w-5 h-5" />
          Create First Item
        </button>
      </motion.div>
    </div>
  );
}
