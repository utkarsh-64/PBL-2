import React from "react";
import {
  Calculator,
  TrendingUp,
  Shield,
  HelpCircle,
  FileText,
  Settings,
} from "lucide-react";

const QuickActionsComponent = ({ onAction }) => {
  const actions = [
    {
      icon: Calculator,
      title: "Calculate Scenarios",
      description: "Generate new retirement scenarios",
      action:
        "I'd like to calculate new retirement scenarios with different parameters",
    },
    {
      icon: TrendingUp,
      title: "Market Analysis",
      description: "Current market impact on retirement",
      action: "How do current market conditions affect my retirement planning?",
    },
    {
      icon: Shield,
      title: "Tax Optimization",
      description: "Minimize tax burden strategies",
      action: "Show me strategies to minimize my tax burden in retirement",
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Common retirement questions",
      action: "What are the most common questions about retirement planning?",
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Required documents checklist",
      action: "What documents do I need for retirement planning?",
    },
    {
      icon: Settings,
      title: "Update Profile",
      description: "Modify your information",
      action: "I'd like to update my profile information",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Quick Actions
        </h3>
        <p className="text-sm text-gray-600">What would you like to do next?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => onAction(action.action)}
              className="flex items-start space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Icon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsComponent;
