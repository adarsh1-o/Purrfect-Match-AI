"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Cat, X, Send, Paperclip, Camera, Minus, Maximize2, Minimize2, Copy, Check, Share2, Mic, MicOff } from "lucide-react";
import { sendChatQuery } from "@/lib/api";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [chatCatId, setChatCatId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "ai", text: "Hello! I am your Kizuna AI Behavior Advisor. Ask me anything about general cat behavior, play schedules, or shyness traits!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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

  const handleCopyMessage = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const handleShareMessage = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kizuna AI Behavior Advice",
          text: text,
        });
      } catch (err: any) {
        if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
          console.error("Error sharing message:", err);
        }
      }
    } else {
      // Fallback: copy and notify user
      try {
        await navigator.clipboard.writeText(text);
        alert("Web sharing is not supported on this browser. The advice has been copied to your clipboard!");
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
    }
  };

  const toggleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      
      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput((prev) => (prev ? prev + " " + transcript : transcript));
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`mb-4 rounded-2xl border border-neutral-850 bg-neutral-950/95 shadow-2xl overflow-hidden flex flex-col z-50 animate-slide-up backdrop-blur-md transition-all duration-300 ${
            isMaximized 
              ? "fixed inset-4 sm:inset-10 w-auto h-auto max-w-none mb-0" 
              : isMinimized 
                ? "w-64 h-12 mb-4" 
                : "w-80 sm:w-96 h-[400px] mb-4"
          }`}
        >
          {/* Header */}
          <div 
            className="p-4 bg-gradient-to-r from-red-650 to-red-550 flex items-center justify-between cursor-pointer select-none"
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-white fill-white animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-white leading-none">
                  Kizuna AI Advisor {isMinimized && "(Minimized)"}
                </h4>
                {!isMinimized && (
                  <span className="text-[9px] text-red-100 mt-0.5 block">Feline Behavior Specialist</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
              {/* Minimize/Restore Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMinimized(!isMinimized);
                  if (isMaximized) setIsMaximized(false);
                }}
                className="p-1 rounded-full text-red-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isMinimized ? "Restore" : "Minimize"}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              {/* Fullscreen Toggle Button (Disabled when minimized) */}
              {!isMinimized && (
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1 rounded-full text-red-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title={isMaximized ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsMaximized(false);
                  setIsMinimized(false);
                }}
                className="p-1 rounded-full text-red-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Hidden layout elements when minimized */}
          {!isMinimized && (
            <>
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
                className={`overflow-y-auto p-4 space-y-3 flex flex-col bg-neutral-950/40 scrollbar-thin ${
                  isMaximized ? "flex-grow h-auto" : "h-64"
                }`}
              >
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`relative max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed group transition-all ${
                      msg.sender === "user"
                        ? "self-end bg-gradient-to-r from-red-650 to-red-550 text-white shadow-sm"
                        : "self-start bg-neutral-900/80 text-neutral-300 border border-neutral-850"
                    }`}
                  >
                    <div className="pr-4 select-text">{msg.text}</div>
                    
                    {/* Hover copy and share buttons */}
                    <div className={`mt-2 flex items-center gap-3 border-t pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] ${
                      msg.sender === "user" ? "border-white/10 text-red-150" : "border-neutral-800 text-neutral-500"
                    }`}>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.text, idx)}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="h-3 w-3 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareMessage(msg.text)}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                        title="Share advice"
                      >
                        <Share2 className="h-3 w-3" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="self-start bg-neutral-900/80 border border-neutral-850 rounded-xl px-4 py-2.5 flex items-center space-x-3 text-xs text-neutral-400 shadow-inner">
                    <div className="relative flex items-center justify-center">
                      <Cat className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20 animate-ping" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-neutral-450 font-medium">Kizuna is thinking</span>
                      <span className="flex space-x-1 ml-1.5 items-center">
                        <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-bounce" />
                      </span>
                    </div>
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
                <label className="p-2 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-md cursor-pointer transition-colors relative shrink-0 flex items-center justify-center" title="Upload file">
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

                {/* Camera Capture Option */}
                <label className="p-2 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-md cursor-pointer transition-colors relative shrink-0 flex items-center justify-center" title="Capture from camera">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setChatFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Camera className="h-3.5 w-3.5" />
                </label>

                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2 border rounded-md cursor-pointer transition-all shrink-0 flex items-center justify-center ${
                    isRecording 
                      ? "border-red-500 bg-red-950/40 text-red-500 animate-pulse" 
                      : "border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-400 hover:text-white"
                  }`}
                  title={isRecording ? "Stop recording" : "Voice input"}
                >
                  {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>

                <input
                  type="text"
                  placeholder={isRecording ? "Listening..." : "Ask advice or upload a video..."}
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
            </>
          )}
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
          if (isOpen && isMinimized) {
            setIsMinimized(false);
          } else {
            setIsOpen(!isOpen);
            setIsMinimized(false);
            setIsMaximized(false);
          }
          setShowPrompt(false);
        }}
        className="relative h-12 w-12 rounded-full bg-gradient-to-r from-red-650 to-red-550 text-white shadow-xl hover:shadow-red-500/25 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all group"
      >
        {/* Cat Ears */}
        {(!isOpen || isMinimized) && (
          <>
            <div className="absolute -top-1 left-1.5 h-3.5 w-3.5 bg-red-650 border-t border-l border-red-500/10 rounded-tl-full rounded-tr-sm rotate-12 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-6 origin-bottom-right" />
            <div className="absolute -top-1 right-1.5 h-3.5 w-3.5 bg-red-650 border-t border-r border-red-500/10 rounded-tr-full rounded-tl-sm -rotate-12 transition-transform group-hover:-translate-y-0.5 group-hover:-rotate-6 origin-bottom-left" />
          </>
        )}
        
        {isOpen && !isMinimized ? <X className="h-5 w-5" /> : <Cat className="h-5.5 w-5.5 animate-wiggle group-hover:scale-110" />}
      </button>
    </div>
  );
}
