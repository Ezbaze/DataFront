export type ViewType =
  | "players"
  | "clanmates"
  | "teams"
  | "ships"
  | "player"
  | "actions"
  | "actionEditor"
  | "runningActions"
  | "runningAction"
  | "logs"
  | "overlays";

export type SidebarLogLevel = "debug" | "info" | "warn" | "error";

export type SidebarLogToken =
  | { type: "text"; text: string }
  | { type: "player"; id: string; label: string; color?: string }
  | { type: "team"; id: string; label: string; color?: string }
  | { type: "clan"; id: string; label: string; color?: string };

export interface SidebarLogMetadata {
  tokens?: SidebarLogToken[];
}

export interface SidebarLogEntry {
  id: string;
  level: SidebarLogLevel;
  message: string;
  timestampMs: number;
  source?: string;
  tokens?: SidebarLogToken[];
}

export interface SidebarLogger {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

export type ShipType = "Transport" | "Trade Ship" | "Warship";

export interface TileSummary {
  ref?: number;
  x: number;
  y: number;
  ownerId?: string;
  ownerName?: string;
}

export interface ShipRecord {
  id: string;
  type: ShipType;
  ownerId: string;
  ownerName: string;
  troops: number;
  origin?: TileSummary;
  current?: TileSummary;
  destination?: TileSummary;
  retreating: boolean;
  reachedTarget: boolean;
}

export interface IncomingAttack {
  id: string;
  from: string;
  troops: number;
  launchedAtMs?: number;
}

export interface OutgoingAttack {
  id: string;
  target: string;
  troops: number;
  launchedAtMs?: number;
}

export interface DefensiveSupport {
  id: string;
  ally: string;
  troops: number;
  deployedAtMs?: number;
}

export interface AlliancePact {
  id: string;
  partner: string;
  startedAtMs: number;
}

export interface PlayerRecord {
  id: string;
  name: string;
  clan?: string;
  team?: string;
  color?: string;
  position?: TileSummary;
  traitorTargets: string[];
  /**
   * Indicates whether trading between the current player and this player is currently stopped.
   * If omitted (e.g. when custom data is pushed in), the UI treats it as `false`.
   */
  tradeStopped?: boolean;
  /**
   * Indicates whether the local player has currently stopped trading with this player.
   * Optional for backwards compatibility with older snapshots.
   */
  tradeStoppedBySelf?: boolean;
  /**
   * Indicates whether the other player has currently stopped trading with the local player.
   * Optional for backwards compatibility with older snapshots.
   */
  tradeStoppedByOther?: boolean;
  /**
   * Marks the snapshot entry that represents the local player. Consumers can use this to suppress
   * self-targeted interactions such as the trading context menu. Optional for backwards compatibility.
   */
  isSelf?: boolean;
  tiles: number;
  gold: number;
  troops: number;
  incomingAttacks: IncomingAttack[];
  outgoingAttacks: OutgoingAttack[];
  defensiveSupports: DefensiveSupport[];
  expansions: number;
  waiting: boolean;
  eliminated: boolean;
  disconnected: boolean;
  traitor: boolean;
  alliances: AlliancePact[];
  lastUpdatedMs: number;
}

export interface GameSnapshot {
  players: PlayerRecord[];
  allianceDurationMs: number;
  currentTimeMs: number;
  ships: ShipRecord[];
  sidebarActions?: SidebarActionsState;
  sidebarLogs?: SidebarLogEntry[];
  sidebarLogRevision?: number;
  sidebarOverlays?: SidebarOverlayDefinition[];
  sidebarOverlayRevision?: number;
}

export type ActionRunMode = "continuous" | "once" | "event";

export type SidebarActionSettingType = "text" | "number" | "toggle";

export type SidebarActionSettingValue = string | number | boolean;

export interface SidebarActionSetting {
  id: string;
  key: string;
  label: string;
  type: SidebarActionSettingType;
  value: SidebarActionSettingValue;
}

export interface SidebarActionDefinition {
  id: string;
  name: string;
  code: string;
  runMode: ActionRunMode;
  enabled: boolean;
  description: string;
  runIntervalTicks: number;
  settings: SidebarActionSetting[];
  createdAtMs: number;
  updatedAtMs: number;
}

export interface SidebarOverlayDefinition {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export type SidebarRunningActionStatus =
  | "running"
  | "completed"
  | "stopped"
  | "failed";

export interface SidebarRunningAction {
  id: string;
  actionId: string;
  name: string;
  description: string;
  runMode: ActionRunMode;
  runIntervalTicks: number;
  status: SidebarRunningActionStatus;
  startedAtMs: number;
  lastUpdatedMs: number;
  settings: SidebarActionSetting[];
}

export interface SidebarStructureBuiltEvent {
  unitId: string;
  unitType: string;
  ownerId: string;
  ownerName: string;
  clan?: string;
  team?: string;
  tile?: TileSummary;
  tick: number;
  ownerColor?: string;
  teamColor?: string | null;
  clanColor?: string | null;
}

export interface SidebarDonationEvent {
  senderId: string;
  senderName: string;
  senderClan?: string;
  senderTeam?: string;
  senderIsSelf?: boolean;
  senderColor?: string;
  recipientId: string;
  recipientName: string;
  recipientClan?: string;
  recipientTeam?: string;
  recipientIsSelf?: boolean;
  recipientColor?: string;
  amountDisplay: string;
  amountApprox?: number | null;
  tick: number;
}

export type SidebarTroopDonationEvent = SidebarDonationEvent;

export type SidebarGoldDonationEvent = SidebarDonationEvent;

export interface SidebarActionEventOptions<TPayload = unknown> {
  filter?: (payload: TPayload) => boolean;
}

export interface SidebarActionEventsApi {
  on<TPayload = unknown>(
    eventName: string,
    handler: (payload: TPayload) => unknown,
    options?: SidebarActionEventOptions<TPayload>,
  ): () => void;
  once<TPayload = unknown>(
    eventName: string,
    handler: (payload: TPayload) => unknown,
    options?: SidebarActionEventOptions<TPayload>,
  ): () => void;
  oncePerTeam<
    TPayload extends { team?: string | null } = { team?: string | null },
  >(
    eventName: string,
    handler: (payload: TPayload) => unknown,
    options?: SidebarActionEventOptions<TPayload>,
  ): () => void;
  oncePerClan<
    TPayload extends { clan?: string | null } = { clan?: string | null },
  >(
    eventName: string,
    handler: (payload: TPayload) => unknown,
    options?: SidebarActionEventOptions<TPayload>,
  ): () => void;
}

export interface SidebarActionsState {
  revision: number;
  runningRevision: number;
  actions: SidebarActionDefinition[];
  running: SidebarRunningAction[];
  selectedActionId?: string;
  selectedRunningActionId?: string;
}

export interface SidebarActionDefinitionUpdate {
  name: string;
  code: string;
  runMode: ActionRunMode;
  enabled: boolean;
  description: string;
  runIntervalTicks: number;
  settings: SidebarActionSetting[];
}

export type PanelOrientation = "horizontal" | "vertical";

export type SortKey =
  | "label"
  | "tiles"
  | "gold"
  | "troops"
  | "owner"
  | "type"
  | "origin"
  | "current"
  | "destination"
  | "status"
  | "enabled"
  | "timestamp"
  | "level"
  | "source"
  | "message"
  | "incoming"
  | "outgoing"
  | "expanding"
  | "alliances"
  | "disconnected"
  | "traitor"
  | "stable"
  | "waiting"
  | "eliminated";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export interface PanelLeafNode {
  id: string;
  type: "leaf";
  view: ViewType;
  expandedRows: Set<string>;
  expandedGroups: Set<string>;
  sortStates: Partial<Record<ViewType, SortState>>;
  scrollTop: number;
  scrollLeft: number;
  logFollowEnabled: boolean;
  hoveredRowKey?: string;
  hoveredRowElement?: HTMLElement | null;
  hoveredGroupToggleKey?: string;
  selectedPlayerId?: string;
  columnVisibility: Partial<Record<ViewType, Record<string, boolean>>>;
  contentContainer?: HTMLElement;
  boundContainer?: HTMLElement;
  scrollHandler?: EventListener;
  pointerLeaveHandler?: EventListener;
  viewCleanup?: () => void;
  element?: PanelLeafElements;
}

export interface PanelGroupNode {
  id: string;
  type: "group";
  orientation: PanelOrientation;
  children: PanelNode[];
  sizes: number[];
  element?: PanelGroupElements;
}

export type PanelNode = PanelLeafNode | PanelGroupNode;

export interface PanelLeafElements {
  wrapper: HTMLElement;
  header: HTMLElement;
  body: HTMLElement;
  viewSelect: HTMLSelectElement;
  columnVisibilityButton: HTMLButtonElement;
  newActionButton: HTMLButtonElement;
  clearLogsButton: HTMLButtonElement;
  followLogsButton: HTMLButtonElement;
}

export interface PanelGroupElements {
  wrapper: HTMLElement;
}

export interface SidebarWindowHandle {
  updateData: (snapshot: GameSnapshot) => void;
  logger: SidebarLogger;
}
