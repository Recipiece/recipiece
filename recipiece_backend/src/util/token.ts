import jwt from "jsonwebtoken";
import { Environment } from "./environment";

export const generateToken = (payload: object, expiresIn: string | number = "1h"): string => {
  return jwt.sign(payload, Environment.SECRET, {
    expiresIn: expiresIn,
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, Environment.SECRET);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
