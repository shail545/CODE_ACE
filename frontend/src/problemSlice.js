// problemSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  problems: {},
  currentProblemId: null,
  selectedLanguage: 'javascript',
  activeLeftTab: 'description',
  activeRightTab: 'code'
};

const problemSlice = createSlice({
  name: 'problems',
  initialState,
  reducers: {
    setCurrentProblem: (state, action) => {
      state.currentProblemId = action.payload;
    },
    updateProblemCode: (state, action) => {
      const { problemId, language, code } = action.payload;
      if (!state.problems[problemId]) {
        state.problems[problemId] = {};
      }
      state.problems[problemId][language] = code;
    },
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    setActiveLeftTab: (state, action) => {
      state.activeLeftTab = action.payload;
    },
    setActiveRightTab: (state, action) => {
      state.activeRightTab = action.payload;
    }
  }
});

export const { 
  setCurrentProblem, 
  updateProblemCode,
  setSelectedLanguage,
  setActiveLeftTab,
  setActiveRightTab
} = problemSlice.actions;

export default problemSlice.reducer;