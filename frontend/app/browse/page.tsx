"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCats } from "@/lib/api";
import { Heart, Search, Filter, Compass, AlertCircle, RefreshCw } from "lucide-react";

export default function BrowseCats() {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filter states
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [breed, setBreed] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [hasQuestionnaire, setHasQuestionnaire] = useState(false);

  const loadCats = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (gender) filters.gender = gender;
      if (breed) filters.breed = breed;
      if (minAge) filters.minAge = Number(minAge);
      if (maxAge) filters.maxAge = Number(maxAge);
      if (search) filters.q = search;

      const data = await fetchCats(filters);
      setCats(data);

      // Check if any cat has a compatibility score to determine questionnaire status
      const hasScores = data.some((cat: any) => cat.compatibility !== null);
      setHasQuestionnaire(hasScores);
    } catch (err: any) {
      setError(err.message || "Failed to load available companions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
  }, [gender, breed, minAge, maxAge]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCats();
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Background radial highlight */}
      <div className="glow-bg" />

      {/* Page Header */}
      <div className="text-center md:text-left mb-10">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Available Companions</h1>
        <p className="mt-3 max-w-2xl text-lg text-neutral-400">
          Match with cats based on their core behavior, playfulness, curiosity, and energy instead of just looks.
        </p>
      </div>

      {/* Banner in case Questionnaire is missing */}
      {!loading && !hasQuestionnaire && (
        <div className="mb-8 p-4 rounded-xl border border-amber-900/40 bg-amber-950/20 text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Personalize Your Matches</h4>
              <p className="text-xs text-amber-400/80">Complete your lifestyle compatibility questionnaire to display match percentages sorted by suitability.</p>
            </div>
          </div>
          <Link
            href="/questionnaire"
            className="px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap"
          >
            Take Match Test
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-xl border border-neutral-800 p-6 mb-10 flex flex-col gap-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by name, breed, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-900">
          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
            >
              <option value="">All Genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2">Breed</label>
            <input
              type="text"
              placeholder="e.g. Siamese"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2">Min Age (Years)</label>
            <input
              type="number"
              placeholder="Min"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2">Max Age (Years)</label>
            <input
              type="number"
              placeholder="Max"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Cats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl border border-neutral-800 overflow-hidden h-[420px] animate-pulse">
              <div className="h-56 bg-neutral-900 w-full" />
              <div className="p-6 space-y-4">
                <div className="h-4 bg-neutral-900 rounded w-1/3" />
                <div className="h-6 bg-neutral-900 rounded w-3/4" />
                <div className="h-4 bg-neutral-900 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-white">Something went wrong</h3>
          <p className="text-neutral-500 mt-2">{error}</p>
          <button
            onClick={loadCats}
            className="mt-6 inline-flex items-center space-x-1.5 px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-md text-sm text-neutral-300 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : cats.length === 0 ? (
        <div className="text-center py-20">
          <Compass className="mx-auto h-12 w-12 text-neutral-600 mb-4" />
          <h3 className="text-lg font-bold text-white">No cats found</h3>
          <p className="text-neutral-500 mt-2">Try adjusting your filter preferences or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cats.map((cat) => (
            <Link
              key={cat.id}
              href={`/cats/${cat.id}`}
              className="glass-card glass-card-hover rounded-2xl border border-neutral-800 overflow-hidden flex flex-col group"
            >
              {/* Cat Image */}
              <div className="relative h-56 bg-neutral-900 w-full overflow-hidden">
                <img
                  src={cat.image_url || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format"}
                  alt={cat.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Status or Compatibility Badge overlay */}
                {cat.compatibility !== null && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full backdrop-blur-md bg-neutral-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center space-x-1">
                    <Heart className="h-3 w-3 fill-emerald-400" />
                    <span>{cat.compatibility}% Match</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{cat.breed}</span>
                  <span className="text-xs text-neutral-400">{cat.age} Yrs • {cat.gender}</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2 group-hover:text-red-400 transition-colors">{cat.name}</h3>
                
                <p className="mt-3 text-sm text-neutral-400 line-clamp-2 leading-relaxed flex-grow">
                  {cat.description}
                </p>

                {/* Micro-personality Trait Badges */}
                {cat.personality_profile && (
                  <div className="mt-6 flex flex-wrap gap-1.5 pt-4 border-t border-neutral-900">
                    {cat.personality_profile.playfulness >= 0.7 && (
                      <span className="px-2 py-1 rounded bg-red-950/30 border border-red-900/40 text-[10px] font-semibold text-red-400">Playful</span>
                    )}
                    {cat.personality_profile.curiosity >= 0.7 && (
                      <span className="px-2 py-1 rounded bg-amber-950/30 border border-amber-900/40 text-[10px] font-semibold text-amber-400">Curious</span>
                    )}
                    {cat.personality_profile.friendliness >= 0.7 && (
                      <span className="px-2 py-1 rounded bg-emerald-950/30 border border-emerald-900/40 text-[10px] font-semibold text-emerald-400">Friendly</span>
                    )}
                    {cat.personality_profile.independence >= 0.7 && (
                      <span className="px-2 py-1 rounded bg-blue-950/30 border border-blue-900/40 text-[10px] font-semibold text-blue-400">Independent</span>
                    )}
                    {cat.personality_profile.confidence >= 0.7 && (
                      <span className="px-2 py-1 rounded bg-purple-950/30 border border-purple-900/40 text-[10px] font-semibold text-purple-400">Confident</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
