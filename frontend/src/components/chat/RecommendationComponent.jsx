import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Calendar,
  MessageCircle,
} from "lucide-react";

const RecommendationComponent = ({ recommendation, onAction }) => {
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
      default:
        return Info;
    }
  };

  const getColorClasses = (type) => {
    switch (type) {
      case "success":
        return "border-green-500 bg-green-50 text-green-800";
      case "warning":
        return "border-yellow-500 bg-yellow-50 text-yellow-800";
      case "info":
        return "border-blue-500 bg-blue-50 text-blue-800";
      default:
        return "border-blue-500 bg-blue-50 text-blue-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {recommendation.title || "Personalized Recommendation"}
        </h3>
        {recommendation.subtitle && (
          <p className="text-sm text-gray-600">{recommendation.subtitle}</p>
        )}
      </div>

      {/* Main Recommendation */}
      {recommendation.main && (
        <div
          className={`p-4 rounded-lg border-l-4 mb-6 ${getColorClasses(
            recommendation.main.type
          )}`}
        >
          <div className="flex items-start space-x-3">
            {React.createElement(getIcon(recommendation.main.type), {
              className: `h-5 w-5 mt-0.5 ${
                recommendation.main.type === "success"
                  ? "text-green-600"
                  : recommendation.main.type === "warning"
                  ? "text-yellow-600"
                  : "text-blue-600"
              }`,
            })}
            <div>
              <h4 className="font-medium">{recommendation.main.title}</h4>
              <p className="text-sm mt-1">{recommendation.main.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Points */}
      {recommendation.points && recommendation.points.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Key Considerations</h4>
          <div className="space-y-3">
            {recommendation.points.map((point, index) => {
              const Icon = getIcon(point.type);
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${getColorClasses(
                    point.type
                  )}`}
                >
                  <div className="flex items-start space-x-2">
                    <Icon
                      className={`h-4 w-4 mt-0.5 ${
                        point.type === "success"
                          ? "text-green-600"
                          : point.type === "warning"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    />
                    <div>
                      <h5 className="font-medium text-sm">{point.title}</h5>
                      <p className="text-xs mt-1">{point.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Items */}
      {recommendation.actions && recommendation.actions.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">
            Recommended Next Steps
          </h4>
          <div className="space-y-2">
            {recommendation.actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
              >
                <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            onAction("Generate a detailed report for this recommendation")
          }
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </button>
        <button
          onClick={() => onAction("I have questions about this recommendation")}
          className="btn-secondary flex items-center space-x-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Ask Questions</span>
        </button>
      </div>
    </div>
  );
};

export default RecommendationComponent;
