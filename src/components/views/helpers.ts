import type {
  PanelLeafNode,
  SortDirection,
  SortKey,
  SortState,
  TileSummary,
  ViewType,
} from "../../types";
import { createElement, focusTile } from "../../utils";
import type { ColumnVisibilityMenuOptions } from "./types";
import { SidebarRole } from "../../sidebarRoles";
import type { SidebarRoleValue } from "../../sidebarRoles";

export interface TableHeader<TKey extends string = SortKey> {
  key: TKey;
  label: string;
  align: "left" | "center" | "right";
  sortable?: boolean;
  sortKey?: SortKey;
  title?: string;
  hideable?: boolean;
}

const SELECTED_ROW_INDICATOR_BOX_SHADOW =
  "inset 0.25rem 0 0 0 rgba(125, 211, 252, 0.65)";

export const TABLE_CELL_BASE_CLASS =
  "border-b border-r border-slate-800 border-slate-900/80 px-3 py-2 last:border-r-0";
export const TABLE_CELL_EXPANDABLE_CLASS =
  "border-b border-r border-slate-800/60 px-3 py-2 last:border-r-0";

export function applyRowSelectionIndicator(
  row: HTMLElement,
  isSelected: boolean,
): void {
  row.style.boxShadow = isSelected ? SELECTED_ROW_INDICATOR_BOX_SHADOW : "";
}

export function cellClassForColumn(
  column: TableHeader,
  extra = "",
  options?: { variant?: "default" | "expandable" },
): string {
  const variant = options?.variant ?? "default";
  const alignClass =
    column.align === "left"
      ? "text-left"
      : column.align === "right"
        ? "text-right"
        : "text-center";
  const baseClass =
    variant === "expandable"
      ? TABLE_CELL_EXPANDABLE_CLASS
      : TABLE_CELL_BASE_CLASS;
  return [baseClass, alignClass, extra].filter(Boolean).join(" ");
}

export function applyPersistentHover(
  element: HTMLElement,
  leaf: PanelLeafNode,
  rowKey: string,
  highlightClass: string,
): void {
  element.dataset.hoverHighlightClass = highlightClass;
  if (leaf.hoveredRowKey === rowKey) {
    if (leaf.hoveredRowElement && leaf.hoveredRowElement !== element) {
      const previousClass = leaf.hoveredRowElement.dataset.hoverHighlightClass;
      if (previousClass) {
        leaf.hoveredRowElement.classList.remove(previousClass);
      }
    }
    leaf.hoveredRowElement = element;
    element.classList.add(highlightClass);
  }
  element.addEventListener("pointerenter", () => {
    if (leaf.hoveredRowElement && leaf.hoveredRowElement !== element) {
      const previousClass = leaf.hoveredRowElement.dataset.hoverHighlightClass;
      if (previousClass) {
        leaf.hoveredRowElement.classList.remove(previousClass);
      }
    }
    leaf.hoveredRowKey = rowKey;
    leaf.hoveredRowElement = element;
    element.classList.add(highlightClass);
  });
}

export function createPlayerNameElement(
  label: string,
  position: TileSummary | undefined,
  options?: { className?: string; asBlock?: boolean },
): HTMLElement {
  const classNames: string[] = [];
  if (options?.className) {
    classNames.push(options.className);
  }
  if (position) {
    classNames.push(
      "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 rounded-sm transition-colors",
    );
  }
  const className = classNames.filter(Boolean).join(" ").trim();

  if (!position) {
    const tag = options?.asBlock ? "div" : "span";
    return createElement(tag as "div" | "span", className, label);
  }

  const button = createElement("button", className, label);
  button.type = "button";
  button.title = `Focus on ${label}`;
  attachImmediateTileFocus(button, () => {
    focusTile(position);
  });
  return button;
}

export function attachImmediateTileFocus(
  element: HTMLButtonElement,
  focus: () => void,
): void {
  element.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.button !== undefined) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    focus();
  });
  element.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail === 0) {
      focus();
    }
  });
}

export const TABLE_HEADERS: ReadonlyArray<TableHeader> = [
  { key: "label", label: "Clan / Player", align: "left", hideable: false },
  { key: "tiles", label: "Tiles", align: "right" },
  { key: "gold", label: "Gold", align: "right" },
  { key: "troops", label: "Troops", align: "right" },
  {
    key: "incoming",
    label: "⚠️",
    align: "center",
    title: "Incoming attacks",
  },
  {
    key: "outgoing",
    label: "⚔️",
    align: "center",
    title: "Outgoing attacks",
  },
  {
    key: "expanding",
    label: "🌱",
    align: "center",
    title: "Active expansions",
  },
  {
    key: "alliances",
    label: "🤝",
    align: "center",
    title: "Active alliances",
  },
  {
    key: "disconnected",
    label: "📡",
    align: "center",
    title: "Disconnected players",
  },
  {
    key: "traitor",
    label: "🕱",
    align: "center",
    title: "Traitor status",
  },
  {
    key: "stable",
    label: "🛡️",
    align: "center",
    title: "Stable (no alerts)",
  },
  {
    key: "waiting",
    label: "⏳",
    align: "center",
    title: "Waiting status",
  },
  {
    key: "eliminated",
    label: "☠️",
    align: "center",
    title: "Eliminated status",
  },
];

export const SHIP_HEADERS: ReadonlyArray<TableHeader> = [
  { key: "label", label: "Ship", align: "left", hideable: false },
  { key: "owner", label: "Owner", align: "left" },
  { key: "type", label: "Type", align: "left" },
  { key: "troops", label: "Troops", align: "right" },
  { key: "origin", label: "Origin", align: "left" },
  { key: "current", label: "Current", align: "left" },
  { key: "destination", label: "Destination", align: "left" },
  { key: "status", label: "Status", align: "left" },
];

export const DEFAULT_SORT_STATE: SortState = {
  key: "tiles",
  direction: "desc",
};

export function ensureSortState(
  leaf: PanelLeafNode,
  view: ViewType,
): SortState {
  const state = leaf.sortStates[view];
  if (state) {
    return state;
  }
  const fallback = { ...DEFAULT_SORT_STATE };
  leaf.sortStates[view] = fallback;
  return fallback;
}

export function getDefaultDirection(key: SortKey): SortDirection {
  switch (key) {
    case "label":
    case "owner":
    case "type":
    case "origin":
    case "current":
    case "destination":
    case "status":
    case "source":
    case "message":
      return "asc";
    case "timestamp":
      return "asc";
    case "level":
      return "desc";
    default:
      return "desc";
  }
}

export const LOG_TABLE_HEADERS: ReadonlyArray<TableHeader<string>> = [
  {
    key: "timestamp",
    label: "Timestamp",
    align: "left",
    sortKey: "timestamp",
    hideable: false,
  },
  { key: "level", label: "Level", align: "center", sortKey: "level" },
  { key: "source", label: "Source", align: "left", sortKey: "source" },
  { key: "message", label: "Message", align: "left", sortKey: "message" },
];

export const ACTIONS_TABLE_HEADERS: ReadonlyArray<TableHeader<string>> = [
  {
    key: "name",
    label: "Action",
    align: "left",
    sortKey: "label",
    hideable: false,
  },
  { key: "status", label: "Status", align: "left", sortKey: "status" },
  { key: "toggle", label: "Enabled", align: "center", sortKey: "enabled" },
  { key: "controls", label: "Actions", align: "right", sortable: false },
];

export const RUNNING_ACTIONS_TABLE_HEADERS: ReadonlyArray<TableHeader<string>> =
  [
    {
      key: "name",
      label: "Action",
      align: "left",
      sortKey: "label",
      hideable: false,
    },
    { key: "status", label: "Status", align: "left", sortKey: "status" },
    { key: "mode", label: "Mode", align: "left", sortable: false },
    { key: "started", label: "Started", align: "left", sortable: false },
    { key: "controls", label: "", align: "right", sortable: false },
  ];

export const OVERLAY_TABLE_HEADERS: ReadonlyArray<TableHeader<string>> = [
  {
    key: "name",
    label: "Overlay",
    align: "left",
    sortKey: "label",
    hideable: false,
  },
  { key: "status", label: "Status", align: "right", sortKey: "status" },
];

export function getTableHeadersForView(
  view: ViewType,
): ReadonlyArray<TableHeader<string>> | undefined {
  switch (view) {
    case "players":
    case "clanmates":
    case "teams":
      return TABLE_HEADERS;
    case "ships":
      return SHIP_HEADERS;
    case "actions":
      return ACTIONS_TABLE_HEADERS;
    case "runningActions":
      return RUNNING_ACTIONS_TABLE_HEADERS;
    case "logs":
      return LOG_TABLE_HEADERS;
    case "overlays":
      return OVERLAY_TABLE_HEADERS;
    default:
      return undefined;
  }
}

export function ensureColumnVisibilityState<TKey extends string>(
  leaf: PanelLeafNode,
  view: ViewType,
  headers: ReadonlyArray<TableHeader<TKey>>,
): Record<TKey, boolean> {
  const current =
    (leaf.columnVisibility[view] as Partial<Record<TKey, boolean>>) ?? {};
  const normalized = {} as Record<TKey, boolean>;
  for (const header of headers) {
    const key = header.key;
    if (header.hideable === false) {
      normalized[key] = true;
      continue;
    }
    normalized[key] = current[key] === false ? false : true;
  }
  leaf.columnVisibility[view] = normalized as Record<string, boolean>;

  const hideableHeaders = headers.filter((header) => header.hideable !== false);
  if (hideableHeaders.length > 0) {
    const visibleCount = hideableHeaders.filter((header) => {
      const key = header.key;
      return normalized[key] !== false;
    }).length;
    if (visibleCount === 0) {
      const first = hideableHeaders[0];
      normalized[first.key] = true;
    }
  }

  return normalized;
}

export function getVisibleHeaders<TKey extends string>(
  leaf: PanelLeafNode,
  view: ViewType,
  headers: ReadonlyArray<TableHeader<TKey>>,
): TableHeader<TKey>[] {
  const visibility = ensureColumnVisibilityState(leaf, view, headers);
  return headers.filter((header) => visibility[header.key] !== false);
}

export function getColumnVisibilitySignature<TKey extends string>(
  headers: ReadonlyArray<TableHeader<TKey>>,
): string {
  return headers.map((header) => header.key).join("|");
}

export function createTableShell<TKey extends string>(options: {
  sortState?: SortState;
  onSort?: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  view: ViewType;
  headers: ReadonlyArray<TableHeader<TKey>>;
  role?: SidebarRoleValue;
}): { container: HTMLElement; tbody: HTMLElement } {
  const { sortState, onSort, existingContainer, view, headers, role } = options;
  const containerClass =
    "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
  const tableClass = "min-w-full border-collapse text-xs text-slate-100";
  const targetRole = role ?? SidebarRole.TableContainer;
  const canReuse =
    !!existingContainer &&
    existingContainer.dataset.sidebarRole === targetRole &&
    existingContainer.dataset.sidebarView === view;
  const container = canReuse
    ? existingContainer
    : createElement("div", containerClass);
  container.className = containerClass;
  container.dataset.sidebarRole = targetRole;
  container.dataset.sidebarView = view;

  let table = container.querySelector("table") as HTMLTableElement | null;
  if (!table || !canReuse) {
    table = createElement("table", tableClass);
  } else {
    table.className = tableClass;
  }

  const thead = table.tHead ?? createElement("thead", "sticky top-0 z-10");
  thead.className = "sticky top-0 z-10";
  thead.replaceChildren();
  const headerRow = createElement("tr", "bg-slate-900/95");
  for (const column of headers) {
    const th = createElement(
      "th",
      `border-b border-r border-slate-800 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-300 last:border-r-0 ${
        column.align === "left"
          ? "text-left"
          : column.align === "right"
            ? "text-right"
            : "text-center"
      }`,
    );
    th.classList.add("bg-slate-900/90");
    const labelWrapper = createElement(
      "span",
      `flex w-full items-center gap-1 text-inherit ${
        column.align === "left"
          ? "justify-start"
          : column.align === "right"
            ? "justify-end"
            : "justify-center"
      }`,
      column.label,
    );
    if (column.title) {
      th.title = column.title;
      th.setAttribute("aria-label", column.title);
    }
    const isSortable =
      (column.sortable ?? true) &&
      sortState !== undefined &&
      onSort !== undefined;
    if (isSortable) {
      const sortKey = column.sortKey ?? (column.key as SortKey);
      const isActive = sortState.key === sortKey;
      const indicator = createElement(
        "span",
        `text-[0.6rem] ${isActive ? "text-sky-300" : "text-slate-500"}`,
        isActive ? (sortState.direction === "asc" ? "▲" : "▼") : "↕",
      );
      if (column.align === "right") {
        labelWrapper.appendChild(indicator);
      } else {
        labelWrapper.insertBefore(indicator, labelWrapper.firstChild);
      }
      th.classList.add("cursor-pointer", "select-none");
      th.dataset.sortKey = sortKey;
      th.addEventListener("click", (event) => {
        event.preventDefault();
        onSort(sortKey);
      });
    }
    th.appendChild(labelWrapper);
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);

  const tbody = table.tBodies[0] ?? createElement("tbody", "text-[0.75rem]");
  tbody.className = "text-[0.75rem]";
  tbody.replaceChildren();

  if (!table.contains(thead)) {
    table.appendChild(thead);
  }
  if (!table.contains(tbody)) {
    table.appendChild(tbody);
  }

  if (
    container.firstElementChild !== table ||
    container.childElementCount !== 1
  ) {
    container.replaceChildren(table);
  }

  return { container, tbody };
}

let columnMenuElement: HTMLDivElement | null = null;
let columnMenuCleanup: (() => void) | null = null;

function ensureColumnMenuElement(): HTMLDivElement {
  if (!columnMenuElement) {
    columnMenuElement = createElement("div") as HTMLDivElement;
    columnMenuElement.dataset.sidebarRole = SidebarRole.ColumnVisibilityMenu;
    columnMenuElement.style.pointerEvents = "auto";
    columnMenuElement.style.zIndex = "2147483647";
  }
  columnMenuElement.className =
    "fixed z-[2147483647] min-w-[200px] overflow-hidden rounded-md border " +
    "border-slate-700/80 bg-slate-950/95 text-sm text-slate-100 shadow-2xl " +
    "backdrop-blur";
  return columnMenuElement;
}

export function hideColumnVisibilityMenu(): void {
  if (columnMenuCleanup) {
    const cleanup = columnMenuCleanup;
    columnMenuCleanup = null;
    cleanup();
    return;
  }
  if (columnMenuElement && columnMenuElement.parentElement) {
    columnMenuElement.parentElement.removeChild(columnMenuElement);
  }
}

export function isColumnVisibilitySupported(view: ViewType): boolean {
  const headers = getTableHeadersForView(view);
  return Array.isArray(headers) && headers.length > 0;
}

export function showColumnVisibilityMenu(
  options: ColumnVisibilityMenuOptions,
): void {
  const { leaf, anchor, onChange } = options;
  const baseHeaders = getTableHeadersForView(leaf.view);
  if (!baseHeaders || baseHeaders.length === 0) {
    hideColumnVisibilityMenu();
    return;
  }

  const visibility = ensureColumnVisibilityState(leaf, leaf.view, baseHeaders);
  const hideableHeaders = baseHeaders.filter(
    (header) => header.hideable !== false,
  );

  hideColumnVisibilityMenu();

  const menu = ensureColumnMenuElement();
  menu.style.visibility = "hidden";
  menu.style.left = "0px";
  menu.style.top = "0px";

  const wrapper = createElement("div", "flex flex-col");
  wrapper.appendChild(
    createElement(
      "div",
      "border-b border-slate-800/80 px-3 py-2 text-xs font-semibold uppercase " +
        "tracking-wide text-slate-300",
      "Columns",
    ),
  );

  const list = createElement("div", "py-1");
  for (const header of baseHeaders) {
    const key = header.key;
    const item = createElement(
      "label",
      `${
        header.hideable === false
          ? "cursor-default text-slate-300"
          : "cursor-pointer text-slate-200 hover:bg-slate-800/70"
      } flex items-center gap-3 px-3 py-2 text-xs transition-colors`,
    );
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className =
      "h-3.5 w-3.5 rounded border border-slate-600 bg-slate-900 text-sky-400 " +
      "focus:outline-none focus:ring-2 focus:ring-sky-500";
    checkbox.checked = visibility[key] !== false;
    checkbox.disabled = header.hideable === false;
    item.appendChild(checkbox);

    const label = createElement("span", "flex-1 truncate", header.label);
    item.appendChild(label);

    if (header.hideable === false) {
      item.title = "This column is always visible.";
      item.appendChild(
        createElement(
          "span",
          "rounded-full border border-slate-700/70 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-slate-400",
          "Pinned",
        ),
      );
    }

    checkbox.addEventListener("change", () => {
      if (header.hideable === false) {
        checkbox.checked = true;
        return;
      }
      const nextVisible = checkbox.checked;
      if (!nextVisible) {
        const remainingVisible = hideableHeaders.filter((candidate) => {
          if (candidate.key === header.key) {
            return false;
          }
          const candidateKey = candidate.key;
          return visibility[candidateKey] !== false;
        }).length;
        if (remainingVisible === 0) {
          checkbox.checked = true;
          return;
        }
      }
      visibility[key] = nextVisible;
      leaf.columnVisibility[leaf.view] = {
        ...(visibility as Record<string, boolean>),
      };
      onChange?.();
    });

    list.appendChild(item);
  }

  if (list.childElementCount === 0) {
    hideColumnVisibilityMenu();
    return;
  }

  wrapper.appendChild(list);
  menu.replaceChildren(wrapper);
  document.body.appendChild(menu);

  const menuRect = menu.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let top = anchorRect.bottom + 6;
  let left = anchorRect.left;
  if (top + menuRect.height > viewportHeight - 8) {
    top = anchorRect.top - menuRect.height - 6;
  }
  if (top < 8) {
    top = Math.max(
      8,
      Math.min(anchorRect.bottom + 6, viewportHeight - menuRect.height - 8),
    );
  }
  if (left + menuRect.width > viewportWidth - 8) {
    left = anchorRect.right - menuRect.width;
  }
  if (left < 8) {
    left = 8;
  }
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.visibility = "visible";

  const cleanupHandlers: Array<() => void> = [];
  const cleanupMenu = () => {
    while (cleanupHandlers.length > 0) {
      const cleanup = cleanupHandlers.pop();
      try {
        cleanup?.();
      } catch (error) {
        console.warn(
          "Failed to clean up column visibility menu listener",
          error,
        );
      }
    }
    if (menu.parentElement) {
      menu.parentElement.removeChild(menu);
    }
    if (columnMenuCleanup === cleanupMenu) {
      columnMenuCleanup = null;
    }
  };

  columnMenuCleanup = cleanupMenu;

  window.setTimeout(() => {
    if (columnMenuCleanup !== cleanupMenu) {
      return;
    }

    const handlePointerDown = (event: Event) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      if (!menu.contains(event.target) && !anchor.contains(event.target)) {
        hideColumnVisibilityMenu();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideColumnVisibilityMenu();
      }
    };
    const handleScroll = (event: Event) => {
      if (!event.isTrusted) {
        return;
      }
      hideColumnVisibilityMenu();
    };
    const handleBlur = () => hideColumnVisibilityMenu();

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("blur", handleBlur);

    cleanupHandlers.push(() =>
      document.removeEventListener("pointerdown", handlePointerDown, true),
    );
    cleanupHandlers.push(() =>
      document.removeEventListener("keydown", handleKeyDown, true),
    );
    cleanupHandlers.push(() =>
      window.removeEventListener("scroll", handleScroll, true),
    );
    cleanupHandlers.push(() => window.removeEventListener("blur", handleBlur));
  }, 0);
}

export function compareSortValues(
  a: number | string,
  b: number | string,
  direction: SortDirection,
): number {
  if (typeof a === "string" && typeof b === "string") {
    const cmp = a.localeCompare(b, undefined, { sensitivity: "base" });
    return direction === "asc" ? cmp : -cmp;
  }
  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    const diff = numA - numB;
    if (diff !== 0) {
      return direction === "asc" ? diff : -diff;
    }
    return 0;
  }
  const fallback = String(a).localeCompare(String(b), undefined, {
    sensitivity: "base",
  });
  return direction === "asc" ? fallback : -fallback;
}
