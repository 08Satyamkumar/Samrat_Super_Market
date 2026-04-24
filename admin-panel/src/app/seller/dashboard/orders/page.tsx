"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Clock } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Live Orders</h1>
        <p className="text-muted-foreground">Track and manage incoming orders in real-time.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center bg-card border border-border border-dashed rounded-2xl p-12 text-center h-full"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
            <div className="relative w-20 h-20 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center mb-6 text-violet-500">
              <ShoppingBag className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3">Waiting for orders...</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-pulse text-amber-500" />
            Keep your store open and ready.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
