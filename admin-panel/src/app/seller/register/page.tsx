"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, Store, MapPin, Tag, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SellerRegistration() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    shopName: "",
    shopAddress: "",
    pincode: "",
    category: "veg",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/seller/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert(data.message || "Failed to register. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-zinc-950 py-12">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[60%] h-[60%] rounded-full bg-zinc-800/30 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="backdrop-blur-xl bg-zinc-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="relative">
            {/* Header */}
            {!isSuccess && (
              <div className="text-center mb-10">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                  className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
                >
                  <Store className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Open Your Dukaan</h1>
                <p className="text-zinc-400 text-sm">Join the fastest growing food network today.</p>
                
                {/* Progress Bar */}
                <div className="flex items-center justify-center gap-2 mt-8">
                  <div className={`h-1.5 w-16 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                  <div className={`h-1.5 w-16 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* SUCCESS STATE */}
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center mb-6 border border-emerald-500/30">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-4">Application Submitted!</h2>
                  <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                    Aapki details safely submit ho chuki hain. Samrat Market admin aapki profile verify karke jald hi approve karenge.
                  </p>
                  <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 mb-8 text-left">
                    <h3 className="text-white font-bold mb-2">Next Steps:</h3>
                    <ul className="text-sm text-zinc-400 space-y-2">
                      <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"/> Admin approval ka wait karein (Takes max 24 hours).</li>
                      <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"/> Approve hone par aapko SMS/Email aayega.</li>
                      <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"/> Uske baad login karke apna Menu aur Bank details add karein.</li>
                    </ul>
                  </div>
                  <Link href="/seller/login">
                    <button className="w-full bg-white hover:bg-gray-200 text-black rounded-xl py-3.5 font-bold transition-all">
                      Go to Login Page
                    </button>
                  </Link>
                </motion.div>
              ) : (
                /* STEP 1: PERSONAL DETAILS */
                step === 1 ? (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleNextStep}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Owner Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-zinc-500" />
                          </div>
                          <input type="text" required name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600" placeholder="Rahul Kumar" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-zinc-500" />
                          </div>
                          <input type="tel" required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600" placeholder="+91 9876543210" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input type="email" required name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600" placeholder="owner@shop.com" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Create Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input type="password" required name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600" placeholder="••••••••" />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full mt-8 bg-white hover:bg-gray-200 text-black rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.form>
                ) : (
                  /* STEP 2: SHOP DETAILS */
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Shop Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Store className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input type="text" required name="shopName" value={formData.shopName} onChange={handleInputChange} className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600" placeholder="Sharma Bhojnalaya" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Shop Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-zinc-500" />
                          </div>
                          <input type="text" required name="shopAddress" value={formData.shopAddress} onChange={handleInputChange} className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600" placeholder="Street/Area name" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Pincode</label>
                        <input type="text" required name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600" placeholder="110001" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Food Category</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Tag className="h-5 w-5 text-zinc-500" />
                        </div>
                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                          <option value="veg">Pure Veg Food</option>
                          <option value="nonveg">Non-Veg / Mixed Food</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button
                        type="button"
                        onClick={handlePreviousStep}
                        className="w-14 h-[52px] shrink-0 flex items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl h-[52px] font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed group"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Submit Application"
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                )
              )}
            </AnimatePresence>

            {!isSuccess && (
              <div className="mt-8 text-center border-t border-white/5 pt-6">
                <p className="text-sm text-zinc-400">
                  Already have a dukaan?{" "}
                  <Link href="/seller/login" className="text-white font-medium hover:text-emerald-400 transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-emerald-400">
                    Login here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
