import React from 'react';
import RetirementChart from '../dashboard/RetirementChart';
import PayoutComparison from '../dashboard/PayoutComparison';
import AIInsightCard from '../dashboard/AIInsightCard';
import { useSelector } from 'react-redux';

const ChatChartComponent = ({ type, data }) => {
  const { userData } = useSelector((state) => state.userData);
  const {
    retirementAge,
    lifeExpectancy,
    monthlyContribution,
    retirementExpense,
    taxBracket,
    currentAge,
  } = useSelector((state) => state.dashboardData);

  const age      = currentAge  || userData?.age       || 30;
  const retAge   = retirementAge                       || 60;
  const lifeExp  = lifeExpectancy                      || 85;
  const monthly  = monthlyContribution || (userData?.monthlyContribution || 10000);
  const expense  = retirementExpense   || 50000;
  const tax      = taxBracket          || 20;
  const initSavings =
    (parseInt(userData?.fixedDepositAmount) || 0) +
    (parseInt(userData?.mutualFundAmount)   || 0) +
    (parseInt(userData?.stockInvestmentAmount) || 0) || 500000;

  const renderChart = () => {
    switch (type) {
      case 'chart-retirement':
        return (
          <>
            <div className="h-[400px] w-full bg-white rounded-xl p-2">
              <RetirementChart
                currentAge={age}
                lifeExpectancy={lifeExp}
                annualContribution={monthly * 12}
                initialSavings={initSavings}
              />
            </div>
            <AIInsightCard
              chartType="Retirement Corpus Growth (Chat)"
              chartData={`Current age: ${age}. Retirement age: ${retAge}. Life expectancy: ${lifeExp} years. Monthly contribution: ₹${monthly.toLocaleString('en-IN')}. Initial savings: ₹${initSavings.toLocaleString('en-IN')}. Monthly retirement expense goal: ₹${expense.toLocaleString('en-IN')}.`}
            />
          </>
        );

      case 'payout-comparison': {
        const corpus = data?.corpus || 10000000;
        return (
          <>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center select-none">
                Lump Sum vs Annuity vs Phased Payout
              </h4>
              <div className="h-[300px]">
                <PayoutComparison corpusValue={corpus} />
              </div>
            </div>
            <AIInsightCard
              chartType="Payout Comparison: Lump Sum vs Annuity vs Phased (Chat)"
              chartData={`Total retirement corpus: ₹${(corpus / 1e7).toFixed(2)} Crores (₹${corpus.toLocaleString('en-IN')}). Retirement age: ${retAge}. Life expectancy: ${lifeExp} years. Monthly expense goal: ₹${expense.toLocaleString('en-IN')}. Tax bracket: ${tax}%.`}
            />
          </>
        );
      }

      default:
        return (
          <div className="p-4 text-gray-500 italic">
            Chart type "{type}" not supported yet.
          </div>
        );
    }
  };

  return (
    <div className="w-full mt-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-1">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default ChatChartComponent;
