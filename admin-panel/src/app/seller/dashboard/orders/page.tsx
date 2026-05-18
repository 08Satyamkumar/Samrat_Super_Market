"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Clock, CheckCircle2, XCircle, Phone, MessageCircle, Printer, Search, Timer, Check } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // New State variables
  const [currentTab, setCurrentTab] = useState<'new' | 'preparing' | 'ready' | 'completed'>('new');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderForTime, setSelectedOrderForTime] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState("15 mins");
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Timer for urgent orders
    const interval = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (id: string, status: string, isPaid: boolean, extraPayload: any = {}) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status, isPaid, ...extraPayload })
      });
      
      if (res.ok) {
        toast.success(`Order marked as ${status}`);
        fetchOrders(); // refresh immediately
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setUpdatingId(null);
      setSelectedOrderForTime(null);
    }
  };

  const handleAcceptOrder = () => {
    if (selectedOrderForTime) {
      updateOrderStatus(selectedOrderForTime, 'processing', true, { preparationTime: prepTime });
    }
  };

  const printKOT = (order: any) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    
    let itemsHtml = order.orderItems.map((item:any) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px dashed #ccc;"><b>${item.qty}x</b></td>
        <td style="padding: 8px 0; border-bottom: 1px dashed #ccc;">${item.name}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - ${order._id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; width: 300px; margin: 0 auto; color: #000; }
            h2, h3, p { margin: 5px 0; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
            hr { border-top: 2px dashed #000; margin: 15px 0; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>KOT</h2>
            <h3>ID: ${order._id.substring(order._id.length - 6).toUpperCase()}</h3>
            <p>${new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          <p>Customer: <b>${order.customerName}</b></p>
          <p>Phone: ${order.customerPhone}</p>
          <hr/>
          <table>
            ${itemsHtml}
          </table>
          <hr/>
          <p>Total: Rs. ${order.total_amount}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Filter Orders
  const filteredOrders = orders.filter(order => {
    // Search logic
    const searchMatch = 
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!searchMatch) return false;

    // Tab logic
    if (currentTab === 'new') return order.status === 'pending';
    if (currentTab === 'preparing') return order.status === 'processing';
    if (currentTab === 'ready') return order.status === 'ready';
    if (currentTab === 'completed') return ['delivered', 'cancelled', 'shipped'].includes(order.status);
    return true;
  });

  const getUrgencyLevel = (createdAt: string, status: string) => {
    if (status !== 'pending') return 0;
    const diffMins = (currentTime - new Date(createdAt).getTime()) / 60000;
    if (diffMins > 10) return 2; // Critical
    if (diffMins > 5) return 1; // Warning
    return 0; // Normal
  };

  return (
    <div className="h-full flex flex-col relative pb-20">
      <div className="mb-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Live Orders</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Listening for incoming orders...
            </p>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-card border border-border rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
          {[
            { id: 'new', label: 'New', count: orders.filter(o => o.status === 'pending').length },
            { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'processing').length },
            { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
            { id: 'completed', label: 'Completed', count: orders.filter(o => ['delivered', 'cancelled', 'shipped'].includes(o.status)).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                currentTab === tab.id 
                  ? "bg-violet-600 text-white shadow-md" 
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${currentTab === tab.id ? "bg-white/20" : "bg-violet-500/10 text-violet-500"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Clock className="w-8 h-8 animate-spin text-zinc-300" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 flex-1 mt-4">
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
            <h2 className="text-2xl font-bold mb-3">No orders found</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-pulse text-amber-500" />
              Keep your store open and ready.
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const urgency = getUrgencyLevel(order.createdAt, order.status);
              return (
                <motion.div 
                  key={order._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                  className={`bg-card border rounded-2xl p-6 flex flex-col shadow-sm transition-all duration-300 ${
                    urgency === 2 ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
                    urgency === 1 ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 
                    'border-border hover:border-violet-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 inline-block border border-border">
                          ID: {order._id.substring(order._id.length - 6).toUpperCase()}
                        </span>
                        {urgency > 0 && (
                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${urgency === 2 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            <Timer className="w-3 h-3" /> 
                            {Math.floor((currentTime - new Date(order.createdAt).getTime()) / 60000)}m ago
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-foreground">{order.customerName}</h3>
                      
                      {/* Contact Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        <a href={`tel:${order.customerPhone}`} className="flex items-center justify-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                        <a href={`https://wa.me/${order.customerPhone}?text=Hi%20${order.customerName},%20regarding%20your%20order%20from%20our%20shop...`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="block font-black text-2xl text-foreground">₹{order.total_amount}</span>
                      <span className={`text-xs uppercase font-bold tracking-wider px-2 py-1 rounded border ${
                        order.isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                      }`}>
                        {order.isPaid ? 'Paid' : order.paymentMethod}
                      </span>
                      <button 
                        onClick={() => printKOT(order)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="Print KOT"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 mb-6">
                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center justify-between">
                      Order Items:
                      <span className="text-xs font-medium text-muted-foreground">{order.orderItems?.length} items</span>
                    </h4>
                    <ul className="space-y-2">
                      {order.orderItems.map((item: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold border border-border">{item.qty}x</span>
                            <span className="text-muted-foreground truncate max-w-[150px] font-medium">{item.name}</span>
                          </span>
                          <span className="font-semibold text-foreground">₹{item.price * item.qty}</span>
                        </li>
                      ))}
                    </ul>
                    {order.preparationTime && (
                      <div className="mt-4 p-2 rounded-lg bg-violet-500/5 border border-violet-500/10 text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Target Prep Time: {order.preparationTime}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border mt-auto">
                    {order.status === 'pending' && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setSelectedOrderForTime(order._id)}
                          disabled={updatingId === order._id}
                          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Accept Order
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order._id, 'cancelled', false)}
                          disabled={updatingId === order._id}
                          className="flex-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 border border-red-200 dark:border-red-500/20"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}

                    {order.status === 'processing' && (
                      <button 
                        onClick={() => updateOrderStatus(order._id, 'ready', order.isPaid)}
                        disabled={updatingId === order._id}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md active:scale-95"
                      >
                        <Check className="w-5 h-5" /> Mark Food Ready
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button 
                        onClick={() => updateOrderStatus(order._id, 'delivered', order.isPaid)}
                        disabled={updatingId === order._id}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md active:scale-95"
                      >
                        <CheckCircle2 className="w-5 h-5" /> Mark as Completed
                      </button>
                    )}

                    {['delivered', 'cancelled', 'shipped'].includes(order.status) && (
                      <div className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border capitalize ${
                        order.status === 'delivered' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                        'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}>
                        Status: {order.status}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Preparation Time Modal */}
      <AnimatePresence>
        {selectedOrderForTime && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedOrderForTime(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-card border border-border p-6 rounded-2xl shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-2">Preparation Time</h3>
              <p className="text-sm text-muted-foreground mb-6">How much time will you take to prepare this order?</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {["10 mins", "15 mins", "20 mins", "30 mins", "45 mins", "1 hr"].map((time) => (
                  <button
                    key={time}
                    onClick={() => setPrepTime(time)}
                    className={`py-2 rounded-xl font-semibold border transition-all ${
                      prepTime === time 
                        ? "bg-violet-600 text-white border-violet-600 shadow-md" 
                        : "bg-muted border-transparent text-foreground hover:border-border"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedOrderForTime(null)}
                  className="flex-1 py-3 font-bold rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAcceptOrder}
                  className="flex-1 py-3 font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
