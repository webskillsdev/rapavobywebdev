import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  uid: string;
  email: string;
  fullName: string;
  initials: string;
  photoURL?: string | null;
  permissions: string[];
  location: string;
  companyName: string;
  companyLocation: string;
  phoneNumber: string;
  whatsappNumber: string;
  areasOperate: string[];
  aboutMe: string;
  currentMode: string;
  agentProfileCompleted: boolean;
  cac: string;
  meansOfIdentification: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authReady: boolean;
  onboardingComplete: boolean;
  isRecovering: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  authReady: false,
  onboardingComplete: false,
  isRecovering: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setRecovering: (state, action: PayloadAction<boolean>) => {
      state.isRecovering = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    setAuthReady: (state, action: PayloadAction<boolean>) => {
      state.authReady = action.payload;
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.onboardingComplete = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
});

export const {
  setUser,
  clearUser,
  setAuthReady,
  setOnboardingComplete,
  updateUser,
  setRecovering
} = authSlice.actions;
export default authSlice.reducer;
