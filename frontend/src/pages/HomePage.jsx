import React from "react";
import {
  TrendingUp,
  Shield,
  Target,
  ChevronRight,
  Calculator,
  PieChart,
  BarChart3,
  Sparkles,
  Brain,
  FileText,
  Zap,
  ArrowDown,
  Users,
  Clock,
  DollarSign,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  Cpu,
  Database,
  Globe,
  Activity,
  Layers,
  TrendingDown,
  ArrowUpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const HomePage = () => {
  // Mock auth state - replace with actual useAuth() hook
  const user = null; // This should be: const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [floatingElements, setFloatingElements] = useState([]);

  const stats = [
    { value: "₹1.2L Cr", label: "Retirement Market Size", icon: DollarSign },
    { value: "45M", label: "Planning for Retirement", icon: Users },
    { value: "78%", label: "Suboptimal Decisions", icon: TrendingDown },
    { value: "₹8L+", label: "Average Lost Benefits", icon: Target },
  ];

  const features = [
    {
      icon: Brain,
      title: "AI Financial Advisor",
      description: "Advanced AI that understands your unique retirement situation and provides personalized guidance",
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-500/5 to-indigo-500/5",
      borderColor: "hover:border-blue-300",
    },
    {
      icon: Calculator,
      title: "Monte Carlo Simulations",
      description: "Advanced risk modeling with thousands of scenario iterations for comprehensive planning",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-500/5 to-emerald-500/5",
      borderColor: "hover:border-green-300",
    },
    {
      icon: FileText,
      title: "Document Intelligence",
      description: "Smart extraction from pension documents with RAG technology for seamless data processing",
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-500/5 to-violet-500/5",
      borderColor: "hover:border-purple-300",
    },
    {
      icon: BarChart3,
      title: "Scenario Visualization",
      description: "Interactive charts comparing all major payout structures with real-time data analysis",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/5 to-red-500/5",
      borderColor: "hover:border-orange-300",
    },
  ];

  // Generate floating elements
  useEffect(() => {
    const elements = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      icon: [Activity, Layers, Star, Sparkles][Math.floor(Math.random() * 4)],
      size: 20 + Math.random() * 10,
      opacity: 0.1 + Math.random() * 0.2,
    }));
    setFloatingElements(elements);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate stats counter
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);

    // Animate features
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(featureInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {floatingElements.map((element) => {
          const IconComponent = element.icon;
          return (
            <div
              key={element.id}
              className="absolute animate-float-random"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                animationDelay: `${element.delay}s`,
                animationDuration: `${element.duration}s`,
                opacity: element.opacity,
              }}
            >
              <div className="bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full p-2 backdrop-blur-sm">
                <IconComponent size={element.size} className="text-blue-500/40" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Background Gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/50 to-indigo-100/50" />
          <div className="absolute inset-0 bg-gradient-conic from-blue-500/5 via-transparent to-indigo-500/5 animate-spin-super-slow" />
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-spin-slow" />
          
          {/* Moving Particles */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/6 w-2 h-2 bg-blue-400 rounded-full animate-bounce-slow" />
            <div className="absolute top-2/3 right-1/6 w-2 h-2 bg-indigo-400 rounded-full animate-bounce-slow delay-500" />
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce-slow delay-1000" />
            <div className="absolute top-1/6 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-bounce-slow delay-1500" />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 backdrop-blur-sm border border-blue-200 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-4 hover:scale-105 transition-transform cursor-pointer group">
                <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                AI-Powered Retirement Intelligence
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                <span className="block text-slate-900">Plan Smart.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">
                  Retire Confident.
                </span>
              </h1>

              <p className="text-xl md:text-xl text-slate-600 mb-8 leading-relaxed font-normal max-w-xl">
                Transform complex pension decisions into clear, actionable insights with our AI-driven platform. Maximize your lifetime benefits with personalized optimization strategies tailored for your unique retirement goals.
              </p>

              {/* Enhanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                {user ? (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    Go to Dashboard
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Zap className="w-5 h-5 mr-2 animate-pulse" />
                    Start Your Journey
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="flex flex-wrap gap-6 text-slate-500 text-sm">
                <div className="flex items-center group hover:text-blue-600 transition-colors cursor-pointer">
                  <div className="relative">
                    <Shield className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  Bank-Grade Security
                </div>
                <div className="flex items-center group hover:text-green-600 transition-colors cursor-pointer">
                  <div className="relative">
                    <Target className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-green-400/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  Actuarial Precision
                </div>
                <div className="flex items-center group hover:text-purple-600 transition-colors cursor-pointer">
                  <div className="relative">
                    <Cpu className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform animate-pulse" />
                    <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  Real-time Processing
                </div>
              </div>
            </div>

            {/* Right Side - Enhanced UI Screenshot */}
            <div
              className={`relative transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="relative group">
                {/* Enhanced Orbital Elements */}
                <div className="absolute inset-0 animate-spin-slow">
                  <div className="absolute top-0 left-1/2 w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transform -translate-x-1/2 animate-bounce shadow-lg shadow-blue-400/50" />
                  <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transform -translate-x-1/2 animate-bounce delay-1000 shadow-lg shadow-indigo-400/50" />
                  <div className="absolute left-0 top-1/2 w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transform -translate-y-1/2 animate-bounce delay-500 shadow-lg shadow-purple-400/50" />
                  <div className="absolute right-0 top-1/2 w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full transform -translate-y-1/2 animate-bounce delay-1500 shadow-lg shadow-green-400/50" />
                </div>

                {/* Enhanced Glow Effect */}
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl group-hover:blur-4xl transition-all duration-500 animate-pulse-slow" />

                {/* Screenshot Container */}
                <div className="relative bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm rounded-3xl p-4 border border-slate-200/50 shadow-2xl transform rotate-3 hover:rotate-1 transition-transform duration-700 group-hover:scale-105">
                  <img
                    src="/main-user-interface.png"
                    alt="FinScope Dashboard Interface"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />

                  {/* Enhanced Floating Feature Indicators */}
                  <div className="absolute -top-8 -left-8 bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-2xl shadow-2xl animate-float group-hover:scale-110 transition-transform">
                    <Brain className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse" />
                  </div>
                  <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-2xl shadow-2xl animate-float-delayed group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white animate-pulse" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse delay-500" />
                  </div>
                </div>

                {/* Enhanced Data Flow Visualization */}
                <div className="absolute top-1/4 -left-10 bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-xl animate-float opacity-80 hover:opacity-100 transition-opacity">
                  <PieChart className="w-6 h-6 text-white animate-spin-slow" />
                </div>
                <div className="absolute bottom-1/3 -right-10 bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl shadow-xl animate-float-delayed opacity-80 hover:opacity-100 transition-opacity">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-3 border border-slate-200/50 hover:bg-white/90 transition-all cursor-pointer group">
              <ArrowDown className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Problem Statement Section */}
      <section className="relative py-32 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 animate-gradient">Problem</span> We Solve
            </h2>
            <p className="text-xl text-slate-600">
              78% of retirees make suboptimal pension decisions, losing an average of ₹8L+ in lifetime benefits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Enhanced Problem Cards */}
            {[
              {
                icon: Lightbulb,
                title: "Lack of Knowledge",
                description: "Retirees frequently lack essential information on when, where, and how to claim their pension benefits for maximum payout.",
                color: "from-red-500 to-orange-500",
                bgGradient: "from-red-500/5 to-orange-500/5",
                hoverColor: "hover:border-red-300",
              },
              {
                icon: PieChart,
                title: "Complex Options",
                description: "Variety of payout options across different schemes are overwhelming and difficult to compare effectively.",
                color: "from-orange-500 to-yellow-500",
                bgGradient: "from-orange-500/5 to-yellow-500/5",
                hoverColor: "hover:border-orange-300",
              },
              {
                icon: DollarSign,
                title: "High Financial Risk",
                description: "Wrong choices can cost retirees lakhs of rupees in lost benefits over their lifetime with no way to reverse decisions.",
                color: "from-yellow-500 to-red-500",
                bgGradient: "from-yellow-500/5 to-red-500/5",
                hoverColor: "hover:border-yellow-300",
              },
            ].map((problem, index) => (
              <div key={index} className={`group relative bg-white rounded-3xl p-8 border border-slate-200 ${problem.hoverColor} transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${problem.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className={`bg-gradient-to-br ${problem.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {React.createElement(problem.icon, { className: "w-8 h-8 text-white" })}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{problem.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{problem.description}</p>
                  
                  {/* Animated indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpCircle className={`w-6 h-6 text-gradient-to-r ${problem.color.replace('from-', '').replace('to-', '')} animate-bounce`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="relative py-32 bg-white overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50" />
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }} />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Powered by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 animate-gradient">
                Intelligence
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Advanced AI and machine learning technologies working behind the scenes to optimize your retirement decisions
            </p>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group relative bg-gradient-to-br from-white to-slate-50 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 ${feature.borderColor} transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer ${activeFeature === index ? 'ring-2 ring-blue-300 scale-105 shadow-2xl' : ''}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                {/* Animated corner indicators */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
                
                <div className="relative">
                  <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl relative overflow-hidden`}>
                    {React.createElement(feature.icon, { className: "w-8 h-8 text-white relative z-10" })}
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                    {feature.description}
                  </p>
                  
                  {/* Progress indicator for active feature */}
                  {activeFeature === index && (
                    <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-progress" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Key Benefits */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Database,
                title: "Data-Driven Modeling",
                description: "Built on verified financial & actuarial formulas using comprehensive pension & tax datasets",
                color: "from-blue-500 to-indigo-500",
              },
              {
                icon: Users,
                title: "User-Centric Personalization", 
                description: "Customizes plans based on lifestyle goals, risk tolerance, and family considerations",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: BarChart3,
                title: "Interactive Visualization",
                description: "Simple charts showing monthly income flows, tax impact, and purchasing power over time",
                color: "from-purple-500 to-violet-500",
              },
            ].map((benefit, index) => (
              <div key={index} className="space-y-8">
                <div className="flex items-start space-x-4 group cursor-pointer">
                  <div className={`bg-gradient-to-r ${benefit.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform relative overflow-hidden`}>
                    {React.createElement(benefit.icon, { className: "w-6 h-6 text-white relative z-10" })}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{benefit.title}</h4>
                    <p className="text-slate-600 group-hover:text-slate-700 transition-colors">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section className="relative py-32 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 animate-gradient">Works</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our end-to-end optimization process transforms your pension complexity into clarity
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Enhanced Workflow Steps */}
            <div className="grid gap-8">
              {[
                {
                  step: "01",
                  title: "User Data Collection",
                  description: "Capture essential personal, financial, and retirement preference details with intelligent forms",
                  icon: Users,
                  color: "from-blue-500 to-indigo-500",
                },
                {
                  step: "02", 
                  title: "Market & Risk Analysis",
                  description: "Factor in market forecasts, inflation trends, and life expectancy data using real-time analytics",
                  icon: TrendingUp,
                  color: "from-green-500 to-emerald-500",
                },
                {
                  step: "03",
                  title: "AI-Powered Scenario Generation", 
                  description: "Use proven financial models to craft diverse, optimized payout strategies tailored to your needs",
                  icon: Brain,
                  color: "from-purple-500 to-violet-500",
                },
                {
                  step: "04",
                  title: "Goal Alignment & Optimization",
                  description: "Match strategies to individual retirement objectives and constraints using advanced algorithms",
                  icon: Target,
                  color: "from-orange-500 to-red-500",
                },
                {
                  step: "05",
                  title: "Interactive Visualization",
                  description: "Present clear comparisons with dynamic charts and comprehensive scenario modeling",
                  icon: BarChart3,
                  color: "from-indigo-500 to-purple-500",
                },
                {
                  step: "06",
                  title: "AI Advisory & Guidance",
                  description: "LLM-driven advisor delivers personalized recommendations in plain, actionable language",
                  icon: Lightbulb,
                  color: "from-yellow-500 to-orange-500",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-8 group relative hover:scale-102 transition-transform duration-300">
                  {/* Enhanced Step Number */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl relative overflow-hidden`}>
                      <span className="text-2xl font-bold text-white relative z-10">{item.step}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                    
                    {/* Pulsing ring */}
                    <div className={`absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-r ${item.color} opacity-30 animate-ping group-hover:animate-none`} />
                  </div>
                  
                  {/* Enhanced Content */}
                  <div className="flex-1 bg-white rounded-2xl p-8 border border-slate-200 group-hover:border-slate-300 transition-all shadow-lg group-hover:shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start justify-between relative">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                        <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">{item.description}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} ml-6 group-hover:scale-110 transition-transform shadow-lg relative overflow-hidden`}>
                        {React.createElement(item.icon, { className: "w-6 h-6 text-white relative z-10" })}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Connector */}
                  {index < 5 && (
                    <div className="absolute left-10 top-24 w-0.5 h-12 bg-gradient-to-b from-slate-300 via-blue-300/50 to-transparent">
                      <div className="w-full h-2 bg-blue-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Key Factors Section */}
      <section className="relative py-32 bg-white overflow-hidden">
        {/* Dynamic background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)`,
          }} />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Key <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 animate-gradient">Factors</span> We Consider
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI analyzes multiple variables to optimize your pension payout decisions with precision
            </p>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                title: "Age at Retirement",
                description: "Early retirement often reduces monthly payouts, while delaying can increase them significantly",
                icon: Clock,
                color: "from-blue-500 to-indigo-500",
                bgColor: "from-blue-50 to-indigo-50",
              },
              {
                title: "Life Expectancy",
                description: "Longer lifespans may favor annuity options; shorter life expectancy may favor lump-sum withdrawals",
                icon: Users,
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-50 to-emerald-50",
              },
              {
                title: "Marital Status & Dependents",
                description: "Spousal benefits, survivor pensions, and joint-life options influence total payout strategies",
                icon: Target,
                color: "from-purple-500 to-violet-500",
                bgColor: "from-purple-50 to-violet-50",
              },
              {
                title: "Investment Returns",
                description: "Growth of invested pension funds affects available payout amounts significantly in current markets",
                icon: TrendingUp,
                color: "from-orange-500 to-red-500",
                bgColor: "from-orange-50 to-red-50",
              },
              {
                title: "Inflation Impact",
                description: "Rising costs erode purchasing power unless pensions have inflation adjustments built in",
                icon: DollarSign,
                color: "from-red-500 to-pink-500",
                bgColor: "from-red-50 to-pink-50",
              },
              {
                title: "Tax Implications",
                description: "Different payout options are taxed differently under current laws, impacting your net income",
                icon: Calculator,
                color: "from-indigo-500 to-purple-500",
                bgColor: "from-indigo-50 to-purple-50",
              },
              {
                title: "Financial Goals",
                description: "Debt repayment, lifestyle needs, and legacy plans shape optimal payout choices",
                icon: Lightbulb,
                color: "from-yellow-500 to-orange-500",
                bgColor: "from-yellow-50 to-orange-50",
              },
              {
                title: "Policy Terms",
                description: "Vesting schedules, penalties, and plan-specific clauses can significantly change payouts",
                icon: FileText,
                color: "from-teal-500 to-cyan-500",
                bgColor: "from-teal-50 to-cyan-50",
              },
            ].map((factor, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${factor.bgColor} rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity`} />
                
                {/* Animated corner dot */}
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse" />
                
                <div className="relative">
                  <div className={`bg-gradient-to-r ${factor.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg relative overflow-hidden`}>
                    {React.createElement(factor.icon, { className: "w-6 h-6 text-white relative z-10" })}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{factor.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float-random"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready to Optimize Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300 animate-gradient">
              Retirement?
            </span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
            Join thousands of smart retirees who have maximized their pension benefits with our AI-powered platform. Start your journey to financial confidence today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="group bg-white text-blue-600 px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105 flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Access Your Dashboard
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="group bg-white text-blue-600 px-10 py-5 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105 flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Zap className="w-5 h-5 mr-2 animate-pulse" />
                Start Free Analysis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Enhanced trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 text-blue-200 text-sm">
            {[
              { icon: Shield, text: "Bank-Grade Security" },
              { icon: Cpu, text: "AI-Powered Optimization" },
              { icon: Target, text: "Personalized Results" },
              { icon: Users, text: "Expert-Backed Models" },
            ].map((item, index) => (
              <div key={index} className="flex items-center group hover:text-white transition-colors cursor-pointer">
                <div className="relative">
                  {React.createElement(item.icon, { className: "w-4 h-4 mr-2 group-hover:scale-110 transition-transform" })}
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes float-random {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-10px, -10px) rotate(120deg); }
          66% { transform: translate(10px, -5px) rotate(240deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-super-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        @keyframes count-up {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1.5s;
        }

        .animate-float-random {
          animation: float-random 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-super-slow {
          animation: spin-super-slow 60s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 3s ease-out forwards;
        }

        .animate-count-up {
          animation: count-up 0.6s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        .hover\\:scale-103:hover {
          transform: scale(1.03);
        }
      `}</style>
    </div>
  );
};

export default HomePage;