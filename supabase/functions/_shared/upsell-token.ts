// HMAC-SHA256 signed token for the 60-second post-purchase upsell offer.
// Header: { alg: "HS256", typ: "JWT" }
// Payload: { offerId, orderId, productId, variantId?, unitAmountCents, exp }
import { encodeBase64Url, decodeBase64Url } from "https://deno.land/std@0.224.0/encoding/base64url.ts";

const TE = new TextEncoder();
const TD = new TextDecoder();

export interface UpsellTokenPayload {
  offerId: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  unitAmountCents: number;
  exp: number; // seconds since epoch
}

function getSecret(): string {
  const s = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!s) throw new Error("Missing service role key for token signing");
  return s;
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    TE.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, TE.encode(data));
  return new Uint8Array(sig);
}

export async function signUpsellToken(payload: UpsellTokenPayload): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = encodeBase64Url(TE.encode(JSON.stringify(header)));
  const payloadB64 = encodeBase64Url(TE.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const sig = await hmac(getSecret(), signingInput);
  return `${signingInput}.${encodeBase64Url(sig)}`;
}

export async function verifyUpsellToken(token: string): Promise<UpsellTokenPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");
  const [headerB64, payloadB64, sigB64] = parts;
  const expectedSig = await hmac(getSecret(), `${headerB64}.${payloadB64}`);
  const givenSig = decodeBase64Url(sigB64);
  if (expectedSig.length !== givenSig.length) throw new Error("Invalid signature");
  let diff = 0;
  for (let i = 0; i < expectedSig.length; i++) diff |= expectedSig[i] ^ givenSig[i];
  if (diff !== 0) throw new Error("Invalid signature");
  const payload = JSON.parse(TD.decode(decodeBase64Url(payloadB64))) as UpsellTokenPayload;
  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
    throw new Error("Token expired");
  }
  return payload;
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", TE.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
