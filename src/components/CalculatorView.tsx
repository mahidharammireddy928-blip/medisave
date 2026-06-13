/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { 
  Pill, 
  Activity, 
  Search, 
  Check, 
  Plus, 
  Minus, 
  TrendingDown, 
  Heart, 
  AlertCircle, 
  FileText, 
  Share2, 
  Undo,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Info,
  ChevronUp,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { medicinesData } from "../data/medicines";
import { useProfile } from "../context/ProfileContext";
import { MedicineEntry, SelectedMedicineState, CalculatedItem, SavingsStats } from "../types";

const ALL_CONDITIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "Dyslipidemia (High Cholesterol)",
  "Hypothyroidism",
  "Asthma / COPD"
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

// Help icons list group decoration inside Itemized card
function IconsGroup() {
  return (
    <div className="flex -space-x-1 overflow-hidden py-0.5">
      <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#161616] bg-emerald-500 flex items-center justify-center">
        <ShieldCheck className="w-2.5 h-2.5 text-black" />
      </div>
      <div className="inline-block h-5 w-5 rounded-full ring-2 ring-[#161616] bg-emerald-400/20 flex items-center justify-center">
        <TrendingDown className="w-2.5 h-2.5 text-emerald-400" />
      </div>
    </div>
  );
}

interface CalculatorViewProps {
  onNavigateToProfile: () => void;
}

export default function CalculatorView({ onNavigateToProfile }: CalculatorViewProps) {
  const { profile, isProfileSetup } = useProfile();

  // --- 1. INITIAL STATE & PROFILE INFLUENCE ---
  // When high-contrast profile is active, we default selected conditions to their diagnosed conditions.
  // Otherwise, default to [Diabetes, Hypertension, Hypothyroidism] (the preselected 4 meds targets).
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicineState>({});
  
  // Accordion expands: map of { [conditionName]: boolean }
  const [expandedConditions, setExpandedConditions] = useState<{ [key: string]: boolean }>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  // Load defaults or profile states upon mount/profile changes
  useEffect(() => {
    if (isProfileSetup && profile) {
      // Set to current diagnosed conditions to automatically pre-filter
      setSelectedConditions(profile.conditions);
      
      // Expand diagnosed conditions by default other collapsed
      const expanded: { [key: string]: boolean } = {};
      ALL_CONDITIONS.forEach(cond => {
        expanded[cond] = profile.conditions.includes(cond);
      });
      setExpandedConditions(expanded);

      // Pre-select medications matching their diagnostic profile conditions to supply a nice initialized state
      const matchingMeds: SelectedMedicineState = {};
      medicinesData.forEach(med => {
        // Pre-select if condition matches.
        // Let's pre-load default medications that match user profile conditions
        const isPredefinedDemoMed = [
          "telma-40",
          "amlong-5",
          "glycomet-500",
          "thyronorm-50"
        ].includes(med.id);

        if (profile.conditions.includes(med.condition) && isPredefinedDemoMed) {
          matchingMeds[med.id] = { selected: true, quantity: 1 };
        }
      });
      setSelectedMedicines(matchingMeds);
    } else {
      // DEFAULT / FIRST TIME GUEST VIEW
      setSelectedConditions(["Type 2 Diabetes", "Hypertension", "Hypothyroidism"]);
      
      // Default all 5 expanded
      const expanded: { [key: string]: boolean } = {};
      ALL_CONDITIONS.forEach(cond => {
        expanded[cond] = true;
      });
      setExpandedConditions(expanded);

      // Pre-select 4 commonly-used prescription items
      setSelectedMedicines({
        "telma-40": { selected: true, quantity: 1 },
        "amlong-5": { selected: true, quantity: 1 },
        "glycomet-500": { selected: true, quantity: 1 },
        "thyronorm-50": { selected: true, quantity: 1 }
      });
    }
  }, [profile, isProfileSetup]);

  // --- ACTIONS ---
  const toggleCondition = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter(c => c !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
      // Auto expand when checked
      setExpandedConditions(prev => ({ ...prev, [condition]: true }));
    }
  };

  const toggleAccordion = (condition: string) => {
    setExpandedConditions(prev => ({
      ...prev,
      [condition]: !prev[condition]
    }));
  };

  const toggleMedicine = (id: string) => {
    setSelectedMedicines(prev => {
      const current = prev[id] || { selected: false, quantity: 1 };
      return {
        ...prev,
        [id]: {
          ...current,
          selected: !current.selected
        }
      };
    });
  };

  const adjustQuantity = (id: string, amount: number) => {
    setSelectedMedicines(prev => {
      const current = prev[id] || { selected: false, quantity: 1 };
      const newQty = Math.max(1, Math.min(20, current.quantity + amount));
      return {
        ...prev,
        [id]: {
          ...current,
          quantity: newQty
        }
      };
    });
  };

  // Condition Section Select All / Clear All toggles as required by Phase 2 (11.3)
  const selectAllInCondition = (condition: string) => {
    setSelectedMedicines(prev => {
      const updated = { ...prev };
      const condMeds = medicinesData.filter(m => m.condition === condition);
      condMeds.forEach(m => {
        updated[m.id] = {
          selected: true,
          quantity: prev[m.id]?.quantity || 1
        };
      });
      return updated;
    });
  };

  const clearAllInCondition = (condition: string) => {
    setSelectedMedicines(prev => {
      const updated = { ...prev };
      const condMeds = medicinesData.filter(m => m.condition === condition);
      condMeds.forEach(m => {
        if (updated[m.id]) {
          updated[m.id] = {
            ...updated[m.id],
            selected: false
          };
        }
      });
      return updated;
    });
  };

  const selectAllFiltered = (filtered: MedicineEntry[]) => {
    setSelectedMedicines(prev => {
      const updated = { ...prev };
      filtered.forEach(m => {
        updated[m.id] = {
          selected: true,
          quantity: prev[m.id]?.quantity || 1
        };
      });
      return updated;
    });
  };

  const deselectAllFiltered = (filtered: MedicineEntry[]) => {
    setSelectedMedicines(prev => {
      const updated = { ...prev };
      filtered.forEach(m => {
        updated[m.id] = {
          selected: false,
          quantity: prev[m.id]?.quantity || 1
        };
      });
      return updated;
    });
  };

  const resetAll = () => {
    setSelectedConditions([]);
    setSelectedMedicines({});
    setSearchQuery("");
  };

  const loadDemoDefaults = () => {
    setSelectedConditions(["Type 2 Diabetes", "Hypertension", "Hypothyroidism"]);
    setSelectedMedicines({
      "telma-40": { selected: true, quantity: 1 },
      "amlong-5": { selected: true, quantity: 1 },
      "glycomet-500": { selected: true, quantity: 1 },
      "thyronorm-50": { selected: true, quantity: 1 }
    });
    // Expand all
    const expanded: { [key: string]: boolean } = {};
    ALL_CONDITIONS.forEach(cond => {
      expanded[cond] = true;
    });
    setExpandedConditions(expanded);
  };

  // --- DATA FILTERING ---
  const filteredMedicines = useMemo(() => {
    return medicinesData.filter(med => {
      const conditionMatches = selectedConditions.length === 0 || selectedConditions.includes(med.condition);
      const queryMatches = 
        searchQuery === "" ||
        med.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.condition.toLowerCase().includes(searchQuery.toLowerCase());
      
      return conditionMatches && queryMatches;
    });
  }, [selectedConditions, searchQuery]);

  // Selected meds mapped with calculations
  const selectedList = useMemo<CalculatedItem[]>(() => {
    return medicinesData
      .filter(med => selectedMedicines[med.id]?.selected)
      .map(med => {
        const qty = selectedMedicines[med.id]?.quantity || 1;
        const brandMid = ((med.brandCostMin + med.brandCostMax) / 2) * qty;
        const genericMid = ((med.genericCostMin + med.genericCostMax) / 2) * qty;
        const savings = brandMid - genericMid;
        return {
          ...med,
          quantity: qty,
          brandMid,
          genericMid,
          savings,
        };
      });
  }, [selectedMedicines]);

  // --- SAVINGS STATS ---
  const stats = useMemo<SavingsStats>(() => {
    let totalCurrentMonthly = 0;
    let totalOptimizedMonthly = 0;

    selectedList.forEach(item => {
      totalCurrentMonthly += item.brandMid;
      totalOptimizedMonthly += item.genericMid;
    });

    const monthlySavings = totalCurrentMonthly - totalOptimizedMonthly;
    const savingsPercent = totalCurrentMonthly > 0 ? (monthlySavings / totalCurrentMonthly) * 100 : 0;
    const annualSavings = monthlySavings * 12;

    return {
      totalCurrentMonthly,
      totalOptimizedMonthly,
      monthlySavings,
      savingsPercent,
      annualSavings
    };
  }, [selectedList]);

  // Dynamic medicine counts per condition in database
  const conditionMedCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    ALL_CONDITIONS.forEach(cond => {
      counts[cond] = medicinesData.filter(m => m.condition === cond).length;
    });
    return counts;
  }, []);

  // Selected drug counts per condition for subheader stats
  const conditionSelectedCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    ALL_CONDITIONS.forEach(cond => {
      counts[cond] = selectedList.filter(item => item.condition === cond).length;
    });
    return counts;
  }, [selectedList]);

  // --- SHARE text ---
  const shareText = useMemo(() => {
    if (selectedList.length === 0) return "";
    let txt = `🩺 *MediSave Chronic Budget Analysis & Substitution Guide*:\n\n`;
    selectedList.forEach(item => {
      txt += `• *Brand: ${item.brandName}* x${item.quantity} month pack (Avg. ₹${item.brandMid}/mo) \n  ↳ Switch to Generic: *${item.genericName}* (Avg. ₹${item.genericMid}/mo) | Saved ~₹${item.savings}/mo\n\n`;
    });
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `📉 *Current Brand Monthly Bill*: ${formatCurrency(stats.totalCurrentMonthly)}\n`;
    txt += `🌱 *Optimized Generic Monthly Bill*: ${formatCurrency(stats.totalOptimizedMonthly)}\n`;
    txt += `💰 *Monthly Savings*: ${formatCurrency(stats.monthlySavings)} (${stats.savingsPercent.toFixed(0)}% saved)\n`;
    txt += `🔥 *Annual Savings Projection: ${formatCurrency(stats.annualSavings)}* saved this year!\n\n`;
    txt += `Note: Show this list to your registered medical practitioner to ask about generic equivalence substitution. Let's make care affordable!`;
    return txt;
  }, [selectedList, stats]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedMessage(true);
    setTimeout(() => {
      setCopiedMessage(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="calculator-layout-v2">
      {/* LEFT COLUMN: CONTROLS & LISTS (7/12 Width) */}
      <div className="lg:col-span-7 space-y-6" id="calculator-inputs">
        
        {/* Profile Alert banner if setup */}
        {isProfileSetup && profile && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-950/20 border border-emerald-500/25 rounded-2xl p-4 flex items-center justify-between"
            id="profile-active-banner"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500 text-black p-1.5 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-emerald-300 font-bold">Diagnosed Profile Active for {profile.name} (Age {profile.age})</p>
                <p className="text-emerald-400/80">Showing relevant sections based on your diagnosed conditions: <span className="font-semibold">{profile.conditions.join(", ")}</span>.</p>
              </div>
            </div>
            <button 
              onClick={onNavigateToProfile}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-semibold px-2.5 py-1"
            >
              Edit
            </button>
          </motion.div>
        )}

        {/* STEP 1: CONDITION SELECTOR */}
        <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 shadow-2xl" id="step-conditions">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-display font-bold uppercase tracking-tight text-white flex items-center space-x-2">
                <span className="bg-gray-800/60 text-gray-300 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold font-mono">1</span>
                <span>Therapeutic Care Segments</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Toggle filter categories to list candidate prescription brands</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedConditions(ALL_CONDITIONS)}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/25 transition font-medium cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={() => {
                  setSelectedConditions([]);
                  setSelectedMedicines({});
                }}
                className="text-[10px] text-gray-400 hover:text-gray-200 bg-gray-800 px-2 py-1 rounded transition font-medium cursor-pointer"
              >
                Clear Selection
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {ALL_CONDITIONS.map((cond) => {
              const isSelected = selectedConditions.includes(cond);
              const count = conditionMedCounts[cond] || 0;
              const matchesProfile = isProfileSetup && profile?.conditions.includes(cond);

              return (
                <button
                  key={cond}
                  onClick={() => toggleCondition(cond)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer flex items-center space-x-2 relative ${
                    isSelected 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500"
                      : "bg-[#161616] text-gray-450 border-gray-800 hover:border-gray-700 hover:text-gray-200"
                  }`}
                  style={{ minHeight: '38px' }}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400 fill-emerald-500/10" : "text-gray-500"}`} />
                  <span>{cond}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.25 rounded ${
                    isSelected ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-800 text-gray-500"
                  }`}>
                    {count}
                  </span>
                  {matchesProfile && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#0A0A0A]" title="Diagnosed" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: SEARCH & GROUPED MEDICINES LIST WITH ACCORDIONS */}
        <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 shadow-2xl animate-fade-in" id="step-medicines">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-display font-bold uppercase tracking-tight text-white flex items-center space-x-2">
                <span className="bg-gray-800/60 text-gray-300 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold font-mono">2</span>
                <span>Select Your Medications</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Define your exact treatment counts. Adjust monthly quantities.</p>
            </div>
            
            {/* Search Input Bar */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search Glycomet, Telma..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8.5 pr-3 py-2 bg-[#161616] hover:bg-[#1C1C1C] focus:bg-[#161616] text-white rounded-xl border border-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {filteredMedicines.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-gray-800 rounded-2xl bg-[#0F0F0F]/60">
              <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-300 text-xs font-semibold mb-1">No medicines match your specified conditions.</p>
              <p className="text-gray-500 text-[11px] mb-4">Toggle additional therapy categories above, clear your filters, or load the demo.</p>
              
              <div className="flex justify-center flex-wrap gap-2">
                <button 
                  onClick={resetAll}
                  className="text-xs text-gray-300 font-medium px-4 py-2 border border-gray-800 rounded-xl hover:bg-gray-800 transition bg-[#161616] cursor-pointer"
                >
                  Clear Filters
                </button>
                <button 
                  onClick={loadDemoDefaults}
                  className="text-xs text-black bg-emerald-500 font-bold px-4 py-2 rounded-xl hover:bg-emerald-400 transition cursor-pointer"
                >
                  Load Demo Defaults
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* General select all shown on top bar */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-gray-800 pb-2">
                <span>Displaying {filteredMedicines.length} formulations</span>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => selectAllFiltered(filteredMedicines)}
                    className="text-emerald-400 hover:text-emerald-300 bg-transparent border-0 cursor-pointer font-semibold text-[11px]"
                  >
                    Select All Shown
                  </button>
                  <span className="text-gray-800">|</span>
                  <button 
                    onClick={() => deselectAllFiltered(filteredMedicines)}
                    className="text-rose-400 hover:text-rose-300 bg-transparent border-0 cursor-pointer font-semibold text-[11px]"
                  >
                    Deselect All Shown
                  </button>
                </div>
              </div>

              {/* Accordion Layout divided by Condition */}
              {ALL_CONDITIONS.filter(cond => {
                // Only show condition group if either no active condition filters or it is matched
                if (selectedConditions.length > 0 && !selectedConditions.includes(cond)) return false;
                // Also screen if search filter returns empty for this category
                return filteredMedicines.some(m => m.condition === cond);
              }).map((cond) => {
                const isExpanded = expandedConditions[cond] !== false; // Active standard unless explicit false
                const condMeds = filteredMedicines.filter(m => m.condition === cond);
                const selectedCount = conditionSelectedCounts[cond] || 0;

                return (
                  <div key={cond} className="border border-gray-800 rounded-xl overflow-hidden bg-[#121212]/30" id={`accordion-${cond.toLowerCase().replace(/\s+/g, '-')}`}>
                    {/* ACCORDION HEADER BLOCK */}
                    <div 
                      onClick={() => toggleAccordion(cond)}
                      className="w-full text-left p-4 bg-[#141414] hover:bg-[#1B1B1B] transition-colors flex items-center justify-between cursor-pointer select-none border-b border-gray-800/50"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Activity className={`w-4.5 h-4.5 shrink-0 ${selectedCount > 0 ? "text-emerald-400 animate-pulse" : "text-gray-500"}`} />
                        <div>
                          <span className="font-display font-extrabold text-xs tracking-wider uppercase text-gray-300">{cond}</span>
                          <span className="text-[10px] text-gray-500 block">
                            {selectedCount > 0 ? (
                              <span className="text-emerald-400 font-medium">{selectedCount} Selected</span>
                            ) : (
                              <span>0 of {condMeds.length} Selected</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3.5 pb-0.5">
                        {/* Sub Toggle Buttons inside Category Header space */}
                        <div 
                          className="hidden xs:flex items-center space-x-2 pt-0.5"
                          onClick={(e) => e.stopPropagation()} // Keep collapse from firing
                        >
                          <button
                            type="button"
                            onClick={() => selectAllInCondition(cond)}
                            className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 px-2 py-0.75 rounded border border-emerald-500/10 cursor-pointer"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => clearAllInCondition(cond)}
                            className="text-[9px] font-bold text-gray-500 hover:text-gray-300 bg-gray-900 px-2 py-0.75 rounded border border-gray-800 cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                        
                        <div className="text-gray-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </div>
                      </div>
                    </div>

                    {/* ACCORDION COLLAPSIBLE CONTENT BLOCK */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-[#0A0A0A]/40"
                        >
                          <div className="p-3.5 space-y-2">
                            {condMeds.map((med) => {
                              const medState = selectedMedicines[med.id] || { selected: false, quantity: 1 };
                              const isSelected = medState.selected;
                              const qty = medState.quantity;

                              const brandMid = (med.brandCostMin + med.brandCostMax) / 2;
                              const genericMid = (med.genericCostMin + med.genericCostMax) / 2;
                              const medSavingsPercent = ((brandMid - genericMid) / brandMid) * 100;

                              return (
                                <div 
                                  key={med.id}
                                  onClick={() => toggleMedicine(med.id)}
                                  className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                    isSelected 
                                      ? "border-emerald-500/80 bg-emerald-500/5 shadow-inner" 
                                      : "border-gray-801 bg-[#161616] hover:border-gray-700 hover:bg-[#1A1A1A]"
                                  }`}
                                >
                                  {/* Left side details */}
                                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                                    <div className="mt-0.5 flex items-center justify-center">
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        isSelected ? "bg-emerald-500 border-emerald-500 text-black" : "border-gray-600 bg-transparent text-transparent"
                                      }`}>
                                        <Check className="w-3 stroke-[3.5] h-3" />
                                      </div>
                                    </div>

                                    <div className="min-w-0 space-y-0.5">
                                      <div className="flex flex-wrap items-baseline gap-x-2">
                                        <span className="font-bold text-sm text-white truncate">
                                          {med.brandName}
                                        </span>
                                        <span className="text-[9px] text-rose-450 bg-rose-500/10 px-2 py-0.25 rounded font-bold border border-rose-500/20 uppercase tracking-wider">
                                          Brand
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <span className="text-[10px] text-gray-500 font-mono leading-none">
                                          Generic Equivalent:
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.25 rounded font-mono leading-none">
                                          {med.genericName}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right side pricing indicators & quantity inputs */}
                                  <div 
                                    className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-gray-800"
                                    onClick={(e) => e.stopPropagation()} // Stop toggleMedicine click bubbling
                                  >
                                    <div className="text-left sm:text-right space-y-0.5">
                                      <div className="flex items-center space-x-1 sm:justify-end">
                                        <span className="text-[10px] text-gray-500 line-through">
                                          {formatCurrency(brandMid)}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-400 font-mono">
                                          {formatCurrency(brandMid)}
                                        </span>
                                        <span className="text-[10px] text-gray-550">/mo</span>
                                      </div>
                                      <div className="flex items-center space-x-1 sm:justify-end">
                                        <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                                          Save {medSavingsPercent.toFixed(0)}%
                                        </span>
                                        <span className="text-xs font-bold text-emerald-400 font-mono">
                                          {formatCurrency(genericMid)}
                                        </span>
                                        <span className="text-[10px] text-gray-550">/mo</span>
                                      </div>
                                    </div>

                                    {/* Month Packs quantity manager */}
                                    <div className="flex items-center space-x-1 bg-gray-905 border border-gray-800 rounded-lg p-0.5">
                                      <button
                                        type="button"
                                        onClick={() => adjustQuantity(med.id, -1)}
                                        disabled={!isSelected}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition ${
                                          isSelected ? "hover:bg-gray-800 text-gray-300 active:bg-gray-700" : "text-gray-700 cursor-not-allowed"
                                        }`}
                                        title="Decrease Quantity"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className={`w-8 text-center text-xs font-black font-mono ${isSelected ? "text-white" : "text-gray-750"}`}>
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => adjustQuantity(med.id, 1)}
                                        disabled={!isSelected}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition ${
                                          isSelected ? "hover:bg-gray-800 text-gray-300 active:bg-gray-700" : "text-gray-700 cursor-not-allowed"
                                        }`}
                                        title="Increase Quantity"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 3: ITEMIZED BREAKDOWN ROW-BY-ROW TABLE */}
        {selectedList.length > 0 && (
          <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 shadow-2xl animate-fade-in" id="itemized-breakdown">
            <h2 className="text-base font-display font-bold uppercase tracking-tight text-white mb-2 flex items-center space-x-2">
              <FileText className="w-4.5 h-4.5 text-emerald-400" />
              <span>Generic Substitution Plan</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4.5">Share this side-by-side equivalent breakdown directly with your diagnostic medical practitioner.</p>
            
            <div className="overflow-x-auto rounded-lg border border-gray-800/80">
              <table className="w-full text-left text-xs border-collapse divide-y divide-gray-800">
                <thead>
                  <tr className="bg-[#141414] text-[9px] tracking-wider uppercase font-bold text-gray-450">
                    <th className="py-3 px-3.5">Branded Medication</th>
                    <th className="py-3 px-3.5">Bio-Equivalent Generic Alternative</th>
                    <th className="py-3 px-3 text-right">Brand Cost</th>
                    <th className="py-3 px-3 text-right">Generic Cost</th>
                    <th className="py-3 px-3.5 text-right">Monthly Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850 bg-transparent/40">
                  {selectedList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-901 transition-colors">
                      <td className="py-3.5 px-3.5">
                        <span className="font-bold text-white block">{item.brandName}</span>
                        <span className="text-[10px] text-gray-500 font-mono">Qty: {item.quantity} month strip</span>
                      </td>
                      <td className="py-3.5 px-3.5">
                        <span className="font-semibold text-emerald-400 font-mono block">{item.genericName}</span>
                        <span className="text-[9px] text-emerald-500/85 font-semibold bg-emerald-500/10 py-0.25 px-1.5 rounded-full w-fit block mt-1">Chemically Identical</span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-gray-450">
                        {formatCurrency(item.brandMid)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-450 bg-emerald-500/5">
                        {formatCurrency(item.genericMid)}
                      </td>
                      <td className="py-3.5 px-3.5 text-right font-mono font-extrabold text-emerald-450">
                        {formatCurrency(item.brandMid - item.genericMid)}
                        <span className="text-[10px] block font-semibold text-emerald-500/60 leading-tight">-{(((item.brandMid - item.genericMid) / item.brandMid) * 100).toFixed(0)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center bg-[#141414] rounded-xl p-4 gap-3 border border-gray-800">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <IconsGroup />
                <span>Optimize recurring medical bills permanently via generic substitutions!</span>
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition duration-150 cursor-pointer shadow-sm active:bg-emerald-800 border-0"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 mr-0.5 fill-black" />
                    <span>Copied Analysis!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-0.5" />
                    <span>Copy Prescription Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: STICKY RESULTS PANEL (5/12 Width) */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6" id="calculator-sidebar">
        
        {/* SAVINGS SUMMARY CARD */}
        <div className="bg-gradient-to-br from-[#121212] to-[#080808] text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-emerald-500/20" id="savings-widget">
          
          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-555/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-4">
            <div>
              <h3 className="text-gray-450 text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 mb-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Projected Annual Household Savings</span>
              </h3>
              
              {selectedList.length === 0 ? (
                <div className="space-y-1.5 py-2">
                  <p className="text-3xl font-display font-black tracking-tight text-gray-500">NO DRUGS SELECTED</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Check your recurring prescriptions on the left to gauge combined savings instantly.
                  </p>
                  <button
                    onClick={loadDemoDefaults}
                    className="mt-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2 px-4.5 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition cursor-pointer"
                  >
                    Preload Pitch Demo Stack
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* ANIMATED BIG NUMBER (Phase 2 requirement: animations on recalculations) */}
                  <div className="flex items-baseline gap-1" key={stats.annualSavings}>
                    <motion.span 
                      initial={{ scale: 0.96 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="text-4xl sm:text-5xl font-display font-black text-white tracking-tighter"
                    >
                      {formatCurrency(stats.annualSavings)}
                    </motion.span>
                    <span className="text-emerald-400 text-lg sm:text-xl font-bold font-display ml-1.5">/ yr</span>
                  </div>
                  
                  <p className="text-xs text-gray-400 leading-normal flex items-start gap-1.5 pt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      India average brand markup penalty slashed. This saves <strong className="text-emerald-400 font-bold">{stats.savingsPercent.toFixed(0)}%</strong> of your chronic healthcare budget.
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Split Progress Meter */}
            <div className="border-t border-gray-800/80 pt-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Prescription Cost Comparison</span>
              
              <div className="h-2 w-full bg-gray-901 rounded-full overflow-hidden flex">
                {selectedList.length === 0 ? (
                  <div className="w-full bg-gray-805" />
                ) : (
                  <>
                    <motion.div 
                      className="bg-rose-500 h-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.totalOptimizedMonthly / stats.totalCurrentMonthly) * 100}%` }}
                      transition={{ duration: 0.4 }}
                      title="Optimized Generic Cost Portion"
                    />
                    <motion.div 
                      className="bg-emerald-500 h-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${((stats.totalCurrentMonthly - stats.totalOptimizedMonthly) / stats.totalCurrentMonthly) * 100}%` }}
                      transition={{ duration: 0.4 }}
                      title="Slashed Brand Markup Overhead Portion"
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0A0A0A] p-3 rounded-xl border border-gray-900">
                  <span className="text-gray-500 text-[10px] block uppercase font-mono">Current Brand Bill</span>
                  <span className="font-bold text-sm text-rose-450 font-mono mt-0.5 block">
                    {selectedList.length === 0 ? "₹0" : formatCurrency(stats.totalCurrentMonthly)}
                    <span className="text-[10px] font-normal text-gray-550"> /mo</span>
                  </span>
                </div>
                <div className="bg-[#0A0A0A] p-3 rounded-xl border border-gray-900">
                  <span className="text-gray-500 text-[10px] block uppercase font-mono">Optimized Generic</span>
                  <span className="font-bold text-sm text-emerald-400 font-mono mt-0.5 block">
                    {selectedList.length === 0 ? "₹0" : formatCurrency(stats.totalOptimizedMonthly)}
                    <span className="text-[10px] font-normal text-gray-550"> /mo</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Future Projection block (5 Years) */}
            {selectedList.length > 0 && (
              <div className="bg-[#0A0A0A]/70 p-4 rounded-xl border border-gray-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Compounded Savings Growth</span>
                  <span className="text-[9px] text-gray-500 bg-[#161616] py-0.5 px-2 rounded-full font-mono font-semibold">12% Inflation Penalty</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">1-Year Household Savings</span>
                    <span className="font-semibold text-white font-mono">{formatCurrency(stats.annualSavings)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">3-Year Household Savings</span>
                    <span className="font-semibold text-amber-550 font-mono">{formatCurrency(stats.annualSavings * 3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">5-Year Household Savings</span>
                    <span className="font-black text-emerald-400 text-sm font-mono">{formatCurrency(stats.annualSavings * 5)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-gray-550 border-t border-gray-801 pt-2 leading-relaxed">
                  💪 Preserving <strong className="text-gray-300 font-semibold">{formatCurrency(stats.annualSavings * 5)}</strong> in 5 years provides enough capital to fund children's secondary tuition, cover home insurance, or clear consumer micro-loans.
                </div>
              </div>
            )}

            {/* General Actions */}
            <div className="pt-2">
              {selectedList.length === 0 ? (
                <button 
                  onClick={loadDemoDefaults}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1 border-0 cursor-pointer shadow-md"
                >
                  <Coins className="w-3.5 h-3.5 text-black" />
                  <span>Preload Pitch Stack</span>
                </button>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1 border-0 cursor-pointer shadow-lg shadow-emerald-990/10"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedMessage ? "Copied Swaps!" : "Copy Swap Draft"}</span>
                  </button>
                  
                  <button
                    onClick={resetAll}
                    className="w-full bg-[#161616] hover:bg-gray-901 border border-gray-800 text-gray-300 font-medium py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Undo className="w-3.5 h-3.5" />
                    <span>Clear Selections</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PROFILE PROMPT BANNER FOR DIRECT VISITOR ENHANCEMENT */}
        {!isProfileSetup ? (
          <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-5 shadow-2xl space-y-3.5" id="profile-prompt-card">
            <div className="flex items-start space-x-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-xs tracking-wide uppercase text-white">
                  Personalize with Care Profile
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Avoid lists of unrelated options. Input your age and toggle conditions to automatically precheck matching medicines and highlight core metrics.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToProfile}
              className="w-full bg-[#161616] hover:bg-gray-900 border border-gray-800 text-gray-200 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <span>Setup Free Local Profile</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        ) : (
          /* VC PITCH METRIC DEMO VALUE GRID */
          <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-5 shadow-2xl space-y-3.5 animate-fade-in" id="vc-pitch-card">
            <h4 className="font-display font-bold text-xs tracking-wide uppercase text-gray-500 flex items-center space-x-1.5 border-b border-gray-800 pb-2">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>Investment Case Summary</span>
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-gray-905 rounded-xl border border-gray-900">
                <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Market Delta</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">₹350B+</p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">Chronic Markup</p>
              </div>
              <div className="p-3 bg-gray-905 rounded-xl border border-gray-900">
                <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Subscription COGS</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">74% Less</p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">Generic Edge</p>
              </div>
              <div className="p-3 bg-gray-905 rounded-xl border border-gray-900">
                <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Target Audience</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">45M</p>
                <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">Indian Homes</p>
              </div>
            </div>
            <p className="text-gray-500 text-[10px] leading-relaxed text-center">
              This interactive pricing MVP maps actual chemical molecule market markups to demonstrate massive arbitrage and value transfer in the Indian retail pharmaceuticals ecosystem.
            </p>
          </div>
        )}
      </div>

      {/* MOBILE STICKY FIXED BOTTOM BAR (PRD 11.3) */}
      {selectedList.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-45 bg-[#0F0F0F] border-t border-gray-800 p-4 block lg:hidden shadow-2xl" id="mobile-sticky-bottom-bar">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">PROJECTED SAVINGS</p>
              <div className="flex items-baseline space-x-1.5" key={stats.annualSavings}>
                <motion.span 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-bold text-emerald-400 font-mono"
                >
                  {formatCurrency(stats.annualSavings)}
                </motion.span>
                <span className="text-[11px] text-gray-400 font-medium">/ year</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Expand toggler */}
              <button 
                type="button"
                onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
                className="bg-[#161616] hover:bg-[#1E1E1E] text-gray-300 border border-gray-800 py-1.5 px-3 rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Details</span>
                <ChevronUp className={`w-3.5 h-3.5 text-emerald-400 transition-all ${mobilePanelOpen ? "rotate-180" : ""}`} />
              </button>

              <button
                type="button"
                onClick={copyToClipboard}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-2 px-3.5 rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1 border-0 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedMessage ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Mobile Drawer Panel details */}
          <AnimatePresence>
            {mobilePanelOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3.5 pt-3.5 border-t border-gray-800 space-y-3"
              >
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#161616] p-2.5 rounded-lg border border-gray-800/60">
                    <span className="text-gray-500 text-[9px] block uppercase font-mono">Current Brand Bill</span>
                    <span className="font-bold text-xs text-rose-450 font-mono mt-0.5 block">{formatCurrency(stats.totalCurrentMonthly)} /mo</span>
                  </div>
                  <div className="bg-[#161616] p-2.5 rounded-lg border border-gray-800/60">
                    <span className="text-gray-500 text-[9px] block uppercase font-mono">Generic Bill</span>
                    <span className="font-bold text-xs text-emerald-400 font-mono mt-0.5 block">{formatCurrency(stats.totalOptimizedMonthly)} /mo</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-400 leading-snug">
                  You are saving <strong className="text-emerald-400">{stats.savingsPercent.toFixed(0)}%</strong> of your chronic spending by substituting branded equivalents with generics. Show the Side-by-Side Substitution plan above to your family doctor to authorize.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
