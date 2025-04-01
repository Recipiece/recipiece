import { Environment } from "../../util/environment";

export const getImageUrl = (imageKey: string): string => {
  if (Environment.S3_CDN_ENDPOINT) {
    return `${Environment.S3_CDN_ENDPOINT}/${imageKey}`;
  } else {
    return `${Environment.S3_ENDPOINT}/${Environment.S3_BUCKET}/${imageKey}`;
  }
};
