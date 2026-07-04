"use client";

import { useState } from "react";
import { uploadBehaviourMedia } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Video, RefreshCw, Smile, Heart, ClipboardCheck, Play, Camera } from "lucide-react";
import CameraCaptureModal from "../components/CameraCaptureModal";

export default function BehaviourAnalysisHub() {
  const [catName, setCatName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [scanMessage, setScanMessage] = useState("Extracting media keyframes...");
  const [currentStep, setCurrentStep] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const scanningSteps = [
    "Opening media container and sampling frame sequences...",
    "Running OpenCV contour area filters to locate cat posture...",
    "Evaluating velocity vectors and shift centroids...",
    "Decoding tail curvature and eye alert metrics...",
    "Resolving behavior insights and care blueprints via Gemini AI...",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
      setAnalysisResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setAnalyzing(true);
    setCurrentStep(0);
    setScanMessage(scanningSteps[0]);

    // Cycle scanning log messages every 700ms
    const scanInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < scanningSteps.length - 1) {
          setScanMessage(scanningSteps[prev + 1]);
          return prev + 1;
        } else {
          clearInterval(scanInterval);
          return prev;
        }
      });
    }, 700);

    try {
      // Pass null as the catId to flag it as an independent custom pet
      const result = await uploadBehaviourMedia(null, uploadFile);
      setAnalysisResult(result);
      setUploadFile(null);
    } catch (err: any) {
      alert(err.message || "Failed to process behavioral analysis.");
    } finally {
      clearInterval(scanInterval);
      setAnalyzing(false);
    }
  };

  return (
    <div className="relative flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full z-10">
      <div className="glow-bg" />

      {/* Page Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-red-500/25 bg-red-950/20 text-xs font-semibold text-red-400 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Universal Cat Behavior Diagnostics</span>
        </span>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Behavior Intelligence Hub</h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-400 mx-auto">
          Whether adopted from our shelter or already a beloved family member, upload your cat's photos/videos to decode their moods and receive custom care tips.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Upload Form Block */}
        <div className="md:col-span-5">
          <div className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-6">
            <h3 className="text-md font-bold text-white flex items-center space-x-2">
              <Video className="h-5 w-5 text-red-500" />
              <span>Behavior Checkup</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Cat's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Luna (Optional)"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Split Upload Dropzone */}
              <div className="flex gap-3">
                {/* File Selector */}
                <div className="flex-1 border-2 border-dashed border-neutral-800 hover:border-red-500/40 rounded-xl p-5 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    required
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-1.5">
                    <Video className="h-6 w-6 text-neutral-500 mx-auto" />
                    <p className="text-xs text-neutral-400 font-semibold">
                      {uploadFile ? uploadFile.name : "Choose File"}
                    </p>
                    <p className="text-[8px] text-neutral-500">From library</p>
                  </div>
                </div>

                {/* Camera capture */}
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex-1 border-2 border-dashed border-neutral-800 hover:border-red-500/40 rounded-xl p-5 text-center cursor-pointer transition-colors relative flex flex-col justify-center items-center bg-transparent"
                >
                  <div className="space-y-1.5">
                    <Camera className="h-6 w-6 text-neutral-500 mx-auto" />
                    <p className="text-xs text-neutral-400 font-semibold">
                      {uploadFile ? uploadFile.name : "Use Camera"}
                    </p>
                    <p className="text-[8px] text-neutral-500">Take Photo/Video</p>
                  </div>
                </button>
              </div>

              <button
                type="submit"
                disabled={analyzing || !uploadFile}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 fill-white" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Block / Animation Load */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            {analyzing && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card rounded-2xl border border-neutral-800 p-8 text-center flex flex-col items-center justify-center min-h-[300px]"
              >
                <div className="relative flex items-center justify-center h-20 w-20 mb-6">
                  <div className="absolute h-full w-full rounded-full border border-red-500 animate-ping opacity-25 bg-red-950/20" />
                  <div className="relative h-10 w-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                    <Heart className="h-5 w-5 text-white fill-white animate-pulse" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Calculating Posture & Behavior Cues</h3>
                <p className="text-xs text-neutral-400 font-mono italic max-w-xs transition-all duration-300">
                  {scanMessage}
                </p>
              </motion.div>
            )}

            {!analyzing && !analysisResult && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-dashed border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] bg-neutral-950/20"
              >
                <ClipboardCheck className="h-10 w-10 text-neutral-600 mb-4" />
                <h3 className="text-sm font-bold text-neutral-400">Waiting for Upload</h3>
                <p className="text-xs text-neutral-500 mt-2 max-w-xs mx-auto">
                  Provide your cat's name and upload a video or photo to discover behavioral insights.
                </p>
              </motion.div>
            )}

            {!analyzing && analysisResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
                  <div className="flex items-center space-x-2">
                    <Smile className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-md font-bold text-white">
                      Behavior Scan Results: <span className="text-red-400">{catName || "Your Companion"}</span>
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-red-950/40 border border-red-900/40 text-[10px] font-bold text-red-400 uppercase font-mono">
                    {analysisResult.mood}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 font-mono">Inferred Action</span>
                  <p className="text-sm font-bold text-white">{analysisResult.detected_behaviour}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 font-mono">Detailed Analysis</span>
                  <p className="text-xs text-neutral-400 leading-relaxed">{analysisResult.analysis}</p>
                </div>

                <div className="pt-4 border-t border-neutral-900 space-y-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 font-mono">Personalized Recommendations</span>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-neutral-950/80 p-3 rounded-lg border border-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-red-400 tracking-wide">Play Interaction</span>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{analysisResult.recommendations.play}</p>
                    </div>
                    <div className="bg-neutral-950/80 p-3 rounded-lg border border-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-amber-400 tracking-wide">Rest Comfort</span>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{analysisResult.recommendations.rest}</p>
                    </div>
                    <div className="bg-neutral-950/80 p-3 rounded-lg border border-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-blue-400 tracking-wide">Feeding Nutrition</span>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{analysisResult.recommendations.feeding}</p>
                    </div>
                    <div className="bg-neutral-950/80 p-3 rounded-lg border border-neutral-900">
                      <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-wide">Social Bond</span>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{analysisResult.recommendations.social}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          setUploadFile(file);
          setAnalysisResult(null);
        }}
      />
    </div>
  );
}
