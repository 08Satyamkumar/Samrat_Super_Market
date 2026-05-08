"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, Bike, PackageOpen, Utensils } from "lucide-react";
import { API_URL } from "@/lib/api";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  userId: string;
  shopInfo?: any; // For UPI and specific shop details if any
  onOrderSuccess: () => void;
  primaryColor?: string;
  gradientStyle?: any;
  textGradientStyle?: any;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  cart, 
  totalPrice, 
  customerName, 
  customerPhone, 
  userId, 
  shopInfo, 
  onOrderSuccess,
  primaryColor = "#18181b",
  gradientStyle = { background: "#18181b" },
  textGradientStyle = { color: "#18181b" }
}: CheckoutModalProps) {
  
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('cash');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine-in'>('delivery');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handlePlaceOrder = async () => {
    if (!customerName || !customerPhone || cart.length === 0) return;
    setIsPlacingOrder(true);
    try {
      const activeShopId = shopInfo?._id || cart[0].shop_id?._id || cart[0].shop_id;
      const orderData = {
        userId: userId || null,
        customerName, 
        customerPhone,
        orderItems: cart.map(item => ({ name: item.name, qty: item.quantity, image: item.image, price: item.price, product_id: item._id })),
        total_amount: totalPrice,
        paymentMethod: paymentMethod === 'upi' ? 'Online/UPI' : 'Cash on Delivery',
        orderType
      };

      const res = await fetch(`${API_URL}/api/shops/${activeShopId}/orders`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(orderData)
      });
      
      if (res.ok) {
        setOrderSuccess(true); 
        setTimeout(() => { 
          setOrderSuccess(false); 
          onOrderSuccess();
        }, 3000);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsPlacingOrder(false); 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => !isPlacingOrder && !orderSuccess && onClose()} />
          
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md rounded-[2.5rem] relative z-10 overflow-hidden bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="h-2 w-full shrink-0" style={gradientStyle} />
            
            <div className="p-8 overflow-y-auto">
              {orderSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg" style={gradientStyle}>
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-black mb-3 text-zinc-900 tracking-tighter">Order Placed!</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">Your order has been transmitted to the kitchen. {orderType !== 'delivery' && 'Please show this screen at the counter.'}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8 shrink-0">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">Checkout</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="bg-zinc-50 rounded-3xl p-5 border border-zinc-100 mb-6 flex items-center gap-4 shrink-0">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl text-white shadow-md" style={gradientStyle}>
                      {customerName ? customerName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Delivering To</p>
                      <p className="font-bold text-zinc-900 text-lg line-clamp-1">{customerName || 'User'}</p>
                      <p className="text-xs text-zinc-500 line-clamp-1">{customerPhone}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-6 bg-zinc-50 p-5 rounded-3xl border border-zinc-100">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Total to Pay</span>
                      <span className="text-4xl font-black" style={textGradientStyle}>₹{totalPrice}</span>
                    </div>

                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-4 ml-2">Order Type</span>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <button onClick={() => setOrderType('delivery')} className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${orderType === 'delivery' ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}>
                        <Bike className="w-5 h-5 mb-1" />
                        <span className="font-bold text-xs">Delivery</span>
                      </button>
                      <button onClick={() => setOrderType('pickup')} className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${orderType === 'pickup' ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}>
                        <PackageOpen className="w-5 h-5 mb-1" />
                        <span className="font-bold text-xs">Pickup</span>
                      </button>
                      {shopInfo?.allowsDineIn ? (
                        <button onClick={() => setOrderType('dine-in')} className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${orderType === 'dine-in' ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}>
                          <Utensils className="w-5 h-5 mb-1" />
                          <span className="font-bold text-xs">Dine-In</span>
                        </button>
                      ) : (
                        <button disabled className="flex flex-col items-center justify-center p-3 rounded-2xl border border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed">
                          <Utensils className="w-5 h-5 mb-1 opacity-50" />
                          <span className="font-bold text-xs">No Dine-In</span>
                        </button>
                      )}
                    </div>
                    
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-4 ml-2">Select Payment</span>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setPaymentMethod('cash')} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'cash' ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}>
                        <span className="font-bold">Cash</span>
                        <span className="text-[10px] mt-1 opacity-70">Pay at counter/delivery</span>
                      </button>
                      
                      {shopInfo?.upiId ? (
                        <button onClick={() => setPaymentMethod('upi')} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${paymentMethod === 'upi' ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}>
                          <span className="font-bold">UPI</span>
                          <span className="text-[10px] mt-1 opacity-70">Scan QR</span>
                        </button>
                      ) : (
                        <button disabled className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed">
                          <span className="font-bold">UPI</span>
                          <span className="text-[10px] mt-1">Not Available</span>
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {paymentMethod === 'upi' && shopInfo?.upiId && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 flex flex-col items-center text-center mt-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200 mb-4">
                              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${shopInfo.upiId}&pn=${encodeURIComponent(shopInfo.name)}`} alt="UPI QR Code" className="w-32 h-32" />
                            </div>
                            <p className="font-mono font-bold text-zinc-900 bg-white border border-zinc-200 px-4 py-2 rounded-xl shadow-sm">{shopInfo.upiId}</p>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-4 font-bold">Scan using PhonePe, GPay or Paytm</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button 
                    onClick={handlePlaceOrder} disabled={isPlacingOrder || !customerName || !customerPhone}
                    className="w-full shrink-0 py-5 rounded-2xl text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    style={gradientStyle}
                  >
                    {isPlacingOrder ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Place Order Now'}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
