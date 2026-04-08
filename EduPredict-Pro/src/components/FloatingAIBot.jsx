import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { getEduBotResponse } from '../services/aiService';

export default function FloatingAIBot({ studentData = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm EduBot. I've analyzed your performance metrics. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const response = await getEduBotResponse(studentData, history);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Why am I at risk?",
    "Give me a study plan",
    "How can I improve?",
    "Explain my focus score"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] sm:w-[420px] h-[550px] glass-card flex flex-col shadow-2xl border-indigo-100/50"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">EduBot AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                      m.role === 'user' ? 'bg-indigo-100' : 'bg-slate-100'
                    }`}>
                      {m.role === 'user' ? <User size={14} className="text-indigo-600" /> : <Bot size={14} className="text-slate-600" />}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-200' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full shrink-0 bg-slate-100 flex items-center justify-center">
                      <Bot size={14} className="text-slate-600" />
                    </div>
                    <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-full text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-1.5 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-md shadow-indigo-200"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
              <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                <Sparkles size={10} />
                Powered by EduPredict Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <ChevronDown size={28} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={28} strokeWidth={2.5} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulse effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-4 border-indigo-400 animate-ping opacity-20" />
        )}
      </motion.button>
    </div>
  );
}
