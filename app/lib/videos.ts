/**
 * Stand-in footage used by every video slot until real brand film is shot.
 *
 * Source: https://www.pexels.com/download/video/6446127/ — that endpoint 302s
 * to the CDN file below, so it is referenced directly to avoid a redirect on
 * every request. Pexels licence: free for commercial use, no attribution
 * required. Swap this one constant to change all video sections at once.
 */
export const PLACEHOLDER_VIDEO_URL =
  "https://videos.pexels.com/video-files/6446127/6446127-hd_1920_1080_25fps.mp4";
