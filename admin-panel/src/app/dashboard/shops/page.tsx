"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Store, AlertCircle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
        localStorage.setItem("seller", JSON.stringify(data.seller));
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
    </div>
  );
}
