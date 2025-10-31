import {
  ActionRunMode,
  GameSnapshot,
  PanelLeafNode,
  PlayerRecord,
  ShipRecord,
  SidebarActionDefinitionUpdate,
  SidebarActionSetting,
  SidebarActionSettingType,
  SidebarActionSettingValue,
  SidebarActionsState,
  SidebarLogEntry,
  SidebarLogLevel,
  SidebarLogToken,
  SidebarRunningActionStatus,
  SortDirection,
  SortKey,
  SortState,
  TileSummary,
  ViewType,
} from "./types";
import {
  createElement,
  extractClanTag,
  focusTile,
  formatCountdown,
  formatNumber,
  formatTimestamp,
  formatTroopCount,
  showContextMenu,
} from "./utils";

type RequestRender = () => void;

type Metrics = ReturnType<typeof computePlayerMetrics>;

export interface ViewLifecycleCallbacks {
  registerCleanup?: (cleanup: () => void) => void;
}

export interface ViewActionHandlers {
  toggleTrading: (playerIds: string[], stopped: boolean) => void;
  showPlayerDetails: (playerId: string) => void;
  focusPlayer?: (playerId: string) => void;
  focusTeam?: (teamId: string) => void;
  focusClan?: (clanId: string) => void;
  createAction?: () => void;
  selectAction?: (actionId?: string) => void;
  setActionEnabled?: (actionId: string, enabled: boolean) => void;
  saveAction?: (
    actionId: string,
    update: SidebarActionDefinitionUpdate,
  ) => void;
  deleteAction?: (actionId: string) => void;
  startAction?: (actionId: string) => void;
  selectRunningAction?: (runningId?: string) => void;
  stopRunningAction?: (runningId: string) => void;
  updateRunningActionSetting?: (
    runningId: string,
    settingId: string,
    value: SidebarActionSettingValue,
  ) => void;
  setRunningActionInterval?: (runId: string, ticks: number) => void;
  clearLogs?: () => void;
  setOverlayEnabled?: (overlayId: string, enabled: boolean) => void;
}

const DEFAULT_ACTIONS: ViewActionHandlers = {
  toggleTrading: () => undefined,
  showPlayerDetails: () => undefined,
  focusPlayer: () => undefined,
  focusTeam: () => undefined,
  focusClan: () => undefined,
  createAction: () => undefined,
  selectAction: () => undefined,
  setActionEnabled: () => undefined,
  saveAction: () => undefined,
  deleteAction: () => undefined,
  startAction: () => undefined,
  selectRunningAction: () => undefined,
  stopRunningAction: () => undefined,
  updateRunningActionSetting: () => undefined,
  setRunningActionInterval: () => undefined,
  clearLogs: () => undefined,
  setOverlayEnabled: () => undefined,
};

const EMPTY_ACTIONS_STATE: SidebarActionsState = {
  revision: 0,
  runningRevision: 0,
  actions: [],
  running: [],
};

interface TradeStateCarrier {
  tradeStopped?: boolean;
  tradeStoppedBySelf?: boolean;
  tradeStoppedByOther?: boolean;
}

function isTradeStoppedBySelf(carrier: TradeStateCarrier): boolean {
  if (typeof carrier.tradeStoppedBySelf === "boolean") {
    return carrier.tradeStoppedBySelf;
  }
  if (carrier.tradeStopped !== true) {
    return false;
  }
  if (carrier.tradeStoppedByOther === true) {
    return false;
  }
  return true;
}

function isTradeStoppedByOther(carrier: TradeStateCarrier): boolean {
  if (typeof carrier.tradeStoppedByOther === "boolean") {
    return carrier.tradeStoppedByOther;
  }
  if (carrier.tradeStopped !== true) {
    return false;
  }
  if (carrier.tradeStoppedBySelf === true) {
    return false;
  }
  return true;
}

interface ActionEditorSettingState {
  id: string;
  key: string;
  label: string;
  type: SidebarActionSettingType;
  value: SidebarActionSettingValue;
}

interface ActionEditorFormState {
  id: string;
  name: string;
  runMode: ActionRunMode;
  enabled: boolean;
  description: string;
  runIntervalTicks: number;
  code: string;
  settings: ActionEditorSettingState[];
}

type ActionEditorContainer = HTMLElement & {
  formState?: ActionEditorFormState;
};

let editorSettingIdCounter = 0;

function nextEditorSettingId(): string {
  editorSettingIdCounter += 1;
  return `editor-setting-${editorSettingIdCounter}`;
}

function getActionsState(snapshot: GameSnapshot): SidebarActionsState {
  return snapshot.sidebarActions ?? EMPTY_ACTIONS_STATE;
}

function getRunModeLabel(mode: ActionRunMode): string {
  switch (mode) {
    case "once":
      return "Run once";
    case "continuous":
      return "Continuous";
    case "event":
      return "Event-driven";
    default:
      return mode;
  }
}

function describeRunMode(mode: ActionRunMode): string {
  switch (mode) {
    case "once":
      return "Runs a single time and removes itself from the running list.";
    case "continuous":
      return "Keeps running until you stop it manually.";
    case "event":
      return "Listens for subscribed game events and reacts when they fire.";
    default:
      return mode;
  }
}

const SELECTED_ROW_INDICATOR_BOX_SHADOW =
  "inset 0.25rem 0 0 0 rgba(125, 211, 252, 0.65)";

const TABLE_CELL_BASE_CLASS =
  "border-b border-r border-slate-800 border-slate-900/80 px-3 py-2 last:border-r-0";
const TABLE_CELL_EXPANDABLE_CLASS =
  "border-b border-r border-slate-800/60 px-3 py-2 last:border-r-0";

function applyRowSelectionIndicator(
  row: HTMLElement,
  isSelected: boolean,
): void {
  row.style.boxShadow = isSelected ? SELECTED_ROW_INDICATOR_BOX_SHADOW : "";
}

function formatRunStatus(status: SidebarRunningActionStatus): string {
  switch (status) {
    case "running":
      return "Running";
    case "completed":
      return "Completed";
    case "stopped":
      return "Stopped";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

function defaultValueForType(
  type: SidebarActionSettingType,
): SidebarActionSettingValue {
  switch (type) {
    case "number":
      return 0;
    case "toggle":
      return false;
    default:
      return "";
  }
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

interface TableHeader<TKey extends string = SortKey> {
  key: TKey;
  label: string;
  align: "left" | "center" | "right";
  sortable?: boolean;
  sortKey?: SortKey;
  title?: string;
  hideable?: boolean;
}

const TABLE_HEADERS: ReadonlyArray<TableHeader> = [
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

const SHIP_HEADERS: ReadonlyArray<TableHeader> = [
  { key: "label", label: "Ship", align: "left", hideable: false },
  { key: "owner", label: "Owner", align: "left" },
  { key: "type", label: "Type", align: "left" },
  { key: "troops", label: "Troops", align: "right" },
  { key: "origin", label: "Origin", align: "left" },
  { key: "current", label: "Current", align: "left" },
  { key: "destination", label: "Destination", align: "left" },
  { key: "status", label: "Status", align: "left" },
];

const DEFAULT_SORT_STATE: SortState = { key: "tiles", direction: "desc" };

function ensureColumnVisibilityState<TKey extends string>(
  leaf: PanelLeafNode,
  view: ViewType,
  headers: ReadonlyArray<TableHeader<TKey>>,
): Record<string, boolean> {
  const current = leaf.columnVisibility[view] ?? {};
  const normalized: Record<string, boolean> = {};
  for (const header of headers) {
    const key = header.key as string;
    if (header.hideable === false) {
      normalized[key] = true;
      continue;
    }
    normalized[key] = current[key] === false ? false : true;
  }
  leaf.columnVisibility[view] = normalized;

  const hideableHeaders = headers.filter((header) => header.hideable !== false);
  if (hideableHeaders.length > 0) {
    const visibleCount = hideableHeaders.filter((header) => {
      const key = header.key as string;
      return normalized[key] !== false;
    }).length;
    if (visibleCount === 0) {
      const first = hideableHeaders[0];
      normalized[first.key as string] = true;
    }
  }

  return normalized;
}

function getVisibleHeaders<TKey extends string>(
  leaf: PanelLeafNode,
  view: ViewType,
  headers: ReadonlyArray<TableHeader<TKey>>,
): TableHeader<TKey>[] {
  const visibility = ensureColumnVisibilityState(leaf, view, headers);
  return headers.filter((header) => visibility[header.key as string] !== false);
}

function getColumnVisibilitySignature<TKey extends string>(
  headers: ReadonlyArray<TableHeader<TKey>>,
): string {
  return headers.map((header) => header.key).join("|");
}

export function buildViewContent(
  leaf: PanelLeafNode,
  snapshot: GameSnapshot,
  requestRender: RequestRender,
  existingContainer?: HTMLElement,
  lifecycle?: ViewLifecycleCallbacks,
  actions?: ViewActionHandlers,
): HTMLElement {
  const view = leaf.view;
  const sortState = ensureSortState(leaf, view);
  const viewActions = actions ?? DEFAULT_ACTIONS;
  const handleSort = (key: SortKey) => {
    const current = ensureSortState(leaf, view);
    let direction: SortDirection;
    if (current.key === key) {
      direction = current.direction === "asc" ? "desc" : "asc";
    } else {
      direction = getDefaultDirection(key);
    }
    leaf.sortStates[view] = { key, direction };
    requestRender();
  };

  switch (leaf.view) {
    case "players":
      return renderPlayersView({
        leaf,
        snapshot,
        requestRender,
        sortState,
        onSort: handleSort,
        existingContainer,
        actions: viewActions,
        lifecycle,
      });
    case "clanmates":
      return renderClanView({
        leaf,
        snapshot,
        requestRender,
        sortState,
        onSort: handleSort,
        existingContainer,
        actions: viewActions,
        lifecycle,
      });
    case "teams":
      return renderTeamView({
        leaf,
        snapshot,
        requestRender,
        sortState,
        onSort: handleSort,
        existingContainer,
        actions: viewActions,
        lifecycle,
      });
    case "ships":
      return renderShipView({
        leaf,
        snapshot,
        requestRender,
        sortState,
        onSort: handleSort,
        existingContainer,
        actions: viewActions,
        lifecycle,
      });
    case "player":
      return renderPlayerPanelView({
        leaf,
        snapshot,
        requestRender,
        sortState,
        onSort: handleSort,
        existingContainer,
        actions: viewActions,
        lifecycle,
      });
    case "actions":
      return renderActionsDirectoryView({
        leaf,
        snapshot,
        sortState,
        onSort: handleSort,
        existingContainer,
        actions: viewActions,
      });
    case "actionEditor":
      return renderActionEditorView({
        leaf,
        snapshot,
        existingContainer,
        lifecycle,
        actions: viewActions,
      });
    case "runningActions":
      return renderRunningActionsView({
        leaf,
        snapshot,
        sortState,
        onSort: handleSort,
        existingContainer,
        actions: viewActions,
      });
    case "runningAction":
      return renderRunningActionDetailView({
        leaf,
        snapshot,
        existingContainer,
        lifecycle,
        actions: viewActions,
      });
    case "logs":
      return renderLogView({
        leaf,
        snapshot,
        sortState,
        onSort: handleSort,
        existingContainer,
        actions: viewActions,
      });
    case "overlays":
      return renderOverlayView({
        leaf,
        snapshot,
        sortState,
        onSort: handleSort,
        existingContainer,
        actions: viewActions,
      });
    default:
      return createElement("div", "text-slate-200 text-sm", "Unsupported view");
  }
}

function ensureSortState(leaf: PanelLeafNode, view: ViewType): SortState {
  const state = leaf.sortStates[view];
  if (state) {
    return state;
  }
  const fallback = { ...DEFAULT_SORT_STATE };
  leaf.sortStates[view] = fallback;
  return fallback;
}

function getDefaultDirection(key: SortKey): SortDirection {
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

interface ViewRenderOptions {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  requestRender: RequestRender;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions: ViewActionHandlers;
  lifecycle?: ViewLifecycleCallbacks;
}

interface LogViewRenderOptions {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions?: ViewActionHandlers;
}

function renderPlayersView(options: ViewRenderOptions): HTMLElement {
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
}

function renderClanView(options: ViewRenderOptions): HTMLElement {
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
}

function renderTeamView(options: ViewRenderOptions): HTMLElement {
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
}

function renderShipView(options: ViewRenderOptions): HTMLElement {
  const { leaf, snapshot, sortState, onSort, existingContainer } = options;
  const visibleHeaders = getVisibleHeaders(leaf, leaf.view, SHIP_HEADERS);
  const { container, tbody } = createTableShell({
    sortState,
    onSort,
    existingContainer,
    view: leaf.view,
    headers: visibleHeaders,
  });
  const playerLookup = new Map(
    snapshot.players.map((player) => [player.id, player]),
  );
  const ships = [...snapshot.ships].sort((a, b) =>
    compareShips({ a, b, sortState }),
  );

  for (const ship of ships) {
    const rowKey = `ship:${ship.id}`;
    const row = createElement("tr", "hover:bg-slate-800/50 transition-colors");
    applyPersistentHover(row, leaf, rowKey, "bg-slate-800/50");
    row.dataset.rowKey = rowKey;

    for (const column of visibleHeaders) {
      const td = createElement(
        "td",
        cellClassForColumn(column, getShipExtraCellClass(column.key)),
      );
      switch (column.key) {
        case "origin":
          td.appendChild(createCoordinateButton(ship.origin));
          break;
        case "current":
          td.appendChild(createCoordinateButton(ship.current));
          break;
        case "destination":
          td.appendChild(createCoordinateButton(ship.destination));
          break;
        case "owner": {
          const ownerRecord = playerLookup.get(ship.ownerId);
          td.appendChild(
            createPlayerNameElement(ship.ownerName, ownerRecord?.position, {
              className:
                "inline-flex max-w-full items-center gap-1 text-left text-slate-200 hover:text-sky-200",
            }),
          );
          break;
        }
        default:
          td.textContent = getShipCellValue(column.key, ship);
          break;
      }
      row.appendChild(td);
    }

    tbody.appendChild(row);
  }

  return container;
}

function renderPlayerPanelView(options: ViewRenderOptions): HTMLElement {
  const { leaf, snapshot, existingContainer } = options;
  const containerClass =
    "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
  const canReuse =
    !!existingContainer &&
    existingContainer.dataset.sidebarRole === "player-panel" &&
    existingContainer.dataset.sidebarView === leaf.view;
  const container = canReuse
    ? existingContainer
    : createElement("div", containerClass);
  container.className = containerClass;
  container.dataset.sidebarRole = "player-panel";
  container.dataset.sidebarView = leaf.view;

  const content = createElement(
    "div",
    "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100",
  );

  const playerId = leaf.selectedPlayerId;
  if (!playerId) {
    content.appendChild(
      createElement(
        "p",
        "text-slate-400 italic",
        "Select a player from any table to view their details.",
      ),
    );
  } else {
    const player = snapshot.players.find((entry) => entry.id === playerId);
    if (!player) {
      content.appendChild(
        createElement(
          "p",
          "text-slate-400 italic",
          "That player is no longer available in the latest snapshot.",
        ),
      );
    } else {
      const header = createElement("div", "space-y-3");
      const title = createElement(
        "div",
        "flex flex-wrap items-baseline justify-between gap-3",
      );
      const name = createPlayerNameElement(player.name, player.position, {
        asBlock: true,
        className:
          "text-lg font-semibold text-slate-100 transition-colors hover:text-sky-200",
      });
      title.appendChild(name);

      const meta = [player.clan, player.team].filter(Boolean).join(" • ");
      if (meta) {
        title.appendChild(
          createElement(
            "div",
            "text-xs uppercase tracking-wide text-slate-400",
            meta,
          ),
        );
      }
      header.appendChild(title);

      const summary = createElement(
        "div",
        "grid gap-3 sm:grid-cols-3 text-[0.75rem]",
      );
      summary.appendChild(
        createSummaryStat("Tiles", formatNumber(player.tiles)),
      );
      summary.appendChild(createSummaryStat("Gold", formatNumber(player.gold)));
      summary.appendChild(
        createSummaryStat("Troops", formatTroopCount(player.troops)),
      );
      header.appendChild(summary);

      const playerStoppedBySelf = isTradeStoppedBySelf(player);
      const playerStoppedByOther = isTradeStoppedByOther(player);
      if (playerStoppedBySelf || playerStoppedByOther) {
        let tradeMessage = "Trading is currently stopped with this player.";
        if (playerStoppedBySelf && playerStoppedByOther) {
          tradeMessage =
            "Trading is currently stopped by both you and this player.";
        } else if (playerStoppedBySelf) {
          tradeMessage = "You have stopped trading with this player.";
        } else {
          tradeMessage = "This player has stopped trading with you.";
        }
        header.appendChild(
          createElement(
            "p",
            "text-[0.7rem] font-semibold uppercase tracking-wide text-amber-300",
            tradeMessage,
          ),
        );
      }

      content.appendChild(header);
      content.appendChild(renderPlayerDetails(player, snapshot));
    }
  }

  container.replaceChildren(content);
  return container;
}

function renderActionsDirectoryView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions: ViewActionHandlers;
}): HTMLElement {
  const { leaf, snapshot, existingContainer, actions, sortState, onSort } =
    options;
  const state = getActionsState(snapshot);
  const signature = `${state.revision}:${state.selectedActionId ?? ""}:${state.running.length}`;
  const sortSignature = `${sortState.key}:${sortState.direction}`;
  const isDirectoryContainer =
    !!existingContainer &&
    existingContainer.dataset.sidebarRole === "actions-directory";
  const visibleHeaders = getVisibleHeaders(
    leaf,
    leaf.view,
    ACTIONS_TABLE_HEADERS,
  );
  const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
  if (
    isDirectoryContainer &&
    existingContainer.dataset.signature === signature &&
    existingContainer.dataset.sortState === sortSignature &&
    existingContainer.dataset.columnVisibilitySignature === visibilitySignature
  ) {
    existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
    return existingContainer;
  }

  const { container, tbody } = createTableShell({
    sortState,
    onSort,
    existingContainer: isDirectoryContainer ? existingContainer : undefined,
    view: leaf.view,
    headers: visibleHeaders,
    role: "actions-directory",
  });
  container.dataset.signature = signature;
  container.dataset.sortState = sortSignature;
  container.dataset.columnVisibilitySignature = visibilitySignature;

  const runningLookup = new Set(state.running.map((run) => run.actionId));
  const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
  const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
  const getStatusRank = (action: SidebarActionsState["actions"][number]) => {
    if (runningLookup.has(action.id)) {
      return 0;
    }
    return action.enabled ? 1 : 2;
  };
  const getEnabledRank = (action: SidebarActionsState["actions"][number]) =>
    action.enabled ? 0 : 1;

  if (state.actions.length === 0) {
    const row = createElement("tr", "hover:bg-transparent");
    const cell = createElement(
      "td",
      `${cellBaseClass} text-center text-slate-400`,
      "No actions yet. Create a new action to get started.",
    );
    cell.colSpan = Math.max(1, visibleHeaders.length);
    row.appendChild(cell);
    tbody.appendChild(row);
  } else {
    const sortedActions = [...state.actions];
    if (sortState.key === "label") {
      sortedActions.sort((a, b) =>
        compareSortValues(
          a.name.toLowerCase(),
          b.name.toLowerCase(),
          sortState.direction,
        ),
      );
    } else if (sortState.key === "status") {
      sortedActions.sort((a, b) => {
        const cmp = compareSortValues(
          getStatusRank(a),
          getStatusRank(b),
          sortState.direction,
        );
        if (cmp !== 0) {
          return cmp;
        }
        return compareSortValues(
          a.name.toLowerCase(),
          b.name.toLowerCase(),
          "asc",
        );
      });
    } else if (sortState.key === "enabled") {
      sortedActions.sort((a, b) => {
        const cmp = compareSortValues(
          getEnabledRank(a),
          getEnabledRank(b),
          sortState.direction,
        );
        if (cmp !== 0) {
          return cmp;
        }
        return compareSortValues(
          a.name.toLowerCase(),
          b.name.toLowerCase(),
          "asc",
        );
      });
    }

    for (const action of sortedActions) {
      const isSelected = state.selectedActionId === action.id;
      const isRunning = runningLookup.has(action.id);
      const row = createElement(
        "tr",
        "cursor-pointer transition-colors hover:bg-slate-800/40",
      );
      applyRowSelectionIndicator(row, isSelected);
      row.dataset.actionId = action.id;
      row.addEventListener("click", () => {
        actions.selectAction?.(action.id);
      });

      const nameCell = createElement("td", `${cellBaseClass} text-left`);
      const nameLine = createElement(
        "div",
        "flex flex-wrap items-center gap-2",
      );
      const nameLabel = createPlayerNameElement(action.name, undefined, {
        className:
          "font-semibold text-slate-100 transition-colors hover:text-sky-200",
      });
      nameLine.appendChild(nameLabel);
      nameCell.appendChild(nameLine);

      const statusCell = createElement("td", `${cellBaseClass} text-left`);
      const statusBadges = createElement(
        "div",
        "flex flex-wrap items-center gap-2",
      );
      const updateStatusBadges = (enabled: boolean) => {
        statusBadges.replaceChildren();
        if (isRunning) {
          statusBadges.appendChild(createActionStatusBadge("Running"));
        }
        if (!enabled) {
          statusBadges.appendChild(createActionStatusBadge("Disabled"));
        } else if (!isRunning) {
          statusBadges.appendChild(createActionStatusBadge("Enabled"));
        }
      };
      let currentEnabled = action.enabled;
      updateStatusBadges(currentEnabled);
      statusCell.appendChild(statusBadges);
      if (visibleKeys.has("status")) {
        row.appendChild(statusCell);
      }

      const toggleCell = createElement("td", `${cellBaseClass} text-center`);
      const toggleWrapper = createElement("div", "flex justify-center");
      const toggleButton = createElement(
        "button",
        "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60",
      ) as HTMLButtonElement;
      toggleButton.type = "button";
      toggleButton.setAttribute("role", "switch");
      const srToggleLabel = createElement("span", "sr-only", "Toggle action");
      const toggleKnob = createElement(
        "span",
        "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out",
      );
      toggleButton.appendChild(srToggleLabel);
      toggleButton.appendChild(toggleKnob);

      const runButton = createElement(
        "button",
        "rounded-md border border-sky-500/50 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/20",
        "Run",
      ) as HTMLButtonElement;
      runButton.type = "button";
      const updateRunButton = (enabled: boolean) => {
        if (enabled) {
          runButton.disabled = false;
          runButton.classList.remove(
            "cursor-not-allowed",
            "opacity-40",
            "pointer-events-none",
            "hover:bg-sky-500/10",
          );
          runButton.classList.add("hover:bg-sky-500/20");
          runButton.title = "";
        } else {
          runButton.disabled = true;
          runButton.classList.add(
            "cursor-not-allowed",
            "opacity-40",
            "pointer-events-none",
            "hover:bg-sky-500/10",
          );
          runButton.classList.remove("hover:bg-sky-500/20");
          runButton.title = "Enable this action to run it.";
        }
      };
      updateRunButton(currentEnabled);
      runButton.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!currentEnabled) {
          return;
        }
        actions.startAction?.(action.id);
      });

      const editButton = createElement(
        "button",
        "rounded-md border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-sky-200",
        "Edit",
      );
      editButton.type = "button";
      editButton.addEventListener("click", (event) => {
        event.stopPropagation();
        actions.selectAction?.(action.id);
      });

      const updateToggleAppearance = (enabled: boolean) => {
        toggleButton.setAttribute("aria-checked", enabled ? "true" : "false");
        toggleButton.classList.toggle("border-emerald-400/60", enabled);
        toggleButton.classList.toggle("bg-emerald-500/40", enabled);
        toggleButton.classList.toggle("hover:bg-emerald-500/50", enabled);
        toggleButton.classList.toggle("border-slate-700", !enabled);
        toggleButton.classList.toggle("bg-slate-800/70", !enabled);
        toggleButton.classList.toggle("hover:bg-slate-700/80", !enabled);
        toggleKnob.classList.toggle("bg-emerald-100", enabled);
        toggleKnob.classList.toggle("bg-slate-300", !enabled);
        toggleKnob.style.transform = enabled
          ? "translateX(1.5rem)"
          : "translateX(0)";
        toggleButton.title = enabled
          ? "Disable this action"
          : "Enable this action";
      };
      updateToggleAppearance(currentEnabled);
      toggleButton.addEventListener("click", (event) => {
        event.stopPropagation();
        currentEnabled = !currentEnabled;
        updateToggleAppearance(currentEnabled);
        updateRunButton(currentEnabled);
        updateStatusBadges(currentEnabled);
        actions.setActionEnabled?.(action.id, currentEnabled);
      });
      toggleWrapper.appendChild(toggleButton);
      toggleCell.appendChild(toggleWrapper);
      if (visibleKeys.has("toggle")) {
        row.appendChild(toggleCell);
      }

      const controlsCell = createElement("td", `${cellBaseClass} text-right`);
      const controls = createElement("div", "flex justify-end gap-2");
      controls.appendChild(runButton);
      controls.appendChild(editButton);
      controlsCell.appendChild(controls);
      if (visibleKeys.has("controls")) {
        row.appendChild(controlsCell);
      }

      if (visibleKeys.has("name")) {
        row.insertBefore(nameCell, row.firstChild);
      }

      tbody.appendChild(row);
    }
  }
  return container;
}

function renderActionEditorView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  existingContainer?: HTMLElement;
  lifecycle?: ViewLifecycleCallbacks;
  actions: ViewActionHandlers;
}): HTMLElement {
  const { leaf, snapshot, existingContainer, actions } = options;
  const state = getActionsState(snapshot);
  const selectedAction = state.actions.find(
    (action) => action.id === state.selectedActionId,
  );
  const signature = selectedAction
    ? `${state.revision}:${selectedAction.id}:${selectedAction.updatedAtMs}`
    : `${state.revision}:none`;
  const prior = existingContainer as ActionEditorContainer | undefined;
  const isEditorContainer =
    !!prior && prior.dataset.sidebarRole === "action-editor";
  const container = isEditorContainer
    ? prior
    : (createElement(
        "div",
        "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm",
      ) as ActionEditorContainer);
  container.className =
    "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
  container.dataset.sidebarRole = "action-editor";
  container.dataset.sidebarView = leaf.view;
  if (container.dataset.signature === signature) {
    return container;
  }
  container.dataset.signature = signature;
  container.formState = undefined;

  if (!selectedAction) {
    container.replaceChildren(
      createElement(
        "div",
        "flex h-full items-center justify-center p-6 text-center text-sm text-slate-400",
        state.actions.length === 0
          ? "Create an action to begin editing its script."
          : "Select an action from the Actions view to edit its script and settings.",
      ),
    );
    return container;
  }

  const formState: ActionEditorFormState = {
    id: selectedAction.id,
    name: selectedAction.name,
    runMode: selectedAction.runMode,
    enabled: selectedAction.enabled,
    description: selectedAction.description ?? "",
    runIntervalTicks: selectedAction.runIntervalTicks ?? 1,
    code: selectedAction.code,
    settings: selectedAction.settings.map((setting) => ({
      id: setting.id ?? nextEditorSettingId(),
      key: setting.key,
      label: setting.label,
      type: setting.type,
      value: setting.value ?? defaultValueForType(setting.type),
    })),
  };
  container.formState = formState;

  const layout = createElement(
    "div",
    "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100",
  );

  const header = createElement(
    "div",
    "flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-3",
  );
  const initialTitle = formState.name.trim();
  const titlePreview = createElement(
    "div",
    "text-lg font-semibold text-slate-100",
    initialTitle === "" ? "Untitled action" : formState.name,
  );
  const descriptionPreview = createElement(
    "div",
    "text-sm text-slate-400",
    formState.description.trim() === ""
      ? "Add a description..."
      : formState.description,
  );
  if (formState.description.trim() === "") {
    descriptionPreview.classList.add("italic", "text-slate-500");
  }
  const headerText = createElement("div", "flex flex-col gap-1");
  headerText.appendChild(titlePreview);
  headerText.appendChild(descriptionPreview);
  header.appendChild(headerText);

  const headerMeta = createElement(
    "div",
    "flex flex-col items-end gap-2 text-right text-[0.7rem] text-slate-400",
  );
  const enabledToggleWrapper = createElement("div", "flex items-center");
  const enabledToggle = createElement(
    "button",
    "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60",
  ) as HTMLButtonElement;
  enabledToggle.type = "button";
  enabledToggle.setAttribute("role", "switch");
  const srEnabledLabel = createElement("span", "sr-only", "Toggle action");
  const enabledToggleKnob = createElement(
    "span",
    "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out",
  );
  enabledToggle.appendChild(srEnabledLabel);
  enabledToggle.appendChild(enabledToggleKnob);
  const updateToggleAppearance = (enabled: boolean) => {
    enabledToggle.setAttribute("aria-checked", enabled ? "true" : "false");
    enabledToggle.classList.toggle("border-emerald-400/60", enabled);
    enabledToggle.classList.toggle("bg-emerald-500/40", enabled);
    enabledToggle.classList.toggle("hover:bg-emerald-500/50", enabled);
    enabledToggle.classList.toggle("border-slate-700", !enabled);
    enabledToggle.classList.toggle("bg-slate-800/70", !enabled);
    enabledToggle.classList.toggle("hover:bg-slate-700/80", !enabled);
    enabledToggleKnob.classList.toggle("bg-emerald-100", enabled);
    enabledToggleKnob.classList.toggle("bg-slate-300", !enabled);
    enabledToggleKnob.style.transform = enabled
      ? "translateX(1.5rem)"
      : "translateX(0)";
    enabledToggle.title = enabled
      ? "Disable this action"
      : "Enable this action";
  };
  updateToggleAppearance(formState.enabled);
  enabledToggleWrapper.appendChild(enabledToggle);
  headerMeta.appendChild(enabledToggleWrapper);
  const headerMode = createElement(
    "div",
    "",
    describeRunMode(formState.runMode),
  );
  headerMeta.appendChild(headerMode);
  headerMeta.appendChild(
    createElement(
      "div",
      "text-[0.65rem] uppercase tracking-wide text-slate-500",
      `Last updated ${formatTimestamp(selectedAction.updatedAtMs)}`,
    ),
  );
  header.appendChild(headerMeta);
  layout.appendChild(header);

  const nameField = createElement("label", "flex flex-col gap-1");
  nameField.appendChild(
    createElement(
      "span",
      "text-xs uppercase tracking-wide text-slate-400",
      "Name",
    ),
  );
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className =
    "rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
  nameInput.value = formState.name;
  nameInput.addEventListener("input", () => {
    formState.name = nameInput.value;
    const trimmed = nameInput.value.trim();
    titlePreview.textContent =
      trimmed === "" ? "Untitled action" : nameInput.value;
  });
  nameField.appendChild(nameInput);
  layout.appendChild(nameField);

  const descriptionField = createElement("label", "flex flex-col gap-1");
  descriptionField.appendChild(
    createElement(
      "span",
      "text-xs uppercase tracking-wide text-slate-400",
      "Description",
    ),
  );
  const descriptionInput = document.createElement("textarea");
  descriptionInput.className =
    "min-h-[72px] w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
  descriptionInput.value = formState.description;
  descriptionInput.addEventListener("input", () => {
    formState.description = descriptionInput.value;
    const trimmed = descriptionInput.value.trim();
    if (trimmed === "") {
      descriptionPreview.textContent = "Add a description...";
      descriptionPreview.classList.add("italic", "text-slate-500");
    } else {
      descriptionPreview.textContent = descriptionInput.value;
      descriptionPreview.classList.remove("italic", "text-slate-500");
    }
  });
  descriptionField.appendChild(descriptionInput);
  layout.appendChild(descriptionField);

  const runConfigRow = createElement("div", "flex flex-wrap gap-4");

  const modeField = createElement("label", "flex flex-col gap-1");
  modeField.appendChild(
    createElement(
      "span",
      "text-xs uppercase tracking-wide text-slate-400",
      "Run mode",
    ),
  );
  const modeSelect = document.createElement("select");
  modeSelect.className =
    "w-48 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
  for (const option of [
    { value: "continuous", label: "Continuous" },
    { value: "once", label: "Run once" },
    { value: "event", label: "Event-driven" },
  ]) {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    modeSelect.appendChild(opt);
  }
  modeSelect.value = formState.runMode;
  modeField.appendChild(modeSelect);
  runConfigRow.appendChild(modeField);

  const intervalField = createElement("label", "flex flex-col gap-1");
  intervalField.appendChild(
    createElement(
      "span",
      "text-xs uppercase tracking-wide text-slate-400",
      "Run every (ticks)",
    ),
  );
  const intervalInput = document.createElement("input");
  intervalInput.type = "number";
  intervalInput.min = "1";
  intervalInput.className =
    "w-40 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
  intervalInput.value = String(formState.runIntervalTicks);
  intervalInput.addEventListener("change", () => {
    const numeric = Number(intervalInput.value);
    const normalized =
      Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
    intervalInput.value = String(normalized);
    formState.runIntervalTicks = normalized;
  });
  intervalField.appendChild(intervalInput);
  if (formState.runMode !== "continuous") {
    intervalField.classList.add("hidden");
  }
  runConfigRow.appendChild(intervalField);

  modeSelect.addEventListener("change", () => {
    formState.runMode = modeSelect.value as ActionRunMode;
    headerMode.textContent = describeRunMode(formState.runMode);
    intervalField.classList.toggle(
      "hidden",
      formState.runMode !== "continuous",
    );
  });

  layout.appendChild(runConfigRow);

  const codeField = createElement("div", "flex flex-col gap-2");
  codeField.appendChild(
    createElement(
      "span",
      "text-xs uppercase tracking-wide text-slate-400",
      "Script",
    ),
  );
  const codeArea = document.createElement("textarea");
  codeArea.className =
    "min-h-[220px] w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
  codeArea.value = formState.code;
  codeArea.spellcheck = false;
  codeArea.addEventListener("input", () => {
    formState.code = codeArea.value;
  });
  codeField.appendChild(codeArea);
  layout.appendChild(codeField);

  const settingsSection = createElement("div", "flex flex-col gap-3");
  const settingsHeader = createElement(
    "div",
    "flex items-center justify-between gap-2",
  );
  settingsHeader.appendChild(
    createElement(
      "span",
      "text-xs uppercase tracking-wide text-slate-400",
      "Settings",
    ),
  );
  const settingsList = createElement("div", "flex flex-col gap-3");
  const removeSetting = (settingId: string) => {
    const index = formState.settings.findIndex(
      (entry) => entry.id === settingId,
    );
    if (index !== -1) {
      formState.settings.splice(index, 1);
    }
  };
  for (const setting of formState.settings) {
    settingsList.appendChild(
      createActionSettingEditorCard(formState, setting, removeSetting),
    );
  }
  const addSettingButton = createElement(
    "button",
    "rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-sky-200",
    "Add setting",
  );
  addSettingButton.type = "button";
  addSettingButton.addEventListener("click", () => {
    const newSetting: ActionEditorSettingState = {
      id: nextEditorSettingId(),
      key: "",
      label: "",
      type: "text",
      value: "",
    };
    formState.settings.push(newSetting);
    settingsList.appendChild(
      createActionSettingEditorCard(formState, newSetting, removeSetting),
    );
  });
  settingsHeader.appendChild(addSettingButton);
  settingsSection.appendChild(settingsHeader);
  if (formState.settings.length === 0) {
    settingsSection.appendChild(
      createElement(
        "p",
        "text-[0.75rem] text-slate-400",
        "Add settings to expose configurable values that can be adjusted while the action runs.",
      ),
    );
  }
  settingsSection.appendChild(settingsList);
  layout.appendChild(settingsSection);

  const footer = createElement(
    "div",
    "flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70 pt-4",
  );
  const leftControls = createElement("div", "flex items-center gap-2");
  const runButton = createElement(
    "button",
    "rounded-md border border-sky-500/60 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/20",
    "Run action",
  ) as HTMLButtonElement;
  runButton.type = "button";
  const applyRunButtonState = (enabled: boolean) => {
    if (enabled) {
      runButton.disabled = false;
      runButton.classList.remove(
        "cursor-not-allowed",
        "opacity-40",
        "pointer-events-none",
        "hover:bg-sky-500/10",
      );
      runButton.classList.add("hover:bg-sky-500/20");
      runButton.title = "";
    } else {
      runButton.disabled = true;
      runButton.classList.add(
        "cursor-not-allowed",
        "opacity-40",
        "pointer-events-none",
        "hover:bg-sky-500/10",
      );
      runButton.classList.remove("hover:bg-sky-500/20");
      runButton.title = "Enable this action to run it.";
    }
  };
  applyRunButtonState(formState.enabled);
  runButton.addEventListener("click", () => {
    if (!formState.enabled) {
      return;
    }
    actions.startAction?.(selectedAction.id);
  });
  leftControls.appendChild(runButton);
  enabledToggle.addEventListener("click", () => {
    const nextEnabled = !formState.enabled;
    formState.enabled = nextEnabled;
    updateToggleAppearance(nextEnabled);
    applyRunButtonState(nextEnabled);
    actions.setActionEnabled?.(selectedAction.id, nextEnabled);
  });
  footer.appendChild(leftControls);

  const rightControls = createElement("div", "flex items-center gap-2");
  const deleteButton = createElement(
    "button",
    "rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20",
    "Delete",
  );
  deleteButton.type = "button";
  deleteButton.addEventListener("click", () => {
    actions.deleteAction?.(selectedAction.id);
  });
  const saveButton = createElement(
    "button",
    "rounded-md border border-sky-500/60 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/30",
    "Save changes",
  );
  saveButton.type = "button";
  saveButton.addEventListener("click", () => {
    const update: SidebarActionDefinitionUpdate = {
      name: formState.name,
      code: formState.code,
      runMode: formState.runMode,
      enabled: formState.enabled,
      description: formState.description,
      runIntervalTicks: formState.runIntervalTicks,
      settings: formState.settings.map((setting) => ({
        id: setting.id,
        key: setting.key,
        label: setting.label,
        type: setting.type,
        value:
          setting.type === "number"
            ? Number(setting.value)
            : setting.type === "toggle"
              ? Boolean(setting.value)
              : String(setting.value ?? ""),
      })),
    };
    actions.saveAction?.(selectedAction.id, update);
  });
  rightControls.appendChild(deleteButton);
  rightControls.appendChild(saveButton);
  footer.appendChild(rightControls);
  layout.appendChild(footer);

  container.replaceChildren(layout);
  return container;
}

function renderRunningActionsView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions: ViewActionHandlers;
}): HTMLElement {
  const { leaf, snapshot, existingContainer, actions, sortState, onSort } =
    options;
  const state = getActionsState(snapshot);
  const signature = `${state.runningRevision}:${state.selectedRunningActionId ?? ""}:${state.running.length}`;
  const sortSignature = `${sortState.key}:${sortState.direction}`;
  const isContainer =
    !!existingContainer &&
    existingContainer.dataset.sidebarRole === "running-actions";
  const visibleHeaders = getVisibleHeaders(
    leaf,
    leaf.view,
    RUNNING_ACTIONS_TABLE_HEADERS,
  );
  const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
  if (
    isContainer &&
    existingContainer.dataset.signature === signature &&
    existingContainer.dataset.sortState === sortSignature &&
    existingContainer.dataset.columnVisibilitySignature === visibilitySignature
  ) {
    existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
    return existingContainer;
  }

  const { container, tbody } = createTableShell({
    sortState,
    onSort,
    existingContainer: isContainer ? existingContainer : undefined,
    view: leaf.view,
    headers: visibleHeaders,
    role: "running-actions",
  });
  container.dataset.signature = signature;
  container.dataset.sortState = sortSignature;
  container.dataset.columnVisibilitySignature = visibilitySignature;

  const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
  const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
  const getStatusRank = (run: SidebarActionsState["running"][number]) => {
    const rank: Record<SidebarRunningActionStatus, number> = {
      running: 0,
      completed: 1,
      stopped: 2,
      failed: 3,
    };
    return rank[run.status] ?? 4;
  };

  if (state.running.length === 0) {
    const row = createElement("tr", "hover:bg-transparent");
    const cell = createElement(
      "td",
      `${cellBaseClass} text-center text-slate-400`,
      "No actions are currently running.",
    );
    cell.colSpan = Math.max(1, visibleHeaders.length);
    row.appendChild(cell);
    tbody.appendChild(row);
    return container;
  }

  const runs = [...state.running];
  if (sortState.key === "label") {
    runs.sort((a, b) =>
      compareSortValues(
        a.name.toLowerCase(),
        b.name.toLowerCase(),
        sortState.direction,
      ),
    );
  } else if (sortState.key === "status") {
    runs.sort((a, b) => {
      const cmp = compareSortValues(
        getStatusRank(a),
        getStatusRank(b),
        sortState.direction,
      );
      if (cmp !== 0) {
        return cmp;
      }
      return compareSortValues(
        a.name.toLowerCase(),
        b.name.toLowerCase(),
        "asc",
      );
    });
  }

  for (const run of runs) {
    const isSelected = state.selectedRunningActionId === run.id;
    const row = createElement(
      "tr",
      "cursor-pointer transition-colors hover:bg-slate-800/40",
    );
    applyRowSelectionIndicator(row, isSelected);
    row.dataset.runningActionId = run.id;
    row.addEventListener("click", () => {
      actions.selectRunningAction?.(run.id);
    });

    const nameCell = createElement("td", `${cellBaseClass} text-left`);
    const nameLine = createElement("div", "flex flex-wrap items-center gap-2");
    const nameLabel = createPlayerNameElement(run.name, undefined, {
      className:
        "font-semibold text-slate-100 transition-colors hover:text-sky-200",
    });
    nameLine.appendChild(nameLabel);
    nameCell.appendChild(nameLine);
    const statusCell = createElement("td", `${cellBaseClass} text-left`);
    statusCell.appendChild(createRunStatusBadge(run.status));
    const modeCell = createElement(
      "td",
      `${cellBaseClass} text-[0.75rem] uppercase tracking-wide text-slate-400`,
      getRunModeLabel(run.runMode),
    );
    const startedCell = createElement(
      "td",
      `${cellBaseClass} text-[0.75rem] text-slate-300`,
      formatTimestamp(run.startedAtMs),
    );

    const controlsCell = createElement("td", `${cellBaseClass} text-right`);
    const stopButton = createElement(
      "button",
      "rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20",
      "Stop",
    );
    stopButton.type = "button";
    stopButton.addEventListener("click", (event) => {
      event.stopPropagation();
      actions.stopRunningAction?.(run.id);
    });
    if (run.status !== "running") {
      stopButton.disabled = true;
      stopButton.classList.add("cursor-not-allowed", "opacity-50");
    }
    controlsCell.appendChild(stopButton);

    if (visibleKeys.has("name")) {
      row.appendChild(nameCell);
    }
    if (visibleKeys.has("status")) {
      row.appendChild(statusCell);
    }
    if (visibleKeys.has("mode")) {
      row.appendChild(modeCell);
    }
    if (visibleKeys.has("started")) {
      row.appendChild(startedCell);
    }
    if (visibleKeys.has("controls")) {
      row.appendChild(controlsCell);
    }

    tbody.appendChild(row);
  }

  return container;
}

function renderRunningActionDetailView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  existingContainer?: HTMLElement;
  lifecycle?: ViewLifecycleCallbacks;
  actions: ViewActionHandlers;
}): HTMLElement {
  const { leaf, snapshot, existingContainer, actions } = options;
  const state = getActionsState(snapshot);
  const selectedRun = state.running.find(
    (run) => run.id === state.selectedRunningActionId,
  );
  const signature = selectedRun
    ? `${state.runningRevision}:${selectedRun.id}:${selectedRun.lastUpdatedMs}`
    : `${state.runningRevision}:none`;
  const isContainer =
    !!existingContainer &&
    existingContainer.dataset.sidebarRole === "running-action";
  const container = isContainer
    ? existingContainer
    : createElement(
        "div",
        "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm",
      );
  container.className =
    "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
  container.dataset.sidebarRole = "running-action";
  container.dataset.sidebarView = leaf.view;
  if (container.dataset.signature === signature) {
    return container;
  }
  container.dataset.signature = signature;

  if (!selectedRun) {
    container.replaceChildren(
      createElement(
        "div",
        "flex h-full items-center justify-center p-6 text-center text-sm text-slate-400",
        state.running.length === 0
          ? "No actions are currently running."
          : "Select a running action to adjust its settings.",
      ),
    );
    return container;
  }

  const layout = createElement(
    "div",
    "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100",
  );

  const header = createElement(
    "div",
    "flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-3",
  );
  const headerText = createElement("div", "flex flex-col gap-1");
  const titleLine = createElement(
    "div",
    "flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-100",
  );
  titleLine.appendChild(createElement("span", "", selectedRun.name));
  titleLine.appendChild(createRunStatusBadge(selectedRun.status));
  headerText.appendChild(titleLine);
  const trimmedDescription = selectedRun.description?.trim() ?? "";
  if (trimmedDescription !== "") {
    headerText.appendChild(
      createElement("div", "text-sm text-slate-400", trimmedDescription),
    );
  }
  headerText.appendChild(
    createElement(
      "div",
      "text-[0.7rem] text-slate-400",
      describeRunMode(selectedRun.runMode),
    ),
  );
  header.appendChild(headerText);
  const stopButton = createElement(
    "button",
    "rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20",
    "Stop action",
  );
  stopButton.type = "button";
  stopButton.addEventListener("click", () => {
    actions.stopRunningAction?.(selectedRun.id);
  });
  if (selectedRun.status !== "running") {
    stopButton.disabled = true;
    stopButton.classList.add("cursor-not-allowed", "opacity-50");
  }
  header.appendChild(stopButton);
  layout.appendChild(header);

  const meta = createElement("div", "grid gap-3 text-[0.75rem] sm:grid-cols-3");
  meta.appendChild(
    createSummaryStat("Status", formatRunStatus(selectedRun.status)),
  );
  meta.appendChild(
    createSummaryStat("Started", formatTimestamp(selectedRun.startedAtMs)),
  );
  meta.appendChild(
    createSummaryStat(
      "Last update",
      formatTimestamp(selectedRun.lastUpdatedMs),
    ),
  );
  layout.appendChild(meta);

  if (selectedRun.runMode === "continuous") {
    const intervalField = createElement(
      "label",
      "flex w-full max-w-xs flex-col gap-1",
    );
    intervalField.appendChild(
      createElement(
        "span",
        "text-xs uppercase tracking-wide text-slate-400",
        "Run every (ticks)",
      ),
    );
    const intervalInput = document.createElement("input");
    intervalInput.type = "number";
    intervalInput.min = "1";
    intervalInput.className =
      "w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
    intervalInput.value = String(selectedRun.runIntervalTicks ?? 1);
    intervalInput.addEventListener("change", () => {
      const numeric = Number(intervalInput.value);
      const normalized =
        Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
      intervalInput.value = String(normalized);
      if (normalized === selectedRun.runIntervalTicks) {
        return;
      }
      actions.setRunningActionInterval?.(selectedRun.id, normalized);
    });
    intervalField.appendChild(intervalInput);
    layout.appendChild(intervalField);
  }

  const settingsSection = createElement("div", "flex flex-col gap-3");
  settingsSection.appendChild(
    createElement(
      "span",
      "text-xs uppercase tracking-wide text-slate-400",
      "Runtime settings",
    ),
  );
  const settingsList = createElement("div", "flex flex-col gap-3");
  if (selectedRun.settings.length === 0) {
    settingsList.appendChild(
      createElement(
        "p",
        "text-[0.75rem] text-slate-400",
        "This action does not expose any runtime settings.",
      ),
    );
  } else {
    for (const setting of selectedRun.settings) {
      settingsList.appendChild(
        createRunningSettingField(selectedRun.id, setting, actions),
      );
    }
  }
  settingsSection.appendChild(settingsList);
  layout.appendChild(settingsSection);

  container.replaceChildren(layout);
  return container;
}

const LOG_TABLE_HEADERS: ReadonlyArray<TableHeader<string>> = [
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

const ACTIONS_TABLE_HEADERS: ReadonlyArray<TableHeader<string>> = [
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

const RUNNING_ACTIONS_TABLE_HEADERS: ReadonlyArray<TableHeader<string>> = [
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

const OVERLAY_TABLE_HEADERS: ReadonlyArray<TableHeader<string>> = [
  {
    key: "name",
    label: "Overlay",
    align: "left",
    sortKey: "label",
    hideable: false,
  },
  { key: "status", label: "Status", align: "right", sortKey: "status" },
];

function getTableHeadersForView(
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

function renderOverlayView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions: ViewActionHandlers;
}): HTMLElement {
  const { leaf, snapshot, existingContainer, actions, sortState, onSort } =
    options;
  const overlays = snapshot.sidebarOverlays ?? [];
  const revision = snapshot.sidebarOverlayRevision ?? 0;
  const signature = `${revision}:${overlays
    .map((overlay) => `${overlay.id}:${overlay.enabled ? 1 : 0}`)
    .join("|")}`;
  const sortSignature = `${sortState.key}:${sortState.direction}`;
  const isOverlayContainer =
    !!existingContainer &&
    existingContainer.dataset.sidebarRole === "overlays-directory";
  const visibleHeaders = getVisibleHeaders(
    leaf,
    leaf.view,
    OVERLAY_TABLE_HEADERS,
  );
  const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
  if (
    isOverlayContainer &&
    existingContainer.dataset.signature === signature &&
    existingContainer.dataset.sortState === sortSignature &&
    existingContainer.dataset.columnVisibilitySignature === visibilitySignature
  ) {
    existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
    return existingContainer;
  }

  const { container, tbody } = createTableShell({
    sortState,
    onSort,
    existingContainer: isOverlayContainer ? existingContainer : undefined,
    view: leaf.view,
    headers: visibleHeaders,
    role: "overlays-directory",
  });
  container.dataset.signature = signature;
  container.dataset.sortState = sortSignature;
  container.dataset.columnVisibilitySignature = visibilitySignature;

  const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
  const visibleKeys = new Set(visibleHeaders.map((header) => header.key));

  if (overlays.length === 0) {
    const row = createElement("tr", "hover:bg-transparent");
    const cell = createElement(
      "td",
      `${cellBaseClass} text-center text-slate-400`,
      "No overlays available.",
    );
    cell.colSpan = Math.max(1, visibleHeaders.length);
    row.appendChild(cell);
    tbody.appendChild(row);
    return container;
  }

  const sortedOverlays = [...overlays];
  if (sortState.key === "label") {
    sortedOverlays.sort((a, b) =>
      compareSortValues(
        a.label.toLowerCase(),
        b.label.toLowerCase(),
        sortState.direction,
      ),
    );
  } else if (sortState.key === "status") {
    sortedOverlays.sort((a, b) =>
      compareSortValues(
        a.enabled ? 1 : 0,
        b.enabled ? 1 : 0,
        sortState.direction,
      ),
    );
  }

  for (const overlay of sortedOverlays) {
    const row = createElement("tr", "transition-colors hover:bg-slate-800/40");

    const nameCell = createElement("td", `${cellBaseClass} text-left`);
    const nameStack = createElement("div", "flex flex-col gap-1");
    const nameLabel = createElement(
      "span",
      "font-semibold text-slate-100",
      overlay.label,
    );
    nameStack.appendChild(nameLabel);
    nameCell.appendChild(nameStack);

    const statusCell = createElement("td", `${cellBaseClass} text-right`);
    const toggleWrapper = createElement("div", "flex justify-end");
    const toggleButton = createElement(
      "button",
      "relative inline-flex h-6 w-12 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60",
    ) as HTMLButtonElement;
    toggleButton.type = "button";
    toggleButton.setAttribute("role", "switch");
    const srToggleLabel = createElement("span", "sr-only", "Toggle overlay");
    const toggleKnob = createElement(
      "span",
      "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out",
    );
    toggleButton.appendChild(srToggleLabel);
    toggleButton.appendChild(toggleKnob);

    const updateToggleAppearance = (enabled: boolean) => {
      toggleButton.setAttribute("aria-checked", enabled ? "true" : "false");
      toggleButton.classList.toggle("border-emerald-400/60", enabled);
      toggleButton.classList.toggle("bg-emerald-500/40", enabled);
      toggleButton.classList.toggle("hover:bg-emerald-500/50", enabled);
      toggleButton.classList.toggle("border-slate-700", !enabled);
      toggleButton.classList.toggle("bg-slate-800/70", !enabled);
      toggleButton.classList.toggle("hover:bg-slate-700/80", !enabled);
      toggleKnob.classList.toggle("bg-emerald-100", enabled);
      toggleKnob.classList.toggle("bg-slate-300", !enabled);
      toggleKnob.style.transform = enabled
        ? "translateX(1.5rem)"
        : "translateX(0)";
      toggleButton.title = enabled ? "Disable overlay" : "Enable overlay";
    };

    let currentEnabled = overlay.enabled;
    updateToggleAppearance(currentEnabled);

    toggleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      currentEnabled = !currentEnabled;
      updateToggleAppearance(currentEnabled);
      actions.setOverlayEnabled?.(overlay.id, currentEnabled);
    });

    toggleWrapper.appendChild(toggleButton);
    statusCell.appendChild(toggleWrapper);
    if (visibleKeys.has("status")) {
      row.appendChild(statusCell);
    }
    if (visibleKeys.has("name")) {
      row.insertBefore(nameCell, row.firstChild);
    }
    tbody.appendChild(row);
  }

  return container;
}

function renderLogView(options: LogViewRenderOptions): HTMLElement {
  const { leaf, snapshot, existingContainer, actions, sortState, onSort } =
    options;
  const logActions = actions ?? DEFAULT_ACTIONS;
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
    !!existingContainer && existingContainer.dataset.sidebarRole === "log-view";
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
    if (
      previousRevision === revision &&
      previousSortState === sortSignature &&
      previousVisibility === visibilitySignature
    ) {
      existingContainer.dataset.logRevision = String(revision);
      existingContainer.dataset.sortState = sortSignature;
      existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
      return existingContainer;
    }
  }
  const { container, tbody } = createTableShell({
    sortState: activeSortState,
    onSort,
    existingContainer: isLogContainer ? existingContainer : undefined,
    view: leaf.view,
    headers: visibleHeaders,
    role: "log-view",
  });
  container.dataset.logFollowState = followEnabled ? "following" : "paused";
  container.dataset.logStickToBottom = followEnabled ? "true" : "false";
  container.dataset.logRevision = String(revision);
  container.dataset.sortState = sortSignature;
  container.dataset.columnVisibilitySignature = visibilitySignature;

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
  row.dataset.sidebarRole = "log-entry";
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

type MentionToken = Extract<
  SidebarLogToken,
  { type: "player" | "team" | "clan" }
>;

function createLogMentionPill(
  token: MentionToken,
  actions: ViewActionHandlers,
): HTMLElement {
  const button = createElement(
    "button",
    "inline-flex max-w-full items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/40 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-200 transition-colors hover:border-sky-500/70 hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60",
  );
  button.type = "button";
  button.dataset.sidebarRole = "log-mention";
  button.dataset.mentionType = token.type;
  button.dataset.mentionId = token.id;

  if (token.color) {
    button.style.borderColor = token.color;
  }

  if (token.color) {
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

interface ColumnVisibilityMenuOptions {
  leaf: PanelLeafNode;
  anchor: HTMLElement;
  onChange?: () => void;
}

let columnMenuElement: HTMLDivElement | null = null;
let columnMenuCleanup: (() => void) | null = null;

function ensureColumnMenuElement(): HTMLDivElement {
  if (!columnMenuElement) {
    columnMenuElement = createElement("div") as HTMLDivElement;
    columnMenuElement.dataset.sidebarRole = "column-visibility-menu";
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
    const key = header.key as string;
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
          const candidateKey = candidate.key as string;
          return visibility[candidateKey] !== false;
        }).length;
        if (remainingVisible === 0) {
          checkbox.checked = true;
          return;
        }
      }
      visibility[key] = nextVisible;
      leaf.columnVisibility[leaf.view] = { ...visibility };
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

function createActionSettingEditorCard(
  formState: ActionEditorFormState,
  setting: ActionEditorSettingState,
  onRemove: (settingId: string) => void,
): HTMLElement {
  const card = createElement(
    "div",
    "rounded-md border border-slate-800/70 bg-slate-900/70 p-3",
  );
  const header = createElement("div", "flex flex-wrap items-center gap-3");

  const labelField = createElement(
    "label",
    "flex min-w-[160px] flex-1 flex-col gap-1",
  );
  labelField.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      "Label",
    ),
  );
  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.className =
    "rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
  labelInput.value = setting.label;
  labelInput.addEventListener("input", () => {
    setting.label = labelInput.value;
  });
  labelField.appendChild(labelInput);
  header.appendChild(labelField);

  const keyField = createElement("label", "flex w-36 flex-col gap-1");
  keyField.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      "Key",
    ),
  );
  const keyInput = document.createElement("input");
  keyInput.type = "text";
  keyInput.className =
    "rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
  keyInput.value = setting.key;
  keyInput.addEventListener("input", () => {
    setting.key = keyInput.value;
  });
  keyField.appendChild(keyInput);
  header.appendChild(keyField);

  const typeField = createElement("label", "flex w-32 flex-col gap-1");
  typeField.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      "Type",
    ),
  );
  const typeSelect = document.createElement("select");
  typeSelect.className =
    "rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
  for (const option of [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "toggle", label: "Toggle" },
  ]) {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    typeSelect.appendChild(opt);
  }
  typeSelect.value = setting.type;
  typeField.appendChild(typeSelect);
  header.appendChild(typeField);

  const removeButton = createElement(
    "button",
    "rounded-md border border-slate-700 bg-transparent px-2 py-1 text-xs text-slate-300 transition-colors hover:border-rose-500/60 hover:text-rose-300",
    "Remove",
  );
  removeButton.type = "button";
  removeButton.addEventListener("click", (event) => {
    event.preventDefault();
    onRemove(setting.id);
    card.remove();
  });
  header.appendChild(removeButton);
  card.appendChild(header);

  const valueWrapper = createElement("div", "mt-3 flex flex-col gap-1");
  valueWrapper.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      "Value",
    ),
  );
  const valueContainer = createElement("div", "flex items-center gap-2");
  const updateValue = (value: SidebarActionSettingValue) => {
    setting.value = value;
  };
  let control = createSettingValueInput(setting, updateValue);
  valueContainer.appendChild(control);
  valueWrapper.appendChild(valueContainer);
  card.appendChild(valueWrapper);

  typeSelect.addEventListener("change", () => {
    const nextType = typeSelect.value as SidebarActionSettingType;
    setting.type = nextType;
    setting.value = defaultValueForType(nextType);
    control = createSettingValueInput(setting, updateValue);
    valueContainer.replaceChildren(control);
  });

  return card;
}

function createSettingValueInput(
  setting: ActionEditorSettingState,
  onChange: (value: SidebarActionSettingValue) => void,
): HTMLElement {
  switch (setting.type) {
    case "number": {
      const input = document.createElement("input");
      input.type = "number";
      input.className =
        "w-40 rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      input.value = setting.value !== undefined ? String(setting.value) : "0";
      input.addEventListener("change", () => {
        const numeric = Number(input.value);
        onChange(Number.isFinite(numeric) ? numeric : 0);
      });
      return input;
    }
    case "toggle": {
      const wrapper = createElement(
        "label",
        "flex items-center gap-2 text-xs text-slate-200",
      );
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className =
        "h-4 w-4 rounded border border-slate-600 bg-slate-900 text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500";
      toggle.checked = Boolean(setting.value);
      toggle.addEventListener("change", () => {
        onChange(toggle.checked);
      });
      wrapper.appendChild(toggle);
      wrapper.appendChild(createElement("span", "", "Enabled"));
      return wrapper;
    }
    default: {
      const input = document.createElement("input");
      input.type = "text";
      input.className =
        "w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      input.value = setting.value !== undefined ? String(setting.value) : "";
      input.addEventListener("input", () => {
        onChange(input.value);
      });
      return input;
    }
  }
}

function createRunningSettingField(
  runId: string,
  setting: SidebarActionSetting,
  actions: ViewActionHandlers,
): HTMLElement {
  const field = createElement(
    "div",
    "rounded-md border border-slate-800/70 bg-slate-900/70 p-3",
  );
  const header = createElement(
    "div",
    "flex items-center justify-between gap-2",
  );
  const rawLabel = setting.label?.trim() ?? "";
  const rawKey = setting.key?.trim() ?? "";
  const displayLabel =
    rawLabel !== "" ? rawLabel : rawKey !== "" ? rawKey : "Setting";
  header.appendChild(
    createElement("div", "text-sm font-medium text-slate-100", displayLabel),
  );
  header.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      setting.type,
    ),
  );
  field.appendChild(header);
  if (setting.key) {
    field.appendChild(
      createElement(
        "div",
        "text-[0.65rem] text-slate-500",
        `Key: ${setting.key}`,
      ),
    );
  }

  const controlContainer = createElement("div", "mt-3");
  switch (setting.type) {
    case "number": {
      const input = document.createElement("input");
      input.type = "number";
      input.className =
        "w-40 rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      input.value = setting.value !== undefined ? String(setting.value) : "0";
      input.addEventListener("change", () => {
        const numeric = Number(input.value);
        actions.updateRunningActionSetting?.(
          runId,
          setting.id,
          Number.isFinite(numeric) ? numeric : 0,
        );
      });
      controlContainer.appendChild(input);
      break;
    }
    case "toggle": {
      const wrapper = createElement(
        "label",
        "flex items-center gap-2 text-xs text-slate-200",
      );
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.className =
        "h-4 w-4 rounded border border-slate-600 bg-slate-900 text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500";
      toggle.checked = Boolean(setting.value);
      toggle.addEventListener("change", () => {
        actions.updateRunningActionSetting?.(runId, setting.id, toggle.checked);
      });
      wrapper.appendChild(toggle);
      wrapper.appendChild(createElement("span", "", "Enabled"));
      controlContainer.appendChild(wrapper);
      break;
    }
    default: {
      const input = document.createElement("input");
      input.type = "text";
      input.className =
        "w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      input.value = setting.value !== undefined ? String(setting.value) : "";
      input.addEventListener("change", () => {
        actions.updateRunningActionSetting?.(runId, setting.id, input.value);
      });
      controlContainer.appendChild(input);
      break;
    }
  }

  field.appendChild(controlContainer);
  return field;
}

function createTableShell<TKey extends string>(options: {
  sortState?: SortState;
  onSort?: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  view: ViewType;
  headers: ReadonlyArray<TableHeader<TKey>>;
  role?: string;
}): { container: HTMLElement; tbody: HTMLElement } {
  const { sortState, onSort, existingContainer, view, headers, role } = options;
  const containerClass =
    "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
  const tableClass = "min-w-full border-collapse text-xs text-slate-100";
  const targetRole = role ?? "table-container";
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

function getShipExtraCellClass(key: SortKey): string {
  switch (key) {
    case "label":
      return "font-semibold text-slate-100";
    case "owner":
      return "text-slate-200";
    case "type":
      return "text-[0.75rem] text-slate-300";
    case "troops":
      return "font-mono text-[0.75rem] text-slate-200";
    case "status":
      return "capitalize text-slate-200";
    case "origin":
    case "current":
    case "destination":
      return "text-[0.75rem] text-slate-300";
    default:
      return "text-slate-300";
  }
}

function attachImmediateTileFocus(
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

function createCoordinateButton(summary?: TileSummary): HTMLElement {
  if (!summary) {
    return createElement("span", "text-slate-500", "–");
  }
  const label = formatTileSummary(summary);
  const button = createElement(
    "button",
    "inline-flex max-w-full items-center rounded-sm px-0 text-left text-sky-300 transition-colors hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60",
    label,
  );
  button.type = "button";
  button.title = `Focus on ${label}`;
  attachImmediateTileFocus(button, () => {
    focusTile(summary);
  });
  return button;
}

function createPlayerNameElement(
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

function getShipCellValue(key: SortKey, ship: ShipRecord): string {
  switch (key) {
    case "label":
      return `${ship.type} #${ship.id}`;
    case "owner":
      return ship.ownerName;
    case "type":
      return ship.type;
    case "troops":
      return formatTroopCount(ship.troops);
    case "origin":
      return formatTileSummary(ship.origin);
    case "current":
      return formatTileSummary(ship.current);
    case "destination":
      return formatTileSummary(ship.destination);
    case "status":
      return deriveShipStatus(ship);
    default:
      return "";
  }
}

function compareShips(options: {
  a: ShipRecord;
  b: ShipRecord;
  sortState: SortState;
}): number {
  const { a, b, sortState } = options;
  const valueA = getShipSortValue(a, sortState.key);
  const valueB = getShipSortValue(b, sortState.key);
  const result = compareSortValues(valueA, valueB, sortState.direction);
  if (result !== 0) {
    return result;
  }
  const ownerCompare = a.ownerName.localeCompare(b.ownerName, undefined, {
    sensitivity: "base",
  });
  if (ownerCompare !== 0) {
    return ownerCompare;
  }
  return a.id.localeCompare(b.id, undefined, { sensitivity: "base" });
}

function getShipSortValue(ship: ShipRecord, key: SortKey): number | string {
  switch (key) {
    case "label":
      return `${ship.type.toLowerCase()}-${ship.id}`;
    case "owner":
      return ship.ownerName.toLowerCase();
    case "type":
      return ship.type.toLowerCase();
    case "troops":
      return ship.troops;
    case "origin":
      return tileSortValue(ship.origin);
    case "current":
      return tileSortValue(ship.current);
    case "destination":
      return tileSortValue(ship.destination);
    case "status":
      return deriveShipStatus(ship).toLowerCase();
    default:
      return 0;
  }
}

function tileSortValue(summary?: TileSummary): string {
  if (!summary) {
    return "";
  }
  const x = summary.x.toString().padStart(5, "0");
  const y = summary.y.toString().padStart(5, "0");
  const owner = summary.ownerName?.toLowerCase() ?? "";
  return `${x}:${y}:${owner}`;
}

function formatTileSummary(summary?: TileSummary): string {
  if (!summary) {
    return "–";
  }
  const coords = `${summary.x}, ${summary.y}`;
  return summary.ownerName ? `${coords} (${summary.ownerName})` : coords;
}

function deriveShipStatus(ship: ShipRecord): string {
  if (ship.retreating) {
    return "Retreating";
  }
  if (ship.reachedTarget) {
    return "Arrived";
  }
  if (ship.type === "Transport") {
    return "En Route";
  }
  if (!ship.destination) {
    return ship.current ? "Idle" : "Unknown";
  }
  if (
    ship.current &&
    ship.destination &&
    ship.current.ref === ship.destination.ref
  ) {
    return "Stationed";
  }
  return "En route";
}

interface PlayerContextTarget {
  id: string;
  name: string;
  tradeStopped: boolean;
  tradeStoppedBySelf?: boolean;
  tradeStoppedByOther?: boolean;
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

    if (target.players.length === 0) {
      showContextMenu({
        x: event.clientX,
        y: event.clientY,
        title: target.label,
        items: [
          {
            label: "Stop trading",
            disabled: true,
            tooltip: "No eligible players in this group.",
          },
        ],
      });
      return;
    }

    const tradingPlayers = target.players.filter(
      (player) => !isTradeStoppedBySelf(player),
    );
    const stoppedPlayers = target.players.filter((player) =>
      isTradeStoppedBySelf(player),
    );

    const buildIdList = (players: PlayerRecord[]) =>
      Array.from(new Set(players.map((player) => player.id)));

    const items = [] as {
      label: string;
      onSelect?: () => void;
      disabled?: boolean;
      tooltip?: string;
    }[];

    if (tradingPlayers.length > 0) {
      const ids = buildIdList(tradingPlayers);
      items.push({
        label:
          tradingPlayers.length === target.players.length
            ? "Stop trading"
            : `Stop trading (${tradingPlayers.length})`,
        onSelect: () => activeActions.toggleTrading(ids, true),
      });
    }

    if (stoppedPlayers.length > 0) {
      const ids = buildIdList(stoppedPlayers);
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

  const tr = createElement("tr", "hover:bg-slate-800/50 transition-colors");
  tr.dataset.rowKey = rowKey;
  applyPersistentHover(tr, leaf, rowKey, "bg-slate-800/50");

  tr.dataset.contextTarget = "player";
  playerContextTargets.set(tr, {
    id: player.id,
    name: player.name,
    tradeStopped: player.tradeStopped ?? false,
    tradeStoppedBySelf: player.tradeStoppedBySelf,
    tradeStoppedByOther: player.tradeStoppedByOther,
    isSelf: player.isSelf ?? false,
  });

  const labelHeader = headers.find((header) => header.key === "label");
  if (labelHeader) {
    const firstCell = createElement(
      "td",
      cellClassForColumn(labelHeader, "align-top"),
    );
    firstCell.appendChild(
      createLabelBlock({
        label: player.name,
        subtitle:
          [player.clan, player.team].filter(Boolean).join(" • ") || undefined,
        indent,
        focus: player.position,
      }),
    );
    tr.appendChild(firstCell);
  }

  appendMetricCells(tr, metrics, player, headers);
  tbody.appendChild(tr);

  tr.addEventListener("click", () => {
    actions.showPlayerDetails(player.id);
  });
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

  const eligiblePlayers = group.players.filter((player) => !player.isSelf);
  row.dataset.contextTarget = "group";
  groupContextTargets.set(row, {
    label: group.label,
    players: eligiblePlayers,
  });

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

  appendAggregateCells(row, group.metrics, group.totals, headers, {
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

function applyPersistentHover(
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

function appendMetricCells(
  row: HTMLTableRowElement,
  metrics: Metrics,
  player: PlayerRecord,
  headers: ReadonlyArray<TableHeader>,
) {
  for (const column of headers) {
    if (column.key === "label") {
      continue;
    }
    const extraClasses = [getExtraCellClass(column.key, false)];
    if (column.key === "incoming" && metrics.incoming > 0) {
      extraClasses.push("bg-red-500 text-white");
    }
    const td = createElement(
      "td",
      cellClassForColumn(column, extraClasses.filter(Boolean).join(" ")),
    );
    td.textContent = getPlayerCellValue(column.key, metrics, player);
    row.appendChild(td);
  }
}

function appendAggregateCells(
  row: HTMLTableRowElement,
  metrics: Metrics,
  totals: AggregatedRow["totals"],
  headers: ReadonlyArray<TableHeader>,
  options?: { variant?: "default" | "expandable" },
) {
  const variant = options?.variant ?? "default";
  for (const column of headers) {
    if (column.key === "label") {
      continue;
    }
    const extraClasses = [getExtraCellClass(column.key, true)];
    if (column.key === "incoming" && metrics.incoming > 0) {
      extraClasses.push("bg-red-500 text-white");
    }
    const td = createElement(
      "td",
      cellClassForColumn(column, extraClasses.filter(Boolean).join(" "), {
        variant,
      }),
    );
    td.textContent = getAggregateCellValue(column.key, metrics, totals);
    row.appendChild(td);
  }
}
function renderPlayerDetails(
  player: PlayerRecord,
  snapshot: GameSnapshot,
): HTMLElement {
  const wrapper = createElement(
    "div",
    "space-y-4 text-[0.75rem] text-slate-100",
  );

  const metrics = computePlayerMetrics(player, snapshot);
  const badgeRow = createElement("div", "flex flex-wrap gap-2");
  badgeRow.appendChild(createBadge("⚠️ Incoming", metrics.incoming));
  badgeRow.appendChild(createBadge("⚔️ Outgoing", metrics.outgoing));
  badgeRow.appendChild(createBadge("🌱 Expanding", metrics.expanding));
  badgeRow.appendChild(createBadge("🤝 Alliances", metrics.alliances));
  badgeRow.appendChild(createBadge("📡 Disconnected", metrics.disconnected));
  badgeRow.appendChild(createBadge("🕱 Traitor", metrics.traitor));
  badgeRow.appendChild(createBadge("⏳ Waiting", metrics.waiting));
  badgeRow.appendChild(createBadge("☠️ Eliminated", metrics.eliminated));
  badgeRow.appendChild(
    createBadge("🛡️ Stable", metrics.stable, metrics.stable > 0),
  );
  wrapper.appendChild(badgeRow);

  const grid = createElement("div", "grid gap-4 md:grid-cols-2");
  grid.appendChild(
    createDetailSection(
      "Incoming attacks",
      player.incomingAttacks,
      (attack) => `${attack.from} – ${formatTroopCount(attack.troops)} troops`,
    ),
  );
  grid.appendChild(
    createDetailSection(
      "Outgoing attacks",
      player.outgoingAttacks,
      (attack) =>
        `${attack.target} – ${formatTroopCount(attack.troops)} troops`,
    ),
  );
  grid.appendChild(
    createDetailSection(
      "Defensive supports",
      player.defensiveSupports,
      (support) =>
        `${support.ally} – ${formatTroopCount(support.troops)} troops`,
    ),
  );

  const activeAlliances = getActiveAlliances(player, snapshot);
  grid.appendChild(
    createDetailSection("Alliances", activeAlliances, (pact) => {
      const expiresAt = pact.startedAtMs + snapshot.allianceDurationMs;
      const countdown = formatCountdown(expiresAt, snapshot.currentTimeMs);
      return `${pact.partner} – expires in ${countdown}`;
    }),
  );

  if (player.traitor || player.traitorTargets.length) {
    grid.appendChild(
      createDetailSection(
        "Traitor activity",
        player.traitorTargets,
        (target) => `Betrayed ${target}`,
      ),
    );
  }

  wrapper.appendChild(grid);
  return wrapper;
}

function createDetailSection<T>(
  title: string,
  entries: T[],
  toLabel: (entry: T) => string,
): HTMLElement {
  const section = createElement("section", "space-y-2");
  const heading = createElement(
    "h4",
    "font-semibold uppercase text-slate-300 tracking-wide text-[0.7rem]",
    title,
  );
  section.appendChild(heading);
  if (!entries.length) {
    section.appendChild(
      createElement("p", "text-slate-500 italic", "No records."),
    );
    return section;
  }
  const list = createElement("ul", "space-y-2");
  for (const entry of entries) {
    const item = createElement(
      "li",
      "rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2",
    );
    item.appendChild(
      createElement("div", "font-medium text-slate-200", toLabel(entry)),
    );
    list.appendChild(item);
  }
  section.appendChild(list);
  return section;
}

function createBadge(
  label: string,
  value: number,
  highlight = value > 0,
): HTMLElement {
  const badge = createElement(
    "span",
    `inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-semibold ${
      highlight
        ? "bg-sky-500/20 text-sky-200 border border-sky-500/40"
        : "bg-slate-800/80 text-slate-300"
    }`,
  );
  const [emoji, ...rest] = label.split(" ");
  const emojiSpan = createElement("span", "text-base");
  emojiSpan.textContent = emoji;
  badge.appendChild(emojiSpan);
  badge.appendChild(createElement("span", "", rest.join(" ")));
  badge.appendChild(
    createElement("span", "font-mono text-[0.7rem]", String(value)),
  );
  return badge;
}

type ActionStatusLabel = "Enabled" | "Running" | "Disabled";

function createActionStatusBadge(status: ActionStatusLabel): HTMLElement {
  const baseClass =
    "rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide";
  const styles: Record<ActionStatusLabel, string> = {
    Enabled: "bg-sky-500/20 text-sky-200",
    Running: "bg-emerald-500/20 text-emerald-200",
    Disabled: "bg-slate-700/60 text-slate-200",
  };
  return createElement("span", `${baseClass} ${styles[status]}`, status);
}

function createRunStatusBadge(status: SidebarRunningActionStatus): HTMLElement {
  const baseClass =
    "rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide";
  const styles: Record<SidebarRunningActionStatus, string> = {
    running: "bg-emerald-500/20 text-emerald-200",
    completed: "bg-sky-500/20 text-sky-200",
    stopped: "bg-amber-500/20 text-amber-200",
    failed: "bg-rose-500/20 text-rose-200",
  };
  const className = `${baseClass} ${styles[status] ?? "bg-slate-700/60 text-slate-200"}`;
  return createElement("span", className, formatRunStatus(status));
}

function createSummaryStat(label: string, value: string): HTMLElement {
  const wrapper = createElement(
    "div",
    "rounded-md border border-slate-800/70 bg-slate-900/70 px-3 py-2",
  );
  const title = createElement(
    "div",
    "text-[0.65rem] uppercase tracking-wide text-slate-400",
    label,
  );
  const content = createElement(
    "div",
    "font-mono text-base text-slate-100",
    value,
  );
  wrapper.appendChild(title);
  wrapper.appendChild(content);
  return wrapper;
}

function createLabelBlock(options: {
  label: string;
  subtitle?: string;
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
  });
  labelBlock.appendChild(labelEl);
  if (subtitle) {
    labelBlock.appendChild(
      createElement(
        "div",
        "text-[0.65rem] uppercase tracking-wide text-slate-400",
        subtitle,
      ),
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

function cellClassForColumn(
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

function getExtraCellClass(key: SortKey, aggregate: boolean): string {
  if (key === "tiles" || key === "gold" || key === "troops") {
    return "font-mono text-[0.75rem]";
  }
  return aggregate ? "font-semibold" : "font-semibold";
}

function getPlayerCellValue(
  key: SortKey,
  metrics: Metrics,
  player: PlayerRecord,
): string {
  switch (key) {
    case "tiles":
      return formatNumber(player.tiles);
    case "gold":
      return formatNumber(player.gold);
    case "troops":
      return formatTroopCount(player.troops);
    case "incoming":
      return String(metrics.incoming);
    case "outgoing":
      return String(metrics.outgoing);
    case "expanding":
      return String(metrics.expanding);
    case "alliances":
      return String(metrics.alliances);
    case "disconnected":
      return String(metrics.disconnected);
    case "traitor":
      return String(metrics.traitor);
    case "stable":
      return String(metrics.stable);
    case "waiting":
      return String(metrics.waiting);
    case "eliminated":
      return String(metrics.eliminated);
    default:
      return "";
  }
}

function getAggregateCellValue(
  key: SortKey,
  metrics: Metrics,
  totals: AggregatedRow["totals"],
): string {
  switch (key) {
    case "tiles":
      return formatNumber(totals.tiles);
    case "gold":
      return formatNumber(totals.gold);
    case "troops":
      return formatTroopCount(totals.troops);
    case "incoming":
      return String(metrics.incoming);
    case "outgoing":
      return String(metrics.outgoing);
    case "expanding":
      return String(metrics.expanding);
    case "alliances":
      return String(metrics.alliances);
    case "disconnected":
      return String(metrics.disconnected);
    case "traitor":
      return String(metrics.traitor);
    case "stable":
      return String(metrics.stable);
    case "waiting":
      return String(metrics.waiting);
    case "eliminated":
      return String(metrics.eliminated);
    default:
      return "";
  }
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
  const valueA = getPlayerSortValue(a, metricsA, sortState.key);
  const valueB = getPlayerSortValue(b, metricsB, sortState.key);
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
}): number {
  const { a, b, sortState } = options;
  const valueA = getAggregateSortValue(a, sortState.key);
  const valueB = getAggregateSortValue(b, sortState.key);
  const result = compareSortValues(valueA, valueB, sortState.direction);
  if (result !== 0) {
    return result;
  }
  return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
}

function compareSortValues(
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

function getPlayerSortValue(
  player: PlayerRecord,
  metrics: Metrics,
  key: SortKey,
): number | string {
  switch (key) {
    case "label":
      return player.name.toLowerCase();
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
      return 0;
  }
}

function getAggregateSortValue(
  row: AggregatedRow,
  key: SortKey,
): number | string {
  switch (key) {
    case "label":
      return row.label.toLowerCase();
    case "tiles":
      return row.totals.tiles;
    case "gold":
      return row.totals.gold;
    case "troops":
      return row.totals.troops;
    case "incoming":
      return row.metrics.incoming;
    case "outgoing":
      return row.metrics.outgoing;
    case "expanding":
      return row.metrics.expanding;
    case "alliances":
      return row.metrics.alliances;
    case "disconnected":
      return row.metrics.disconnected;
    case "traitor":
      return row.metrics.traitor;
    case "stable":
      return row.metrics.stable;
    case "waiting":
      return row.metrics.waiting;
    case "eliminated":
      return row.metrics.eliminated;
    default:
      return 0;
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
      comparePlayers({ a, b, sortState, snapshot, metricsCache }),
    );
  }
  rows.sort((a, b) => compareAggregated({ a, b, sortState }));
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
