import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Calculator,
  TrendingUp,
  Users,
} from "lucide-react";

const Dashboard = ({ userData }) => {
  const isDataComplete =
    userData.age && userData.currentSavings && userData.pensionAmount;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Maximize Your Retirement Benefits
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          AI-powered pension optimization that helps you make informed decisions
          about lump-sum vs annuity payouts, tax implications, and lifetime
          income strategies.
        </p>
        {!isDataComplete ? (
          <Link
            to="/input"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            to="/scenarios"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>View Scenarios</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <Calculator className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Smart Calculations</h3>
          <p className="text-gray-600">
            Verified actuarial formulas and tax modeling for accurate
            projections
          </p>
        </div>

        <div className="card text-center">
          <TrendingUp className="h-12 w-12 text-success-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Scenario Modeling</h3>
          <p className="text-gray-600">
            Compare lump-sum, annuity, and phased withdrawal strategies
          </p>
        </div>

        <div className="card text-center">
          <Shield className="h-12 w-12 text-warning-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
          <p className="text-gray-600">
            Your sensitive data stays secure with local processing
          </p>
        </div>

        <div className="card text-center">
          <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Family Planning</h3>
          <p className="text-gray-600">
            Joint-life options and spouse benefit optimization
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      {isDataComplete && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Your Profile Summary</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {userData.age}
              </div>
              <div className="text-gray-600">Years Old</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600">
                ₹{parseInt(userData.currentSavings).toLocaleString("en-IN")}
              </div>
              <div className="text-gray-600">Current Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600">
                ₹{parseInt(userData.pensionAmount).toLocaleString("en-IN")}
              </div>
              <div className="text-gray-600">Pension Amount</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
