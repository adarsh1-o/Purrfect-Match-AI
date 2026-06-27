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

      {/* Hero Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl text-center z-10 flex flex-col items-center"
      >
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

      {/* Welfare Metrics */}
      <div className="w-full max-w-7xl mx-auto mt-32 px-4 sm:px-6 lg:px-8 border-t border-neutral-900 pt-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Smile className="h-8 w-8 text-red-500 mb-3" />
            <span className="text-4xl font-extrabold text-white">99%</span>
            <span className="text-xs font-semibold uppercase text-neutral-500 tracking-widest mt-1">Satisfaction Rate</span>
            <p className="text-xs text-neutral-500 mt-2 max-w-xs">Highly matched human-cat relationships leading to happy homes.</p>
          </div>
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-amber-500 mb-3" />
            <span className="text-4xl font-extrabold text-white">85%</span>
            <span className="text-xs font-semibold uppercase text-neutral-500 tracking-widest mt-1">Return Reduction</span>
            <p className="text-xs text-neutral-500 mt-2 max-w-xs">Drastically reduces failed shelter placements and cat stress.</p>
          </div>
          <div className="flex flex-col items-center">
            <BarChart2 className="h-8 w-8 text-blue-500 mb-3" />
            <span className="text-4xl font-extrabold text-white">10k+</span>
            <span className="text-xs font-semibold uppercase text-neutral-500 tracking-widest mt-1">Matched Companions</span>
            <p className="text-xs text-neutral-500 mt-2 max-w-xs">Helping animal shelters across communities optimize placement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
