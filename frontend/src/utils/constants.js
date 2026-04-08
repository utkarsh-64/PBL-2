// Update this URL to match your Django backend

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? "https://wealthwise-api-odci.onrender.com"
    : "http://localhost:8000");
export const APP_NAME = "FinScope";

export const LIMITS = {
  currentSalary: { min: 0, max: 10000000 }, // ₹0 – ₹1Cr
  yearsOfService: { min: 0, max: 100 }, // 0 – 100 years
  pensionBalance: { min: 0, max: 10000000000 }, // ₹0 – ₹100Cr
  employerContribution: { min: 0, max: 1000000 }, // ₹0 – ₹10L per month
};
