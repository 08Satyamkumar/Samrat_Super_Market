"use client";

import { useEffect, useState } from "react";
import { Users, Search, Loader2, UserX, UserCheck, Eye, ShieldAlert, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";
import { UserKundaliModal } from "@/components/admin/UserKundaliModal";

export default function UsersCRMPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`User ${newStatus === 'blocked' ? 'Suspended' : 'Activated'} Successfully`);
        setUsers(prev => prev.map(u => u._id === id ? { ...u, status: newStatus } : u));
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone?.includes(searchQuery)
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status !== 'blocked').length;
  const totalRevenue = users.reduce((acc, u) => acc + (u.totalSpent || 0), 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header & Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-6 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" /> User CRM
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-[2rem] shadow-lg text-white relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <p className="text-blue-100 font-medium mb-1">Total Users</p>
              <h3 className="text-4xl font-black">{totalUsers}</h3>
            </div>
            <Users className="absolute right-6 bottom-6 w-12 h-12 opacity-20" />
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-[2rem] shadow-lg text-white relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <p className="text-emerald-100 font-medium mb-1">Active Users</p>
              <h3 className="text-4xl font-black">{activeUsers}</h3>
            </div>
            <UserCheck className="absolute right-6 bottom-6 w-12 h-12 opacity-20" />
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-[2rem] shadow-lg text-white relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <p className="text-purple-100 font-medium mb-1">Total User Revenue (LTV)</p>
              <h3 className="text-4xl font-black flex items-center gap-1">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
            <ArrowUpRight className="absolute right-6 bottom-6 w-12 h-12 opacity-20" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-gray-800 dark:text-zinc-200">Customer Database</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-inner text-sm font-medium"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-[2rem] shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">User Info</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Total Orders</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">LTV (Spent)</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No users found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 font-bold text-gray-700 dark:text-zinc-300">
                        {user.totalOrders || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-gray-900 dark:text-white">₹{(user.totalSpent || 0).toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(user._id, user.status || 'active')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          user.status === 'blocked' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {user.status === 'blocked' ? <ShieldAlert className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        {user.status === 'blocked' ? 'Blocked' : 'Active'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUserId(user._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
                      >
                        <Eye className="w-4 h-4" /> Kundali
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kundali Modal */}
      <UserKundaliModal 
        userId={selectedUserId} 
        isOpen={!!selectedUserId} 
        onClose={() => setSelectedUserId(null)} 
        onUpdate={fetchUsers}
      />
    </div>
  );
}
