import { useEffect } from 'react';
import { useHighlight } from '../context/HighlightContext';

const useCharacterHighlight = (characterState) => {
  const { highlightElement, clearAllHighlights } = useHighlight();

  useEffect(() => {
    // Clear all highlights first
    clearAllHighlights();

    // Check if current message has highlight
    if (characterState.isVisible && characterState.messages.length > 0) {
      const currentMessage = characterState.messages[characterState.currentIndex];
      
      if (currentMessage?.highlight) {
        console.log('Highlighting element:', currentMessage.highlight);
        console.log('Element exists:', document.getElementById(currentMessage.highlight));
        
        // Add highlight with a small delay for better UX
        const timer = setTimeout(() => {
          highlightElement(currentMessage.highlight, 'pulse');
          
          // Force check if class was applied
          const element = document.getElementById(currentMessage.highlight);
          if (element) {
            console.log('Element classes after highlight:', element.className);
            // Force add the class directly as backup
            element.classList.add('highlight-pulse');
          }
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [characterState.isVisible, characterState.currentIndex]);

  // Clean up highlights when character is hidden
  useEffect(() => {
    if (!characterState.isVisible) {
      clearAllHighlights();
    }
  }, [characterState.isVisible]);
};

export default useCharacterHighlight;
