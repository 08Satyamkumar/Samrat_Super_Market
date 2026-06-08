"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Palette, Upload, Loader2, Check, QrCode, Clock, CreditCard, Bell, Info, ShoppingCart, Plus, Trash2, MapPin, Utensils } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('brand');
  
  // Brand
  const [logoUrl, setLogoUrl] = useState("https://via.placeholder.com/150");
  const [bannerUrl, setBannerUrl] = useState("");
  const [tagline, setTagline] = useState("Delicious Food, Delivered Fast.");
  const [themeColors, setThemeColors] = useState<string[]>(["#8b5cf6"]); // default violet
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  
  // Store Details
  const [isOpen, setIsOpen] = useState(true);
  const [openingTime, setOpeningTime] = useState("10:00");
  const [closingTime, setClosingTime] = useState("22:00");
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("30-45 mins");
  const [shopType, setShopType] = useState('restaurant');
  const [allowsDineIn, setAllowsDineIn] = useState(false);
  const [location, setLocation] = useState<{coordinates: number[]}>({ coordinates: [0, 0] });
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  // Payment
  const [upiId, setUpiId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  
  // Telegram
  const [isTelegramLinked, setIsTelegramLinked] = useState(false);
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);

  // Massive color palette for premium customization
  const availableColors = [
    // Purples/Pinks
    { hex: "#8b5cf6", name: "Violet" },
    { hex: "#c026d3", name: "Fuchsia" },
    { hex: "#ec4899", name: "Pink" },
    { hex: "#f43f5e", name: "Rose" },
    
    // Blues
    { hex: "#3b82f6", name: "Blue" },
    { hex: "#0ea5e9", name: "Sky" },
    { hex: "#06b6d4", name: "Cyan" },
    { hex: "#14b8a6", name: "Teal" },
    
    // Greens
    { hex: "#10b981", name: "Emerald" },
    { hex: "#22c55e", name: "Green" },
    { hex: "#84cc16", name: "Lime" },
    { hex: "#059669", name: "Forest" },

    // Warms
    { hex: "#f59e0b", name: "Amber" },
    { hex: "#ea580c", name: "Orange" },
    { hex: "#ef4444", name: "Red" },
    { hex: "#b45309", name: "Bronze" },

    // Darks/Golds/Neutrals
    { hex: "#1e1b4b", name: "Deep Indigo" },
    { hex: "#0f172a", name: "Slate" },
    { hex: "#000000", name: "Pure Black" },
    { hex: "#171717", name: "Neutral Dark" },
    { hex: "#fbbf24", name: "Gold" },
    { hex: "#9ca3af", name: "Silver" },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/shop/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.shop) {
          if (data.shop.logo) setLogoUrl(data.shop.logo);
          if (data.shop.bannerImage) setBannerUrl(data.shop.bannerImage);
          if (data.shop.tagline) setTagline(data.shop.tagline);
          if (data.shop.themeColors && data.shop.themeColors.length > 0) {
             setThemeColors(data.shop.themeColors);
          } else if (data.shop.themeColor) {
             setThemeColors([data.shop.themeColor]);
          }
          
          setIsOpen(data.shop.isOpen ?? true);
          setOpeningTime(data.shop.openingTime || "10:00");
          setClosingTime(data.shop.closingTime || "22:00");
          setEstimatedDeliveryTime(data.shop.estimatedDeliveryTime || "30-45 mins");
          setUpiId(data.shop.upiId || "");
          if (data.shop.shopType) setShopType(data.shop.shopType);
          if (data.shop.allowsDineIn !== undefined) setAllowsDineIn(data.shop.allowsDineIn);
          if (data.shop.location) setLocation(data.shop.location);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          coordinates: [position.coords.longitude, position.coords.latitude]
        });
        setIsFetchingLocation(false);
        toast.success("Location fetched successfully! 📍");
      },
      (error) => {
        console.error(error);
        setIsFetchingLocation(false);
        toast.error("Failed to get location. Please allow location permissions.");
      }
    );
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("shopLogo", file);

    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/shop/logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.shop.logo);
        toast.success("Logo uploaded successfully! 🚀");
      } else {
        toast.error("Failed to upload logo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while uploading logo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    const formData = new FormData();
    formData.append("shopBanner", file);

    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/shop/banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setBannerUrl(data.shop.bannerImage);
        toast.success("Hero Banner uploaded successfully! 🚀");
      } else {
        toast.error("Failed to upload banner");
      }
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleRemoveBanner = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/shop/banner`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setBannerUrl("");
        toast.success("Hero Banner removed! Reverted to default.");
      } else {
        toast.error("Failed to remove banner");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while removing banner");
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/shop/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          themeColors, 
          isOpen, 
          openingTime, 
          closingTime, 
          estimatedDeliveryTime, 
          upiId,
          tagline,
          shopType,
          allowsDineIn,
          location
        })
      });
      if (res.ok) {
        toast.success("Settings saved successfully! 🚀");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkTelegram = async () => {
    setIsLinkingTelegram(true);
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/telegram/link-token`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsTelegramLinked(data.isLinked);
        if (data.linkUrl) {
          window.open(data.linkUrl, "_blank");
        }
      } else {
        toast.error("Failed to generate Telegram link");
      }
    } catch (error) {
      toast.error("Network error connecting to Telegram");
    } finally {
      setIsLinkingTelegram(false);
    }
  };

  const handleColorToggle = (hex: string) => {
    setThemeColors(prev => {
      if (prev.includes(hex)) {
        if (prev.length === 1) {
          toast.error("Must have at least 1 brand color");
          return prev;
        }
        return prev.filter(c => c !== hex);
      }
      if (prev.length >= 3) {
        toast.error("You can select up to 3 colors only to make a gradient");
        return prev;
      }
      return [...prev, hex];
    });
  };

  const getGradientStyle = () => {
    if (themeColors.length === 0) return { background: "#8b5cf6" };
    if (themeColors.length === 1) return { background: themeColors[0] };
    if (themeColors.length === 2) return { background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})` };
    return { background: `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]}, ${themeColors[2]})` };
  };

  const getTextGradient = () => {
    if (themeColors.length === 0) return { color: "#8b5cf6" };
    if (themeColors.length === 1) return { color: themeColors[0] };
    return { 
      background: `linear-gradient(to right, ${themeColors[0]}, ${themeColors[1]})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    };
  }

  const tabs = [
    { id: 'brand', label: 'Brand & Identity', icon: Palette },
    { id: 'details', label: 'Store Details', icon: Store },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Store Settings</h1>
        <p className="text-muted-foreground">Customize your brand, operations, and payment methods.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Settings Navigation/Sidebar */}
        <div className="w-full md:w-64 space-y-2 shrink-0 sticky top-24">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                  isActive 
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" 
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Main Settings Content */}
        <div className="flex-1 w-full space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'brand' && (
              <motion.div 
                key="brand"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Logo Upload Section */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-foreground">
                    <Store className="w-5 h-5 text-violet-500" /> Store Logo
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                    <div className="w-32 h-32 rounded-2xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden relative group shadow-md">
                      <img src={logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-bold text-foreground mb-2">Upload High-Quality Identity</h4>
                      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                        This logo will appear on your User 3D Shop, order receipts, and in the marketplace. Recommended size: 512x512px. JPG or PNG.
                      </p>
                      <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploading ? "Uploading..." : "Browse Files"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hero Banner Upload Section */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-foreground">
                    <Store className="w-5 h-5 text-amber-500" /> Hero Banner
                  </h3>
                  
                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="w-full h-40 md:h-64 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden relative group shadow-md">
                      {bannerUrl ? (
                        <img src={bannerUrl} alt="Hero Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-muted-foreground p-6">
                           <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                           <p className="font-bold">No Banner Uploaded</p>
                           <p className="text-xs">A default banner will be shown.</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          This image appears at the top of your shop. Recommended size: 1920x1080px (16:9). JPG or PNG.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {bannerUrl && (
                          <button
                            onClick={handleRemoveBanner}
                            className="inline-flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        )}
                        <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/*" className="hidden" />
                        <button 
                          onClick={() => bannerInputRef.current?.click()}
                          disabled={isUploadingBanner}
                          className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                          {isUploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {isUploadingBanner ? "Uploading..." : "Upload Banner"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slogan / Tagline */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                     <Info className="w-5 h-5 text-blue-500" /> Shop Tagline
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                     Write a catchy slogan that appears on your Hero Banner.
                  </p>
                  <input 
                    type="text" 
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-violet-500 outline-none text-foreground font-medium"
                    placeholder="E.g., Delicious Food, Delivered Fast."
                  />
                </div>

                {/* 3-Color Gradient Builder */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-foreground">
                    <Palette className="w-5 h-5 text-fuchsia-500" /> 3-Color Gradient Theme
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Mix up to 3 colors to create a unique, premium gradient for your live User 3D Shop.
                  </p>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
                    <div className="xl:col-span-3">
                      <div className="flex flex-wrap gap-3">
                        {availableColors.map((colorObj) => {
                          const isSelected = themeColors.includes(colorObj.hex);
                          return (
                            <button 
                              key={colorObj.hex} 
                              onClick={() => handleColorToggle(colorObj.hex)}
                              style={{ backgroundColor: colorObj.hex }}
                              className={`relative w-12 h-12 rounded-xl cursor-pointer hover:scale-110 transition-all shadow-sm focus:outline-none flex items-center justify-center group`} 
                              title={colorObj.name}
                            >
                              {isSelected && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm z-10">
                                  <Check className="w-3.5 h-3.5 text-black" />
                                </span>
                              )}
                              {isSelected && (
                                <span className="absolute inset-0 rounded-xl border-[3px] border-white/50" />
                              )}
                              {/* Tooltip on hover */}
                              <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none">
                                {colorObj.name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <div className="mt-6 flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted p-3 rounded-lg w-max">
                        <Info className="w-4 h-4 text-violet-500" />
                        Select {3 - themeColors.length} more color{3 - themeColors.length !== 1 ? 's' : ''} for gradient effect.
                      </div>
                    </div>

                    {/* Advanced Live Preview Card - Demonstrating Full Shop UI Impact */}
                    <div className="xl:col-span-2 p-6 rounded-3xl relative overflow-hidden border border-border shadow-2xl h-[320px] flex flex-col justify-between group" style={getGradientStyle()}>
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                      
                      {/* Fake Navbar in Preview */}
                      <div className="relative z-10 flex justify-between items-center w-full">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-white shrink-0">
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-white font-bold text-xs">My 3D Shop</span>
                        </div>
                        {/* Fake Cart Icon with Theme Color */}
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg relative cursor-pointer hover:scale-105 transition-transform">
                          <ShoppingCart className="w-4 h-4" style={{ color: themeColors[0] }} />
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[8px] text-white font-bold">2</span>
                        </div>
                      </div>

                      {/* Fake Content in Preview */}
                      <div className="relative z-10 flex-1 flex flex-col items-center justify-center mt-4">
                         <h4 className="text-white font-black text-3xl mb-2 drop-shadow-lg text-center tracking-tight">Craving<br/>Something?</h4>
                         <p className="text-white/80 text-xs font-medium text-center mb-4">Delivering in 30 mins</p>
                      </div>

                      {/* Fake Bottom Card / Button */}
                      <div className="relative z-10 bg-white dark:bg-zinc-900 p-3 rounded-2xl w-full shadow-2xl border border-white/20 transform group-hover:-translate-y-1 transition-transform">
                         <div className="flex justify-between items-center">
                           <div>
                             <h5 className="font-bold text-sm text-foreground">Premium Burger</h5>
                             <p className="text-xs font-black mt-0.5" style={getTextGradient()}>₹199</p>
                           </div>
                           <button className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform" style={getGradientStyle()}>
                             <Plus className="w-4 h-4" />
                           </button>
                         </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6"
              >
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-orange-500" /> Operating Hours
                </h3>

                <div className="flex items-center justify-between p-5 bg-muted/50 rounded-xl border border-border">
                  <div>
                    <h4 className="font-bold text-foreground">Accept Orders Status</h4>
                    <p className="text-xs text-muted-foreground mt-1">Turn off if you're closed or too busy.</p>
                  </div>
                  <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 shadow-inner flex items-center px-1 ${isOpen ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                  >
                    <span className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isOpen ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <Utensils className="w-4 h-4 text-rose-500" /> Category & Services
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2">Shop Type</label>
                        <select 
                          value={shopType}
                          onChange={(e) => setShopType(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50 outline-none"
                        >
                          <option value="restaurant">Restaurant</option>
                          <option value="hotel">Hotel</option>
                          <option value="mess">Mess</option>
                          <option value="cafe">Cafe</option>
                          <option value="streetfood">Street Food</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                        <div>
                          <h4 className="font-bold text-sm">Dine-In Available?</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">Can users eat at your shop?</p>
                        </div>
                        <button 
                          onClick={() => setAllowsDineIn(!allowsDineIn)}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 shadow-inner flex items-center px-1 ${allowsDineIn ? 'bg-violet-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                        >
                          <span className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${allowsDineIn ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-blue-500" /> Shop Exact Location
                    </h3>
                    
                    <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-bold mb-1">Set Your Location</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Users nearby will see your shop first. Click to auto-fetch your GPS location.
                      </p>
                      
                      <button
                        onClick={handleFetchLocation}
                        disabled={isFetchingLocation}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isFetchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        {isFetchingLocation ? "Fetching GPS..." : "Fetch My Location"}
                      </button>

                      {location.coordinates[0] !== 0 && (
                        <div className="mt-3 p-2 bg-background border border-border rounded text-xs font-mono text-muted-foreground">
                          Lon: {location.coordinates[0].toFixed(4)}, Lat: {location.coordinates[1].toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div>
                    <label className="block text-sm font-bold mb-2">Opening Time</label>
                    <input 
                      type="time" 
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Closing Time</label>
                    <input 
                      type="time" 
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Estimated Delivery Time (Displayed to Users)</label>
                  <input 
                    type="text" 
                    value={estimatedDeliveryTime}
                    onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                    placeholder="e.g. 30-45 mins" 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6"
              >
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-emerald-500" /> Payment & Payouts
                </h3>

                <div>
                  <label className="block text-sm font-bold mb-2">Shop UPI ID (Direct Payments)</label>
                  <p className="text-xs text-muted-foreground mb-3">Users will scan or pay directly to this UPI ID. Ensure it's correct.</p>
                  <input 
                    type="text" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourshop@ybl" 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                  <QrCode className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-700 dark:text-blue-400">QR Code Scanner coming soon</h4>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-1">
                      Soon you'll be able to upload your Shop's QR Code image to be displayed natively in your 3D User Shop.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">Order Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get instant alerts even when the app is closed.</p>
                  </div>
                </div>

                <div className="p-6 bg-[#0088cc]/5 border border-[#0088cc]/20 rounded-2xl">
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-[#0088cc] text-lg mb-2">Connect Telegram Bot 🤖</h4>
                      <p className="text-sm text-foreground/80 font-medium leading-relaxed mb-4">
                        Never miss an order! Get loud alerts directly on your Telegram app. Best of all, you can <b>Accept or Reject</b> orders directly from the notification message without even opening this dashboard!
                      </p>
                      
                      <button 
                        onClick={handleLinkTelegram}
                        disabled={isLinkingTelegram}
                        className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
                      >
                        {isLinkingTelegram ? <Loader2 className="w-5 h-5 animate-spin" /> : <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.054-.298-.344-.105l-6.4 4.032-2.76-.864c-.6-.188-.61-.6.126-.893l10.79-4.164c.5-.195.94.116.827.845z"/></svg>}
                        {isTelegramLinked ? "Re-connect Telegram" : "Connect Telegram Alerts"}
                      </button>
                    </div>
                    {/* Visual demo for Telegram */}
                    <div className="w-64 shrink-0 bg-white dark:bg-zinc-900 rounded-2xl border border-border shadow-xl p-3 transform rotate-2 hidden md:block">
                      <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                        <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-white font-black text-xs">bot</div>
                        <div>
                          <p className="text-[10px] font-bold">FoodUniverse Bot</p>
                          <p className="text-[8px] text-[#0088cc]">bot</p>
                        </div>
                      </div>
                      <div className="bg-[#0088cc]/10 p-2 rounded-lg mb-2">
                        <p className="text-[10px] font-bold">🚨 NEW ORDER RECEIVED!</p>
                        <p className="text-[9px] mt-1 text-muted-foreground">Amount: ₹199</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-green-500/20 text-green-600 text-center py-1.5 rounded-md text-[9px] font-bold">✅ Accept</div>
                        <div className="flex-1 bg-red-500/20 text-red-600 text-center py-1.5 rounded-md text-[9px] font-bold">❌ Reject</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Save Button */}
          <div className="flex justify-end pt-4 sticky bottom-6 z-20">
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-violet-600 text-white hover:bg-violet-700 px-8 py-3.5 rounded-xl font-bold transition-all shadow-[0_10px_25px_rgba(139,92,246,0.4)] active:scale-95 flex items-center gap-2 disabled:opacity-50 border border-violet-500/50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {isSaving ? "Saving Everything..." : "Save All Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
