import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Star, Loader2, Send, Mic } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/api";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToken: string;
}

export function FeedbackModal({ isOpen, onClose, userToken }: FeedbackModalProps) {
  const [type, setType] = useState('General');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    // @ts-ignore - SpeechRecognition is not fully typed in standard TS lib
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support speech recognition.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    // Set to Hindi/English to better understand Indian users
    recognition.lang = 'en-IN'; 

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak now 🎤");
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setContent((prev) => prev + (prev ? " " : "") + transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error(event.error);
      toast.error("Microphone error. Please check permissions.");
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ type, content, rating })
      });

      if (res.ok) {
        toast.success("Thank you for your valuable feedback! 🚀");
        setContent('');
        setRating(5);
        setType('General');
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="relative h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 flex items-end">
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); onClose(); }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors z-20"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white leading-tight">Your Feedback</h2>
                  <p className="text-white/80 text-sm font-medium">Help us improve FoodUniverse</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              
              {/* Type Selection */}
              <div className="mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">What is this about?</label>
                <div className="grid grid-cols-3 gap-2">
                  {['General', 'Issue', 'Feature Request'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${type === t ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'}`}
                    >
                      {t === 'Feature Request' ? 'Feature' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Rate your experience</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="group p-1"
                    >
                      <Star className={`w-8 h-8 transition-all ${star <= rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] scale-110' : 'text-zinc-300 group-hover:text-yellow-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tell us more details</label>
                  <button 
                    type="button"
                    onClick={startListening}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {isListening ? 'Listening...' : 'Speak'}
                  </button>
                </div>
                <div className="relative">
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={type === 'Issue' ? 'Describe the problem you faced...' : type === 'Feature Request' ? 'What should we add or change?' : 'Any thoughts you want to share...'}
                    className="w-full h-32 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all resize-none text-zinc-900 placeholder:text-zinc-400 font-medium"
                  ></textarea>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={(e) => { e.preventDefault(); onClose(); }}
                  className="flex-1 h-14 bg-zinc-100 text-zinc-600 rounded-2xl font-black text-lg tracking-wide hover:bg-zinc-200 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] h-14 bg-zinc-900 text-white rounded-2xl font-black text-lg tracking-wide hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {loading ? 'Submitting...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
