"use client";

import { useEffect, useState } from "react";
import { fetchDashboardData, updateAdoptionRequestStatus, registerCat, deleteCat } from "@/lib/api";
import { ShieldCheck, UserCheck, ShieldAlert, Sparkles, Check, X, Shield, PlusCircle, LayoutGrid, Trash2 } from "lucide-react";

export default function ShelterDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New cat registry states
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("female");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [registering, setRegistering] = useState(false);

  const loadShelterData = async () => {
    try {
      const payload = await fetchDashboardData();
      if (payload.role !== "shelter") {
        throw new Error("Access restricted. Please log in using a Shelter Attendant profile.");
      }
      setData(payload);
    } catch (err: any) {
      setError(err.message || "Failed to load shelter dashboard records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelterData();
  }, []);

  const handleRegisterCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age || !breed || !gender || !description || !imageUrl) {
      alert("Please fill in all fields.");
      return;
    }

    setRegistering(true);
    try {
      await registerCat({
        name,
        age: Number(age),
        breed,
        gender,
        description,
        image_url: imageUrl,
      });
      // Reset form
      setName("");
      setAge("");
      setBreed("");
      setGender("female");
      setDescription("");
      setImageUrl("");
      // Reload lists
      loadShelterData();
      alert("Cat successfully registered! Default personality indexes loaded.");
    } catch (err: any) {
      alert(err.message || "Cat registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  const handleAction = async (requestId: string, action: "approve" | "reject") => {
    try {
      await updateAdoptionRequestStatus(requestId, action);
      loadShelterData();
      alert(`Adoption request has been ${action === "approve" ? "approved" : "rejected"}.`);
    } catch (err: any) {
      alert(err.message || "Failed to update application status.");
    }
  };

  const handleDeleteCat = async (catId: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this cat profile? This action is permanent.");
    if (!confirmation) return;

    try {
      await deleteCat(catId);
      loadShelterData();
      alert("Cat profile deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete cat profile.");
    }
  };

  if (loading) {
    return (
      <div className="flex-grow max-w-7xl mx-auto py-20 px-4 text-center animate-pulse space-y-6 w-full">
        <div className="h-8 bg-neutral-900 rounded w-1/4" />
        <div className="h-[400px] bg-neutral-900 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-grow max-w-xl mx-auto py-20 px-4 text-center flex flex-col items-center justify-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Access Prohibited</h2>
        <p className="text-neutral-500 mt-2">{error || "Please log in using a Shelter Attendant account."}</p>
        <button
          onClick={() => window.location.href = "/auth"}
          className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-sm text-white font-bold cursor-pointer"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
      <div className="glow-bg" />

      {/* Cockpit header */}
      <div className="mb-10 border-b border-neutral-900 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
          <Shield className="h-7 w-7 text-red-500" />
          <span>Shelter Control Panel</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-1">Authorized access. Managing Kizuna Paws placements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Add new cat registry */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-2xl border border-neutral-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-red-500" />
              <span>Register New Cat</span>
            </h3>
            
            <form onSubmit={handleRegisterCat} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                    placeholder="Luna"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Age (Years)</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Breed</label>
                  <input
                    type="text"
                    required
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                    placeholder="Ragdoll"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Cat Photo Image URL</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Character / Story Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none resize-none"
                  placeholder="A social giant who loves cuddles..."
                />
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors disabled:opacity-30 cursor-pointer"
              >
                {registering ? "Registering..." : "Add Cat & Init Personality Profiles"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Adoption request queue & Shelter cats */}
        <div className="lg:col-span-7 space-y-8">
          {/* Applications review queue */}
          <div className="glass-card rounded-2xl border border-neutral-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-red-500" />
              <span>Pending Adoption Requests</span>
            </h3>

            {data.pending_applications.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">No pending adoption requests to evaluate.</p>
            ) : (
              <div className="space-y-4">
                {data.pending_applications.map((app: any) => (
                  <div key={app.request_id} className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-855 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                        <img src={app.cat?.image_url} alt={app.cat?.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Adopter: {app.user?.name}</h4>
                        <p className="text-xs text-neutral-400">Requesting: <span className="font-semibold text-white">{app.cat?.name}</span></p>
                        <p className="text-[10px] text-neutral-500">Contact: {app.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => handleAction(app.request_id, "reject")}
                        className="p-2 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Reject application"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(app.request_id, "approve")}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                        title="Approve application"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List of current shelter cats */}
          <div className="glass-card rounded-2xl border border-neutral-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <LayoutGrid className="h-5 w-5 text-red-500" />
              <span>Registered Shelter Cats ({data.cats.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {data.cats.map((cat: any) => (
                <div key={cat.id} className="p-3 bg-neutral-950/60 border border-neutral-855 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                      <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                      <p className="text-[10px] text-neutral-500 capitalize">{cat.breed} • {cat.gender}</p>
                      <span className={`inline-block text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded capitalize ${
                        cat.status === "available" ? "bg-emerald-950/40 text-emerald-400" : "bg-amber-955/40 text-amber-400"
                      }`}>
                        {cat.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCat(cat.id)}
                    className="p-2 border border-neutral-800 bg-neutral-900 hover:bg-neutral-850 hover:text-red-500 text-neutral-500 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete companion profile"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
