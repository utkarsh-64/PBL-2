import React, { useState } from 'react';

const SIPCalculator = () => {
  const [mode, setMode] = useState('SIP'); // 'SIP' or 'Lumpsum'
  
  // SIP State
  const [sipAmount, setSipAmount] = useState(25000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);
  
  // Lumpsum State
  const [lumpsumAmount, setLumpsumAmount] = useState(5504000);
  const [lumpsumRate, setLumpsumRate] = useState(6.5);
  const [lumpsumYears, setLumpsumYears] = useState(15);

  // FD State
  const [fdAmount, setFdAmount] = useState(1515000);
  const [fdRate, setFdRate] = useState(10.4);
  const [fdPeriod, setFdPeriod] = useState(5);
  const [fdType, setFdType] = useState('Years'); // 'Years', 'Months', 'Days'

  // Calculations
  let investedAmount = 0;
  let estimatedReturns = 0;
  let totalValue = 0;

  if (mode === 'SIP') {
    investedAmount = sipAmount * 12 * sipYears;
    const monthlyRate = sipRate / 12 / 100;
    const months = sipYears * 12;
    // Future Value of SIP formula
    totalValue = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    estimatedReturns = totalValue - investedAmount;
  } else if (mode === 'Lumpsum') {
    investedAmount = lumpsumAmount;
    totalValue = lumpsumAmount * Math.pow(1 + lumpsumRate / 100, lumpsumYears);
    estimatedReturns = totalValue - investedAmount;
  } else if (mode === 'FD') {
    investedAmount = fdAmount;
    let years = fdPeriod;
    if (fdType === 'Months') years = fdPeriod / 12;
    if (fdType === 'Days') years = fdPeriod / 365;
    // Standard quarterly compounding for FD
    totalValue = fdAmount * Math.pow(1 + (fdRate / 4 / 100), 4 * years);
    estimatedReturns = totalValue - investedAmount;
  }

  const formatCurrency = (val) => {
    return Math.round(val).toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    });
  };

  // Donut chart logic
  const investedPercent = (investedAmount / totalValue) * 100 || 0;
  const returnsPercent = (estimatedReturns / totalValue) * 100 || 0;

  // SVG parameters
  const size = 250;
  const strokeWidth = 35;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Dash array for invested (light purple) and returns (solid blue)
  const investedDash = (investedPercent / 100) * circumference;
  const returnsDash = (returnsPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl shadow-xl w-full border border-gray-100 overflow-hidden font-sans">
      <div className="p-8 flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Inputs */}
        <div className="flex-1 space-y-8">
          {/* Tabs */}
          <div className="flex items-center space-x-6 mb-4">
            <button
              onClick={() => setMode('SIP')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                mode === 'SIP' 
                ? 'bg-[#E8FAF4] text-[#00A783]' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              SIP
            </button>
            <button
              onClick={() => setMode('Lumpsum')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                mode === 'Lumpsum' 
                ? 'bg-[#E8FAF4] text-[#00A783]' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Lumpsum
            </button>
            <button
              onClick={() => setMode('FD')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                mode === 'FD' 
                ? 'bg-[#E8FAF4] text-[#00A783]' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              FD
            </button>
          </div>

          {/* Controls */}
          {mode === 'SIP' ? (
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Monthly investment</span>
                  <div className="bg-[#E8FAF4] px-4 py-2 rounded-md font-semibold text-[#00A783] flex items-center min-w-[120px] justify-between">
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={sipAmount} 
                      onChange={(e) => setSipAmount(Number(e.target.value))}
                      className="bg-transparent text-right outline-none w-full appearance-none"
                    />
                  </div>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="100000" 
                  step="500" 
                  value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A783]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Expected return rate (p.a)</span>
                  <div className="bg-[#E8FAF4] px-4 py-2 rounded-md font-semibold text-[#00A783] flex items-center min-w-[120px] justify-between">
                    <input 
                      type="number" 
                      value={sipRate} 
                      onChange={(e) => setSipRate(Number(e.target.value))}
                      className="bg-transparent text-right outline-none w-full appearance-none"
                    />
                    <span>%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="0.1" 
                  value={sipRate}
                  onChange={(e) => setSipRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A783]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Time period</span>
                  <div className="bg-[#E8FAF4] px-4 py-2 rounded-md font-semibold text-[#00A783] flex items-center min-w-[120px] justify-between">
                    <input 
                      type="number" 
                      value={sipYears} 
                      onChange={(e) => setSipYears(Number(e.target.value))}
                      className="bg-transparent text-right outline-none w-full appearance-none"
                    />
                    <span>Yr</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="40" 
                  step="1" 
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A783]"
                />
              </div>
            </div>
          ) : mode === 'Lumpsum' ? (
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Total investment</span>
                  <div className="bg-[#E8FAF4] px-4 py-2 rounded-md font-semibold text-[#00A783] flex items-center min-w-[120px] justify-between">
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={lumpsumAmount} 
                      onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                      className="bg-transparent text-right outline-none w-full appearance-none"
                    />
                  </div>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="10000000" 
                  step="10000" 
                  value={lumpsumAmount}
                  onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A783]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Expected return rate (p.a)</span>
                  <div className="bg-[#E8FAF4] px-4 py-2 rounded-md font-semibold text-[#00A783] flex items-center min-w-[120px] justify-between">
                    <input 
                      type="number" 
                      value={lumpsumRate} 
                      onChange={(e) => setLumpsumRate(Number(e.target.value))}
                      className="bg-transparent text-right outline-none w-full appearance-none"
                    />
                    <span>%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="30" 
                  step="0.1" 
                  value={lumpsumRate}
                  onChange={(e) => setLumpsumRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A783]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Time period</span>
                  <div className="bg-[#E8FAF4] px-4 py-2 rounded-md font-semibold text-[#00A783] flex items-center min-w-[120px] justify-between">
                    <input 
                      type="number" 
                      value={lumpsumYears} 
                      onChange={(e) => setLumpsumYears(Number(e.target.value))}
                      className="bg-transparent text-right outline-none w-full appearance-none"
                    />
                    <span>Yr</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="40" 
                  step="1" 
                  value={lumpsumYears}
                  onChange={(e) => setLumpsumYears(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A783]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Total investment</span>
                  <div className="bg-[#E8FAF4] px-4 py-2 rounded-md font-semibold text-[#00A783] flex items-center min-w-[120px] justify-between">
                    <span>₹</span>
                    <input 
                      type="number" 
                      value={fdAmount} 
                      onChange={(e) => setFdAmount(Number(e.target.value))}
                      className="bg-transparent text-right outline-none w-full appearance-none"
                    />
                  </div>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="10000000" 
                  step="10000" 
                  value={fdAmount}
                  onChange={(e) => setFdAmount(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A783]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600">Rate of interest (p.a)</span>
                  <div className="bg-[#E8FAF4] px-4 py-2 rounded-md font-semibold text-[#00A783] flex items-center min-w-[120px] justify-between">
                    <input 
                      type="number" 
                      value={fdRate} 
                      onChange={(e) => setFdRate(Number(e.target.value))}
                      className="bg-transparent text-right outline-none w-full appearance-none"
                    />
                    <span>%</span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  step="0.1" 
                  value={fdRate}
                  onChange={(e) => setFdRate(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A783]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-slate-600">
                    <span className="mr-2">Time period</span>
                    <select 
                      value={fdType} 
                      onChange={(e) => setFdType(e.target.value)} 
                      className="text-[#00A783] bg-transparent outline-none font-medium cursor-pointer"
                    >
                      <option value="Years">Years</option>
                      <option value="Months">Months</option>
                      <option value="Days">Days</option>
                    </select>
                  </div>
                  <div className="bg-[#E8FAF4] px-4 py-2 rounded-md font-semibold text-[#00A783] flex items-center min-w-[120px] justify-between">
                    <input 
                      type="number" 
                      value={fdPeriod} 
                      onChange={(e) => setFdPeriod(Number(e.target.value))}
                      className="bg-transparent text-right outline-none w-full appearance-none object-right"
                    />
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max={fdType === 'Years' ? 40 : fdType === 'Months' ? 120 : 3650} 
                  step="1" 
                  value={fdPeriod}
                  onChange={(e) => setFdPeriod(Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00A783]"
                />
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-8 space-y-4 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Invested amount</span>
              <span className="text-slate-800 font-bold">₹{formatCurrency(investedAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Est. returns</span>
              <span className="text-slate-800 font-bold">₹{formatCurrency(estimatedReturns)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Total value</span>
              <span className="text-slate-800 font-bold text-lg">₹{formatCurrency(totalValue)}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="flex-1 flex flex-col items-center justify-center lg:items-end mt-8 lg:mt-0 relative">
          
          {/* Legend */}
          <div className="w-full flex justify-center space-x-8 mb-8 mt-2">
            <div className="flex items-center text-sm text-slate-500">
              <div className="w-6 h-3 bg-[#EEF2FF] rounded-full mr-2"></div>
              {mode === 'SIP' ? 'Invested amount' : 'Total investment'}
            </div>
            <div className="flex items-center text-sm text-slate-500">
              <div className="w-6 h-3 bg-[#5465FF] rounded-full mr-2"></div>
              {mode === 'FD' ? 'Total returns' : 'Est. returns'}
            </div>
          </div>

          {/* SVG Donut */}
          <div className="flex justify-center items-center relative mb-8" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#EEF2FF"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#5465FF"
                strokeWidth={strokeWidth}
                strokeDasharray={`${returnsDash} ${circumference}`}
                strokeDashoffset={0}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>

          <button className="bg-[#00A783] hover:bg-[#009272] text-white px-8 py-3 rounded-lg font-bold tracking-wide shadow-md transition-colors w-full lg:w-auto">
            INVEST NOW
          </button>
        </div>

      </div>
    </div>
  );
};

export default SIPCalculator;
