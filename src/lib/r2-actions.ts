import { createServerFn } from "@tanstack/react-start";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Cloudflare R2 client config
const getS3Client = () => {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
    },
  });
};

/**
 * Generates a presigned URL for direct client-to-R2 uploads.
 * This runs securely on the server/edge.
 */
export const getR2PresignedUrl = createServerFn({ method: "POST" })
  .validator((data: { bucket: string; fileName: string; contentType: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!process.env.CLOUDFLARE_ACCOUNT_ID) throw new Error("CLOUDFLARE_ACCOUNT_ID eksik");
      if (!process.env.CLOUDFLARE_ACCESS_KEY_ID) throw new Error("CLOUDFLARE_ACCESS_KEY_ID eksik");
      if (!process.env.CLOUDFLARE_SECRET_ACCESS_KEY) throw new Error("CLOUDFLARE_SECRET_ACCESS_KEY eksik");

      const client = getS3Client();
      const command = new PutObjectCommand({
        Bucket: data.bucket,
        Key: data.fileName,
        ContentType: data.contentType,
      });

      // URL is valid for 15 minutes
      const url = await getSignedUrl(client, command, { expiresIn: 900 });

      return { url, error: null };
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      return { url: null, error: error instanceof Error ? error.message : "Yükleme linki oluşturulamadı" };
    }
  });

import { GetObjectCommand } from "@aws-sdk/client-s3";

/**
 * Generates a presigned GET URL for forcing file downloads.
 */
export const getR2DownloadUrl = createServerFn({ method: "POST" })
  .validator((data: { bucket: string; fileName: string; originalName?: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!process.env.CLOUDFLARE_ACCOUNT_ID) throw new Error("CLOUDFLARE_ACCOUNT_ID eksik");
      if (!process.env.CLOUDFLARE_ACCESS_KEY_ID) throw new Error("CLOUDFLARE_ACCESS_KEY_ID eksik");
      if (!process.env.CLOUDFLARE_SECRET_ACCESS_KEY) throw new Error("CLOUDFLARE_SECRET_ACCESS_KEY eksik");

      const client = getS3Client();
      const filename = data.originalName ? encodeURIComponent(data.originalName) : "download";
      
      const command = new GetObjectCommand({
        Bucket: data.bucket,
        Key: data.fileName,
        ResponseContentDisposition: `attachment; filename="${filename}"`,
      });

      // URL is valid for 15 minutes
      const url = await getSignedUrl(client, command, { expiresIn: 900 });

      return { url, error: null };
    } catch (error) {
      console.error("Error generating download URL:", error);
      return { url: null, error: error instanceof Error ? error.message : "İndirme linki oluşturulamadı" };
    }
  });
