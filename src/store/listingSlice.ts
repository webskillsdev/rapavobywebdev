import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type MediaType = "photo" | "video";

interface ListingState {
  mediaUri: string | null;
  mediaType: MediaType | null;
  additionalImages: string[];
  title: string;
  price: string;
  description: string;
  uploadProgress: number;
  shareableLink: string | null;
  listingId: string | null;
  


}

const initialState: ListingState = {
  mediaUri: null,
  mediaType: null,
  additionalImages: [],
  title: "",
  price: "",
  description: "",
  uploadProgress: 0,
  shareableLink: null,
  listingId: null,
 

};

export const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    setMedia: (
      state,
      action: PayloadAction<{ uri: string; type: MediaType }>,
    ) => {
      state.mediaUri = action.payload.uri;
      state.mediaType = action.payload.type;
    },

    // Set all selected images at once — first is primary
    setMultipleImages: (
      state,
      action: PayloadAction<{ uris: string[]; type: MediaType }>,
    ) => {
      const [primary, ...rest] = action.payload.uris;
      state.mediaUri = primary;
      state.mediaType = action.payload.type;
      state.additionalImages = rest;
    },

    // Swap which image is primary
    setPrimaryImage: (state, action: PayloadAction<number>) => {
      const allImages = [state.mediaUri!, ...state.additionalImages];
      const newPrimaryIndex = action.payload;
      const newPrimary = allImages[newPrimaryIndex];
      const rest = allImages.filter((_, i) => i !== newPrimaryIndex);
      state.mediaUri = newPrimary;
      state.additionalImages = rest;
    },

    setAdditionalImages: (state, action: PayloadAction<string[]>) => {
      state.additionalImages = action.payload;
    },

    setFormField: (
      state,
      action: PayloadAction<{
        field: "title" | "price" | "description";
        value: string;
      }>,
    ) => {
      state[action.payload.field] = action.payload.value;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setListingResult: (
      state,
      action: PayloadAction<{ link: string; id: string }>,
    ) => {
      state.shareableLink = action.payload.link;
      state.listingId = action.payload.id;
    },
    resetListing: () => initialState,


  },
});

export const {
  setMedia,
  setMultipleImages,
  setPrimaryImage,
  setAdditionalImages,
  setFormField,
  setUploadProgress,
  setListingResult,
  resetListing,

} = listingSlice.actions;


export default listingSlice.reducer;
