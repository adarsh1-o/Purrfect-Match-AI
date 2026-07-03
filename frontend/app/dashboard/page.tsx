"use client";

import { useEffect, useState, useRef } from "react";
import { fetchDashboardData, uploadBehaviourMedia, sendChatQuery } from "@/lib/api";
import { ShieldCheck, Video, LayoutDashboard, Sparkles, Smile, RefreshCw, ClipboardList, CheckCircle, Clock, Paperclip, Copy, Check, Share2, Mic, MicOff, Cat } from "lucide-react";
import Link from "next/link";

export default function AdopterDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File upload states
  const [selectedCatId, setSelectedCatId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Chatbot states
  const [chatCatId, setChatCatId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "ai", text: "Hello! I am your Kizuna AI Behavior Advisor. Ask me anything about general cat behavior, play schedules, or shyness traits!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      const payload = await fetchDashboardData();
      setData(payload);
      if (payload.adopted_cats && payload.adopted_cats.length > 0) {
        setSelectedCatId(payload.adopted_cats[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
      setAnalysisResult(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !uploadFile) return;

    setAnalyzing(true);
    try {
      const result = await uploadBehaviourMedia(selectedCatId, uploadFile);
      setAnalysisResult(result);
      // Reload logs history
      loadDashboard();
      setUploadFile(null);
    } catch (err: any) {
      alert(err.message || "Media analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

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
      const response = await sendChatQuery(chatCatId || null, userMsg, fileToUpload);
      setChatMessages((prev) => [...prev, { sender: "ai", text: response.reply }]);
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: `Sorry, I encountered an error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

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
      try {
        await navigator.clipboard.writeText(text);
        alert("Web sharing is not supported on this browser. The advice has been copied to your clipboard!");
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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

  if (loading) {
    return (
      <div className="flex-grow max-w-7xl mx-auto py-20 px-4 text-center animate-pulse space-y-6 w-full">
        <div className="h-8 bg-neutral-900 rounded w-1/4" />
        <div className="h-[400px] bg-neutral-900 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-grow max-w-xl mx-auto py-20 px-4 text-center flex flex-col items-center justify-center">
        <ShieldCheck className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white">Dashboard Offline</h2>
        <p className="text-neutral-500 mt-2">{error || "Please sign in to access your adopter cockpit."}</p>
        <button
          onClick={() => window.location.href = "/auth"}
          className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-sm text-white font-bold cursor-pointer"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
      <div className="glow-bg" />

      {/* Dashboard Top Cockpit / Welcome Card */}
      <div className="glass-card rounded-2xl border border-neutral-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 relative overflow-hidden shadow-xl">
        {/* Glow background behind the card */}
        <div className="absolute -left-16 -top-16 w-32 h-32 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left w-full md:w-auto">
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-red-500/20 blur-md rounded-full scale-75 group-hover:scale-90 transition-transform duration-500" />
            <img
              src="/logo.png"
              alt="Purrfect Match Logo"
              className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-red-500/30"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Adopter Cockpit</h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1.5 leading-normal">
              Welcome back, <span className="font-semibold text-white">{data.user?.name}</span> ({data.user?.email})
            </p>
          </div>
        </div>
        
        <div className="relative z-10 w-full md:w-auto flex justify-center md:justify-end">
          <Link
            href="/browse"
            className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-red-650 to-red-555 hover:from-red-555 hover:to-red-455 text-white font-bold rounded-lg text-xs text-center transition-all duration-200 shadow-md shadow-red-600/10 cursor-pointer"
          >
            Find More Companions
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Columns: Applications & Companions */}
        <div className="lg:col-span-7 space-y-8">
          {/* Applications list */}
          <div className="glass-card rounded-2xl border border-neutral-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-red-500" />
              <span>Adoption Applications</span>
            </h3>
            {data.active_requests.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">No submitted applications found. Browse cats and apply to adopt!</p>
            ) : (
              <div className="space-y-4">
                {data.active_requests.map((req: any) => (
                  <div key={req.request_id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-950/60 border border-neutral-855">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                        <img src={req.cat?.image_url} alt={req.cat?.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{req.cat?.name}</h4>
                        <p className="text-[10px] text-neutral-500 capitalize">{req.cat?.breed} • {req.cat?.gender}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {req.status === "approved" && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Approved</span>
                        </span>
                      )}
                      {req.status === "pending" && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Pending</span>
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="px-2.5 py-1 rounded-full bg-red-950/20 border border-red-500/30 text-red-400 text-[10px] font-bold flex items-center space-x-1">
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adopted Companions List */}
          <div className="glass-card rounded-2xl border border-neutral-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Smile className="h-5 w-5 text-red-500" />
              <span>My Adopted Companions</span>
            </h3>
            {data.adopted_cats.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">No adopted companions registered yet. Adoption approvals will list cats here.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.adopted_cats.map((cat: any) => (
                  <div key={cat.id} className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-855 flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                      <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                      <p className="text-[10px] text-neutral-500">{cat.age} Yrs old • {cat.breed}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-400 text-[9px] font-semibold border border-emerald-900/30">
                        Active Companion
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: AI Care analysis portal */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-card rounded-2xl border border-neutral-800 p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <Video className="h-5 w-5 text-red-500" />
              <span>Post-Adoption Care Hub</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-6">Upload photos or behavioral videos of your companion to decode moods, actions, and retrieve personalized care suggestions.</p>

            {data.adopted_cats.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40">
                <p className="text-xs text-neutral-500">Adopt a cat to unlock post-adoption behavioral parsing!</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2">Select Companion</label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => setSelectedCatId(e.target.value)}
                    className="w-full py-2.5 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                  >
                    {data.adopted_cats.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="border-2 border-dashed border-neutral-800 hover:border-red-500/40 rounded-xl p-6 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-2">
                    <Video className="h-8 w-8 text-neutral-500 mx-auto" />
                    <p className="text-xs text-neutral-400 font-semibold">
                      {uploadFile ? uploadFile.name : "Drag and drop or browse files"}
                    </p>
                    <p className="text-[10px] text-neutral-500">Supports standard images and videos (MP4, AVI, JPG, PNG)</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={analyzing || !uploadFile}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center space-x-1.5"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Analyzing Behavior...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 fill-white" />
                      <span>Upload & Run AI Behavior Analysis</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Analysis Result display */}
            {analysisResult && (
              <div className="mt-8 p-5 border border-red-500/20 bg-red-950/5 rounded-xl space-y-4 animate-fade-in">
                <div className="flex items-center space-x-1.5 text-red-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">AI Behavior Results</span>
                </div>
                
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Detected Behavior / Mood</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-sm font-bold text-white">{analysisResult.detected_behaviour}</span>
                    <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40 text-[9px] font-bold text-red-400 uppercase">
                      {analysisResult.mood}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Behavior Analysis</span>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{analysisResult.analysis}</p>
                </div>

                <div className="pt-2 border-t border-neutral-900 space-y-3">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Care Recommendations</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-red-400">Play</span>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{analysisResult.recommendations.play}</p>
                    </div>
                    <div className="bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-amber-400">Rest</span>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{analysisResult.recommendations.rest}</p>
                    </div>
                    <div className="bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-blue-400">Feeding</span>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{analysisResult.recommendations.feeding}</p>
                    </div>
                    <div className="bg-neutral-950/80 p-2.5 rounded-lg border border-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-emerald-400">Social</span>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{analysisResult.recommendations.social}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Kizuna AI: Feline Behavior Advisor */}
          <div className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-red-500" />
              <span>Kizuna AI Advisor</span>
            </h3>
            <p className="text-[11px] text-neutral-400 leading-normal">
              Ask our AI behaviorist anything about your cat's specific personality vectors, care needs, or behavior habits.
            </p>

            {/* Select Cat */}
            <div>
              <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Select Cat Context
              </label>
              <select
                value={chatCatId}
                onChange={(e) => {
                  const val = e.target.value;
                  setChatCatId(val);
                  
                  // Reset greeting message based on context
                  let catName = "general cat";
                  if (val) {
                    const matches = [...data.adopted_cats, ...data.active_requests.map((r: any) => r.cat)].filter((c: any) => c && c.id === val);
                    if (matches.length > 0) catName = matches[0].name;
                  }
                  setChatMessages([
                    { sender: "ai", text: `Hello! I am your Kizuna AI Behavior Advisor. Ask me anything about ${catName}'s behavior, play habits, or integration tips!` }
                  ]);
                }}
                className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
              >
                <option value="">General Cat Advice (No Profile)</option>
                {/* Adopted Cats */}
                {data.adopted_cats.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>Adopted: {cat.name} ({cat.breed})</option>
                ))}
                {/* Matched / Requested Cats */}
                {data.active_requests.map((req: any) => (
                  req.cat && (
                    <option key={req.cat.id} value={req.cat.id}>Applied: {req.cat.name} ({req.cat.breed})</option>
                  )
                ))}
              </select>
            </div>

            {/* Chat Window */}
            <div className="h-44 border border-neutral-900 bg-neutral-950/40 rounded-xl p-3 overflow-y-auto space-y-2.5 flex flex-col scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`relative max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed group transition-all ${
                    msg.sender === "user"
                      ? "self-end bg-gradient-to-r from-red-650 to-red-555 text-white shadow-sm"
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
              <div className="flex items-center justify-between p-2 mb-2 rounded bg-neutral-900 border border-neutral-850 text-[10px] text-neutral-400">
                <span className="truncate max-w-[80%] flex items-center gap-1 font-mono">
                  <Paperclip className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  {chatFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setChatFile(null)}
                  className="text-red-550 hover:text-red-400 font-bold ml-1 cursor-pointer shrink-0"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2 items-center">
              <label className="p-2 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-md cursor-pointer transition-colors relative shrink-0 flex items-center justify-center" title="Upload media">
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
                className="px-4 py-2 bg-gradient-to-r from-red-650 to-red-550 hover:from-red-550 hover:to-red-450 text-white font-bold rounded-md text-xs hover:shadow-md cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Shelter & Partner Care Directory */}
      {data.shelter_directory && data.shelter_directory.length > 0 && (
        <div className="mt-12 glass-card rounded-2xl border border-neutral-800 p-6">
          <h3 className="text-lg font-bold text-white mb-2">Kizuna Shelter & Care Partner Directory</h3>
          <p className="text-xs text-neutral-400 mb-6">Connect directly with our care shelters and browse their current companion listings.</p>
          
          <div className="space-y-6">
            {data.shelter_directory.map((shelter: any) => (
              <div key={shelter.id} className="p-6 bg-neutral-950/50 border border-neutral-900 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-3 gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{shelter.name}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">📍 {shelter.address || "Address not listed"}</p>
                  </div>
                  <div className="text-[11px] text-neutral-400 space-y-0.5 text-left sm:text-right">
                    <div>✉️ {shelter.email}</div>
                    {shelter.phone && <div>📞 {shelter.phone}</div>}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block mb-3">Available Companions at this Shelter ({shelter.cats.length})</span>
                  {shelter.cats.length === 0 ? (
                    <p className="text-[11px] text-neutral-500">No active cat companions listed currently.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {shelter.cats.map((cat: any) => (
                        <Link
                          key={cat.id}
                          href={`/cats/${cat.id}`}
                          className="p-3 bg-neutral-950 border border-neutral-850 hover:border-red-500/40 rounded-xl flex flex-col items-center text-center transition-colors group"
                        >
                          <img
                            src={cat.image_url || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format"}
                            alt={cat.name}
                            className="h-16 w-16 rounded-full object-cover border border-neutral-800 group-hover:scale-105 transition-transform"
                          />
                          <span className="text-xs font-bold text-white mt-2 group-hover:text-red-400 transition-colors truncate max-w-full">{cat.name}</span>
                          <span className="text-[10px] text-neutral-500 truncate max-w-full">{cat.breed}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Logs List */}
      {data.behaviour_logs && data.behaviour_logs.length > 0 && (
        <div className="mt-12 glass-card rounded-2xl border border-neutral-800 p-6">
          <h3 className="text-lg font-bold text-white mb-6">Behavior Analysis Log History</h3>
          <div className="space-y-6">
            {data.behaviour_logs.map((log: any) => (
              <div key={log.id} className="p-5 bg-neutral-950/50 border border-neutral-900 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{log.detected_behaviour}</span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-850 text-[8px] text-neutral-400 uppercase font-mono">
                      {log.media_type}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">{log.analysis}</p>
                <div className="pt-2 border-t border-neutral-900 text-[10px] text-neutral-500">
                  <span className="font-semibold text-neutral-400 uppercase">Recommendations:</span> {log.recommendations.replace(/\n/g, " | ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
