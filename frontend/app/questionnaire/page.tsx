"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitQuestionnaire } from "@/lib/api";
import { motion } from "framer-motion";
import { ClipboardList, Heart, Sparkles, RefreshCw, ArrowRight } from "lucide-react";

export default function CompatibilityQuestionnaire() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState("there");
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    const cachedName = localStorage.getItem("user_name");
    if (cachedName) setUserName(cachedName);
  }, []);

  useEffect(() => {
    // Only speak once, and ensure voices are loaded
    const speakGreeting = () => {
      if (hasSpoken || typeof window === "undefined" || !window.speechSynthesis) return;
      
      const greeting = `Hey ${userName}! Welcome to the Adoption Compatibility Registry. Let's find your perfect feline companion!`;
      const utterance = new SpeechSynthesisUtterance(greeting);
      
      // Make it cute
      utterance.pitch = 1.6; 
      utterance.rate = 1.15;
      
      window.speechSynthesis.speak(utterance);
      setHasSpoken(true);
    };

    // Need a slight delay to allow voices to load on some browsers
    const timer = setTimeout(speakGreeting, 600);
    return () => clearTimeout(timer);
  }, [userName, hasSpoken]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Form States
  const [houseType, setHouseType] = useState("apartment");
  const [experience, setExperience] = useState("beginner");
  const [vocalTolerance, setVocalTolerance] = useState("any");
  const [groomingPreference, setGroomingPreference] = useState("any");
  
  // Mapped Dropdowns
  const [workingHoursRange, setWorkingHoursRange] = useState("8"); // maps to numeric hours
  const [playBudget, setPlayBudget] = useState("active");

  // Other Write-in States
  const [houseTypeOther, setHouseTypeOther] = useState("");
  const [experienceOther, setExperienceOther] = useState("");
  const [vocalToleranceOther, setVocalToleranceOther] = useState("");
  const [groomingPreferenceOther, setGroomingPreferenceOther] = useState("");
  const [playBudgetOther, setPlayBudgetOther] = useState("");
  const [workingHoursOther, setWorkingHoursOther] = useState("");

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

    const finalHouseType = houseType === "other" ? houseTypeOther : houseType;
    const finalExperience = experience === "other" ? experienceOther : experience;
    const finalVocalTolerance = vocalTolerance === "other" ? vocalToleranceOther : vocalTolerance;
    const finalGroomingPreference = groomingPreference === "other" ? groomingPreferenceOther : groomingPreference;
    const finalPlayBudget = playBudget === "other" ? playBudgetOther : playBudget;
    
    let finalWorkingHours = 8;
    if (workingHoursRange === "other") {
      finalWorkingHours = Number(workingHoursOther) || 8;
    } else {
      finalWorkingHours = Number(workingHoursRange);
    }

    try {
      await submitQuestionnaire({
        house_type: finalHouseType || "apartment",
        kids,
        other_pets: otherPets,
        experience: finalExperience || "beginner",
        working_hours: finalWorkingHours,
        preferred_traits: selectedTraits.join(","),
        play_budget: finalPlayBudget || "active",
        vocal_tolerance: finalVocalTolerance || "any",
        grooming_preference: finalGroomingPreference || "any",
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
                <option value="house">Spacious House</option>
                <option value="studio">Compact Studio</option>
                <option value="duplex">Duplex / Split-level</option>
                <option value="townhouse">Townhouse</option>
                <option value="condo">Condominium</option>
                <option value="farm">Farm / Rural Property</option>
                <option value="other">Other (Please specify)</option>
              </select>
              {houseType === "other" && (
                <input
                  type="text"
                  required
                  placeholder="Type your living space type..."
                  value={houseTypeOther}
                  onChange={(e) => setHouseTypeOther(e.target.value)}
                  className="w-full mt-2 py-2 px-3 bg-neutral-950 border border-red-500/40 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                />
              )}
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
                <option value="grew_up">Grew up with cats (Some family experience)</option>
                <option value="intermediate">Intermediate (Owned 1-2 cats previously)</option>
                <option value="multicat">Multi-cat household owner (High experience)</option>
                <option value="expert">Expert / Rescuer / Professional breeder</option>
                <option value="other">Other (Please specify)</option>
              </select>
              {experience === "other" && (
                <input
                  type="text"
                  required
                  placeholder="Type your experience profile..."
                  value={experienceOther}
                  onChange={(e) => setExperienceOther(e.target.value)}
                  className="w-full mt-2 py-2 px-3 bg-neutral-950 border border-red-500/40 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                />
              )}
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
                <option value="0">Mostly present (Work from home / 0 hours)</option>
                <option value="3">Part-time away (2-4 hours)</option>
                <option value="8">Full-time shift (5-8 hours)</option>
                <option value="10">Extended workday (9-10 hours)</option>
                <option value="12">Frequent traveler (11-12 hours)</option>
                <option value="other">Other (Type custom hours)</option>
              </select>
              {workingHoursRange === "other" && (
                <input
                  type="number"
                  required
                  min="0"
                  max="24"
                  placeholder="Type hours away per day..."
                  value={workingHoursOther}
                  onChange={(e) => setWorkingHoursOther(e.target.value)}
                  className="w-full mt-2 py-2 px-3 bg-neutral-950 border border-red-500/40 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                />
              )}
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
                <option value="quick">Quick Interaction (&lt;15 min/day)</option>
                <option value="short">Short playtime (15-30 min/day)</option>
                <option value="active">Active Playtime (30-60 min/day)</option>
                <option value="extensive">Extensive Engagement (1-2 hours/day)</option>
                <option value="other">Other (Please specify)</option>
              </select>
              {playBudget === "other" && (
                <input
                  type="text"
                  required
                  placeholder="Type your daily play commitment..."
                  value={playBudgetOther}
                  onChange={(e) => setPlayBudgetOther(e.target.value)}
                  className="w-full mt-2 py-2 px-3 bg-neutral-950 border border-red-500/40 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                />
              )}
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
                <option value="silent">Completely quiet & silent (Minimal vocal cues)</option>
                <option value="soft">Soft chirping / Occasional meows</option>
                <option value="talkative">Highly talkative & interactive (Siamese behavior)</option>
                <option value="other">Other (Please specify)</option>
              </select>
              {vocalTolerance === "other" && (
                <input
                  type="text"
                  required
                  placeholder="Type your vocalization preferences..."
                  value={vocalToleranceOther}
                  onChange={(e) => setVocalToleranceOther(e.target.value)}
                  className="w-full mt-2 py-2 px-3 bg-neutral-950 border border-red-500/40 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                />
              )}
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
                <option value="zero">Zero grooming (Shorthair / Hypoallergenic)</option>
                <option value="weekly">Occasional brushing (Weekly routine)</option>
                <option value="comfortable_daily">High maintenance (Comfortable with daily brushing)</option>
                <option value="other">Other (Please specify)</option>
              </select>
              {groomingPreference === "other" && (
                <input
                  type="text"
                  required
                  placeholder="Type your coat grooming preferences..."
                  value={groomingPreferenceOther}
                  onChange={(e) => setGroomingPreferenceOther(e.target.value)}
                  className="w-full mt-2 py-2 px-3 bg-neutral-950 border border-red-500/40 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                />
              )}
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
