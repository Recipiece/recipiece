import jwt from "jsonwebtoken";

export const generateToken = (
  payload: object,
  expiresIn: string | number = "1h"
): string => {
  return jwt.sign(payload, process.env.APP_SECRET!, {
    expiresIn: expiresIn,
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.APP_SECRET!);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
