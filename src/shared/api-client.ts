import {
  createRequestClient,
  type RequestClient,
  RequestError,
  REQUEST_ERROR_CODES,
} from "./request-client.js";

export const DEFAULT_OPENFRONT_SITE = "https://openfront.io";
const DEFAULT_TIMEOUT_MS = 10_000;
const COMMIT_RE = /\b([0-9a-f]{40})\b/i;

export const OPENFRONT_API_ERROR_CODES = {
  noFetch: "NO_FETCH",
  timeout: "TIMEOUT",
  network: "NETWORK_ERROR",
  http: "HTTP_ERROR",
  commitNotFound: "COMMIT_NOT_FOUND",
} as const;

export type OpenFrontApiErrorCode =
  (typeof OPENFRONT_API_ERROR_CODES)[keyof typeof OPENFRONT_API_ERROR_CODES];

export type LiveCommitResponse = {
  commit: string;
  sourceUrl: string;
  sourceType: "commit_txt" | "html";
};

export type OpenFrontApiClientOptions = {
  fetchImpl?: typeof fetch;
  site?: string;
  timeoutMs?: number;
};

export type OpenFrontApiErrorContext = {
  url?: string;
  status?: number;
};

export class OpenFrontApiError extends Error {
  readonly code: OpenFrontApiErrorCode;
  readonly context: OpenFrontApiErrorContext;
  readonly cause: unknown;

  constructor(
    code: OpenFrontApiErrorCode,
    message: string,
    context: OpenFrontApiErrorContext = {},
    cause?: unknown,
  ) {
    super(message);
    this.name = "OpenFrontApiError";
    this.code = code;
    this.context = context;
    this.cause = cause;
  }
}

export interface OpenFrontClient {
  getLiveCommit(): Promise<LiveCommitResponse>;
}

function normalizeSite(site: string): string {
  return site.replace(/\/+$/, "");
}

function toOpenFrontApiError(
  error: unknown,
  fallbackContext: OpenFrontApiErrorContext = {},
): OpenFrontApiError {
  if (error instanceof OpenFrontApiError) {
    return error;
  }

  if (error instanceof RequestError) {
    const context: OpenFrontApiErrorContext = {
      url: error.context.url ?? fallbackContext.url,
      status: error.context.status ?? fallbackContext.status,
    };

    switch (error.code) {
      case REQUEST_ERROR_CODES.noFetch:
        return new OpenFrontApiError(
          OPENFRONT_API_ERROR_CODES.noFetch,
          error.message,
          context,
          error.cause ?? error,
        );
      case REQUEST_ERROR_CODES.timeout:
        return new OpenFrontApiError(
          OPENFRONT_API_ERROR_CODES.timeout,
          error.message,
          context,
          error.cause ?? error,
        );
      case REQUEST_ERROR_CODES.network:
        return new OpenFrontApiError(
          OPENFRONT_API_ERROR_CODES.network,
          error.message,
          context,
          error.cause ?? error,
        );
      case REQUEST_ERROR_CODES.http:
        return new OpenFrontApiError(
          OPENFRONT_API_ERROR_CODES.http,
          `OpenFront responded with HTTP ${error.context.status ?? "unknown"}`,
          context,
          error.cause ?? error,
        );
      default:
        return new OpenFrontApiError(
          OPENFRONT_API_ERROR_CODES.network,
          error.message,
          context,
          error.cause ?? error,
        );
    }
  }

  return new OpenFrontApiError(
    OPENFRONT_API_ERROR_CODES.network,
    "Request to OpenFront failed",
    fallbackContext,
    error,
  );
}

export function shortHash(hash: string): string {
  return hash.slice(0, 12);
}

export class OpenFrontApiClient implements OpenFrontClient {
  private readonly requestClient: RequestClient;
  readonly site: string;

  constructor(options: OpenFrontApiClientOptions = {}) {
    this.site = normalizeSite(options.site ?? DEFAULT_OPENFRONT_SITE);
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    try {
      this.requestClient = createRequestClient({
        fetchImpl: options.fetchImpl,
        timeoutMs,
        defaultHeaders: {
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      throw toOpenFrontApiError(error);
    }
  }

  async getLiveCommit(): Promise<LiveCommitResponse> {
    const commitUrl = `${this.site}/commit.txt?ts=${Date.now()}`;
    let commitTxtError: unknown;

    try {
      const text = await this.requestClient.requestText(commitUrl, {
        cache: "no-store",
      });
      const commit = text.match(COMMIT_RE)?.[1];
      if (commit) {
        return {
          commit: commit.toLowerCase(),
          sourceUrl: commitUrl,
          sourceType: "commit_txt",
        };
      }

      commitTxtError = new OpenFrontApiError(
        OPENFRONT_API_ERROR_CODES.commitNotFound,
        "Commit hash was not found in /commit.txt response",
        { url: commitUrl },
      );
    } catch (error) {
      commitTxtError = toOpenFrontApiError(error, { url: commitUrl });
    }

    let htmlResolutionError: unknown;
    try {
      const htmlUrl = `${this.site}/`;
      const html = await this.requestClient.requestText(htmlUrl, {
        cache: "no-store",
      });
      const commit = html.match(
        /window\.GIT_COMMIT\s*=\s*"([0-9a-f]{40})"/i,
      )?.[1];

      if (commit) {
        return {
          commit: commit.toLowerCase(),
          sourceUrl: htmlUrl,
          sourceType: "html",
        };
      }

      htmlResolutionError = new OpenFrontApiError(
        OPENFRONT_API_ERROR_CODES.commitNotFound,
        "Commit hash was not found in live HTML",
        { url: htmlUrl },
      );
    } catch (error) {
      htmlResolutionError = toOpenFrontApiError(error, {
        url: `${this.site}/`,
      });
    }

    if (
      htmlResolutionError instanceof OpenFrontApiError &&
      htmlResolutionError.code !== OPENFRONT_API_ERROR_CODES.commitNotFound
    ) {
      throw htmlResolutionError;
    }

    throw new OpenFrontApiError(
      OPENFRONT_API_ERROR_CODES.commitNotFound,
      "Unable to resolve live commit from /commit.txt or HTML",
      { url: this.site },
      {
        commitTxtError,
        htmlError: htmlResolutionError,
      },
    );
  }
}

export function createOpenFrontApiClient(
  options: OpenFrontApiClientOptions = {},
): OpenFrontClient {
  return new OpenFrontApiClient(options);
}
