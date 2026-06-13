"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Store, AlertCircle, Eye, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    shopName: "",
    category: "",
    address: "",
    pincode: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleEditClick = (shop: any) => {
    setSelectedShop(shop);
    setEditForm({
      shopName: shop.name || "",
      category: shop.category || "food",
      address: shop.address || "",
      pincode: shop.pincode || "",
      ownerName: shop.owner_id?.name || "",
      ownerEmail: shop.owner_id?.email || "",
      ownerPhone: shop.owner_id?.phone || ""
    });
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/shops/${selectedShop._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Shop details updated successfully");
        setSelectedShop(null);
        fetchShops();
      } else {
        toast.error(data.message || "Failed to update shop details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating shop details");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchShops = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/shops`);
      const data = await res.json();
      setShops(data);
    } catch (error) {
      console.error("Failed to fetch shops", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/shops/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchShops(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleImpersonate = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/shops/${id}/impersonate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Store impersonation data in localStorage
        localStorage.setItem("sellerToken", data.token);
        localStorage.setItem("sellerInfo", JSON.stringify(data.seller));
        localStorage.setItem("isImpersonated", "true");
        
        // Redirect to seller dashboard
        router.push("/seller/dashboard");
      } else {
        alert(data.message || "Failed to impersonate shop");
      }
    } catch (error) {
      console.error("Error during impersonation", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Shops Management</h2>
      </div>

      <Card className="border-white/10 bg-zinc-950/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Store className="w-5 h-5" /> Pending & Active Shops
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 flex flex-col items-center">
              <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
              <p>No shops registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-zinc-300">
                <thead className="text-xs uppercase bg-zinc-900 text-zinc-400">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Shop Name</th>
                    <th className="px-6 py-4">Owner Email</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr key={shop._id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {shop.name}
                      </td>
                      <td className="px-6 py-4">
                        {shop.owner_id?.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {shop.category}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="outline" 
                          className={
                            shop.status === 'pending' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10' :
                            shop.status === 'active' ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' :
                            'border-red-500/50 text-red-500 bg-red-500/10'
                          }
                        >
                          {shop.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {(shop.status === 'pending' || shop.status === 'suspended') && (
                          <button 
                            onClick={() => handleStatusUpdate(shop._id, 'active')}
                            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/30"
                            title={shop.status === 'pending' ? "Approve Shop" : "Reactivate Shop"}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {shop.status !== 'banned' && shop.status !== 'suspended' && (
                          <button 
                            onClick={() => handleStatusUpdate(shop._id, 'suspended')}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/30"
                            title="Suspend Shop"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditClick(shop)}
                          className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white transition-colors border border-amber-500/30"
                          title="Edit Shop Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleImpersonate(shop._id)}
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/30"
                          title="Login as Seller"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    {/* Edit Shop Modal */}
    {selectedShop && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-zinc-950 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="p-6 bg-zinc-900 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Pencil className="w-5 h-5 text-emerald-400" /> Edit Shop Details
            </h3>
            <button onClick={() => setSelectedShop(null)} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSaveDetails} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Shop Name</label>
              <input 
                type="text" 
                required
                value={editForm.shopName}
                onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                <select 
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm capitalize"
                >
                  <option value="food">food</option>
                  <option value="veg">veg</option>
                  <option value="nonveg">nonveg</option>
                  <option value="only-nonveg">only-nonveg</option>
                  <option value="bakery">bakery</option>
                  <option value="cafe">cafe</option>
                  <option value="grocery">grocery</option>
                  <option value="fashion">fashion</option>
                  <option value="electronics">electronics</option>
                  <option value="other">other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pincode</label>
                <input 
                  type="text" 
                  value={editForm.pincode}
                  onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Shop Address</label>
              <textarea 
                rows={2}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm resize-none"
              />
            </div>

            <div className="border-t border-white/5 pt-4 space-y-4">
              <h4 className="text-sm font-bold text-emerald-400">Seller (Owner) Info</h4>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Owner Name</label>
                <input 
                  type="text" 
                  required
                  value={editForm.ownerName}
                  onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Owner Email</label>
                  <input 
                    type="email" 
                    required
                    value={editForm.ownerEmail}
                    onChange={(e) => setEditForm({ ...editForm, ownerEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Owner Phone</label>
                  <input 
                    type="text" 
                    value={editForm.ownerPhone}
                    onChange={(e) => setEditForm({ ...editForm, ownerPhone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setSelectedShop(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium border border-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}
