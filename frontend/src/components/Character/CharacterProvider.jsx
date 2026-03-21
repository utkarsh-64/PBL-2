import React, { createContext, useContext, useState, useCallback } from 'react';
import { useChartHighlight } from '../../context/ChartHighlightContext';

const CharacterContext = createContext();

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

export const CharacterProvider = ({ children }) => {
  const { highlightElement, resetHighlights } = useChartHighlight();
  
  const [characterState, setCharacterState] = useState({
    isVisible: false,
    pose: 'greeting1',
    message: '',
    position: 'bottom-right',
    messages: [],
    currentIndex: 0,
    highlightIcon: false,
    calledViaChartIcon: false,
    chartData: null
  });
  
  // Track user interactions for dynamic messaging
  const [userInteractions, setUserInteractions] = useState({
    hasIncreasedStepUp: false,
    initialStepUp: null
  });

  const updateChartData = useCallback((newChartData) => {
    setCharacterState(prev => ({
      ...prev,
      chartData: newChartData
    }));
  }, []);

  const showCharacter = ({ pose = 'greeting1', message, position = 'bottom-right', messages = [], currentIndex = 0 }) => {
    setCharacterState({
      isVisible: true,
      pose,
      message,
      position,
      messages,
      currentIndex
    });
  };

  const nextMessage = () => {
    setCharacterState(prev => {
      if (prev.currentIndex < prev.messages.length - 1) {
        const newIndex = prev.currentIndex + 1;
        let nextMsg = prev.messages[newIndex];
        
        // For break-even chart, check if we need to dynamically update the next message
        if (prev.messages[0]?.text.includes('Break Even') && prev.chartData?.breakEven) {
          const breakEvenAge = prev.chartData.breakEven.age ? Math.round(prev.chartData.breakEven.age) : null;
          const hasBreakEven = prev.chartData.breakEven && breakEvenAge !== null && breakEvenAge > 0;
          const hasIncreasedStepUp = userInteractions.hasIncreasedStepUp;
          
          // If we're at the step-up slider message and user has increased step-up, jump to the appropriate message
          if (prev.currentIndex === 6 && hasIncreasedStepUp && hasBreakEven) {
            // Jump to the "Great! I see you've increased the step-up" message
            const dynamicMessages = [
              { pose: 'explain_right1', text: `Great! I see you've increased the step-up. Notice how the Green line (Annuity) now rises faster.`, highlight: 'greenLine' },
              { pose: 'point_left1', text: `At around age ${breakEvenAge}, the Green line crosses above the Blue line: this is the break-even point, intersection.`, highlight: 'crossPoint' },
              { pose: 'explain_left1', text: `That's the Break-even point. Beyond this age, Annuity gives you more total value than Lump Sum.`, highlight: 'crossPoint' },
              { pose: 'greeting1', text: `So with step-ups, Annuity can eventually outperform Lump Sum, rewarding those who live longer!` }
            ];
            
            // Update messages array with dynamic content
            const updatedMessages = [...prev.messages.slice(0, 7), ...dynamicMessages];
            nextMsg = dynamicMessages[0];
            
            return {
              ...prev,
              messages: updatedMessages,
              pose: nextMsg.pose,
              message: nextMsg.text,
              position: nextMsg.position || prev.position,
              size: nextMsg.size || prev.size,
              currentIndex: 7 // Jump to the first dynamic message
            };
          }
        }
        
        // Handle highlighting for the new message
        if (nextMsg.highlight) {
          const chartType = prev.messages[0].text.includes('Break Even') ? 'breakEven' : 'retirementChart';
          resetHighlights(chartType);
          highlightElement(chartType, nextMsg.highlight, true);
        }
        
        return {
          ...prev,
          pose: nextMsg.pose,
          message: nextMsg.text,
          position: nextMsg.position || prev.position,
          size: nextMsg.size || prev.size,
          currentIndex: newIndex
        };
      }
      return prev;
    });
  };

  const previousMessage = () => {
    setCharacterState(prev => {
      const newIndex = prev.currentIndex - 1;
      if (newIndex >= 0) {
        const prevMsg = prev.messages[newIndex];
        
        // Handle highlighting for the previous message
        if (prevMsg.highlight) {
          const chartType = prev.messages[0].text.includes('Break Even') ? 'breakEven' : 'retirementChart';
          // Reset all highlights first
          resetHighlights(chartType);
          // Then apply the new highlight
          highlightElement(chartType, prevMsg.highlight, true);
        }
        
        return {
          ...prev,
          pose: prevMsg.pose,
          message: prevMsg.text,
          position: prevMsg.position || prev.position,
          size: prevMsg.size || prev.size,
          currentIndex: newIndex
        };
      }
      return prev;
    });
  };

  const hideCharacter = () => {
    // Reset all highlights when hiding character
    setCharacterState(prev => {
      const chartType = prev.messages[0]?.text.includes('Break Even') ? 'breakEven' : 'retirementChart';
      resetHighlights(chartType);
      return prev;
    });
    
    // Small delay to ensure character is visible before showing goodbye message
    setTimeout(() => {
      // Show appropriate bye message based on how Cass was called
      setCharacterState(prev => {
        const wasCalledViaChartIcon = prev.calledViaChartIcon;
        const goodbyeMessage = wasCalledViaChartIcon 
          ? 'Bye Chief! If you need me again for any chart explanation, just click on this button!' 
          : 'Bye Chief! See you later!';
        
        return {
          ...prev,
          message: goodbyeMessage,
          pose: 'greeting1',
          highlightIcon: wasCalledViaChartIcon,
          messages: [{ pose: 'greeting1', text: goodbyeMessage }], // Single goodbye message
          currentIndex: 0
        };
      });

      // Hide after showing bye message and remove icon highlight
      setTimeout(() => {
        setCharacterState({
          isVisible: false,
          pose: 'greeting1',
          message: '',
          position: 'bottom-right',
          messages: [],
          currentIndex: 0,
          highlightIcon: false,
          calledViaChartIcon: false
        });
      }, 3000);
    }, 100);
  };

  const callCharacterBack = () => {
    const userName = 'Chief'; // Could be passed from context
    const messages = [
      { pose: 'greeting1', text: `Hey ${userName}! I'm back to help!` },
      { pose: 'explain_left1', text: `What can I do for you?` }
    ];

    setCharacterState({
      isVisible: true,
      pose: messages[0].pose,
      message: messages[0].text,
      position: 'bottom-right',
      messages: messages,
      currentIndex: 0,
      calledViaChartIcon: false,
      highlightIcon: false
    });
  };

  const explainChart = (chartType, userName = 'Chief', chartData = null) => {
    let messages = [];

    // Reset highlights first
    resetHighlights(chartType === 'breakEven' ? 'breakEven' : 'retirementChart');


    switch (chartType) {
      case 'retirementCorpus':
        messages = [
          { pose: 'greeting1', text: `Hey ${userName}! Let me explain this Retirement Corpus chart for you!` },
          { pose: 'explain_right1', text: `There are three lines here – Blue is your Base Case, Green is the Best Case (when the market is in good condition), and Red is the Worst Case (when the market might not do so well).`, highlight: 'allLines' },
          { pose: 'point_left1', text: `The Blue line shows a realistic and balanced estimate of how your retirement savings could grow and decline over time.`, highlight: 'blueLine' },
          { pose: 'explain_left1', text: `The Green line is optimistic – it shows your money growing faster and lasting longer if things go really well.`, highlight: 'greenLine' },
          { pose: 'explain_right1', text: `The Red line is the cautious view – it shows what happens if returns are lower or expenses are higher, like when the market isn't performing well.`, highlight: 'redLine' },
          { pose: 'point_left1', text: `Notice that each curve has a peak – that's the point where your retirement corpus is at its highest, just before withdrawals start to reduce it.`, highlight: 'curvePeaks' },
          { pose: 'explain_left1', text: `There are two key phases: Growth phase (before retirement) and Withdrawal phase (after retirement).`, highlight: 'bothPhases' },
          { pose: 'explain_right1', text: `Notice how the Withdrawal phase shows the corpus declining as you use it for retirement expenses.`, highlight: 'withdrawalPhase' },
          { pose: 'explain_left1', text: `Now here's the key difference – in the Green line, even after your lifetime there's money left over.`, highlight: 'greenLine' },
          { pose: 'explain_right1', text: `In the Red line, the money actually runs out before your lifetime ends, which is why it touches the baseline early.`, highlight: 'redLine' },
          { pose: 'explain_left1', text: `And the Blue line sits right in the middle – the optimal balance where your corpus supports you throughout retirement.`, highlight: 'blueLine' },
          { pose: 'greeting1', text: `Pro tip: The last 10 years before retirement contribute about 50% of your total corpus due to the power of compounding! 📈`, highlight: 'lastTenYears' },
          { pose: 'greeting1', text: `So in short – Blue is optimal, Green leaves extra, and Red means running out early. This helps you prepare for any future scenario! 🚀` }
        ];
        break;
      case 'payoutStrategy':
        messages = [
          { pose: 'greeting1', text: `${userName}, let me break down these payout strategies for you!` },
        ];
        break;
      case 'breakEven':
        const breakEvenAge = chartData?.breakEven?.age ? Math.round(chartData.breakEven.age) : null;
        const hasBreakEven = chartData?.breakEven && breakEvenAge !== null && breakEvenAge > 0;
        const hasIncreasedStepUp = userInteractions.hasIncreasedStepUp;
        
        messages = [
          { pose: 'greeting1', text: `Hey ${userName}! Let me explain this Break Even: Lump Sum vs Annuity chart for you.` },
          { pose: 'explain_right1', text: `This chart compares two retirement payout strategies using real inflation-adjusted values.`, highlight: 'allLines' },
          { pose: 'point_left1', text: `The Blue line shows the Lump Sum strategy: withdraw everything at once and invest it.`, highlight: 'blueLine' },
          { pose: 'explain_left1', text: `It starts higher because you get a large amount upfront, and it compounds over time.`, highlight: 'blueLine' },
          { pose: 'point_left1', text: `The Green line represents the Annuity strategy, where you receive periodic payments over time.`, highlight: 'greenLine' },
          { pose: 'explain_right1', text: `Each annuity payment is received regularly, and the value accumulates more gradually compared to a lump sum.`, highlight: 'greenLine' },
          { pose: 'point_left1', text: `The Annuity Step-up slider increases your annual annuity payments, similar to step-up options in pension schemes.`, highlight: 'stepUpSlider' }
        ];
        
        // Add dynamic messages based on break-even data
        if (hasBreakEven) {
          if (hasIncreasedStepUp) {
            messages.push(
              { pose: 'explain_right1', text: `Great! I see you've increased the step-up. Notice how the Green line (Annuity) now rises faster.`, highlight: 'greenLine' },
              { pose: 'point_left1', text: `At around age ${breakEvenAge}, the Green line crosses above the Blue line: this is the break-even point, intersection.`, highlight: 'crossPoint' },
              { pose: 'explain_left1', text: `That's the Break-even point. Beyond this age, Annuity gives you more total value than Lump Sum.`, highlight: 'crossPoint' },
              { pose: 'greeting1', text: `So with step-ups, Annuity can eventually outperform Lump Sum, rewarding those who live longer!` }
            );
          } else {
            messages.push(
              { pose: 'point_left1', text: `I can see that at around age ${breakEvenAge}, the Green line crosses above the Blue line: this is the break-even point intersection.`, highlight: 'crossPoint' },
              { pose: 'explain_left1', text: `That's the Break-even point. Beyond this age, Annuity gives you more total value than Lump Sum.`, highlight: 'crossPoint' },
              { pose: 'greeting1', text: `Try adjusting the step-up slider to see how it affects the break-even point timing!` }
            );
          }
        } else {
          messages.push(
            { pose: 'explain_right1', text: `I notice that in this scenario, the Green line (Annuity) doesn't cross above the Blue line within the time frame shown.`, highlight: 'greenLine' },
            { pose: 'point_left1', text: `This means the Lump Sum option provides more value throughout this period.`, highlight: 'blueLine' },
            { pose: 'greeting1', text: `Remember, higher step-ups make annuity payments grow faster over time, which can create a crossing point!`, highlight: 'stepUpSlider' }
          );
        }
        break;
    }
    
    if (messages.length > 0) {
      setCharacterState(prev => ({
        ...prev,
        isVisible: true,
        pose: messages[0].pose,
        message: messages[0].text,
        position: 'bottom-right',
        messages: messages,
        currentIndex: prev.calledViaChartIcon ? prev.currentIndex : 0, // Maintain position if already explaining
        size: 'large',
        calledViaChartIcon: true,
        chartData: chartData // Store current chart data for dynamic updates
      }));
    }
  };

  const value = {
    characterState,
    showCharacter,
    hideCharacter,
    nextMessage,
    previousMessage,
    callCharacterBack,
    explainChart,
    setUserInteractions,
    updateChartData
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

export default CharacterProvider;
