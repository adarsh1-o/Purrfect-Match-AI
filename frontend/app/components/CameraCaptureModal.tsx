"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, RefreshCw } from "lucide-react";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);

    // Request camera permission and start video stream
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setError("Could not access your camera. Please check browser permissions.");
        setLoading(false);
      });

    return () => {
      // Stop the stream when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw current video frame onto canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob and trigger callback
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-capture-${Date.now()}.png`, { type: "image/png" });
        onCapture(file);
        onClose();
      }
    }, "image/png");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-900 bg-neutral-950">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Camera className="h-4 w-4 text-red-500" />
            <span>Camera Capture</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Camera Preview Viewport */}
        <div className="relative aspect-video bg-neutral-900 flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
              <RefreshCw className="h-6 w-6 text-red-500 animate-spin" />
            </div>
          )}

          {error ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-xs text-red-400 font-semibold">{error}</p>
              <p className="text-[10px] text-neutral-500">Please make sure no other application is using your camera.</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 border-t border-neutral-900 bg-neutral-950 flex justify-center">
          <button
            type="button"
            onClick={handleCapture}
            disabled={loading || !!error}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-30 disabled:pointer-events-none text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/10 active:scale-95"
          >
            <Camera className="h-4 w-4" />
            <span>Snap Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
