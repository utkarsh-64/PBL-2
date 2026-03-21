import React from "react";
import {
  Calculator,
  TrendingUp,
  Shield,
  Users,
  ArrowRight,
} from "lucide-react";
import { useHighlight } from "../../context/HighlightContext";
import { useCharacter } from "../Character/CharacterProvider";

const WelcomeComponent = ({ onAction }) => {
  const { getHighlightClass, clearAllHighlights } = useHighlight();
  const { showCharacter, hideCharacter } = useCharacter();
  
  // Debug: Log the highlight class being applied
  const highlightClass = getHighlightClass('get-started-button', 'pulse');
  console.log('Button highlight class:', highlightClass);

  const handleGetStartedClick = () => {
    // Clear highlights immediately
    clearAllHighlights();
    
    // Show goodbye messages
    const goodbyeMessages = [
      { pose: 'greeting1', text: 'Awesome! You\'ll automatically be guided to the next step.', position: 'bottom-right' },
      { pose: 'explain_left1', text: 'You can call me anytime by pressing the button below!', position: 'bottom-right' }
    ];

    showCharacter({
      pose: goodbyeMessages[0].pose,
      message: goodbyeMessages[0].text,
      position: 'bottom-right',
      messages: goodbyeMessages,
      currentIndex: 0
    });

    // Auto-progress to second message after 2 seconds
    setTimeout(() => {
      showCharacter({
        pose: goodbyeMessages[1].pose,
        message: goodbyeMessages[1].text,
        position: 'bottom-right',
        messages: goodbyeMessages,
        currentIndex: 1
      });
    }, 2000);

    // Hide character after 3.5 seconds, then proceed
    setTimeout(() => {
      hideCharacter();
    }, 3500);

    // Proceed to next step after character is hidden
    setTimeout(() => {
      onAction("I'd like to start by providing my basic information");
    }, 4000);
  };
  const features = [
    {
      icon: Calculator,
      title: "Smart Calculations",
      description: "Verified actuarial formulas for accurate projections",
    },
    {
      icon: TrendingUp,
      title: "Scenario Modeling",
      description: "Compare lump-sum, annuity, and phased strategies",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays secure with local processing",
    },
    {
      icon: Users,
      title: "Family Planning",
      description: "Joint-life options and spouse benefits",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to FinScope AI
        </h2>
        <p className="text-gray-600">
          I'll help you optimize your pension and retirement benefits through
          personalized analysis
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50"
            >
              <Icon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <button
          id="get-started-button"
          onClick={handleGetStartedClick}
          className={`w-full btn-primary flex items-center justify-center space-x-2 ${highlightClass}`}
          style={{
            transition: 'all 0.3s ease'
          }}
        >
          <span>Get Started with Profile Setup</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAction("Show me a demo with sample data")}
            className="btn-secondary text-sm"
          >
            Try Demo
          </button>
          <button
            onClick={() => onAction("Show me a comparison chart")}
            className="btn-secondary text-sm"
          >
            View Charts
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeComponent;
