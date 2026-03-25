// Update this URL to match your Django backend

export const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://4.213.60.21.nip.io"
    : "http://localhost:5000";
    
export const APP_NAME = "FinScope";

export const LIMITS = {
  currentSalary: { min: 0, max: 10000000 }, // ₹0 – ₹1Cr
  yearsOfService: { min: 0, max: 100 }, // 0 – 100 years
  pensionBalance: { min: 0, max: 10000000000 }, // ₹0 – ₹100Cr
  employerContribution: { min: 0, max: 1000000 }, // ₹0 – ₹10L per month
};
