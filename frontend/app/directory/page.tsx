"use client";

import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  Clock, 
  Navigation, 
  Heart, 
  Check, 
  X, 
  AlertCircle,
  Scissors
} from "lucide-react";
import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  category: "vet" | "emergency" | "shelter" | "store";
  description: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  hours: string;
  open24_7: boolean;
  services: string[];
}

export default function DirectoryPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "vet" | "emergency" | "shelter" | "store">("all");
  const [onlyOpen247, setOnlyOpen247] = useState(false);

  // Modal / Interaction states
  const [bookingPartner, setBookingPartner] = useState<Partner | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [directionsPartner, setDirectionsPartner] = useState<Partner | null>(null);

  // Form states for booking
  const [petName, setPetName] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [apptType, setApptType] = useState("Routine Checkup");

  // Local Seeded Static Partners
  const staticPartners: Partner[] = [
    {
      id: "vet-kizuna",
      name: "Kizuna Feline Clinic",
      category: "vet",
      description: "Dedicated cat-only veterinary clinic providing specialized feline diagnostics, spay/neuter services, vaccinations, and routine wellness checks in a low-stress environment.",
      address: "Banjara Hills, Road No. 12, Hyderabad, Telangana",
      phone: "+91 98480 22338",
      email: "care@kizunafeline.in",
      rating: 4.9,
      hours: "9:00 AM - 6:00 PM (Mon-Sat)",
      open24_7: false,
      services: ["Feline Specialists", "Vaccinations", "Dental Scaling", "Spay/Neuter"]
    },
    {
      id: "vet-happy-tails",
      name: "Happy Tails Veterinary Hospital",
      category: "vet",
      description: "A full-service modern veterinary clinic equipped with digital X-ray, in-house pharmacy, and comprehensive surgical suites for general diagnostics.",
      address: "Gachibowli, Biotech Park, Hyderabad, Telangana",
      phone: "+91 80088 12345",
      email: "contact@happytailsvet.com",
      rating: 4.7,
      hours: "8:00 AM - 8:00 PM (Daily)",
      open24_7: false,
      services: ["General Surgery", "In-house Lab", "Microchipping", "Wellness Exams"]
    },
    {
      id: "emergency-vca",
      name: "VCA Emergency Animal Trauma Center",
      category: "emergency",
      description: "24/7 premier critical care hospital equipped for severe pet emergencies, toxic ingestions, fractures, oxygen therapy, and nocturnal surgical procedures.",
      address: "Jubilee Hills, Near Metro Station, Hyderabad, Telangana",
      phone: "+91 40 2355 9900",
      email: "er@vcaultracare.in",
      rating: 4.8,
      hours: "Open 24 Hours (7 Days a week)",
      open24_7: true,
      services: ["24/7 ICU Care", "Oxygen Therapy", "Trauma Surgery", "Triage & First Aid"]
    },
    {
      id: "emergency-secunderabad",
      name: "Secunderabad Veterinary First Aid & Critical Unit",
      category: "emergency",
      description: "Immediate critical response unit managing overnight animal emergencies, surgical sutures, and life-support operations.",
      address: "Sardar Patel Road, Secunderabad, Telangana",
      phone: "+91 40 2780 4455",
      email: "critical@secunderabadvet.org",
      rating: 4.5,
      hours: "Open 24 Hours (7 Days a week)",
      open24_7: true,
      services: ["Life Support", "Fractures", "Overnight Monitoring", "First Aid"]
    },
    {
      id: "store-purrfect",
      name: "Purrfect Treats & Cat Supply Depot",
      category: "store",
      description: "Your ultimate catalog for premium cat foods, raw diet meals, scratch trees, interactive laser toys, and high-quality organic catnip accessories.",
      address: "Madhapur, Hitech City, Hyderabad, Telangana",
      phone: "+91 91100 55432",
      email: "hello@purrfectsupplies.com",
      rating: 4.8,
      hours: "10:00 AM - 9:00 PM (Daily)",
      open24_7: false,
      services: ["Premium Cat Food", "Scratching Perches", "Interactive Toys", "Catnip Products"]
    },
    {
      id: "store-kitty-palace",
      name: "Kitty Palace Cat Grooming & Spa Hub",
      category: "store",
      description: "Premium cat-only styling salon. Specializes in claw trims, de-shedding bath packages, blowouts, and stress-free dematting services.",
      address: "Jubilee Hills, Road No. 36, Hyderabad, Telangana",
      phone: "+91 99880 77665",
      email: "spa@kittypalace.com",
      rating: 4.9,
      hours: "9:30 AM - 8:00 PM (Tue-Sun)",
      open24_7: false,
      services: ["Cat Grooming & Styling", "De-shedding Spa", "Nail Cap Fitting", "Dematting Treatment"]
    }
  ];

  useEffect(() => {
    async function loadDirectory() {
      try {
        setLoading(true);
        // Try fetching database shelters
        const data = await fetchDashboardData();
        
        let loadedPartners: Partner[] = [...staticPartners];
        
        if (data && data.shelter_directory) {
          // Format database shelters into partner structure
          const dbShelters: Partner[] = data.shelter_directory.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: "shelter",
            description: `Official database partner registry. Directly connect with shelter staff to schedule adoption briefings, matching interviews, and check available cat companions (${s.cats?.length || 0} listings).`,
            address: s.address || "Hyderabad, Telangana",
            phone: s.phone || "Not listed",
            email: s.email,
            rating: 4.9,
            hours: "10:00 AM - 5:00 PM (Mon-Sat)",
            open24_7: false,
            services: ["Adoption Matching", "Companion Meetups", "Feline Behavioral Profiles"]
          }));
          
          // Merge them
          loadedPartners = [...dbShelters, ...loadedPartners];
        }
        
        setPartners(loadedPartners);
      } catch (err) {
        console.error("Failed to load backend shelters, using static defaults:", err);
        // Fallback to static partners + a mock shelter if server is offline
        const mockShelter: Partner = {
          id: "shelter-12345",
          name: "Kizuna Shelter & Adoption Center",
          category: "shelter",
          description: "Kizuna Paws hackathon network headquarters. Offers behavioral modeling, compatibility metrics matching, and post-adoption wellness follow-ups.",
          address: "Madhapur Main Road, Hyderabad, Telangana",
          phone: "+91 90000 88776",
          email: "shelter@kizunapaws.com",
          rating: 4.9,
          hours: "10:00 AM - 5:00 PM (Mon-Sat)",
          open24_7: false,
          services: ["AI Adoptions", "Feline Behavior Advice", "Briefing Checklists"]
        };
        setPartners([mockShelter, ...staticPartners]);
      } finally {
        setLoading(false);
      }
    }
    
    loadDirectory();
  }, []);

  // Filter partners list based on query and tabs
  const filteredPartners = partners.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesLocation = 
      p.address.toLowerCase().includes(locationQuery.toLowerCase());
      
    const matchesTab = activeTab === "all" ? true : p.category === activeTab;
    const matches247 = onlyOpen247 ? p.open24_7 === true : true;
    
    return matchesSearch && matchesLocation && matchesTab && matches247;
  });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !petName) {
      alert("Please fill in all booking fields.");
      return;
    }
    setBookingSuccess(true);
  };

  const closeBookingModal = () => {
    setBookingPartner(null);
    setBookingSuccess(false);
    setPetName("");
    setBookingDate("");
    setBookingTime("");
    setApptType("Routine Checkup");
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full z-10 relative">
      <div className="glow-bg" />

      {/* Hero Header */}
      <div className="text-center space-y-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-950/40 text-xs font-semibold text-red-400"
        >
          <span>Care Partner Directory</span>
        </motion.div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Feline Care & Partner Registry
        </h1>
        <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
          Find emergency veterinary services, specialized feline clinics, adoption shelters, and cat supply stores near you.
        </p>
      </div>

      {/* Filter and Search Bar Panel */}
      <div className="glass-card border border-neutral-800 rounded-2xl p-6 mb-8 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search vets, clinics, stores, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Location Search */}
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by neighborhood or street name..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-neutral-900 pt-4 gap-4">
          {/* Category tabs switcher */}
          <div className="flex flex-wrap gap-1.5 bg-neutral-950 p-1.5 rounded-xl border border-neutral-900 max-w-fit">
            {(["all", "vet", "emergency", "shelter", "store"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                  activeTab === tab
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                {tab === "all" ? "All Partners" : tab === "vet" ? "Vets" : tab === "emergency" ? "Emergency" : tab === "shelter" ? "Shelters" : "Stores"}
              </button>
            ))}
          </div>

          {/* Open 24/7 Filter Switch */}
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyOpen247}
              onChange={(e) => setOnlyOpen247(e.target.checked)}
              className="h-4 w-4 bg-neutral-950 border-neutral-800 rounded text-red-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-neutral-400 font-medium">Show only Open 24/7</span>
          </label>
        </div>
      </div>

      {/* Main Listing Directory */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-neutral-900 rounded-2xl" />
          <div className="h-64 bg-neutral-900 rounded-2xl" />
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="glass-card border border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-neutral-500 mb-3" />
          <h3 className="text-base font-bold text-white">No Partners Match Criteria</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs">
            Try adjusting your search filters or clearing the search fields to view all registries.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setLocationQuery("");
              setActiveTab("all");
              setOnlyOpen247(false);
            }}
            className="mt-4 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:text-white rounded-lg text-xs font-semibold text-neutral-300"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPartners.map((partner) => (
            <motion.div
              key={partner.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`glass-card rounded-2xl border border-neutral-800 hover:border-neutral-700 p-6 flex flex-col justify-between transition-all duration-300 group shadow-md hover:shadow-xl relative overflow-hidden`}
            >
              {/* Category indicator label */}
              <div className="absolute right-6 top-6 flex items-center space-x-1.5 text-[10px] uppercase font-mono tracking-wider font-bold">
                <span className={`inline-block h-2 w-2 rounded-full ${
                  partner.category === "emergency" 
                    ? "bg-red-500 animate-pulse" 
                    : partner.category === "vet"
                      ? "bg-emerald-500"
                      : partner.category === "shelter"
                        ? "bg-blue-500"
                        : "bg-amber-500"
                }`} />
                <span className="text-neutral-500">{partner.category}</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 pr-14">
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed">
                    {partner.description}
                  </p>
                </div>

                {/* Info blocks */}
                <div className="text-xs space-y-2 border-y border-neutral-900 py-3.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                    <span className="text-neutral-300 leading-normal">{partner.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span className={`leading-none ${partner.open24_7 ? "text-red-400 font-bold" : "text-neutral-400"}`}>
                      {partner.hours}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span className="text-neutral-300 font-semibold leading-none">{partner.rating} / 5.0 Rating</span>
                  </div>
                </div>

                {/* Services list badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {partner.services.map((svc, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-neutral-950 border border-neutral-900 text-[10px] text-neutral-400">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2.5 mt-6 border-t border-neutral-900 pt-4">
                {partner.category === "store" ? (
                  <a
                    href={`mailto:${partner.email}?subject=Cat Supplies Query`}
                    className="flex-grow py-2.5 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-300 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Inquire Inventory</span>
                  </a>
                ) : partner.category === "shelter" ? (
                  <Link
                    href="/browse"
                    className="flex-grow py-2.5 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-300 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                    <span>Adopt Companions</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setBookingPartner(partner)}
                    className="flex-grow py-2.5 bg-red-650 hover:bg-red-550 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Book Appointment</span>
                  </button>
                )}

                <button
                  onClick={() => setDirectionsPartner(partner)}
                  className="py-2.5 px-3.5 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer"
                  title="Get Directions"
                >
                  <Navigation className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Appointment Booking Modal */}
      <AnimatePresence>
        {bookingPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={closeBookingModal}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6">
                {!bookingSuccess ? (
                  <form onSubmit={handleBookSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Book Clinic Appt</h3>
                      <p className="text-xs text-neutral-400">Scheduling directly with <span className="font-semibold text-white">{bookingPartner.name}</span></p>
                    </div>

                    <div className="space-y-3.5 pt-2">
                      {/* Pet Name input */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider block">Cat's Name</label>
                        <input
                          type="text"
                          required
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          placeholder="e.g. Luna or Milo"
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      {/* Appointment Type Select */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider block">Reason for Visit</label>
                        <select
                          value={apptType}
                          onChange={(e) => setApptType(e.target.value)}
                          className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                        >
                          <option value="Routine Checkup">Routine Wellness Checkup</option>
                          <option value="Vaccination">Vaccination Booster</option>
                          <option value="Grooming">Professional De-shedding / Grooming</option>
                          <option value="Dental Service">Dental Scaling / Hygiene</option>
                          <option value="Urgent Care">Urgent Clinic Diagnosis</option>
                        </select>
                      </div>

                      {/* DateTime Picker Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider block">Select Date</label>
                          <input
                            type="date"
                            required
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider block">Select Time</label>
                          <input
                            type="time"
                            required
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-900 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={closeBookingModal}
                        className="px-4 py-2 border border-neutral-800 hover:bg-neutral-900 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-red-650 hover:bg-red-550 text-white font-bold rounded-lg text-xs hover:shadow-md transition-all active:scale-95"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center bg-emerald-950 border border-emerald-500/20 text-emerald-400 rounded-full">
                      <Check className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white">Appointment Confirmed! 🐾</h3>
                      <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                        Your appointment has been successfully scheduled. Details have been registered in our ledgers.
                      </p>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 text-left text-[11px] space-y-2.5 max-w-xs mx-auto">
                      <div>🏢 <span className="font-semibold text-white">Partner</span>: {bookingPartner.name}</div>
                      <div>🏷️ <span className="font-semibold text-white">Service</span>: {apptType}</div>
                      <div>🐈 <span className="font-semibold text-white">Pet name</span>: {petName}</div>
                      <div>📅 <span className="font-semibold text-white">Schedule</span>: {bookingDate} at {bookingTime}</div>
                    </div>

                    <button
                      onClick={closeBookingModal}
                      className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-300 hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Return to Directory
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Directions Mock Map Overlay */}
      <AnimatePresence>
        {directionsPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setDirectionsPartner(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Transit Navigation Map</h3>
                  <p className="text-xs text-neutral-400">Showing route to <span className="font-semibold text-white">{directionsPartner.name}</span></p>
                </div>

                {/* Mock Visual Map drawing */}
                <div className="h-48 rounded-xl bg-neutral-950 border border-neutral-900 relative overflow-hidden flex items-center justify-center bg-radial-gradient">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                    backgroundSize: "20px 20px"
                  }} />
                  
                  {/* SVG Route Visualization */}
                  <svg className="w-full h-full p-6" viewBox="0 0 300 150">
                    {/* Road Grid */}
                    <line x1="20" y1="40" x2="280" y2="40" stroke="#1f1f1f" strokeWidth="6" strokeDasharray="5,5" />
                    <line x1="20" y1="110" x2="280" y2="110" stroke="#1f1f1f" strokeWidth="6" strokeDasharray="5,5" />
                    <line x1="70" y1="20" x2="70" y2="130" stroke="#1f1f1f" strokeWidth="6" strokeDasharray="5,5" />
                    <line x1="220" y1="20" x2="220" y2="130" stroke="#1f1f1f" strokeWidth="6" strokeDasharray="5,5" />

                    {/* Navigation Path */}
                    <path 
                      d="M 70 110 L 70 40 L 220 40 L 220 60" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="animate-dash"
                      style={{ strokeDasharray: "400", strokeDashoffset: "0" }}
                    />
                    
                    {/* Adopter Start Marker */}
                    <circle cx="70" cy="110" r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="80" y="114" fill="#3b82f6" fontSize="8" fontWeight="bold" fontFamily="monospace">YOU</text>

                    {/* Clinic Destination Marker */}
                    <circle cx="220" cy="60" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="175" y="72" fill="#ef4444" fontSize="8" fontWeight="bold" fontFamily="monospace">PARTNER</text>
                  </svg>

                  {/* Dynamic details overlay badge */}
                  <div className="absolute bottom-3 left-3 bg-neutral-900/90 border border-neutral-800 rounded-lg p-2 text-[10px] space-y-0.5 text-left backdrop-blur-sm">
                    <div className="text-neutral-400 font-medium">🛣️ Distance: <span className="font-semibold text-white">3.1 km</span></div>
                    <div className="text-neutral-400 font-medium">🚗 Duration: <span className="font-semibold text-white">7 mins drive</span></div>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 text-[11px] space-y-2 text-neutral-400 text-left">
                  <div className="flex gap-2">
                    <span className="font-bold text-white">Step 1:</span>
                    <span>Head east from your current location towards Main Blvd (300m).</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-white">Step 2:</span>
                    <span>Turn left at the crossing, continue towards Jubilee Hills Rd. (2.2km).</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-white">Step 3:</span>
                    <span>Target will be on your left, directly opposite the metro gate (600m).</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setDirectionsPartner(null)}
                    className="px-5 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-neutral-300 hover:text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Close Directions
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
