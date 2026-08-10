import { describe, expect, it, vi } from "vitest";
import { publishInstagramContent } from "./instagram-publisher";
import type { SocialContentItem } from "./social-content";

function item(overrides: Partial<SocialContentItem> = {}): SocialContentItem {
  return {
    id: "3d6f0a63-e002-40e3-a8d2-9d85e4e76813",
    content_key: "test-content",
    platform: "instagram",
    account_handle: "memoryweddingtr",
    content_type: "image",
    status: "approved",
    title: "Test",
    caption: "MemoryWedding test açıklaması",
    media_urls: ["https://www.memory-wedding.com/logo.jpg"],
    thumbnail_url: null,
    publish_at: "2026-08-11T17:30:00.000Z",
    notes: null,
    approved_by: null,
    approved_at: null,
    published_at: null,
    platform_media_id: null,
    last_error: null,
    attempt_count: 0,
    created_at: "2026-08-10T12:00:00.000Z",
    updated_at: "2026-08-10T12:00:00.000Z",
    ...overrides,
  };
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const config = {
  accessToken: "secret-token",
  apiVersion: "v-test",
  igUserId: "123456",
};

describe("publishInstagramContent", () => {
  it("creates and publishes an image container", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response({ id: "container-1" }))
      .mockResolvedValueOnce(response({ id: "media-1" }));

    const result = await publishInstagramContent(item(), { ...config, fetchFn });

    expect(result).toEqual({ creationId: "container-1", mediaId: "media-1" });
    expect(fetchFn).toHaveBeenCalledTimes(2);
    const [createUrl, createInit] = fetchFn.mock.calls[0];
    expect(String(createUrl)).toContain("/v-test/123456/media");
    expect(String(createInit?.body)).toContain("image_url=");
    expect(new Headers(createInit?.headers).get("authorization")).toBe("Bearer secret-token");
  });

  it("waits for a reel before publishing it", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response({ id: "container-reel" }))
      .mockResolvedValueOnce(response({ status_code: "IN_PROGRESS" }))
      .mockResolvedValueOnce(response({ status_code: "FINISHED" }))
      .mockResolvedValueOnce(response({ id: "media-reel" }));
    const sleep = vi.fn().mockResolvedValue(undefined);

    const result = await publishInstagramContent(
      item({
        content_type: "reel",
        media_urls: ["https://www.memory-wedding.com/videos/turquoise-cove.mp4"],
      }),
      { ...config, fetchFn, sleep },
    );

    expect(result.mediaId).toBe("media-reel");
    expect(sleep).toHaveBeenCalledOnce();
    const createBody = String(fetchFn.mock.calls[0][1]?.body);
    expect(createBody).toContain("media_type=REELS");
    expect(createBody).toContain("share_to_feed=true");
  });

  it("surfaces Graph API failures without leaking the token", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response({ error: { message: "Permission denied", code: 10 } }, 400));

    const error = await publishInstagramContent(item(), { ...config, fetchFn }).catch(
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("Permission denied (10)");
    expect((error as Error).message).not.toContain("secret-token");
  });
});
