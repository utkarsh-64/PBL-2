import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Dot,
} from "recharts";
import { useCharacter } from '../Character/CharacterProvider';
import ChartExplanationIcon from "../ChartExplanationIcon";
import BreakEvenChartOverlay from "../BreakEvenChartOverlay";

/**
 * Break-Even Visualizer: Lump Sum vs Annuity
 * - Real (inflation-adjusted) analysis
 * - Compounding using *real* return r_real = (1+r) / (1+i) - 1
 * - Compares two strategies (both inflation-adjusted):
 *    1) Take Lump Sum and invest at r_real
 *    2) Take Annuity payments; each payment invested immediately at r_real
 * - Break-even when FV_real(Annuity) >= FV_real(LumpSum)
 */

// Simple INR currency formatter
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// Utility to clamp values
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Build the time series in *real* terms (inflation-adjusted)
function buildSeries({
  lumpSum, // L (₹)
  annuity, // A (₹ per year, nominal starting)
  years, // horizon in years
  nominalReturn, // r (e.g., 0.08)
  inflation, // i (e.g., 0.05)
  annuityEscalation = 0, // g (nominal step-up of annuity per year)
  startAge = 60, // for labeling
}) {
  // Convert to *real* rates so the chart shows inflation-adjusted purchasing power
  // Real return: (1+r)/(1+i) - 1
  const rReal = (1 + nominalReturn) / (1 + inflation) - 1; // can be negative

  const data = [];

  // Strategy 1: Lump Sum invested at rReal
  let fvLump = lumpSum; // real value at t=0 is L (already real)

  // Strategy 2: Annuity payments invested at rReal (work in *real* terms)
  let fvAnnuity = 0; // future value (real) of all invested annuity receipts so far

  for (let t = 0; t <= years; t++) {
    if (t > 0) {
      // evolve both portfolios for one period at real rate
      fvLump *= 1 + rReal;
      fvAnnuity *= 1 + rReal;

      // Add this year's real annuity contribution
      // Start with nominal annuity amount at year t (0-indexed -> first payment at end of year 1)
      const nominalAnnuityT =
        annuity * Math.pow(1 + annuityEscalation, t - 1 < 0 ? 0 : t - 1);
      // Convert that nominal payment to *real* by deflating with inflation^t
      const annuityRealT = nominalAnnuityT / Math.pow(1 + inflation, t);
      fvAnnuity += annuityRealT; // invest immediately (end of period)
    }

    data.push({
      year: t,
      age: startAge + t,
      fvLump,
      fvAnnuity,
      diff: fvAnnuity - fvLump,
    });
  }

  // Find first t where annuity >= lump (diff >= 0)
  let breakEven = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i - 1].diff < 0 && data[i].diff >= 0) {
      // linear interpolation on the diff between i-1 and i (good enough for marking)
      const t0 = data[i - 1].year;
      const d0 = data[i - 1].diff;
      const t1 = data[i].year;
      const d1 = data[i].diff;
      const frac = d1 === d0 ? 0 : -d0 / (d1 - d0);
      const tStar = t0 + clamp(frac, 0, 1) * (t1 - t0);
      const ageStar = startAge + tStar;
      breakEven = { year: tStar, age: ageStar };
      console.log('Break-even calculated:', breakEven);
      break;
    }
  }
  
  console.log('Final breakEven:', breakEven, 'Data length:', data.length);
  

  return { data, breakEven, rReal };
}

// Custom tooltip for nice formatting
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const p = payload.reduce(
    (acc, cur) => ({ ...acc, [cur.dataKey]: cur.value }),
    {}
  );
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur shadow-xl p-3 border border-slate-200">
      <div className="text-xs text-slate-500">Year {label}</div>
      <div className="mt-1 text-sm">
        <div>
          Real FV – Lump Sum: <b>{inr.format(p.fvLump || 0)}</b>
        </div>
        <div>
          Real FV – Annuity: <b>{inr.format(p.fvAnnuity || 0)}</b>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Difference: <b>{inr.format((p.fvAnnuity || 0) - (p.fvLump || 0))}</b>
        </div>
      </div>
    </div>
  );
};

export default function BreakEvenLumpSumVsAnnuity() {
  const [lumpSum, setLumpSum] = useState(5000000); // ₹ 50L
  const [annuity, setAnnuity] = useState(350000); // ₹ 3.5L / yr (starting)
  const [nominalReturnPct, setNominalReturnPct] = useState(8); // % p.a.
  const [inflationPct, setInflationPct] = useState(5); // % p.a.
  const [annuityEscalationPct, setAnnuityEscalationPct] = useState(0); // % p.a. step-up
  const [horizon, setHorizon] = useState(35); // years after retirement
  const [startAge, setStartAge] = useState(60);
  
  const { explainChart, characterState, setUserInteractions, updateChartData } = useCharacter();
  const [initialStepUp] = useState(annuityEscalationPct);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const handleStepUpChange = (newValue) => {
    setAnnuityEscalationPct(newValue);
    if (newValue > initialStepUp) {
      setUserInteractions(prev => ({ ...prev, hasIncreasedStepUp: true }));
    }
  };

  const params = useMemo(
    () => ({
      lumpSum: Number(lumpSum) || 0,
      annuity: Number(annuity) || 0,
      years: clamp(Number(horizon) || 0, 1, 60),
      nominalReturn: (Number(nominalReturnPct) || 0) / 100,
      inflation: (Number(inflationPct) || 0) / 100,
      annuityEscalation: (Number(annuityEscalationPct) || 0) / 100,
      startAge: Number(startAge) || 60,
    }),
    [
      lumpSum,
      annuity,
      horizon,
      nominalReturnPct,
      inflationPct,
      annuityEscalationPct,
      startAge,
    ]
  );

  const { data, breakEven, rReal } = useMemo(
    () => buildSeries(params),
    [params]
  );
  
  console.log('Chart component breakEven:', breakEven);
  
  // Auto-update character explanation when break-even data changes
  useEffect(() => {
    if (characterState.isVisible && characterState.calledViaChartIcon && 
        characterState.messages[0]?.text.includes('Break Even')) {
      // Only update if break-even data actually changed meaningfully
      const currentBreakEvenAge = breakEven?.age ? Math.round(breakEven.age * 10) / 10 : null;
      const storedBreakEvenAge = characterState.chartData?.breakEven?.age ? Math.round(characterState.chartData.breakEven.age * 10) / 10 : null;
      
      if (currentBreakEvenAge !== storedBreakEvenAge) {
        updateChartData({ breakEven: breakEven });
      }
    }
  }, [breakEven?.age, characterState.isVisible, characterState.calledViaChartIcon, characterState.chartData?.breakEven?.age]);

  // Auto-open dropdown when character mentions step-up slider
  useEffect(() => {
    if (characterState.isVisible && characterState.calledViaChartIcon && 
        characterState.messages[0]?.text.includes('Break Even')) {
      const currentMessage = characterState.messages[characterState.currentIndex];
      if (currentMessage?.text.includes('Annuity Step-up slider') && !dropdownOpen) {
        setDropdownOpen(true);
      }
    }
  }, [characterState.currentIndex, characterState.isVisible, characterState.calledViaChartIcon, dropdownOpen]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <BreakEvenChartOverlay chartId="breakEven" breakEvenData={breakEven} />
      <div className="space-y-4">
        <header className="flex flex-col gap-4">
          <div>
            <p className="text-slate-500 text-sm">
              Real return r = (1 + nominal) / (1 + inflation) − 1 ⇒{" "}
              <b>{(rReal * 100).toFixed(2)}%</b>
            </p>
          </div>
        </header>
        {/* Controls */}
        <section className="mb-4">
          <DropdownControls 
            lumpSum={lumpSum}
            setLumpSum={setLumpSum}
            annuity={annuity}
            setAnnuity={setAnnuity}
            annuityEscalationPct={annuityEscalationPct}
            handleStepUpChange={handleStepUpChange}
            nominalReturnPct={nominalReturnPct}
            setNominalReturnPct={setNominalReturnPct}
            inflationPct={inflationPct}
            setInflationPct={setInflationPct}
            startAge={startAge}
            setStartAge={setStartAge}
            isOpen={dropdownOpen}
            setIsOpen={setDropdownOpen}
          />
        </section>
        <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">
                Inflation-Adjusted Future Value (₹, real)
              </h2>
              <p className="text-xs text-slate-500">
                Each line shows the real (today's money) value if receipts are
                invested at the real return.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {breakEven ? (
                <div className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
                  Break-even at ~ <b>{breakEven.year.toFixed(1)}</b> yrs (age{" "}
                  <b>{breakEven.age.toFixed(1)}</b>)
                </div>
              ) : (
                <div className="text-sm bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200">
                  No break-even within horizon
                </div>
              )}
            </div>
          </div>

          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ left: 16, right: 16, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tickFormatter={(v) => `${v}y`} />
                <YAxis tickFormatter={(v) => inr.format(v)} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fvLump"
                  name="Lump Sum (real FV)"
                  strokeWidth={2}
                  dot={false}
                  stroke="#2563eb" // blue-600
                  id="break-even-blue-line"
                />
                <Line
                  type="monotone"
                  dataKey="fvAnnuity"
                  name="Annuity (real FV)"
                  strokeWidth={2}
                  dot={false}
                  stroke="#059669" // emerald-600
                  id="break-even-green-line"
                />

                {breakEven && (
                  <ReferenceLine
                    x={breakEven.year}
                    stroke="#f59e42" // orange-400
                    strokeDasharray="4 4"
                    id="break-even-cross-point"
                    label={{
                      value: `BE ~ ${breakEven.year.toFixed(1)}y`,
                      position: "insideTop",
                      fontSize: 12,
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Small UI primitives ----------
function DropdownControls({ 
  lumpSum, setLumpSum, 
  annuity, setAnnuity, 
  annuityEscalationPct, handleStepUpChange,
  nominalReturnPct, setNominalReturnPct,
  inflationPct, setInflationPct,
  startAge, setStartAge,
  isOpen, setIsOpen
}) {

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-medium text-slate-700">Adjust Parameters</span>
        <svg 
          className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Lump Sum & Annuity</h3>
              <SliderWithNumber
                label="Lump Sum (₹)"
                min={100000}
                max={10000000}
                step={50000}
                value={lumpSum}
                onChange={setLumpSum}
              />
              <SliderWithNumber
                label="Annuity per Year (₹)"
                min={50000}
                max={1000000}
                step={10000}
                value={annuity}
                onChange={setAnnuity}
              />
              <SliderWithNumber
                label="Annuity Step-up (% / yr)"
                min={0}
                max={15}
                step={0.5}
                value={annuityEscalationPct}
                onChange={handleStepUpChange}
                id="break-even-step-up-slider"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Rates & Horizon</h3>
              <SliderWithNumber
                label="Nominal Return (% / yr)"
                min={-5}
                max={20}
                step={0.25}
                value={nominalReturnPct}
                onChange={setNominalReturnPct}
              />
              <SliderWithNumber
                label="Inflation (% / yr)"
                min={0}
                max={12}
                step={0.25}
                value={inflationPct}
                onChange={setInflationPct}
              />
              <SliderWithNumber
                label="Retirement Age (years)"
                min={40}
                max={75}
                step={1}
                value={startAge}
                onChange={setStartAge}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SliderWithNumber({ label, min, max, step, value, onChange, id }) {
  return (
    <div id={id}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm text-slate-700">{label}</label>
        <div className="text-xs text-slate-500">
          {typeof value === "number"
            ? label.toLowerCase().includes("%")
              ? `${value}%`
              : label.toLowerCase().includes("₹")
              ? inr.format(value)
              : value
            : value}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          className="w-full accent-blue-600"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <input
          type="number"
          className="w-32 px-2 py-1 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-400 mt-1">
        <span>
          {label.toLowerCase().includes("%")
            ? `${min}%`
            : label.toLowerCase().includes("₹")
            ? inr.format(min)
            : min}
        </span>
        <span>
          {label.toLowerCase().includes("%")
            ? `${max}%`
            : label.toLowerCase().includes("₹")
            ? inr.format(max)
            : max}
        </span>
      </div>
    </div>
  );
}
