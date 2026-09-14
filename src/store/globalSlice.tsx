import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GlobalState {
  postModalVisible: boolean;
  requestModalVisible: boolean;
  errorModalVisible: boolean;
  errorMessage: string;
  errorTitle?: string;

  guestModal?: boolean;
}

const initialState: GlobalState = {
  postModalVisible: false,
  errorModalVisible: false,
  errorMessage: "",
  errorTitle: undefined,
  requestModalVisible: false,
  guestModal: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setPostModalVisible: (state, action: PayloadAction<boolean>) => {
      state.postModalVisible = action.payload;
    },
    setGuestModalVisible: (state, action: PayloadAction<boolean>) => {
      state.guestModal = action.payload;
    },
    setRequestModalVisible: (state, action: PayloadAction<boolean>) => {
      state.requestModalVisible = action.payload;
    },
    setErrorModalVisible: (state, action: PayloadAction<boolean>) => {
      state.errorModalVisible = action.payload;
    },
    setErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setErrorTitle: (state, action: PayloadAction<string | undefined>) => {
      state.errorTitle = action.payload;
    },
  },
});

export const {
  setErrorModalVisible,
  setErrorMessage,
  setErrorTitle,
  setPostModalVisible,
  setRequestModalVisible,
  setGuestModalVisible,
} = globalSlice.actions;
export default globalSlice.reducer;
