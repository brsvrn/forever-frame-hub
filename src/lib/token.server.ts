function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join("");
}

export async function hashOpaqueToken(token: string) {
  return bytesToHex(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))),
  );
}

export function createOpaqueToken() {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

