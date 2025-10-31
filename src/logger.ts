import {
  type SidebarLogEntry,
  type SidebarLogLevel,
  type SidebarLogMetadata,
  type SidebarLogToken,
  type SidebarLogger,
} from "./types";

export type SidebarLogListener = (entry: SidebarLogEntry) => void;

const listeners = new Set<SidebarLogListener>();
let logEntryCounter = 0;

function formatLogArg(arg: unknown): string {
  if (typeof arg === "string") {
    return arg;
  }
  if (
    typeof arg === "number" ||
    typeof arg === "boolean" ||
    arg === null ||
    arg === undefined
  ) {
    return String(arg);
  }
  if (arg instanceof Error) {
    return arg.stack ?? `${arg.name}: ${arg.message}`;
  }
  try {
    return JSON.stringify(arg);
  } catch (error) {
    return String(arg);
  }
}

function isLogToken(value: unknown): value is SidebarLogToken {
  if (!value || typeof value !== "object") {
    return false;
  }
  const token = value as { type?: unknown };
  if (token.type === "text") {
    return typeof (value as { text?: unknown }).text === "string";
  }
  if (
    token.type === "player" ||
    token.type === "team" ||
    token.type === "clan"
  ) {
    const { id, label } = value as { id?: unknown; label?: unknown };
    return typeof id === "string" && typeof label === "string";
  }
  return false;
}

function isLogMetadata(value: unknown): value is SidebarLogMetadata {
  if (!value || typeof value !== "object") {
    return false;
  }
  const tokens = (value as SidebarLogMetadata).tokens;
  if (tokens === undefined) {
    return false;
  }
  if (!Array.isArray(tokens)) {
    return false;
  }
  return tokens.every((token) => isLogToken(token));
}

function extractLogMetadata(args: readonly unknown[]): {
  args: unknown[];
  metadata?: SidebarLogMetadata;
} {
  if (args.length === 0) {
    return { args: [] };
  }
  const last = args[args.length - 1];
  if (isLogMetadata(last)) {
    return { args: Array.from(args.slice(0, -1)), metadata: last };
  }
  return { args: Array.from(args) };
}

function sanitizeTokens(
  tokens: SidebarLogToken[] | undefined,
): SidebarLogToken[] | undefined {
  if (!tokens || tokens.length === 0) {
    return undefined;
  }
  const sanitized: SidebarLogToken[] = [];
  for (const token of tokens) {
    if (token.type === "text") {
      sanitized.push({ type: "text", text: token.text ?? "" });
      continue;
    }
    const label = typeof token.label === "string" ? token.label : "";
    const id = typeof token.id === "string" ? token.id : "";
    const color = typeof token.color === "string" ? token.color : undefined;
    if (!label || !id) {
      continue;
    }
    sanitized.push({ type: token.type, id, label, color });
  }
  return sanitized.length > 0 ? sanitized : undefined;
}

function emitLogEntry(
  level: SidebarLogLevel,
  args: readonly unknown[],
  source?: string,
): SidebarLogEntry {
  const { args: normalizedArgs, metadata } = extractLogMetadata(args);
  const message = normalizedArgs.map((arg) => formatLogArg(arg)).join(" ");
  const entry: SidebarLogEntry = {
    id: `log-${++logEntryCounter}`,
    level,
    message,
    timestampMs: Date.now(),
    source,
    tokens: sanitizeTokens(metadata?.tokens),
  };
  for (const listener of listeners) {
    listener(entry);
  }
  return entry;
}

function callConsole(method: keyof Console, args: readonly unknown[]): void {
  const fn = console[method];
  if (typeof fn === "function") {
    fn.apply(console, args as []);
    return;
  }
  console.log(...(args as []));
}

function logWithConsole(
  method: keyof Console,
  level: SidebarLogLevel,
  source: string | undefined,
  args: readonly unknown[],
): void {
  callConsole(method, args);
  emitLogEntry(level, args, source);
}

export function createSidebarLogger(source?: string): SidebarLogger {
  return {
    log: (...args: unknown[]) => logWithConsole("log", "info", source, args),
    info: (...args: unknown[]) => logWithConsole("info", "info", source, args),
    warn: (...args: unknown[]) => logWithConsole("warn", "warn", source, args),
    error: (...args: unknown[]) =>
      logWithConsole("error", "error", source, args),
    debug: (...args: unknown[]) =>
      logWithConsole("debug", "debug", source, args),
  } satisfies SidebarLogger;
}

export const sidebarLogger = createSidebarLogger("Sidebar");

export function logSidebarMessage(
  level: SidebarLogLevel,
  message: string,
  options?: { source?: string },
): void {
  switch (level) {
    case "warn":
      logWithConsole("warn", level, options?.source, [message]);
      break;
    case "error":
      logWithConsole("error", level, options?.source, [message]);
      break;
    case "debug":
      logWithConsole("debug", level, options?.source, [message]);
      break;
    default:
      logWithConsole("info", level, options?.source, [message]);
      break;
  }
}

export function subscribeToSidebarLogs(
  listener: SidebarLogListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
