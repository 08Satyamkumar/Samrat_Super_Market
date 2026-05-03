"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Plus, Sparkles, Wand2, Loader2, CheckCircle2, Camera, UploadCloud, X, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export default function MenuPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [manualItem, setManualItem] = useState({ name: "", price: "", category: "general", description: "" });
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"text" | "image">("text");
  const [menuText, setMenuText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [itemsGenerated, setItemsGenerated] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/menu`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setSelectedItems([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAIUpload = async () => {
    if (uploadMethod === "text" && !menuText.trim()) {
      toast.error("Please paste your menu text first.");
      return;
    }
    if (uploadMethod === "image" && !imageFile) {
      toast.error("Please upload or capture a menu image first.");
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem("sellerToken");
      let res;

      if (uploadMethod === "text") {
        res = await fetch(`${API_URL}/api/seller/ai-menu-upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ menuText })
        });
      } else {
        const formData = new FormData();
        formData.append("menuImage", imageFile!);
        res = await fetch(`${API_URL}/api/seller/ai-menu-image-upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      }

      const data = await res.json();

      if (res.ok) {
        setItemsGenerated(data.count);
        setIsSuccess(true);
        toast.success(`Successfully generated ${data.count} items!`);
        setTimeout(() => {
          setShowUploadModal(false);
          setIsSuccess(false);
          setMenuText("");
          setImageFile(null);
          setImagePreview(null);
          fetchProducts();
        }, 2500);
      } else {
        toast.error(data.message || "Failed to generate menu");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while connecting to AI.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProductImageUpload = async (productId: string, file: File) => {
    const toastId = toast.loading("Uploading photo...");
    const formData = new FormData();
    formData.append('productImage', file);

    const token = localStorage.getItem("sellerToken");
    
    try {
      const res = await fetch(`${API_URL}/api/seller/product/${productId}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => p._id === productId ? data.product : p));
        toast.success("Photo updated successfully! 📸", { id: toastId });
      } else {
        toast.error("Failed to update photo.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error during upload.", { id: toastId });
    }
  };

  const handleRemoveProductImage = async (productId: string) => {
    if (!confirm("Are you sure you want to remove this photo?")) return;
    
    const toastId = toast.loading("Removing photo...");
    const token = localStorage.getItem("sellerToken");
    
    try {
      const res = await fetch(`${API_URL}/api/seller/product/${productId}/image`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => p._id === productId ? data.product : p));
        toast.success("Photo removed successfully!", { id: toastId });
      } else {
        toast.error("Failed to remove photo.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error during removal.", { id: toastId });
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualItem.name || !manualItem.price) {
      toast.error("Name and price are required");
      return;
    }
    
    setIsAddingManual(true);
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(manualItem)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Item added successfully! 🎉");
        setProducts(prev => [data.product, ...prev]);
        setShowManualAddModal(false);
        setManualItem({ name: "", price: "", category: "general", description: "" });
      } else {
        toast.error(data.message || "Failed to add item");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsAddingManual(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!manualItem.name) {
      toast.error("Please enter an item name first to generate a description");
      return;
    }

    setIsGeneratingDescription(true);
    const toastId = toast.loading("AI is cooking a description...");
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/product/generate-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: manualItem.name })
      });
      
      const data = await res.json();
      if (res.ok) {
        setManualItem(prev => ({ ...prev, description: data.description }));
        toast.success("Description generated! 🪄", { id: toastId });
      } else {
        toast.error(data.message || "Failed to generate description", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error while calling AI", { id: toastId });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === products.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(products.map(p => p._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) return;
    
    setIsDeletingBulk(true);
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/product/bulk-delete`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ ids: selectedItems })
      });
      if (res.ok) {
        toast.success("Selected items deleted successfully");
        setSelectedItems([]);
        fetchProducts();
      } else {
        toast.error("Failed to delete items");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Item deleted successfully");
        fetchProducts();
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleEdit = async (id: string, currentName: string, currentPrice: number) => {
    const newName = prompt("Enter new name:", currentName);
    if (!newName) return;
    const newPrice = prompt("Enter new price:", currentPrice.toString());
    if (!newPrice || isNaN(Number(newPrice))) return;

    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/product/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newName, price: Number(newPrice) })
      });
      if (res.ok) {
        toast.success("Item updated successfully");
        fetchProducts();
      } else {
        toast.error("Failed to update item");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await fetch(`${API_URL}/api/seller/product/${id}/availability`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      if (res.ok) {
        toast.success(`Item marked as ${!currentStatus ? 'In Stock' : 'Out of Stock'}`);
        // Optimistically update the state
        setProducts(products.map(p => p._id === id ? { ...p, isAvailable: !currentStatus } : p));
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Menu & Items</h1>
          <p className="text-muted-foreground">Manage your food items, categories, and prices here.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/25 transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            AI Menu Upload
          </button>
          <button 
            onClick={() => setShowManualAddModal(true)}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Manually
          </button>
        </div>
      </div>

      {!isLoadingProducts && products.length > 0 && (
        <div className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={products.length > 0 && selectedItems.length === products.length}
              onChange={toggleSelectAll}
              className="w-5 h-5 rounded border-border text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
            <span className="font-semibold select-none cursor-pointer" onClick={toggleSelectAll}>
              {selectedItems.length > 0 ? `${selectedItems.length} Selected` : "Select All"}
            </span>
          </div>
          
          <AnimatePresence>
            {selectedItems.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 shadow-md shadow-red-500/20"
              >
                {isDeletingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Selected
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {isLoadingProducts ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : products.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center bg-card border border-border rounded-3xl p-12 text-center relative overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent pointer-events-none" />

          <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 text-orange-500 border border-orange-500/20 relative z-10 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
            <UtensilsCrossed className="w-12 h-12" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">No items in your shop yet</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed text-lg relative z-10">
            Don't waste hours typing. Paste your raw menu and let our AI create premium 3D cards, write descriptions, and find the perfect photos automatically!
          </p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 relative z-10"
          >
            <Wand2 className="w-6 h-6" />
            Generate My Shop 🪄
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {products.map((item) => (
            <div key={item._id} className={`bg-card border ${selectedItems.includes(item._id) ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-border/50 dark:border-border'} rounded-[1.5rem] overflow-hidden flex flex-col group hover:-translate-y-1.5 transition-all duration-500 relative shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] dark:hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.1)]`}>
              {/* Checkbox */}
              <div className="absolute top-4 left-4 z-20">
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item._id)}
                  onChange={() => toggleItemSelection(item._id)}
                  className="w-5 h-5 rounded-md border-2 border-white text-orange-500 focus:ring-orange-500 bg-black/30 cursor-pointer shadow-lg backdrop-blur-md transition-all hover:scale-110"
                />
              </div>

              {/* Image Section */}
              <div className="h-56 w-full overflow-hidden relative">
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                
                {/* Badges / Image Upload */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
                  {item.isAIGenerated ? (
                    <label className="bg-black/40 hover:bg-black/60 cursor-pointer backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-xl transition-all hover:scale-105 active:scale-95 group/btn">
                      <Camera className="w-4 h-4 text-orange-400 group-hover/btn:text-orange-300" /> Add Real Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleProductImageUpload(item._id, e.target.files[0]);
                          }
                        }} 
                      />
                    </label>
                  ) : (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <label className="bg-black/60 hover:bg-black/80 cursor-pointer backdrop-blur-md border border-white/20 text-white p-2 rounded-lg text-xs font-bold flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95" title="Change Photo">
                        <Camera className="w-4 h-4" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleProductImageUpload(item._id, e.target.files[0]);
                            }
                          }} 
                        />
                      </label>
                      <button 
                        onClick={() => handleRemoveProductImage(item._id)}
                        className="bg-red-500/80 hover:bg-red-600 cursor-pointer backdrop-blur-md border border-red-500/50 text-white p-2 rounded-lg text-xs font-bold flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Price Tag */}
                <div className="absolute bottom-4 left-4 z-20 bg-orange-500/90 backdrop-blur-md text-white px-3.5 py-1 rounded-xl font-black text-lg shadow-[0_4px_20px_rgba(249,115,22,0.4)] border border-orange-400/50 flex items-center">
                  <span className="text-orange-100 text-sm mr-0.5">₹</span>{item.price}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-card to-card/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl leading-tight group-hover:text-orange-500 transition-colors line-clamp-1">{item.name}</h3>
                </div>

                {/* Shop Brand Info (Moved to Text Section) */}
                {item.shop_id && item.shop_id.name && (
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-lg border border-border/50 self-start">
                    <img src={item.shop_id.logo || 'https://via.placeholder.com/150'} alt={item.shop_id.name} className="w-5 h-5 rounded-full object-cover border border-border" />
                    <span className="text-xs font-semibold">{item.shop_id.name}</span>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                
                <div className="flex items-center justify-between mt-auto mb-4 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-border">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 ${item.isAvailable !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable !== false ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    {item.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
                  </span>
                  
                  {/* iOS Style Toggle */}
                  <button 
                    onClick={() => handleToggleAvailability(item._id, item.isAvailable !== false)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${item.isAvailable !== false ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700 shadow-inner'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${item.isAvailable !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => handleEdit(item._id, item.name, item.price)}
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isUploading && setShowUploadModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-border flex flex-col max-h-[90vh]"
            >
              {/* Magic Top Gradient */}
              <div className="h-2 w-full shrink-0 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
              
              <div className="p-6 md:p-8 overflow-y-auto">
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-2">Magic Successful! 🪄</h3>
                    <p className="text-muted-foreground text-lg">
                      AI created <b>{itemsGenerated} premium items</b> for your store.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Sparkles className="text-orange-500" />
                        AI Menu Generator
                      </h2>
                      <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex bg-muted p-1 rounded-xl mb-6">
                      <button
                        onClick={() => setUploadMethod("text")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${uploadMethod === "text" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Paste Text
                      </button>
                      <button
                        onClick={() => setUploadMethod("image")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${uploadMethod === "image" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Camera className="w-4 h-4" /> Image / Scan
                      </button>
                    </div>

                    {uploadMethod === "text" ? (
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <textarea
                          value={menuText}
                          onChange={(e) => setMenuText(e.target.value)}
                          placeholder="e.g.&#10;Paneer Butter Masala - 250&#10;Tandoori Roti - 20&#10;Veg Biryani 180"
                          className="relative w-full h-64 bg-background border border-border rounded-2xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none font-mono text-sm leading-relaxed"
                          disabled={isUploading}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          disabled={isUploading}
                        />
                        
                        {imagePreview ? (
                          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border-2 border-orange-500/50">
                            <img src={imagePreview} alt="Menu Preview" className="w-full h-auto object-contain" />
                            {isUploading && (
                              <motion.div 
                                initial={{ top: "0%" }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,1)]"
                              />
                            )}
                            {!isUploading && (
                              <button 
                                onClick={() => {setImageFile(null); setImagePreview(null)}}
                                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-64 border-2 border-dashed border-border hover:border-orange-500/50 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-muted/50 transition-all group"
                          >
                            <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Camera className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-lg mb-1">Upload or Scan Menu</p>
                              <p className="text-sm text-muted-foreground">Click to take a photo or select an image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 mt-8">
                      <button 
                        onClick={() => setShowUploadModal(false)}
                        className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors"
                        disabled={isUploading}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAIUpload}
                        disabled={isUploading || (uploadMethod === "text" ? !menuText.trim() : !imageFile)}
                        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {uploadMethod === "image" ? "Scanning Image..." : "Creating Shop..."}
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            Generate Magic
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {showManualAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isAddingManual && setShowManualAddModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-border flex flex-col"
            >
              <div className="h-2 w-full shrink-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500" />
              
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Plus className="text-indigo-500" />
                    Add Menu Item
                  </h2>
                  <button onClick={() => setShowManualAddModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleManualAdd} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Item Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={manualItem.name}
                      onChange={(e) => setManualItem({...manualItem, name: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      placeholder="e.g. Masala Dosa"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Price (₹) <span className="text-red-500">*</span></label>
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={manualItem.price}
                        onChange={(e) => setManualItem({...manualItem, price: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="150"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Category</label>
                      <input 
                        type="text" 
                        value={manualItem.category}
                        onChange={(e) => setManualItem({...manualItem, category: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                        placeholder="e.g. South Indian"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold">Description</label>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDescription || !manualItem.name}
                        className="flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white px-2.5 py-1 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!manualItem.name ? "Enter Item Name first" : "Generate Description with AI"}
                      >
                        {isGeneratingDescription ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                        Auto-Write
                      </button>
                    </div>
                    <textarea 
                      rows={3}
                      value={manualItem.description}
                      onChange={(e) => setManualItem({...manualItem, description: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Crispy crepe served with sambar and chutney..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-border/50">
                    <button 
                      type="button"
                      onClick={() => setShowManualAddModal(false)}
                      className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors"
                      disabled={isAddingManual}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isAddingManual}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingManual ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Save Item
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
