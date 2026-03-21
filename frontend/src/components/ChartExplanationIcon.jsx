import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useCharacter } from './Character/CharacterProvider';

const ChartExplanationIcon = ({ chartType, userName = 'there', chartData = null, className = "" }) => {
  const { explainChart, characterState } = useCharacter();

  const handleClick = () => {
    explainChart(chartType, userName, chartData);
  };

  // Check if this icon should be highlighted (during goodbye message)
  const isHighlighted = characterState.highlightIcon;

  return (
    <button
      onClick={handleClick}
      className={`
        absolute top-4 right-4 z-10 p-2 rounded-full 
        ${isHighlighted 
          ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800 animate-pulse ring-4 ring-yellow-300' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
        }
        shadow-lg hover:shadow-xl transform hover:scale-110
        transition-all duration-200 ease-out
        group
        ${className}
      `}
      title="Ask Cass to explain this chart"
    >
      <HelpCircle className="h-5 w-5" />
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Ask Cass
      </span>
    </button>
  );
};

export default ChartExplanationIcon;
