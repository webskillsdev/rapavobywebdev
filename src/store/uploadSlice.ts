import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadState {
  status: UploadStatus;
  progress: number; // 0–100
  listingId: string | null;
  shareableLink: string | null;
  errorMessage: string | null;
  errorTitle: string
  errorCode: string
}

const initialState: UploadState = {
  status: "idle",
  progress: 0,
  listingId: null,
  shareableLink: null,
  errorMessage: null,
  errorTitle: "",
  errorCode: "",
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    startUpload: (state) => {
      state.status = "uploading";
      state.progress = 0;
      state.listingId = null;
      state.shareableLink = null;
      state.errorMessage = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.progress = Math.min(action.payload, 99); // hold at 99 until confirmed
    },
    uploadSuccess: (
      state,
      action: PayloadAction<{ listingId: string; shareableLink: string }>,
    ) => {
      state.status = "success";
      state.progress = 100;
      state.listingId = action.payload.listingId;
      state.shareableLink = action.payload.shareableLink;
    },
    uploadError: (state, action: PayloadAction<{
    title?: string;
    message: string;
  }>,) => {
      state.status = "error";
      state.errorTitle = action.payload.title || "Property not created";
      state.errorMessage = action.payload.message;
    },
    resetUpload: () => initialState,
  },
});

export const {
  startUpload,
  setUploadProgress,
  uploadSuccess,
  uploadError,
  resetUpload,
} = uploadSlice.actions;

export default uploadSlice.reducer;
