"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuestionnaire } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, BookOpen, Clock, Heart, ArrowRight, ArrowLeft } from "lucide-react";

export default function CompatibilityQuestionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [houseType, setHouseType] = useState("apartment");
  const [kids, setKids] = useState(false);
  const [otherPets, setOtherPets] = useState(false);
  const [experience, setExperience] = useState("beginner");
  const [workingHours, setWorkingHours] = useState(8);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  const handleNext = () => setStep((p) => Math.min(5, p + 1));
  const handleBack = () => setStep((p) => Math.max(1, p - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitQuestionnaire({
        house_type: houseType,
        kids,
        other_pets: otherPets,
        experience,
        working_hours: workingHours,
        preferred_traits: selectedTraits.join(",")
      });
      // Redirect to match scanning page
      router.push("/match");
    } catch (err: any) {
      alert(err.message || "Failed to submit questionnaire.");
      setSubmitting(false);
    }
  };

  const stepVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120, damping: 18 } },
    exit: { x: -50, opacity: 0 }
  };

  return (
    <div className="relative flex-grow flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full z-10">
      <div className="glow-bg" />

      {/* Progress tracker */}
      <div className="w-full flex items-center justify-between mb-8 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        <span>Step {step} of 5</span>
        <div className="h-1 flex-grow mx-6 bg-neutral-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
        <span>{Math.round((step / 5) * 100)}%</span>
      </div>

      <div className="glass-card rounded-2xl border border-neutral-800 p-8 w-full min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="flex items-center space-x-2 text-red-500">
                <Home className="h-5 w-5" />
                <h3 className="font-bold text-lg text-white">Your Living Environment</h3>
              </div>
              <p className="text-xs text-neutral-400">Where will your cat companion be spending most of their time?</p>
              <div className="grid grid-cols-3 gap-4 pt-2">
                {["apartment", "house", "studio"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setHouseType(type)}
                    className={`py-6 px-4 rounded-xl border text-center font-bold capitalize transition-all ${
                      houseType === type
                        ? "border-red-500 bg-red-950/15 text-white"
                        : "border-neutral-850 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="flex items-center space-x-2 text-red-500">
                <Users className="h-5 w-5" />
                <h3 className="font-bold text-lg text-white">Household Companions</h3>
              </div>
              <p className="text-xs text-neutral-400">Do you share your home with children or other pets?</p>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 bg-neutral-950/60 border border-neutral-850 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-white">Children in Household</h4>
                    <p className="text-xs text-neutral-500">Are there kids under 12 years living with you?</p>
                  </div>
                  <button
                    onClick={() => setKids(!kids)}
                    className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                      kids ? "bg-red-600" : "bg-neutral-800"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white h-6 w-6 rounded-full transition-all ${
                        kids ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-950/60 border border-neutral-850 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-white">Other Pets</h4>
                    <p className="text-xs text-neutral-500">Do you have other cats, dogs, or small animals?</p>
                  </div>
                  <button
                    onClick={() => setOtherPets(!otherPets)}
                    className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                      otherPets ? "bg-red-600" : "bg-neutral-800"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white h-6 w-6 rounded-full transition-all ${
                        otherPets ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="flex items-center space-x-2 text-red-500">
                <BookOpen className="h-5 w-5" />
                <h3 className="font-bold text-lg text-white">Cat Ownership Experience</h3>
              </div>
              <p className="text-xs text-neutral-400">Select the experience level that matches your history with cats.</p>
              
              <div className="grid grid-cols-3 gap-4 pt-2">
                {["beginner", "intermediate", "expert"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setExperience(lvl)}
                    className={`py-6 px-4 rounded-xl border text-center font-bold capitalize transition-all ${
                      experience === lvl
                        ? "border-red-500 bg-red-950/15 text-white"
                        : "border-neutral-850 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="flex items-center space-x-2 text-red-500">
                <Clock className="h-5 w-5" />
                <h3 className="font-bold text-lg text-white">Daily Absence Hours</h3>
              </div>
              <p className="text-xs text-neutral-400">On average, how many hours is the household left unoccupied daily?</p>
              
              <div className="pt-6 space-y-4">
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>Away time:</span>
                  <span className="text-red-500">{workingHours} Hours/Day</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="1"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 uppercase font-mono pt-2">
                  <span>Home constantly (0 hrs)</span>
                  <span>Full workday (8 hrs)</span>
                  <span>Long away (12+ hrs)</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="flex items-center space-x-2 text-red-500">
                <Heart className="h-5 w-5" />
                <h3 className="font-bold text-lg text-white">Preferred Personality Traits</h3>
              </div>
              <p className="text-xs text-neutral-400">Select any key behaviors that describe your ideal cat companion.</p>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                {["friendly", "calm", "independent", "playful", "curious", "affectionate", "confident"].map((trait) => {
                  const active = selectedTraits.includes(trait);
                  return (
                    <button
                      key={trait}
                      onClick={() => handleTraitToggle(trait)}
                      className={`py-3 px-4 rounded-xl border text-left font-semibold capitalize text-xs transition-all ${
                        active
                          ? "border-red-500 bg-red-950/15 text-white"
                          : "border-neutral-850 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-white"
                      }`}
                    >
                      {trait}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-neutral-900 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className="flex items-center space-x-1.5 px-4 py-2 border border-neutral-800 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-red-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? "Matching..." : "Evaluate Compatibility"}</span>
              <Heart className="h-4 w-4 fill-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
