"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Star, Loader2, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFeedbacks = async () => {
    const token = localStorage.getItem("adminToken");

    try {
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/feedbacks`, { headers });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      } else {
        toast.error("Failed to load feedbacks");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem("adminToken");
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/feedbacks/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`);
        setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status: newStatus } : f));
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => 
    f.content?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            User Feedbacks
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-medium mt-1">Review what users are saying about FoodUniverse</p>
        </div>
        
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search feedback..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredFeedbacks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-500 dark:text-zinc-400">No feedbacks found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFeedbacks.map(feedback => (
            <div key={feedback._id} className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
              
              <div className="flex items-start justify-between mb-4">
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                  feedback.type === 'Issue' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                  feedback.type === 'Feature Request' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                  'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {feedback.type}
                </div>

                <select
                  value={feedback.status}
                  onChange={(e) => updateStatus(feedback._id, e.target.value)}
                  className={`text-xs font-bold rounded-lg px-2 py-1 border outline-none cursor-pointer ${
                    feedback.status === 'New' ? 'border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800' :
                    feedback.status === 'Reviewed' ? 'border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' :
                    'border-green-200 bg-green-50 text-green-600 dark:bg-green-900/20 dark:border-green-800'
                  }`}
                >
                  <option value="New">New</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <p className="text-gray-900 dark:text-zinc-100 font-medium mb-4 flex-1">
                "{feedback.content}"
              </p>

              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-zinc-700'}`} />
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-sm">
                <div>
                  <p className="font-bold text-gray-900 dark:text-zinc-200">{feedback.user?.name || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500">{feedback.user?.phone || 'No phone'}</p>
                </div>
                <div className="text-xs font-medium text-gray-400">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
