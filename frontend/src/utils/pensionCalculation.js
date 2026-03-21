import { returnRates } from "../data/pensionOptimizationData";

// Helper function to calculate risk tolerance from Zerodha portfolio
const calculateRiskToleranceFromZerodha = (userData, formData) => {
  // This would analyze the Zerodha portfolio composition
  // For now, return a default value - this will be replaced with actual analysis
  if (formData.zerodhaProfile) {
    // TODO: Implement actual portfolio analysis logic here
    // This is a placeholder that would analyze:
    // - Stock vs Fixed deposit ratio
    // - Mutual fund allocation
    // - Investment behavior patterns
    // - Risk-weighted portfolio composition

    // Placeholder logic based on connected status
    return "moderate"; // Default for Zerodha users
  }
  return "moderate";
};

// Helper function to get return rates based on risk tolerance
const getReturnRate = (riskTolerance, scenarioType) => {
  return returnRates[riskTolerance]?.[scenarioType] || 0.06;
};

export { calculateRiskToleranceFromZerodha, getReturnRate };
