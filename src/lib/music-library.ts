export type MusicLibraryTrack = {
  id: string;
  title: string;
  artist: string;
  mood: string;
  streamUrl: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  attribution: string;
};

const ccBy4 = "https://creativecommons.org/licenses/by/4.0/";

export const musicLibrary: MusicLibraryTrack[] = [
  {
    id: "there-is-romance",
    title: "There is Romance",
    artist: "Kevin MacLeod",
    mood: "Romantik piyano",
    streamUrl:
      "https://incompetech.com/music/royalty-free/mp3-royaltyfree/There%20is%20Romance.mp3",
    sourceUrl:
      "https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1100044",
    licenseName: "CC BY 4.0",
    licenseUrl: ccBy4,
    attribution: '"There is Romance" — Kevin MacLeod · CC BY 4.0',
  },
  {
    id: "two-together",
    title: "Two Together",
    artist: "Kevin MacLeod",
    mood: "Sıcak ve zarif",
    streamUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Two%20Together.mp3",
    sourceUrl:
      "https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1100031",
    licenseName: "CC BY 4.0",
    licenseUrl: ccBy4,
    attribution: '"Two Together" — Kevin MacLeod · CC BY 4.0',
  },
  {
    id: "water-lily",
    title: "Water Lily",
    artist: "Kevin MacLeod",
    mood: "Sade ve huzurlu",
    streamUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Water%20Lily.mp3",
    sourceUrl:
      "https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1400035",
    licenseName: "CC BY 4.0",
    licenseUrl: ccBy4,
    attribution: '"Water Lily" — Kevin MacLeod · CC BY 4.0',
  },
];

export function getMusicLibraryTrack(trackId?: string | null) {
  return musicLibrary.find((track) => track.id === trackId) ?? null;
}

export function extractYouTubeVideoId(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.replace(/^www\./, "");
    let candidate: string | null = null;

    if (hostname === "youtu.be") candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "music.youtube.com") {
      candidate =
        url.searchParams.get("v") ||
        url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1] ||
        null;
    }

    return candidate && /^[\w-]{11}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function youtubeWatchUrl(videoId?: string | null) {
  return videoId && /^[\w-]{11}$/.test(videoId)
    ? `https://www.youtube.com/watch?v=${videoId}`
    : null;
}
