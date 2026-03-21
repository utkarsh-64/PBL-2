import React from "react";
import { BarChart3, Play, MessageCircle } from "lucide-react";

const DemoComponent = ({ onAction }) => {
  const demoScenarios = [
    {
      id: "lump-sum",
      name: "Lump Sum Withdrawal",
      monthlyIncome: 45000,
      taxImplication: 600000,
      suitability: 75,
    },
    {
      id: "annuity",
      name: "Life Annuity",
      monthlyIncome: 38000,
      taxImplication: 200000,
      suitability: 90,
    },
    {
      id: "phased",
      name: "Phased Withdrawal",
      monthlyIncome: 42000,
      taxImplication: 300000,
      suitability: 85,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Try the Chart Features
        </h3>
        <p className="text-sm text-gray-600">
          Here are some quick ways to see the interactive charts and
          visualizations
        </p>
      </div>

      {/* Demo Scenarios Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Sample Scenarios</h4>
        <div className="grid gap-2">
          {demoScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="font-medium">{scenario.name}</span>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  ₹{scenario.monthlyIncome.toLocaleString("en-IN")}/month
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    scenario.suitability >= 85
                      ? "bg-green-100 text-green-800"
                      : scenario.suitability >= 75
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {scenario.suitability}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Chart Actions */}
      <div className="space-y-3">
        <button
          onClick={() =>
            onAction("Show me a comparison chart of retirement scenarios")
          }
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span>View Interactive Charts</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              onAction("I'm 58 years old with ₹20,00,000 pension amount")
            }
            className="btn-secondary flex items-center justify-center space-x-2 text-sm"
          >
            <Play className="h-4 w-4" />
            <span>Quick Demo</span>
          </button>
          <button
            onClick={() => onAction("Generate scenarios with sample data")}
            className="btn-secondary flex items-center justify-center space-x-2 text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Sample Data</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 text-sm mb-1">
          How to see charts:
        </h5>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>
            • Complete your profile first, then ask for "comparison chart"
          </li>
          <li>• Try: "Show me income projections over 20 years"</li>
          <li>• Ask: "Compare all scenarios side by side"</li>
          <li>• Say: "I want to see the suitability scores"</li>
        </ul>
      </div>
    </div>
  );
};

export default DemoComponent;
