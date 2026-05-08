"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, token: string) => void;
  primaryColor?: string;
  gradientStyle?: any;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess, primaryColor = "#18181b", gradientStyle = { background: "#18181b" } }: LoginModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const handleSendOtp = async () => {
    if (!customerName || !customerPhone) {
      toast.error("Please enter Name and Phone number");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/api/users/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customerName, phone: customerPhone })
      });
      if (res.ok) {
        const data = await res.json();
        setOtpStep(true);
        toast.success(`Mock OTP: ${data.mockOtp}`, { duration: 10000 });
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput) {
      toast.error("Please enter OTP");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/api/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customerPhone, otp: otpInput })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userId", data.user._id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userPhone", data.user.phone);
        
        onLoginSuccess(data.user, data.token);
        
        setOtpStep(false);
        setOtpInput("");
        toast.success(`Welcome, ${data.user.name}!`);
      } else {
        toast.error("Invalid or expired OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => !isLoggingIn && onClose()} />
          
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-md rounded-[2.5rem] relative z-10 overflow-hidden bg-white shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter">Login to Order</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {!otpStep ? (
              <>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Your Name</label>
                    <input type="text" placeholder="Rahul Kumar" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Phone Number</label>
                    <input type="tel" placeholder="9876543210" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900 placeholder:text-zinc-400" />
                  </div>
                </div>
                <button 
                  onClick={handleSendOtp} disabled={isLoggingIn || !customerName || !customerPhone}
                  className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  style={gradientStyle}
                >
                  {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Enter OTP</label>
                    <input type="text" placeholder="123456" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:border-zinc-400 focus:bg-white transition-all font-bold text-zinc-900 tracking-[0.5em] text-center text-xl" maxLength={6} />
                  </div>
                </div>
                <button 
                  onClick={handleVerifyOtp} disabled={isLoggingIn || !otpInput || otpInput.length < 6}
                  className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  style={gradientStyle}
                >
                  {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Continue'}
                </button>
                <button onClick={() => setOtpStep(false)} className="w-full mt-4 text-zinc-500 font-bold text-sm hover:text-zinc-900 transition-colors">
                  Back to Phone Number
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
