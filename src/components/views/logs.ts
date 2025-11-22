import type {
  GameSnapshot,
  PanelLeafNode,
  SidebarLogEntry,
  SidebarLogLevel,
  SidebarLogToken,
  SortKey,
  SortState,
} from "../../types";
import type { ViewActionHandlers } from "./types";
import { createElement, formatTimestamp } from "../../utils";
import {
  LOG_TABLE_HEADERS,
  TABLE_CELL_BASE_CLASS,
  compareSortValues,
  createTableShell,
  getColumnVisibilitySignature,
  getDefaultDirection,
  getVisibleHeaders,
} from "./helpers";
import { SidebarRole } from "../../sidebarRoles";

type MentionToken = Extract<
  SidebarLogToken,
  { type: "player" | "team" | "clan" }
>;

export function renderLogView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions: ViewActionHandlers;
  searchFilter?: string;
}): HTMLElement {
  const {
    leaf,
    snapshot,
    existingContainer,
    actions,
    sortState,
    onSort,
    searchFilter,
  } = options;
  const logActions = actions;
  const logs = snapshot.sidebarLogs ?? [];
  const revision = snapshot.sidebarLogRevision ?? 0;

  const followEnabled = leaf.logFollowEnabled !== false;
  const supportedSortKeys: SortKey[] = [
    "timestamp",
    "level",
    "source",
    "message",
  ];
  let activeSortState = sortState;
  if (!supportedSortKeys.includes(sortState.key)) {
    const fallbackDirection = getDefaultDirection("timestamp");
    activeSortState = { key: "timestamp", direction: fallbackDirection };
    leaf.sortStates[leaf.view] = activeSortState;
  }
  const sortSignature = `${activeSortState.key}:${activeSortState.direction}`;
  const isLogContainer =
    !!existingContainer &&
    existingContainer.dataset.sidebarRole === SidebarRole.LogView;
  const visibleHeaders = getVisibleHeaders(leaf, leaf.view, LOG_TABLE_HEADERS);
  const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
  if (isLogContainer) {
    existingContainer.dataset.logFollowState = followEnabled
      ? "following"
      : "paused";
    existingContainer.dataset.logStickToBottom = followEnabled
      ? "true"
      : "false";
    const previousRevision = Number(
      existingContainer.dataset.logRevision ?? "-1",
    );
    const previousSortState = existingContainer.dataset.sortState ?? "";
    const previousVisibility =
      existingContainer.dataset.columnVisibilitySignature ?? "";
    const previousSearchFilter = existingContainer.dataset.searchFilter ?? "";

    if (
      previousRevision === revision &&
      previousSortState === sortSignature &&
      previousVisibility === visibilitySignature &&
      previousSearchFilter === (searchFilter ?? "")
    ) {
      existingContainer.dataset.logRevision = String(revision);
      existingContainer.dataset.sortState = sortSignature;
      existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
      existingContainer.dataset.searchFilter = searchFilter ?? "";

      return existingContainer;
    }
  }

  const { container, tbody } = createTableShell({
    sortState: activeSortState,
    onSort,
    existingContainer: isLogContainer ? existingContainer : undefined,
    view: leaf.view,
    headers: visibleHeaders,
    role: SidebarRole.LogView,
  });
  container.dataset.logFollowState = followEnabled ? "following" : "paused";
  container.dataset.logStickToBottom = followEnabled ? "true" : "false";
  container.dataset.logRevision = String(revision);
  container.dataset.sortState = sortSignature;
  container.dataset.columnVisibilitySignature = visibilitySignature;
  container.dataset.searchFilter = searchFilter ?? "";

  const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
  if (logs.length === 0) {
    const emptyRow = createElement("tr");
    const emptyCell = createElement(
      "td",
      `${TABLE_CELL_BASE_CLASS} py-8 text-center text-[0.75rem] italic text-slate-500`,
      "No log messages yet.",
    );
    emptyCell.colSpan = Math.max(1, visibleHeaders.length);
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  } else {
    const sortedLogs = [...logs];
    switch (activeSortState.key) {
      case "timestamp":
        sortedLogs.sort((a, b) =>
          compareSortValues(
            a.timestampMs,
            b.timestampMs,
            activeSortState.direction,
          ),
        );
        break;
      case "level":
        sortedLogs.sort((a, b) =>
          compareSortValues(
            getLogLevelWeight(a.level),
            getLogLevelWeight(b.level),
            activeSortState.direction,
          ),
        );
        break;
      case "source":
        sortedLogs.sort((a, b) =>
          compareSortValues(
            (a.source ?? "").toLowerCase(),
            (b.source ?? "").toLowerCase(),
            activeSortState.direction,
          ),
        );
        break;
      case "message":
        sortedLogs.sort((a, b) =>
          compareSortValues(
            getLogMessageSortValue(a),
            getLogMessageSortValue(b),
            activeSortState.direction,
          ),
        );
        break;
      default:
        break;
    }

    for (const entry of sortedLogs) {
      tbody.appendChild(renderLogRow(entry, logActions, visibleKeys));
    }
  }

  return container;
}

function renderLogRow(
  entry: SidebarLogEntry,
  actions: ViewActionHandlers,
  visibleKeys: Set<string>,
): HTMLTableRowElement {
  const row = createElement("tr", "transition-colors hover:bg-slate-900/40");
  row.dataset.sidebarRole = SidebarRole.LogEntry;
  row.dataset.logEntryId = entry.id;
  row.dataset.logLevel = entry.level;
  row.dataset.logTimestamp = String(entry.timestampMs);
  row.style.boxShadow = `inset 0.25rem 0 0 0 ${getLogAccentColor(entry.level)}`;

  const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
  const timestampCell = createElement(
    "td",
    `${cellBaseClass} font-mono text-[0.75rem] text-slate-300 whitespace-nowrap`,
    formatTimestamp(entry.timestampMs),
  );

  const levelCell = createElement("td", `${cellBaseClass} text-center`);
  const levelBadge = createElement(
    "span",
    `inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${getLogLevelBadgeClass(entry.level)}`,
    entry.level.toUpperCase(),
  );
  levelCell.appendChild(levelBadge);

  const hasSource = !!entry.source && entry.source.trim().length > 0;
  const sourceCell = createElement(
    "td",
    `${cellBaseClass} text-[0.75rem] text-slate-400 whitespace-nowrap`,
    hasSource ? entry.source : "–",
  );

  const messageCellClass = `${cellBaseClass} font-mono text-[0.75rem] whitespace-pre-wrap break-words `;
  const messageCell = createElement(
    "td",
    `${messageCellClass}${getLogMessageClass(entry.level)}`,
  );
  if (entry.tokens && entry.tokens.length > 0) {
    messageCell.appendChild(renderLogTokens(entry.tokens, actions));
  } else {
    messageCell.textContent = entry.message;
  }

  if (visibleKeys.has("timestamp")) {
    row.appendChild(timestampCell);
  }
  if (visibleKeys.has("level")) {
    row.appendChild(levelCell);
  }
  if (visibleKeys.has("source")) {
    row.appendChild(sourceCell);
  }
  if (visibleKeys.has("message")) {
    row.appendChild(messageCell);
  }

  return row;
}

function getLogLevelWeight(level: SidebarLogLevel): number {
  switch (level) {
    case "error":
      return 3;
    case "warn":
      return 2;
    case "info":
      return 1;
    case "debug":
      return 0;
    default:
      return 0;
  }
}

function getLogMessageSortValue(entry: SidebarLogEntry): string {
  if (entry.tokens && entry.tokens.length > 0) {
    return entry.tokens
      .map((token) => (token.type === "text" ? token.text : token.label))
      .join(" ")
      .toLowerCase();
  }
  return entry.message.toLowerCase();
}

function renderLogTokens(
  tokens: SidebarLogToken[],
  actions: ViewActionHandlers,
): DocumentFragment {
  const fragment = document.createDocumentFragment();
  for (const token of tokens) {
    if (token.type === "text") {
      fragment.appendChild(document.createTextNode(token.text));
      continue;
    }
    fragment.appendChild(createLogMentionPill(token, actions));
  }
  return fragment;
}

function createLogMentionPill(
  token: MentionToken,
  actions: ViewActionHandlers,
): HTMLElement {
  const button = createElement(
    "button",
    "inline-flex max-w-full items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/40 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-200 transition-colors hover:border-sky-500/70 hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60",
  );
  button.type = "button";
  button.dataset.sidebarRole = SidebarRole.LogMention;
  button.dataset.mentionType = token.type;
  button.dataset.mentionId = token.id;

  if (token.color) {
    button.style.borderColor = token.color;
    const swatch = createElement(
      "span",
      "h-2 w-2 shrink-0 rounded-full border border-slate-900/70",
    );
    swatch.style.backgroundColor = token.color;
    button.appendChild(swatch);
  }

  const label = createElement(
    "span",
    "max-w-[10rem] truncate text-left",
    token.label,
  );
  label.title = token.label;
  button.appendChild(label);

  switch (token.type) {
    case "player":
      button.title = `Focus on ${token.label}`;
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        actions.focusPlayer?.(token.id);
      });
      break;
    case "team":
      button.title = `Show team ${token.label}`;
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        actions.focusTeam?.(token.id);
      });
      break;
    case "clan":
      button.title = `Show clan ${token.label}`;
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        actions.focusClan?.(token.id);
      });
      break;
  }

  return button;
}

function getLogLevelBadgeClass(level: SidebarLogEntry["level"]): string {
  switch (level) {
    case "error":
      return "border border-rose-500/40 bg-rose-500/15 text-rose-200";
    case "warn":
      return "border border-amber-400/40 bg-amber-400/15 text-amber-200";
    case "debug":
      return "border border-slate-600/50 bg-slate-800/70 text-slate-300";
    default:
      return "border border-sky-400/40 bg-sky-400/15 text-sky-200";
  }
}

function getLogMessageClass(level: SidebarLogEntry["level"]): string {
  switch (level) {
    case "error":
      return "text-rose-200";
    case "warn":
      return "text-amber-200";
    case "debug":
      return "text-slate-400";
    default:
      return "text-slate-200";
  }
}

function getLogAccentColor(level: SidebarLogEntry["level"]): string {
  switch (level) {
    case "error":
      return "rgba(248, 113, 113, 0.75)";
    case "warn":
      return "rgba(251, 191, 36, 0.75)";
    case "debug":
      return "rgba(148, 163, 184, 0.55)";
    default:
      return "rgba(56, 189, 248, 0.65)";
  }
}
