import { useMemo } from "react";
import { useSelector } from "react-redux";

const HeatMapCell = ({ value, maxValue, minValue, label, highlight }) => {
  const intensity = (value - minValue) / (maxValue - minValue);

  const getColor = (intensity) => {
    if (intensity > 0.8) return "bg-blue-900";
    if (intensity > 0.6) return "bg-blue-700";
    if (intensity > 0.4) return "bg-blue-500";
    if (intensity > 0.2) return "bg-blue-300";
    return "bg-blue-200";
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 border border-gray-200 text-xs sm:text-sm font-medium ${getColor(
        intensity
      )} text-white transition-transform hover:scale-105 cursor-pointer`}
    >
      <div className="font-bold">{label}</div>
      <div className="opacity-90">{value.toFixed(1)}</div>
      {highlight && (
        <div className="absolute top-0 right-0 text-yellow-300 text-2xl">★</div>
      )}
    </div>
  );
};

const RetirementHeatmap = ({
  currentAge = 51,
  lifeExpectancy = 75,
  annualReturnRate = 0.05,
}) => {
  // calculate scores
  const { userData } = useSelector((state) => state.userData);
  lifeExpectancy = userData.predictedLifeExpectancy || lifeExpectancy;
  currentAge = userData.age || currentAge;
  const minAge = Math.max(51, currentAge);
  const scores = useMemo(() => {
    let result = [];
    for (let age = minAge; age <= lifeExpectancy; age++) {
      let yearsLeft = lifeExpectancy - age;
      let corpus = Math.pow(1 + annualReturnRate, age - minAge);
      let utility = corpus * yearsLeft;
      result.push({ age, yearsLeft, corpus, utility });
    }
    return result;
  }, [minAge, lifeExpectancy, annualReturnRate]);

  // normalize values (utility only)
  const values = scores.map((s) => s.utility);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // best age by utility
  const best = scores.reduce((a, b) => (a.utility > b.utility ? a : b));

  return (
    <div className="w-full p-4 space-y-6">
      {/* Insights */}
      <div className="text-center bg-green-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-green-800">
          Optimal Retirement Age: {best.age}
        </h2>
        <p className="text-sm text-green-700">
          Years to enjoy: {best.yearsLeft}, Max utility:{" "}
          {best.utility.toFixed(2)}
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center space-x-2 text-sm">
        <span>Low</span>
        <div className="flex space-x-1">
          <div className="w-4 h-4 bg-blue-200"></div>
          <div className="w-4 h-4 bg-blue-300"></div>
          <div className="w-4 h-4 bg-blue-500"></div>
          <div className="w-4 h-4 bg-blue-700"></div>
          <div className="w-4 h-4 bg-blue-900"></div>
        </div>
        <span>High</span>
      </div>

      {/* Heatmap */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-1">
        {scores.map((item) => (
          <HeatMapCell
            key={item.age}
            value={item.utility}
            maxValue={maxValue}
            minValue={minValue}
            label={item.age}
            highlight={item.age === best.age}
          />
        ))}
      </div>

      {/* Trade-offs */}
      <div className="bg-orange-50 p-4 rounded-lg text-center text-sm text-orange-700">
        <p>Earlier retirement → Less corpus growth</p>
        <p>Later retirement → Fewer years to enjoy</p>
        <p className="font-medium">Optimal age balances both</p>
      </div>
    </div>
  );
};

export default RetirementHeatmap;
