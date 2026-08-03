import { describe, expect, it } from "vitest";
import {
  extractYouTubeVideoId,
  getMusicLibraryTrack,
  musicLibrary,
  youtubeWatchUrl,
} from "./music-library";

describe("music library", () => {
  it("contains licensed standard tracks", () => {
    expect(musicLibrary.length).toBeGreaterThanOrEqual(3);
    expect(getMusicLibraryTrack("there-is-romance")?.licenseName).toBe("CC BY 4.0");
  });

  it("accepts supported YouTube URL formats", () => {
    expect(extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
    expect(extractYouTubeVideoId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("rejects unrelated URLs and only builds valid watch URLs", () => {
    expect(extractYouTubeVideoId("https://example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(youtubeWatchUrl("invalid")).toBeNull();
    expect(youtubeWatchUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });
});
