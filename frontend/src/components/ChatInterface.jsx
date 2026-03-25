import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, Bot, Paperclip, X } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { generateBotResponse } from "../utils/chatBot";
import { setUserData } from "../redux/slices/userDataSlice";
import { API_BASE_URL } from "../utils/constants";

const ChatInterface = ({ scenarios, setScenarios, messages, setMessages }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const { userData } = useSelector((state) => state.userData);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // NEW: staged files state
  const [stagedFiles, setStagedFiles] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message, data = null) => {
    if (!message.trim() && !data && stagedFiles.length === 0) return;

    // Add user message (with staged files if any)
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message || "Form submitted",
      timestamp: new Date(),
      data: data,
      files: stagedFiles, // attach staged files
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setStagedFiles([]); // clear staged files after sending

    // ── Smart routing: only route to Groq when
    //    1) scenarios exist (user has a plan to ask about)
    //    2) it's a genuine freeform typed message (not a button-triggered action)
    //    3) no file is staged (file uploads must use the Gemini pipeline)
    const hasScenarios = scenarios && scenarios.length > 0;
    const isActionButton = !!data;  // button clicks pass { isAction: true } as data
    const hasFile = stagedFiles.length > 0;

    if (hasScenarios && !isActionButton && !hasFile && message.trim()) {
      setTimeout(async () => {
        await handleAskFinScope(message, scenarios);
      }, 300);
      return;
    }

    // Generate bot response (original pipeline — Gemini / local logic)
    setTimeout(async () => {
      const botResponse = await generateBotResponse(
        message,
        data,
        userData,
        scenarios
      );

      if (botResponse.isFallback) {
        // Remove the local user message bubble that was just added 
        setMessages((prev) => prev.slice(0, -1));
        setIsTyping(false);
        // Call the API handler which will add its own User message bubble and handle the remote response
        await handleSendMessageInput(message, data);
        return;
      }

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: botResponse.content,
        timestamp: new Date(),
        component: botResponse.component,
        data: botResponse.data,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);

      if (botResponse.updateUserData) {
        dispatch(setUserData({ ...botResponse.updateUserData }));
      }
      if (botResponse.updateScenarios) {
        setScenarios(botResponse.updateScenarios);
      }
    }, 500);
  };

  // ── Groq-powered Q&A about scenarios and graphs ───────────────────────────
  const handleAskFinScope = async (message, currentScenarios) => {
    setIsTyping(true);
    try {
      // Build a plain-text graph context summary from the scenarios
      const graphContext = currentScenarios
        .map(
          (s) =>
            `${s.name}: Monthly Income ₹${s.monthlyIncome?.toLocaleString("en-IN")}, ` +
            `Suitability ${s.suitability}%, Risk: ${s.riskLevel}`
        )
        .join(" | ");

      // Send last 8 messages as chat history for continuity
      const recentHistory = messages.slice(-8).map((m) => ({
        type: m.type,
        content: typeof m.content === "string" ? m.content.slice(0, 400) : "",
      }));

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/chat/ai/ask/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message,
          scenarios: currentScenarios,
          graph_context: graphContext,
          chat_history: recentHistory,
        }),
      });

      const result = await response.json();
      const answerText =
        result.answer ||
        "I couldn't find a direct answer in your plan. Try rephrasing your question.";

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: answerText,
        timestamp: new Date(),
        // Support triggered components from the AI
        component: result.trigger !== "none" ? result.trigger : null,
        data: result.data || null,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("FinScope AI ask error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: "Sorry, I couldn't reach the AI advisor right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessageInput = async (message, data = null) => {
    if (!message.trim() && !data && stagedFiles.length === 0) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message || "Form submitted",
      timestamp: new Date(),
      data: data,
      files: stagedFiles,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    const currentStagedFiles = [...stagedFiles];
    setStagedFiles([]); // clear after sending

    // ── Smart routing: if the user has scenarios and no file attached,
    //    route ALL typed messages to Groq for continuous Q&A context.
    const hasScenarios = scenarios && scenarios.length > 0;
    const hasFile = currentStagedFiles.length > 0;
    const isActionButton = !!data;

    if (hasScenarios && !isActionButton && !hasFile && message.trim()) {
      await handleAskFinScope(message, scenarios);
      return;
    }

    try {
      // Use FormData instead of JSON
      const formData = new FormData();
      formData.append("user_message", message);
      const token = localStorage.getItem("token");

      // Append files (multiple supported)
      stagedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${API_BASE_URL}/chat/answer/`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const result = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: result.bot_reply || "No response received",
        timestamp: new Date(),
        external_resources: result.external_resources || null,
        component: result.component || null,
        data: result.data || null,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Handle extracted user data from bot response
      if (
        result.extracted_user_data &&
        Object.keys(result.extracted_user_data).length > 0
      ) {
        console.log(
          "Updating user data with extracted information:",
          result.extracted_user_data
        );

        try {
          // Update Redux state with extracted data
          dispatch(setUserData(result.extracted_user_data));

          // Create a summary of what was extracted
          const extractedFields = Object.keys(result.extracted_user_data);
          const fieldCount = extractedFields.length;

          // Show a notification to user about successful data extraction
          const dataUpdateMessage = {
            id: Date.now() + 2,
            type: "bot",
            content: `✅ Successfully extracted and updated ${fieldCount} field${
              fieldCount > 1 ? "s" : ""
            } in your profile! You can view the updated information in your profile section.`,
            timestamp: new Date(),
          };

          setTimeout(() => {
            setMessages((prev) => [...prev, dataUpdateMessage]);
          }, 500);
        } catch (error) {
          console.error("Error updating user data:", error);

          // Show error message to user
          const errorMessage = {
            id: Date.now() + 2,
            type: "bot",
            content:
              "⚠️ I extracted information from your document, but there was an issue updating your profile. Please try again or update your profile manually.",
            timestamp: new Date(),
          };

          setTimeout(() => {
            setMessages((prev) => [...prev, errorMessage]);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error fetching bot response:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "Sorry, something went wrong.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageInput(inputValue);
    }
  };

  // File Staging
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setStagedFiles((prev) => [...prev, file]); // stage instead of sending
    } else {
      alert("Please upload a valid PDF file");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeStagedFile = (index) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Messages */}
      <div className="flex-1 chat-scroll px-4 py-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              scenarios={scenarios}
              onFormSubmit={handleSendMessage}
              onUpdateScenarios={setScenarios}
            />
          ))}

          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Staged Files Preview */}
          {stagedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {stagedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeStagedFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end space-x-3">
            <div className="flex-1 flex gap-2 relative items-center">
              {/* Hidden file input */}
              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* PDF Upload Button */}
              <button
                onClick={() => fileInputRef.current.click()}
                className="px-3 py-3 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors"
                title="Upload PDF"
              >
                <Paperclip />
              </button>

              {/* Chat Input */}
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your retirement options, tax implications, or upload a PDF..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="1"
                style={{
                  minHeight: "48px",
                  maxHeight: "120px",
                }}
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessageInput(inputValue)}
                disabled={
                  (!inputValue.trim() && stagedFiles.length === 0) || isTyping
                }
                className="px-4 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
