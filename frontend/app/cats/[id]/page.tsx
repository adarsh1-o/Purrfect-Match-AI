"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchCat, submitAdoptionRequest } from "@/lib/api";
import { Heart, ChevronLeft, Calendar, UserCheck, ShieldAlert, Sparkles, Check } from "lucide-react";

export default function CatDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cat, setCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const loadCat = async () => {
      try {
        const data = await fetchCat(id);
        setCat(data);
      } catch (err: any) {
        setError(err.message || "Failed to load cat profile.");
      } finally {
        setLoading(false);
      }
    };
    loadCat();
  }, [id]);

  const handleApply = async () => {
    setSubmitting(true);
    try {
      await submitAdoptionRequest(id);
      setApplied(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- SVGRadarChart Generator ---
  const renderRadarChart = (profile: any) => {
    const traits = [
      { key: "playfulness", label: "Playfulness" },
      { key: "curiosity", label: "Curiosity" },
      { key: "energy", label: "Energy" },
      { key: "confidence", label: "Confidence" },
      { key: "friendliness", label: "Friendliness" },
      { key: "independence", label: "Independence" }
    ];

    const width = 300;
    const height = 300;
    const center = 150;
    const radius = 100;

    // Resolve vertices coordinates
    const coordinates = traits.map((trait, index) => {
      const value = profile[trait.key] || 0.5;
      const angle = (index * 2 * Math.PI) / traits.length - Math.PI / 2;
      const x = center + radius * value * Math.cos(angle);
      const y = center + radius * value * Math.sin(angle);
      return { x, y, label: trait.label, val: value, angle };
    });

    const polygonPoints = coordinates.map((c) => `${c.x},${c.y}`).join(" ");

    // Draw grids (circles/polygons at 25%, 50%, 75%, 100%)
    const grids = [0.25, 0.5, 0.75, 1.0].map((scale, gIdx) => {
      const gridPoints = traits.map((_, index) => {
        const angle = (index * 2 * Math.PI) / traits.length - Math.PI / 2;
        const x = center + radius * scale * Math.cos(angle);
        const y = center + radius * scale * Math.sin(angle);
        return `${x},${y}`;
      }).join(" ");
      return (
        <polygon
          key={gIdx}
          points={gridPoints}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      );
    });

    // Draw axes
    const axes = coordinates.map((c, index) => {
      const outerX = center + radius * Math.cos(c.angle);
      const outerY = center + radius * Math.sin(c.angle);
      return (
        <g key={index}>
          <line
            x1={center}
            y1={center}
            x2={outerX}
            y2={outerY}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          {/* Label positioning adjusted slightly */}
          <text
            x={center + (radius + 22) * Math.cos(c.angle)}
            y={center + (radius + 15) * Math.sin(c.angle) + 4}
            fill="#a3a3a3"
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
          >
            {c.label}
          </text>
        </g>
      );
    });

    return (
      <div className="flex flex-col items-center justify-center p-6 bg-neutral-900/40 rounded-2xl border border-neutral-800">
        <svg width={width} height={height} className="overflow-visible" role="img" aria-label="Cat personality traits radar chart">
          {grids}
          {axes}
          {/* Main data polygon */}
          <polygon
            points={polygonPoints}
            fill="rgba(239, 68, 68, 0.25)"
            stroke="rgba(239, 68, 68, 0.8)"
            strokeWidth="2"
          />
          {/* Data dot points */}
          {coordinates.map((c, idx) => (
            <circle
              key={idx}
              cx={c.x}
              cy={c.y}
              r="4"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          ))}
        </svg>
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest mt-6 font-mono">
          Behavioral Personality Radar
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-grow max-w-7xl mx-auto py-20 px-4 text-center animate-pulse space-y-6 w-full">
        <div className="h-8 bg-neutral-900 rounded w-1/4 mx-auto" />
        <div className="h-[400px] bg-neutral-900 rounded-2xl max-w-4xl mx-auto" />
      </div>
    );
  }

  if (error || !cat) {
    return (
      <div className="flex-grow max-w-xl mx-auto py-24 px-4 text-center flex flex-col items-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white">Profile Unavailable</h2>
        <p className="text-neutral-500 mt-2">{error || "Could not retrieve cat details."}</p>
        <Link
          href="/browse"
          className="mt-8 px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-md text-sm text-neutral-300 hover:text-white"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 w-full">
      <div className="glow-bg" />

      {/* Back button */}
      <Link
        href="/browse"
        className="inline-flex items-center space-x-1.5 text-sm text-neutral-400 hover:text-white mb-8 group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Companions</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left column: Photo Gallery & Radar Chart */}
        <div className="lg:col-span-5 space-y-8">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-900 border border-neutral-800">
            <img
              src={cat.image_url || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format"}
              alt={cat.name}
              className="h-full w-full object-cover"
            />
          </div>

          {cat.personality_profile && renderRadarChart(cat.personality_profile)}
        </div>

        {/* Right column: Details, Matches and CTAs */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">{cat.breed}</span>
                <h1 className="text-4xl font-extrabold text-white mt-1">{cat.name}</h1>
              </div>

              {cat.compatibility !== null && (
                <div className="px-4 py-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center space-x-1.5">
                  <Heart className="h-4 w-4 fill-emerald-400" />
                  <span>{cat.compatibility}% Match Compatibility</span>
                </div>
              )}
            </div>

            {/* Age Gender grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800 flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-neutral-500" />
                <div>
                  <span className="text-xs text-neutral-500 uppercase font-semibold">Age</span>
                  <p className="text-sm font-semibold text-white">{cat.age} Years Old</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800 flex items-center space-x-3">
                <UserCheck className="h-5 w-5 text-neutral-500" />
                <div>
                  <span className="text-xs text-neutral-500 uppercase font-semibold">Gender</span>
                  <p className="text-sm font-semibold text-white capitalize">{cat.gender}</p>
                </div>
              </div>
            </div>

            {/* Story */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white">Our Companionship Story</h3>
              <p className="mt-3 text-neutral-400 text-sm leading-relaxed whitespace-pre-line">{cat.description}</p>
            </div>

            {/* Explainable AI matching reasons */}
            {cat.reasons && cat.reasons.length > 0 && (
              <div className="mt-8 p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800">
                <div className="flex items-center space-x-2 text-red-400 mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Explainable AI Insights</span>
                </div>
                <ul className="space-y-3">
                  {cat.reasons.map((reason: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-neutral-300">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center gap-4">
            {cat.compatibility !== null ? (
              applied ? (
                <div className="w-full py-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-center text-sm font-bold flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5" />
                  <span>Adoption Request Submitted Successfully!</span>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={submitting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg text-center hover:shadow-lg hover:shadow-red-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Submitting Application..." : `Apply to Adopt ${cat.name}`}
                </button>
              )
            ) : (
              <Link
                href="/questionnaire"
                className="w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 font-bold rounded-lg text-center active:scale-98 transition-all"
              >
                Complete Questionnaire to Evaluate Compatibility
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
