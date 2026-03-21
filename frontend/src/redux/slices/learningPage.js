import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  completedTopics: [],
  selectedTopic: null,
  expandedModules: [1],
};

const learningPage = createSlice({
  name: "learningPage",
  initialState,
  reducers: {
    setCompletedTopics: (state, action) => {
      state.completedTopics = action.payload;
    },
    setSelectedTopic: (state, action) => {
      state.selectedTopic = action.payload;
    },
    setExpandedModules: (state, action) => {
      state.expandedModules = action.payload;
    },
  },
});

export const { setCompletedTopics, setSelectedTopic, setExpandedModules } =
  learningPage.actions;
export default learningPage.reducer;
