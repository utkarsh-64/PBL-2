import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../redux/slices/userDataSlice";
import { numberToWords } from "../../utils/textUtils";
import { LIMITS } from "../../utils/constants";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

const EMPLOYER_SCHEME_OPTIONS = {
  government: [
    { value: "ops", label: "OPS (Old Pension Scheme)" },
    { value: "nps", label: "NPS (National Pension System)" },
  ],
  private: [
    { value: "nps", label: "NPS (National Pension System)" },
    { value: "epf", label: "EPF (Employee Provident Fund)" },
  ],
  "self-employed": [{ value: "nps", label: "NPS (National Pension System)" }],
};

const IncomeStatusFormComponent = ({ onSubmit }) => {
  const userData = useSelector((state) => state.userData);

  const [formData, setFormData] = useState({
    currentSalary: userData.currentSalary || "",
    yearsOfService: userData.yearsOfService || "",
    employerType: userData.employerType || "",
    pensionScheme: userData.pensionScheme || "",
    pensionBalance: userData.pensionBalance || "",
    employerContribution: userData.employerContribution || "",
    formName: "income-status-form",
    yourContribution: userData.yourContribution || "",
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  const handleChange = (field, value) => {
    let processedValue = value;

    if (LIMITS[field] && value !== "" && !isNaN(value)) {
      const numericValue = Number(value);
      processedValue = Math.max(
        LIMITS[field].min,
        Math.min(LIMITS[field].max, numericValue)
      );
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));

    // Reset pension scheme and contributions if employer type changes
    if (field === "employerType") {
      setFormData((prev) => ({
        ...prev,
        pensionScheme: "",
        pensionBalance: "",
        employerContribution: "",
        yourContribution: "",
      }));
    }

    // Auto-calculate EPF contributions when pension scheme is EPF or salary changes
    if (
      field === "pensionScheme" &&
      value === "epf" &&
      formData.currentSalary
    ) {
      const epfContribution = Math.min(
        15000,
        Math.round(formData.currentSalary * 0.12)
      );
      setFormData((prev) => ({
        ...prev,
        [field]: processedValue,
        employerContribution: epfContribution,
        yourContribution: epfContribution,
      }));
    } else if (field === "currentSalary" && formData.pensionScheme === "epf") {
      const epfContribution = Math.min(
        15000,
        Math.round(processedValue * 0.12)
      );
      setFormData((prev) => ({
        ...prev,
        [field]: processedValue,
        employerContribution: epfContribution,
        yourContribution: epfContribution,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentSalary || formData.currentSalary <= 0) {
      newErrors.currentSalary = "Please enter a valid current salary";
    }

    if (!formData.yearsOfService || formData.yearsOfService < 0) {
      newErrors.yearsOfService = "Please enter valid years of service";
    }

    if (!formData.employerType) {
      newErrors.employerType = "Please select your employer type";
    }

    if (!formData.pensionScheme) {
      newErrors.pensionScheme = "Please select your pension scheme";
    }

    // Pension Balance required only if NOT (government with OPS)
    if (
      !(
        formData.employerType === "government" &&
        formData.pensionScheme === "ops"
      ) &&
      formData.employerType !== "" &&
      formData.pensionScheme !== "" &&
      (!formData.pensionBalance || formData.pensionBalance < 0)
    ) {
      newErrors.pensionBalance = "Please enter a valid pension balance";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const token = localStorage.getItem("token");

        // ✅ Normalize hidden fields to 0 before sending
        const normalizedData = {
          ...formData,
          pensionBalance:
            formData.employerType === "government" &&
            formData.pensionScheme === "ops"
              ? 0
              : formData.pensionBalance || 0,
          employerContribution:
            formData.employerType === "private"
              ? formData.employerContribution || 0
              : 0,
          yourContribution:
            formData.employerType === "government" &&
            formData.pensionScheme === "ops"
              ? 0
              : formData.yourContribution || 0,
        };
        console.log(normalizedData);

        await axios.post(`${API_BASE_URL}/users/income/add/`, normalizedData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        dispatch(setUserData(normalizedData));
        onSubmit("I've completed my income status information", normalizedData);
      } catch (error) {
        if (error.response) {
          console.error("Backend validation error:", error.response.data);
        } else {
          console.error("Request failed:", error.message);
        }
      }
    }
  };

  // Pension scheme options based on employer type
  const pensionOptions = formData.employerType
    ? EMPLOYER_SCHEME_OPTIONS[formData.employerType] || []
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Income Status
        </h3>
        <p className="text-sm text-gray-600">
          Now let's understand your current income and employment details
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Current Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Salary (₹/month) *
            </label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.currentSalary ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.currentSalary}
              onChange={(e) => handleChange("currentSalary", e.target.value)}
              placeholder="e.g., 150000"
            />
            {errors.currentSalary && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.currentSalary}
              </p>
            )}
            {formData.currentSalary && (
              <p className="mt-1 text-xs text-primary-600">
                <span className="font-medium">
                  {numberToWords(formData.currentSalary)}
                </span>{" "}
                Rupees
              </p>
            )}
          </div>

          {/* Years of Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Service *
            </label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.yearsOfService ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.yearsOfService}
              onChange={(e) => handleChange("yearsOfService", e.target.value)}
              placeholder="e.g., 15"
              min="0"
            />
            {errors.yearsOfService && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.yearsOfService}
              </p>
            )}
            {formData.yearsOfService && (
              <p className="mt-1 text-xs text-primary-600">
                <span className="font-medium">
                  {numberToWords(formData.yearsOfService)}
                </span>{" "}
                Years
              </p>
            )}
          </div>

          {/* Employer Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employer Type *
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.employerType ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.employerType}
              onChange={(e) => handleChange("employerType", e.target.value)}
            >
              <option value="">Select Employer Type</option>
              <option value="government">Government</option>
              <option value="private">Private</option>
              <option value="self-employed">Self Employed</option>
            </select>
            {errors.employerType && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.employerType}
              </p>
            )}
          </div>

          {/* Pension Scheme - Dynamic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pension Scheme *
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.pensionScheme ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.pensionScheme}
              onChange={(e) => handleChange("pensionScheme", e.target.value)}
              disabled={!formData.employerType}
            >
              <option value="">Select Pension Scheme</option>
              {pensionOptions.map((scheme) => (
                <option key={scheme.value} value={scheme.value}>
                  {scheme.label}
                </option>
              ))}
            </select>
            {errors.pensionScheme && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.pensionScheme}
              </p>
            )}
          </div>

          {/* Employer Contribution - show only if Private */}
          {formData.employerType === "private" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Employer Contribution (₹)
                {formData.pensionScheme === "epf" && (
                  <span className="text-xs text-blue-600 ml-1">
                    (Auto-calculated: 12% of salary, max ₹15,000)
                  </span>
                )}
              </label>
              <input
                type="number"
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  formData.pensionScheme === "epf"
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
                value={formData.employerContribution}
                onChange={(e) =>
                  handleChange("employerContribution", e.target.value)
                }
                placeholder="e.g., 15000"
                readOnly={formData.pensionScheme === "epf"}
                disabled={formData.pensionScheme === "epf"}
              />
              {formData.employerContribution && (
                <p className="mt-1 text-xs text-primary-600">
                  <span className="font-medium">
                    {numberToWords(formData.employerContribution)}
                  </span>{" "}
                  Rupees
                </p>
              )}
            </div>
          )}

          {/* Your Contribution - show if NOT (government with OPS) */}
          {!(
            formData.employerType === "government" &&
            formData.pensionScheme === "ops"
          ) &&
            formData.employerType !== "" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Contribution (₹)
                  {formData.pensionScheme === "epf" && (
                    <span className="text-xs text-blue-600 ml-1">
                      (Auto-calculated: 12% of salary, max ₹15,000)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    formData.pensionScheme === "epf"
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                  value={formData.yourContribution}
                  onChange={(e) =>
                    handleChange("yourContribution", e.target.value)
                  }
                  placeholder="e.g., 10000"
                  readOnly={formData.pensionScheme === "epf"}
                  disabled={formData.pensionScheme === "epf"}
                />
                {formData.yourContribution && (
                  <p className="mt-1 text-xs text-primary-600">
                    <span className="font-medium">
                      {numberToWords(formData.yourContribution)}
                    </span>{" "}
                    Rupees
                  </p>
                )}
              </div>
            )}

          {/* Pension Balance - show if NOT (government with OPS) */}
          {!(
            formData.employerType === "government" &&
            formData.pensionScheme === "ops"
          ) &&
            formData.employerType !== "" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Pension Balance (₹) *
                </label>
                <input
                  type="number"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.pensionBalance ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.pensionBalance}
                  onChange={(e) =>
                    handleChange("pensionBalance", e.target.value)
                  }
                  placeholder="e.g., 2000000"
                />
                {errors.pensionBalance && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.pensionBalance}
                  </p>
                )}
                {formData.pensionBalance && (
                  <p className="mt-1 text-xs text-primary-600">
                    <span className="font-medium">
                      {numberToWords(formData.pensionBalance)}
                    </span>{" "}
                    Rupees
                  </p>
                )}
              </div>
            )}
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 text-sm mb-2">
            Information Note:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>
              • OPS: Provides fixed pension after retirement based on last drawn
              salary
            </li>
            <li>
              • NPS: Market-linked returns with annuity and lump sum options
            </li>
            <li>
              • EPF: Fixed returns with tax benefits, withdrawable after 5 years
            </li>
            <li>
              • EPF contributions are automatically calculated at 12% of monthly
              salary for both employer and employee (capped at ₹15,000)
            </li>
          </ul>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Continue to Retirement Planning</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatusFormComponent;
