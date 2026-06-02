/**
 * Cliente HTTP central do Negócio Express.
 *
 * - Base URL via NEXT_PUBLIC_API_URL (sem prefixo /api — ver openapi.json).
 * - Injeta Authorization: Bearer <token> quando há sessão.
 * - Padroniza erro: sempre lança ApiError (status + mensagens).
 *
 * Tipos vêm SEMPRE de ./api-types (gerado do openapi.json). Nunca redefina DTO.
 */
import type { components } from "@/lib/api-types";

type Schemas = components["schemas"];

/** Envelope de erro padronizado da API (.NET): { errorMessages: string[] }. */
export type ResponseError = Schemas["ResponseError"];

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/** Provedor de token injetável (definido pelo AuthProvider). */
let tokenProvider: () => string | null = () => null;

export function setTokenProvider(provider: () => string | null) {
  tokenProvider = provider;
}

/** Erro tipado de API — carrega o status HTTP e as mensagens da API. */
export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? `Erro ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.messages = messages;
  }

  /** true quando o problema é de autenticação/sessão (401/403). */
  get isAuth() {
    return this.status === 401 || this.status === 403;
  }
}

type RequestOptions = {
  /** Sobrescreve/omitir o token (ex.: chamadas públicas da vitrine). */
  auth?: boolean;
  signal?: AbortSignal;
  /** Querystring (valores undefined/null são ignorados). */
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseError(res: Response): Promise<ApiError> {
  let messages: string[] = [];
  try {
    const data = (await res.json()) as ResponseError;
    if (Array.isArray(data?.errorMessages) && data.errorMessages.length) {
      messages = data.errorMessages;
    }
  } catch {
    /* corpo vazio ou não-JSON */
  }
  if (!messages.length) {
    messages = [res.status === 401 ? "Sessão expirada. Faça login novamente." : `Erro ${res.status}.`];
  }
  return new ApiError(res.status, messages);
}

async function request<TResponse>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { auth = true, signal, query } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = tokenProvider();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    cache: "no-store",
  });

  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as TResponse;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as TResponse;
}

/** Métodos HTTP tipados. O <T> deve vir sempre de api-types (Response*). */
export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
