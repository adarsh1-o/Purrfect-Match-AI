"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Sparkles, ChevronRight, Activity, Smile, RefreshCw, BarChart2 } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center py-20 px-4 sm:px-6 lg:px-8">
      {/* Background glow overlay */}
      <div className="glow-bg" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl text-center z-10 flex flex-col items-center"
      >
        <motion.div
          variants={itemVariants}
          className="mb-8 relative group"
        >
          {/* Subtle glowing halo behind the logo */}
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-75 group-hover:scale-90 transition-transform duration-500" />
          <img
            src="/logo.png"
            alt="Purrfect Match AI Logo"
            className="theme-logo-dark-mode relative h-28 w-28 md:h-32 md:w-32 rounded-3xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-red-500/30"
          />
          <img
            src="/logo-dark.png"
            alt="Purrfect Match AI Logo"
            className="theme-logo-light-mode relative h-28 w-28 md:h-32 md:w-32 rounded-3xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-red-500/30"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-red-500/25 bg-red-950/20 text-xs font-semibold text-red-400 mb-8"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Behavioral AI-Powered Cat Adoption Platform</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl"
        >
          People adopt cats based on appearance. We match on <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">personality.</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl"
        >
          Every cat deserves the right human, and every human deserves the right companion. We build a lifelong bond starting from personality compatibility up to post-adoption care.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/questionnaire"
            className="flex items-center justify-center w-full sm:w-auto px-8 py-4 font-bold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:shadow-lg hover:shadow-red-500/20 active:scale-98 transition-all duration-200"
          >
            <span>Take Personality Match Test</span>
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/browse"
            className="flex items-center justify-center w-full sm:w-auto px-8 py-4 font-bold text-neutral-200 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Browse Available Cats
          </Link>
        </motion.div>
      </motion.div>

      {/* Philosophy Split Section */}
      <div className="w-full max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4 sm:px-6 lg:px-8">
        <div>
          <span className="text-xs font-semibold uppercase text-red-500 tracking-widest">Core Product Philosophy</span>
          <h2 className="text-3xl font-extrabold text-white mt-2 leading-tight">
            Why traditional adoption platforms fail.
          </h2>
          <p className="mt-4 text-neutral-400 text-sm leading-relaxed">
            Traditional adoption stops at the adoption line, displaying static grids of breeds and colors. This appearance-first approach leads to mismatch, causing stressed pets and high shelter return rates.
          </p>
          <p className="mt-4 text-neutral-400 text-sm leading-relaxed">
            Purrfect Match AI uses computer vision and behavioral intelligence to decode cat temperaments, aligning them with human lifestyles. Our support continues post-adoption through video-based mood parsing and care recommendations.
          </p>

          <Link
            href="/behaviour"
            className="mt-8 inline-flex items-center space-x-3 p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900 hover:border-neutral-700 transition-all duration-300 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 group-hover:scale-105 transition-transform duration-300">
              <Activity className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center">
                <span>Post-Adoption Support</span>
                <ChevronRight className="ml-1 h-3.5 w-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">Record videos of your cat to extract immediate care tips.</p>
            </div>
          </Link>
        </div>

        <div className="glass-card rounded-2xl border border-neutral-800 p-8 flex flex-col space-y-6">
          <div className="pb-4 border-b border-neutral-900">
            <h3 className="text-lg font-bold text-white">Compare the Companionship Journey</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 flex flex-col items-center">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Traditional Adoption</span>
              <span className="text-lg font-bold text-white mt-4">Look & Feel</span>
              <p className="text-xs text-neutral-500 mt-2">Pick based on picture, breed, and color.</p>
              <div className="h-1.5 w-full bg-red-950/40 rounded-full mt-6 overflow-hidden">
                <div className="h-full w-1/3 bg-red-500" />
              </div>
              <span className="text-xs text-neutral-500 mt-2">35% shelter return rate</span>
            </div>

            <div className="p-4 rounded-xl bg-red-950/10 border border-red-900/30 flex flex-col items-center">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Purrfect Match AI</span>
              <span className="text-lg font-bold text-white mt-4">Behavior & Bonding</span>
              <p className="text-xs text-neutral-400 mt-2">Match based on lifestyle and post-adoption care.</p>
              <div className="h-1.5 w-full bg-emerald-950/40 rounded-full mt-6 overflow-hidden">
                <div className="h-full w-11/12 bg-emerald-500" />
              </div>
              <span className="text-xs text-emerald-400 mt-2">85% return reduction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Welfare Mission Targets */}
      <div className="w-full max-w-7xl mx-auto mt-32 px-4 sm:px-6 lg:px-8 border-t border-neutral-900 pt-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-950/60 text-[10px] font-mono text-neutral-400 mb-3">
            <span>Our Core Mission Objectives</span>
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wider">Aspirational Platform Targets</h2>
          <p className="text-xs text-neutral-500 mt-2">Target objectives based on study benchmarks of behavioral matching databases.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Smile className="h-8 w-8 text-red-500 mb-3" />
            <span className="text-4xl font-extrabold text-white">99%</span>
            <span className="text-xs font-semibold uppercase text-neutral-500 tracking-widest mt-1">Target Match Compatibility</span>
            <p className="text-xs text-neutral-500 mt-2 max-w-xs">Helping human-cat relations establish robust bonding profiles.</p>
          </div>
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-amber-500 mb-3" />
            <span className="text-4xl font-extrabold text-white">85%</span>
            <span className="text-xs font-semibold uppercase text-neutral-500 tracking-widest mt-1">Targeted Return Drop</span>
            <p className="text-xs text-neutral-500 mt-2 max-w-xs">Aims to decrease failed placements and pet re-homing stress.</p>
          </div>
          <div className="flex flex-col items-center">
            <BarChart2 className="h-8 w-8 text-blue-500 mb-3" />
            <span className="text-4xl font-extrabold text-white">100%</span>
            <span className="text-xs font-semibold uppercase text-neutral-500 tracking-widest mt-1">Shelter Adoption Aid</span>
            <p className="text-xs text-neutral-500 mt-2 max-w-xs">Open-source integration suite for community animal shelters globally.</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="w-full max-w-7xl mx-auto mt-32 px-4 sm:px-6 lg:px-8 border-t border-neutral-900 pt-20 animate-fade-in">
        <div className="text-center mb-12">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-950/60 text-[10px] font-mono text-neutral-400 mb-3">
            <span>Seamless Bonding Journey</span>
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wider">How Purrfect Match AI Works</h2>
          <p className="text-xs text-neutral-500 mt-2">Three straightforward stages to find and build a perfect companion relationship.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl border border-neutral-800 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider font-mono">Stage 01</span>
              <h3 className="text-lg font-bold text-white mt-2">Take Compatibility Test</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Answer lifestyle, household environment, and personality preferences questions. We use this to compute a live compatibility score for all shelter cats.
              </p>
            </div>
            <Link
              href="/questionnaire"
              className="mt-6 inline-flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Start Compatibility Test
            </Link>
          </div>

          <div className="glass-card rounded-2xl border border-neutral-800 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono">Stage 02</span>
              <h3 className="text-lg font-bold text-white mt-2">Browse Matches & Register</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Filter and match cats currently housed in community shelters, or register your own existing pet to initialize their behavioral records.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-6">
              <Link
                href="/browse"
                className="py-2 px-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold rounded-lg text-[10px] text-center transition-colors cursor-pointer"
              >
                Browse Cats
              </Link>
              <Link
                href="/profile"
                className="py-2 px-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-200 hover:text-white font-bold rounded-lg text-[10px] text-center transition-colors cursor-pointer"
              >
                Register Pet
              </Link>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-neutral-800 p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider font-mono">Stage 03</span>
              <h3 className="text-lg font-bold text-white mt-2">Analyze Behavior via AI</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Upload video or image captures of your pet's postures and expressions to run our diagnostic classification model and read immediate care instructions.
              </p>
            </div>
            <Link
              href="/behaviour"
              className="mt-6 inline-flex items-center justify-center py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Analyze Behavior
            </Link>
          </div>
        </div>
      </div>

      {/* Core AI Capabilities */}
      <div className="w-full max-w-7xl mx-auto mt-32 mb-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-900 pt-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-950/60 text-[10px] font-mono text-neutral-400 mb-3">
            <span>Platform Core Engine</span>
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wider">Advanced AI Engine Capabilities</h2>
          <p className="text-xs text-neutral-500 mt-2">Underneath the hood of our pet-human bonding intelligence framework.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded bg-red-950/20 text-red-500 border border-red-500/10 text-xs font-bold font-mono">01</div>
            <h4 className="text-md font-bold text-white">Dynamic Compatibility Engine</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Maps multi-dimensional profiles covering activity requirements, social friendliness, and household size constraints using custom distance matching vectors.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded bg-amber-955/20 text-amber-500 border border-amber-500/10 text-xs font-bold font-mono">02</div>
            <h4 className="text-md font-bold text-white">Computer Vision Bounding-Boxes</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Locates postures, ear-flattening levels, and tail positions using bounding-box segmentation contour algorithms to classify cat mood structures.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-900 bg-neutral-950/40 space-y-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded bg-emerald-955/20 text-emerald-500 border border-emerald-500/10 text-xs font-bold font-mono">03</div>
            <h4 className="text-md font-bold text-white">Lifecycle Profile Ledger</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Preserves chronological medical status entries, ownership transfer logs, and diagnostic history to guarantee seamless care handovers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
