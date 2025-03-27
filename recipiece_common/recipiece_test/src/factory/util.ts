import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as ImageGenerator from "js-image-generator";

export const s3 = new S3Client({
  endpoint: process.env.APP_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.APP_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_S3_SECRET_KEY!,
  },
});

export const createAndUploadFakeImage = async (key: string, options?: {width?: number, height?: number, quality?: number}) => {
  const width = options?.width ?? 600;
  const height = options?.height ?? 400;
  const quality = options?.quality ?? 80;

  const imagePromise = new Promise((resolve, reject) => {
    ImageGenerator.generateImage(width, height, quality, (err, imgBuffer) => {
      if(err) {
        reject(err);
      } else {
        resolve(imgBuffer.data);
      }
    })
  });

  const imageBuffer = await imagePromise;

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.APP_S3_BUCKET,
    Key: key,
    Body: imageBuffer as Buffer,
  });
  await s3.send(putObjectCommand);
}