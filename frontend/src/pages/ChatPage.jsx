import ChatInterface from "../components/ChatInterface";
import SummaryComponent from "../components/main/SummaryComponent";

const ChatPage = ({ scenarios, setScenarios, messages, setMessages }) => {
  return (
    <>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <ChatInterface 
            scenarios={scenarios} 
            setScenarios={setScenarios} 
            messages={messages}
            setMessages={setMessages}
          />
        </div>
      </div>

      <div className="w-90 p-6 bg-white/70 backdrop-blur-sm border-l border-gray-200 shadow-xl overflow-y-auto">
        <div className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Summary</h2>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <SummaryComponent />
        </div>
      </div>
    </>
  );
};

export default ChatPage;
