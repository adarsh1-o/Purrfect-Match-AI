"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Cat, X, Send, Paperclip } from "lucide-react";
import { sendChatQuery } from "@/lib/api";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatCatId, setChatCatId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "ai", text: "Hello! I am your Kizuna AI Behavior Advisor. Ask me anything about general cat behavior, play schedules, or shyness traits!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Default featured cats matching seeded data ids or names
  const featuredCats = [
    { id: "luna-id", name: "Luna (Siamese Mix)" },
    { id: "oliver-id", name: "Oliver (Tabby)" },
    { id: "milo-id", name: "Milo (Maine Coon)" },
    { id: "bella-id", name: "Bella (Persian)" },
    { id: "cleo-id", name: "Cleo (Ragdoll)" }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatFile) return;

    const userMsg = chatInput.trim() || (chatFile ? `Analyze this uploaded ${chatFile.type.startsWith("video/") ? "video" : "photo"}` : "");
    let displayMsg = userMsg;
    if (chatFile) {
      displayMsg += ` 📸 [File: ${chatFile.name}]`;
    }

    setChatMessages((prev) => [...prev, { sender: "user", text: displayMsg }]);
    setChatInput("");
    const fileToUpload = chatFile;
    setChatFile(null);
    setChatLoading(true);

    try {
      // Pass the name context of the featured cat to the backend query
      const response = await sendChatQuery(chatCatId || null, userMsg, fileToUpload);
      setChatMessages((prev) => [...prev, { sender: "ai", text: response.reply }]);
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: `Sorry, I encountered an error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-2xl border border-neutral-850 bg-neutral-950/95 shadow-2xl overflow-hidden flex flex-col z-50 animate-slide-up backdrop-blur-md">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-red-650 to-red-550 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-white fill-white animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-white leading-none">Kizuna AI Advisor</h4>
                <span className="text-[9px] text-red-100 mt-0.5 block">Feline Behavior Specialist</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-red-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Selector Dropdown */}
          <div className="px-4 py-2 border-b border-neutral-900 bg-neutral-900/40">
            <select
              value={chatCatId}
              onChange={(e) => {
                const val = e.target.value;
                setChatCatId(val);
                
                let catName = "general cat";
                if (val) {
                  const match = featuredCats.find((c) => c.id === val);
                  if (match) catName = match.name.split(" ")[0];
                }
                
                setChatMessages([
                  { sender: "ai", text: `Hello! I am your Kizuna AI Behavior Advisor. Ask me anything about ${catName}'s behavior, play habits, or integration tips!` }
                ]);
              }}
              className="w-full py-1.5 px-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-[10px] text-neutral-300 focus:outline-none focus:border-red-500"
            >
              <option value="">General Cat Advice (No Profile)</option>
              {featuredCats.map((cat) => (
                <option key={cat.id} value={cat.id}>Featured: {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Chat Window */}
          <div
            ref={scrollRef}
            className="h-64 overflow-y-auto p-4 space-y-3 flex flex-col bg-neutral-950/40 scrollbar-thin"
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "self-end bg-gradient-to-r from-red-650 to-red-550 text-white shadow-sm"
                    : "self-start bg-neutral-900/80 text-neutral-300 border border-neutral-850"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div className="self-start bg-neutral-900/80 text-neutral-500 border border-neutral-850 rounded-xl px-3 py-2 text-xs animate-pulse">
                Thinking...
              </div>
            )}
          </div>

          {/* Selected File Preview Badge */}
          {chatFile && (
            <div className="mx-4 p-2 mb-2 rounded bg-neutral-900 border border-neutral-850 text-[10px] text-neutral-400 flex items-center justify-between">
              <span className="truncate max-w-[80%] flex items-center gap-1 font-mono">
                <Paperclip className="h-3.5 w-3.5 text-red-500 shrink-0" />
                {chatFile.name}
              </span>
              <button
                type="button"
                onClick={() => setChatFile(null)}
                className="text-red-555 hover:text-red-400 font-bold ml-1 cursor-pointer shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          {/* Footer Input */}
          <form onSubmit={handleChatSubmit} className="p-3 border-t border-neutral-900 flex gap-2 bg-neutral-950/60 items-center">
            <label className="p-2 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-md cursor-pointer transition-colors relative shrink-0 flex items-center justify-center">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setChatFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Paperclip className="h-3.5 w-3.5" />
            </label>

            <input
              type="text"
              placeholder="Ask advice or upload a video..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              className="flex-grow py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={chatLoading || (!chatInput.trim() && !chatFile)}
              className="p-2 bg-gradient-to-r from-red-650 to-red-550 text-white rounded-md hover:shadow-md cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center shrink-0 active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Speech Prompt Bubble */}
      {showPrompt && !isOpen && (
        <div className="absolute right-0 bottom-14 mb-2 bg-gradient-to-r from-red-650 to-red-550 border border-red-500/20 text-white rounded-2xl py-2 px-3 shadow-xl flex items-center gap-1.5 whitespace-nowrap animate-bounce z-50 text-[10px] font-bold">
          <span>Chat with Kizuna AI! 🐾</span>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPrompt(false);
            }} 
            className="hover:bg-white/10 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowPrompt(false);
        }}
        className="relative h-12 w-12 rounded-full bg-gradient-to-r from-red-650 to-red-550 text-white shadow-xl hover:shadow-red-500/25 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all group"
      >
        {/* Cat Ears */}
        {!isOpen && (
          <>
            <div className="absolute -top-1 left-1.5 h-3.5 w-3.5 bg-red-650 border-t border-l border-red-500/10 rounded-tl-full rounded-tr-sm rotate-12 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-6 origin-bottom-right" />
            <div className="absolute -top-1 right-1.5 h-3.5 w-3.5 bg-red-650 border-t border-r border-red-500/10 rounded-tr-full rounded-tl-sm -rotate-12 transition-transform group-hover:-translate-y-0.5 group-hover:-rotate-6 origin-bottom-left" />
          </>
        )}
        
        {isOpen ? <X className="h-5 w-5" /> : <Cat className="h-5.5 w-5.5 animate-wiggle group-hover:scale-110" />}
      </button>
    </div>
  );
}
