import React, { useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Indian tax brackets (new regime FY 2025)
const taxBrackets = [
  { limit: 300000, rate: 0 },
  { limit: 700000, rate: 0.05 },
  { limit: 1000000, rate: 0.1 },
  { limit: 1200000, rate: 0.15 },
  { limit: 1500000, rate: 0.2 },
  { limit: Infinity, rate: 0.3 },
];

function calculateTax(income) {
  let tax = 0;
  let prevLimit = 0;

  for (let i = 0; i < taxBrackets.length; i++) {
    const { limit, rate } = taxBrackets[i];
    if (income > limit) {
      tax += (limit - prevLimit) * rate;
      prevLimit = limit;
    } else {
      tax += (income - prevLimit) * rate;
      break;
    }
  }
  return tax;
}

// Convert lump sum to monthly payout
function lumpSumToMonthly(lumpSum, years, annualReturn) {
  const months = years * 12;
  const r = annualReturn / 12;
  return (lumpSum * r) / (1 - Math.pow(1 + r, -months));
}

function getPayoutData(retirementCorpus) {
  const years = 25;
  const annualReturn = 0.06;

  // Lump Sum
  const lumpSumMonthlyGross = lumpSumToMonthly(
    retirementCorpus,
    years,
    annualReturn
  );
  const lumpSumAnnualGross =
    lumpSumMonthlyGross * 12;
  const lumpSumAnnualTax = calculateTax(lumpSumAnnualGross);
  const lumpSumMonthlyNet = (lumpSumAnnualGross - lumpSumAnnualTax) / 12;

  // Annuity
  const annuityAnnualGross = retirementCorpus * 0.06;
  const annuityTax = calculateTax(annuityAnnualGross);
  const annuityMonthlyNet = (annuityAnnualGross - annuityTax) / 12;

  // Phased Withdrawal
  const phasedAnnualGross = retirementCorpus * 0.05;
  const phasedTax = calculateTax(phasedAnnualGross);
  const phasedMonthlyNet = (phasedAnnualGross - phasedTax) / 12;

  return [
    {
      option: "Lump Sum",
      monthlyGross: Math.round(lumpSumMonthlyGross),
      monthlyNet: Math.round(lumpSumMonthlyNet),
      tax: Math.round(lumpSumAnnualTax),
    },
    {
      option: "Annuity",
      monthlyGross: Math.round(annuityAnnualGross / 12),
      monthlyNet: Math.round(annuityMonthlyNet),
      tax: Math.round(annuityTax),
    },
    {
      option: "Phased Withdrawal",
      monthlyGross: Math.round(phasedAnnualGross / 12),
      monthlyNet: Math.round(phasedMonthlyNet),
      tax: Math.round(phasedTax),
    },
  ];
}

function PillToggle({ value, onChange, options }) {
  return (
    <div className="flex bg-gray-100 rounded-full p-1 w-fit">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`px-4 py-1 rounded-full transition font-medium ${
            value === opt.value
              ? "bg-blue-600 text-white shadow"
              : "bg-transparent text-gray-700 hover:bg-blue-100"
          }`}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function PayoutComparison({ corpusValue }) {
  const [mode, setMode] = useState("net");
  // The actual corpus value comes dynamically from Dashboard calculations, rather than hardcoded 1 Crore
  const data = getPayoutData(corpusValue || 10000000);

  return (
    <div>
      <div className="flex flex-col gap-2 items-center mb-4">
        <PillToggle
          value={mode}
          onChange={setMode}
          options={[
            { value: "net", label: "Monthly Net Income" },
            { value: "tax", label: "Tax Impact" },
          ]}
        />
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="option" />
          <YAxis domain={[0, 'auto']} />
          <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
          <Legend />
          {mode === "tax" ? (
            <Bar dataKey="tax" radius={[10, 10, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#ef4444", "#f97316", "#eab308"][index]} />
              ))}
            </Bar>
          ) : (
            <Bar dataKey="monthlyNet" radius={[10, 10, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#3b82f6", "#10b981", "#8b5cf6"][index]} />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
