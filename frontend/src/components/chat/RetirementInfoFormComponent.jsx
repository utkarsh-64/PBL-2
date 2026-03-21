import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../redux/slices/userDataSlice";
import LegacyGoalSelector from "./LegacyGoalSelector";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";
const RetirementInfoFormComponent = ({ onSubmit }) => {
  const { userData } = useSelector((state) => state.userData);
  const safeUserData = userData || {};
  const currentAge = parseInt(safeUserData.age) || 25;

  const [formData, setFormData] = useState({
    plannedRetirementAge: safeUserData.plannedRetirementAge || "",
    retirementLifestyle: safeUserData.retirementLifestyle || "",
    monthlyRetirementExpense: safeUserData.monthlyRetirementExpense || "",
    legacyGoal: safeUserData.legacyGoal || "",
    formName: "retirement-info-form",
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  // Simplified handleChange function
  const handleChange = (field, value) => {
    try {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error for this field
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: null,
        }));
      }
    } catch (error) {
      console.error("Error in handleChange:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      !formData.plannedRetirementAge ||
      formData.plannedRetirementAge <= currentAge ||
      formData.plannedRetirementAge > 75
    ) {
      newErrors.plannedRetirementAge = `Please enter a valid retirement age (${
        currentAge + 1
      }-75)`;
    }

    if (!formData.retirementLifestyle) {
      newErrors.retirementLifestyle =
        "Please select your desired retirement lifestyle";
    }

    if (
      !formData.monthlyRetirementExpense ||
      formData.monthlyRetirementExpense <= 0
    ) {
      newErrors.monthlyRetirementExpense =
        "Please enter your expected monthly retirement expenses";
    }

    if (!formData.legacyGoal) {
      newErrors.legacyGoal = "Please select your legacy goal preference";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    try {
      if (validateForm()) {
        if (typeof setUserData === "function") {
          dispatch(setUserData({ ...formData }));
        }
        try {
          const token = localStorage.getItem("token");
          const payload = {
            plannedRetirementAge: formData.plannedRetirementAge,
            retirementLifestyle: formData.retirementLifestyle,
            monthlyRetirementExpense: formData.monthlyRetirementExpense,
            legacyGoal: formData.legacyGoal,
          };
          console.log("payload is " + JSON.stringify(payload));
          const response = axios.post(
            `${API_BASE_URL}/users/retirement/add/`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );
        } catch (error) {
          if (error.response) {
            console.error("Backend validation error:", error.response.data); // 👈 this will show exact field errors
          } else {
            console.error("Request failed:", error.message);
          }
        }
        if (typeof onSubmit === "function") {
          onSubmit(
            "I've completed my retirement planning information",
            formData
          );
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const lifestyleOptions = [
    {
      value: "minimalistic",
      title: "Minimalistic",
      description: "Basic needs covered, simple living",
    },
    {
      value: "comfortable",
      title: "Comfortable",
      description: "Comfortable lifestyle with moderate luxuries",
    },
    {
      value: "lavish",
      title: "Lavish",
      description: "Premium lifestyle with luxury amenities",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Retirement Planning
        </h3>
        <p className="text-sm text-gray-600">
          Finally, let's understand your retirement goals and expectations
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planned Retirement Age *
            </label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.plannedRetirementAge
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={formData.plannedRetirementAge}
              onChange={(e) =>
                handleChange("plannedRetirementAge", e.target.value)
              }
              placeholder="e.g., 60"
              min={currentAge + 1}
              max="75"
            />
            {errors.plannedRetirementAge && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.plannedRetirementAge}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Monthly Retirement Expense (₹) *
            </label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.monthlyRetirementExpense
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              value={formData.monthlyRetirementExpense}
              onChange={(e) =>
                handleChange("monthlyRetirementExpense", e.target.value)
              }
              placeholder="e.g., 75000"
            />
            {errors.monthlyRetirementExpense && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.monthlyRetirementExpense}
              </p>
            )}
          </div>
        </div>

        {/* Retirement Lifestyle - Simplified radio buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Desired Retirement Lifestyle *
          </label>
          <div className="space-y-3">
            {lifestyleOptions.map((option) => (
              <div
                key={option.value}
                onClick={() =>
                  handleChange("retirementLifestyle", option.value)
                }
                className={`p-4 border-2 rounded-lg transition-colors cursor-pointer ${
                  formData.retirementLifestyle === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">
                      {option.title}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                  {formData.retirementLifestyle === option.value && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center ml-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {errors.retirementLifestyle && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.retirementLifestyle}
            </p>
          )}
        </div>

        {/* Legacy Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Legacy Goal *
          </label>
          <LegacyGoalSelector
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
          {errors.legacyGoal && (
            <p className="mt-1 text-xs text-red-600 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.legacyGoal}
            </p>
          )}
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 text-sm mb-2">
            Planning Summary:
          </h4>
          <div className="text-xs text-green-800 space-y-1">
            <div>• Current Age: {currentAge} years</div>
            {formData.plannedRetirementAge && (
              <div>
                • Years to Retirement:{" "}
                {formData.plannedRetirementAge - currentAge} years
              </div>
            )}
            <div>
              • Current Pension Balance: ₹
              {safeUserData.pensionBalance
                ? parseInt(safeUserData.pensionBalance).toLocaleString("en-IN")
                : "0"}
            </div>
            {formData.monthlyRetirementExpense && (
              <div>
                • Target Monthly Expense: ₹
                {parseInt(formData.monthlyRetirementExpense).toLocaleString(
                  "en-IN"
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <span>Continue to Health Assessment</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetirementInfoFormComponent;
