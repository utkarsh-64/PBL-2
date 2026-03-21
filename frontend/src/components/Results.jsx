import React, { useState } from "react";
import {
  Download,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

const Results = ({ scenarios }) => {
  const [selectedScenario, setSelectedScenario] = useState(
    scenarios[0]?.id || ""
  );
  const [showAIChat, setShowAIChat] = useState(false);

  if (!scenarios.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          No scenarios available. Please generate scenarios first.
        </p>
      </div>
    );
  }

  const selectedScenarioData = scenarios.find((s) => s.id === selectedScenario);
  const bestScenario = scenarios.reduce((best, current) =>
    current.suitability > best.suitability ? current : best
  );

  const recommendations = [
    {
      type: "success",
      icon: CheckCircle,
      title: "Recommended Strategy",
      content: `Based on your profile, ${bestScenario.name} appears to be the best fit with a ${bestScenario.suitability}% suitability score.`,
    },
    {
      type: "warning",
      icon: AlertTriangle,
      title: "Tax Considerations",
      content:
        "Consider the timing of withdrawals to optimize your tax bracket. Consult with a tax advisor for personalized advice.",
    },
    {
      type: "info",
      icon: Info,
      title: "Market Conditions",
      content:
        "Current market volatility may affect returns. Consider dollar-cost averaging for lump-sum investments.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Detailed Analysis & Recommendations
        </h1>
        <p className="text-gray-600">
          Comprehensive breakdown of your retirement strategy options
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          Select Scenario for Details
        </h2>
        <div className="grid md:grid-cols-4 gap-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                selectedScenario === scenario.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">{scenario.name}</div>
              <div className="text-sm text-gray-600">
                {scenario.suitability}% match
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      {selectedScenarioData && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Scenario Details */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">
                {selectedScenarioData.name} - Detailed Breakdown
              </h3>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    ₹
                    {selectedScenarioData.monthlyIncome.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Income</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₹
                    {(
                      selectedScenarioData.monthlyIncome *
                      12 *
                      20
                    ).toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-gray-600">20-Year Total</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    ₹
                    {selectedScenarioData.taxImplication.toLocaleString(
                      "en-IN"
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Tax Impact</div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h4 className="text-lg font-medium mb-3">
                  How This Strategy Works
                </h4>
                <p className="text-gray-600 mb-4">
                  {selectedScenarioData.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">
                      Advantages
                    </h5>
                    <ul className="space-y-1">
                      {selectedScenarioData.pros.map((pro, index) => (
                        <li
                          key={index}
                          className="text-gray-600 flex items-start"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">
                      Considerations
                    </h5>
                    <ul className="space-y-1">
                      {selectedScenarioData.cons.map((con, index) => (
                        <li
                          key={index}
                          className="text-gray-600 flex items-start"
                        >
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chat Interface */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">
                  Ask AI About This Strategy
                </h3>
                <button
                  onClick={() => setShowAIChat(!showAIChat)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{showAIChat ? "Hide" : "Show"} Chat</span>
                </button>
              </div>

              {showAIChat && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-4 p-3 bg-white rounded border-l-4 border-primary-500">
                    <p className="text-sm text-gray-700">
                      <strong>AI Assistant:</strong> I can help explain the
                      details of your selected strategy, compare it with
                      alternatives, or answer questions about tax implications,
                      risks, and timing. What would you like to know?
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Ask about tax implications, risks, or alternatives..."
                      className="input-field flex-1"
                    />
                    <button className="btn-primary">Send</button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "What are the tax implications?",
                      "How does inflation affect this?",
                      "What if I live longer than expected?",
                      "Can I change strategies later?",
                    ].map((question) => (
                      <button
                        key={question}
                        className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                Key Recommendations
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => {
                  const Icon = rec.icon;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        rec.type === "success"
                          ? "border-green-500 bg-green-50"
                          : rec.type === "warning"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-blue-500 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <Icon
                          className={`h-5 w-5 mt-0.5 ${
                            rec.type === "success"
                              ? "text-green-600"
                              : rec.type === "warning"
                              ? "text-yellow-600"
                              : "text-blue-600"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {rec.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
                <button className="w-full btn-secondary">
                  Schedule Consultation
                </button>
                <button className="w-full btn-secondary">
                  Save to Dashboard
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                Scenario Comparison
              </h3>
              <div className="space-y-3">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{scenario.name}</span>
                    <div
                      className={`px-2 py-1 rounded text-xs ${
                        scenario.suitability >= 90
                          ? "bg-green-100 text-green-800"
                          : scenario.suitability >= 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {scenario.suitability}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
