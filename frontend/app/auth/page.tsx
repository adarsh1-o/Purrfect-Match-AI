"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser, signupUser, requestPasswordReset, submitPasswordReset } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Heart, User, ClipboardCheck, ArrowRight, RefreshCw, KeyRound, Sparkles, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState<"none" | "forgot" | "reset">("none");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("adopter"); // adopter or shelter

  // Status check state
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("auth_token");
    const cachedRole = localStorage.getItem("user_role");
    const cachedName = localStorage.getItem("user_name");
    if (token && cachedRole && cachedName) {
      setCurrentUser({ name: cachedName, role: cachedRole });
    }
  }, []);

  const playMeowSound = () => {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/87/87-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked:", e));
    } catch (e) {
      console.log(e);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const user = await loginUser(email, password);
        setLoading(false);
        playMeowSound();
        if (user.role === "shelter") {
          router.push("/shelter");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Sign up
        if (!name.trim()) throw new Error("Please enter your name.");
        await signupUser(name, email, role, password);
        
        // Log in immediately after successful signup
        const loggedUser = await loginUser(email, password);
        setLoading(false);
        playMeowSound();
        if (loggedUser.role === "shelter") {
          router.push("/shelter");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    window.location.reload();
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setForgotMode("reset");
      alert("A 6-digit verification code has been dispatched to your email address!");
    } catch (err: any) {
      setError(err.message || "Failed to request password reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await submitPasswordReset(email, resetCode, newPassword);
      alert("Your password has been successfully reset! You can now sign in.");
      setForgotMode("none");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Invalid or expired reset code.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full z-10">
      <div className="glow-bg" />

      <div className="w-full">
        {currentUser ? (
          /* Logged In Workspace Redirect State */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl border border-neutral-800 p-8 text-center space-y-6"
          >
            <div className="relative flex items-center justify-center h-16 w-16 mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Active Session Detected</h2>
              <p className="text-xs text-neutral-400">
                You are currently signed in as <span className="font-semibold text-white">{currentUser.name}</span> ({currentUser.role}).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => router.push(currentUser.role === "shelter" ? "/shelter" : "/dashboard")}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Access Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-neutral-950 border border-neutral-800 hover:bg-neutral-900 text-neutral-300 font-semibold rounded-lg text-xs cursor-pointer"
              >
                Sign Out Session
              </button>
            </div>
          </motion.div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="glass-card rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
            {/* Form Mode Tabs */}
            <div className="flex border-b border-neutral-900">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isLogin
                    ? "bg-neutral-900/60 text-white border-b-2 border-red-500"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  !isLogin
                    ? "bg-neutral-900/60 text-white border-b-2 border-red-500"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Register
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-4">
                  <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-75 group-hover:scale-95 transition-transform duration-500" />
                  <img
                    src="/logo.png"
                    alt="Purrfect Match Logo"
                    className="theme-logo-dark-mode relative h-20 w-20 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-red-500/30"
                  />
                  <img
                    src="/logo-dark.png"
                    alt="Purrfect Match Logo"
                    className="theme-logo-light-mode relative h-20 w-20 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-red-500/30"
                  />
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  {isLogin ? "Welcome Back to Paws" : "Join the Kizuna Paws Network"}
                </h2>
                <p className="text-xs text-neutral-500 mt-1.5">
                  {isLogin
                    ? "Log in to check match reports, view dashboards, and record behavior sessions."
                    : "Create an account to register cats, customize companion matches, or request adoptions."}
                </p>
              </div>

              {forgotMode === "forgot" ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-950/20 border border-red-500/25 rounded-lg text-xs text-red-400">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="adopter@kizunapaws.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-2.5 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full py-3 bg-gradient-to-r from-red-650 to-red-550 hover:from-red-555 hover:to-red-455 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-30 flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode("none");
                      setError(null);
                    }}
                    className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300 font-semibold mt-2 cursor-pointer bg-transparent border-0"
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : forgotMode === "reset" ? (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-950/20 border border-red-500/25 rounded-lg text-xs text-red-400">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full py-2.5 px-3 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-neutral-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      6-Digit Reset Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full py-2.5 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500 text-center tracking-widest font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full py-2.5 pl-9 pr-10 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                      />
                      <KeyRound className="absolute left-3 top-3.5 h-3.5 w-3.5 text-neutral-500" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full py-3 bg-gradient-to-r from-red-650 to-red-550 hover:from-red-555 hover:to-red-455 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-30 flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <span>Update Password & Log In</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode("none");
                      setError(null);
                    }}
                    className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300 font-semibold mt-2 cursor-pointer bg-transparent border-0"
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : (
                <>
                  {error && (
                    <div className="p-3 bg-red-950/20 border border-red-500/25 rounded-lg text-xs text-red-400">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="signup-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Your Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full py-2.5 pl-9 pr-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                          />
                          <User className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                        </div>
                      </div>

                      {/* Custom Dual Role Card Selection */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Select Account Role
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div
                            onClick={() => setRole("adopter")}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              role === "adopter"
                                ? "bg-red-950/20 border-red-500/40 text-white"
                                : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                            }`}
                          >
                            <span className="block text-xs font-bold">Companion Adopter</span>
                            <span className="block text-[9px] text-neutral-500 mt-1 leading-normal">
                              Take matchmaking tests, upload videos, and track requests.
                            </span>
                          </div>
                          <div
                            onClick={() => setRole("shelter")}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              role === "shelter"
                                ? "bg-red-950/20 border-red-500/40 text-white"
                                : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                            }`}
                          >
                            <span className="block text-xs font-bold">Shelter Attendant</span>
                            <span className="block text-[9px] text-neutral-500 mt-1 leading-normal">
                              Register intakes, track behavior logs, and approve adoptions.
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="adopter@kizunapaws.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 px-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-2.5 pl-9 pr-10 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-neutral-300 focus:outline-none focus:border-red-500"
                    />
                    <KeyRound className="absolute left-3 top-3.5 h-3.5 w-3.5 text-neutral-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    </div>
                    {isLogin && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotMode("forgot");
                            setError(null);
                          }}
                          className="text-[11px] text-red-500 hover:text-red-400 font-semibold cursor-pointer bg-transparent border-0"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-red-650 to-red-550 hover:from-red-550 hover:to-red-450 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-red-600/10"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 fill-white" />
                        <span>{isLogin ? "Sign In Securely" : "Create My Profile"}</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
