/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MedicineEntry {
  id: string;                  // unique slug, e.g. "glycomet-500"
  condition: string;           // e.g. "Type 2 Diabetes"
  brandName: string;            // e.g. "Glycomet 500"
  genericName: string;          // e.g. "Metformin 500 mg"
  brandCostMin: number;         // ₹ per month, lower bound
  brandCostMax: number;         // ₹ per month, upper bound
  genericCostMin: number;       // ₹ per month, lower bound
  genericCostMax: number;       // ₹ per month, upper bound
}

export interface UserProfile {
  name: string;
  age: string;
  conditions: string[];
}

export interface SelectedMedicineState {
  [id: string]: {
    selected: boolean;
    quantity: number;
  };
}

export interface CalculatedItem extends MedicineEntry {
  quantity: number;
  brandMid: number;
  genericMid: number;
  savings: number;
}

export interface SavingsStats {
  totalCurrentMonthly: number;
  totalOptimizedMonthly: number;
  monthlySavings: number;
  savingsPercent: number;
  annualSavings: number;
}
