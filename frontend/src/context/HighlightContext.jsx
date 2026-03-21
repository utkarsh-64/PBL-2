import React, { createContext, useContext, useState, useCallback } from 'react';

const HighlightContext = createContext();

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};

export const HighlightProvider = ({ children }) => {
  const [highlightedElements, setHighlightedElements] = useState(new Set());

  const highlightElement = useCallback((elementId, type = 'pulse') => {
    setHighlightedElements(prev => new Set(prev).add(`${elementId}-${type}`));
  }, []);

  const removeHighlight = useCallback((elementId, type = 'pulse') => {
    setHighlightedElements(prev => {
      const newSet = new Set(prev);
      newSet.delete(`${elementId}-${type}`);
      return newSet;
    });
  }, []);

  const clearAllHighlights = useCallback(() => {
    setHighlightedElements(new Set());
  }, []);

  const isHighlighted = useCallback((elementId, type = 'pulse') => {
    return highlightedElements.has(`${elementId}-${type}`);
  }, [highlightedElements]);

  const getHighlightClass = useCallback((elementId, type = 'pulse') => {
    if (highlightedElements.has(`${elementId}-${type}`)) {
      return `highlight-${type}`;
    }
    return '';
  }, [highlightedElements]);

  const value = {
    highlightElement,
    removeHighlight,
    clearAllHighlights,
    isHighlighted,
    getHighlightClass
  };

  return (
    <HighlightContext.Provider value={value}>
      {children}
    </HighlightContext.Provider>
  );
};

export default HighlightProvider;
