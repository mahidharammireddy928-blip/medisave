/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { 
  Pill, 
  Activity, 
  Search, 
  Check, 
  Plus, 
  Minus, 
  TrendingDown, 
  Heart, 
  Info, 
  AlertCircle, 
  FileText, 
  Share2, 
  Undo,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { medicinesData, MedicineEntry } from "./data/medicines";

// List of all unique conditions for the filter
const ALL_CONDITIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "Dyslipidemia (High Cholesterol)",
  "Hypothyroidism",
  "Asthma / COPD"
];

// Helper to format currency in Indian style (e.g. ₹1,23,456)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

export default function App() {
  // --- STATE ---
  // Default to pre-selecting the three chronic conditions containing our preselected medicines
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    "Type 2 Diabetes",
    "Hypertension",
    "Hypothyroidism"
  ]);

  // Pre-select 4 commonly-used medicines as requested by Section 7 of PRD
  // Default quantities set to 1
  const [selectedMedicines, setSelectedMedicines] = useState<{
    [id: string]: { selected: boolean; quantity: number };
  }>({
    "telma-40": { selected: true, quantity: 1 },
    "amlong-5": { selected: true, quantity: 1 },
    "glycomet-500": { selected: true, quantity: 1 },
    "thyronorm-50": { selected: true, quantity: 1 }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"calculator" | "learn">("calculator");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // --- ACTIONS ---
  const toggleCondition = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter(c => c !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
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

  const selectAllFiltered = (filteredMedicines: MedicineEntry[]) => {
    setSelectedMedicines(prev => {
      const updated = { ...prev };
      filteredMedicines.forEach(m => {
        updated[m.id] = {
          selected: true,
          quantity: prev[m.id]?.quantity || 1
        };
      });
      return updated;
    });
  };

  const deselectAllFiltered = (filteredMedicines: MedicineEntry[]) => {
    setSelectedMedicines(prev => {
      const updated = { ...prev };
      filteredMedicines.forEach(m => {
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

  const loadDefaults = () => {
    setSelectedConditions(["Type 2 Diabetes", "Hypertension", "Hypothyroidism"]);
    setSelectedMedicines({
      "telma-40": { selected: true, quantity: 1 },
      "amlong-5": { selected: true, quantity: 1 },
      "glycomet-500": { selected: true, quantity: 1 },
      "thyronorm-50": { selected: true, quantity: 1 }
    });
  };

  // --- READ DATA & FILTER ---
  // Medicines grouped by conditions that are selected
  // We can also let people search across search terms
  const filteredMedicines = useMemo(() => {
    return medicinesData.filter(med => {
      const conditionMatches = selectedConditions.includes(med.condition);
      const queryMatches = 
        searchQuery === "" ||
        med.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.condition.toLowerCase().includes(searchQuery.toLowerCase());
      
      // If no conditions selected, show medicines from all conditions matched by search query
      if (selectedConditions.length === 0) {
        return queryMatches;
      }
      return conditionMatches && queryMatches;
    });
  }, [selectedConditions, searchQuery]);

  // Selected list details for results
  const selectedList = useMemo(() => {
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

  // --- STATS COMPUTATIONS ---
  const stats = useMemo(() => {
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

  // Format shareable clipboard text
  const shareText = useMemo(() => {
    if (selectedList.length === 0) return "";
    let txt = `🩺 *MediSave prescription generic budget analysis*:\n\n`;
    selectedList.forEach(item => {
      txt += `• *Brand: ${item.brandName}* x${item.quantity} (Avg. ₹${item.brandMid}/mo) \n  ↳ Switch to Generic: *${item.genericName}* (Avg. ₹${item.genericMid}/mo) | Save ~₹${item.savings}/mo\n\n`;
    });
    txt += `━━━━━━━━━━━━━━━━━\n`;
    txt += `📉 *Current Brand Monthly*: ${formatCurrency(stats.totalCurrentMonthly)}\n`;
    txt += `🌱 *Optimized Generic Monthly*: ${formatCurrency(stats.totalOptimizedMonthly)}\n`;
    txt += `💰 *Monthly Savings*: ${formatCurrency(stats.monthlySavings)} (${stats.savingsPercent.toFixed(0)}% saved)\n`;
    txt += `🔥 *Annual Savings Projection: ${formatCurrency(stats.annualSavings)}* saved this year!\n\n`;
    txt += `Note: Show this list to your registered medical practitioner to ask about generic substitution options. Let's make healthcare affordable!`;
    return txt;
  }, [selectedList, stats]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  // Dynamic conditions counts to display inside indicators
  const conditionMedCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    ALL_CONDITIONS.forEach(cond => {
      counts[cond] = medicinesData.filter(m => m.condition === cond).length;
    });
    return counts;
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 font-sans antialiased" id="medisave-app">
      {/* HEADER BAR */}
      <header className="border-b border-gray-800 bg-[#0A0A0A] sticky top-0 z-50 shadow-md" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 text-black p-2 rounded-lg flex items-center justify-center font-bold italic shadow-lg shadow-emerald-500/10" id="logo-icon">
              <Pill className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-xl tracking-tight uppercase italic text-white">MediSave</span>
                <span className="text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">MVP PITCH DEMO</span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">Prescription Savings Calculator</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab("calculator")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-205 cursor-pointer ${
                activeTab === "calculator" 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-gray-901"
              }`}
            >
              Calculator
            </button>
            <button 
              onClick={() => setActiveTab("learn")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-205 cursor-pointer ${
                activeTab === "learn" 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "text-gray-400 hover:text-white hover:bg-gray-901"
              }`}
            >
              FAQ & Education
            </button>
          </div>
        </div>
      </header>

      {/* PRIMARY CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Pitch Hero/Context Slogan */}
        <div className="mb-8" id="pitch-hero">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Middle-Class Household Financial Optimization</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white mb-2 uppercase italic">
            Stop Overpaying for Chronic Medicines
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-3xl leading-relaxed">
            Indian families frequently pay an unnecessary brand penalty of <strong className="text-white">70%+ on recurring prescription care</strong>. 
            Select your therapeutic conditions, check your branded medications, and see how simple generic substitutions unlock compounding annual savings.
          </p>
        </div>

        {activeTab === "learn" ? (
          /* LEARN & FAQ VIEW */
          <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 md:p-8 space-y-8 shadow-2xl" id="learn-tab-view">
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Generic vs Brand Name: The Truth</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                Generic medicines have precise bio-equivalence and active chemical compounds as premium branded equivalents. 
                They cost up to 80% less because they enter the market after patent expirations without needing heavy clinical diagnostic budgets, 
                recurring R&D amortizations, or intense doctor marketing representative strategies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl border border-gray-800 bg-[#161616] space-y-2">
                <div className="bg-emerald-500/10 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm text-display">Therapeutic Equivalence</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Generics are chemically identical. They maintain the same dosage, safety, administration route, side-effects, and efficacy standards.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-gray-800 bg-[#161616] space-y-2">
                <div className="bg-emerald-500/10 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center text-emerald-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm text-display">No Discovery Markup</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Generic labs don't replicate first-time regulatory clinical trials or initial syntheses, allowing massive price discounts directly shared with consumers.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-gray-800 bg-[#161616] space-y-2">
                <div className="bg-emerald-500/10 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm text-display">Govt Backed (Jan Aushadhi)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The Indian government actively promotes generic substitutions through PMBJP centers to curb domestic healthcare poverty.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <span>Frequently Asked Questions for Investors & Households</span>
              </h3>
              
              <div className="space-y-3">
                {[
                  {
                    q: "Why are generic medicines and brand-name pricing gaps so large in India?",
                    a: "In India, pharmaceutical manufacturers market identical compounds under individual custom 'brand names' at wildly disparate brand markups. Marketing expenses, medical representative salaries, doctor conferences, and distribution channel commissions drive brand-name prices up by 4x to 10x, whereas standard generic alternatives carry simple commodity manufacturing margins."
                  },
                  {
                    q: "Are generic medicines as safe and chemically efficient to consume?",
                    a: "Yes. All manufacturers in India must adhere to strict pharmacopoeia regulations and generic bio-availability standards monitored under the Central Drugs Standard Control Organisation (CDSCO). Generics contain the exact active chemical molecules."
                  },
                  {
                    q: "How does this MVP align with the overall business vision?",
                    a: "This MVP provides proof-of-concept for a comprehensive chronic health subscription service. By aggregating household demand, advising generic substitutions through a digital utility, and delivering quality-vetted generic chronic formulations, we can permanently slash standard healthcare budgets for millions of Indian middle-class families."
                  },
                  {
                    q: "What is PMBJP and how does it relate to the pricing here?",
                    a: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) is a public campaign that offers quality generic medicines at highly affordable prices through dedicated state-backed Jan Aushadhi kiosks. Our generic price ranges are modeled on actual wholesale and Jan Aushadhi pricing margins."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border border-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full text-left p-4 bg-[#161616] hover:bg-[#1E1E1E] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold text-sm text-gray-200">{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === index ? "rotate-90 text-emerald-400" : ""}`} />
                    </button>
                    {openFaq === index && (
                      <div className="p-4 bg-[#0F0F0F] border-t border-gray-800 text-xs text-gray-400 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-950/20 rounded-xl p-5 border border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-display font-semibold text-emerald-300 text-sm">Ready to check your actual medications?</h4>
                <p className="text-emerald-400/80 text-xs">Return to the custom pricing stack calculator to configure generic alternatives.</p>
              </div>
              <button 
                onClick={() => setActiveTab("calculator")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Go to Calculator
              </button>
            </div>
          </div>
        ) : (
          /* CALCULATOR VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="calculator-layout">
            
            {/* LEFT COLUMN: SELECTION INPUTS (7/12 WIDTH) */}
            <div className="lg:col-span-7 space-y-6" id="calculator-inputs">
              
              {/* STEP 1: CONDITION SELECTOR PILL BOXES */}
              <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 shadow-2xl" id="step-conditions">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-base font-display font-bold uppercase tracking-tight text-white flex items-center space-x-2">
                       <span className="bg-gray-800/60 text-gray-300 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold font-mono">1</span>
                      <span>Select Chronic Conditions</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Toggle categories to display pre-loaded branded medicines</p>
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

                <div className="flex flex-wrap gap-2.5">
                  {ALL_CONDITIONS.map((cond) => {
                    const isSelected = selectedConditions.includes(cond);
                    const count = conditionMedCounts[cond] || 0;
                    return (
                      <button
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                          isSelected 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500"
                            : "bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:bg-[#161616]"
                        }`}
                        style={{ height: '38px' }}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-gray-500"}`} />
                        <span>{cond}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.25 rounded-md ${isSelected ? "bg-emerald-500/20 text-emerald-300" : "bg-gray-800 text-gray-500"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 shadow-2xl" id="step-medicines">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base font-display font-bold uppercase tracking-tight text-white flex items-center space-x-2">
                      <span className="bg-gray-800/60 text-gray-300 w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold font-mono">2</span>
                      <span>Check Your Branded Medicines</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Toggle current drugs taken. Adjust quantities (monthly strips/packs).</p>
                  </div>
                  
                  {/* Text search input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search Glycomet, Telma..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-4 py-2 bg-[#161616] hover:bg-[#1E1E1E] focus:bg-[#161616] text-white rounded-xl border border-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Filter and Group list */}
                {filteredMedicines.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-gray-800 rounded-xl bg-[#0F0F0F]/60">
                    <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-300 text-xs font-semibold mb-1">No medicines match your selections/filters.</p>
                    <p className="text-gray-500 text-[11px] mb-4">Try enabling your therapy categories above or clear the search query.</p>
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={resetAll}
                        className="text-xs text-gray-300 font-medium px-3 py-1.5 border border-gray-800 rounded-lg hover:bg-gray-800 transition bg-[#161616] cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                      <button 
                        onClick={loadDefaults}
                        className="text-xs text-black bg-emerald-500 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-400 transition cursor-pointer"
                      >
                        Load Pitch Demo Defaults (4 medicines)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Action buttons to quickly select/deselect shown */}
                    <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                      <span>Showing {filteredMedicines.length} medicines in view</span>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => selectAllFiltered(filteredMedicines)}
                          className="text-emerald-400 hover:text-emerald-300 bg-transparent border-0 cursor-pointer text-xs font-semibold"
                        >
                          Select All Shown
                        </button>
                        <span className="text-gray-700">|</span>
                        <button 
                          onClick={() => deselectAllFiltered(filteredMedicines)}
                          className="text-rose-400 hover:text-rose-300 bg-transparent border-0 cursor-pointer text-xs font-semibold"
                        >
                          Deselect All Shown
                        </button>
                      </div>
                    </div>

                    {/* Group by condition for better aesthetics */}
                    {ALL_CONDITIONS.filter(cond => {
                      if (selectedConditions.length > 0 && !selectedConditions.includes(cond)) return false;
                      return filteredMedicines.some(m => m.condition === cond);
                    }).map((cond) => {
                      const condMeds = filteredMedicines.filter(m => m.condition === cond);
                      return (
                        <div key={cond} className="space-y-2.5">
                          <h3 className="font-display font-extrabold text-xs tracking-wider uppercase text-gray-500 flex items-center space-x-2 bg-gray-901/40 py-1 px-2.5 rounded-md w-fit">
                            <Activity className="w-3 h-3 text-emerald-400" />
                            <span>{cond}</span>
                          </h3>

                          <div className="grid grid-cols-1 gap-2.5">
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
                                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                    isSelected 
                                      ? "border-[#10b981] bg-[#10b981]/5 shadow-inner" 
                                      : "border-gray-800 bg-[#161616] hover:border-gray-700"
                                  }`}
                                >
                                  {/* Left details */}
                                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                                    <div className="mt-1 flex items-center justify-center">
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        isSelected ? "bg-emerald-500 border-emerald-500 text-black" : "border-gray-600 bg-transparent text-transparent"
                                      }`}>
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </div>
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                      <div className="flex flex-wrap items-baseline gap-x-2">
                                        <span className="font-bold text-sm text-white truncate">
                                          {med.brandName}
                                        </span>
                                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-semibold border border-rose-500/20 uppercase tracking-wider">
                                          Branded
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <span className="text-[11px] text-gray-500 font-mono">
                                          Generic counterpart:
                                        </span>
                                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.25 rounded font-mono">
                                          {med.genericName}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right side pricing & quantity */}
                                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-gray-800">
                                    <div className="text-left sm:text-right space-y-1">
                                      <div className="flex items-center space-x-1 sm:justify-end">
                                        <span className="text-xs text-gray-500 line-through">
                                          {formatCurrency(brandMid)}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-400 font-mono">
                                          {formatCurrency(brandMid)}
                                        </span>
                                        <span className="text-[10px] text-gray-500">/mo</span>
                                      </div>
                                      <div className="flex items-center space-x-1 sm:justify-end">
                                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 rounded">
                                          Save {medSavingsPercent.toFixed(0)}%
                                        </span>
                                        <span className="text-xs font-bold text-emerald-400 font-mono">
                                          {formatCurrency(genericMid)}
                                        </span>
                                        <span className="text-[10px] text-gray-500">/mo</span>
                                      </div>
                                    </div>

                                    {/* Stop click parent propagation when clicking details inside */}
                                    <div 
                                      className="flex items-center space-x-1 bg-gray-900 border border-gray-800 rounded-lg p-0.5"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Avoid triggering checkbox toggle
                                      }}
                                    >
                                      <button
                                        onClick={() => adjustQuantity(med.id, -1)}
                                        disabled={!isSelected}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition ${
                                          isSelected ? "hover:bg-gray-850 text-gray-300 active:bg-gray-700" : "text-gray-700 cursor-not-allowed"
                                        }`}
                                        title="Decrease Quantity"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className={`w-8 text-center text-xs font-bold font-mono ${isSelected ? "text-white" : "text-gray-700"}`}>
                                        {qty}
                                      </span>
                                      <button
                                        onClick={() => adjustQuantity(med.id, 1)}
                                        disabled={!isSelected}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition ${
                                          isSelected ? "hover:bg-gray-850 text-gray-300 active:bg-gray-700" : "text-gray-700 cursor-not-allowed"
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ITEMIZED BREAKDOWN TABLE */}
              {selectedList.length > 0 && (
                <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 shadow-2xl" id="itemized-breakdown">
                  <h2 className="text-base font-display font-bold uppercase tracking-tight text-white mb-2 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Itemized Generic Substitution Prescription Swap</span>
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">A side-by-side active breakdown ready to share with your registered medical practitioner.</p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-800 bg-[#161616] text-[10px] tracking-wider uppercase font-bold text-gray-400">
                          <th className="py-2.5 px-3">Branded Prescribed Medication</th>
                          <th className="py-2.5 px-3">Therapeutic Generic Equivalent</th>
                          <th className="py-2.5 px-3 text-right">Brand Cost</th>
                          <th className="py-2.5 px-3 text-right">Generic Cost</th>
                          <th className="py-2.5 px-3 text-right">Monthly Saved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {selectedList.map((item) => (
                          <tr key={item.id} className="hover:bg-[#161616]/40 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-bold text-white">{item.brandName}</span>
                              <span className="text-[10px] text-gray-500 block font-mono">Qty: {item.quantity} month pack</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-medium text-emerald-400 font-mono block">{item.genericName}</span>
                              <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 py-0.25 px-1.5 rounded-full w-fit block mt-0.5">Identical Active Molecule</span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-gray-400">
                              {formatCurrency(item.brandMid)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-450 bg-emerald-500/5">
                              {formatCurrency(item.genericMid)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                              {formatCurrency(item.savings)}
                              <span className="text-[9px] block font-normal text-gray-500">-{((item.savings / item.brandMid) * 100).toFixed(0)}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-center bg-[#161616] rounded-xl p-4 gap-3 border border-gray-800">
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <IconsGroup />
                      <span>Take control of your monthly medical expenditure with generics.</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs transition duration-150 cursor-pointer shadow-sm active:bg-emerald-850 border-0"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-0.5 text-black" />
                          <span>Copied Swap Draft!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-0.5" />
                          <span>Draft Doctor Notice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: STICKY RESULTS PANEL AND CALCULATIONS (5/12 WIDTH) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6" id="calculator-sidebar">
              
              {/* SAVINGS SUMMARY PANEL */}
              <div className="bg-gradient-to-br from-[#161616] to-[#0A0A0A] text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-emerald-500/30" id="savings-widget">
                
                {/* Decorative background gradients to look high-end */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Main Headline Block */}
                <div className="relative space-y-5">
                  <div>
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-widest flex items-center space-x-1.5 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-450" />
                      <span>Projected Annual Savings</span>
                    </h3>
                    
                    {selectedList.length === 0 ? (
                      <div className="space-y-1">
                        <p className="text-4xl font-display font-extrabold tracking-tight text-gray-400">No Meds Selected</p>
                        <p className="text-xs text-gray-500 leading-relaxed">Select chronic medicines on the left to estimate compound savings immediately.</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-5xl font-display font-bold text-white tracking-tighter flex items-baseline">
                          <span>{formatCurrency(stats.annualSavings)}</span>
                          <span className="text-emerald-400 text-xl font-medium ml-2 font-display">/ year</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450 flex-shrink-0" />
                          <span>Equivalent to saving <strong className="text-emerald-400 font-bold">{stats.savingsPercent.toFixed(0)}%</strong> on your chronic treatment stacks.</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pricing Comparison Bar Meter */}
                  <div className="border-t border-gray-800 pt-4 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-gray-550 tracking-wider block">Prescription Cost Split Comparison</span>
                    
                    {/* Visual Comparison progress */}
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
                      {selectedList.length === 0 ? (
                        <div className="w-full bg-gray-700 animate-pulse" />
                      ) : (
                        <>
                          <div 
                            className="bg-rose-500 h-full transition-all duration-500" 
                            style={{ width: `${(stats.totalOptimizedMonthly / stats.totalCurrentMonthly) * 100}%` }}
                            title="Required Generic Cost"
                          />
                          <div 
                            className="bg-emerald-500 h-full transition-all duration-500" 
                            style={{ width: `${((stats.totalCurrentMonthly - stats.totalOptimizedMonthly) / stats.totalCurrentMonthly) * 100}%` }}
                            title="Slashed Margin Savings"
                          />
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-[#0F0F0F] p-3 rounded-xl border border-gray-800">
                        <span className="text-gray-500 text-[10px] block font-semibold uppercase">Current Branded</span>
                        <span className="font-bold text-sm text-rose-400 font-mono mt-0.5 block">
                          {selectedList.length === 0 ? "₹0" : formatCurrency(stats.totalCurrentMonthly)}
                          <span className="text-[10px] font-normal text-gray-500"> /mo</span>
                        </span>
                      </div>
                      <div className="bg-[#0F0F0F] p-3 rounded-xl border border-gray-800">
                        <span className="text-gray-500 text-[10px] block font-semibold uppercase">Optimized Generic</span>
                        <span className="font-bold text-sm text-emerald-400 font-mono mt-0.5 block">
                          {selectedList.length === 0 ? "₹0" : formatCurrency(stats.totalOptimizedMonthly)}
                          <span className="text-[10px] font-normal text-gray-500"> /mo</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Five Year Projections Block */}
                  {selectedList.length > 0 && (
                    <div className="bg-[#0F0F0F]/80 p-4 rounded-2xl border border-gray-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Compound Visualized Projections</span>
                        <span className="text-[9px] text-gray-500 bg-[#161616] py-0.5 px-2 rounded-full font-mono font-semibold">12% Inflation Cap</span>
                      </div>

                      <div className="space-y-2">
                        {/* 1 Year */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">1-Year Household Savings</span>
                          <span className="font-semibold text-white font-mono">{formatCurrency(stats.annualSavings)}</span>
                        </div>
                        {/* 3 Years */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">3-Year Household Savings</span>
                          <span className="font-semibold text-amber-400 font-mono">{formatCurrency(stats.annualSavings * 3)}</span>
                        </div>
                        {/* 5 Years */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">5-Year Household Savings</span>
                          <span className="font-bold text-emerald-400 text-sm font-mono">{formatCurrency(stats.annualSavings * 5)}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-gray-500 border-t border-gray-800 pt-2 leading-relaxed">
                        💪 Preserving <strong className="text-gray-300">{formatCurrency(stats.annualSavings * 5)}</strong> in 5 years equals enough capital to purchase a major home appliance, clear micro-loans, or fund 2 years of children's primary tuition.
                      </div>
                    </div>
                  )}

                  {/* Actions & Sharing */}
                  <div className="pt-2">
                    {selectedList.length === 0 ? (
                      <button 
                        onClick={loadDefaults}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1 outline-none border-0 cursor-pointer shadow-md"
                      >
                        <Coins className="w-3.5 h-3.5 text-black" />
                        <span>Preload Pitch Demo Stack</span>
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={copyToClipboard}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 flex items-center justify-center space-x-1 shadow-lg shadow-emerald-990/20 border-0 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>{copiedMessage ? "Copied Swaps!" : "Copy Summary Text"}</span>
                        </button>
                        
                        <button
                          onClick={resetAll}
                          className="bg-gray-901 hover:bg-gray-800 border border-gray-800 text-gray-300 font-medium py-2.5 px-4 rounded-xl text-xs transition duration-155 flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Undo className="w-3.5 h-3.5" />
                          <span>Clear All</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* VC PITCH VALUE PROP STATS CARD */}
              <div className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-5 shadow-2xl space-y-3.5" id="vc-pitch-card">
                <h4 className="font-display font-bold text-xs tracking-wide uppercase text-gray-400 flex items-center space-x-1.5 border-b border-gray-800 pb-2">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strategic Venture Investment Thesis</span>
                </h4>
                
                <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
                  <p>
                    <strong>Chronic treatments:</strong> Diabetes, cardiac health, and COPD require strict permanent medication regimes. High customer lifetime value (LTV) combined with massive cost mismatches leaves a lucrative market opportunity for a Direct-to-Consumer Generic distribution platform.
                  </p>
                  <p>
                    By digitalizing prescription swap identification utilities and directly connecting certified factories with chronically ill households, we capture high retention and construct an incredibly defensible healthcare tech funnel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER PITCH COPY */}
      <footer className="bg-[#0F0F0F] border-t border-gray-800 mt-16 py-8" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-gray-300 font-display font-semibold text-sm uppercase tracking-wider">
            "This is how much Indian families overpay every year — and we fix it."
          </p>
          <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
            MediSave is built with compliance-driven pharmaceutical generic price midpoints in India. Always consult a certified medical practitioner before altering active prescription dose schedules.
          </p>
          <div className="text-[10px] text-gray-600 font-mono pt-2">
            © 2026 MediSave Inc - Confidential Venture Pitch Prototype
          </div>
        </div>
      </footer>
    </div>
  );
}

// Small design decor group element
function IconsGroup() {
  return (
    <div className="flex -space-x-1.5 overflow-hidden">
      <div className="inline-block h-5 w-5 rounded-full border border-gray-800 bg-emerald-500/10 flex items-center justify-center">
        <Heart className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400/20" />
      </div>
      <div className="inline-block h-5 w-5 rounded-full border border-gray-800 bg-emerald-500/15 flex items-center justify-center">
        <TrendingDown className="w-2.5 h-2.5 text-emerald-400" />
      </div>
      <div className="inline-block h-5 w-5 rounded-full border border-gray-800 bg-emerald-500/20 flex items-center justify-center">
        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
      </div>
    </div>
  );
}
