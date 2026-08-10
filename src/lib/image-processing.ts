export const MAX_SOURCE_IMAGE_BYTES = 20 * 1024 * 1024;
export const ALLOWED_SOURCE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type CoverCrop = {
  focalX: number;
  focalY: number;
  zoom: number;
};

export type CropRect = {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
};

export function validateSourceImage(file: Pick<File, "size" | "type">) {
  if (!ALLOWED_SOURCE_IMAGE_TYPES.has(file.type)) {
    return "Yalnızca JPG, PNG veya WebP fotoğrafları yükleyebilirsiniz.";
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    return "Fotoğraf 20 MB sınırını aşıyor.";
  }
  return null;
}

export function calculateCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  crop: CoverCrop,
  outputWidth = 1600,
  outputHeight = 1000,
): CropRect {
  const zoom = Math.min(2.5, Math.max(1, crop.zoom));
  const coverScale = Math.max(outputWidth / sourceWidth, outputHeight / sourceHeight) * zoom;
  const sourceCropWidth = Math.min(sourceWidth, outputWidth / coverScale);
  const sourceCropHeight = Math.min(sourceHeight, outputHeight / coverScale);
  const focalX = (Math.min(100, Math.max(0, crop.focalX)) / 100) * sourceWidth;
  const focalY = (Math.min(100, Math.max(0, crop.focalY)) / 100) * sourceHeight;

  return {
    sourceX: Math.min(sourceWidth - sourceCropWidth, Math.max(0, focalX - sourceCropWidth / 2)),
    sourceY: Math.min(sourceHeight - sourceCropHeight, Math.max(0, focalY - sourceCropHeight / 2)),
    sourceWidth: sourceCropWidth,
    sourceHeight: sourceCropHeight,
  };
}

export function calculateContainedSize(width: number, height: number, maxEdge = 1800) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

type LoadedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
};

async function loadImage(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      dispose: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = objectUrl;
  await image.decode();
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    dispose: () => URL.revokeObjectURL(objectUrl),
  };
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Fotoğraf optimize edilemedi."))),
      "image/webp",
      quality,
    );
  });
}

export async function optimizeCoverImage(file: File, crop: CoverCrop) {
  const loaded = await loadImage(file);
  try {
    const width = 1600;
    const height = 1000;
    const rect = calculateCoverCrop(loaded.width, loaded.height, crop, width, height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Fotoğraf düzenleyici başlatılamadı.");
    context.drawImage(
      loaded.source,
      rect.sourceX,
      rect.sourceY,
      rect.sourceWidth,
      rect.sourceHeight,
      0,
      0,
      width,
      height,
    );
    return { blob: await canvasToWebp(canvas, 0.84), width, height };
  } finally {
    loaded.dispose();
  }
}

export async function optimizeGalleryImage(file: File) {
  const loaded = await loadImage(file);
  try {
    const dimensions = calculateContainedSize(loaded.width, loaded.height);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Fotoğraf düzenleyici başlatılamadı.");
    context.drawImage(loaded.source, 0, 0, dimensions.width, dimensions.height);
    return { blob: await canvasToWebp(canvas, 0.82), ...dimensions };
  } finally {
    loaded.dispose();
  }
}
