/**
 * Before all the tests are even started, we ensure the test database is up to date,
 * and as an extra measure, make sure we're using the test env variables.
 */

import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "@recipiece/database";
import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default async () => {
  // clean out the database
  try {
    execSync("dotenvx run -f .env.test -- yarn  --cwd ../recipiece_common/recipiece_database run prisma migrate deploy");
    await prisma.user.deleteMany();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  // clean out the mock s3
  try {
    const s3 = new S3Client({
      endpoint: process.env.APP_S3_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.APP_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_S3_SECRET_KEY!,
      },
    });

    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: process.env.APP_S3_BUCKET,
    });

    const listObjectsResponse = await s3.send(listObjectsCommand);
    const keys = (listObjectsResponse.Contents ?? []).map((obj) => {
      return obj.Key;
    });

    if (keys.length > 0) {
      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: process.env.APP_S3_BUCKET,
        Delete: {
          Objects: keys.map((k) => {
            return { Key: k };
          }),
        },
      });
      await s3.send(deleteObjectsCommand);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
