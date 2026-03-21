import { Bot, User, Paperclip } from "lucide-react";
import WelcomeComponent from "./chat/WelcomeComponent";
import BasicInfoFormComponent from "./chat/BasicInfoFormComponent";
import IncomeStatusFormComponent from "./chat/IncomeStatusFormComponent";
import RetirementInfoFormComponent from "./chat/RetirementInfoFormComponent";
import RiskToleranceFormComponent from "./chat/RiskToleranceFormComponent";
import ScenarioVisualizationComponent from "./chat/ScenarioVisualizationComponent";
import ComparisonChartComponent from "./chat/ComparisonChartComponent";
import RecommendationComponent from "./chat/RecommendationComponent";
import QuickActionsComponent from "./chat/QuickActionsComponent";
import DemoComponent from "./chat/DemoComponent";
import LifeExpectancyFormComponent from "./chat/LifeExpectancyFormComponent";
import ExternalResources from "./ExternalResources";
import Markdown from "react-markdown";

const ChatMessage = ({
  message,
  scenarios,
  onFormSubmit,
  onUpdateScenarios,
}) => {
  const isBot = message.type === "bot";

  const renderComponent = () => {
    switch (message.component) {
      case "welcome":
        return <WelcomeComponent onAction={onFormSubmit} />;
      case "basic-info-form":
        return <BasicInfoFormComponent onSubmit={onFormSubmit} />;
      case "income-status-form":
        return <IncomeStatusFormComponent onSubmit={onFormSubmit} />;
      case "retirement-info-form":
        return <RetirementInfoFormComponent onSubmit={onFormSubmit} />;
      case "life-expectancy-form":
        return <LifeExpectancyFormComponent onSubmit={onFormSubmit} />;
      case "risk-tolerance-form":
        return <RiskToleranceFormComponent onSubmit={onFormSubmit} />;
      case "scenario-visualization":
        return (
          <ScenarioVisualizationComponent
            scenarios={message.data?.scenarios || scenarios}
            onAction={onFormSubmit}
          />
        );
      case "comparison-chart":
        return (
          <ComparisonChartComponent
            scenarios={message.data?.scenarios || scenarios}
            chartType={message.data?.chartType || "income"}
          />
        );
      case "recommendation":
        return (
          <RecommendationComponent
            recommendation={message.data}
            onAction={onFormSubmit}
          />
        );
      case "quick-actions":
        return <QuickActionsComponent onAction={onFormSubmit} />;
      case "demo":
        return <DemoComponent onAction={onFormSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 ${
        isBot ? "" : "flex-row-reverse space-x-reverse"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
          isBot ? "bg-primary-600" : "bg-gray-600"
        }`}
      >
        {isBot ? (
          <Bot className="h-4 w-4 text-white" />
        ) : (
          <User className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`max-w-3xl ${isBot ? "" : "text-right"}`}>
        {(message.content || (message.files && message.files.length > 0)) && (
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm mb-3 ${
              isBot
                ? "bg-white rounded-tl-sm"
                : "bg-primary text-white rounded-tr-sm"
            }`}
          >
            {/* Message text */}
            {message.content && (
              <div className="prose prose-sm max-w-none">
                {/* eslint-disable-next-line */}
                <Markdown>{message.content}</Markdown>
              </div>
            )}
            {/* ✅ File attachments */}
            {message.files && message.files.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.files.map((file, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm ${
                      isBot
                        ? "bg-gray-100 text-gray-800"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <Paperclip size={14} className="text-gray-500" />
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Render interactive components */}
        {message.component && (
          <div className="form-slide-in">{renderComponent()}</div>
        )}

        {/* External Resources */}
        {message.external_resources && (
          <div className="mt-3">
            <ExternalResources resources={message.external_resources} />
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-xs text-gray-500 mt-1 ${isBot ? "" : "text-right"}`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
