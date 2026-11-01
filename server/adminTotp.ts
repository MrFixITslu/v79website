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
