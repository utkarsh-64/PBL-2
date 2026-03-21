import { Outlet, useNavigate } from "react-router-dom";
import SideNavComponent from "./SideNavComponent";
import CharacterCompanion from "../Character/CharacterCompanion";
import CallCassButton from "../Character/CallCassButton";
import {
  CharacterProvider,
  useCharacter,
} from "../Character/CharacterProvider";
import { HighlightProvider } from "../../context/HighlightContext";
import { ChartHighlightProvider } from "../../context/ChartHighlightContext";
import useCharacterGreeting from "../../hooks/useCharacterGreeting";
import useCharacterHighlight from "../../hooks/useCharacterHighlight";

// Inner component that uses the character context
const ParentComponentContent = ({ userData }) => {
  const navigate = useNavigate();
  const {
    characterState,
    showCharacter,
    hideCharacter,
    nextMessage,
    previousMessage,
  } = useCharacter();

  // Use the greeting hook
  useCharacterGreeting(showCharacter);

  // Use character highlight hook
  useCharacterHighlight(characterState);

  const handleNavClick = (page) => {
    navigate(page === "home" ? "/home" : `/home/${page}`);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <div className="flex max-h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-gray-200 shadow-xl">
          <div className="p-6">
            <SideNavComponent userData={userData} onNavClick={handleNavClick} />
          </div>
        </div>

        {/* Main Content */}
        <Outlet />
      </div>

      {/* Character Companion */}
      <CharacterCompanion
        characterState={characterState}
        onClose={hideCharacter}
        onNext={nextMessage}
        onPrevious={previousMessage}
      />

      {/* Call Cass Button */}
      <CallCassButton />
    </div>
  );
};

// Main component wrapped with providers
const ParentComponent = ({ userData }) => {
  return (
    <HighlightProvider>
      <ChartHighlightProvider>
        <CharacterProvider>
          <ParentComponentContent userData={userData} />
        </CharacterProvider>
      </ChartHighlightProvider>
    </HighlightProvider>
  );
};

export default ParentComponent;
