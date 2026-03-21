import React, { useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";

const RiskAssessmentComponent = ({ userData, onSubmit, onUpdate }) => {
  const [selectedRisk, setSelectedRisk] = useState(
    userData.riskTolerance || "moderate"
  );
  const [selectedGoals, setSelectedGoals] = useState(userData.goals || []);

  const riskOptions = [
    {
      value: "conservative",
      title: "Conservative",
      description:
        "Prefer stability and guaranteed returns over growth potential",
      characteristics: [
        "Low volatility",
        "Capital preservation",
        "Predictable income",
      ],
    },
    {
      value: "moderate",
      title: "Moderate",
      description: "Balanced approach between growth and stability",
      characteristics: [
        "Moderate volatility",
        "Balanced growth",
        "Diversified strategy",
      ],
    },
    {
      value: "aggressive",
      title: "Aggressive",
      description:
        "Willing to accept higher risk for potentially higher returns",
      characteristics: [
        "Higher volatility",
        "Growth focused",
        "Long-term perspective",
      ],
    },
  ];

  const goalOptions = [
    "Maximize monthly income",
    "Minimize tax burden",
    "Ensure spouse coverage",
    "Leave inheritance",
    "Inflation protection",
    "Liquidity access",
  ];

  const handleGoalToggle = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = () => {
    const updateData = {
      riskTolerance: selectedRisk,
      goals: selectedGoals,
    };
    onUpdate((prev) => ({ ...prev, ...updateData }));
    onSubmit("I've completed my risk assessment and goals", updateData);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Risk Tolerance & Goals Assessment
        </h3>
        <p className="text-sm text-gray-600">
          This helps me recommend the most suitable retirement strategies for
          you
        </p>
      </div>

      <div className="space-y-6">
        {/* Risk Tolerance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            What's your investment risk tolerance?
          </h4>
          <div className="space-y-3">
            {riskOptions.map((option) => (
              <label key={option.value} className="cursor-pointer block">
                <input
                  type="radio"
                  name="riskTolerance"
                  value={option.value}
                  checked={selectedRisk === option.value}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    selectedRisk === option.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">
                        {option.title}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {option.characteristics.map((char, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedRisk === option.value && (
                      <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            What are your retirement goals? (Select all that apply)
          </h4>
          <div className="grid md:grid-cols-2 gap-2">
            {goalOptions.map((goal) => (
              <label
                key={goal}
                className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedGoals.includes(goal)}
                  onChange={() => handleGoalToggle(goal)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="btn-primary flex items-center space-x-2"
          >
            <span>Generate My Scenarios</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentComponent;
