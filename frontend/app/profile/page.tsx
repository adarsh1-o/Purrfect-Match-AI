"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchUserProfile,
  updateUserProfile,
  registerCustomPet,
  updatePetStatus,
  transferPet
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Heart,
  PlusCircle,
  Activity,
  Send,
  RefreshCw,
  Sparkles,
  ClipboardList,
  AlertTriangle
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile Edit Form States
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // New Pet Registration Form States
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petGender, setPetGender] = useState("female");
  const [petDescription, setPetDescription] = useState("");
  const [petImageFile, setPetImageFile] = useState<File | null>(null);
  const [registeringPet, setRegisteringPet] = useState(false);

  // Ownership Transfer Inputs
  const [transferEmails, setTransferEmails] = useState<{ [catId: string]: string }>({});
  const [transferringCatId, setTransferringCatId] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      const data = await fetchUserProfile();
      setProfile(data);
      setName(data.name || "");
      setAddress(data.address || "");
      setPhone(data.phone || "");
    } catch (err: any) {
      setError(err.message || "Failed to load user profile. Please log in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateUserProfile({ name, address, phone });
      alert("Profile updated successfully!");
      loadProfile();
    } catch (err: any) {
      alert(err.message || "Failed to update profile details.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleRegisterPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !petAge || !petBreed || !petDescription || !petImageFile) {
      alert("Please fill in all required fields (including the cat picture file).");
      return;
    }
    setRegisteringPet(true);
    try {
      const formData = new FormData();
      formData.append("name", petName);
      formData.append("age", petAge);
      formData.append("breed", petBreed);
      formData.append("gender", petGender);
      formData.append("description", petDescription);
      formData.append("file", petImageFile);

      await registerCustomPet(formData);
      alert("Pet registered successfully! You can now analyze their behavior.");
      setPetName("");
      setPetAge("");
      setPetBreed("");
      setPetGender("female");
      setPetDescription("");
      setPetImageFile(null);
      loadProfile();
    } catch (err: any) {
      alert(err.message || "Pet registration failed.");
    } finally {
      setRegisteringPet(false);
    }
  };

  const handlePetStatusChange = async (catId: string, newStatus: string) => {
    const confirmation = window.confirm(`Are you sure you want to mark this pet as ${newStatus.replace("_", " ")}?`);
    if (!confirmation) return;

    try {
      await updatePetStatus(catId, newStatus);
      alert(`Pet status updated successfully.`);
      loadProfile();
    } catch (err: any) {
      alert(err.message || "Failed to update pet status.");
    }
  };

  const handleTransferOwnership = async (catId: string) => {
    const email = transferEmails[catId];
    if (!email || !email.trim()) {
      alert("Please enter a valid recipient email address.");
      return;
    }

    setTransferringCatId(catId);
    try {
      await transferPet(catId, email.trim());
      alert(`Companion successfully transferred to ${email}!`);
      // Clear input
      setTransferEmails((prev) => ({ ...prev, [catId]: "" }));
      loadProfile();
    } catch (err: any) {
      alert(err.message || "Ownership transfer failed.");
    } finally {
      setTransferringCatId(null);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex-grow max-w-4xl mx-auto py-20 px-4 text-center animate-pulse space-y-6 w-full">
        <div className="h-8 bg-neutral-900 rounded w-1/4 mx-auto" />
        <div className="h-[300px] bg-neutral-900 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-grow max-w-xl mx-auto py-20 px-4 text-center flex flex-col items-center justify-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Profile Workspace Offline</h2>
        <p className="text-neutral-500 mt-2">{error || "Please log in to customize profiles."}</p>
        <button
          onClick={() => router.push("/auth")}
          className="mt-6 px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs text-white font-bold cursor-pointer transition-colors"
        >
          Sign In Page
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full z-10">
      <div className="glow-bg" />

      {/* Profile Cockpit Header */}
      <div className="mb-10 border-b border-neutral-900 pb-6">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-950/60 text-[10px] font-mono text-neutral-400 mb-3">
          <User className="h-3 w-3" />
          <span>User Profile Registry</span>
        </span>
        <h1 className="text-3xl font-extrabold text-white">Account Profiles & Pet Management</h1>
        <p className="text-xs text-neutral-400 mt-1">Manage contact fields, register pets, or transfer companion credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal info workspace */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-900 pb-3 flex items-center space-x-2">
              <User className="h-4.5 w-4.5 text-red-500" />
              <span>Contact Registry</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full py-2 pl-9 pr-3 bg-neutral-950/40 border border-neutral-900 rounded-md text-xs text-neutral-500 focus:outline-none cursor-not-allowed"
                  />
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-600" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Physical Address</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 123 Paws Street, Boston"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full py-2 pl-9 pr-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                  />
                  <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2 pl-9 pr-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                  />
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Account Role</span>
                <span className="inline-block px-2.5 py-1 rounded bg-red-950/20 border border-red-500/25 text-[10px] font-mono text-red-400 font-bold uppercase">
                  {profile.role}
                </span>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40"
              >
                {updatingProfile ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 fill-white" />
                    <span>Save Contact Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Pet management (Only for Adopter role) */}
        <div className="lg:col-span-8 space-y-8">
          {profile.role === "adopter" ? (
            <>
              {/* Pet List Dashboard */}
              <div className="glass-card rounded-2xl border border-neutral-800 p-6 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-900 pb-3 flex items-center space-x-2">
                  <Heart className="h-4.5 w-4.5 text-red-500 fill-red-500" />
                  <span>My Companions & Pets ({profile.owned_cats.length})</span>
                </h3>

                {profile.owned_cats.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/20">
                    <p className="text-xs text-neutral-500">No registered pets found. Register your cat below!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {profile.owned_cats.map((cat: any) => (
                      <div
                        key={cat.id}
                        className="p-5 rounded-xl bg-neutral-950/50 border border-neutral-900 flex flex-col md:flex-row gap-5 items-start"
                      >
                        {/* Pet Photo */}
                        <div className="h-24 w-24 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-neutral-800">
                          <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                        </div>

                        {/* Pet Info */}
                        <div className="flex-grow space-y-2.5">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-md font-bold text-white">{cat.name}</h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${
                                cat.status === "active"
                                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                                  : cat.status === "passed_away"
                                  ? "bg-neutral-900 border-neutral-700 text-neutral-400"
                                  : "bg-amber-950/20 border-amber-500/20 text-amber-400"
                              }`}
                            >
                              {cat.status.replace("_", " ")}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-400">
                            {cat.breed} • {cat.age} Years Old • {cat.gender}
                          </p>
                          <p className="text-[11px] text-neutral-500 italic leading-relaxed">{cat.description}</p>

                          {/* Lifecycle options (Visible only if pet is active) */}
                          {cat.status === "active" && (
                            <div className="pt-3 border-t border-neutral-900 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                              {/* Mark Passed Away */}
                              <button
                                onClick={() => handlePetStatusChange(cat.id, "passed_away")}
                                className="px-3 py-1.5 border border-red-500/20 bg-red-950/10 hover:bg-red-950/30 text-[10px] font-bold text-red-400 rounded-lg transition-colors cursor-pointer text-center"
                              >
                                Mark as Passed Away
                              </button>

                              {/* Transfer Ownership Form */}
                              <div className="flex-grow flex items-center space-x-2">
                                <input
                                  type="email"
                                  placeholder="New owner's email..."
                                  value={transferEmails[cat.id] || ""}
                                  onChange={(e) =>
                                    setTransferEmails((prev) => ({ ...prev, [cat.id]: e.target.value }))
                                  }
                                  className="flex-grow py-1.5 px-3 bg-neutral-950 border border-neutral-900 rounded-lg text-[10px] text-neutral-300 focus:outline-none focus:border-red-500"
                                />
                                <button
                                  onClick={() => handleTransferOwnership(cat.id)}
                                  disabled={transferringCatId === cat.id}
                                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
                                >
                                  {transferringCatId === cat.id ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Send className="h-3 w-3" />
                                  )}
                                  <span>Transfer</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Custom Pet Form */}
              <div className="glass-card rounded-2xl border border-neutral-800 p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <PlusCircle className="h-4.5 w-4.5 text-red-500" />
                  <span>Register a New Pet</span>
                </h3>

                <form onSubmit={handleRegisterPet} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Cat's Name
                      </label>
                      <input
                        type="text"
                        required
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="e.g. Luna"
                        className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        required
                        value={petAge}
                        onChange={(e) => setPetAge(e.target.value)}
                        placeholder="2"
                        className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Breed
                      </label>
                      <input
                        type="text"
                        required
                        value={petBreed}
                        onChange={(e) => setPetBreed(e.target.value)}
                        placeholder="e.g. Ragdoll"
                        className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Gender
                      </label>
                      <select
                        value={petGender}
                        onChange={(e) => setPetGender(e.target.value)}
                        className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Upload Cat Image File
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setPetImageFile(e.target.files[0]);
                        }
                      }}
                      className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-400 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-850 cursor-pointer focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Story & Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={petDescription}
                      onChange={(e) => setPetDescription(e.target.value)}
                      placeholder="A sweet lap cat that loves to sleep on sunny windowsills..."
                      className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={registeringPet}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {registeringPet ? "Registering..." : "Add Companion Profile"}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-2xl border border-neutral-800 p-8 text-center bg-neutral-950/20">
              <ClipboardList className="h-10 w-10 text-neutral-500 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-white">Shelter Workspace Profile</h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-md mx-auto">
                Shelter Attendants manage intakes and adoption workflows directly from the Shelter Cockpit in the header navigation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
