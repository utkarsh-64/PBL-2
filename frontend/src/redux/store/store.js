import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../slices/counterSlice";
import learningPageReducer from "../slices/learningPage";
import userDataReducer from "../slices/userDataSlice";
import dashboardDataReducer from "../slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    learningPage: learningPageReducer,
    userData: userDataReducer,
    dashboardData: dashboardDataReducer,
  },
});
