import { CLOUDINARY_CONFIG } from "../lib/config";
import type { PropertyCreationErrorCode } from "../utils/type";

export interface MediaItem {
  file: File;
  type: "photo" | "video";
}

export interface UploadedMedia {
  url: string;
  type: "photo" | "video";
  publicId: string;
  thumbnailUrl?: string;
}

export interface PropertyCreationError {
  success: false;
  code: PropertyCreationErrorCode;
  title: string;
  message: string;
}

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

  mediaItems.forEach((item, i) => {
    if (item.type !== "photo") return;

    if (item.file.size > MAX_IMAGE_SIZE_BYTES) {
      const actualSizeMB = (item.file.size / (1024 * 1024)).toFixed(1);

      throw {
        success: false,
        code: "IMAGE_TOO_LARGE",
        title: "Image upload failed",
        message: `Image ${i + 1} is ${actualSizeMB}MB. The maximum allowed image size is ${MAX_IMAGE_SIZE_MB}MB. Please replace it and try again.`,
      };
    }
  });
};

export const optimizeImageForUpload = (
  file: File,
  isCover = false,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const maxWidth = isCover ? 1200 : 900;
      const scale = Math.min(1, maxWidth / img.width);

      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);

          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }

          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        isCover ? 0.75 : 0.65,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image for compression"));
    };

    img.src = objectUrl;
  });
};

export const uploadSingleMedia = async (
  file: File,
  listingId: string,
  mediaType: "photo" | "video",
  index: number,
  onProgress?: (progress: number) => void,
): Promise<UploadedMedia> => {
  const formData = new FormData();
  formData.append("file", file);
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
        onProgress(event.loaded / event.total);
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
        fileProgresses.reduce((sum, p) => sum + p, 0) / total;
      onProgress?.(totalProgress, fileIndex);
    };

    const optimizedFiles = await Promise.all(
      mediaItems.map((item, i) =>
        item.type === "photo"
          ? optimizeImageForUpload(item.file, i === 0)
          : Promise.resolve(item.file),
      ),
    );

    const uploadedResults = await Promise.all(
      mediaItems.map((item, i) =>
        uploadSingleMedia(optimizedFiles[i], listingId, item.type, i, (p) =>
          updateTotalProgress(i, p),
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

      return { ...uploaded, url: optimizedUrl, thumbnailUrl };
    });
  } catch (error: any) {
    if (error?.code === "IMAGE_TOO_LARGE" || error?.code === "NO_MEDIA") {
      throw error;
    }

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
          "We couldn't upload your property images. Please check your internet connection and try again.",
      } satisfies PropertyCreationError;
    }

    throw {
      success: false,
      code: "CLOUDINARY_ERROR",
      title: "Property not created",
      message:
        "We couldn't finish uploading your property images. Please try again.",
    } satisfies PropertyCreationError;
  }
};

export const uploadProfileImage = async (
  file: File,
  uid: string,
): Promise<string> => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  data.append("public_id", `profile_images/${uid}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
    { method: "POST", body: data },
  );

  const result = await res.json();

  if (!result.secure_url) {
    throw new Error("Image upload failed");
  }

  return result.secure_url;
};

const PROPERTY_DRAFT_KEY = "propertyCreationDraft";

export interface PropertyDraft {
  details: any;
  photos: any[];
  coverId: string | null;
}

export const savePropertyDraft = (draft: PropertyDraft) => {
  try {
    localStorage.setItem(PROPERTY_DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error("Failed to save property draft:", error);
  }
};

export const getPropertyDraft = (): PropertyDraft | null => {
  try {
    const draft = localStorage.getItem(PROPERTY_DRAFT_KEY);
    if (!draft) return null;
    return JSON.parse(draft);
  } catch (error) {
    console.error("Failed to load property draft:", error);
    return null;
  }
};

export const clearPropertyDraft = () => {
  try {
    localStorage.removeItem(PROPERTY_DRAFT_KEY);
  } catch (error) {
    console.error("Failed to clear property draft:", error);
  }
};