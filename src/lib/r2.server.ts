import { S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

export function getR2Client() {
  if (client) return client;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Depolama yapılandırması eksik.");
  }
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

export function getR2Bucket() {
  return process.env.CLOUDFLARE_R2_UPLOAD_BUCKET || "memorywedding-uploads";
}
