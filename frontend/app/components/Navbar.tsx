"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, ClipboardList, LogOut, LayoutDashboard, Shield, Play, Activity, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [theme, setTheme] = useState("dark");

  // Read local storage on mount
  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem("user_role");
    const storedName = localStorage.getItem("user_name");
    setRole(storedRole);
    setUserName(storedName);

    const cachedTheme = localStorage.getItem("theme") || "dark";
    setTheme(cachedTheme);
    if (cachedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setUserName(null);
    router.push("/");
  };



  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <img
            src="/logo.png"
            alt="Purrfect Match Logo"
            className="h-7 w-7 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <span className="font-bold text-xl tracking-tight text-white">
            Purrfect Match<span className="text-red-500">.ai</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md transition-colors ${
              pathname === "/" ? "text-red-500" : "text-neutral-300 hover:text-white hover:bg-neutral-900"
            }`}
          >
            Home
          </Link>

          <Link
            href="/browse"
            className={`px-3 py-2 rounded-md transition-colors ${
              pathname === "/browse" ? "text-red-500" : "text-neutral-300 hover:text-white hover:bg-neutral-900"
            }`}
          >
            Browse Cats
          </Link>

          <Link
            href="/behaviour"
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              pathname === "/behaviour" ? "text-red-500" : "text-neutral-300 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <Activity className="mr-1.5 h-4 w-4" />
            AI Behavior Hub
          </Link>

          {role === "adopter" && (
            <>
              <Link
                href="/questionnaire"
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  pathname === "/questionnaire" ? "text-red-500" : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <ClipboardList className="mr-1.5 h-4 w-4" />
                Match Test
              </Link>
              <Link
                href="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  pathname === "/dashboard" ? "text-red-500" : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                Adopter Dashboard
              </Link>
            </>
          )}

          {role === "shelter" && (
            <Link
              href="/shelter"
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                pathname === "/shelter" ? "text-red-500" : "text-neutral-300 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Shield className="mr-1.5 h-4 w-4" />
              Shelter Control
            </Link>
          )}

          {role && (
            <Link
              href="/profile"
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                pathname === "/profile" ? "text-red-500" : "text-neutral-300 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <User className="mr-1.5 h-4 w-4" />
              Profile
            </Link>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 hover:text-white text-neutral-400 transition-colors cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {theme === "light" ? (
              <Moon className="h-3.5 w-3.5" />
            ) : (
              <Sun className="h-3.5 w-3.5" />
            )}
          </button>

          {role ? (
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline-block text-xs text-neutral-400">
                Hi, <span className="font-semibold text-white">{userName}</span> ({role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 transition-all shadow-md shadow-red-600/10 cursor-pointer"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
