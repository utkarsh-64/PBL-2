import React, { createContext, useContext, useState } from 'react';

const ChartHighlightContext = createContext();

export const useChartHighlight = () => {
  const context = useContext(ChartHighlightContext);
  if (!context) {
    throw new Error('useChartHighlight must be used within a ChartHighlightProvider');
  }
  return context;
};

export const ChartHighlightProvider = ({ children }) => {
  const [highlights, setHighlights] = useState({
    retirementChart: {
      blueLine: false,
      redDot: false,
      growthPhase: false,
      withdrawalPhase: false,
      reset: false
    },
    breakEven: {
      allLines: false,
      blueLine: false,
      greenLine: false,
      crossPoint: false,
      stepUpSlider: false,
      reset: false
    }
  });

  const highlightElement = (chartId, element, isHighlighted = true) => {
    setHighlights(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        [element]: isHighlighted
      }
    }));
  };

  const resetHighlights = (chartId) => {
    setHighlights(prev => ({
      ...prev,
      [chartId]: Object.keys(prev[chartId]).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {})
    }));
  };

  const value = {
    highlights,
    highlightElement,
    resetHighlights
  };

  return (
    <ChartHighlightContext.Provider value={value}>
      {children}
    </ChartHighlightContext.Provider>
  );
};

export default ChartHighlightProvider;
