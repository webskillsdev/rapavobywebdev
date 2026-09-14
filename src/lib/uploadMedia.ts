// import storage from "@react-native-firebase/storage";

import { PropertyCreationErrorCode } from "@/utils/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImageManipulator from "expo-image-manipulator";
import { CLOUDINARY_CONFIG } from "../lib/config";

export interface MediaItem {
  uri: string;
  type: "photo" | "video";
  thumbnailUrl?: string;
}

export interface UploadedMedia {
  url: string;
  type: "photo" | "video";
  publicId: string;
  thumbnailUrl?: string;
}

// Upload a single file to Cloudinary
export const uploadSingleMedia = async (
  uri: string,
  listingId: string,
  mediaType: "photo" | "video",
  index: number,
  onProgress?: (progress: number) => void,
): Promise<UploadedMedia> => {
  const formData = new FormData();

  formData.append("file", {
    uri,
    type: mediaType === "photo" ? "image/jpeg" : "video/mp4",
    name: `${listingId}_${index}.${mediaType === "photo" ? "jpg" : "mp4"}`,
  } as any);

  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("public_id", `listings/${listingId}/${mediaType}_${index}`);

  const endpoint =
    mediaType === "photo"
      ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = event.loaded / event.total;
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (response.secure_url) {
          resolve({
            url: response.secure_url,
            type: mediaType,
            publicId: response.public_id,
            thumbnailUrl: response.thumbnail_url,
          });
        } else {
          reject(new Error("Upload failed: No URL returned"));
        }
      } catch {
        reject(new Error("Upload failed: Invalid response"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed: Network error"));
    xhr.send(formData);
  });
};

import { File } from "expo-file-system";

const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const validateMediaItems = async (
  mediaItems: MediaItem[],
): Promise<void> => {
  if (!mediaItems?.length) {
    throw {
      success: false,
      code: "NO_MEDIA",
      title: "No images selected",
      message:
        "Please select at least one property image before creating your listing.",
    };
  }

  for (let i = 0; i < mediaItems.length; i++) {
    const item = mediaItems[i];

    if (item.type !== "photo") continue;

    try {
      const file = new File(item.uri);

      if (!file.exists) {
        throw {
          success: false,
          code: "IMAGE_NOT_FOUND",
          title: "Image not found",
          message: `Image ${i + 1} could not be found. Please remove it and select the image again.`,
        };
      }

      const fileSize = file.size;

      if (fileSize > MAX_IMAGE_SIZE_BYTES) {
        const actualSizeMB = (fileSize / (1024 * 1024)).toFixed(1);

        throw {
          success: false,
          code: "IMAGE_TOO_LARGE",
          title: "Image upload failed",
          message: `Image ${i + 1} is ${actualSizeMB}MB. The maximum allowed image size is ${MAX_IMAGE_SIZE_MB}MB. Your property information has been saved. Please replace the image and try again.`,
        };
      }
    } catch (error: any) {
      // Preserve our own validation errors
      if (
        error?.code === "IMAGE_NOT_FOUND" ||
        error?.code === "IMAGE_TOO_LARGE"
      ) {
        throw error;
      }

      throw {
        success: false,
        code: "IMAGE_VALIDATION_ERROR",
        title: "Unable to check image",
        message: `We couldn't verify image ${i + 1}. Please remove it and select the image again.`,
      };
    }
  }
};

// Upload multiple media files with combined progress tracking
export const uploadMedia = async (
  // Keep old signature for backwards compat
  uri: string,
  listingId: string,
  mediaType: "photo" | "video",
  onProgress?: (progress: number) => void,
): Promise<string> => {
  const result = await uploadSingleMedia(
    uri,
    listingId,
    mediaType,
    0,
    onProgress,
  );
  return result.url;
};

export const uploadMultipleMedia = async (
  mediaItems: MediaItem[],
  listingId: string,
  onProgress?: (totalProgress: number, fileIndex: number) => void,
): Promise<UploadedMedia[]> => {
  try {
    await validateMediaItems(mediaItems);

    const total = mediaItems.length;
    const fileProgresses = new Array(total).fill(0);

    const updateTotalProgress = (fileIndex: number, fileProgress: number) => {
      fileProgresses[fileIndex] = fileProgress;

      const totalProgress =
        fileProgresses.reduce((sum, progress) => sum + progress, 0) / total;

      onProgress?.(totalProgress, fileIndex);
    };

    const optimizedUris = await Promise.all(
      mediaItems.map(async (item, i) => {
        if (item.type === "photo") {
          return optimizeImageForUpload(item.uri, i === 0);
        }

        return item.uri;
      }),
    );

    const uploadedResults = await Promise.all(
      mediaItems.map((item, i) =>
        uploadSingleMedia(
          optimizedUris[i],
          listingId,
          item.type,
          i,
          (fileProgress) => updateTotalProgress(i, fileProgress),
        ),
      ),
    );

    return uploadedResults.map((uploaded) => {
      const optimizedUrl = uploaded.url.replace(
        "/upload/",
        uploaded.type === "photo"
          ? "/upload/q_auto,f_auto/"
          : "/upload/q_auto,vc_auto/",
      );

      const thumbnailUrl =
        uploaded.type === "photo"
          ? uploaded.url.replace(
              "/upload/",
              "/upload/w_500,h_500,c_fill,q_auto,f_auto/",
            )
          : undefined;

      return {
        ...uploaded,
        url: optimizedUrl,
        thumbnailUrl,
      };
    });
  } catch (error: any) {
    // Preserve our intentional validation errors
    if (error?.code === "IMAGE_TOO_LARGE") {
      throw error;
    }

    if (error?.code === "IMAGE_NOT_FOUND") {
      throw error;
    }

    if (error?.code === "NO_MEDIA") {
      throw error;
    }

    // Network errors
    if (
      error?.message?.toLowerCase().includes("network") ||
      error?.message?.toLowerCase().includes("fetch") ||
      error?.message?.toLowerCase().includes("timeout")
    ) {
      throw {
        success: false,
        code: "NETWORK_ERROR",
        title: "Property not created",
        message:
          "We couldn't upload your property images. Your property information has been saved, so you won't need to fill out the form again. Please check your internet connection and try again.",
      } satisfies PropertyCreationError;
    }

    // Cloudinary/upload errors
    throw {
      success: false,
      code: "CLOUDINARY_ERROR",
      title: "Property not created",
      message:
        "We couldn't finish uploading your property images. Your property information is safe. Please try uploading the images again.",
    } satisfies PropertyCreationError;
  }
};

export const uploadProfileImage = async (
  uri: string,
  uid: string,
): Promise<string> => {
  const data = new FormData();

  data.append("file", {
    uri,
    type: "image/jpeg",
    name: `profile_${uid}.jpg`,
  } as any);

  data.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset); // from Cloudinary
  data.append("folder", "profile_images");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
    {
      method: "POST",
      body: data,
    },
  );

  const result = await res.json();

  if (!result.secure_url) {
    throw new Error("Image upload failed");
  }

  return result.secure_url;
};

export const optimizeImageForUpload = async (uri: string, isCover = false) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: isCover ? 1200 : 900 } }], // cover slightly higher res
    {
      compress: isCover ? 0.75 : 0.65, // additional images can be more compressed
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
  return result.uri;
};

export interface PropertyCreationError {
  success: false;
  code: PropertyCreationErrorCode;
  title: string;
  message: string;
}
const PROPERTY_DRAFT_KEY = "propertyCreationDraft";

export interface PropertyDraft {
  details: any;
  photos: any[];
  coverId: string | null;
}

export const savePropertyDraft = async (draft: PropertyDraft) => {
  try {
    await AsyncStorage.setItem(PROPERTY_DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error("Failed to save property draft:", error);
  }
};

export const getPropertyDraft = async (): Promise<PropertyDraft | null> => {
  try {
    // await AsyncStorage.clear()
    const draft = await AsyncStorage.getItem(PROPERTY_DRAFT_KEY);

    if (!draft) return null;

    return JSON.parse(draft);
  } catch (error) {
    console.error("Failed to load property draft:", error);
    return null;
  }
};

export const clearPropertyDraft = async () => {
  try {
    await AsyncStorage.removeItem(PROPERTY_DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear property draft:", error);
  }
};
