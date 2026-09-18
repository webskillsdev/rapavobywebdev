import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type FeedbackType = "success" | "error";

interface FeedbackState {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
}

const initialState: FeedbackState = {
  visible: false,
  type: "error",
  title: "",
  message: "",
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,

  reducers: {
    showFeedback: (
      state,
      action: PayloadAction<{
        type: FeedbackType;
        title: string;
        message: string;
      }>,
    ) => {
      state.visible = true;
      state.type = action.payload.type;
      state.title = action.payload.title;
      state.message = action.payload.message;
    },

    hideFeedback: (state) => {
      state.visible = false;
      state.title = "";
      state.message = "";
    },
  },
});

export const { showFeedback, hideFeedback } = feedbackSlice.actions;

export default feedbackSlice.reducer;
