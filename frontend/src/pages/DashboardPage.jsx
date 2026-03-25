import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import RetirementChart from "../components/dashboard/RetirementChart";
import RetirementSimulationChart from "../components/dashboard/RetirementSimulationChart";
import PayoutComparison from "../components/dashboard/PayoutComparison";
import BreakEvenChart from "../components/dashboard/BreakEvenChart";
import { useDispatch, useSelector } from "react-redux";
import {
  setMonthlyContribution,
  setRetirementAge,
  setRetirementExpense,
  setLifestyle,
  setActiveScenario,
  setCurrentAge,
} from "../redux/slices/dashboardSlice";
import InflationPredictionChart from "../components/dashboard/InflationPredictionChart";
import ChartExplanationIcon from "../components/ChartExplanationIcon";
import AIInsightCard from "../components/dashboard/AIInsightCard";
import BucketAdvisory from "../components/dashboard/BucketAdvisory";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { userData } = useSelector((state) => state.userData);
  const dispatch = useDispatch();
  const {
    currentAge,
    monthlyIncome,
    monthlyContribution,
    retirementAge,
    lifeExpectancy,
    retirementExpense,
    lifestyle,
    taxBracket,
    inflationRate,
    activeScenario,
  } = useSelector((state) => state.dashboardData);

  useEffect(() => {
    dispatch(setCurrentAge(Number(userData.age || 30)));
    dispatch(setRetirementAge(Number(userData.plannedRetirementAge || 60)));
    dispatch(
      setRetirementExpense(Number(userData.monthlyRetirementExpense || 45000))
    );
  }, []);

  // ---------- Dynamic Calculations ----------
  const calculations = useMemo(() => {
    const yearsToRetirement = retirementAge - currentAge;
    const retirementYears = lifeExpectancy - retirementAge;
    const annualIncome = monthlyIncome * 12;

    console.log(yearsToRetirement);

    // Calculate corpus needed
    const futureValueExpense =
      retirementExpense * Math.pow(1 + inflationRate, yearsToRetirement);
    const requiredCorpus =
      (futureValueExpense * 12 * retirementYears) /
      Math.pow(1.06, yearsToRetirement);

    // Calculate required monthly SIP
    const monthlyReturn = 0.12 / 12; // 12% annual return
    const monthsToRetirement = yearsToRetirement * 12;
    const requiredMonthlySIP =
      (requiredCorpus * monthlyReturn) /
      (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1);

    // Tax savings calculation
    const taxSavingsAnnual =
      Math.min(annualIncome * 0.25, 200000) * (taxBracket / 100);
    const lifetimeTaxSavings = taxSavingsAnnual * yearsToRetirement;

    // Income replacement ratio
    const replacementRatio = ((requiredMonthlySIP * 12) / annualIncome) * 100;

    return {
      requiredCorpus: Math.round(requiredCorpus / 100000) / 10, // In Crores
      monthlyPension: Math.round(futureValueExpense / 1000), // In thousands
      requiredMonthlySIP: Math.round(requiredMonthlySIP),
      taxSavingsAnnual: Math.round(taxSavingsAnnual / 1000), // In thousands
      lifetimeTaxSavings: Math.round(lifetimeTaxSavings / 100000) / 10, // In Lakhs
      replacementRatio: Math.round(replacementRatio),
      yearsToRetirement,
      retirementYears,
    };
  }, [
    currentAge,
    monthlyIncome,
    retirementAge,
    lifeExpectancy,
    retirementExpense,
    inflationRate,
    taxBracket,
  ]);

  // ---------- Scenario Data ----------
  const scenarioData = {
    base: {
      name: "Base Case",
      corpus: `₹${calculations.requiredCorpus} Cr`,
      pension: `₹${calculations.monthlyPension}K`,
      tax: `₹${calculations.lifetimeTaxSavings} L`,
      ratio: `${calculations.replacementRatio}%`,
    },
    aggressive: {
      name: "Aggressive",
      corpus: `₹${Math.round(calculations.requiredCorpus * 1.4 * 10) / 10} Cr`,
      pension: `₹${Math.round(calculations.monthlyPension * 1.4)}K`,
      tax: `₹${Math.round(calculations.lifetimeTaxSavings * 1.1 * 10) / 10} L`,
      ratio: `${Math.min(calculations.replacementRatio * 1.3, 100)}%`,
    },
    conservative: {
      name: "Conservative",
      corpus: `₹${Math.round(calculations.requiredCorpus * 0.7 * 10) / 10} Cr`,
      pension: `₹${Math.round(calculations.monthlyPension * 0.7)}K`,
      tax: `₹${Math.round(calculations.lifetimeTaxSavings * 0.8 * 10) / 10} L`,
      ratio: `${Math.round(calculations.replacementRatio * 0.7)}%`,
    },
    earlyRetirement: {
      name: "Early Retirement (55)",
      corpus: `₹${Math.round(calculations.requiredCorpus * 0.6 * 10) / 10} Cr`,
      pension: `₹${Math.round(calculations.monthlyPension * 0.6)}K`,
      tax: `₹${Math.round(calculations.lifetimeTaxSavings * 0.7 * 10) / 10} L`,
      ratio: `${Math.round(calculations.replacementRatio * 0.6)}%`,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* Header */}
          <div className="text-left mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r  text-black bg-clip-text mb-4">
              Welcome to your Dashboard
            </h1>
          </div>

          {/* Enhanced KPI Inputs */}
          <div className="bg-gradient-to-r rounded-xl p-8 mb-3 col-span-12 lg:col-span-8 shadow-xl border border-blue-200/50 transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 p-2 rounded-full mr-3">👤</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Contribution (₹)
                </label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) =>
                    dispatch(
                      setMonthlyContribution(Number(e.target.value) || 0)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retirement Age
                </label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) =>
                    dispatch(setRetirementAge(Number(e.target.value) || 60))
                  }
                  min="50"
                  max="70"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retirement Expense (₹/month)
                </label>
                <input
                  type="number"
                  value={retirementExpense}
                  onChange={(e) =>
                    dispatch(setRetirementExpense(Number(e.target.value) || 0))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-teal-500">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lifestyle
                </label>
                <select
                  value={lifestyle}
                  onChange={(e) => dispatch(setLifestyle(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="Minimalistic">Minimalistic</option>
                  <option value="Comfortable">Comfortable</option>
                  <option value="Lavish">Lavish</option>
                </select>
              </div>
            </div>
          </div>

          {/* KPI Dashboard */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-center">
                ₹{calculations.requiredCorpus}Cr
              </div>
              <div className="text-blue-100 mt-1 text-sm text-center">
                Required Corpus
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-center">
                ₹{calculations.monthlyPension}K
              </div>
              <div className="text-green-100 mt-1 text-sm text-center">
                Monthly Pension
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-center">
                {calculations.replacementRatio}%
              </div>
              <div className="text-purple-100 mt-1 text-sm text-center">
                Income Replacement
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-center">
                ₹{calculations.lifetimeTaxSavings}L
              </div>
              <div className="text-yellow-100 mt-1 text-sm text-center">
                Tax Savings
              </div>
            </div>
          </div> */}

          {/* Bento Grid Layout for Charts */}
          <div className="flex flex-col gap-4 mb-3">
            {/* Income Triangle Chart - Large Card */}
            <div className="col-span-12 lg:col-span-6 bg-gradient-to-br rounded-3xl shadow-xl p-8 border border-blue-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative">
              <ChartExplanationIcon chartType="retirementCorpus" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl mr-4 shadow-lg">
                  📈
                </span>
                Retirement Corpus Projection
              </h3>
              <RetirementChart 
                currentAge={currentAge}
                lifeExpectancy={lifeExpectancy}
                annualContribution={monthlyContribution * 12}
                initialSavings={
                  (parseInt(userData?.fixedDepositAmount) || 0) +
                  (parseInt(userData?.mutualFundAmount) || 0) +
                  (parseInt(userData?.stockInvestmentAmount) || 0) || 500000
                }
              />
              <AIInsightCard
                chartType="Retirement Corpus Projection"
                chartData={`Current age: ${currentAge}. Planned retirement age: ${retirementAge}. Life expectancy: ${lifeExpectancy} years. Monthly contribution: ₹${monthlyContribution}. Initial savings: ₹${(parseInt(userData?.fixedDepositAmount) || 0) + (parseInt(userData?.mutualFundAmount) || 0) + (parseInt(userData?.stockInvestmentAmount) || 0) || 500000}. Required corpus: ₹${calculations.requiredCorpus} Crores. Required monthly SIP: ₹${calculations.requiredMonthlySIP}.`}
              />
            </div>

            <div className="rounded-3xl shadow-xl p-8 border border-blue-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative">
              <ChartExplanationIcon chartType="breakEven" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl mr-4 shadow-lg">
                  📈
                </span>
                Break Even: Lump Sum vs Annuity
              </h3>
              <p className="text-slate-600">
                Inflation-adjusted, compounding analysis in real terms.
              </p>
              <BreakEvenChart />
              <AIInsightCard
                chartType="Break Even Analysis: Lump Sum vs Annuity"
                chartData={`Retirement age: ${retirementAge}. Life expectancy: ${lifeExpectancy} years. Required corpus: ₹${calculations.requiredCorpus} Crores. Monthly pension target: ₹${calculations.monthlyPension}K. Tax bracket: ${taxBracket}%. Years in retirement: ${calculations.retirementYears}.`}
              />
            </div>

            {/* Optimal Retirement Age - Medium Card */}
            <div className="rounded-3xl shadow-xl p-6 border border-green-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl mr-4 shadow-lg">
                    📈
                  </span>
                  Payout Comparison
                </h3>
                <PayoutComparison corpusValue={calculations.requiredCorpus * 10000000} />
                <AIInsightCard
                  chartType="Payout Comparison (Lump Sum vs Annuity vs Phased)"
                  chartData={`Required corpus: ₹${calculations.requiredCorpus} Crores. Monthly pension target: ₹${calculations.monthlyPension}K. Retirement age: ${retirementAge}. Life expectancy: ${lifeExpectancy} years. Tax bracket: ${taxBracket}%.`}
                />
              </div>
            </div>

            <div className="rounded-3xl shadow-xl p-6 border border-teal-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-xl mr-3 shadow-lg">
                  📉
                </span>
                Inflation Impact Projection
              </h3>
              <InflationPredictionChart />
              <AIInsightCard
                chartType="Inflation Impact Projection"
                chartData={`Current age: ${currentAge}. Retirement age: ${retirementAge}. Inflation rate: ${(inflationRate * 100).toFixed(1)}%. Monthly retirement expense goal: ₹${retirementExpense.toLocaleString('en-IN')}. Life expectancy: ${lifeExpectancy} years. Years in retirement: ${calculations.retirementYears}.`}
              />
            </div>

            <div className="rounded-3xl shadow-xl p-6 border border-green-200/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-xl mr-3 shadow-lg">
                  🎯
                </span>
                Optimal Retirement Age
              </h3>
              <div className="mb-4">
                <RetirementSimulationChart />
              </div>
              <AIInsightCard
                chartType="Optimal Retirement Age Simulation"
                chartData={`Current age: ${currentAge}. Planned retirement age: ${retirementAge}. Life expectancy: ${lifeExpectancy} years. Monthly contribution: ₹${monthlyContribution.toLocaleString('en-IN')}. Monthly retirement expense: ₹${retirementExpense.toLocaleString('en-IN')}. Required corpus: ₹${calculations.requiredCorpus} Crores. Required monthly SIP: ₹${calculations.requiredMonthlySIP.toLocaleString('en-IN')}.`}
              />
            </div>
          </div>

          {/* Scenario Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-indigo-100 p-2 rounded-full mr-3">🔄</span>
              What-If Scenarios
            </h3>

            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(scenarioData).map(([key, scenario]) => (
                <button
                  key={key}
                  onClick={() => dispatch(setActiveScenario(key))}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${activeScenario === key
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {scenario.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm text-blue-600 font-medium">
                  Final Corpus
                </div>
                <div className="text-2xl font-bold text-blue-800">
                  {scenarioData[activeScenario].corpus}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-600 font-medium">
                  Monthly Pension
                </div>
                <div className="text-2xl font-bold text-green-800">
                  {scenarioData[activeScenario].pension}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm text-purple-600 font-medium">
                  Tax Savings
                </div>
                <div className="text-2xl font-bold text-purple-800">
                  {scenarioData[activeScenario].tax}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="text-sm text-yellow-600 font-medium">
                  Replacement Ratio
                </div>
                <div className="text-2xl font-bold text-yellow-800">
                  {scenarioData[activeScenario].ratio}
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 mt-6">
              <p className="text-sm text-indigo-800">
                <strong>AI Insight:</strong> The{" "}
                {scenarioData[activeScenario].name} scenario
                {activeScenario === "aggressive"
                  ? "offers higher returns with increased market risk. Consider this if you have high risk tolerance."
                  : activeScenario === "conservative"
                    ? "prioritizes capital protection over growth. Suitable for risk-averse investors."
                    : activeScenario === "earlyRetirement"
                      ? "requires higher monthly contributions but offers more leisure years."
                      : "provides balanced growth with moderate risk. Recommended for most individuals."}
              </p>
            </div>
          </div>

          {/* BucketAdvisory — AI investment plan based on the active scenario */}
          <BucketAdvisory
            corpus={calculations.requiredCorpus * 10000000}
            riskProfile={activeScenario === 'aggressive' ? 'Aggressive' : activeScenario === 'conservative' ? 'Conservative' : 'Moderate'}
            selectedScenario={activeScenario === 'earlyRetirement' ? 'phased' : activeScenario}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
