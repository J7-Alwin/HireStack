import bcrypt from "bcrypt";
import { env } from "../../config";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = env.BCRYPT_SALT_ROUNDS;
  return bcrypt.hash(password, saltRounds);
}
