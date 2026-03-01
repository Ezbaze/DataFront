import { z } from "zod";

const DEFAULT_TIMEOUT_MS = 10_000;

export const REQUEST_ERROR_CODES = {
  noFetch: "NO_FETCH",
  timeout: "TIMEOUT",
  network: "NETWORK_ERROR",
  http: "HTTP_ERROR",
  invalidJson: "INVALID_JSON",
  schemaValidation: "SCHEMA_VALIDATION_ERROR",
} as const;

export type RequestErrorCode =
  (typeof REQUEST_ERROR_CODES)[keyof typeof REQUEST_ERROR_CODES];

export type RequestErrorContext = {
  url?: string;
  method?: string;
  status?: number;
};

export class RequestError extends Error {
  readonly code: RequestErrorCode;
  readonly context: RequestErrorContext;
  readonly cause: unknown;

  constructor(
    code: RequestErrorCode,
    message: string,
    context: RequestErrorContext = {},
    cause?: unknown,
  ) {
    super(message);
    this.name = "RequestError";
    this.code = code;
    this.context = context;
    this.cause = cause;
  }
}

export type RequestClientOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  defaultHeaders?: HeadersInit;
};

function mergeHeaders(
  defaultHeaders?: HeadersInit,
  requestHeaders?: HeadersInit,
): Headers | undefined {
  if (!defaultHeaders && !requestHeaders) {
    return undefined;
  }

  const merged = new Headers(defaultHeaders);
  new Headers(requestHeaders).forEach((value, key) => {
    merged.set(key, value);
  });
  return merged;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

type RequestJsonOptions = RequestInit & {
  schemaName?: string;
};

export class RequestClient {
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly defaultHeaders?: HeadersInit;

  constructor(options: RequestClientOptions = {}) {
    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    if (typeof fetchImpl !== "function") {
      throw new RequestError(
        REQUEST_ERROR_CODES.noFetch,
        "Fetch API is not available in this runtime",
      );
    }

    this.fetchImpl = fetchImpl;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.defaultHeaders = options.defaultHeaders;
  }

  async request(url: string, init: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const method = init.method ?? "GET";
    let didTimeout = false;

    const timeout = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, this.timeoutMs);

    const upstreamSignal = init.signal;
    const onUpstreamAbort = () => controller.abort();
    if (upstreamSignal) {
      if (upstreamSignal.aborted) {
        controller.abort();
      } else {
        upstreamSignal.addEventListener("abort", onUpstreamAbort, {
          once: true,
        });
      }
    }

    try {
      let response: Response;
      try {
        response = await this.fetchImpl(url, {
          ...init,
          headers: mergeHeaders(this.defaultHeaders, init.headers),
          signal: controller.signal,
        });
      } catch (error) {
        if (didTimeout && isAbortError(error)) {
          throw new RequestError(
            REQUEST_ERROR_CODES.timeout,
            `Request timed out after ${this.timeoutMs}ms`,
            { url, method },
            error,
          );
        }

        throw new RequestError(
          REQUEST_ERROR_CODES.network,
          "Request failed",
          { url, method },
          error,
        );
      }

      if (!response.ok) {
        throw new RequestError(
          REQUEST_ERROR_CODES.http,
          `HTTP ${response.status}`,
          { url, method, status: response.status },
        );
      }

      return response;
    } finally {
      clearTimeout(timeout);
      upstreamSignal?.removeEventListener("abort", onUpstreamAbort);
    }
  }

  async requestText(url: string, init: RequestInit = {}): Promise<string> {
    const response = await this.request(url, init);
    return response.text();
  }

  async requestJson<T>(
    url: string,
    schema: z.ZodType<T>,
    init: RequestJsonOptions = {},
  ): Promise<T> {
    const headers = mergeHeaders(
      {
        Accept: "application/json",
      },
      init.headers,
    );
    const response = await this.request(url, { ...init, headers });
    let body: unknown;

    try {
      body = await response.json();
    } catch (error) {
      throw new RequestError(
        REQUEST_ERROR_CODES.invalidJson,
        "Response was not valid JSON",
        {
          url,
          method: init.method ?? "GET",
          status: response.status,
        },
        error,
      );
    }

    return parseWithSchema(schema, body, {
      url,
      method: init.method ?? "GET",
      status: response.status,
      schemaName: init.schemaName,
    });
  }
}

export type ParseWithSchemaContext = RequestErrorContext & {
  schemaName?: string;
};

export function parseWithSchema<T>(
  schema: z.ZodType<T>,
  payload: unknown,
  context: ParseWithSchemaContext = {},
): T {
  const parsed = schema.safeParse(payload);
  if (parsed.success) {
    return parsed.data;
  }

  const schemaLabel = context.schemaName ? `${context.schemaName} ` : "";
  throw new RequestError(
    REQUEST_ERROR_CODES.schemaValidation,
    `${schemaLabel}response schema validation failed: ${z.prettifyError(parsed.error)}`,
    context,
    parsed.error,
  );
}

export function createRequestClient(
  options: RequestClientOptions = {},
): RequestClient {
  return new RequestClient(options);
}
