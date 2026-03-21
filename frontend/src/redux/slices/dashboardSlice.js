import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentAge: 50,
  monthlyIncome: 50000,
  monthlyContribution: 30000,
  retirementAge: 60,
  lifeExpectancy: 78,
  growthRate: 0.08,
  postWithdrawalReturn: 0.06,
  retirementExpense: 45000,
  lifestyle: "Comfortable",
  inflationRate: 0.06,
  taxBracket: 30,
  activeScenario: "base",
};

const dashboardSlice = createSlice({
  name: "dashboardData",
  initialState,
  reducers: {
    setCurrentAge(state, action) {
      state.currentAge = action.payload;
    },
    setMonthlyIncome(state, action) {
      state.monthlyIncome = action.payload;
    },
    setMonthlyContribution(state, action) {
      state.monthlyContribution = action.payload;
    },
    setRetirementAge(state, action) {
      state.retirementAge = action.payload;
    },
    setLifeExpectancy(state, action) {
      state.lifeExpectancy = action.payload;
    },
    setRetirementExpense(state, action) {
      state.retirementExpense = action.payload;
    },
    setLifestyle(state, action) {
      state.lifestyle = action.payload;
    },
    setInflationRate(state, action) {
      state.inflationRate = action.payload;
    },
    setTaxBracket(state, action) {
      state.taxBracket = action.payload;
    },
    setPostWithdrawalReturn(state, action) {
      state.postWithdrawalReturn = action.payload;
    },
    setActiveScenario(state, action) {
      state.activeScenario = action.payload;
    },
    setAllDashboardData(state, action) {
      // Optional: bulk update
      Object.assign(state, action.payload);
    },
  },
});

export const {
  setCurrentAge,
  setMonthlyIncome,
  setMonthlyContribution,
  setRetirementAge,
  setLifeExpectancy,
  setRetirementExpense,
  setLifestyle,
  setInflationRate,
  setTaxBracket,
  setActiveScenario,
  setAllDashboardData,
  setPostWithdrawalReturn,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
