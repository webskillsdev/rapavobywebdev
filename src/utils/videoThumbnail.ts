// Cover pictures for listings that have VIDEOS ONLY (no photos).
//
// Cloudinary can turn any stored video into a still picture just by changing
// the address: ask for ".jpg" instead of ".mp4" and add "so_auto", which lets
// Cloudinary pick a good frame. Nothing is uploaded. Because the address is
// always the same for the same video, Cloudinary makes the picture once and
// serves its saved copy after that.
//
// Listings with photos never use this. The video itself is not changed and
// still plays from its original address.

const CARD_SIZE = "w_600,h_400,c_fill";

// True for a Cloudinary video address (".../video/upload/...").
export function isCloudinaryVideo(url: unknown): url is string {
  return typeof url === "string" && url.includes("res.cloudinary.com") && url.includes("/video/upload/");
}

// ".../video/upload/q_auto,vc_auto/v123/listings/a/video_1.mp4"
//   -> ".../video/upload/so_auto,w_600,h_400,c_fill,q_auto,f_jpg/v123/listings/a/video_1.jpg"
// frame: "auto" lets Cloudinary choose; a number is that many seconds in.
export function videoThumbnailUrl(
  videoUrl: string,
  options: { frame?: "auto" | number; size?: string } = {},
): string | null {
  if (!isCloudinaryVideo(videoUrl)) return null;

  const frame = options.frame ?? "auto";
  const settings = `so_${frame},${options.size ?? CARD_SIZE},q_auto,f_jpg`;

  // Drop the video-only settings we store (like "q_auto,vc_auto") and put the
  // picture settings in their place. The version part ("v123/") stays.
  let url = /\/video\/upload\/(?:[^/]+\/)*?(v\d+\/)/.test(videoUrl)
    ? videoUrl.replace(/\/video\/upload\/(?:[^/]+\/)*?(v\d+\/)/, `/video/upload/${settings}/$1`)
    : videoUrl.replace(
        /\/video\/upload\/(?:(?:q|f|vc)_[^/]*\/)?/,
        `/video/upload/${settings}/`,
      );

  // Ask for a picture file instead of the video file.
  const [path, query] = url.split("?");
  const lastPart = path.slice(path.lastIndexOf("/") + 1);
  url = lastPart.includes(".") ? path.replace(/\.[a-z0-9]+$/i, ".jpg") : `${path}.jpg`;
  return query ? `${url}?${query}` : url;
}

// If an automatic video frame fails to load, try the frame 1 second in once.
// Returns null for every other picture.
export function backupVideoThumbnail(src: string): string | null {
  if (!isCloudinaryVideo(src) || !src.includes("so_auto")) return null;
  return src.replace("so_auto", "so_1");
}

// The card picture for a listing ONLY when it has no photos but has a video.
// Returns null in every other case, so the existing photo logic is used.
// size: Cloudinary size settings; leave out for the normal card size.
export function videoOnlyCover(media: any[] | null | undefined, size?: string): string | null {
  const items = Array.isArray(media) ? media.filter((m) => m?.media_url) : [];
  if (items.length === 0) return null;

  const isVideo = (m: any) => m.media_type === "video" || isCloudinaryVideo(m.media_url);
  if (items.some((m) => !isVideo(m))) return null; // has a photo: leave it alone

  const video = items.find((m) => m.is_cover) ?? items[0];
  return videoThumbnailUrl(video.media_url, { size });
}