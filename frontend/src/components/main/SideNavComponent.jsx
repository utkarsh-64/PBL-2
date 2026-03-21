import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Home, MessageCircle, BookOpen, Settings, Banknote } from "lucide-react";
import { APP_NAME } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";
const SideNavComponent = ({ onNavClick }) => {
  const { userData } = useSelector((state) => state.userData);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { name: "Dashboard", path: "dashboard", icon: <Home className="w-5 h-5" />, },
    { name: "Chat", path: "home", icon: <MessageCircle className="w-5 h-5" /> },
    { name: "Learn", path: "learn", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Finance", path: "finance", icon: <Banknote className="w-5 h-5" /> },
  ];

  const hasAvatar = userData.avatar && userData.avatar.trim() !== "";

  // Function to check if a nav item is active
  const isActiveTab = (path) => {
    const currentPath = location.pathname;
    if (path === "home") {
      return currentPath === "/home";
    }
    return currentPath === `/home/${path}`;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* Logo / App Name */}
      <div className="flex items-center mb-4">
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => onNavClick("dashboard")}
        >
          <img src="/logo.jpg" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-gradient-to-br rounded-2xl from-blue-600/40 via-indigo-600/70 to-purple-700/70 p-6 text-white relative">
        {/* Decorations */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>

        <div className="text-center relative z-10">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-white/20 rounded-full p-1 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              {hasAvatar ? (
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <User className="w-12 h-12 text-white opacity-80" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          <h3 className="font-bold text-xl mb-1">{userData.name}</h3>
          <p className="text-blue-100 text-sm opacity-90">{userData.email}</p>

          <button
            onClick={() => navigate("/profile")}
            className="w-full mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200 border border-white/20"
          >
            View Full Profile
          </button>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="p-6">
        <ul className="space-y-3">
          {navItems.map((item, idx) => {
            const isActive = isActiveTab(item.path);
            return (
              <li
                key={idx}
                onClick={() => onNavClick(item.path)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </li>
            );
          })}
          <li
            onClick={() => navigate("/profile#settings")}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </li>
          <button
            onClick={handleLogout}
            className="mt-4 w-full border-1 border-red-500 hover:bg-red-500 text-red-500 hover:text-white cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Logout
          </button>
        </ul>
      </nav>
    </div>
  );
};

export default SideNavComponent;
