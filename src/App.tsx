/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pill, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { ProfileProvider } from "./context/ProfileContext";
import Navbar from "./components/Navbar";
import CalculatorView from "./components/CalculatorView";
import ProfileView from "./components/ProfileView";
import LearnFAQView from "./components/LearnFAQView";

function MainApp() {
  const [activeTab, setActiveTab] = useState<"calculator" | "learn" | "profile">("calculator");

  // Handle back button & initial hash matching if custom URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#/profile") {
        setActiveTab("profile");
      } else if (hash === "#/learn") {
        setActiveTab("learn");
      } else {
        setActiveTab("calculator");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    // initial check
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleTabChange = (tab: "calculator" | "learn" | "profile") => {
    setActiveTab(tab);
    // Update hash for nice simulated router support
    if (tab === "profile") {
      window.location.hash = "/profile";
    } else if (tab === "learn") {
      window.location.hash = "/learn";
    } else {
      window.location.hash = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 font-sans antialiased flex flex-col justify-between" id="medisave-app">
      <div>
        {/* Navigation Header */}
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Outer App content wrapper */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 pb-24 lg:pb-12">
          
          <AnimatePresence mode="wait">
            {activeTab === "calculator" && (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Visual Pitch Hero */}
                <div className="mb-8" id="pitch-hero">
                  <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Middle-Class Financial Stewardship</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white mb-2 uppercase italic leading-tight">
                    Stop Overpaying for Chronic Medicines
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
                    Indian families frequently pay an unnecessary brand premium of <strong className="text-white">70%+ on recurring prescription care</strong>. 
                    Configure your therapeutic conditions, check your current remedies, and watch generic equivalence unlock compounding annual capital benefits.
                  </p>
                </div>

                <CalculatorView onNavigateToProfile={() => handleTabChange("profile")} />
              </motion.div>
            )}

            {activeTab === "learn" && (
              <motion.div
                key="learn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <LearnFAQView onReturnToCalculator={() => handleTabChange("calculator")} />
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ProfileView onSaveComplete={() => handleTabChange("calculator")} />
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* FOOTER & CTA BRAND BAR */}
      <footer className="border-t border-gray-800 bg-[#0C0C0C] py-8 text-center" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Pill className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-gray-400">MediSave Healthcare Arbitrage Protocol</span>
            <span>•</span>
            <span>A Pitch Deck Interactive Sandbox</span>
          </div>
          <p className="text-gray-500 text-[10px] leading-relaxed max-w-2xl mx-auto">
            Disclaimer: All database prices listed reflect Indian retail market averages and government Jan Aushadhi central bulk prices. This MVP tool serves educational demonstration purposes. Please consult registered medical specialists before changing medication protocols.
          </p>
          <div className="text-[10px] text-gray-600 font-mono">
            © {new Date().getFullYear()} MediSave Technologies. Developed client-side on secure local environments.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <MainApp />
    </ProfileProvider>
  );
}
