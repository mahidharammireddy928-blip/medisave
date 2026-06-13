/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, 
  Tag, 
  Check, 
  Heart, 
  ShieldAlert, 
  CircleAlert, 
  Save, 
  Trash2,
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useProfile } from "../context/ProfileContext";

// The exact 5 conditions from medicinesData
export const ALL_CONDITIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "Dyslipidemia (High Cholesterol)",
  "Hypothyroidism",
  "Asthma / COPD"
];

interface ProfileViewProps {
  onSaveComplete: () => void;
}

export default function ProfileView({ onSaveComplete }: ProfileViewProps) {
  const { profile, saveProfileAndSync, clearProfileData, isProfileSetup } = useProfile();

  // Local state for the inputs, initialized to any existing profile values or defaults
  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age || "");
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    profile?.conditions || []
  );
  
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter(c => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!age.trim()) {
      setErrorMessage("Please enter your age.");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setErrorMessage("Please enter a valid age (1-120).");
      return;
    }

    // Save profile data
    saveProfileAndSync({
      name: name.trim(),
      age: age.trim(),
      conditions: selectedConditions,
    });

    setShowSuccessBadge(true);
    setTimeout(() => {
      setShowSuccessBadge(false);
      onSaveComplete(); // Navigate back to calculator
    }, 1800);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your local profile data? This will reset all filters to default.")) {
      clearProfileData();
      setName("");
      setAge("");
      setSelectedConditions([]);
      setErrorMessage("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
      id="profile-wrapper"
    >
      {/* Intro Header Card */}
      <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 md:p-8 shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start space-x-4">
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15">
              Secure On-Device Storage
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-2.5 tracking-tight uppercase italic">
              Configure Your Care Profile
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-1.5 leading-relaxed max-w-2xl">
              By personalizing your chronic conditions, MediSave automatically filters and expands relevant active medicine sections on the main dashboard to keep the page focused exclusively on your prescription management.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Profile Configuration Form */}
        <form onSubmit={handleSave} className="md:col-span-8 bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 space-y-6 shadow-xl" id="profile-form">
          <h2 className="text-sm font-semibold tracking-wider text-gray-400 uppercase border-b border-gray-800 pb-2">
            Demographic Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name-input" className="text-xs font-medium text-gray-300 block">Name</label>
              <input
                id="name-input"
                type="text"
                placeholder="e.g., Amit Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="w-full text-xs px-3.5 py-2.5 bg-[#161616] hover:bg-[#1C1C1C] focus:bg-[#161616] text-white rounded-xl border border-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="age-input" className="text-xs font-medium text-gray-300 block">Age</label>
              <input
                id="age-input"
                type="number"
                placeholder="e.g., 54"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="120"
                className="w-full text-xs px-3.5 py-2.5 bg-[#161616] hover:bg-[#1C1C1C] focus:bg-[#161616] text-white rounded-xl border border-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-baseline justify-between border-b border-gray-800 pb-2">
              <label className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Chronic Diagnoses Managed
              </label>
              <span className="text-[10px] text-gray-500 font-mono">Select all that apply</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_CONDITIONS.map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-300"
                        : "bg-[#161616] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Heart className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-gray-500"}`} />
                      <span className="font-medium">{cond}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                      isSelected ? "bg-emerald-500 border-emerald-500 text-black" : "border-gray-700 bg-transparent text-transparent"
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between pt-4 border-t border-gray-800 gap-4">
            <div>
              {errorMessage && (
                <div className="flex items-center space-x-1.5 text-rose-400 text-xs">
                  <CircleAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {showSuccessBadge && (
                <div className="flex items-center space-x-1.5 text-emerald-400 text-xs animate-pulse">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Profile updated! Optimizing layout...</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {isProfileSetup && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Profile</span>
                </button>
              )}
              <button
                type="submit"
                disabled={showSuccessBadge}
                className={`flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 font-bold py-2.5 px-6 rounded-xl text-xs text-black transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/10 cursor-pointer ${
                  showSuccessBadge ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>

        {/* Sidebar Info Card */}
        <div className="md:col-span-4 space-y-4" id="profile-info-column">
          <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-5 shadow-xl space-y-4">
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-gray-500">
              Why Profile Setup?
            </h3>
            
            <div className="space-y-3.5 text-xs text-gray-400">
              <p className="leading-relaxed">
                By default, the MediSave calculator lists all 5 therapeutic chronic medicine segments. While comprehensive, this can distract users who only deal with specific diagnoses.
              </p>
              <p className="leading-relaxed font-semibold text-gray-300">
                Setting up a profile triggers the following smart changes in your workspace:
              </p>
              
              <ul className="space-y-2 pl-1 list-disc list-inside">
                <li>Locks focus onto your personalized chronic care segments.</li>
                <li>Automatically collapses unrelated therapeutic groups.</li>
                <li>Displays visual focus cues highlighting optimization metrics most vital to you.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-start space-x-2.5 pt-3">
              <ShieldAlert className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-gray-500 leading-normal">
                Your credentials and medical variables are stored locally on your own client web sandbox. No third-party network, server databases, or external analytics can map or view your inputs.
              </p>
            </div>
          </div>

          {/* Quick return button */}
          <button
            type="button"
            onClick={onSaveComplete}
            className="w-full bg-[#161616] hover:bg-gray-901 text-gray-300 border border-gray-800 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <span>Skip to Calculator</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
