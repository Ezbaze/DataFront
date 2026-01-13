import type {
  GameSnapshot,
  PanelLeafNode,
  PlayerRecord,
  SortKey,
  SortState,
  TileSummary,
} from "../../types";
import {
  createElement as createElementBase,
  extractClanTag,
  focusTile,
  formatNumber,
  formatTroopCount,
  showContextMenu,
} from "../../utils";
import {
  isTradeStoppedByOther,
  isTradeStoppedBySelf,
  TradeStatusCarrier,
} from "../../trade";
import {
  applyPersistentHover,
  applyRowSelectionIndicator,
  cellClassForColumn,
  compareSortValues,
  createPlayerNameElement,
  createTableShell,
  getColumnVisibilitySignature,
  getVisibleHeaders,
  TABLE_HEADERS,
} from "./helpers";
import type { TableHeader } from "./helpers";
import type {
  RequestRender,
  ViewActionHandlers,
  ViewRenderOptions,
} from "./types";

let viewDocument: Document = document;

function withViewDocument<T>(doc: Document, fn: () => T): T {
  const previous = viewDocument;
  viewDocument = doc;
  try {
    return fn();
  } finally {
    viewDocument = previous;
  }
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  textContent?: string,
): HTMLElementTagNameMap[K] {
  return createElementBase(tag, className, textContent, viewDocument);
}

export interface PlayerMetrics {
  incoming: number;
  outgoing: number;
  expanding: number;
  waiting: number;
  eliminated: number;
  disconnected: number;
  traitor: number;
  alliances: number;
  stable: number;
}

type Metrics = PlayerMetrics;

type PlayerColumnKey =
  | "label"
  | "tiles"
  | "gold"
  | "troops"
  | "incoming"
  | "outgoing"
  | "expanding"
  | "alliances"
  | "disconnected"
  | "traitor"
  | "stable"
  | "waiting"
  | "eliminated";

interface PlayerColumnValueContext {
  player: PlayerRecord;
  metrics: Metrics;
  snapshot: GameSnapshot;
}

interface PlayerAggregateColumnContext {
  group: AggregatedRow;
  metrics: Metrics;
  totals: AggregatedRow["totals"];
  snapshot?: GameSnapshot;
}

interface PlayerColumnConfig {
  cellClass?: string;
  aggregateCellClass?: string;
  getValue?: (context: PlayerColumnValueContext) => string;
  getAggregateValue?: (context: PlayerAggregateColumnContext) => string;
  getSortValue?: (context: PlayerColumnValueContext) => number | string;
  getAggregateSortValue?: (
    context: PlayerAggregateColumnContext,
  ) => number | string;
  getValueClass?: (context: PlayerColumnValueContext) => string | undefined;
  getAggregateValueClass?: (
    context: PlayerAggregateColumnContext,
  ) => string | undefined;
}

const PLAYER_ALERT_CLASS = "bg-red-500 text-white";
const PLAYER_COUNT_CLASS = "font-semibold";
const PLAYER_NUMERIC_CLASS = "font-mono text-[0.75rem]";

const PLAYER_COLUMN_CONFIG: Record<PlayerColumnKey, PlayerColumnConfig> = {
  label: {
    cellClass: "font-semibold",
    aggregateCellClass: "font-semibold",
    getValue: ({ player }) => player.name,
    getAggregateValue: ({ group }) => group.label,
    getSortValue: ({ player }) => player.name.toLowerCase(),
    getAggregateSortValue: ({ group }) => group.label.toLowerCase(),
  },
  tiles: createResourceColumn({
    formatter: formatNumber,
    value: ({ player }) => player.tiles,
    aggregateValue: ({ totals }) => totals.tiles,
  }),
  gold: createResourceColumn({
    formatter: formatNumber,
    value: ({ player }) => player.gold,
    aggregateValue: ({ totals }) => totals.gold,
  }),
  troops: createResourceColumn({
    formatter: formatTroopCount,
    value: ({ player }) => player.troops,
    aggregateValue: ({ totals }) => totals.troops,
  }),
  incoming: createMetricColumn("incoming", { highlightPositive: true }),
  outgoing: createMetricColumn("outgoing"),
  expanding: createMetricColumn("expanding"),
  alliances: createMetricColumn("alliances"),
  disconnected: createMetricColumn("disconnected"),
  traitor: createMetricColumn("traitor"),
  stable: createMetricColumn("stable"),
  waiting: createMetricColumn("waiting"),
  eliminated: createMetricColumn("eliminated"),
};

function createResourceColumn(options: {
  formatter: (value: number) => string;
  value: (context: PlayerColumnValueContext) => number;
  aggregateValue: (context: PlayerAggregateColumnContext) => number;
}): PlayerColumnConfig {
  return {
    cellClass: PLAYER_NUMERIC_CLASS,
    aggregateCellClass: PLAYER_NUMERIC_CLASS,
    getValue: (context) => options.formatter(options.value(context)),
    getAggregateValue: (context) =>
      options.formatter(options.aggregateValue(context)),
    getSortValue: (context) => options.value(context),
    getAggregateSortValue: (context) => options.aggregateValue(context),
  };
}

function createMetricColumn(
  metric: keyof Metrics,
  options?: { highlightPositive?: boolean },
): PlayerColumnConfig {
  const getHighlightClass = options?.highlightPositive
    ? (value: number) => (value > 0 ? PLAYER_ALERT_CLASS : undefined)
    : () => undefined;
  return {
    cellClass: PLAYER_COUNT_CLASS,
    aggregateCellClass: PLAYER_COUNT_CLASS,
    getValue: ({ metrics }) => String(metrics[metric]),
    getAggregateValue: ({ metrics }) => String(metrics[metric]),
    getSortValue: ({ metrics }) => metrics[metric],
    getAggregateSortValue: ({ metrics }) => metrics[metric],
    getValueClass: ({ metrics }) => getHighlightClass(metrics[metric]),
    getAggregateValueClass: ({ metrics }) => getHighlightClass(metrics[metric]),
  };
}

function getPlayerColumnConfig(key: SortKey): PlayerColumnConfig | undefined {
  if (key in PLAYER_COLUMN_CONFIG) {
    return PLAYER_COLUMN_CONFIG[key as PlayerColumnKey];
  }
  return undefined;
}

interface AggregatedRow {
  key: string;
  label: string;
  players: PlayerRecord[];
  metrics: Metrics;
  totals: {
    tiles: number;
    gold: number;
    troops: number;
  };
}

interface PlayerContextTarget extends TradeStatusCarrier {
  id: string;
  name: string;
  isSelf: boolean;
}

interface GroupContextTarget {
  label: string;
  players: PlayerRecord[];
}

const tableContextActions = new WeakMap<HTMLElement, ViewActionHandlers>();
const playerContextTargets = new WeakMap<HTMLElement, PlayerContextTarget>();
const groupContextTargets = new WeakMap<HTMLElement, GroupContextTarget>();

function findContextMenuTarget(
  event: MouseEvent,
  container: HTMLElement,
): { element: HTMLElement; type: "player" | "group" } | null {
  if (event.target instanceof HTMLElement && container.contains(event.target)) {
    let current: HTMLElement | null = event.target;
    while (current && current !== container) {
      const type = current.dataset.contextTarget;
      if (type === "player" || type === "group") {
        return { element: current, type };
      }
      current = current.parentElement;
    }
  }

  const composedPath =
    typeof event.composedPath === "function" ? event.composedPath() : [];
  for (const node of composedPath) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    if (!container.contains(node)) {
      continue;
    }
    const type = node.dataset.contextTarget;
    if (type === "player" || type === "group") {
      return { element: node, type };
    }
  }

  return null;
}

function registerContextMenuDelegation(
  container: HTMLElement,
  actions: ViewActionHandlers,
): void {
  tableContextActions.set(container, actions);
  if (container.dataset.contextMenuDelegated === "true") {
    return;
  }

  const handleContextMenu = (event: MouseEvent) => {
    const tableContainer = event.currentTarget as HTMLElement;
    const activeActions = tableContextActions.get(tableContainer);
    if (!activeActions) {
      return;
    }

    const targetInfo = findContextMenuTarget(event, tableContainer);
    if (!targetInfo) {
      return;
    }

    if (targetInfo.type === "player") {
      const target = playerContextTargets.get(targetInfo.element);
      if (!target) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const stoppedBySelf = isTradeStoppedBySelf(target);
      const stoppedByOther = isTradeStoppedByOther(target);
      const nextStopped = !stoppedBySelf;
      const disabled = target.isSelf;
      const actionLabel = nextStopped ? "Stop trading" : "Start trading";
      const tooltip = disabled
        ? "You cannot toggle trading with yourself."
        : !nextStopped && stoppedByOther
          ? "The other player is also stopping trade with you."
          : nextStopped && stoppedByOther
            ? "This player has already stopped trading with you."
            : undefined;
      showContextMenu({
        x: event.clientX,
        y: event.clientY,
        title: target.name,
        document: viewDocument,
        items: [
          {
            label: actionLabel,
            disabled,
            tooltip,
            onSelect: disabled
              ? undefined
              : () => activeActions.toggleTrading([target.id], nextStopped),
          },
        ],
      });
      return;
    }

    const target = groupContextTargets.get(targetInfo.element);
    if (!target) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const tradingPlayers = target.players.filter(
      (player) => !isTradeStoppedBySelf(player),
    );
    const stoppedPlayers = target.players.filter((player) =>
      isTradeStoppedBySelf(player),
    );
    const items: Array<{
      label: string;
      disabled?: boolean;
      tooltip?: string;
      onSelect?: () => void;
    }> = [];

    if (tradingPlayers.length > 0) {
      const ids = tradingPlayers.map((player) => player.id);
      items.push({
        label:
          tradingPlayers.length === target.players.length
            ? "Stop trading"
            : `Stop trading (${tradingPlayers.length})`,
        onSelect: () => activeActions.toggleTrading(ids, true),
      });
    }

    if (stoppedPlayers.length > 0) {
      const ids = stoppedPlayers.map((player) => player.id);
      items.push({
        label:
          stoppedPlayers.length === target.players.length
            ? "Start trading"
            : `Start trading (${stoppedPlayers.length})`,
        onSelect: () => activeActions.toggleTrading(ids, false),
      });
    }

    if (!items.length) {
      items.push({
        label: "Stop trading",
        disabled: true,
        tooltip: "No eligible players in this group.",
      });
    }

    showContextMenu({
      x: event.clientX,
      y: event.clientY,
      title: target.label,
      document: viewDocument,
      items,
    });
  };

  container.addEventListener("contextmenu", handleContextMenu);
  container.dataset.contextMenuDelegated = "true";
}

function appendPlayerRows(options: {
  player: PlayerRecord;
  indent: number;
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  tbody: HTMLElement;
  metricsCache: Map<string, Metrics>;
  actions: ViewActionHandlers;
  headers: ReadonlyArray<TableHeader>;
}) {
  const { player, indent, leaf, snapshot, tbody, metricsCache, actions } =
    options;
  const headers = options.headers;
  const metrics = getMetrics(player, snapshot, metricsCache);
  const rowKey = player.id;
  const isLobbyPlayer = Boolean(player.isLobbyPlayer);

  const tr = createElement("tr", "hover:bg-slate-800/50 transition-colors");
  tr.dataset.rowKey = rowKey;
  applyPersistentHover(tr, leaf, rowKey, "bg-slate-800/50");

  if (!isLobbyPlayer) {
    tr.dataset.contextTarget = "player";
    playerContextTargets.set(tr, {
      id: player.id,
      name: player.name,
      tradeStopped: player.tradeStopped ?? false,
      tradeStoppedBySelf: player.tradeStoppedBySelf,
      tradeStoppedByOther: player.tradeStoppedByOther,
      isSelf: player.isSelf ?? false,
    });
  }

  const labelHeader = headers.find((header) => header.key === "label");
  if (labelHeader) {
    const firstCell = createElement(
      "td",
      cellClassForColumn(labelHeader, "align-top"),
    );
    let subtitleClassName: string | undefined;
    const subtitle = (() => {
      if (isLobbyPlayer) {
        if (player.wasKickedFromLobby) {
          subtitleClassName =
            "text-[0.65rem] uppercase tracking-wide text-rose-400";
          return "KICKED";
        }
        const queue = snapshot.currentLobbyQueue;
        const hasPosition =
          typeof player.lobbyPosition === "number" &&
          Number.isFinite(player.lobbyPosition);
        const positionLabel = hasPosition
          ? `#${player.lobbyPosition}`
          : "Queued";
        if (!queue) {
          return `Queue ${positionLabel}`;
        }
        const totalSlots = queue.maxPlayers ?? queue.playerCount;
        const hasTotalSlots =
          typeof totalSlots === "number" &&
          Number.isFinite(totalSlots) &&
          totalSlots > 0;
        let label: string;
        if (hasTotalSlots && hasPosition) {
          label = `Queue ${positionLabel}/${totalSlots}`;
        } else if (hasTotalSlots) {
          label = `Queue ${totalSlots} players`;
        } else {
          label = `Queue ${positionLabel}`;
        }
        if (queue.playerTeams && player.team) {
          label = `${label} • ${player.team}`;
        }
        return label;
      }
      return (
        [player.clan, player.team].filter(Boolean).join(" • ") || undefined
      );
    })();
    const focusTarget = isLobbyPlayer ? undefined : player.position;
    firstCell.appendChild(
      createLabelBlock({
        label: player.name,
        subtitle,
        subtitleClassName,
        indent,
        focus: focusTarget,
      }),
    );
    tr.appendChild(firstCell);
  }

  appendMetricCells({
    row: tr,
    metrics,
    player,
    snapshot,
    headers,
  });
  tbody.appendChild(tr);

  if (!isLobbyPlayer) {
    tr.addEventListener("click", () => {
      actions.showPlayerDetails(player.id);
    });
  }
}

function appendGroupRows(options: {
  group: AggregatedRow;
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  tbody: HTMLElement;
  requestRender: RequestRender;
  groupType: "clan" | "team";
  metricsCache: Map<string, Metrics>;
  actions: ViewActionHandlers;
  headers: ReadonlyArray<TableHeader>;
}) {
  const {
    group,
    leaf,
    snapshot,
    tbody,
    requestRender,
    groupType,
    metricsCache,
    actions,
    headers,
  } = options;
  const groupKey = `${groupType}:${group.key}`;
  const expanded = leaf.expandedGroups.has(groupKey);

  const row = createElement(
    "tr",
    "bg-slate-900/70 hover:bg-slate-800/60 transition-colors font-semibold",
  );
  row.dataset.groupKey = groupKey;
  applyPersistentHover(row, leaf, groupKey, "bg-slate-800/60");

  const eligiblePlayers = group.players.filter(
    (player) => !player.isSelf && !player.isLobbyPlayer,
  );
  if (eligiblePlayers.length > 0) {
    row.dataset.contextTarget = "group";
    groupContextTargets.set(row, {
      label: group.label,
      players: eligiblePlayers,
    });
  }

  const labelHeader = headers.find((header) => header.key === "label");
  if (labelHeader) {
    const firstCell = createElement(
      "td",
      cellClassForColumn(labelHeader, "align-top", {
        variant: "expandable",
      }),
    );
    firstCell.appendChild(
      createLabelBlock({
        label: `${group.label} (${group.players.length})`,
        subtitle: groupType === "clan" ? "Clan summary" : "Team summary",
        indent: 0,
        expanded,
        toggleAttribute: "data-group-toggle",
        rowKey: groupKey,
        onToggle: (next) => {
          if (next) {
            leaf.expandedGroups.add(groupKey);
          } else {
            leaf.expandedGroups.delete(groupKey);
          }
          requestRender();
        },
        persistHover: leaf.hoveredGroupToggleKey === groupKey,
        onToggleHoverChange: (hovered) => {
          if (hovered) {
            leaf.hoveredGroupToggleKey = groupKey;
          } else if (leaf.hoveredGroupToggleKey === groupKey) {
            leaf.hoveredGroupToggleKey = undefined;
          }
        },
      }),
    );
    row.appendChild(firstCell);
  }

  appendAggregateCells({
    row,
    group,
    snapshot,
    headers,
    variant: "expandable",
  });
  tbody.appendChild(row);

  if (expanded) {
    for (const player of group.players) {
      appendPlayerRows({
        player,
        indent: 1,
        leaf,
        snapshot,
        tbody,
        metricsCache,
        actions,
        headers,
      });
    }
  }
}

function appendMetricCells(options: {
  row: HTMLTableRowElement;
  metrics: Metrics;
  player: PlayerRecord;
  snapshot: GameSnapshot;
  headers: ReadonlyArray<TableHeader>;
}): void {
  const { row, metrics, player, snapshot, headers } = options;
  const context: PlayerColumnValueContext = { player, metrics, snapshot };
  for (const column of headers) {
    if (column.key === "label") {
      continue;
    }
    const config = getPlayerColumnConfig(column.key);
    const className = [config?.cellClass, config?.getValueClass?.(context)]
      .filter(Boolean)
      .join(" ");
    const td = createElement("td", cellClassForColumn(column, className));
    td.textContent = config?.getValue?.(context) ?? "";
    row.appendChild(td);
  }
}

function appendAggregateCells(options: {
  row: HTMLTableRowElement;
  group: AggregatedRow;
  snapshot: GameSnapshot;
  headers: ReadonlyArray<TableHeader>;
  variant?: "default" | "expandable";
}): void {
  const { row, group, snapshot, headers } = options;
  const variant = options.variant ?? "default";
  const context: PlayerAggregateColumnContext = {
    group,
    metrics: group.metrics,
    totals: group.totals,
    snapshot,
  };
  for (const column of headers) {
    if (column.key === "label") {
      continue;
    }
    const config = getPlayerColumnConfig(column.key);
    const className = [
      config?.aggregateCellClass,
      config?.getAggregateValueClass?.(context),
    ]
      .filter(Boolean)
      .join(" ");
    const td = createElement(
      "td",
      cellClassForColumn(column, className, { variant }),
    );
    td.textContent = config?.getAggregateValue?.(context) ?? "";
    row.appendChild(td);
  }
}

function createLabelBlock(options: {
  label: string;
  subtitle?: string;
  subtitleClassName?: string;
  indent: number;
  expanded?: boolean;
  toggleAttribute?: string;
  rowKey?: string;
  onToggle?: (expanded: boolean) => void;
  focus?: TileSummary;
  persistHover?: boolean;
  onToggleHoverChange?: (hovered: boolean) => void;
}): HTMLElement {
  const {
    label,
    subtitle,
    subtitleClassName,
    indent,
    expanded,
    toggleAttribute,
    rowKey,
    onToggle,
    focus,
    persistHover,
    onToggleHoverChange,
  } = options;
  const container = createElement("div", "flex items-start gap-3");
  container.style.marginLeft = `${indent * 1.5}rem`;

  const labelBlock = createElement("div", "space-y-1");
  const labelEl = createPlayerNameElement(label, focus, {
    asBlock: true,
    className:
      "block font-semibold text-slate-100 transition-colors hover:text-sky-200",
    document: viewDocument,
  });
  labelBlock.appendChild(labelEl);
  if (subtitle) {
    const defaultSubtitleClass =
      "text-[0.65rem] uppercase tracking-wide text-slate-400";
    labelBlock.appendChild(
      createElement("div", subtitleClassName ?? defaultSubtitleClass, subtitle),
    );
  }

  if (toggleAttribute && rowKey && typeof expanded === "boolean" && onToggle) {
    const button = createElement(
      "button",
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-colors",
    );
    button.setAttribute(toggleAttribute, rowKey);
    button.type = "button";
    let currentExpanded = expanded;

    const updateToggleState = (nextExpanded: boolean) => {
      currentExpanded = nextExpanded;
      button.title = nextExpanded ? "Collapse" : "Expand";
      button.textContent = nextExpanded ? "−" : "+";
    };

    const setHoverState = (hovered: boolean) => {
      if (hovered) {
        button.classList.add("text-slate-50");
      } else {
        button.classList.remove("text-slate-50");
      }
      onToggleHoverChange?.(hovered);
    };

    updateToggleState(currentExpanded);

    if (persistHover) {
      setHoverState(true);
    }

    button.addEventListener("pointerenter", () => {
      setHoverState(true);
    });

    button.addEventListener("pointerleave", () => {
      requestAnimationFrame(() => {
        if (!button.isConnected) {
          return;
        }
        setHoverState(false);
      });
    });

    let pointerHandled = false;

    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      pointerHandled = true;
      const nextExpanded = !currentExpanded;
      updateToggleState(nextExpanded);
      onToggle(nextExpanded);
    });

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (pointerHandled) {
        pointerHandled = false;
        return;
      }
      const nextExpanded = !currentExpanded;
      updateToggleState(nextExpanded);
      onToggle(nextExpanded);
    });
    container.appendChild(button);
  }
  container.appendChild(labelBlock);
  return container;
}

function getMetrics(
  player: PlayerRecord,
  snapshot: GameSnapshot,
  cache: Map<string, Metrics>,
): Metrics {
  const cached = cache.get(player.id);
  if (cached) {
    return cached;
  }
  const metrics = computePlayerMetrics(player, snapshot);
  cache.set(player.id, metrics);
  return metrics;
}

function comparePlayers(options: {
  a: PlayerRecord;
  b: PlayerRecord;
  sortState: SortState;
  snapshot: GameSnapshot;
  metricsCache: Map<string, Metrics>;
}): number {
  const { a, b, sortState, snapshot, metricsCache } = options;
  const metricsA = getMetrics(a, snapshot, metricsCache);
  const metricsB = getMetrics(b, snapshot, metricsCache);
  const column = getPlayerColumnConfig(sortState.key);
  const contextA: PlayerColumnValueContext = {
    player: a,
    metrics: metricsA,
    snapshot,
  };
  const contextB: PlayerColumnValueContext = {
    player: b,
    metrics: metricsB,
    snapshot,
  };
  const valueA =
    column?.getSortValue?.(contextA) ??
    getDefaultPlayerSortValue(sortState.key, contextA);
  const valueB =
    column?.getSortValue?.(contextB) ??
    getDefaultPlayerSortValue(sortState.key, contextB);
  const result = compareSortValues(valueA, valueB, sortState.direction);
  if (result !== 0) {
    return result;
  }
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function compareAggregated(options: {
  a: AggregatedRow;
  b: AggregatedRow;
  sortState: SortState;
  snapshot?: GameSnapshot;
}): number {
  const { a, b, sortState, snapshot } = options;
  const column = getPlayerColumnConfig(sortState.key);
  const contextA: PlayerAggregateColumnContext = {
    group: a,
    metrics: a.metrics,
    totals: a.totals,
    snapshot,
  };
  const contextB: PlayerAggregateColumnContext = {
    group: b,
    metrics: b.metrics,
    totals: b.totals,
    snapshot,
  };
  const valueA =
    column?.getAggregateSortValue?.(contextA) ??
    getDefaultAggregateSortValue(sortState.key, contextA);
  const valueB =
    column?.getAggregateSortValue?.(contextB) ??
    getDefaultAggregateSortValue(sortState.key, contextB);
  const result = compareSortValues(valueA, valueB, sortState.direction);
  if (result !== 0) {
    return result;
  }
  return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
}

function getDefaultPlayerSortValue(
  key: SortKey,
  context: PlayerColumnValueContext,
): number | string {
  const { player, metrics } = context;
  switch (key) {
    case "tiles":
      return player.tiles;
    case "gold":
      return player.gold;
    case "troops":
      return player.troops;
    case "incoming":
      return metrics.incoming;
    case "outgoing":
      return metrics.outgoing;
    case "expanding":
      return metrics.expanding;
    case "alliances":
      return metrics.alliances;
    case "disconnected":
      return metrics.disconnected;
    case "traitor":
      return metrics.traitor;
    case "stable":
      return metrics.stable;
    case "waiting":
      return metrics.waiting;
    case "eliminated":
      return metrics.eliminated;
    default:
      return player.name.toLowerCase();
  }
}

function getDefaultAggregateSortValue(
  key: SortKey,
  context: PlayerAggregateColumnContext,
): number | string {
  const { group, metrics, totals } = context;
  switch (key) {
    case "tiles":
      return totals.tiles;
    case "gold":
      return totals.gold;
    case "troops":
      return totals.troops;
    case "incoming":
      return metrics.incoming;
    case "outgoing":
      return metrics.outgoing;
    case "expanding":
      return metrics.expanding;
    case "alliances":
      return metrics.alliances;
    case "disconnected":
      return metrics.disconnected;
    case "traitor":
      return metrics.traitor;
    case "stable":
      return metrics.stable;
    case "waiting":
      return metrics.waiting;
    case "eliminated":
      return metrics.eliminated;
    case "label":
      return group.label.toLowerCase();
    default:
      return group.label.toLowerCase();
  }
}

function groupPlayers(options: {
  players: PlayerRecord[];
  snapshot: GameSnapshot;
  metricsCache: Map<string, Metrics>;
  getKey: (player: PlayerRecord) => string | undefined;
  sortState: SortState;
}): AggregatedRow[] {
  const { players, snapshot, metricsCache, getKey, sortState } = options;
  const map = new Map<string, AggregatedRow>();

  for (const player of players) {
    const key = getKey(player) ?? "Unaffiliated";
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: key,
        players: [],
        metrics: {
          incoming: 0,
          outgoing: 0,
          expanding: 0,
          waiting: 0,
          eliminated: 0,
          disconnected: 0,
          traitor: 0,
          alliances: 0,
          stable: 0,
        },
        totals: {
          tiles: 0,
          gold: 0,
          troops: 0,
        },
      });
    }
    const entry = map.get(key)!;
    entry.players.push(player);
    const metrics = getMetrics(player, snapshot, metricsCache);
    entry.metrics.incoming += metrics.incoming;
    entry.metrics.outgoing += metrics.outgoing;
    entry.metrics.expanding += metrics.expanding;
    entry.metrics.waiting += metrics.waiting;
    entry.metrics.eliminated += metrics.eliminated;
    entry.metrics.disconnected += metrics.disconnected;
    entry.metrics.traitor += metrics.traitor;
    entry.metrics.alliances += metrics.alliances;
    entry.metrics.stable += metrics.stable;
    entry.totals.tiles += player.tiles;
    entry.totals.gold += player.gold;
    entry.totals.troops += player.troops;
  }

  const rows = Array.from(map.values());
  for (const row of rows) {
    row.players.sort((a, b) =>
      comparePlayers({
        a,
        b,
        sortState,
        snapshot,
        metricsCache,
      }),
    );
  }
  rows.sort((a, b) => compareAggregated({ a, b, sortState, snapshot }));
  return rows;
}

function computePlayerMetrics(player: PlayerRecord, snapshot: GameSnapshot) {
  const incoming = player.incomingAttacks.length;
  const outgoing = player.outgoingAttacks.length;
  const expanding = player.expansions;
  const waiting = player.waiting ? 1 : 0;
  const eliminated = player.eliminated ? 1 : 0;
  const disconnected = player.disconnected ? 1 : 0;
  const traitor = player.traitor ? 1 : 0;
  const alliances = getActiveAlliances(player, snapshot).length;
  const stable =
    incoming +
      outgoing +
      expanding +
      waiting +
      eliminated +
      disconnected +
      traitor ===
    0
      ? 1
      : 0;
  return {
    incoming,
    outgoing,
    expanding,
    waiting,
    eliminated,
    disconnected,
    traitor,
    alliances,
    stable,
  };
}

function getActiveAlliances(player: PlayerRecord, snapshot: GameSnapshot) {
  return player.alliances.filter((pact) => {
    const expiresAt = pact.startedAtMs + snapshot.allianceDurationMs;
    return expiresAt > snapshot.currentTimeMs;
  });
}

export { computePlayerMetrics, getActiveAlliances };

export function renderPlayersView(options: ViewRenderOptions): HTMLElement {
  return withViewDocument(options.ui.document, () => {
    const { leaf, snapshot, sortState, onSort, existingContainer, actions } =
      options;
    const metricsCache = new Map<string, Metrics>();
    const visibleHeaders = getVisibleHeaders(leaf, leaf.view, TABLE_HEADERS);
    const { container, tbody } = createTableShell({
      sortState,
      onSort,
      existingContainer,
      view: leaf.view,
      headers: visibleHeaders,
      document: viewDocument,
    });
    const players = [...snapshot.players].sort((a, b) =>
      comparePlayers({ a, b, sortState, snapshot, metricsCache }),
    );

    for (const player of players) {
      appendPlayerRows({
        player,
        indent: 0,
        leaf,
        snapshot,
        tbody,
        metricsCache,
        actions,
        headers: visibleHeaders,
      });
    }

    registerContextMenuDelegation(container, actions);
    return container;
  });
}

export function renderClanView(options: ViewRenderOptions): HTMLElement {
  return withViewDocument(options.ui.document, () => {
    const {
      leaf,
      snapshot,
      requestRender,
      sortState,
      onSort,
      existingContainer,
      actions,
    } = options;
    const metricsCache = new Map<string, Metrics>();
    const visibleHeaders = getVisibleHeaders(leaf, leaf.view, TABLE_HEADERS);
    const { container, tbody } = createTableShell({
      sortState,
      onSort,
      existingContainer,
      view: leaf.view,
      headers: visibleHeaders,
      document: viewDocument,
    });
    const groups = groupPlayers({
      players: snapshot.players,
      snapshot,
      metricsCache,
      getKey: (player) => extractClanTag(player.name),
      sortState,
    });

    for (const group of groups) {
      appendGroupRows({
        group,
        leaf,
        snapshot,
        tbody,
        requestRender,
        groupType: "clan",
        metricsCache,
        actions,
        headers: visibleHeaders,
      });
    }

    registerContextMenuDelegation(container, actions);
    return container;
  });
}

export function renderTeamView(options: ViewRenderOptions): HTMLElement {
  return withViewDocument(options.ui.document, () => {
    const {
      leaf,
      snapshot,
      requestRender,
      sortState,
      onSort,
      existingContainer,
      actions,
    } = options;
    const metricsCache = new Map<string, Metrics>();
    const visibleHeaders = getVisibleHeaders(leaf, leaf.view, TABLE_HEADERS);
    const { container, tbody } = createTableShell({
      sortState,
      onSort,
      existingContainer,
      view: leaf.view,
      headers: visibleHeaders,
      document: viewDocument,
    });
    const groups = groupPlayers({
      players: snapshot.players,
      snapshot,
      metricsCache,
      getKey: (player) => player.team ?? "Solo",
      sortState,
    });

    for (const group of groups) {
      appendGroupRows({
        group,
        leaf,
        snapshot,
        tbody,
        requestRender,
        groupType: "team",
        metricsCache,
        actions,
        headers: visibleHeaders,
      });
    }

    registerContextMenuDelegation(container, actions);
    return container;
  });
}
