"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuestionnaire } from "@/lib/api";
import { motion } from "framer-motion";
import { ClipboardList, Heart, Sparkles, RefreshCw, ArrowRight } from "lucide-react";

export default function CompatibilityQuestionnaire() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [houseType, setHouseType] = useState("apartment");
  const [experience, setExperience] = useState("beginner");
  const [vocalTolerance, setVocalTolerance] = useState("any");
  const [groomingPreference, setGroomingPreference] = useState("any");
  
  // Mapped Dropdowns
  const [workingHoursRange, setWorkingHoursRange] = useState("8"); // maps to numeric hours
  const [playBudget, setPlayBudget] = useState("active");

  // Checkboxes
  const [kids, setKids] = useState(false);
  const [otherPets, setOtherPets] = useState(false);

  // Preferred Traits (Multi-select Checkboxes)
  const availableTraits = ["friendly", "calm", "independent", "playful", "curious", "affectionate", "confident"];
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  // Short Answer
  const [idealDescription, setIdealDescription] = useState("");

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitQuestionnaire({
        house_type: houseType,
        kids,
        other_pets: otherPets,
        experience,
        working_hours: Number(workingHoursRange),
        preferred_traits: selectedTraits.join(","),
        play_budget: playBudget,
        vocal_tolerance: vocalTolerance,
        grooming_preference: groomingPreference,
        ideal_description: idealDescription
      });
      // Redirect to match scanning animation
      router.push("/match");
    } catch (err: any) {
      alert(err.message || "Failed to submit questionnaire.");
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full z-10">
      <div className="glow-bg" />

      {/* Header */}
      <div className="mb-8 border-b border-neutral-900 pb-6 text-center">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-950/60 text-[10px] font-mono text-neutral-400 mb-3">
          <ClipboardList className="h-3 w-3 text-red-500" />
          <span>Compatibility Analyzer</span>
        </span>
        <h1 className="text-3xl font-extrabold text-white">Adoption Compatibility Registry</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Complete the single-page questionnaire below. Our backend matches your profile parameters against cat behavioral indexes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Household & Living */}
        <div className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center space-x-2">
            <span>01. Living & Household Environment</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Living Space Type
              </label>
              <select
                value={houseType}
                onChange={(e) => setHouseType(e.target.value)}
                className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House (Spacious)</option>
                <option value="studio">Studio (Compact)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Owner Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
              >
                <option value="beginner">Beginner (First-time owner)</option>
                <option value="intermediate">Intermediate (Had pets before)</option>
                <option value="expert">Expert (Experienced handler)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-start space-x-3 p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl cursor-pointer hover:border-neutral-800 transition-colors">
              <input
                type="checkbox"
                checked={kids}
                onChange={(e) => setKids(e.target.checked)}
                className="mt-1 h-3.5 w-3.5 rounded border-neutral-800 text-red-600 bg-neutral-950 focus:ring-0 focus:ring-offset-0 accent-red-600"
              />
              <div>
                <span className="block text-xs font-bold text-white">Children in Household</span>
                <span className="block text-[10px] text-neutral-500 mt-0.5">Kids under 12 years living in the home.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-3 bg-neutral-950/40 border border-neutral-900 rounded-xl cursor-pointer hover:border-neutral-800 transition-colors">
              <input
                type="checkbox"
                checked={otherPets}
                onChange={(e) => setOtherPets(e.target.checked)}
                className="mt-1 h-3.5 w-3.5 rounded border-neutral-800 text-red-600 bg-neutral-950 focus:ring-0 focus:ring-offset-0 accent-red-600"
              />
              <div>
                <span className="block text-xs font-bold text-white">Other Pets</span>
                <span className="block text-[10px] text-neutral-500 mt-0.5">Dogs, other cats, or small animals live with you.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Time & Commitments */}
        <div className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center space-x-2">
            <span>02. Schedule & Time Commitments</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Daily Absence Hours (Unoccupied home)
              </label>
              <select
                value={workingHoursRange}
                onChange={(e) => setWorkingHoursRange(e.target.value)}
                className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
              >
                <option value="0">Home Constantly (0 hours)</option>
                <option value="3">Short Absences (1-4 hours)</option>
                <option value="8">Full Workday (5-8 hours)</option>
                <option value="12">Long Absences (9+ hours)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Daily Active Play Commitment
              </label>
              <select
                value={playBudget}
                onChange={(e) => setPlayBudget(e.target.value)}
                className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
              >
                <option value="quick">Quick Interaction (&lt;30 min/day)</option>
                <option value="active">Active Playtime (30-60 min/day)</option>
                <option value="extensive">Extensive Engagement (1-2 hours/day)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Pet Profile Tolerances */}
        <div className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center space-x-2">
            <span>03. Companion Behavioral Tolerances</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Vocalization & Talkativeness
              </label>
              <select
                value={vocalTolerance}
                onChange={(e) => setVocalTolerance(e.target.value)}
                className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
              >
                <option value="any">No Preference (Open to vocal or silent)</option>
                <option value="silent">Quiet & Silent (Minimal vocal cues)</option>
                <option value="talkative">Communicative & Vocal (Siamese mix behavior)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Grooming Commitment Preference
              </label>
              <select
                value={groomingPreference}
                onChange={(e) => setGroomingPreference(e.target.value)}
                className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
              >
                <option value="any">No Preference (Open to any coat length)</option>
                <option value="low_maintenance">Low Maintenance (Shorthair, minimal brushing)</option>
                <option value="comfortable_daily">Comfortable with Daily Brushing (Longhair styles)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Desired Traits Checkboxes */}
        <div className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center space-x-2">
            <span>04. Ideal Temperament Traits</span>
          </h3>
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Select all behaviors you expect from your cat:</p>
          
          <div className="flex flex-wrap gap-2 pt-1">
            {availableTraits.map((trait) => {
              const active = selectedTraits.includes(trait);
              return (
                <button
                  type="button"
                  key={trait}
                  onClick={() => handleTraitToggle(trait)}
                  className={`py-2 px-4 rounded-xl border font-bold capitalize text-xs transition-all cursor-pointer ${
                    active
                      ? "border-red-500 bg-red-950/20 text-white shadow-sm"
                      : "border-neutral-850 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  {trait}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 5: Short Answer ideal cat description */}
        <div className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-4">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center space-x-2">
            <span>05. Ideal Relationship Description</span>
          </h3>
          
          <div>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Describe your ideal companion cat (Short Answer)
            </label>
            <textarea
              rows={4}
              value={idealDescription}
              onChange={(e) => setIdealDescription(e.target.value)}
              placeholder="e.g., I'm looking for a quiet lap cat that loves to cuddle and nap on the couch while I read, or a playful friend that gets along with other dogs..."
              className="w-full py-3 px-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full max-w-md py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-red-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Running Compatibility Calculations...</span>
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 fill-white animate-pulse" />
                <span>Evaluate Compatibility Matrix</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
