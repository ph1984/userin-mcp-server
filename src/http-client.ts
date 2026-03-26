import { config } from "./config.js";
import { session } from "./session.js";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(base: string, path: string, query?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, base);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request(baseUrl: string, path: string, options: RequestOptions = {}): Promise<unknown> {
  const { method = "GET", body, headers = {}, query } = options;
  const url = buildUrl(baseUrl, path, query);

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  const text = await response.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    const msg = typeof data === "object" && data !== null && "message" in data
      ? (data as { message: string }).message
      : typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data).slice(0, 300);
    throw new Error(`HTTP ${response.status} ${method} ${path}: ${msg}`);
  }

  return data;
}

function withPlatformAuth(headers: Record<string, string> = {}): Record<string, string> {
  const jwt = session.jwt;
  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }
  headers["x-api-secret"] = config.auth.apiSecret;
  return headers;
}

function withInternalAuth(headers: Record<string, string> = {}): Record<string, string> {
  headers["x-internal-secret"] = config.auth.internalSecret;
  return headers;
}

function withIngestionAuth(headers: Record<string, string> = {}): Record<string, string> {
  if (config.auth.ingestionApiKey) {
    headers["Authorization"] = `Bearer ${config.auth.ingestionApiKey}`;
  }
  return headers;
}

// Segment Engine — sem auth (servico interno)
export const segments = {
  get: (path: string, query?: Record<string, string | number | boolean | undefined>) =>
    request(config.services.segments, path, { query }),
  post: (path: string, body?: unknown) =>
    request(config.services.segments, path, { method: "POST", body }),
  put: (path: string, body?: unknown) =>
    request(config.services.segments, path, { method: "PUT", body }),
  delete: (path: string) =>
    request(config.services.segments, path, { method: "DELETE" }),
};

// Platform Backend — JWT + API Secret
export const platform = {
  get: (path: string, query?: Record<string, string | number | boolean | undefined>) =>
    request(config.services.platform, path, { headers: withPlatformAuth(), query }),
  post: (path: string, body?: unknown) =>
    request(config.services.platform, path, { method: "POST", body, headers: withPlatformAuth() }),
  put: (path: string, body?: unknown) =>
    request(config.services.platform, path, { method: "PUT", body, headers: withPlatformAuth() }),
  delete: (path: string) =>
    request(config.services.platform, path, { method: "DELETE", headers: withPlatformAuth() }),
};

// AI Journey Service — sem auth especial
export const aiJourney = {
  get: (path: string, query?: Record<string, string | number | boolean | undefined>) =>
    request(config.services.aiJourney, path, { query }),
  post: (path: string, body?: unknown) =>
    request(config.services.aiJourney, path, { method: "POST", body }),
};

// Integrations — Internal Secret
export const integrations = {
  get: (path: string, query?: Record<string, string | number | boolean | undefined>) =>
    request(config.services.integrations, path, { headers: withInternalAuth(), query }),
  post: (path: string, body?: unknown) =>
    request(config.services.integrations, path, { method: "POST", body, headers: withInternalAuth() }),
  put: (path: string, body?: unknown) =>
    request(config.services.integrations, path, { method: "PUT", body, headers: withInternalAuth() }),
  delete: (path: string) =>
    request(config.services.integrations, path, { method: "DELETE", headers: withInternalAuth() }),
};

// Ingestion Service — API Key
export const ingestion = {
  get: (path: string, query?: Record<string, string | number | boolean | undefined>) =>
    request(config.services.ingestion, path, { headers: withIngestionAuth(), query }),
  post: (path: string, body?: unknown) =>
    request(config.services.ingestion, path, { method: "POST", body, headers: withIngestionAuth() }),
};

// CreateFlow — JWT (mesmo secret da platform)
export const createflow = {
  get: (path: string, query?: Record<string, string | number | boolean | undefined>) =>
    request(config.services.createflow, path, { headers: withPlatformAuth(), query }),
  post: (path: string, body?: unknown) =>
    request(config.services.createflow, path, { method: "POST", body, headers: withPlatformAuth() }),
  put: (path: string, body?: unknown) =>
    request(config.services.createflow, path, { method: "PUT", body, headers: withPlatformAuth() }),
  delete: (path: string) =>
    request(config.services.createflow, path, { method: "DELETE", headers: withPlatformAuth() }),
};

// FlowImager — JWT (mesmo secret da platform)
export const flowimager = {
  get: (path: string, query?: Record<string, string | number | boolean | undefined>) =>
    request(config.services.flowimager, path, { headers: withPlatformAuth(), query }),
  post: (path: string, body?: unknown) =>
    request(config.services.flowimager, path, { method: "POST", body, headers: withPlatformAuth() }),
  delete: (path: string) =>
    request(config.services.flowimager, path, { method: "DELETE", headers: withPlatformAuth() }),
};
