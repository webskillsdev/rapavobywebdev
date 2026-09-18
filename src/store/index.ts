// store/index.ts
import { configureStore, type ConfigureStoreOptions } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { api } from "./base";
import feedbackReducer from "./feedbackSlice";
import globalReducer from "./globalSlice";
import { listingSlice } from "./listingSlice";
import uploadReducer from "./uploadSlice";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    global: globalReducer,
    listing: listingSlice.reducer,
    upload: uploadReducer,
    feedback: feedbackReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;