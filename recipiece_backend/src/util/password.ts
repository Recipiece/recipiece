import argon2 from "argon2";

export const hashPassword = async (
  plainPassword: string
): Promise<string | undefined> => {
  try {
    const hash = await argon2.hash(plainPassword, {
      type: argon2.argon2id, // Argon2id variant is the most secure
      memoryCost: 2 ** 16, // Memory cost parameter (e.g., 64 MB)
      timeCost: 5, // Time cost (e.g., 5 iterations)
      parallelism: 1, // Parallelism factor (e.g., single-threaded)
    });
    return hash;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    // Verifies if the provided password matches the hashed one
    return await argon2.verify(hashedPassword, plainPassword);
  } catch (err) {
    console.error(err);
    return false;
  }
};
