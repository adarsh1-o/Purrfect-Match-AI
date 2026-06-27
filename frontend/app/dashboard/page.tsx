"use client";

import { useEffect, useState } from "react";
import { fetchDashboardData, uploadBehaviourMedia } from "@/lib/api";
import { ShieldCheck, Video, LayoutDashboard, Sparkles, Smile, RefreshCw, ClipboardList, CheckCircle, Clock } from "lucide-react";
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

      {/* Dashboard Top Cockpit */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Adopter Cockpit</h1>
          <p className="text-xs text-neutral-400 mt-1">Logged in as {data.user?.name} ({data.user?.email})</p>
        </div>
        <Link
          href="/browse"
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 text-white font-semibold rounded-lg text-xs transition-colors"
        >
          Find More Companions
        </Link>
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
        </div>
      </div>

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
