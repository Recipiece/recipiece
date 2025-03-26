import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: process.env.APP_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.APP_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_S3_SECRET_KEY!,
  },
});
