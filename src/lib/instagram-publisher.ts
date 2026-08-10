import type { SocialContentItem } from "./social-content";

export type InstagramPublisherConfig = {
  accessToken: string;
  apiVersion: string;
  igUserId: string;
  fetchFn?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
};

type GraphResponse = {
  id?: string;
  status_code?: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
  status?: string;
  error?: { message?: string; code?: number; error_subcode?: number };
};

function mediaIsVideo(url: string) {
  return /\.(mp4|mov)(?:$|[?#])/i.test(url);
}

function graphError(payload: GraphResponse, status: number) {
  const message = payload.error?.message || payload.status || `Meta Graph API ${status}`;
  const code = payload.error?.code ? ` (${payload.error.code})` : "";
  return new Error(`${message}${code}`);
}

function createGraphClient(config: InstagramPublisherConfig) {
  const fetchFn = config.fetchFn ?? fetch;
  const baseUrl = `https://graph.facebook.com/${config.apiVersion}`;

  async function request(path: string, init?: RequestInit, query?: Record<string, string>) {
    const url = new URL(`${baseUrl}/${path.replace(/^\//, "")}`);
    for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);

    const response = await fetchFn(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        ...(init?.headers ?? {}),
      },
      signal: init?.signal ?? AbortSignal.timeout(20_000),
    });
    const payload = (await response.json().catch(() => ({}))) as GraphResponse;
    if (!response.ok || payload.error) throw graphError(payload, response.status);
    return payload;
  }

  return {
    get: (path: string, query?: Record<string, string>) => request(path, undefined, query),
    post: (path: string, values: Record<string, string>) =>
      request(path, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(values),
      }),
  };
}

async function waitUntilReady(
  containerId: string,
  config: InstagramPublisherConfig,
  graph: ReturnType<typeof createGraphClient>,
) {
  const sleep =
    config.sleep ?? ((milliseconds: number) => new Promise((r) => setTimeout(r, milliseconds)));

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const status = await graph.get(containerId, { fields: "status_code,status" });
    if (status.status_code === "FINISHED" || status.status_code === "PUBLISHED") return;
    if (status.status_code === "ERROR" || status.status_code === "EXPIRED") {
      throw new Error(status.status || `Instagram medyası hazırlanamadı: ${status.status_code}`);
    }
    await sleep(2_000);
  }

  throw new Error("Instagram medyası zamanında hazırlanamadı; daha sonra yeniden deneyin.");
}

async function createSingleContainer(
  url: string,
  item: SocialContentItem,
  config: InstagramPublisherConfig,
  graph: ReturnType<typeof createGraphClient>,
  carouselItem = false,
) {
  const isVideo = mediaIsVideo(url) || item.content_type === "reel";
  const values: Record<string, string> = carouselItem
    ? {
        is_carousel_item: "true",
        ...(isVideo ? { media_type: "VIDEO", video_url: url } : { image_url: url }),
      }
    : item.content_type === "reel"
      ? {
          media_type: "REELS",
          video_url: url,
          caption: item.caption,
          share_to_feed: "true",
        }
      : { image_url: url, caption: item.caption };

  const created = await graph.post(`${config.igUserId}/media`, values);
  if (!created.id) throw new Error("Meta API medya kapsayıcı kimliği döndürmedi.");
  if (isVideo) await waitUntilReady(created.id, config, graph);
  return created.id;
}

export async function publishInstagramContent(
  item: SocialContentItem,
  config: InstagramPublisherConfig,
) {
  if (!config.accessToken || !config.apiVersion || !config.igUserId) {
    throw new Error("Instagram yayınlama yapılandırması eksik.");
  }
  const graph = createGraphClient(config);

  let creationId: string;
  if (item.content_type === "carousel") {
    const childIds: string[] = [];
    for (const mediaUrl of item.media_urls) {
      childIds.push(await createSingleContainer(mediaUrl, item, config, graph, true));
    }
    const parent = await graph.post(`${config.igUserId}/media`, {
      media_type: "CAROUSEL",
      caption: item.caption,
      children: childIds.join(","),
    });
    if (!parent.id) throw new Error("Meta API carousel kapsayıcı kimliği döndürmedi.");
    creationId = parent.id;
  } else {
    creationId = await createSingleContainer(item.media_urls[0], item, config, graph);
  }

  const published = await graph.post(`${config.igUserId}/media_publish`, {
    creation_id: creationId,
  });
  if (!published.id) throw new Error("Meta API yayın kimliği döndürmedi.");
  return { mediaId: published.id, creationId };
}
