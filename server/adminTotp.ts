import crypto from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function createTotpSecret(): string {
  const bytes = crypto.randomBytes(20);
  let bits = 0, value = 0, result = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += alphabet[(value >>> bits) & 31];
    }
  }
  if (bits) result += alphabet[(value << (5 - bits)) & 31];
  return result;
}

export function totpCode(secret: string, step: number): string {
  if (!/^[A-Z2-7]{32}$/.test(secret)) throw Error("Invalid authenticator setup.");
  let bits = 0, value = 0;
  const bytes: number[] = [];
  for (const letter of secret) {
    value = (value << 5) | alphabet.indexOf(letter);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 255);
    }
  }
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const mac = crypto.createHmac("sha1", Buffer.from(bytes)).update(counter).digest();
  const index = mac[19] & 15;
  const number = (mac.readUInt32BE(index) & 0x7fffffff) % 1_000_000;
  return String(number).padStart(6, "0");
}

export function checkTotpCode(secret: string, submitted: string, usedStep = -1, now = Date.now()): number | null {
  if (!/^\\d{6}$/.test(submitted)) return null;
  const step = Math.floor(now / 30000);
  for (const candidate of [step - 1, step, step + 1]) {
    if (candidate <= usedStep || candidate < 0) continue;
    const expected = Buffer.from(totpCode(secret, candidate));
    if (crypto.timingSafeEqual(expected, Buffer.from(submitted))) return candidate;
  }
  return null;
}

export function authenticatorUri(secret: string, email: string): string {
  return "otpauth://totp/" + encodeURIComponent("V79 Digital:" + email) +
    "?secret=" + encodeURIComponent(secret) +
    "&issuer=" + encodeURIComponent("V79 Digital") + "&algorithm=SHA1&digits=6&period=30";
}

export function createRecoveryCodes(): string[] {
  return Array.from({ length: 10 }, () => crypto.randomBytes(12).toString("hex").toUpperCase());
}
export function recoveryCodeDigest(code: string): string {
  return crypto.createHash("sha256").update(code.toUpperCase()).digest("hex");
}
