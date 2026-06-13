/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pill, User, Heart, HelpCircle, Activity } from "lucide-react";
import { useProfile } from "../context/ProfileContext";

interface NavbarProps {
  activeTab: "calculator" | "learn" | "profile";
  onTabChange: (tab: "calculator" | "learn" | "profile") => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { profile, isProfileSetup } = useProfile();

  // Get initials of name (e.g., "Amit Sharma" -> "AS")
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .trim()
      .split(/\s+/)
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="border-b border-gray-800 bg-[#0A0A0A] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand Title */}
        <div 
          onClick={() => onTabChange("calculator")}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="bg-emerald-500 text-black p-2 rounded-lg flex items-center justify-center font-bold italic shadow-lg shadow-emerald-500/10">
            <Pill className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-xl tracking-tight uppercase italic text-white hover:text-emerald-400 transition-colors">
                MediSave
              </span>
              <span className="hidden xs:inline-block text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                MVP PITCH DEMO
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">Chronic Care Prescription Optimizer</p>
          </div>
        </div>

        {/* Center / Right Links */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          <button 
            onClick={() => onTabChange("calculator")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "calculator" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Calculator</span>
          </button>
          
          <button 
            onClick={() => onTabChange("learn")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "learn" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">FAQ & Education</span>
            <span className="xs:hidden">FAQ</span>
          </button>

          <button 
            onClick={() => onTabChange("profile")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center space-x-1.5 relative ${
              activeTab === "profile" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
            {isProfileSetup && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0A0A0A]" />
            )}
          </button>

          {/* User badge display if configured */}
          {isProfileSetup && profile && (
            <div 
              onClick={() => onTabChange("profile")}
              className="hidden md:flex items-center space-x-2 pl-3 border-l border-gray-800 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold ring-1 ring-emerald-500/30 group-hover:bg-emerald-600/30 group-hover:text-white transition">
                {getInitials(profile.name)}
              </div>
              <div className="text-left text-[11px] leading-tight">
                <p className="text-gray-200 font-semibold truncate max-w-[100px] group-hover:text-emerald-400 transition">{profile.name}</p>
                <p className="text-gray-500">{profile.conditions.length} {profile.conditions.length === 1 ? "Condition" : "Conditions"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
