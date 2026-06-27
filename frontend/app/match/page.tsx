"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMatchResults } from "@/lib/api";
import { motion } from "framer-motion";
import { Heart, Compass, CheckCircle, ChevronRight, Activity, Sparkles } from "lucide-react";

export default function MatchResults() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [scanMessage, setScanMessage] = useState("Initializing intelligence matching algorithm...");
  const [currentStep, setCurrentStep] = useState(0);

  // Scanning sequence messages
  const scanningSteps = [
    "Analyzing your household size and house style constraints...",
    "Correlating absence hours against separation anxiety thresholds...",
    "Aligning selected preferred traits with primary cat personality indexes...",
    "Evaluating social tolerance levels across age and kids safety profiles...",
    "Finalizing compatibility score maps...",
  ];

  useEffect(() => {
    // 1. Cycle scanning messages for 3 seconds to create a premium AI experience
    const messageInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < scanningSteps.length - 1) {
          setScanMessage(scanningSteps[prev + 1]);
          return prev + 1;
        } else {
          clearInterval(messageInterval);
          return prev;
        }
      });
    }, 600);

    // 2. Fetch matches and stop loading after 3.2 seconds
    const loadMatches = async () => {
      try {
        const data = await fetchMatchResults();
        // Take top 3 best matches
        setMatches(data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => {
          setLoading(false);
          clearInterval(messageInterval);
        }, 3200);
      }
    };
    loadMatches();

    return () => clearInterval(messageInterval);
  }, []);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 max-w-lg mx-auto w-full z-10 text-center">
        <div className="glow-bg" />
        
        {/* Animated heart radar */}
        <div className="relative flex items-center justify-center h-28 w-28 mb-8">
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute h-full w-full rounded-full border border-red-500 bg-red-950/20"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute h-20 w-20 rounded-full border border-red-500/40 bg-red-950/30"
          />
          <div className="relative h-12 w-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            <Heart className="h-6 w-6 text-white fill-white animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Calculating Your Purrfect Matches</h2>
        
        {/* Scanning message text */}
        <div className="h-10">
          <p className="text-xs text-neutral-400 font-mono italic max-w-xs mx-auto transition-all duration-300">
            {scanMessage}
          </p>
        </div>

        <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-6 max-w-xs mx-auto">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.2, ease: "linear" }}
            className="h-full bg-red-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full z-10">
      <div className="glow-bg" />

      {/* Header */}
      <div className="text-center mb-12">
        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-white">Your Compatibility Matches Are Ready!</h1>
        <p className="mt-3 text-sm text-neutral-400 max-w-md mx-auto">
          Based on your home layout, family presence, experience level, and preferred traits, we recommend these companions.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl border border-neutral-800 p-8">
          <Compass className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No matches computed</h3>
          <p className="text-neutral-500 mt-2">Make sure available cats are seeded in the database.</p>
          <Link
            href="/questionnaire"
            className="mt-6 inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm"
          >
            Retake Test
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match, index) => {
            const cat = match.cat;
            return (
              <motion.div
                key={match.cat_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl border border-neutral-800 p-6 flex flex-col md:flex-row items-center md:items-stretch gap-6"
              >
                {/* Image */}
                <div className="h-32 w-32 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
                  <img
                    src={cat?.image_url || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format"}
                    alt={cat?.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-white">{cat?.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400 capitalize">
                          {cat?.breed}
                        </span>
                      </div>
                      <div className="text-emerald-400 text-sm font-bold flex items-center space-x-1.5">
                        <Heart className="h-4 w-4 fill-emerald-400 shrink-0" />
                        <span>{match.compatibility}% Match</span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                      {cat?.description}
                    </p>

                    {/* Explanatory insights snippet */}
                    {match.reasons && (
                      <div className="mt-3 flex items-start space-x-1.5 text-xs text-neutral-300 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-900">
                        <Sparkles className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span className="italic">" {match.reasons.split(",")[0]} "</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 sm:mt-0 pt-4 sm:pt-0 flex items-center justify-end">
                    <Link
                      href={`/cats/${match.cat_id}`}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-red-400 hover:text-white transition-colors group"
                    >
                      <span>Explore Compatibility Profile</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <div className="pt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/browse"
              className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg text-sm"
            >
              Browse All Cats
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg text-sm"
            >
              Go to Adopter Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
