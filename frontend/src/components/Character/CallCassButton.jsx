import React from 'react';
import { Sparkles } from 'lucide-react';
import { useCharacter } from './CharacterProvider';

const CallCassButton = () => {
  const { characterState, callCharacterBack } = useCharacter();

  // Don't show button if character is already visible
  if (characterState.isVisible) return null;

  return (
    <button
      onClick={callCharacterBack}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 z-40"
      title="Call Cass"
    >
      <Sparkles size={24} />
    </button>
  );
};

export default CallCassButton;
