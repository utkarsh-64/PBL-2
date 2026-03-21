import { useState, useEffect } from "react";
import {
  Save,
  AlertCircle,
  DollarSign,
  BarChart3,
  User,
  ChevronLeft,
  Info,
  Loader,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../redux/slices/userDataSlice";
import { zerodhaService } from "../../services/zerodhaService";
import { numberToWords } from "../../utils/textUtils";
import { API_BASE_URL } from "../../utils/constants";

const RiskToleranceFormComponent = ({ onSubmit }) => {
  const { userData } = useSelector((state) => state.userData);
  const dispatch = useDispatch();

  const [mode, setMode] = useState(userData.mode || "zerodha"); // "zerodha" or "manual"
  const [formData, setFormData] = useState({
    // Zerodha connection
    zerodhaConnected: userData.zerodhaConnected || false,
    zerodhaProfile: userData.zerodhaProfile || null,
    fdValue: userData.fdValue || "500000", // Default FD value for Zerodha mode

    // Manual Investment Details (only for manual mode)
    fixedDepositAmount: userData.fixedDepositAmount || "",
    mutualFundAmount: userData.mutualFundAmount || "",
    stockInvestmentAmount: userData.stockInvestmentAmount || "",
    formName: "risk-tolerance-form",
  });

  const [errors, setErrors] = useState({});
  const [zerodhaStatus, setZerodhaStatus] = useState({
    loading: false,
    error: null,
  });
  const [apiStatus, setApiStatus] = useState({
    loading: false,
    error: null,
  });

  // Check Zerodha connection status on component mount
  useEffect(() => {
    if (mode === "zerodha") {
      checkZerodhaConnection();
    }
  }, [mode]);

  const checkZerodhaConnection = async () => {
    try {
      setZerodhaStatus({ loading: true, error: null });
      const status = await zerodhaService.checkConnectionStatus();

      setFormData((prev) => ({
        ...prev,
        zerodhaConnected: status.connected,
        zerodhaProfile: status.profile,
      }));

      setZerodhaStatus({ loading: false, error: status.error || null });
    } catch (error) {
      setZerodhaStatus({
        loading: false,
        error: error.message,
      });
    }
  };

  const handleZerodhaConnect = async (e) => {
    try {
      e.preventDefault();
      setZerodhaStatus({ loading: true, error: null });
      
      // Store the current URL to redirect back after login
      const currentUrl = window.location.pathname + window.location.search;
      const loginUrl = await zerodhaService.getLoginUrl(currentUrl);
      
      // Calculate popup position to be centered
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;
      
      // Open popup window
      const popup = window.open(
        '',
        'zerodha-login',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no`
      );
      
      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }
      
      // Set the URL after opening to avoid popup blockers
      popup.location.href = loginUrl;
      popup.focus();
      
      // Check for login completion every second
      const checkLogin = setInterval(async () => {
        try {
          if (popup.closed) {
            clearInterval(checkLogin);
            // Check connection status after popup is closed
            const status = await zerodhaService.checkConnectionStatus();
            
            // Update form data with the new connection status
            setFormData(prev => ({
              ...prev,
              zerodhaConnected: status.connected,
              zerodhaProfile: status.profile,
            }));
            
            setZerodhaStatus({ loading: false, error: null });
          }
        } catch (error) {
          clearInterval(checkLogin);
          setZerodhaStatus({
            loading: false,
            error: error.message || 'Failed to verify connection status',
          });
        }
      }, 1000);
      
      // Cleanup interval on component unmount
      return () => clearInterval(checkLogin);
      
    } catch (error) {
      setZerodhaStatus({
        loading: false,
        error: error.message,
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === "zerodha") {
      // For Zerodha mode, check if connected and FD value is valid
      if (!formData.zerodhaConnected) {
        newErrors.zerodha = "Please connect your Zerodha account to proceed";
      }

      if (
        !formData.fdValue ||
        isNaN(formData.fdValue) ||
        parseFloat(formData.fdValue) < 0
      ) {
        newErrors.fdValue = "Please enter a valid FD amount";
      }
    } else {
      // For manual mode, validate investment amounts
      const totalInvestments =
        (parseInt(formData.fixedDepositAmount) || 0) +
        (parseInt(formData.mutualFundAmount) || 0) +
        (parseInt(formData.stockInvestmentAmount) || 0);

      if (totalInvestments === 0) {
        newErrors.investments = "Please enter at least one investment amount";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateRiskTolerance = async () => {
    try {
      setApiStatus({ loading: true, error: null });

      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      let response;

      if (mode === "zerodha") {
        // Call Zerodha mode API
        response = await fetch(
          `${API_BASE_URL}/api/financial/risk/calculate/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              mode: "zerodha",
              fd_value: parseFloat(formData.fdValue),
            }),
          }
        );
      } else {
        // Call manual mode API
        response = await fetch(
          `${API_BASE_URL}/api/financial/risk/calculate/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              mode: "manual",
              fd_value: parseFloat(formData.fixedDepositAmount) || 0,
              stock_value: parseFloat(formData.stockInvestmentAmount) || 0,
              mf_value: parseFloat(formData.mutualFundAmount) || 0,
            }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to calculate risk tolerance"
        );
      }

      const result = await response.json();

      // Update user data with the results - using the correct field names
      const updatedUserData = {
        mode: mode,
        zerodhaConnected: formData.zerodhaConnected,
        zerodhaProfile: formData.zerodhaProfile,
        fdValue:
          mode === "zerodha" ? formData.fdValue : formData.fixedDepositAmount,
        fixedDepositAmount:
          mode === "manual" ? formData.fixedDepositAmount : "",
        stockInvestmentAmount:
          mode === "manual" ? formData.stockInvestmentAmount : "",
        mutualFundAmount: mode === "manual" ? formData.mutualFundAmount : "",
        risk_score: result.risk_score,
        risk_category: result.risk_category,
        stock_holdings_value: result.stock_holdings_value,
        mf_holdings_value: result.mf_holdings_value,
        total_portfolio_value: result.total_portfolio_value,
        stock_breakdown: result.stock_breakdown || {},
        calculated_at: result.calculated_at || new Date().toISOString(),
        formName: "risk-tolerance-form",
      };

      dispatch(setUserData(updatedUserData));

      // Pass results to parent component
      onSubmit(
        mode === "zerodha"
          ? "Risk analysis completed via Zerodha - portfolio data automatically analyzed"
          : "Risk analysis completed manually",
        updatedUserData
      );
    } catch (error) {
      setApiStatus({
        loading: false,
        error: error.message,
      });
      console.error("Error calculating risk tolerance:", error);
    } finally {
      setApiStatus({ loading: false, error: null });
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await calculateRiskTolerance();
    }
  };

  const calculateTotalInvestments = () => {
    return (
      (parseInt(formData.fixedDepositAmount) || 0) +
      (parseInt(formData.mutualFundAmount) || 0) +
      (parseInt(formData.stockInvestmentAmount) || 0)
    ).toLocaleString("en-IN");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Risk Tolerance Analysis
        </h3>
        <p className="text-sm text-gray-600">
          {mode === "zerodha"
            ? "Connect your Zerodha account to automatically analyze your portfolio"
            : "Enter your investment details manually"}
        </p>

        {/* Accuracy message placed prominently at the top */}
        {mode === "zerodha" && (
          <div className="mt-4 flex items-start text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
            <span>
              Connecting Zerodha provides more accurate risk tolerance
              calculations by analyzing your actual portfolio composition.
            </span>
          </div>
        )}
      </div>

      {/* Back button for manual mode */}
      {mode === "manual" && (
        <button
          onClick={() => setMode("zerodha")}
          className="flex items-center text-primary hover:text-primary-600 mb-4 text-sm font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Zerodha connection
        </button>
      )}

      {/* API Error Message */}
      {apiStatus.error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {apiStatus.error}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Zerodha Mode (Default) */}
        {mode === "zerodha" && (
          <div className="space-y-6">
            <div className="bg-primary-50 border border-gray-300 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 text-primary mr-2" />
                <h4 className="font-medium text-gray-900">
                  Connect Your Zerodha Account
                </h4>
              </div>

              {formData.zerodhaConnected && formData.zerodhaProfile ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium">
                      Connected to {formData.zerodhaProfile.user_name} (
                      {formData.zerodhaProfile.user_id})
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mb-2">
                    ✅ Account connected successfully
                  </p>
                  <p className="text-xs text-green-600">
                    We'll automatically analyze your portfolio data to calculate
                    your risk tolerance and provide personalized retirement
                    recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">
                      What we'll do with your Zerodha data:
                    </h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Analyze your current investment portfolio</li>
                      <li>• Calculate your risk tolerance automatically</li>
                      <li>• Generate personalized retirement scenarios</li>
                      <li>• Provide data-driven recommendations</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleZerodhaConnect}
                    disabled={zerodhaStatus.loading}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {zerodhaStatus.loading
                      ? "Connecting to Zerodha..."
                      : "Login with Zerodha"}
                  </button>

                  {zerodhaStatus.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {zerodhaStatus.error}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {errors.zerodha && (
                <p className="mt-2 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.zerodha}
                </p>
              )}
            </div>

            {/* FD Value Input for Zerodha Mode */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                Fixed Deposit Details
              </h4>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fixed Deposit Amount (₹) *
                </label>
                <input
                  type="number"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.fdValue ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.fdValue}
                  onChange={(e) => handleChange("fdValue", e.target.value)}
                  placeholder="e.g., 500000"
                />
                {errors.fdValue && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.fdValue}
                  </p>
                )}
                {formData.fdValue && (
                  <p className="mt-1 text-xs text-primary-600">
                    <span className="font-medium">
                      {numberToWords(formData.fdValue)}
                    </span>{" "}
                    Rupees
                  </p>
                )}
              </div>
            </div>

            {/* Manual entry option */}
            <div className="pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-600 mb-3">
                Don't want to connect your Zerodha account?
              </p>
              <button
                onClick={() => setMode("manual")}
                className="text-primary hover:text-primary-600 text-sm font-medium flex items-center"
              >
                <User className="h-4 w-4 mr-1" />
                Enter details manually instead
              </button>
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {mode === "manual" && (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center text-yellow-800 mb-1">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium">Manual Entry Mode</span>
              </div>
              <p className="text-sm text-yellow-700">
                You're providing your investment portfolio details manually. For
                more accurate risk assessment, consider connecting your Zerodha
                account.
              </p>
            </div>

            {/* Current Investment Portfolio */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-primary" />
                Current Investment Portfolio
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fixed Deposits (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.fixedDepositAmount}
                    onChange={(e) =>
                      handleChange("fixedDepositAmount", e.target.value)
                    }
                    placeholder="e.g., 500000"
                  />
                  {formData.fixedDepositAmount && (
                    <p className="mt-1 text-xs text-primary-600">
                      <span className="font-medium">
                        {numberToWords(formData.fixedDepositAmount)}
                      </span>{" "}
                      Rupees
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mutual Funds (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.mutualFundAmount}
                    onChange={(e) =>
                      handleChange("mutualFundAmount", e.target.value)
                    }
                    placeholder="e.g., 300000"
                  />
                  {formData.mutualFundAmount && (
                    <p className="mt-1 text-xs text-primary-600">
                      <span className="font-medium">
                        {numberToWords(formData.mutualFundAmount)}
                      </span>{" "}
                      Rupees
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Investments (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.stockInvestmentAmount}
                    onChange={(e) =>
                      handleChange("stockInvestmentAmount", e.target.value)
                    }
                    placeholder="e.g., 200000"
                  />
                  {formData.stockInvestmentAmount && (
                    <p className="mt-1 text-xs text-primary-600">
                      <span className="font-medium">
                        {numberToWords(formData.stockInvestmentAmount)}
                      </span>{" "}
                      Rupees
                    </p>
                  )}
                </div>
              </div>

              {errors.investments && (
                <p className="mt-2 text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.investments}
                </p>
              )}

              {parseInt(calculateTotalInvestments().replace(/,/g, "")) > 0 && (
                <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Total Current Investments:{" "}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{calculateTotalInvestments()}
                  </span>
                </div>
              )}
              {(() => {
                const total = parseInt(
                  calculateTotalInvestments().toString().replace(/,/g, "")
                );
                return (
                  total > 0 && (
                    <p className="mt-1 text-xs text-primary-600">
                      <span className="font-medium">
                        {numberToWords(total)}
                      </span>{" "}
                      Rupees
                    </p>
                  )
                );
              })()}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={
              (mode === "zerodha" && zerodhaStatus.loading) || apiStatus.loading
            }
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center space-x-2 disabled:opacity-50"
          >
            {apiStatus.loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>
              {apiStatus.loading
                ? "Calculating..."
                : mode === "zerodha"
                ? formData.zerodhaConnected
                  ? "Complete Analysis"
                  : "Connect & Analyze"
                : "Complete Risk Analysis"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskToleranceFormComponent;
