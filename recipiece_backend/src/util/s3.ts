import { S3Client } from "@aws-sdk/client-s3";
import { Environment } from "./environment";

let credentials;

if (Environment.S3_ACCESS_KEY_ID && Environment.S3_SECRET_KEY) {
  credentials = {
    accessKeyId: Environment.S3_ACCESS_KEY_ID,
    secretAccessKey: Environment.S3_SECRET_KEY,
  };
} else {
  console.warn("no access key id or secret key for s3 set!");
  credentials = {
    accessKeyId: "",
    secretAccessKey: "",
  };
}

export const s3 = new S3Client({
  forcePathStyle: false,
  endpoint: Environment.S3_ENDPOINT,
  credentials: { ...credentials },
  region: Environment.S3_REGION,
});
