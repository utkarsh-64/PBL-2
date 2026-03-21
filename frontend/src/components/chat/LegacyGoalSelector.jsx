const LegacyGoalSelector = ({ formData, handleChange, errors }) => {
  const options = [
    { value: "maximize-income", label: "Maximize my retirement income" },
    { value: "moderate-legacy", label: "Modest inheritance for family" },
    { value: "substantial-legacy", label: "Substantial wealth transfer" },
    { value: "charitable-giving", label: "Charitable giving focus" },
    { value: "no-preference", label: "No specific preference" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-700">Select your legacy preference</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => handleChange("legacyGoal", option.value)}
            className={`cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition
              ${
                formData.legacyGoal === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }
              ${errors.legacyGoal ? "border-red-500" : ""}
            `}
          >
            {option.label}
          </div>
        ))}
      </div>
      {errors.legacyGoal && (
        <p className="text-red-500 text-sm mt-1">{errors.legacyGoal}</p>
      )}
    </div>
  );
};

export default LegacyGoalSelector;
