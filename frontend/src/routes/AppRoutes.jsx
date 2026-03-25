import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router";
import { useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import OAuthCallback from "../pages/OAuthCallback";
import ZerodhaCallback from "../pages/ZerodhaCallback";
import ProfilePage from "../pages/ProfilePage";
import ParentComponent from "../components/main/ParentComponent";
import ChatPage from "../pages/ChatPage";
import Dashboard from "../pages/DashboardPage";
import LearnPage from "../pages/LearnPage";
import FinancePage from "../pages/FinancePage";
import { useAuth } from "../context/AuthContext";
import { setUserData } from "../redux/slices/userDataSlice";

function AppRoutes() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const initialMessages = [
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your WealthWise AI assistant. I'm here to help you optimize your pension and retirement benefits. Let's start by getting to know you better.",
      timestamp: new Date().toISOString(),
      component: "welcome",
    },
  ];

  const [scenarios, setScenarios] = useState([]);
  const [messages, setMessages] = useState(initialMessages);

  // Use the user's unique identifier (id or email) to key the local storage
  const userKey = user?.id || user?.email || 'guest';

  // Load chat data when the user changes
  useEffect(() => {
    if (userKey) {
      const savedScenarios = localStorage.getItem(`chat_scenarios_${userKey}`);
      const savedHistory = localStorage.getItem(`chat_history_${userKey}`);
      
      setScenarios(savedScenarios ? JSON.parse(savedScenarios) : []);
      setMessages(savedHistory ? JSON.parse(savedHistory) : initialMessages);
    }
  }, [userKey]);

  // Persist scenarios when they change
  useEffect(() => {
    if (userKey && userKey !== 'guest') {
      localStorage.setItem(`chat_scenarios_${userKey}`, JSON.stringify(scenarios));
    }
  }, [scenarios, userKey]);

  // Persist messages when they change
  useEffect(() => {
    if (userKey && userKey !== 'guest') {
      localStorage.setItem(`chat_history_${userKey}`, JSON.stringify(messages));
    }
  }, [messages, userKey]);
  const location = useLocation();

  // Update userData when user is available
  useEffect(() => {
    if (user) {
      dispatch(
        setUserData({
          name: user?.name ?? "Full Name",
          email: user?.email ?? "abc@gmail.com",
          avatar: user?.profile_picture ?? "/profile-default.png",
          dateOfBirth: user?.birthday ?? "",
          gender: user?.gender ?? "Prefer not to say",
        })
      );
    }
  }, [user, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!location.pathname.startsWith("/home") && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/zerodha/callback" element={<ZerodhaCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home/*"
          element={
            <ProtectedRoute>
              <ParentComponent />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ChatPage 
                scenarios={scenarios} 
                setScenarios={setScenarios} 
                messages={messages}
                setMessages={setMessages}
              />
            }
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="finance" element={<FinancePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
