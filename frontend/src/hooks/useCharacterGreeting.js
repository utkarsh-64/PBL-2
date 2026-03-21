import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const useCharacterGreeting = (showCharacter) => {
  const { user } = useAuth();
  const hasShownGreetingRef = useRef(false);

  // Check if greeting has been shown for this user
  const getGreetingKey = (userId) => `character_greeting_shown_${userId}`;
  
  const hasShownGreeting = (userId) => {
    return localStorage.getItem(getGreetingKey(userId)) === 'true';
  };
  
  const markGreetingAsShown = (userId) => {
    localStorage.setItem(getGreetingKey(userId), 'true');
  };

  useEffect(() => {
    if (user && showCharacter && !hasShownGreetingRef.current) {
      const userId = user.id || user.email || 'default_user';
      
      // Check if greeting has already been shown for this user
      if (hasShownGreeting(userId)) {
        return;
      }
      
      hasShownGreetingRef.current = true;
      markGreetingAsShown(userId);
      
      // Get user's name or default to "Chief"
      const userName = user?.name ? user.name.split(' ')[0] : 'Chief';
      
      // Define all messages
      const messages = [
        { pose: 'greeting1', text: `Hey ${userName}! I'm Cass`, position: 'bottom-right', size: 'large' },
        { pose: 'explain_left1', text: `I'll guide you through your pension planning journey!`, position: 'bottom-right' },
        { pose: 'point_left1', text: `Let's start by setting up your profile - click the button!`, position: 'bottom-right', highlight: 'get-started-button', size: 'large' }
      ];
      
      // Show character with first message and all messages data
      showCharacter({
        pose: messages[0].pose,
        message: messages[0].text,
        position: 'bottom-right',
        messages: messages,
        currentIndex: 0
      });
    }
  }, [user, showCharacter]);
};

export default useCharacterGreeting;
