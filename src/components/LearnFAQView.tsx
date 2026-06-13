/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  HelpCircle, 
  ChevronRight, 
  ShieldCheck, 
  TrendingDown, 
  CheckCircle2, 
  BookOpen,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_LIST: FAQItem[] = [
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
];

interface LearnFAQViewProps {
  onReturnToCalculator: () => void;
}

export default function LearnFAQView({ onReturnToCalculator }: LearnFAQViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0F0F0F] rounded-2xl border border-gray-800 p-6 md:p-8 space-y-8 shadow-2xl" 
      id="learn-tab-view"
    >
      <div>
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/15 rounded-full px-3 py-1 text-xs font-semibold text-emerald-400 mb-2.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Patient Advocacy & Medical Literacy</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase italic tracking-tight">Generic vs Brand Name: The Truth</h2>
        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-3xl mt-2">
          Generic medicines have precise bio-equivalence and active chemical compounds as premium branded equivalents. 
          They cost up to 80% less because they enter the market after patent expirations without needing heavy clinical diagnostic budgets, 
          recurring R&D amortizations, or intense doctor marketing representative strategies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border border-gray-800 bg-[#161616] space-y-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight text-display uppercase">Therapeutic Equivalence</h3>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Generics are chemically identical. They maintain the same dosage, safety, administration route, side-effects, bio-availability, and medical efficacy standards.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-gray-800 bg-[#161616] space-y-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center text-emerald-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight text-display uppercase">No Discovery Markup</h3>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Generic labs don't replicate expensive first-time regulatory clinical trials or initial molecule synthesis, facilitating massive discounts shared directly with consumers.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-gray-800 bg-[#161616] space-y-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-lg w-10 h-10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm tracking-tight text-display uppercase">Govt Backed (Jan Aushadhi)</h3>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            The Indian government actively promotes generic substitutions through PMBJP centers to curb domestic healthcare poverty.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-display font-black text-white mb-4 flex items-center space-x-2.5 uppercase italic">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <span>Frequently Asked Questions for Investors & Families</span>
        </h3>
        
        <div className="space-y-3">
          {FAQ_LIST.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="border border-gray-800 rounded-lg overflow-hidden bg-[#161616]">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-4 hover:bg-[#1E1E1E] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold text-xs sm:text-sm text-gray-200">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-90 text-emerald-400" : ""}`} />
                </button>
                {isOpen && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.15 }}
                    className="p-4 bg-[#0F0F0F] border-t border-gray-800 text-xs text-gray-400 leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-emerald-950/20 rounded-xl p-5 border border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-display font-semibold text-emerald-300 text-sm">Ready to check your actual medications?</h4>
          <p className="text-emerald-400/80 text-xs">Return to the custom pricing stack calculator to configure generic alternatives.</p>
        </div>
        <button 
          onClick={onReturnToCalculator}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg text-xs transition-all cursor-pointer flex items-center space-x-1"
        >
          <span>Calculate Savings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
