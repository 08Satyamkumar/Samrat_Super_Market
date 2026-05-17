"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Store, Eye, EyeOff, KeyRound, ChevronLeft } from "lucide-react";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";

type ViewMode = 'login' | 'forgot_email' | 'forgot_otp';

export default function SellerLogin() {
  const router = useRouter();
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password State
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // General State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const sellerToken = localStorage.getItem("sellerToken");
    if (sellerToken) {
      router.push("/seller/dashboard");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/seller/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      // Success
      localStorage.setItem("sellerToken", data.token);
      localStorage.setItem("sellerInfo", JSON.stringify(data.seller));
      
      router.push("/seller/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setErrorMsg("Please enter your email");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/seller/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to send OTP");
        setIsLoading(false);
        return;
      }

      toast.success(`Mock OTP: ${data.mockOtp}`, { duration: 10000 });
      setViewMode('forgot_otp');
    } catch (error) {
      console.error("OTP error:", error);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || !newPassword) {
      setErrorMsg("Please fill all fields");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_URL}/api/seller/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      toast.success("Password reset successfully! Please login.");
      setViewMode('login');
      setEmail(resetEmail);
      setPassword("");
      setResetOtp("");
      setNewPassword("");
    } catch (error) {
      console.error("Reset error:", error);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Store className="w-10 h-10 animate-bounce text-violet-500 mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm animate-pulse">Entering Dukaan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="backdrop-blur-xl bg-zinc-900/50 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-10 relative">
              {viewMode !== 'login' && (
                <button 
                  onClick={() => { setViewMode('login'); setErrorMsg(''); }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30"
              >
                {viewMode === 'login' ? <Store className="w-8 h-8 text-white" /> : <KeyRound className="w-8 h-8 text-white" />}
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {viewMode === 'login' ? 'Seller Portal' : 'Reset Password'}
              </h1>
              <p className="text-zinc-400 text-sm">
                {viewMode === 'login' ? 'Sign in to manage your storefront' : 
                 viewMode === 'forgot_email' ? 'Enter your email to receive a reset OTP' : 
                 'Enter the OTP and your new password'}
              </p>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium"
              >
                {errorMsg}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* LOGIN MODE */}
              {viewMode === 'login' && (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin} 
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-zinc-500" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-zinc-600"
                        placeholder="shop@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
                      <button type="button" onClick={() => { setViewMode('forgot_email'); setErrorMsg(''); }} className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">Forgot?</button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-zinc-500" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-zinc-600"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                  
                  <div className="mt-8 text-center">
                    <p className="text-sm text-zinc-400">
                      Want to become a seller?{" "}
                      <a href="#" className="text-white font-medium hover:text-violet-400 transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-violet-400">
                        Apply here
                      </a>
                    </p>
                  </div>
                </motion.form>
              )}

              {/* FORGOT EMAIL MODE */}
              {viewMode === 'forgot_email' && (
                <motion.form 
                  key="forgot-email-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendResetOtp} 
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Registered Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-zinc-500" />
                      </div>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-zinc-600"
                        placeholder="shop@example.com"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Send OTP'
                    )}
                  </motion.button>
                </motion.form>
              )}

              {/* FORGOT OTP MODE */}
              {viewMode === 'forgot_otp' && (
                <motion.form 
                  key="forgot-otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword} 
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Enter OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all tracking-[0.5em] text-center text-xl font-bold"
                      placeholder="123456"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-zinc-500" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-zinc-600"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || resetOtp.length < 6}
                    className="w-full mt-8 bg-green-600 hover:bg-green-500 text-white rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/25 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Verify & Reset Password'
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
