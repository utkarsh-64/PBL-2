import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../redux/slices/userDataSlice";
import { calculateAge } from "../../utils/textUtils";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

const BasicInfoFormComponent = ({ onSubmit }) => {
  const { user } = useAuth();
  const { userData } = useSelector((state) => state.userData);
  const [formData, setFormData] = useState({
    name: user.name || "",
    dateOfBirth: userData.dateOfBirth || "",
    gender: userData.gender || "",
    location: userData.location || "",
    maritalStatus: userData.maritalStatus || "",
    numberOfDependants: userData.numberOfDependants || "",
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "Please enter a valid name";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Please select your date of birth";
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (!age || age < 18 || age > 100) {
        newErrors.dateOfBirth =
          "Age must be between 18 and 100 years based on your DOB";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.location || formData.location.trim().length < 2) {
      newErrors.location = "Please enter your location";
    }

    if (!formData.maritalStatus) {
      newErrors.maritalStatus = "Please select your marital status";
    }
    if (formData.numberOfDependants === "" || formData.numberOfDependants === null) {
      newErrors.numberOfDependants = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const age = calculateAge(formData.dateOfBirth);
      dispatch(setUserData({ ...formData, age }));
      const finalData = { ...formData, age };
      try {
        const token = localStorage.getItem("token");
        const payload = {
          name: finalData.name,
          dateOfBirth: finalData.dateOfBirth,
          gender: finalData.gender,
          location: finalData.location,
          maritalStatus: finalData.maritalStatus,
          numberOfDependants: finalData.numberOfDependants,
        };

        console.log("payload is " + payload);
        const response = await axios.post(
          `${API_BASE_URL}/users/user/add/`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );
        console.log(response.data);
        onSubmit("Income Status", {
          ...formData,
          age,
          formName: "basic-info-form",
        });
      } catch (error) {
        if (error.response) {
          console.error("Backend validation error:", error.response.data); // 👈 this will show exact field errors
        } else {
          console.error("Request failed:", error.message);
        }
      }
    }
  };

  const calculatedAge = calculateAge(formData.dateOfBirth);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Let's Start with Your Basic Information
        </h3>
        <p className="text-sm text-gray-600">
          This helps me create personalized retirement scenarios for you
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                }`}
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.dateOfBirth}
              </p>
            )}
            {calculatedAge !== null && !errors.dateOfBirth && (
              <p className="mt-1 text-xs text-primary-600">
                Calculated Age:{" "}
                <span className="font-medium">{calculatedAge}</span> years
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender *
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.gender ? "border-red-500" : "border-gray-300"
                }`}
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.gender}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.location ? "border-red-500" : "border-gray-300"
                }`}
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="City, State"
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marital Status *
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.maritalStatus ? "border-red-500" : "border-gray-300"
                }`}
              value={formData.maritalStatus}
              onChange={(e) => handleChange("maritalStatus", e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
            {errors.maritalStatus && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.maritalStatus}
              </p>
            )}
          </div>

          {/* Dependants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Dependants *
            </label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.numberOfDependants ? "border-red-500" : "border-gray-300"
                }`}
              value={formData.numberOfDependants}
              onChange={(e) => handleChange("numberOfDependants", e.target.value)}
              placeholder="e.g., 2"
              min="0"
            />
            {errors.numberOfDependants && (
              <p className="mt-1 text-xs text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.numberOfDependants}
              </p>
            )}
          </div>

        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center space-x-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Continue to Income Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoFormComponent;
