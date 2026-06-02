/**
 * Decodificação (não-validação) do JWT para ler claims no front.
 * A validação real é responsabilidade da API; aqui só lemos role/store_id
 * para roteamento e UI. Nunca confie nisto para autorização sensível.
 */
export type Role = "Owner" | "Lojista" | "Customer" | string;

export type AuthClaims = {
  role: Role | null;
  storeId: string | null;
  email: string | null;
  sub: string | null;
  /** expiração (epoch segundos), se presente no token. */
  exp: number | null;
};

/** Chaves comuns de role usadas por APIs .NET (claim curta ou URI longa). */
const ROLE_KEYS = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];
const STORE_KEYS = ["store_id", "storeId", "store"];
const EMAIL_KEYS = [
  "email",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
];

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const base64 = padded + "=".repeat((4 - (padded.length % 4)) % 4);
  if (typeof atob === "function") return decodeURIComponent(escape(atob(base64)));
  return Buffer.from(base64, "base64").toString("utf-8");
}

function pick(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value) && value.length) return String(value[0]);
    if (typeof value === "string" && value) return value;
  }
  return null;
}

export function decodeToken(token: string): AuthClaims | null {
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;
    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as Record<string, unknown>;
    return {
      role: pick(payload, ROLE_KEYS),
      storeId: pick(payload, STORE_KEYS),
      email: pick(payload, EMAIL_KEYS) ?? pick(payload, ["sub"]),
      sub: pick(payload, ["sub", "nameid"]),
      exp: typeof payload.exp === "number" ? payload.exp : null,
    };
  } catch {
    return null;
  }
}

export function isExpired(claims: AuthClaims | null): boolean {
  if (!claims?.exp) return false;
  return claims.exp * 1000 <= Date.now();
}
