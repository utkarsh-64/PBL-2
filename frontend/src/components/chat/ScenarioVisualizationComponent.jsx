import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Eye,
  BarChart3,
  Calendar,
} from "lucide-react";

const ScenarioVisualizationComponent = ({ scenarios, onAction }) => {
  const [selectedScenario, setSelectedScenario] = useState(null);

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        <p className="text-gray-600">No scenarios available yet.</p>
      </div>
    );
  }

  const bestScenario = scenarios.reduce((best, current) =>
    current.suitability > best.suitability ? current : best
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Your Personalized Retirement Scenarios
        </h3>
        <p className="text-sm text-gray-600">
          Based on your profile, here are the retirement strategies I recommend
        </p>
      </div>

      {/* Best Recommendation Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">
            Recommended Strategy
          </span>
        </div>
        <p className="text-sm text-green-700">
          <strong>{bestScenario.name}</strong> appears to be the best fit with a{" "}
          {bestScenario.suitability}% suitability score based on your risk
          tolerance and goals.
        </p>
      </div>

      {/* Scenario Cards */}
      <div className="grid gap-4 mb-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              selectedScenario === scenario.id
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() =>
              setSelectedScenario(
                selectedScenario === scenario.id ? null : scenario.id
              )
            }
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  <span>{scenario.name}</span>
                  {scenario.id === bestScenario.id && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {scenario.description}
                </p>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scenario.riskLevel === "High"
                    ? "bg-red-100 text-red-800"
                    : scenario.riskLevel === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {scenario.riskLevel} Risk
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center p-2 bg-gray-50 rounded">
                <Calendar className="h-4 w-4 text-primary-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">
                  ₹{scenario.monthlyIncome.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-gray-600">Monthly</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <Shield className="h-4 w-4 text-warning-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">
                  ₹{scenario.taxImplication.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-gray-600">Tax Impact</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold">
                  {scenario.suitability}%
                </div>
                <div className="text-xs text-gray-600">Match</div>
              </div>
            </div>

            {selectedScenario === scenario.id && (
              <div className="border-t pt-3 mt-3">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-green-700 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Advantages
                    </h5>
                    <ul className="space-y-1">
                      {scenario.pros.map((pro, index) => (
                        <li key={index} className="text-gray-600 text-xs">
                          • {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-700 mb-2 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Considerations
                    </h5>
                    <ul className="space-y-1">
                      {scenario.cons.map((con, index) => (
                        <li key={index} className="text-gray-600 text-xs">
                          • {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            onAction("Show me a detailed comparison chart of these scenarios")
          }
          className="btn-primary flex items-center space-x-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span>View Comparison Chart</span>
        </button>
        <button
          onClick={() =>
            onAction(`Tell me more about the ${bestScenario.name} strategy`)
          }
          className="btn-secondary flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Analyze Best Option</span>
        </button>
        <button
          onClick={() =>
            onAction("What are the tax implications of each scenario?")
          }
          className="btn-secondary text-sm"
        >
          Tax Analysis
        </button>
      </div>
    </div>
  );
};

export default ScenarioVisualizationComponent;
