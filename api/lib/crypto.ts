import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function getKey(): Buffer {
  const secret = process.env.APP_SECRET || process.env.ENCRYPTION_KEY || "creditrepair-pro-default-key-32-chars!";
  return scryptSync(secret, "creditrepair-pro-salt", 32);
}

export function encrypt(text: string): string {
  if (!text) return text;
  const iv = randomBytes(IV_LENGTH);
  const saltBytes = randomBytes(SALT_LENGTH);
  const key = getKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const result = Buffer.concat([saltBytes, iv, authTag, encrypted]);
  return result.toString("base64");
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  try {
    const data = Buffer.from(encryptedData, "base64");
    if (data.length < SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH + 1) return encryptedData;
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const key = getKey();
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return encryptedData;
  }
}

export function hashId(input: string): string {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", getKey()).update(input).digest("hex").substring(0, 16);
}
