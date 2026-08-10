import { afterEach, describe, expect, it, vi } from "vitest";
import { loadImageSource } from "./image-processing";

const sourceFile = { size: 1024, type: "image/jpeg" } as File;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("image decoding", () => {
  it("falls back to an image element when bitmap decoding fails", async () => {
    const createImageBitmapMock = vi.fn().mockRejectedValue(new Error("decode failed"));
    const revokeObjectUrl = vi.fn();

    class LoadableImage {
      decoding = "auto";
      naturalWidth = 1200;
      naturalHeight = 800;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }

    vi.stubGlobal("createImageBitmap", createImageBitmapMock);
    vi.stubGlobal("Image", LoadableImage);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn().mockReturnValue("blob:test-image"),
      revokeObjectURL: revokeObjectUrl,
    });

    const loaded = await loadImageSource(sourceFile);

    expect(createImageBitmapMock).toHaveBeenCalledTimes(2);
    expect(loaded.width).toBe(1200);
    expect(loaded.height).toBe(800);
    loaded.dispose();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:test-image");
  });

  it("returns an actionable message when every decoder fails", async () => {
    const revokeObjectUrl = vi.fn();

    class BrokenImage {
      decoding = "auto";
      naturalWidth = 0;
      naturalHeight = 0;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }

    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("decode failed")));
    vi.stubGlobal("Image", BrokenImage);
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn().mockReturnValue("blob:broken-image"),
      revokeObjectURL: revokeObjectUrl,
    });

    await expect(loadImageSource(sourceFile)).rejects.toThrow(
      "Fotoğraf bu cihazda okunamadı. Lütfen JPG, PNG veya WebP olarak yeniden kaydedip tekrar deneyin.",
    );
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:broken-image");
  });
});
