import {
  createSidebarLogger,
  sidebarLogger,
  subscribeToSidebarLogs,
} from "./logger";
import {
  AttackBorderLabelSummary,
  AttackBorderOverlay,
  GoldDonationOverlay,
  HistoricalMissileTrajectoryOverlay,
  MissileImpactOverlay,
  MissileFlightSummary,
  MissileSiloSummary,
  MissileTrajectoryOverlay,
  TradeRouteOverlay,
  TradeRoutePortSummary,
  TransformHandlerLike,
  TroopDonationOverlay,
  TroopDonationOverlayPlayerSnapshot,
  UiStateLike,
} from "./overlays";
import {
  AlliancePact,
  GameSnapshot,
  IncomingAttack,
  LobbyQueueInfo,
  LobbyTeamCountConfig,
  OutgoingAttack,
  PlayerRecord,
  ShipRecord,
  ShipType,
  SidebarActionDefinition,
  SidebarActionDefinitionUpdate,
  SidebarActionEventOptions,
  SidebarActionEventsApi,
  SidebarActionSetting,
  SidebarActionSettingType,
  SidebarActionSettingValue,
  SidebarActionsState,
  SidebarDonationEvent,
  SidebarGoldDonationEvent,
  SidebarLobbyApi,
  SidebarLogEntry,
  SidebarLogToken,
  SidebarLogger,
  SidebarOverlayDefinition,
  SidebarRunningAction,
  SidebarRunningActionStatus,
  SidebarStructureBuiltEvent,
  SidebarTroopDonationEvent,
  TileSummary,
} from "./types";
import { LOBBY_TEAM_KICKED, predictLobbyTeams } from "./lobbyTeams";
import { readPersistedString, writePersistedString } from "./storage";
import { extractClanTag, formatTroopCount } from "./utils";

const TICK_MILLISECONDS = 100;
const MAX_LOG_ENTRIES = 500;
const STRUCTURE_UNIT_TYPES = new Set<string>([
  "City",
  "Port",
  "Factory",
  "Missile Silo",
  "Defense Post",
  "SAM Launcher",
]);

const MISSILE_TRAJECTORY_OVERLAY_ID = "missile-trajectories";
const HISTORICAL_MISSILE_OVERLAY_ID = "historical-missiles";
const MISSILE_IMPACT_OVERLAY_ID = "missile-impact";
const LEGACY_MISSILE_IMPACT_OVERLAY_ID = "missile-impact-telegraphs";
const DONATION_DEDUP_TICK_WINDOW = 5;
const WEB_SOCKET_DONATION_PENDING_MAX = 300;
const WEB_SOCKET_DONATION_PENDING_TTL_MS = 30_000;
const TROOP_DONATION_OVERLAY_ID = "troop-donations";
const GOLD_DONATION_OVERLAY_ID = "gold-donations";
const TRADE_ROUTE_OVERLAY_ID = "trade-routes";
const ATTACK_BORDER_OVERLAY_ID = "attack-borders";
const ATTACK_BORDER_TROOP_COMPACT_THRESHOLD = 100_000;
const ATTACK_BORDER_TROOP_COMPACT_FORMATTER = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});
const ATTACK_FRONT_EDGE_GAP_MERGE_TILES = 2;
const ATTACK_BORDER_ZOOM_EDGE_TINY_MAX = 1;
const ATTACK_BORDER_ZOOM_EDGE_SMALL_MAX = 2;
const ATTACK_BORDER_ZOOM_EDGE_MEDIUM_MAX = 4;
const ATTACK_BORDER_ZOOM_EDGE_LARGE_MAX = 7;
const ATTACK_BORDER_ZOOM_MIN_SCALE_TINY = 2.7;
const ATTACK_BORDER_ZOOM_MIN_SCALE_SMALL = 2.3;
const ATTACK_BORDER_ZOOM_MIN_SCALE_MEDIUM = 1.9;
const ATTACK_BORDER_ZOOM_MIN_SCALE_LARGE = 1.45;
const PUBLIC_LOBBY_POLL_INTERVAL_MS = 2000;
const LOBBY_DETAILS_CACHE_MS = 1500;
const DEFAULT_WORKER_COUNT = 20;
const USERNAME_STORAGE_KEY = "username";
const SIDEBAR_STATE_STORAGE_KEY = "datafront:state";
const WORKER_COUNT_BY_ENV: Record<string, number> = {
  prod: 20,
  staging: 2,
  dev: 2,
};

interface PersistedSidebarStateV1 {
  version: 1;
  overlays?: Record<string, boolean>;
}

function normalizePersistedOverlayMap(
  value: unknown,
): Record<string, boolean> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const normalized: Record<string, boolean> = {};
  for (const [key, rawEnabled] of Object.entries(value)) {
    if (typeof rawEnabled === "boolean") {
      normalized[key] = rawEnabled;
    }
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function parsePersistedSidebarState(
  value: unknown,
): PersistedSidebarStateV1 | null {
  let parsed: unknown = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const { version, overlays } = parsed as {
    version?: unknown;
    overlays?: unknown;
  };
  if (version !== 1) {
    return null;
  }
  return {
    version: 1,
    overlays: normalizePersistedOverlayMap(overlays),
  };
}

// These constants mirror the values defined in src/core/game/GameUpdates.ts and Game.ts.
const GAME_UPDATE_TYPE_DISPLAY_EVENT = 3;
const MESSAGE_TYPE_SENT_GOLD_TO_PLAYER = 18;
const MESSAGE_TYPE_RECEIVED_GOLD_FROM_PLAYER = 19;
const MESSAGE_TYPE_SENT_TROOPS_TO_PLAYER = 21;
const MESSAGE_TYPE_RECEIVED_TROOPS_FROM_PLAYER = 22;

type GameUpdatesLike = Record<number, unknown> | null;

type ActionExecutionState = Record<string, unknown>;

interface LobbyGameConfigLike {
  gameMap?: string;
  gameMode?: string;
  maxPlayers?: number;
  playerTeams?: LobbyTeamCountConfig;
}

interface LobbySummaryLike {
  gameID?: string;
  numClients?: number;
  msUntilStart?: number;
  gameConfig?: LobbyGameConfigLike;
}

interface LobbyClientInfoLike {
  clientID?: string;
  username?: string;
}

interface LobbyDetailsLike extends LobbySummaryLike {
  clients?: LobbyClientInfoLike[];
}

interface LobbySummary {
  gameID: string;
  numClients?: number;
  msUntilStart?: number;
  gameConfig?: LobbyGameConfigLike;
}

interface LobbyDetails extends LobbySummary {
  clients: LobbyClientInfoLike[];
}

interface LobbyDetailsCacheEntry {
  expiresAt: number;
  details: LobbyDetails;
}

interface LobbyWorkerInfo {
  workerCount: number;
}

type PublicLobbyElement = Element & {
  lobbies?: LobbySummaryLike[];
  lobbyClicked?: (lobby: LobbySummaryLike) => void;
};

interface DisplayMessageUpdateLike {
  message: string;
  messageType: number;
  playerID: number | null;
  params?: Record<string, unknown>;
}

type DonationKind = "troops" | "gold";

interface DonationMessageCandidate {
  kind: DonationKind;
  direction: "sent" | "received";
  amountDisplay: string;
  amountApprox: number | null;
  otherName: string;
  playerSmallId: number | null;
}

interface WebSocketDonationIntentCandidate {
  kind: DonationKind;
  senderClientId: string;
  recipientPlayerId: string;
  amountDisplay: string;
  amountApprox: number | null;
  observedAtMs: number;
}

interface StampedDonationIntentLike {
  type: "donate_troops" | "donate_gold";
  clientID: string | number;
  recipient: string | number;
  troops?: number | null;
  gold?: number | null;
}

interface ActionGamePlayerInfo {
  id: string;
  name: string;
  isSelf: boolean;
  tradeStopped: boolean;
  tiles: number;
  gold: number;
  troops: number;
}

interface ActionGameApi {
  readonly players: ActionGamePlayerInfo[];
  readonly tick: number;
  stopTrade(target: string | number | Iterable<string | number>): void;
  startTrade(target: string | number | Iterable<string | number>): void;
}

interface ActionExecutionContext {
  game: ActionGameApi;
  lobby: SidebarLobbyApi;
  settings: Record<string, SidebarActionSettingValue>;
  state: ActionExecutionState;
  run: SidebarRunningAction;
  snapshot: GameSnapshot;
  logger: SidebarLogger;
  events: SidebarActionEventsApi;
}

const UNKNOWN_SCOPE_KEY = "__unknown__";

interface PlayerSummary {
  id: string;
  name: string;
  clan?: string | null;
  team?: string | null;
  isSelf?: boolean;
  color?: string | null;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as PromiseLike<unknown>).then === "function"
  );
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatOpenFrontNumber(value: number): string {
  const num = Math.max(Number.isFinite(value) ? value : 0, 0);
  if (num >= 10_000_000) {
    return `${(Math.floor(num / 100_000) / 10).toFixed(1)}M`;
  }
  if (num >= 1_000_000) {
    return `${(Math.floor(num / 10_000) / 100).toFixed(2)}M`;
  }
  if (num >= 100_000) {
    return `${Math.floor(num / 1_000)}K`;
  }
  if (num >= 10_000) {
    return `${(Math.floor(num / 100) / 10).toFixed(1)}K`;
  }
  if (num >= 1_000) {
    return `${(Math.floor(num / 10) / 100).toFixed(2)}K`;
  }
  return Math.floor(num).toString();
}

class ActionEventManager implements SidebarActionEventsApi {
  private readonly subscriptions = new Set<() => void>();

  constructor(
    private readonly label: string,
    private readonly register: (
      eventName: string,
      handler: (payload: unknown) => void,
    ) => () => void,
    private readonly touch: () => void,
  ) {}

  on<TPayload = unknown>(
    eventName: string,
    handler: (payload: TPayload) => void,
    options?: SidebarActionEventOptions<TPayload>,
  ): () => void {
    const listener = (payload: unknown) => {
      const typed = payload as TPayload;
      if (options?.filter && !options.filter(typed)) {
        return;
      }
      try {
        const output = handler(typed);
        if (isPromiseLike(output)) {
          void output.then(undefined, (error) => {
            sidebarLogger.error(
              `${this.label} event handler failed for ${eventName}`,
              error,
            );
          });
        }
      } catch (error) {
        sidebarLogger.error(
          `${this.label} event handler failed for ${eventName}`,
          error,
        );
      } finally {
        this.touch();
      }
    };
    const unregister = this.register(eventName, listener);
    const disposer = () => {
      unregister();
      this.subscriptions.delete(disposer);
    };
    this.subscriptions.add(disposer);
    return disposer;
  }

  once<TPayload = unknown>(
    eventName: string,
    handler: (payload: TPayload) => void,
    options?: SidebarActionEventOptions<TPayload>,
  ): () => void {
    let active = true;
    let disposer: () => void = () => undefined;
    disposer = this.on<TPayload>(
      eventName,
      (payload) => {
        if (!active) {
          return;
        }
        active = false;
        try {
          handler(payload);
        } finally {
          disposer();
        }
      },
      options,
    );
    return () => {
      if (active) {
        active = false;
        disposer();
      }
    };
  }

  oncePerTeam<
    TPayload extends { team?: string | null } = { team?: string | null },
  >(
    eventName: string,
    handler: (payload: TPayload) => void,
    options?: SidebarActionEventOptions<TPayload>,
  ): () => void {
    return this.oncePerKey<TPayload>(
      eventName,
      (payload) => payload.team ?? undefined,
      handler,
      options,
    );
  }

  oncePerClan<
    TPayload extends { clan?: string | null } = { clan?: string | null },
  >(
    eventName: string,
    handler: (payload: TPayload) => void,
    options?: SidebarActionEventOptions<TPayload>,
  ): () => void {
    return this.oncePerKey<TPayload>(
      eventName,
      (payload) => payload.clan ?? undefined,
      handler,
      options,
    );
  }

  dispose(): void {
    const entries = Array.from(this.subscriptions);
    for (const dispose of entries) {
      dispose();
    }
    this.subscriptions.clear();
  }

  private oncePerKey<TPayload>(
    eventName: string,
    keySelector: (payload: TPayload) => string | number | null | undefined,
    handler: (payload: TPayload) => void,
    options?: SidebarActionEventOptions<TPayload>,
  ): () => void {
    const seen = new Set<string>();
    return this.on<TPayload>(
      eventName,
      (payload) => {
        const rawKey = keySelector(payload);
        if (rawKey === null) {
          return;
        }
        const key =
          rawKey === undefined || rawKey === ""
            ? UNKNOWN_SCOPE_KEY
            : String(rawKey);
        if (seen.has(key)) {
          return;
        }
        seen.add(key);
        handler(payload);
      },
      options,
    );
  }
}

interface RunningActionRuntime {
  intervalTicks: number;
  lastExecutedTick: number;
  active: boolean;
  state: ActionExecutionState;
  stop(): void;
  updateInterval(ticks: number): void;
}

type SnapshotListener = (snapshot: GameSnapshot) => void;

interface AttackUpdateLike {
  attackerID: number;
  targetID: number;
  troops: number;
  id: string;
  retreating: boolean;
}

interface AllianceViewLike {
  id: number | string;
  other: string | number;
  createdAt: number;
  expiresAt: number;
}

interface PlayerViewLike {
  id(): string | number;
  clientID?(): string | null;
  displayName(): string;
  smallID(): number;
  borderTiles?(): Promise<unknown>;
  attackAveragePosition?(
    playerID: number,
    attackID: string,
  ): Promise<{ x: number; y: number } | null>;
  nameLocation(): { x: number; y: number; size: number } | undefined;
  team(): string | null | undefined;
  numTilesOwned(): number;
  gold(): number | bigint;
  troops(): number;
  incomingAttacks(): AttackUpdateLike[];
  outgoingAttacks(): AttackUpdateLike[];
  alliances(): AllianceViewLike[];
  hasSpawned(): boolean;
  isAlive(): boolean;
  isDisconnected(): boolean;
  isTraitor(): boolean;
  getTraitorRemainingTicks?(): number;
  traitorRemainingTicks?: number;
  hasEmbargo?(other: PlayerViewLike): boolean;
  hasEmbargoAgainst?(other: PlayerViewLike): boolean;
  addEmbargo?(other: PlayerViewLike, isTemporary?: boolean): void;
  stopEmbargo?(other: PlayerViewLike): void;
  territoryColor?(tile?: number): unknown;
  color?: (() => string) | string;
  cosmetics?: { color?: { color?: string } };
}

interface GameConfigLike {
  allianceDuration(): number;
  tradeShipGold?(distance: number, numPorts: number): number | bigint;
  defaultDonationAmount?(sender: PlayerViewLike): number;
  maxTroops?(player: PlayerViewLike): number;
}

interface UnitViewLike {
  id(): number;
  type(): string;
  troops(): number;
  tile(): number;
  lastTile(): number;
  targetTile(): number | undefined;
  owner(): PlayerViewLike;
  reachedTarget(): boolean;
  targetUnitId(): number | undefined;
  retreating?(): boolean;
}

interface GameViewLike {
  playerViews(): PlayerViewLike[];
  ticks(): number;
  config(): GameConfigLike;
  attackAveragePosition?(
    playerID: number,
    attackID: string,
  ): Promise<{ x: number; y: number } | null>;
  playerBySmallID(id: number): PlayerViewLike | Record<string, unknown>;
  player(id: string | number): PlayerViewLike;
  units(...types: string[]): UnitViewLike[];
  unit(id: number): UnitViewLike | undefined;
  x(ref: number): number;
  y(ref: number): number;
  ref(x: number, y: number): number;
  isValidCoord(x: number, y: number): boolean;
  hasOwner(ref: number): boolean;
  ownerID(ref: number): number;
  neighbors(ref: number): number[];
  isWater(ref: number): boolean;
  cost?(ref: number): number;
  manhattanDist?(a: number, b: number): number;
  forEachTile(fn: (ref: number) => void): void;
  myPlayer?(): PlayerViewLike | null;
  playerByClientID?(id: string | number): PlayerViewLike | null;
  updatesSinceLastTick?(): GameUpdatesLike;
}

type GameAwareElement = Element & { g?: GameViewLike; game?: GameViewLike };
type PlayerPanelElement = Element & {
  handleEmbargoClick?: (
    event: Event,
    myPlayer: PlayerViewLike,
    other: PlayerViewLike,
  ) => void;
  handleStopEmbargoClick?: (
    event: Event,
    myPlayer: PlayerViewLike,
    other: PlayerViewLike,
  ) => void;
};

type TransformHostElement = Element & {
  transformHandler?: TransformHandlerLike | null;
};

type ControlPanelElement = Element & {
  uiState?: UiStateLike | null;
};

type AllianceMap = Map<string, Set<string>>;
type TraitorHistory = Map<string, Set<string>>;

export class DataStore {
  private static wsDonationListeners = new Set<(message: unknown) => void>();
  private static wsDonationHooksByWindow = new WeakMap<
    Window,
    {
      refCount: number;
      teardown: () => void;
    }
  >();

  private snapshot: GameSnapshot;
  private readonly listeners = new Set<SnapshotListener>();
  private refreshHandle: number | undefined;
  private attachHandle: number | undefined;
  private game: GameViewLike | null = null;
  private readonly previousAlliances: AllianceMap = new Map();
  private readonly traitorHistory: TraitorHistory = new Map();
  private readonly shipOrigins: Map<string, TileSummary> = new Map();
  private readonly shipDestinations: Map<string, TileSummary> = new Map();
  private readonly shipManifests: Map<string, number> = new Map();
  private readonly missileOrigins: Map<string, TileSummary> = new Map();
  private readonly missileTargets: Map<string, TileSummary> = new Map();
  private actionsState: SidebarActionsState;
  private actionIdCounter = 0;
  private runningActionIdCounter = 0;
  private settingIdCounter = 0;
  private readonly runningRemovalTimers: Map<
    string,
    ReturnType<typeof setTimeout>
  > = new Map();
  private readonly actionRuntimes: Map<string, RunningActionRuntime> =
    new Map();
  private readonly actionEventListeners = new Map<
    string,
    Map<string, Set<(payload: unknown) => void>>
  >();
  private readonly actionEventManagers = new Map<string, ActionEventManager>();
  private readonly eventCleanupHandlers = new Map<string, () => void>();
  private knownStructureIds: Set<string> = new Set();
  private structuresInitialized = false;
  private pendingTradingRefreshHandle: number | undefined;
  private sidebarLogs: SidebarLogEntry[] = [];
  private sidebarLogRevision = 0;
  private sidebarOverlays: SidebarOverlayDefinition[] = [];
  private sidebarOverlayRevision = 0;
  private overlaysTemporarilyHidden = false;
  private missileOverlay?: MissileTrajectoryOverlay;
  private historicalMissileOverlay?: HistoricalMissileTrajectoryOverlay;
  private missileImpactOverlay?: MissileImpactOverlay;
  private troopDonationOverlay?: TroopDonationOverlay;
  private goldDonationOverlay?: GoldDonationOverlay;
  private tradeRouteOverlay?: TradeRouteOverlay;
  private attackBorderOverlay?: AttackBorderOverlay;
  private attackBorderSyncInFlight = false;
  private attackBorderSyncQueued = false;
  private displayEventPollingHandle: number | undefined;
  private displayEventPollingActive = false;
  private displayEventPollingLastTimestamp = 0;
  private lastProcessedDisplayUpdates: GameUpdatesLike = null;
  private lastProcessedDisplayEventArray: unknown[] | null = null;
  private lastProcessedDisplayEventArrayLength = 0;
  private readonly recentTroopDonations: Map<string, number> = new Map();
  private readonly recentGoldDonations: Map<string, number> = new Map();
  private pendingWebSocketDonationIntents: WebSocketDonationIntentCandidate[] =
    [];
  private readonly logSubscriptionCleanup: () => void;
  private readonly webSocketDonationCleanup: (() => void) | null;
  private lobbyQueueRefreshHandle: number | undefined;
  private lobbyQueueRefreshPromise: Promise<void> | null = null;
  private readonly lobbyDetailsCache = new Map<
    string,
    LobbyDetailsCacheEntry
  >();
  private lobbyWorkerInfoPromise: Promise<LobbyWorkerInfo> | null = null;
  private lastLobbyTeamLogKey: string | null = null;
  private lastLiveGameTeamLogKey: string | null = null;
  private readonly hostDocument: Document;
  private readonly hostWindow: Window | null;
  private localPlayerPublicId: string | null = null;
  private readonly userMeHandler: (event: Event) => void;

  constructor(initialSnapshot?: GameSnapshot) {
    this.hostWindow =
      (globalThis as { unsafeWindow?: Window }).unsafeWindow ??
      (typeof window !== "undefined" ? window : null);
    this.hostDocument =
      (globalThis as { unsafeWindow?: { document?: Document } }).unsafeWindow
        ?.document ?? globalThis.document;
    this.userMeHandler = (event: Event) => {
      const custom = event as CustomEvent<unknown>;
      const detail = custom.detail as
        | { player?: { publicId?: unknown } }
        | false
        | null
        | undefined;
      const candidate =
        typeof detail === "object" && detail !== null
          ? (detail as { player?: { publicId?: unknown } }).player?.publicId
          : undefined;
      this.localPlayerPublicId =
        typeof candidate === "string" && candidate.trim().length > 0
          ? candidate.trim()
          : null;
    };
    this.hostDocument.addEventListener("userMeResponse", this.userMeHandler);
    this.webSocketDonationCleanup = this.installWebSocketDonationHook();
    this.actionsState = this.createInitialActionsState();
    this.sidebarOverlays = [
      {
        id: MISSILE_TRAJECTORY_OVERLAY_ID,
        label: "Missile trajectories",
        description:
          "Draws projected missile paths from each silo to your selected Atom or Hydrogen bomb target.",
        enabled: false,
      },
      {
        id: HISTORICAL_MISSILE_OVERLAY_ID,
        label: "Active missile trajectories",
        description:
          "Shows the live flight paths for missiles currently in the air, colored by their owners.",
        enabled: false,
      },
      {
        id: MISSILE_IMPACT_OVERLAY_ID,
        label: "Missile impact",
        description:
          "Shows rotating impact circles for active missiles, colored per team.",
        enabled: false,
      },
      {
        id: TROOP_DONATION_OVERLAY_ID,
        label: "Troop donations",
        description:
          "Shows temporary arrows and labels across the map when players send troops to each other.",
        enabled: false,
      },
      {
        id: GOLD_DONATION_OVERLAY_ID,
        label: "Gold donations",
        description:
          "Shows temporary arrows and labels across the map when players send gold to each other.",
        enabled: false,
      },
      {
        id: TRADE_ROUTE_OVERLAY_ID,
        label: "Trade ship routes",
        description:
          "Displays projected trade ship paths, distances, and base gold when placing a new port.",
        enabled: false,
      },
      {
        id: ATTACK_BORDER_OVERLAY_ID,
        label: "Attack border labels",
        description:
          "Shows active attack labels centered on the attacker side of shared territory borders.",
        enabled: false,
      },
    ];
    this.sidebarOverlayRevision = 1;
    if (initialSnapshot?.sidebarLogs?.length) {
      this.sidebarLogs = [...initialSnapshot.sidebarLogs];
      this.sidebarLogRevision = initialSnapshot.sidebarLogRevision ?? 0;
    }
    const baseSnapshot = initialSnapshot ?? {
      players: [],
      allianceDurationMs: 0,
      currentTimeMs: Date.now(),
      ships: [],
    };
    this.snapshot = this.attachActionsState({
      ...baseSnapshot,
      currentTimeMs: baseSnapshot.currentTimeMs ?? Date.now(),
      ships: baseSnapshot.ships ?? [],
    });

    this.logSubscriptionCleanup = subscribeToSidebarLogs((entry) => {
      this.appendLogEntry(entry);
    });
    if (typeof window !== "undefined") {
      window.addEventListener(
        "beforeunload",
        () => {
          this.logSubscriptionCleanup();
          this.webSocketDonationCleanup?.();
        },
        { once: true },
      );
    }

    if (typeof window !== "undefined") {
      this.scheduleGameDiscovery(true);
      this.startLobbyQueueUpdates();
      void this.refreshLocalPlayerPublicId();
    }

    this.restoreSidebarState();
    this.ensureAllEventActionsRunning();
  }

  private installWebSocketDonationHook(): (() => void) | null {
    const hostWindow = this.hostWindow as
      | ({
          WebSocket?: typeof WebSocket;
        } & Window)
      | null;
    if (!hostWindow || typeof hostWindow.WebSocket !== "function") {
      return null;
    }

    const messageListener = (message: unknown): void => {
      const candidates =
        this.extractWebSocketDonationIntentCandidatesFromMessage(message);
      if (candidates.length > 0) {
        this.enqueueWebSocketDonationIntentCandidates(candidates);
      }
    };

    DataStore.wsDonationListeners.add(messageListener);

    let hookState = DataStore.wsDonationHooksByWindow.get(hostWindow);
    if (!hookState) {
      const nativeWebSocket = hostWindow.WebSocket;
      const observedSockets = new WeakSet<WebSocket>();
      const dispatchMessage = (message: unknown): void => {
        for (const listener of DataStore.wsDonationListeners) {
          try {
            listener(message);
          } catch (error) {
            console.warn("WebSocket donation listener failed", error);
          }
        }
      };

      const attachSocket = (socket: WebSocket): void => {
        if (observedSockets.has(socket)) {
          return;
        }
        observedSockets.add(socket);
        socket.addEventListener("message", (event: MessageEvent) => {
          if (typeof event.data !== "string") {
            return;
          }
          try {
            const parsed = JSON.parse(event.data) as unknown;
            dispatchMessage(parsed);
          } catch {
            // Ignore non-JSON messages.
          }
        });
      };

      const originalSend = nativeWebSocket.prototype.send;
      const patchedSend = function patchedWebSocketSend(
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView,
      ): void {
        attachSocket(this);
        originalSend.call(this, data);
      };
      nativeWebSocket.prototype.send = patchedSend;

      const hostWindowMutable = hostWindow as {
        WebSocket: typeof WebSocket;
      };
      const patchedWebSocket = function DataFrontWebSocket(
        url: string | URL,
        protocols?: string | string[],
      ): WebSocket {
        const socket =
          protocols === undefined
            ? new nativeWebSocket(url)
            : new nativeWebSocket(url, protocols);
        attachSocket(socket);
        return socket;
      } as unknown as typeof WebSocket;
      hostWindowMutable.WebSocket = patchedWebSocket;
      hostWindowMutable.WebSocket.prototype = nativeWebSocket.prototype;
      Object.setPrototypeOf(hostWindowMutable.WebSocket, nativeWebSocket);

      const teardown = (): void => {
        if (nativeWebSocket.prototype.send === patchedSend) {
          nativeWebSocket.prototype.send = originalSend;
        }
        if (hostWindowMutable.WebSocket === patchedWebSocket) {
          hostWindowMutable.WebSocket = nativeWebSocket;
        }
      };

      hookState = {
        refCount: 0,
        teardown,
      };
      DataStore.wsDonationHooksByWindow.set(hostWindow, hookState);
    }
    hookState.refCount += 1;

    let cleanedUp = false;
    return () => {
      if (cleanedUp) {
        return;
      }
      cleanedUp = true;
      DataStore.wsDonationListeners.delete(messageListener);
      const currentHook = DataStore.wsDonationHooksByWindow.get(hostWindow);
      if (!currentHook) {
        return;
      }
      currentHook.refCount = Math.max(0, currentHook.refCount - 1);
      if (currentHook.refCount === 0) {
        currentHook.teardown();
        DataStore.wsDonationHooksByWindow.delete(hostWindow);
      }
    };
  }

  private extractWebSocketDonationIntentCandidatesFromMessage(
    message: unknown,
  ): WebSocketDonationIntentCandidate[] {
    if (!message || typeof message !== "object") {
      return [];
    }
    const payload = message as {
      type?: unknown;
      turn?: { intents?: unknown[] } | null;
    };
    if (payload.type !== "turn") {
      return [];
    }
    const intents = payload.turn?.intents;
    if (!Array.isArray(intents) || intents.length === 0) {
      return [];
    }

    const candidates: WebSocketDonationIntentCandidate[] = [];
    const now = Date.now();
    for (const raw of intents) {
      const intent = raw as Partial<StampedDonationIntentLike>;
      if (intent.type !== "donate_gold" && intent.type !== "donate_troops") {
        continue;
      }
      const senderClientId =
        intent.clientID !== undefined && intent.clientID !== null
          ? String(intent.clientID).trim()
          : "";
      const recipientPlayerId =
        intent.recipient !== undefined && intent.recipient !== null
          ? String(intent.recipient).trim()
          : "";
      if (!senderClientId || !recipientPlayerId) {
        continue;
      }

      const kind: DonationKind =
        intent.type === "donate_gold" ? "gold" : "troops";
      const amount = this.resolveDonationIntentAmount(intent, kind);
      if (amount === null || amount <= 0) {
        continue;
      }
      const amountDisplay = this.formatDonationAmountDisplay(kind, amount);

      candidates.push({
        kind,
        senderClientId,
        recipientPlayerId,
        amountDisplay,
        amountApprox: amount,
        observedAtMs: now,
      });
    }
    return candidates;
  }

  private resolveDonationIntentAmount(
    intent: Partial<StampedDonationIntentLike>,
    kind: DonationKind,
  ): number | null {
    const rawAmount = kind === "gold" ? intent.gold : intent.troops;
    if (typeof rawAmount === "number" && Number.isFinite(rawAmount)) {
      return Math.max(0, Math.floor(rawAmount));
    }

    const senderClientId =
      intent.clientID !== undefined && intent.clientID !== null
        ? String(intent.clientID).trim()
        : "";
    const recipientPlayerId =
      intent.recipient !== undefined && intent.recipient !== null
        ? String(intent.recipient).trim()
        : "";
    if (!senderClientId || !recipientPlayerId || !this.game) {
      return null;
    }

    const sender = this.resolvePlayerViewByClientId(senderClientId);
    const recipient = this.resolvePlayerById(recipientPlayerId);
    if (!sender || !recipient) {
      return null;
    }

    if (kind === "gold") {
      const senderGoldRaw = sender.gold();
      const senderGold =
        typeof senderGoldRaw === "bigint"
          ? Number(senderGoldRaw)
          : senderGoldRaw;
      if (!Number.isFinite(senderGold) || senderGold <= 0) {
        return null;
      }
      return Math.max(0, Math.floor(senderGold / 3));
    }

    const config = this.game.config();
    const defaultDonation =
      typeof config.defaultDonationAmount === "function"
        ? config.defaultDonationAmount(sender)
        : Math.floor(sender.troops() / 3);
    if (!Number.isFinite(defaultDonation) || defaultDonation <= 0) {
      return null;
    }

    let amount = Math.max(0, Math.floor(defaultDonation));
    if (typeof config.maxTroops === "function") {
      const maxTroops = config.maxTroops(recipient);
      const capacityLeft = Math.floor(maxTroops - recipient.troops());
      if (Number.isFinite(capacityLeft)) {
        amount = Math.min(amount, Math.max(0, capacityLeft));
      }
    }

    return amount > 0 ? amount : null;
  }

  private formatDonationAmountDisplay(
    kind: DonationKind,
    rawAmount: number,
  ): string {
    if (kind === "troops") {
      return formatOpenFrontNumber(rawAmount / 10);
    }
    return formatOpenFrontNumber(rawAmount);
  }

  private enqueueWebSocketDonationIntentCandidates(
    candidates: readonly WebSocketDonationIntentCandidate[],
  ): void {
    if (candidates.length === 0) {
      return;
    }
    for (const candidate of candidates) {
      this.pendingWebSocketDonationIntents.push(candidate);
    }
    if (
      this.pendingWebSocketDonationIntents.length >
      WEB_SOCKET_DONATION_PENDING_MAX
    ) {
      this.pendingWebSocketDonationIntents.splice(
        0,
        this.pendingWebSocketDonationIntents.length -
          WEB_SOCKET_DONATION_PENDING_MAX,
      );
    }
  }

  private attachActionsState(snapshot: GameSnapshot): GameSnapshot {
    return {
      ...snapshot,
      sidebarActions: this.actionsState,
      sidebarLogs: this.sidebarLogs.slice(),
      sidebarLogRevision: this.sidebarLogRevision,
      sidebarOverlays: this.cloneSidebarOverlays(),
      sidebarOverlayRevision: this.sidebarOverlayRevision,
    };
  }

  private cloneSidebarOverlays(): SidebarOverlayDefinition[] {
    return this.sidebarOverlays.map((overlay) => ({ ...overlay }));
  }

  private loadPersistedSidebarState(): PersistedSidebarStateV1 | null {
    const raw = readPersistedString(SIDEBAR_STATE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return parsePersistedSidebarState(raw);
  }

  private restoreSidebarState(): void {
    const state = this.loadPersistedSidebarState();
    const overlays = state?.overlays;
    if (!overlays) {
      return;
    }
    for (const overlay of this.sidebarOverlays) {
      const enabled = this.resolvePersistedOverlayEnabled(overlays, overlay.id);
      if (typeof enabled === "boolean") {
        this.setOverlayEnabled(overlay.id, enabled);
      }
    }
  }

  private resolvePersistedOverlayEnabled(
    overlays: Record<string, boolean>,
    overlayId: string,
  ): boolean | undefined {
    const currentValue = overlays[overlayId];
    if (typeof currentValue === "boolean") {
      return currentValue;
    }
    if (overlayId === MISSILE_IMPACT_OVERLAY_ID) {
      const legacyValue = overlays[LEGACY_MISSILE_IMPACT_OVERLAY_ID];
      if (typeof legacyValue === "boolean") {
        return legacyValue;
      }
    }
    return undefined;
  }

  saveSidebarState(): void {
    const overlays: Record<string, boolean> = {};
    for (const overlay of this.sidebarOverlays) {
      overlays[overlay.id] = Boolean(overlay.enabled);
    }
    const payload: PersistedSidebarStateV1 = { version: 1, overlays };
    const saved = writePersistedString(
      SIDEBAR_STATE_STORAGE_KEY,
      JSON.stringify(payload),
    );
    if (saved) {
      sidebarLogger.info("Saved sidebar state.");
    } else {
      console.warn("Failed to save sidebar state.");
    }
  }

  private ensureMissileOverlay(): MissileTrajectoryOverlay {
    this.missileOverlay =
      this.missileOverlay ??
      new MissileTrajectoryOverlay({
        resolveTransform: () => this.resolveTransformHandler(),
        resolveUiState: () => this.resolveUiState(),
      });
    return this.missileOverlay;
  }

  private ensureHistoricalMissileOverlay(): HistoricalMissileTrajectoryOverlay {
    this.historicalMissileOverlay =
      this.historicalMissileOverlay ??
      new HistoricalMissileTrajectoryOverlay({
        resolveTransform: () => this.resolveTransformHandler(),
      });
    return this.historicalMissileOverlay;
  }

  private ensureMissileImpactOverlay(): MissileImpactOverlay {
    this.missileImpactOverlay =
      this.missileImpactOverlay ??
      new MissileImpactOverlay({
        resolveTransform: () => this.resolveTransformHandler(),
      });
    return this.missileImpactOverlay;
  }

  private ensureTroopDonationOverlay(): TroopDonationOverlay {
    this.troopDonationOverlay =
      this.troopDonationOverlay ??
      new TroopDonationOverlay({
        resolveTransform: () => this.resolveTransformHandler(),
      });
    return this.troopDonationOverlay;
  }

  private ensureGoldDonationOverlay(): GoldDonationOverlay {
    this.goldDonationOverlay =
      this.goldDonationOverlay ??
      new GoldDonationOverlay({
        resolveTransform: () => this.resolveTransformHandler(),
      });
    return this.goldDonationOverlay;
  }

  private ensureTradeRouteOverlay(): TradeRouteOverlay {
    this.tradeRouteOverlay =
      this.tradeRouteOverlay ??
      new TradeRouteOverlay({
        resolveTransform: () => this.resolveTransformHandler(),
        resolveUiState: () => this.resolveUiState(),
        resolveGame: () => this.game,
        resolveLocalPlayerSmallId: () => this.resolveLocalPlayerSmallId(),
      });
    return this.tradeRouteOverlay;
  }

  private ensureAttackBorderOverlay(): AttackBorderOverlay {
    this.attackBorderOverlay =
      this.attackBorderOverlay ??
      new AttackBorderOverlay({
        resolveTransform: () => this.resolveTransformHandler(),
      });
    return this.attackBorderOverlay;
  }

  private collectMissileSiloPositions(): MissileSiloSummary[] {
    if (!this.game) {
      return [];
    }

    let units: UnitViewLike[];
    try {
      units = this.game.units("Missile Silo");
    } catch (error) {
      console.warn("Failed to enumerate missile silos", error);
      return [];
    }

    const positions: MissileSiloSummary[] = [];
    for (const unit of units) {
      const tile = this.describeTile(unit.tile());
      if (tile) {
        let owner: PlayerViewLike | null = null;
        try {
          owner = unit.owner();
        } catch (error) {
          console.warn("Failed to resolve missile silo owner", error);
        }
        positions.push({
          x: tile.x,
          y: tile.y,
          ready: this.isMissileSiloReady(unit),
          ownerId: owner ? this.safePlayerId(owner) : undefined,
          color: this.resolvePlayerColor(owner),
        });
      }
    }
    return positions;
  }

  private collectMissileSiloOrigins(): TileSummary[] {
    if (!this.game) {
      return [];
    }

    const silos = this.collectMissileSiloPositions();
    const origins: TileSummary[] = [];

    for (const silo of silos) {
      let ref: number | undefined;
      try {
        if (this.game.isValidCoord(silo.x, silo.y)) {
          ref = this.game.ref(silo.x, silo.y);
        }
      } catch (error) {
        console.warn("Failed to resolve missile silo ref", error);
        ref = undefined;
      }
      if (ref === undefined) {
        continue;
      }

      const summary = this.describeTile(ref);
      if (!summary) {
        continue;
      }

      origins.push({
        ...summary,
        ownerId: silo.ownerId ?? summary.ownerId,
      });
    }

    return origins;
  }

  private syncMissileOverlaySilos(): void {
    if (!this.missileOverlay) {
      return;
    }
    this.missileOverlay.setSiloPositions(this.collectMissileSiloPositions());
  }

  private collectHistoricalMissiles(): MissileFlightSummary[] {
    if (!this.game) {
      return [];
    }

    const mirvLaunchOrigins = this.collectMissileSiloOrigins();
    const localPlayer = this.resolveLocalPlayer();
    const localPlayerId = localPlayer
      ? this.safePlayerId(localPlayer)
      : undefined;
    const localTeam = (() => {
      if (!localPlayer) {
        return null;
      }
      try {
        const team = localPlayer.team?.();
        return team ?? null;
      } catch {
        return null;
      }
    })();

    let units: UnitViewLike[];
    try {
      units = this.game.units(
        "Atom Bomb",
        "Hydrogen Bomb",
        "MIRV",
        "MIRV Warhead",
      );
    } catch (error) {
      console.warn("Failed to enumerate missiles in flight", error);
      return [];
    }

    const flights: MissileFlightSummary[] = [];

    for (const unit of units) {
      let owner: PlayerViewLike | null = null;
      try {
        owner = unit.owner();
      } catch (error) {
        console.warn("Failed to resolve missile owner", error);
      }

      const ownerId = owner ? this.safePlayerId(owner) : undefined;
      let ownerTeam: string | undefined;
      if (owner) {
        try {
          const team = owner.team?.();
          if (team) {
            ownerTeam = team;
          }
        } catch (error) {
          console.warn("Failed to resolve missile owner team", error);
        }
      }

      let unitType = "Missile";
      try {
        const resolved = unit.type();
        if (resolved) {
          unitType = resolved;
        }
      } catch (error) {
        console.warn("Failed to resolve missile type", error);
      }

      const normalizedType = unitType.replace(/\s+/g, "").toLowerCase();
      const isMirv = normalizedType === "mirv";
      const isMirvWarhead = normalizedType === "mirvwarhead";

      let rawId: string | undefined;
      try {
        rawId = String(unit.id());
      } catch (error) {
        console.warn("Failed to resolve missile id", error);
      }

      const currentTile = this.describeTile(unit.tile());

      const targetRef = (() => {
        try {
          return unit.targetTile();
        } catch (error) {
          console.warn("Failed to resolve missile target tile", error);
          return undefined;
        }
      })();

      const lastTile = this.describeTile(unit.lastTile());
      const targetTile =
        targetRef === undefined ? undefined : this.describeTile(targetRef);

      let missileId = rawId;
      let resolvedTarget = targetTile;
      if (!resolvedTarget && missileId) {
        const cachedTarget = this.missileTargets.get(missileId);
        if (cachedTarget) {
          resolvedTarget = { ...cachedTarget };
        }
      }
      if (!resolvedTarget && isMirv) {
        resolvedTarget = currentTile ?? lastTile ?? undefined;
      }

      if (!resolvedTarget) {
        if (missileId) {
          this.missileTargets.delete(missileId);
        }
        if (rawId) {
          this.missileOrigins.delete(rawId);
        }
        continue;
      }

      missileId =
        missileId ?? this.composeMissileKey(unitType, resolvedTarget, ownerId);

      const cachedTarget = this.missileTargets.get(missileId);
      if (targetTile) {
        this.missileTargets.set(missileId, { ...targetTile });
        resolvedTarget = targetTile;
      } else if (cachedTarget) {
        resolvedTarget = { ...cachedTarget };
      } else {
        this.missileTargets.set(missileId, { ...resolvedTarget });
      }

      let reachedTarget = false;
      try {
        reachedTarget = unit.reachedTarget();
      } catch (error) {
        console.warn("Failed to inspect missile progress", error);
        this.missileOrigins.delete(missileId);
        this.missileTargets.delete(missileId);
        continue;
      }
      if (reachedTarget) {
        this.missileOrigins.delete(missileId);
        this.missileTargets.delete(missileId);
        continue;
      }

      const fallbackOrigin = lastTile ?? currentTile;
      if (!fallbackOrigin) {
        this.missileOrigins.delete(missileId);
        this.missileTargets.delete(missileId);
        continue;
      }

      const existingOrigin = this.missileOrigins.get(missileId);
      const hasMatchingSilo =
        existingOrigin !== undefined &&
        mirvLaunchOrigins.some((candidate) => {
          if (
            candidate.x !== existingOrigin.x ||
            candidate.y !== existingOrigin.y
          ) {
            return false;
          }
          if (!ownerId) {
            return true;
          }
          return candidate.ownerId === ownerId;
        });

      let originTile = existingOrigin;
      if (!originTile || (isMirv && !hasMatchingSilo)) {
        let resolvedOrigin = fallbackOrigin;
        if (isMirv) {
          const launchSite = this.findMirvLaunchSite(
            fallbackOrigin,
            resolvedTarget,
            ownerId,
            mirvLaunchOrigins,
          );
          if (launchSite) {
            resolvedOrigin = launchSite;
          }
        }
        originTile = { ...resolvedOrigin };
        this.missileOrigins.set(missileId, originTile);
      }

      const flight: MissileFlightSummary = {
        id: missileId,
        origin: originTile,
        target: resolvedTarget,
        current: currentTile ?? null,
        split: isMirvWarhead ? null : undefined,
        color: this.resolvePlayerColor(owner),
        ownerId,
        ownerTeam,
        isLocalOwner: !!ownerId && !!localPlayerId && ownerId === localPlayerId,
        isLocalTeam: !!localTeam && !!ownerTeam && ownerTeam === localTeam,
        unitType,
      };

      flights.push(flight);
    }

    return flights;
  }

  private collectTradeRoutePorts(
    players: PlayerViewLike[],
    recordLookup: Map<string, PlayerRecord>,
  ): TradeRoutePortSummary[] {
    if (!this.game) {
      return [];
    }

    let units: UnitViewLike[];
    try {
      units = this.game.units("Port");
    } catch (error) {
      console.warn("Failed to enumerate ports for trade overlay", error);
      return [];
    }

    const localPlayer = this.resolveLocalPlayer();
    const localId = localPlayer ? this.safePlayerId(localPlayer) : null;

    const eligibility = new Map<
      string,
      { includeFromLocal: boolean; includeToLocal: boolean }
    >();
    for (const player of players) {
      const ownerId = this.safePlayerId(player);
      if (!ownerId) {
        continue;
      }
      const status = this.determineTradeStatus(localPlayer, player);
      eligibility.set(ownerId, {
        includeFromLocal: !status.stoppedBySelf,
        includeToLocal: !status.stoppedByOther,
      });
    }

    const ports: TradeRoutePortSummary[] = [];
    for (const unit of units) {
      let owner: PlayerViewLike;
      try {
        owner = unit.owner();
      } catch (error) {
        console.warn("Failed to resolve port owner", error);
        continue;
      }

      const ownerId = this.safePlayerId(owner);
      if (!ownerId) {
        continue;
      }

      const status = eligibility.get(ownerId);
      const includeFromLocal =
        ownerId === localId ? true : (status?.includeFromLocal ?? false);
      const includeToLocal =
        ownerId === localId ? true : (status?.includeToLocal ?? false);

      if (!includeFromLocal || !includeToLocal) {
        continue;
      }

      const tile = this.describeTile(unit.tile());
      if (!tile || typeof tile.ref !== "number") {
        continue;
      }

      const record = recordLookup.get(ownerId);
      ports.push({
        id: String(unit.id()),
        tileRef: tile.ref,
        x: tile.x,
        y: tile.y,
        ownerId,
        ownerSmallId: this.safePlayerSmallId(owner) ?? undefined,
        ownerName: record?.name ?? this.safePlayerName(owner),
        ownerColor: record?.color ?? this.resolvePlayerColor(owner),
        includeFromLocal,
        includeToLocal,
      });
    }

    return ports;
  }

  private findMirvLaunchSite(
    fallbackOrigin: TileSummary,
    target: TileSummary,
    ownerId: string | undefined,
    siloOrigins: readonly TileSummary[],
  ): TileSummary | undefined {
    if (siloOrigins.length === 0) {
      return undefined;
    }

    const ownerMatched = ownerId
      ? siloOrigins.filter((candidate) => candidate.ownerId === ownerId)
      : siloOrigins;
    const candidates = ownerMatched.length > 0 ? ownerMatched : siloOrigins;

    let best: {
      tile: TileSummary;
      offAxisSq: number;
      distanceSq: number;
    } | null = null;

    for (const candidate of candidates) {
      const dxTarget = target.x - candidate.x;
      const dyTarget = target.y - candidate.y;
      const launchLengthSq = dxTarget * dxTarget + dyTarget * dyTarget;
      if (launchLengthSq === 0) {
        continue;
      }

      const dxFallback = fallbackOrigin.x - candidate.x;
      const dyFallback = fallbackOrigin.y - candidate.y;
      const along =
        (dxFallback * dxTarget + dyFallback * dyTarget) / launchLengthSq;

      const fallbackDistanceSq =
        dxFallback * dxFallback + dyFallback * dyFallback;
      if (along < 0 && fallbackDistanceSq > 4) {
        continue;
      }
      if (along > 1.25) {
        continue;
      }

      const clampedAlong = Math.min(Math.max(along, 0), 1);
      const closestX = candidate.x + dxTarget * clampedAlong;
      const closestY = candidate.y + dyTarget * clampedAlong;
      const offAxisX = fallbackOrigin.x - closestX;
      const offAxisY = fallbackOrigin.y - closestY;
      const offAxisSq = offAxisX * offAxisX + offAxisY * offAxisY;

      if (!best) {
        best = {
          tile: candidate,
          offAxisSq,
          distanceSq: fallbackDistanceSq,
        };
        continue;
      }

      if (offAxisSq < best.offAxisSq - 1e-6) {
        best = {
          tile: candidate,
          offAxisSq,
          distanceSq: fallbackDistanceSq,
        };
        continue;
      }

      if (
        Math.abs(offAxisSq - best.offAxisSq) <= 1e-6 &&
        fallbackDistanceSq < best.distanceSq
      ) {
        best = {
          tile: candidate,
          offAxisSq,
          distanceSq: fallbackDistanceSq,
        };
      }
    }

    return best?.tile;
  }

  private composeMissileKey(
    type: string,
    target: TileSummary,
    ownerId?: string,
  ): string {
    const normalizedType = type.replace(/\s+/g, "-").toLowerCase();
    const ownerSegment = ownerId ?? "unknown";
    return `missile-${normalizedType}-${target.x}-${target.y}-${ownerSegment}`;
  }

  private syncHistoricalMissileOverlay(): void {
    const historicalEnabled = this.isOverlayEnabled(
      HISTORICAL_MISSILE_OVERLAY_ID,
    );
    const impactEnabled = this.isOverlayEnabled(MISSILE_IMPACT_OVERLAY_ID);
    if (!historicalEnabled && !impactEnabled) {
      return;
    }
    const flights = this.collectHistoricalMissiles();
    if (historicalEnabled) {
      this.historicalMissileOverlay?.setTrajectories(flights);
    }
    if (impactEnabled) {
      this.missileImpactOverlay?.setTrajectories(flights);
    }
  }

  private syncDonationOverlay(
    overlay: TroopDonationOverlay | GoldDonationOverlay | undefined,
    players?: PlayerViewLike[],
  ): void {
    if (!overlay) {
      return;
    }

    let source = players;
    if (!source) {
      try {
        source = this.game?.playerViews?.();
      } catch (error) {
        console.warn("Failed to refresh donation overlay players", error);
        source = [];
      }
    }
    if (!Array.isArray(source)) {
      source = [];
    }

    const snapshots: TroopDonationOverlayPlayerSnapshot[] = [];
    for (const player of source) {
      try {
        const id = this.safePlayerId(player);
        if (!id) {
          continue;
        }
        let location: { x: number; y: number } | undefined;
        try {
          location = player.nameLocation?.();
        } catch (error) {
          console.warn("Failed to read player name location", error);
        }

        snapshots.push({
          id,
          name: this.safePlayerName(player),
          x: location?.x ?? null,
          y: location?.y ?? null,
          color: this.resolvePlayerColor(player),
          alive: player.isAlive(),
        });
      } catch (error) {
        console.warn("Failed to update donation overlay for player", error);
      }
    }

    overlay.setPlayerSnapshots(snapshots);
  }

  private syncTroopDonationOverlay(players?: PlayerViewLike[]): void {
    this.syncDonationOverlay(this.troopDonationOverlay, players);
  }

  private syncGoldDonationOverlay(players?: PlayerViewLike[]): void {
    this.syncDonationOverlay(this.goldDonationOverlay, players);
  }

  private syncTradeRouteOverlay(
    players?: PlayerViewLike[],
    recordLookup?: Map<string, PlayerRecord>,
  ): void {
    if (!this.tradeRouteOverlay) {
      return;
    }

    let sourcePlayers = players;
    if (!sourcePlayers && this.game) {
      try {
        sourcePlayers = this.game.playerViews();
      } catch (error) {
        console.warn("Failed to refresh players for trade overlay", error);
        sourcePlayers = [];
      }
    }
    sourcePlayers = sourcePlayers ?? [];

    let lookup = recordLookup;
    if (!lookup) {
      lookup = new Map<string, PlayerRecord>();
      for (const record of this.snapshot.players) {
        lookup.set(record.id, record);
      }
    }

    const ports = this.collectTradeRoutePorts(sourcePlayers, lookup);
    const localSmallId = this.resolveLocalPlayerSmallId();
    this.tradeRouteOverlay.setLocalPlayerSmallId(localSmallId);
    this.tradeRouteOverlay.setPortSummaries(ports);
  }

  private syncAttackBorderOverlay(players?: PlayerViewLike[]): void {
    if (!this.attackBorderOverlay || !this.attackBorderOverlay.isActive()) {
      return;
    }

    if (this.attackBorderSyncInFlight) {
      this.attackBorderSyncQueued = true;
      return;
    }

    this.attackBorderSyncInFlight = true;
    void this.computeAttackBorderLabels(players)
      .then((labels) => {
        if (!this.attackBorderOverlay || !this.attackBorderOverlay.isActive()) {
          return;
        }
        this.attackBorderOverlay.setLabels(labels);
      })
      .catch((error) => {
        console.warn("Failed to refresh attack border overlay", error);
      })
      .finally(() => {
        this.attackBorderSyncInFlight = false;
        if (this.attackBorderSyncQueued) {
          this.attackBorderSyncQueued = false;
          this.syncAttackBorderOverlay();
        }
      });
  }

  private async computeAttackBorderLabels(
    players?: PlayerViewLike[],
  ): Promise<AttackBorderLabelSummary[]> {
    const game = this.game;
    if (!game) {
      return [];
    }

    let sourcePlayers = players;
    if (!sourcePlayers) {
      try {
        sourcePlayers = game.playerViews();
      } catch (error) {
        console.warn("Failed to refresh players for attack overlay", error);
        sourcePlayers = [];
      }
    }
    sourcePlayers = sourcePlayers ?? [];

    if (sourcePlayers.length === 0) {
      return [];
    }

    type PairAttackSummary = {
      id: string;
      troops: number;
      averagePosition: { x: number; y: number } | null;
    };

    const attackerPairs = new Map<number, Map<number, PairAttackSummary[]>>();
    const attackers = new Map<number, PlayerViewLike>();

    for (const player of sourcePlayers) {
      const attackerSmallId = player.smallID();
      const outgoing = player.outgoingAttacks();
      if (!Array.isArray(outgoing) || outgoing.length === 0) {
        continue;
      }
      for (const attack of outgoing) {
        if (attack.retreating || attack.targetID <= 0) {
          continue;
        }
        if (attack.targetID === attackerSmallId) {
          continue;
        }
        const resolvedTroops = Math.max(0, this.resolveAttackTroops(attack));
        if (resolvedTroops <= 0) {
          continue;
        }
        let targetMap = attackerPairs.get(attackerSmallId);
        if (!targetMap) {
          targetMap = new Map<number, PairAttackSummary[]>();
          attackerPairs.set(attackerSmallId, targetMap);
        }
        const existing = targetMap.get(attack.targetID) ?? [];
        existing.push({
          id: String(attack.id),
          troops: resolvedTroops,
          averagePosition: null,
        });
        targetMap.set(attack.targetID, existing);
        attackers.set(attackerSmallId, player);
      }
    }

    if (attackerPairs.size === 0) {
      return [];
    }

    const borderRefsByAttacker = new Map<number, number[]>();
    await Promise.all(
      Array.from(attackerPairs.keys()).map(async (attackerSmallId) => {
        const attacker = attackers.get(attackerSmallId);
        if (!attacker) {
          return;
        }
        const refs = await this.resolvePlayerBorderTileRefs(attacker);
        borderRefsByAttacker.set(attackerSmallId, refs);
      }),
    );
    await Promise.all(
      Array.from(attackerPairs.entries()).flatMap(
        ([attackerSmallId, targetMap]) => {
          const attacker = attackers.get(attackerSmallId);
          return Array.from(targetMap.values()).flatMap((pairAttacks) =>
            pairAttacks.map(async (attack) => {
              attack.averagePosition = await this.resolveAttackAveragePosition(
                game,
                attacker,
                attackerSmallId,
                attack.id,
              );
            }),
          );
        },
      ),
    );

    const labels: AttackBorderLabelSummary[] = [];

    for (const [attackerSmallId, targetMap] of attackerPairs.entries()) {
      const borderRefs = borderRefsByAttacker.get(attackerSmallId) ?? [];
      if (borderRefs.length === 0) {
        continue;
      }

      const attackerBorderSet = new Set<number>();
      for (const ref of borderRefs) {
        if (game.ownerID(ref) === attackerSmallId) {
          attackerBorderSet.add(ref);
        }
      }
      if (attackerBorderSet.size === 0) {
        continue;
      }

      const attacker = attackers.get(attackerSmallId);
      for (const [targetSmallId, pairAttacks] of targetMap.entries()) {
        if (pairAttacks.length <= 0) {
          continue;
        }
        type FrontEdge = {
          attackerRef: number;
          midpoint: { x: number; y: number };
          vertexAKey: string;
          vertexBKey: string;
        };

        const edges: FrontEdge[] = [];
        for (const ref of attackerBorderSet) {
          const attackerX = game.x(ref);
          const attackerY = game.y(ref);
          const neighbors = game.neighbors(ref) ?? [];
          for (const neighbor of neighbors) {
            if (game.ownerID(neighbor) !== targetSmallId) {
              continue;
            }
            const targetX = game.x(neighbor);
            const targetY = game.y(neighbor);
            const vertices = this.resolveSharedEdgeVertices(
              attackerX,
              attackerY,
              targetX,
              targetY,
            );
            if (!vertices) {
              continue;
            }
            edges.push({
              attackerRef: ref,
              midpoint: {
                x: (attackerX + targetX + 1) / 2,
                y: (attackerY + targetY + 1) / 2,
              },
              vertexAKey: `${vertices[0].x},${vertices[0].y}`,
              vertexBKey: `${vertices[1].x},${vertices[1].y}`,
            });
          }
        }

        if (edges.length <= 0) {
          continue;
        }

        const vertexToEdges = new Map<string, number[]>();
        for (let index = 0; index < edges.length; index += 1) {
          const edge = edges[index];
          const aBucket = vertexToEdges.get(edge.vertexAKey) ?? [];
          aBucket.push(index);
          vertexToEdges.set(edge.vertexAKey, aBucket);

          const bBucket = vertexToEdges.get(edge.vertexBKey) ?? [];
          bBucket.push(index);
          vertexToEdges.set(edge.vertexBKey, bBucket);
        }

        const visited = new Set<number>();
        type EdgeComponent = {
          edgeIndices: number[];
          edgeMidpoints: Array<{ x: number; y: number }>;
          attackerRefs: number[];
          minX: number;
          maxX: number;
          minY: number;
          maxY: number;
        };
        const rawComponents: EdgeComponent[] = [];
        for (let startIndex = 0; startIndex < edges.length; startIndex += 1) {
          if (visited.has(startIndex)) {
            continue;
          }

          const componentIndices: number[] = [];
          const queue: number[] = [startIndex];
          visited.add(startIndex);

          while (queue.length > 0) {
            const edgeIndex = queue.pop()!;
            componentIndices.push(edgeIndex);
            const edge = edges[edgeIndex];
            const adjacent = [
              ...(vertexToEdges.get(edge.vertexAKey) ?? []),
              ...(vertexToEdges.get(edge.vertexBKey) ?? []),
            ];
            for (const nextIndex of adjacent) {
              if (visited.has(nextIndex)) {
                continue;
              }
              visited.add(nextIndex);
              queue.push(nextIndex);
            }
          }

          if (componentIndices.length <= 0) {
            continue;
          }

          const edgeMidpoints = componentIndices.map(
            (edgeIndex) => edges[edgeIndex].midpoint,
          );
          const attackerRefs = componentIndices.map(
            (edgeIndex) => edges[edgeIndex].attackerRef,
          );
          let minX = Number.POSITIVE_INFINITY;
          let maxX = Number.NEGATIVE_INFINITY;
          let minY = Number.POSITIVE_INFINITY;
          let maxY = Number.NEGATIVE_INFINITY;
          for (const midpoint of edgeMidpoints) {
            if (midpoint.x < minX) minX = midpoint.x;
            if (midpoint.x > maxX) maxX = midpoint.x;
            if (midpoint.y < minY) minY = midpoint.y;
            if (midpoint.y > maxY) maxY = midpoint.y;
          }
          rawComponents.push({
            edgeIndices: componentIndices,
            edgeMidpoints,
            attackerRefs,
            minX,
            maxX,
            minY,
            maxY,
          });
        }

        if (rawComponents.length <= 0) {
          continue;
        }

        const componentsCanMerge = (
          a: EdgeComponent,
          b: EdgeComponent,
        ): boolean => {
          const dx =
            a.minX > b.maxX
              ? a.minX - b.maxX
              : b.minX > a.maxX
                ? b.minX - a.maxX
                : 0;
          const dy =
            a.minY > b.maxY
              ? a.minY - b.maxY
              : b.minY > a.maxY
                ? b.minY - a.maxY
                : 0;
          if (
            dx * dx + dy * dy >
            ATTACK_FRONT_EDGE_GAP_MERGE_TILES *
              ATTACK_FRONT_EDGE_GAP_MERGE_TILES
          ) {
            return false;
          }
          for (const aPoint of a.edgeMidpoints) {
            for (const bPoint of b.edgeMidpoints) {
              const ddx = aPoint.x - bPoint.x;
              const ddy = aPoint.y - bPoint.y;
              if (
                ddx * ddx + ddy * ddy <=
                ATTACK_FRONT_EDGE_GAP_MERGE_TILES *
                  ATTACK_FRONT_EDGE_GAP_MERGE_TILES
              ) {
                return true;
              }
            }
          }
          return false;
        };

        const components = [...rawComponents];
        let merged = true;
        while (merged) {
          merged = false;
          for (let i = 0; i < components.length; i += 1) {
            for (let j = i + 1; j < components.length; j += 1) {
              if (!componentsCanMerge(components[i], components[j])) {
                continue;
              }
              const mergedMidpoints = [
                ...components[i].edgeMidpoints,
                ...components[j].edgeMidpoints,
              ];
              const mergedRefs = [
                ...components[i].attackerRefs,
                ...components[j].attackerRefs,
              ];
              components[i] = {
                edgeIndices: [
                  ...components[i].edgeIndices,
                  ...components[j].edgeIndices,
                ],
                edgeMidpoints: mergedMidpoints,
                attackerRefs: mergedRefs,
                minX: Math.min(components[i].minX, components[j].minX),
                maxX: Math.max(components[i].maxX, components[j].maxX),
                minY: Math.min(components[i].minY, components[j].minY),
                maxY: Math.max(components[i].maxY, components[j].maxY),
              };
              components.splice(j, 1);
              merged = true;
              break;
            }
            if (merged) {
              break;
            }
          }
        }

        type FrontComponentSummary = {
          anchor: { x: number; y: number };
          edgeCount: number;
          componentKey: number;
        };

        const frontComponents: FrontComponentSummary[] = [];
        for (const component of components) {
          const edgeMidpoints = component.edgeMidpoints;
          let centroidX = 0;
          let centroidY = 0;
          for (const midpoint of edgeMidpoints) {
            centroidX += midpoint.x;
            centroidY += midpoint.y;
          }
          centroidX /= edgeMidpoints.length;
          centroidY /= edgeMidpoints.length;

          // Pin the label to an actual shared-edge midpoint nearest the front center.
          let anchor = edgeMidpoints[0];
          let bestDist2 = Number.POSITIVE_INFINITY;
          for (const midpoint of edgeMidpoints) {
            const dx = midpoint.x - centroidX;
            const dy = midpoint.y - centroidY;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < bestDist2) {
              bestDist2 = dist2;
              anchor = midpoint;
            }
          }

          let componentKey = Number.POSITIVE_INFINITY;
          for (const candidate of component.attackerRefs) {
            if (candidate < componentKey) {
              componentKey = candidate;
            }
          }

          frontComponents.push({
            anchor,
            edgeCount: edgeMidpoints.length,
            componentKey,
          });
        }

        const hasPositionedAttacks = pairAttacks.some(
          (attack) =>
            attack.averagePosition &&
            Number.isFinite(attack.averagePosition.x) &&
            Number.isFinite(attack.averagePosition.y),
        );
        if (hasPositionedAttacks) {
          const troopsByFrontIndex = new Map<
            number,
            { troops: number; attackId: string }
          >();
          for (const attack of pairAttacks) {
            const position = attack.averagePosition;
            if (
              !position ||
              !Number.isFinite(position.x) ||
              !Number.isFinite(position.y)
            ) {
              continue;
            }
            let nearestFrontIndex = -1;
            let nearestDistanceSquared = Number.POSITIVE_INFINITY;
            for (
              let componentIndex = 0;
              componentIndex < frontComponents.length;
              componentIndex += 1
            ) {
              const component = frontComponents[componentIndex];
              const dx = position.x - component.anchor.x;
              const dy = position.y - component.anchor.y;
              const distanceSquared = dx * dx + dy * dy;
              if (distanceSquared < nearestDistanceSquared) {
                nearestDistanceSquared = distanceSquared;
                nearestFrontIndex = componentIndex;
              }
            }
            if (nearestFrontIndex < 0) {
              continue;
            }
            const existing = troopsByFrontIndex.get(nearestFrontIndex);
            if (!existing) {
              troopsByFrontIndex.set(nearestFrontIndex, {
                troops: attack.troops,
                attackId: attack.id,
              });
              continue;
            }
            existing.troops += attack.troops;
            if (attack.id.localeCompare(existing.attackId) < 0) {
              existing.attackId = attack.id;
            }
          }

          for (const [frontIndex, aggregate] of troopsByFrontIndex.entries()) {
            const component = frontComponents[frontIndex];
            if (!component) {
              continue;
            }
            const troopText = this.formatAttackBorderTroopCount(
              aggregate.troops,
            );
            if (!troopText) {
              continue;
            }
            const minScale = this.resolveAttackBorderLabelMinScale(
              component.edgeCount,
            );
            labels.push({
              id: `attack-border-${attackerSmallId}-${targetSmallId}-${aggregate.attackId}-${component.componentKey}`,
              x: component.anchor.x,
              y: component.anchor.y,
              text: troopText,
              color: attacker
                ? (this.resolvePlayerColor(attacker) ?? undefined)
                : undefined,
              minScale: minScale > 0 ? minScale : undefined,
            });
          }
          continue;
        }

        const unassignedAttackIndices = new Set<number>(
          pairAttacks.map((_, index) => index),
        );
        for (const component of frontComponents) {
          const matchedAttack = this.selectAttackForFront(
            component.anchor,
            pairAttacks,
            unassignedAttackIndices,
          );
          if (!matchedAttack) {
            continue;
          }
          const troopText = this.formatAttackBorderTroopCount(
            matchedAttack.troops,
          );
          if (!troopText) {
            continue;
          }
          const minScale = this.resolveAttackBorderLabelMinScale(
            component.edgeCount,
          );
          labels.push({
            id: `attack-border-${attackerSmallId}-${targetSmallId}-${matchedAttack.id}-${component.componentKey}`,
            x: component.anchor.x,
            y: component.anchor.y,
            text: troopText,
            color: attacker
              ? (this.resolvePlayerColor(attacker) ?? undefined)
              : undefined,
            minScale: minScale > 0 ? minScale : undefined,
          });
        }
      }
    }

    labels.sort((a, b) => a.id.localeCompare(b.id));
    return labels;
  }

  private async resolveAttackAveragePosition(
    game: GameViewLike,
    attacker: PlayerViewLike | undefined,
    attackerSmallId: number,
    attackId: string,
  ): Promise<{ x: number; y: number } | null> {
    const extractPosition = (raw: unknown): { x: number; y: number } | null => {
      if (!raw || typeof raw !== "object") {
        return null;
      }
      const x = Number((raw as { x?: unknown }).x);
      const y = Number((raw as { y?: unknown }).y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
      }
      return { x, y };
    };

    const attackerResolver = attacker?.attackAveragePosition;
    if (typeof attackerResolver === "function") {
      try {
        const resolved = await attackerResolver.call(
          attacker,
          attackerSmallId,
          attackId,
        );
        const normalized = extractPosition(resolved);
        if (normalized) {
          return normalized;
        }
      } catch (error) {
        console.warn("Failed to resolve attack average position", error);
      }
    }

    const gameResolver = game.attackAveragePosition;
    if (typeof gameResolver !== "function") {
      return null;
    }
    try {
      const resolved = await gameResolver.call(game, attackerSmallId, attackId);
      return extractPosition(resolved);
    } catch (error) {
      console.warn("Failed to resolve attack average position", error);
      return null;
    }
  }

  private selectAttackForFront(
    anchor: { x: number; y: number },
    attacks: ReadonlyArray<{
      id: string;
      troops: number;
      averagePosition: { x: number; y: number } | null;
    }>,
    unassignedIndices: Set<number>,
  ): {
    id: string;
    troops: number;
    averagePosition: { x: number; y: number } | null;
  } | null {
    if (attacks.length === 0) {
      return null;
    }

    const candidateIndices =
      unassignedIndices.size > 0
        ? [...unassignedIndices]
        : attacks.map((_, index) => index);
    if (candidateIndices.length === 0) {
      return null;
    }

    let nearestIndex: number | null = null;
    let nearestDistanceSquared = Number.POSITIVE_INFINITY;
    for (const index of candidateIndices) {
      const candidate = attacks[index];
      const position = candidate.averagePosition;
      if (
        !position ||
        !Number.isFinite(position.x) ||
        !Number.isFinite(position.y)
      ) {
        continue;
      }
      const dx = position.x - anchor.x;
      const dy = position.y - anchor.y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < nearestDistanceSquared) {
        nearestDistanceSquared = distanceSquared;
        nearestIndex = index;
      }
    }

    const selectedIndex = nearestIndex ?? candidateIndices[0];
    unassignedIndices.delete(selectedIndex);
    return attacks[selectedIndex] ?? null;
  }

  private resolveSharedEdgeVertices(
    attackerX: number,
    attackerY: number,
    targetX: number,
    targetY: number,
  ): [{ x: number; y: number }, { x: number; y: number }] | null {
    if (targetX === attackerX + 1 && targetY === attackerY) {
      return [
        { x: attackerX + 1, y: attackerY },
        { x: attackerX + 1, y: attackerY + 1 },
      ];
    }
    if (targetX === attackerX - 1 && targetY === attackerY) {
      return [
        { x: attackerX, y: attackerY },
        { x: attackerX, y: attackerY + 1 },
      ];
    }
    if (targetX === attackerX && targetY === attackerY + 1) {
      return [
        { x: attackerX, y: attackerY + 1 },
        { x: attackerX + 1, y: attackerY + 1 },
      ];
    }
    if (targetX === attackerX && targetY === attackerY - 1) {
      return [
        { x: attackerX, y: attackerY },
        { x: attackerX + 1, y: attackerY },
      ];
    }
    return null;
  }

  private async resolvePlayerBorderTileRefs(
    player: PlayerViewLike,
  ): Promise<number[]> {
    const borderTilesGetter = player.borderTiles;
    if (typeof borderTilesGetter !== "function") {
      return [];
    }
    try {
      const payload = await borderTilesGetter.call(player);
      if (!payload || typeof payload !== "object") {
        return [];
      }
      const refs = (payload as { borderTiles?: unknown }).borderTiles;
      return this.normalizeBorderTileRefs(refs);
    } catch (error) {
      console.warn("Failed to resolve player border tiles", error);
      return [];
    }
  }

  private normalizeBorderTileRefs(raw: unknown): number[] {
    if (!raw || typeof raw !== "object") {
      return [];
    }
    const iterable = (raw as Iterable<unknown>)[Symbol.iterator];
    if (typeof iterable !== "function") {
      return [];
    }
    const refs: number[] = [];
    for (const value of raw as Iterable<unknown>) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        continue;
      }
      refs.push(numeric);
    }
    return refs;
  }

  private resolveTransformHandler(): TransformHandlerLike | null {
    if (typeof document === "undefined") {
      return null;
    }

    const candidates: TransformHostElement[] = [
      this.hostDocument.querySelector("build-menu") as TransformHostElement,
      this.hostDocument.querySelector("emoji-table") as TransformHostElement,
    ].filter((element): element is TransformHostElement => !!element);

    for (const element of candidates) {
      if (element.transformHandler) {
        return element.transformHandler;
      }
    }
    return null;
  }

  private resolveUiState(): UiStateLike | null {
    if (typeof document === "undefined") {
      return null;
    }
    const controlPanel = this.hostDocument.querySelector(
      "control-panel",
    ) as ControlPanelElement | null;
    if (controlPanel?.uiState) {
      return controlPanel.uiState;
    }
    return null;
  }

  private isMissileSiloReady(unit: UnitViewLike): boolean {
    const levelValue = this.extractMissileSiloLevel(unit);
    if (typeof levelValue !== "number" || !Number.isFinite(levelValue)) {
      return true;
    }
    const queue = this.extractMissileTimerQueue(unit);
    if (!Array.isArray(queue)) {
      return true;
    }
    return queue.length < levelValue;
  }

  private extractMissileSiloLevel(unit: UnitViewLike): number | undefined {
    const candidate = unit as UnitViewLike & {
      level?: number | (() => number);
      data?: { level?: number };
    };

    if (typeof candidate.level === "function") {
      try {
        const value = candidate.level.call(unit);
        if (Number.isFinite(value)) {
          return value;
        }
      } catch (error) {
        // Ignore failures; we'll fall back to other sources below.
      }
    } else if (
      typeof candidate.level === "number" &&
      Number.isFinite(candidate.level)
    ) {
      return candidate.level;
    }

    const dataLevel = candidate.data?.level;
    if (typeof dataLevel === "number" && Number.isFinite(dataLevel)) {
      return dataLevel;
    }
    return undefined;
  }

  private extractMissileTimerQueue(unit: UnitViewLike): number[] | undefined {
    const candidate = unit as UnitViewLike & {
      missileTimerQueue?: number[] | (() => number[]);
      data?: { missileTimerQueue?: number[] };
    };

    const direct = candidate.missileTimerQueue;
    if (Array.isArray(direct)) {
      return direct;
    }
    if (typeof direct === "function") {
      try {
        const value = direct.call(unit);
        if (Array.isArray(value)) {
          return value;
        }
      } catch (error) {
        // Ignore failures; fall back to other representations.
      }
    }

    const dataQueue = candidate.data?.missileTimerQueue;
    if (Array.isArray(dataQueue)) {
      return dataQueue;
    }
    return undefined;
  }

  private createInitialActionsState(): SidebarActionsState {
    const now = Date.now();
    const tradeBan = this.createActionDefinition({
      name: "Trade ban everyone in the game",
      code:
        "// Stops trading with every known player\n" +
        "for (const player of game.players) {\n" +
        "  game.stopTrade(player.id);\n" +
        "}\n",
      runMode: "once",
      description: "Stops trading with every known player immediately.",
      runIntervalTicks: 1,
      settings: [
        this.createSetting({
          key: "includeAllies",
          label: "Include allies",
          type: "toggle",
          value: false,
        }),
      ],
      timestamp: now,
    });
    const enableTrade = this.createActionDefinition({
      name: "Enable trade with everyone in the game",
      code:
        "// Restores trading with every known player\n" +
        "for (const player of game.players) {\n" +
        "  game.startTrade(player.id);\n" +
        "}\n",
      runMode: "once",
      description: "Resumes trading with every known player.",
      runIntervalTicks: 1,
      settings: [
        this.createSetting({
          key: "skipAllies",
          label: "Skip current allies",
          type: "toggle",
          value: true,
        }),
      ],
      timestamp: now,
    });

    const missileSiloAlerts = this.createActionDefinition({
      name: "Warn when missile silos are built",
      code:
        "exports.run = ({ events, logger }) => {\n" +
        "  const formatLocation = (event) => {\n" +
        "    if (event.tile) {\n" +
        "      return `${event.tile.x}, ${event.tile.y}`;\n" +
        "    }\n" +
        '    return "unknown location";\n' +
        "  };\n" +
        "  const describeOwner = (event) => event.ownerName ?? `Player ${event.ownerId}`;\n" +
        '  const missileSiloFilter = (event) => event.unitType === "Missile Silo";\n' +
        "  events.oncePerTeam(\n" +
        '    "structureBuilt",\n' +
        "    (event) => {\n" +
        '      const teamLabel = event.team ?? "No team";\n' +
        '      const teamId = event.team ?? "Solo";\n' +
        "      const locationLabel = formatLocation(event);\n" +
        "      logger.warn(\n" +
        "        `${teamLabel} built a Missile Silo at ${locationLabel} (${describeOwner(event)})`,\n" +
        "        {\n" +
        "          tokens: [\n" +
        '            { type: "team", id: teamId, label: teamLabel, color: event.teamColor ?? event.ownerColor },\n' +
        '            { type: "text", text: " built a Missile Silo at " + locationLabel + " (" },\n' +
        '            { type: "player", id: event.ownerId, label: describeOwner(event), color: event.ownerColor },\n' +
        '            { type: "text", text: ")" },\n' +
        "          ],\n" +
        "        },\n" +
        "      );\n" +
        "    },\n" +
        "    { filter: missileSiloFilter },\n" +
        "  );\n" +
        "  events.oncePerClan(\n" +
        '    "structureBuilt",\n' +
        "    (event) => {\n" +
        '      const clanLabel = event.clan ? `Clan ${event.clan}` : "No clan";\n' +
        '      const clanId = event.clan ?? "Unaffiliated";\n' +
        "      const locationLabel = formatLocation(event);\n" +
        "      logger.warn(\n" +
        "        `${clanLabel} built a Missile Silo at ${locationLabel} (${describeOwner(event)})`,\n" +
        "        {\n" +
        "          tokens: [\n" +
        '            { type: "clan", id: clanId, label: clanLabel, color: event.clanColor ?? event.ownerColor },\n' +
        '            { type: "text", text: " built a Missile Silo at " + locationLabel + " (" },\n' +
        '            { type: "player", id: event.ownerId, label: describeOwner(event), color: event.ownerColor },\n' +
        '            { type: "text", text: ")" },\n' +
        "          ],\n" +
        "        },\n" +
        "      );\n" +
        "    },\n" +
        "    { filter: missileSiloFilter },\n" +
        "  );\n" +
        "};\n",
      runMode: "event",
      description:
        "Logs a warning the first time each team and clan places a Missile Silo while the action is running.",
      runIntervalTicks: 1,
      settings: [],
      timestamp: now,
    });

    const troopDonationLogger = this.createActionDefinition({
      name: "Log troop donations",
      code:
        "exports.run = ({ events, logger }) => {\n" +
        "  events.on(\n" +
        '    "troopsDonated",\n' +
        "    ({ senderId, senderName, senderColor, recipientId, recipientName, recipientColor, amountDisplay }) => {\n" +
        "      logger.info(\n" +
        "        `${senderName} sent ${amountDisplay} troops to ${recipientName}`,\n" +
        "        {\n" +
        "          tokens: [\n" +
        '            { type: "player", id: senderId, label: senderName, color: senderColor },\n' +
        '            { type: "text", text: " sent " + amountDisplay + " troops to " },\n' +
        '            { type: "player", id: recipientId, label: recipientName, color: recipientColor },\n' +
        "          ],\n" +
        "        },\n" +
        "      );\n" +
        "    },\n" +
        "  );\n" +
        "};\n",
      runMode: "event",
      description:
        "Writes an info log entry whenever a troop donation is detected while the action is running.",
      runIntervalTicks: 1,
      settings: [],
      timestamp: now,
    });

    const goldDonationLogger = this.createActionDefinition({
      name: "Log gold donations",
      code:
        "exports.run = ({ events, logger }) => {\n" +
        "  events.on(\n" +
        '    "goldDonated",\n' +
        "    ({ senderId, senderName, senderColor, recipientId, recipientName, recipientColor, amountDisplay }) => {\n" +
        "      logger.info(\n" +
        "        `${senderName} sent ${amountDisplay} gold to ${recipientName}`,\n" +
        "        {\n" +
        "          tokens: [\n" +
        '            { type: "player", id: senderId, label: senderName, color: senderColor },\n' +
        '            { type: "text", text: " sent " + amountDisplay + " gold to " },\n' +
        '            { type: "player", id: recipientId, label: recipientName, color: recipientColor },\n' +
        "          ],\n" +
        "        },\n" +
        "      );\n" +
        "    },\n" +
        "  );\n" +
        "};\n",
      runMode: "event",
      description:
        "Writes an info log entry whenever a gold donation is detected while the action is running.",
      runIntervalTicks: 1,
      settings: [],
      timestamp: now,
    });

    const autoJoinClanLobby = this.createActionDefinition({
      name: "Join lobby with largest clan",
      code:
        "exports.run = ({ lobby, logger, state, events, snapshot }) => {\n" +
        "  let inGame = snapshot.players.some(p => !p.isLobbyPlayer);\n" +
        '  events.on("gameAttached", () => {\n' +
        "    inGame = true;\n" +
        "    state.lastJoinGameId = undefined;\n" +
        "  });\n" +
        '  events.on("gameDetached", () => {\n' +
        "    inGame = false;\n" +
        "    state.lastJoinGameId = undefined;\n" +
        "    state.lastJoinedGameId = undefined;\n" +
        "  });\n" +
        "  const apply = (queue) => {\n" +
        "    if (!queue) {\n" +
        "      state.lastJoinGameId = undefined;\n" +
        "      state.lastJoinedGameId = undefined;\n" +
        "      state.lastAppliedDisplayName = undefined;\n" +
        "      return;\n" +
        "    }\n" +
        "    if (state.lastJoinedGameId === queue.gameId) {\n" +
        "      return;\n" +
        "    }\n" +
        "    if (inGame) {\n" +
        '      logger.info("Already in an active game; skipping join.");\n' +
        "      state.lastJoinGameId = undefined;\n" +
        "      return;\n" +
        "    }\n" +
        "    if (!queue.playerTeams) {\n" +
        '      logger.info("Skipping FFA lobby (not a team game)");\n' +
        "      return;\n" +
        "    }\n" +
        "    if (queue.playerCount >= queue.maxPlayers) {\n" +
        '      logger.info("Lobby is full; skipping join.");\n' +
        "      return;\n" +
        "    }\n" +
        "    const players = Array.isArray(queue.players) ? queue.players : [];\n" +
        "    if (players.length === 0) {\n" +
        '      logger.info("Lobby has no visible players; skipping join.");\n' +
        "      return;\n" +
        "    }\n" +
        "    const counts = new Map();\n" +
        "    for (const entry of players) {\n" +
        "      const tag = lobby.extractClanTag(entry.name);\n" +
        "      if (!tag) continue;\n" +
        "      counts.set(tag, (counts.get(tag) ?? 0) + 1);\n" +
        "    }\n" +
        "    if (counts.size === 0) {\n" +
        '      logger.info("No clans detected in lobby; keeping existing name.");\n' +
        "    }\n" +
        "    let best = null;\n" +
        "    for (const [tag, count] of counts.entries()) {\n" +
        "      if (!best || count > best.count || (count === best.count && tag < best.tag)) {\n" +
        "        best = { tag, count };\n" +
        "      }\n" +
        "    }\n" +
        "    let teamSize = 0;\n" +
        "    if (typeof queue.playerTeams === 'number') {\n" +
        "      teamSize = Math.floor(queue.maxPlayers / queue.playerTeams);\n" +
        "    } else if (queue.playerTeams === 'Duos') {\n" +
        "      teamSize = 2;\n" +
        "    } else if (queue.playerTeams === 'Trios') {\n" +
        "      teamSize = 3;\n" +
        "    } else if (queue.playerTeams === 'Quads') {\n" +
        "      teamSize = 4;\n" +
        "    } else if (queue.playerTeams === 'Humans Vs Nations') {\n" +
        "      teamSize = Math.floor(queue.maxPlayers / 2);\n" +
        "    }\n" +
        "    if (best && teamSize > 0 && best.count >= teamSize) {\n" +
        "      logger.info(`Clan ${best.tag} already has ${best.count} players (team size: ${teamSize}); skipping join to avoid overfilling.`);\n" +
        "      return;\n" +
        "    }\n" +
        "    const slotsLeft = queue.maxPlayers - queue.playerCount;\n" +
        "    const slotThreshold = Math.ceil(queue.maxPlayers * 0.2);\n" +
        "    if (slotsLeft > slotThreshold) {\n" +
        "      logger.info(`Waiting for lobby to fill more (${slotsLeft} slots remaining, waiting for ${slotThreshold} or fewer)`);\n" +
        "      return;\n" +
        "    }\n" +
        '    const currentName = (typeof lobby.getDisplayName === "function" && lobby.getDisplayName()) || "";\n' +
        '    const baseName = currentName.replace(/^\\s*\\[[^\\]]+\\]\\s*/, "").trim() || currentName.trim() || "Player";\n' +
        "    const nextName = lobby.buildNameWithClanTag(baseName, best?.tag);\n" +
        "    if (state.lastAppliedDisplayName !== nextName) {\n" +
        "      if (lobby.setDisplayName(nextName)) {\n" +
        "        state.lastAppliedDisplayName = nextName;\n" +
        '        logger.info(`Set lobby name to "${nextName}"`);\n' +
        "      } else {\n" +
        '        logger.warn("Failed to update lobby display name.");\n' +
        "      }\n" +
        "    }\n" +
        "    const alreadyAttempted = state.lastJoinGameId === queue.gameId;\n" +
        "    if (!alreadyAttempted) {\n" +
        "      const joined = lobby.join(queue.gameId);\n" +
        "      state.lastJoinGameId = queue.gameId;\n" +
        "      if (joined) {\n" +
        "        logger.info(`Joining lobby ${queue.gameId} with ${nextName}`);\n" +
        "        state.lastJoinedGameId = queue.gameId;\n" +
        "      } else {\n" +
        '        logger.warn("Could not request lobby join (maybe already in-game?)");\n' +
        "      }\n" +
        "    }\n" +
        "  };\n" +
        "  apply(snapshot.currentLobbyQueue);\n" +
        '  events.on("lobbyUpdated", (queue) => {\n' +
        "    apply(queue || lobby.queue);\n" +
        "  });\n" +
        "};",
      runMode: "event",
      description:
        "Automatically joins team game lobbies with the largest clan when 20% or fewer slots remain and the clan won't exceed team size. Once joined, stays in that game.",
      runIntervalTicks: 1,
      enabled: false,
      settings: [],
      timestamp: now,
    });

    const actions = [
      tradeBan,
      enableTrade,
      missileSiloAlerts,
      troopDonationLogger,
      goldDonationLogger,
      autoJoinClanLobby,
    ];
    return {
      revision: 1,
      runningRevision: 1,
      actions,
      running: [],
      selectedActionId: actions[0]?.id,
      selectedRunningActionId: undefined,
    };
  }

  private nextActionId(): string {
    this.actionIdCounter += 1;
    return `action-${this.actionIdCounter}`;
  }

  private nextRunningActionId(): string {
    this.runningActionIdCounter += 1;
    return `run-${this.runningActionIdCounter}`;
  }

  private nextSettingId(): string {
    this.settingIdCounter += 1;
    return `setting-${this.settingIdCounter}`;
  }

  private normalizeSettingValue(
    type: SidebarActionSettingType,
    value: SidebarActionSettingValue,
  ): SidebarActionSettingValue {
    switch (type) {
      case "number": {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
      }
      case "toggle":
        return Boolean(value);
      default:
        return String(value ?? "");
    }
  }

  private createSetting(options: {
    key: string;
    label: string;
    type?: SidebarActionSettingType;
    value?: SidebarActionSettingValue;
  }): SidebarActionSetting {
    const type = options.type ?? "text";
    const fallback = type === "number" ? 0 : type === "toggle" ? false : "";
    const rawValue = options.value ?? fallback;
    return {
      id: this.nextSettingId(),
      key: options.key,
      label: options.label,
      type,
      value: this.normalizeSettingValue(type, rawValue),
    };
  }

  private createActionDefinition(options: {
    name: string;
    code: string;
    runMode: SidebarActionDefinition["runMode"];
    enabled?: boolean;
    description?: string;
    runIntervalTicks?: number;
    settings?: SidebarActionSetting[];
    timestamp?: number;
  }): SidebarActionDefinition {
    const createdAtMs = options.timestamp ?? Date.now();
    const settings = options.settings
      ? options.settings.map((setting) => ({ ...setting }))
      : [];
    const interval = Math.max(1, Math.floor(options.runIntervalTicks ?? 1));
    return {
      id: this.nextActionId(),
      name: options.name,
      code: options.code,
      runMode: options.runMode,
      enabled: options.enabled ?? true,
      description: options.description?.trim() ?? "",
      runIntervalTicks: interval,
      settings,
      createdAtMs,
      updatedAtMs: createdAtMs,
    };
  }

  private cloneSetting(setting: SidebarActionSetting): SidebarActionSetting {
    return {
      ...setting,
      id: this.nextSettingId(),
      value: this.normalizeSettingValue(setting.type, setting.value),
    };
  }

  private cloneSettings(
    settings: SidebarActionSetting[],
  ): SidebarActionSetting[] {
    return settings.map((setting) => this.cloneSetting(setting));
  }

  private sanitizeSetting(setting: SidebarActionSetting): SidebarActionSetting {
    const type = setting.type ?? "text";
    const key = setting.key?.trim() ?? "";
    const label = setting.label?.trim() ?? "";
    const id = setting.id?.trim() ? setting.id : this.nextSettingId();
    const resolvedLabel = label !== "" ? label : key !== "" ? key : "Setting";
    return {
      id,
      key,
      label: resolvedLabel,
      type,
      value: this.normalizeSettingValue(type, setting.value),
    };
  }

  private clearRunningRemovalTimer(runId: string): void {
    const handle = this.runningRemovalTimers.get(runId);
    if (handle !== undefined) {
      clearTimeout(handle);
      this.runningRemovalTimers.delete(runId);
    }
  }

  private scheduleOneShotRemoval(runId: string): void {
    this.clearRunningRemovalTimer(runId);
    const handler = () => {
      this.runningRemovalTimers.delete(runId);
      this.completeRunningAction(runId);
    };
    const timeout = setTimeout(handler, 1500);
    this.runningRemovalTimers.set(runId, timeout);
  }

  private appendLogEntry(entry: SidebarLogEntry): void {
    this.sidebarLogs = [...this.sidebarLogs, this.enrichLogEntry(entry)];
    if (this.sidebarLogs.length > MAX_LOG_ENTRIES) {
      this.sidebarLogs = this.sidebarLogs.slice(-MAX_LOG_ENTRIES);
    }
    this.sidebarLogRevision += 1;
    this.snapshot = this.attachActionsState({ ...this.snapshot });
    this.notify();
  }

  private async refreshLocalPlayerPublicId(): Promise<void> {
    if (this.localPlayerPublicId) {
      return;
    }
    if (typeof fetch !== "function") {
      return;
    }
    try {
      const response = await fetch("/api/user_me", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as unknown;
      const candidate = (payload as { player?: { publicId?: unknown } })?.player
        ?.publicId;
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        this.localPlayerPublicId = candidate.trim();
      }
    } catch {
      return;
    }
  }

  private enrichLogEntry(
    entry: SidebarLogEntry,
    playerLookupOverride?: Map<string, PlayerRecord>,
  ): SidebarLogEntry {
    const tokens = entry.tokens;
    if (!tokens || tokens.length === 0) {
      return entry;
    }
    const playerLookup =
      playerLookupOverride ??
      new Map(this.snapshot.players.map((player) => [player.id, player]));
    let changed = false;
    const nextTokens = tokens.map((token) => {
      if (token.type !== "player") {
        return token;
      }
      const record = playerLookup.get(token.id);
      const clan = record?.clan ?? extractClanTag(record?.name ?? "");
      const team = record?.team ?? "";

      const facets: Record<string, string[]> = { ...(token.facets ?? {}) };
      const mergeFacet = (key: string, values: string[]) => {
        const normalizedValues = values
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean);
        if (normalizedValues.length === 0) {
          return;
        }
        const existing = facets[key] ?? [];
        const merged = new Set([
          ...existing
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean),
          ...normalizedValues,
        ]);
        facets[key] = Array.from(merged);
      };

      mergeFacet("user", [token.label, token.id, record?.name ?? ""]);
      mergeFacet("player", [token.label, token.id, record?.name ?? ""]);
      if (record?.publicId) {
        mergeFacet("publicid", [record.publicId]);
      }

      if (clan) {
        mergeFacet("clan", [clan, `[${clan}]`, `clan ${clan}`]);
      }
      if (team) {
        mergeFacet("team", [team, `team ${team}`]);
      }

      if (
        Object.keys(facets).length === Object.keys(token.facets ?? {}).length
      ) {
        const same = Object.entries(facets).every(([key, values]) => {
          const prev = token.facets?.[key] ?? [];
          if (prev.length !== values.length) {
            return false;
          }
          for (let i = 0; i < values.length; i += 1) {
            if (prev[i] !== values[i]) {
              return false;
            }
          }
          return true;
        });
        if (same) {
          return token;
        }
      }

      changed = true;
      return { ...token, facets };
    });

    return changed ? { ...entry, tokens: nextTokens } : entry;
  }

  private commitActionsState(
    updater: (state: SidebarActionsState) => SidebarActionsState,
  ): void {
    this.actionsState = updater(this.actionsState);
    this.snapshot = this.attachActionsState(this.snapshot);
    this.notify();
  }

  private ensureAllEventActionsRunning(): void {
    const actions = this.actionsState.actions.filter(
      (action) => action.runMode === "event" && action.enabled,
    );
    for (const action of actions) {
      this.ensureEventActionRunning(action.id);
    }
  }

  private ensureEventActionRunning(actionId: string): void {
    const action = this.actionsState.actions.find(
      (entry) => entry.id === actionId,
    );
    if (!action || action.runMode !== "event" || !action.enabled) {
      return;
    }
    const alreadyRunning = this.actionsState.running.some(
      (run) => run.actionId === actionId && run.status === "running",
    );
    if (alreadyRunning) {
      return;
    }
    this.startAction(actionId);
  }

  private stopRunsForAction(
    actionId: string,
    predicate?: (run: SidebarRunningAction) => boolean,
  ): void {
    const runs = this.actionsState.running.filter((run) => {
      if (run.actionId !== actionId) {
        return false;
      }
      if (run.status !== "running") {
        return false;
      }
      if (predicate && !predicate(run)) {
        return false;
      }
      return true;
    });
    for (const run of runs) {
      this.stopRunningAction(run.id);
    }
  }

  private stopEventRunsForAction(actionId: string): void {
    this.stopRunsForAction(actionId, (run) => run.runMode === "event");
  }

  private completeRunningAction(runId: string): void {
    this.runningRemovalTimers.delete(runId);
    this.clearRunningController(runId);
    this.commitActionsState((state) => {
      if (!state.running.some((run) => run.id === runId)) {
        return state;
      }
      const running = state.running.filter((run) => run.id !== runId);
      const selectedRunningActionId =
        state.selectedRunningActionId === runId
          ? running[running.length - 1]?.id
          : state.selectedRunningActionId;
      return {
        ...state,
        running,
        runningRevision: state.runningRevision + 1,
        selectedRunningActionId,
      };
    });
  }

  getSnapshot(): GameSnapshot {
    return this.snapshot;
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => {
      this.listeners.delete(listener);
    };
  }

  update(snapshot: GameSnapshot): void {
    const hadPlayers = this.snapshot.players.length > 0;
    const nextPlayers = snapshot.players ?? [];
    const shouldBackfillLogFacets = !hadPlayers && nextPlayers.length > 0;
    if (shouldBackfillLogFacets && this.sidebarLogs.length > 0) {
      const playerLookup = new Map(
        nextPlayers.map((player) => [player.id, player]),
      );
      this.sidebarLogs = this.sidebarLogs.map((entry) =>
        this.enrichLogEntry(entry, playerLookup),
      );
      this.sidebarLogRevision += 1;
    }
    this.snapshot = this.attachActionsState({
      ...snapshot,
      currentTimeMs: snapshot.currentTimeMs ?? Date.now(),
      ships: snapshot.ships ?? [],
    });
    this.notify();
  }

  setOverlaysTemporarilyHidden(hidden: boolean): void {
    if (this.overlaysTemporarilyHidden === hidden) {
      return;
    }

    this.overlaysTemporarilyHidden = hidden;
    this.applyOverlayVisibility();
  }

  setOverlayEnabled(overlayId: string, enabled: boolean): void {
    const overlay = this.sidebarOverlays.find(
      (entry) => entry.id === overlayId,
    );
    if (!overlay) {
      console.warn(`Sidebar overlay ${overlayId} not found`);
      return;
    }
    if (overlay.enabled === enabled) {
      return;
    }

    overlay.enabled = enabled;
    this.sidebarOverlayRevision += 1;
    this.snapshot = this.attachActionsState({ ...this.snapshot });
    this.notify();
    this.syncOverlayRuntime(overlayId);
  }

  private isOverlayEnabled(overlayId: string): boolean {
    return this.sidebarOverlays.some(
      (overlay) => overlay.id === overlayId && overlay.enabled,
    );
  }

  private applyOverlayVisibility(): void {
    const visible = !this.overlaysTemporarilyHidden;
    this.missileOverlay?.setVisible(visible);
    this.historicalMissileOverlay?.setVisible(visible);
    this.missileImpactOverlay?.setVisible(visible);
    this.troopDonationOverlay?.setVisible(visible);
    this.goldDonationOverlay?.setVisible(visible);
    this.tradeRouteOverlay?.setVisible(visible);
    this.attackBorderOverlay?.setVisible(visible);
  }

  private syncOverlayRuntime(overlayId: string): void {
    const shouldEnable = this.isOverlayEnabled(overlayId);
    const visible = !this.overlaysTemporarilyHidden;

    if (overlayId === MISSILE_TRAJECTORY_OVERLAY_ID) {
      if (!shouldEnable) {
        this.missileOverlay?.disable();
        return;
      }
      const effect = this.ensureMissileOverlay();
      effect.setVisible(visible);
      effect.setSiloPositions(this.collectMissileSiloPositions());
      effect.enable();
      return;
    }

    if (overlayId === HISTORICAL_MISSILE_OVERLAY_ID) {
      if (!shouldEnable) {
        this.historicalMissileOverlay?.disable();
        return;
      }
      const effect = this.ensureHistoricalMissileOverlay();
      effect.setVisible(visible);
      effect.setTrajectories(this.collectHistoricalMissiles());
      effect.enable();
      return;
    }

    if (overlayId === MISSILE_IMPACT_OVERLAY_ID) {
      if (!shouldEnable) {
        this.missileImpactOverlay?.disable();
        return;
      }
      const effect = this.ensureMissileImpactOverlay();
      effect.setVisible(visible);
      effect.setTrajectories(this.collectHistoricalMissiles());
      effect.enable();
      return;
    }

    if (overlayId === TROOP_DONATION_OVERLAY_ID) {
      if (!shouldEnable) {
        this.troopDonationOverlay?.disable();
        return;
      }
      const effect = this.ensureTroopDonationOverlay();
      effect.setVisible(visible);
      this.syncTroopDonationOverlay();
      effect.enable();
      return;
    }

    if (overlayId === GOLD_DONATION_OVERLAY_ID) {
      if (!shouldEnable) {
        this.goldDonationOverlay?.disable();
        return;
      }
      const effect = this.ensureGoldDonationOverlay();
      effect.setVisible(visible);
      this.syncGoldDonationOverlay();
      effect.enable();
      return;
    }

    if (overlayId === TRADE_ROUTE_OVERLAY_ID) {
      if (!shouldEnable) {
        this.tradeRouteOverlay?.disable();
        return;
      }
      const effect = this.ensureTradeRouteOverlay();
      effect.setVisible(visible);
      this.syncTradeRouteOverlay();
      effect.enable();
      return;
    }

    if (overlayId === ATTACK_BORDER_OVERLAY_ID) {
      if (!shouldEnable) {
        this.attackBorderSyncQueued = false;
        this.attackBorderOverlay?.disable();
        this.attackBorderOverlay?.clear();
        return;
      }
      const effect = this.ensureAttackBorderOverlay();
      effect.setVisible(visible);
      effect.enable();
      this.syncAttackBorderOverlay();
    }
  }

  setTradingStopped(
    targetPlayerIds: readonly string[],
    stopped: boolean,
  ): void {
    if (!this.game) {
      console.warn("Sidebar trading toggle skipped: game unavailable");
      return;
    }

    const localPlayer = this.resolveLocalPlayer();
    if (!localPlayer) {
      console.warn("Sidebar trading toggle skipped: local player unavailable");
      return;
    }

    const selfId = this.resolveSelfId(localPlayer);
    const uniqueIds = new Set(targetPlayerIds);
    const targets: PlayerViewLike[] = [];
    for (const id of uniqueIds) {
      if (selfId !== null && id === selfId) {
        continue;
      }
      const resolved = this.resolvePlayerById(id);
      if (resolved) {
        targets.push(resolved);
      }
    }

    if (targets.length === 0) {
      return;
    }

    const panel = this.resolvePlayerPanel();
    const handler = stopped
      ? panel?.handleEmbargoClick
      : panel?.handleStopEmbargoClick;
    if (panel && typeof handler === "function") {
      for (const target of targets) {
        try {
          handler.call(
            panel,
            new MouseEvent("click", { bubbles: false, cancelable: true }),
            localPlayer,
            target,
          );
        } catch (error) {
          console.warn(
            "Sidebar trading toggle failed via player panel",
            this.describePlayerForLog(target),
            error,
          );
        }
      }
      this.scheduleTradingRefresh();
      return;
    }

    if (stopped) {
      const addEmbargo = localPlayer.addEmbargo;
      if (typeof addEmbargo !== "function") {
        console.warn(
          "Sidebar trading toggle skipped: local player cannot add embargoes",
        );
        return;
      }
      for (const target of targets) {
        try {
          addEmbargo.call(localPlayer, target, false);
        } catch (error) {
          console.warn(
            "Failed to stop trading with player",
            this.describePlayerForLog(target),
            error,
          );
        }
      }
    } else {
      const stopEmbargo = localPlayer.stopEmbargo;
      if (typeof stopEmbargo !== "function") {
        console.warn(
          "Sidebar trading toggle skipped: local player cannot stop embargoes",
        );
        return;
      }
      for (const target of targets) {
        try {
          stopEmbargo.call(localPlayer, target);
        } catch (error) {
          console.warn(
            "Failed to resume trading with player",
            this.describePlayerForLog(target),
            error,
          );
        }
      }
    }

    this.scheduleTradingRefresh();
  }

  private scheduleTradingRefresh(): void {
    if (typeof window === "undefined") {
      this.refreshFromGame();
      return;
    }

    if (this.pendingTradingRefreshHandle !== undefined) {
      return;
    }

    this.pendingTradingRefreshHandle = window.setTimeout(() => {
      this.pendingTradingRefreshHandle = undefined;
      this.refreshFromGame();
    }, 0);
  }

  createAction(): string {
    const existingCount = this.actionsState.actions.length + 1;
    const action = this.createActionDefinition({
      name: `New action ${existingCount}`,
      code:
        "// Access the game through the `game` helper\n" +
        "// This function is invoked whenever the action runs\n" +
        "export function run(context) {\n" +
        "  context.logger.info('Running action tick', context.game.tick);\n" +
        "}\n",
      runMode: "continuous",
      description: "Describe what this action does.",
      runIntervalTicks: 1,
      settings: [],
    });
    this.commitActionsState((state) => ({
      ...state,
      actions: [...state.actions, action],
      revision: state.revision + 1,
      selectedActionId: action.id,
    }));
    return action.id;
  }

  selectAction(actionId?: string): void {
    if (this.actionsState.selectedActionId === actionId) {
      return;
    }
    this.commitActionsState((state) => {
      if (state.selectedActionId === actionId) {
        return state;
      }
      return { ...state, selectedActionId: actionId };
    });
  }

  saveAction(actionId: string, update: SidebarActionDefinitionUpdate): void {
    const normalizedSettings = update.settings.map((setting) =>
      this.sanitizeSetting(setting),
    );
    const trimmedName = update.name.trim();
    const resolvedName = trimmedName === "" ? "Untitled action" : trimmedName;
    const trimmedDescription = update.description?.trim() ?? "";
    const interval = Math.max(1, Math.floor(update.runIntervalTicks ?? 1));
    let previousRunMode: SidebarActionDefinition["runMode"] | undefined;
    let nextRunMode: SidebarActionDefinition["runMode"] | undefined;
    let nextEnabled: boolean | undefined;
    const normalizedEnabled = Boolean(update.enabled);
    this.commitActionsState((state) => {
      const index = state.actions.findIndex((action) => action.id === actionId);
      if (index === -1) {
        return state;
      }
      const current = state.actions[index];
      previousRunMode = current.runMode;
      const next: SidebarActionDefinition = {
        ...current,
        name: resolvedName,
        code: update.code,
        runMode: update.runMode,
        enabled: normalizedEnabled,
        description: trimmedDescription,
        runIntervalTicks: interval,
        settings: normalizedSettings.map((setting) => ({ ...setting })),
        updatedAtMs: Date.now(),
      };
      nextRunMode = next.runMode;
      nextEnabled = next.enabled;
      const actions = [...state.actions];
      actions[index] = next;
      return {
        ...state,
        actions,
        revision: state.revision + 1,
      };
    });

    if (nextEnabled === false) {
      this.stopRunsForAction(actionId);
    }

    if (nextRunMode === "event" && nextEnabled) {
      this.ensureEventActionRunning(actionId);
    } else if (previousRunMode === "event" && nextRunMode !== "event") {
      this.stopEventRunsForAction(actionId);
    }
  }

  setActionEnabled(actionId: string, enabled: boolean): void {
    const normalized = Boolean(enabled);
    let previousEnabled: boolean | undefined;
    let runMode: SidebarActionDefinition["runMode"] | undefined;
    this.commitActionsState((state) => {
      const index = state.actions.findIndex((action) => action.id === actionId);
      if (index === -1) {
        return state;
      }
      const current = state.actions[index];
      previousEnabled = current.enabled;
      runMode = current.runMode;
      if (current.enabled === normalized) {
        return state;
      }
      const next: SidebarActionDefinition = {
        ...current,
        enabled: normalized,
        updatedAtMs: Date.now(),
      };
      runMode = next.runMode;
      const actions = [...state.actions];
      actions[index] = next;
      return {
        ...state,
        actions,
        revision: state.revision + 1,
      };
    });

    if (previousEnabled === undefined || previousEnabled === normalized) {
      return;
    }

    if (!normalized) {
      this.stopRunsForAction(actionId);
      return;
    }

    if (runMode === "event") {
      this.ensureEventActionRunning(actionId);
    }
  }

  deleteAction(actionId: string): void {
    this.commitActionsState((state) => {
      const index = state.actions.findIndex((action) => action.id === actionId);
      if (index === -1) {
        return state;
      }

      const actions = state.actions.filter((action) => action.id !== actionId);
      let selectedActionId = state.selectedActionId;
      if (selectedActionId === actionId) {
        selectedActionId = actions[index]?.id ?? actions[index - 1]?.id;
      }

      const removedRuns = state.running.filter(
        (run) => run.actionId === actionId,
      );
      for (const run of removedRuns) {
        this.clearRunningRemovalTimer(run.id);
        this.clearRunningController(run.id);
        this.disposeActionEvents(run.id);
      }
      const running = removedRuns.length
        ? state.running.filter((run) => run.actionId !== actionId)
        : state.running;
      const runningRevision = removedRuns.length
        ? state.runningRevision + 1
        : state.runningRevision;
      const selectedRunningActionId = running.some(
        (run) => run.id === state.selectedRunningActionId,
      )
        ? state.selectedRunningActionId
        : running[running.length - 1]?.id;

      return {
        ...state,
        actions,
        revision: state.revision + 1,
        running,
        runningRevision,
        selectedActionId,
        selectedRunningActionId,
      };
    });
  }

  startAction(actionId: string): void {
    const action = this.actionsState.actions.find(
      (entry) => entry.id === actionId,
    );
    if (!action) {
      return;
    }

    if (!action.enabled) {
      sidebarLogger.info(
        `Action "${action.name}" is disabled; ignoring run request.`,
      );
      return;
    }

    const now = Date.now();
    const run: SidebarRunningAction = {
      id: this.nextRunningActionId(),
      actionId: action.id,
      name: action.name,
      description: action.description,
      runMode: action.runMode,
      runIntervalTicks: action.runIntervalTicks,
      status: "running",
      startedAtMs: now,
      lastUpdatedMs: now,
      settings: this.cloneSettings(action.settings),
    };

    this.commitActionsState((state) => ({
      ...state,
      running: [...state.running, run],
      runningRevision: state.runningRevision + 1,
      selectedRunningActionId: run.id,
    }));

    sidebarLogger.info(
      `Started action "${action.name}" [${run.id}] (${action.runMode})`,
    );

    this.launchAction(action, run.id);
  }

  private launchAction(action: SidebarActionDefinition, runId: string): void {
    const run = this.getRunningActionEntry(runId);
    if (!run) {
      return;
    }

    if (action.runMode === "once") {
      const state: ActionExecutionState = {};
      void this.executeActionScript(action, run, state)
        .then(() => {
          this.touchRunningAction(runId);
          this.finalizeRunningAction(runId, "completed");
        })
        .catch((error) => {
          sidebarLogger.error(
            `Action "${action.name}" [${runId}] failed`,
            error,
          );
          this.finalizeRunningAction(runId, "failed");
        });
      return;
    }

    if (action.runMode === "event") {
      this.startEventRuntime(action, run);
      return;
    }

    this.startContinuousRuntime(action, run);
  }

  private startContinuousRuntime(
    action: SidebarActionDefinition,
    run: SidebarRunningAction,
  ): void {
    if (typeof window === "undefined") {
      console.warn(
        "Continuous sidebar actions are unavailable outside the browser.",
      );
      this.finalizeRunningAction(run.id, "failed");
      return;
    }

    const runId = run.id;
    const runtime: RunningActionRuntime = {
      intervalTicks: Math.max(1, run.runIntervalTicks ?? 1),
      lastExecutedTick:
        this.getCurrentGameTick() - Math.max(1, run.runIntervalTicks ?? 1),
      active: true,
      state: {},
      stop: () => {
        if (!runtime.active) {
          return;
        }
        runtime.active = false;
        window.clearInterval(intervalHandle);
      },
      updateInterval: (ticks: number) => {
        const normalized = Math.max(1, Math.floor(Number(ticks) || 1));
        runtime.intervalTicks = normalized;
      },
    };

    const execute = async () => {
      if (!runtime.active) {
        return;
      }
      const currentRun = this.getRunningActionEntry(runId);
      if (!currentRun) {
        runtime.stop();
        return;
      }
      const currentTick = this.getCurrentGameTick();
      if (currentTick - runtime.lastExecutedTick < runtime.intervalTicks) {
        return;
      }
      runtime.lastExecutedTick = currentTick;
      try {
        await this.executeActionScript(action, currentRun, runtime.state);
        this.touchRunningAction(runId);
      } catch (error) {
        sidebarLogger.error(`Action "${action.name}" [${runId}] failed`, error);
        this.finalizeRunningAction(runId, "failed");
      }
    };

    const intervalHandle = window.setInterval(() => {
      void execute();
    }, TICK_MILLISECONDS);

    this.actionRuntimes.set(runId, runtime);
    void execute();
  }

  private startEventRuntime(
    action: SidebarActionDefinition,
    run: SidebarRunningAction,
  ): void {
    const runId = run.id;
    const state: ActionExecutionState = {};
    void this.executeActionScript(action, run, state)
      .then((result) => {
        this.touchRunningAction(runId);
        if (typeof result === "function") {
          this.eventCleanupHandlers.set(runId, result as () => void);
        }
      })
      .catch((error) => {
        sidebarLogger.error(`Action "${action.name}" [${runId}] failed`, error);
        this.finalizeRunningAction(runId, "failed");
      });
  }

  selectRunningAction(runId?: string): void {
    this.commitActionsState((state) => {
      const effectiveId =
        runId && state.running.some((entry) => entry.id === runId)
          ? runId
          : undefined;
      if (state.selectedRunningActionId === effectiveId) {
        return state;
      }
      return { ...state, selectedRunningActionId: effectiveId };
    });
  }

  stopRunningAction(runId: string): void {
    const exists = this.actionsState.running.some((run) => run.id === runId);
    if (!exists) {
      return;
    }
    this.clearRunningRemovalTimer(runId);
    this.finalizeRunningAction(runId, "stopped");
  }

  updateRunningActionSetting(
    runId: string,
    settingId: string,
    value: SidebarActionSettingValue,
  ): void {
    this.commitActionsState((state) => {
      const index = state.running.findIndex((run) => run.id === runId);
      if (index === -1) {
        return state;
      }
      const entry = state.running[index];
      let changed = false;
      const settings = entry.settings.map((setting) => {
        if (setting.id !== settingId) {
          return setting;
        }
        const normalized = this.normalizeSettingValue(setting.type, value);
        if (setting.value === normalized) {
          return setting;
        }
        changed = true;
        return { ...setting, value: normalized };
      });
      if (!changed) {
        return state;
      }
      const running = [...state.running];
      running[index] = {
        ...entry,
        settings,
        lastUpdatedMs: Date.now(),
      };
      return {
        ...state,
        running,
        runningRevision: state.runningRevision + 1,
      };
    });
  }

  setRunningActionInterval(runId: string, ticks: number): void {
    const normalized = Math.max(1, Math.floor(Number(ticks) || 1));
    this.commitActionsState((state) => {
      const index = state.running.findIndex((run) => run.id === runId);
      if (index === -1) {
        return state;
      }
      const current = state.running[index];
      if (current.runIntervalTicks === normalized) {
        return state;
      }
      const running = [...state.running];
      running[index] = {
        ...current,
        runIntervalTicks: normalized,
        lastUpdatedMs: Date.now(),
      };
      return {
        ...state,
        running,
        runningRevision: state.runningRevision + 1,
      };
    });

    const runtime = this.actionRuntimes.get(runId);
    runtime?.updateInterval(normalized);
  }

  clearLogs(): void {
    if (this.sidebarLogs.length === 0) {
      return;
    }
    this.sidebarLogs = [];
    this.sidebarLogRevision += 1;
    this.snapshot = this.attachActionsState({ ...this.snapshot });
    this.notify();
  }

  private async executeActionScript(
    action: SidebarActionDefinition,
    run: SidebarRunningAction,
    state: ActionExecutionState,
  ): Promise<unknown> {
    const context = this.createActionExecutionContext(run, state);
    const module = { exports: {} as unknown };
    const exports = module.exports as Record<string, unknown>;
    const evaluator = new Function(
      "game",
      "settings",
      "context",
      "exports",
      "module",
      '"use strict";\n' + action.code,
    );
    const result = evaluator(
      context.game,
      context.settings,
      context,
      exports,
      module,
    );

    const runFunction =
      this.resolveActionRunFunction(module.exports) ??
      this.resolveActionRunFunction(exports) ??
      this.resolveActionRunFunction(result);
    if (runFunction) {
      const output = runFunction(context);
      if (isPromiseLike(output)) {
        return await output;
      }
      return output;
    }

    if (isPromiseLike(result)) {
      return await result;
    }

    return result;
  }

  private resolveActionRunFunction(
    candidate: unknown,
  ): ((context: ActionExecutionContext) => unknown) | null {
    if (!candidate) {
      return null;
    }
    if (typeof candidate === "function") {
      return candidate as (context: ActionExecutionContext) => unknown;
    }
    if (typeof candidate === "object") {
      const run = (candidate as Record<string, unknown>).run;
      if (typeof run === "function") {
        return run as (context: ActionExecutionContext) => unknown;
      }
      const defaultExport = (candidate as Record<string, unknown>).default;
      if (typeof defaultExport === "function") {
        return defaultExport as (context: ActionExecutionContext) => unknown;
      }
    }
    return null;
  }

  private getOrCreateEventManager(
    run: SidebarRunningAction,
  ): ActionEventManager {
    let manager = this.actionEventManagers.get(run.id);
    if (!manager) {
      const label = `Action "${run.name}" [${run.id}]`;
      manager = new ActionEventManager(
        label,
        (eventName, handler) =>
          this.registerActionEventListener(run.id, eventName, handler),
        () => this.touchRunningAction(run.id),
      );
      this.actionEventManagers.set(run.id, manager);
    }
    return manager;
  }

  private registerActionEventListener(
    runId: string,
    eventName: string,
    handler: (payload: unknown) => void,
  ): () => void {
    let listeners = this.actionEventListeners.get(eventName);
    if (!listeners) {
      listeners = new Map();
      this.actionEventListeners.set(eventName, listeners);
    }
    let runListeners = listeners.get(runId);
    if (!runListeners) {
      runListeners = new Set();
      listeners.set(runId, runListeners);
    }
    runListeners.add(handler);
    return () => {
      const byEvent = this.actionEventListeners.get(eventName);
      if (!byEvent) {
        return;
      }
      const handlers = byEvent.get(runId);
      if (!handlers) {
        return;
      }
      handlers.delete(handler);
      if (handlers.size === 0) {
        byEvent.delete(runId);
      }
      if (byEvent.size === 0) {
        this.actionEventListeners.delete(eventName);
      }
    };
  }

  private emitActionEvent(eventName: string, payload: unknown): void {
    const listeners = this.actionEventListeners.get(eventName);
    if (!listeners) {
      return;
    }
    const batches = Array.from(listeners.values()).map((set) =>
      Array.from(set),
    );
    for (const handlers of batches) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (error) {
          sidebarLogger.error(
            `Failed to process action event "${eventName}"`,
            error,
          );
        }
      }
    }
  }

  private createActionExecutionContext(
    run: SidebarRunningAction,
    state: ActionExecutionState,
  ): ActionExecutionContext {
    const settings: Record<string, SidebarActionSettingValue> = {};
    for (const setting of run.settings) {
      const key = setting.key?.trim();
      if (!key) {
        continue;
      }
      settings[key] = setting.value;
    }
    const logger = createSidebarLogger(`Action ${run.name} [${run.id}]`, {
      emitToConsole: false,
    });
    return {
      game: this.buildActionGameApi(),
      lobby: this.buildActionLobbyApi(),
      settings,
      state,
      run,
      snapshot: this.snapshot,
      logger,
      events: this.getOrCreateEventManager(run),
    } satisfies ActionExecutionContext;
  }

  private buildActionGameApi(): ActionGameApi {
    const players = this.snapshot.players.map((player) => ({
      id: player.id,
      name: player.name,
      isSelf: player.isSelf ?? false,
      tradeStopped: player.tradeStopped ?? false,
      tiles: player.tiles,
      gold: player.gold,
      troops: player.troops,
    }));
    const createHandler =
      (stopped: boolean) =>
      (target: string | number | Iterable<string | number>) => {
        const ids = this.normalizeTargetIds(target);
        if (ids.length === 0) {
          return;
        }
        this.setTradingStopped(ids, stopped);
      };
    return {
      players,
      tick: this.getCurrentGameTick(),
      stopTrade: createHandler(true),
      startTrade: createHandler(false),
    };
  }

  private buildActionLobbyApi(): SidebarLobbyApi {
    return {
      queue: this.snapshot.currentLobbyQueue,
      extractClanTag,
      buildNameWithClanTag: (baseName, clanTag) =>
        this.buildDisplayNameWithClan(baseName, clanTag),
      join: (gameId?: string) => this.requestLobbyJoin(gameId),
      setDisplayName: (name: string) => this.applyLobbyDisplayName(name),
      getDisplayName: () => this.readLobbyDisplayName(),
    };
  }

  private buildDisplayNameWithClan(baseName: string, clanTag?: string): string {
    const trimmedBase = (baseName ?? "").toString().trim();
    const safeBase = trimmedBase.length > 0 ? trimmedBase : "Player";
    const tag = (clanTag ?? "").trim();
    const candidate = tag ? `[${tag}] ${safeBase}` : safeBase;
    return Array.from(candidate).slice(0, 27).join("");
  }

  private readLobbyDisplayName(): string | undefined {
    if (typeof window === "undefined") {
      return undefined;
    }

    const readFromInput = (): string | undefined => {
      const usernameInput = document.querySelector(
        "username-input",
      ) as HTMLElement | null;
      const input = usernameInput?.querySelector("input") as
        | HTMLInputElement
        | null
        | undefined;
      const value = input?.value?.trim();
      return value && value.length > 0 ? value : undefined;
    };

    const liveValue = readFromInput();
    if (liveValue) {
      return liveValue;
    }

    const stored = readPersistedString(USERNAME_STORAGE_KEY);
    const trimmed = stored?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
  }

  private requestLobbyJoin(gameId?: string): boolean {
    if (typeof document === "undefined") {
      return false;
    }
    if (this.game) {
      console.warn(
        "Cannot join a lobby while already attached to a live game.",
      );
      return false;
    }
    const target = (gameId ?? this.snapshot.currentLobbyQueue?.gameId)?.trim();
    if (!target) {
      return false;
    }
    if (this.tryJoinViaLobbyElement(target)) {
      return true;
    }
    const clientID = this.generateLobbyClientId();
    try {
      const event = new CustomEvent("join-lobby", {
        detail: { gameID: target, clientID },
        bubbles: true,
        composed: true,
      });
      document.dispatchEvent(event);
      sidebarLogger.info(
        `Requested lobby join for ${target} (client ${clientID}).`,
      );
      return true;
    } catch (error) {
      sidebarLogger.error("Failed to dispatch lobby join request", error);
      return false;
    }
  }

  private tryJoinViaLobbyElement(target: string): boolean {
    const element = this.hostDocument.querySelector(
      "public-lobby",
    ) as PublicLobbyElement | null;
    if (!element) {
      return false;
    }
    const lobbies = element.lobbies;
    if (!Array.isArray(lobbies)) {
      return false;
    }
    const match = lobbies.find(
      (entry) => typeof entry?.gameID === "string" && entry.gameID === target,
    );
    const clickHandler = element.lobbyClicked;
    if (!match || typeof clickHandler !== "function") {
      return false;
    }
    try {
      clickHandler.call(element, match);
      sidebarLogger.info(
        `Requested lobby join for ${target} via lobby component interaction.`,
      );
      return true;
    } catch (error) {
      console.warn("Failed to trigger lobby join via lobby component", error);
      return false;
    }
  }

  private generateLobbyClientId(): string {
    // Generate an 8-character ID using the same alphabet as the game's generateID()
    // Excludes confusing characters: 0, O, l, I
    // Matches the game server validation pattern: /^[a-zA-Z0-9]+$/
    const alphabet =
      "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return result;
  }

  private applyLobbyDisplayName(name: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }
    if (typeof name !== "string") {
      return false;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      return false;
    }
    const normalized = Array.from(trimmed).slice(0, 27).join("");
    writePersistedString(USERNAME_STORAGE_KEY, normalized);
    const usernameInput = document.querySelector(
      "username-input",
    ) as HTMLElement | null;
    const input = usernameInput?.querySelector("input") as
      | HTMLInputElement
      | null
      | undefined;
    if (input) {
      input.value = normalized;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    sidebarLogger.info(`Updated lobby display name to "${normalized}".`);
    return true;
  }

  private normalizeTargetIds(
    target: string | number | Iterable<string | number>,
  ): string[] {
    if (typeof target === "string" || typeof target === "number") {
      return [String(target)];
    }
    const iterable = target as Iterable<string | number> | null;
    if (!iterable || typeof iterable[Symbol.iterator] !== "function") {
      return [];
    }
    const unique = new Set<string>();
    for (const entry of iterable) {
      if (entry === undefined || entry === null) {
        continue;
      }
      unique.add(String(entry));
    }
    return [...unique];
  }

  private resetLiveGameTracking(): void {
    this.knownStructureIds = new Set();
    this.structuresInitialized = false;
    this.missileOrigins.clear();
    this.lastProcessedDisplayUpdates = null;
    this.troopDonationOverlay?.clear();
    this.goldDonationOverlay?.clear();
    this.attackBorderOverlay?.clear();
    this.lastLiveGameTeamLogKey = null;
  }

  private getCurrentGameTick(): number {
    if (this.game && typeof this.game.ticks === "function") {
      try {
        return this.game.ticks();
      } catch (error) {
        // Ignore and fall back to a derived tick counter.
      }
    }
    const now = Date.now();
    const base = this.snapshot.currentTimeMs ?? now;
    if (!Number.isFinite(base)) {
      return 0;
    }
    return Math.max(0, Math.floor((now - base) / TICK_MILLISECONDS));
  }

  private touchRunningAction(runId: string): void {
    this.commitActionsState((state) => {
      const index = state.running.findIndex((run) => run.id === runId);
      if (index === -1) {
        return state;
      }
      const current = state.running[index];
      const next: SidebarRunningAction = {
        ...current,
        lastUpdatedMs: Date.now(),
        status: current.status === "running" ? "running" : current.status,
      };
      const running = [...state.running];
      running[index] = next;
      return {
        ...state,
        running,
        runningRevision: state.runningRevision + 1,
      };
    });
  }

  private finalizeRunningAction(
    runId: string,
    status: SidebarRunningActionStatus,
  ): void {
    const currentEntry = this.getRunningActionEntry(runId);
    if (currentEntry) {
      const label = `Action "${currentEntry.name}" [${runId}]`;
      switch (status) {
        case "completed":
          sidebarLogger.info(`${label} completed.`);
          break;
        case "stopped":
          sidebarLogger.info(`${label} stopped.`);
          break;
        case "failed":
          console.warn(`${label} failed.`);
          break;
      }
    }
    this.clearRunningController(runId);
    this.disposeActionEvents(runId);
    this.clearRunningRemovalTimer(runId);
    this.commitActionsState((state) => {
      const index = state.running.findIndex((run) => run.id === runId);
      if (index === -1) {
        return state;
      }
      const current = state.running[index];
      const next: SidebarRunningAction = {
        ...current,
        status,
        lastUpdatedMs: Date.now(),
      };
      const running = [...state.running];
      running[index] = next;
      return {
        ...state,
        running,
        runningRevision: state.runningRevision + 1,
      };
    });
    this.scheduleOneShotRemoval(runId);
  }

  private clearRunningController(runId: string): void {
    const runtime = this.actionRuntimes.get(runId);
    if (!runtime) {
      return;
    }
    runtime.stop();
    this.actionRuntimes.delete(runId);
  }

  private disposeActionEvents(runId: string): void {
    const manager = this.actionEventManagers.get(runId);
    if (manager) {
      manager.dispose();
      this.actionEventManagers.delete(runId);
    }

    for (const [eventName, listeners] of Array.from(
      this.actionEventListeners.entries(),
    )) {
      if (listeners.delete(runId) && listeners.size === 0) {
        this.actionEventListeners.delete(eventName);
      }
    }

    const cleanup = this.eventCleanupHandlers.get(runId);
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        sidebarLogger.error(`Cleanup for action run [${runId}] failed`, error);
      }
      this.eventCleanupHandlers.delete(runId);
    }
  }

  private getRunningActionEntry(
    runId: string,
  ): SidebarRunningAction | undefined {
    return this.actionsState.running.find((run) => run.id === runId);
  }

  private resolvePlayerPanel(): PlayerPanelElement | null {
    if (typeof document === "undefined") {
      return null;
    }

    const element = this.hostDocument.querySelector(
      "player-panel",
    ) as PlayerPanelElement | null;
    return element ?? null;
  }

  private resolveSelfId(localPlayer: PlayerViewLike | null): string | null {
    if (localPlayer) {
      try {
        return String(localPlayer.id());
      } catch (error) {
        console.warn("Failed to read local player id", error);
      }
    }

    const snapshotSelf = this.snapshot.players.find((player) => player.isSelf);
    return snapshotSelf?.id ?? null;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }

  private scheduleGameDiscovery(immediate = false): void {
    if (typeof window === "undefined") {
      return;
    }

    if (!immediate && this.attachHandle !== undefined) {
      return;
    }

    const attemptAttach = () => {
      const discovered = this.findLiveGame();
      if (discovered) {
        const wasAttached = Boolean(this.game);
        this.stopDisplayEventPolling();
        this.game = discovered;
        if (!wasAttached) {
          this.emitActionEvent("gameAttached", null);
        }
        this.resetLiveGameTracking();
        this.refreshFromGame();
        if (this.attachHandle !== undefined) {
          window.clearTimeout(this.attachHandle);
          this.attachHandle = undefined;
        }
        if (this.refreshHandle !== undefined) {
          window.clearInterval(this.refreshHandle);
        }
        this.refreshHandle = window.setInterval(
          () => this.refreshFromGame(),
          500,
        );
        this.startDisplayEventPolling();
      } else {
        this.attachHandle = window.setTimeout(attemptAttach, 1000);
      }
    };

    if (immediate) {
      attemptAttach();
    } else {
      this.attachHandle = window.setTimeout(attemptAttach, 0);
    }
  }

  private findLiveGame(): GameViewLike | null {
    const candidates: NodeListOf<GameAwareElement> =
      this.hostDocument.querySelectorAll(
        "player-panel, leader-board, game-right-sidebar",
      );
    for (const element of candidates) {
      if (element.g) {
        return element.g;
      }
      if (element.game) {
        return element.game;
      }
    }
    return null;
  }

  private refreshFromGame(): void {
    if (!this.game) {
      return;
    }

    try {
      const players = this.game.playerViews();
      this.captureAllianceChanges(players);
      const currentTick = this.game.ticks();
      const currentTimeMs = currentTick * TICK_MILLISECONDS;
      const allianceDurationMs =
        this.game.config().allianceDuration() * TICK_MILLISECONDS;

      const localPlayer = this.resolveLocalPlayer();
      const records = players.map((player) =>
        this.createPlayerRecord(player, currentTimeMs, localPlayer),
      );
      const recordLookup = new Map<string, PlayerRecord>();
      for (const record of records) {
        recordLookup.set(record.id, record);
      }
      const ships = this.createShipRecords(recordLookup);

      const hadLivePlayers = this.snapshot.players.some(
        (player) => !player.isLobbyPlayer,
      );
      const livePlayers = records.filter((player) => !player.isLobbyPlayer);
      if (livePlayers.length === 0) {
        this.lastLiveGameTeamLogKey = null;
      } else {
        const signature = this.buildPlayerTeamSignature(livePlayers);
        const shouldLog =
          !hadLivePlayers || this.lastLiveGameTeamLogKey !== signature;
        this.lastLiveGameTeamLogKey = signature;
        if (shouldLog) {
          this.logLiveGameTeams(livePlayers);
        }
      }

      this.detectStructurePlacements(recordLookup);
      this.processRecentDisplayEvents(recordLookup);

      this.snapshot = this.attachActionsState({
        players: records,
        allianceDurationMs,
        currentTimeMs,
        ships,
      });
      this.syncMissileOverlaySilos();
      this.syncHistoricalMissileOverlay();
      this.syncTroopDonationOverlay(players);
      this.syncGoldDonationOverlay(players);
      this.syncTradeRouteOverlay(players, recordLookup);
      this.syncAttackBorderOverlay(players);
      this.notify();
    } catch (error) {
      // If the game context changes while we're reading from it, try attaching again.
      console.warn("Failed to refresh sidebar data", error);
      this.game = null;
      this.emitActionEvent("gameDetached", null);
      this.resetLiveGameTracking();
      this.troopDonationOverlay?.clear();
      this.goldDonationOverlay?.clear();
      this.tradeRouteOverlay?.clear();
      this.attackBorderOverlay?.clear();
      if (this.refreshHandle !== undefined) {
        window.clearInterval(this.refreshHandle);
        this.refreshHandle = undefined;
      }
      this.stopDisplayEventPolling();
      this.scheduleGameDiscovery();
    }
  }

  private createShipRecords(
    playerRecords: Map<string, PlayerRecord>,
  ): ShipRecord[] {
    if (!this.game) {
      return [];
    }

    const units = this.game.units("Transport", "Trade Ship", "Warship");
    const ships: ShipRecord[] = [];
    for (const unit of units) {
      const type = this.normalizeShipType(unit.type());
      if (!type) {
        continue;
      }
      ships.push(this.createShipRecord(unit, type, playerRecords));
    }
    ships.sort((a, b) => a.ownerName.localeCompare(b.ownerName));
    this.pruneStaleShipMemory(new Set(ships.map((ship) => ship.id)));
    return ships;
  }

  private createShipRecord(
    unit: UnitViewLike,
    type: ShipType,
    playerRecords: Map<string, PlayerRecord>,
  ): ShipRecord {
    const owner = unit.owner();
    const ownerId = String(owner.id());
    const ownerName = owner.displayName();
    const shipId = String(unit.id());
    const troops = this.resolveShipTroops(shipId, unit, type);
    const origin = this.resolveShipOrigin(shipId, unit);
    const current = this.describeTile(unit.tile());
    const retreating = this.resolveShipRetreating(unit);
    const destination = this.resolveShipDestination(
      shipId,
      unit,
      type,
      retreating,
    );
    const record = ownerId ? playerRecords.get(ownerId) : undefined;
    let ownerTeam = record?.team;
    if (!ownerTeam) {
      try {
        const resolved = owner.team?.();
        if (resolved) {
          ownerTeam = resolved;
        }
      } catch (error) {
        console.warn("Failed to resolve ship owner team", error);
      }
    }
    const ownerClan = record?.clan ?? extractClanTag(ownerName);
    return {
      id: String(unit.id()),
      type,
      ownerId,
      ownerName,
      ownerClan,
      ownerTeam: ownerTeam ?? undefined,
      troops,
      origin,
      current,
      destination,
      retreating,
      reachedTarget: unit.reachedTarget(),
    };
  }

  private detectStructurePlacements(
    playerRecords: Map<string, PlayerRecord>,
  ): void {
    if (!this.game) {
      return;
    }

    let units: UnitViewLike[];
    try {
      units = this.game.units(...STRUCTURE_UNIT_TYPES);
    } catch (error) {
      console.warn("Failed to enumerate game units for event tracking", error);
      return;
    }

    const currentIds = new Set<string>();
    for (const unit of units) {
      const unitId = String(unit.id());
      currentIds.add(unitId);
      if (this.structuresInitialized && !this.knownStructureIds.has(unitId)) {
        const event = this.createStructureBuiltEvent(unit, playerRecords);
        if (event) {
          this.emitActionEvent("structureBuilt", event);
        }
      }
    }

    this.knownStructureIds = currentIds;
    if (!this.structuresInitialized) {
      this.structuresInitialized = true;
    }
  }

  private createStructureBuiltEvent(
    unit: UnitViewLike,
    playerRecords: Map<string, PlayerRecord>,
  ): SidebarStructureBuiltEvent | null {
    let owner: PlayerViewLike;
    try {
      owner = unit.owner();
    } catch (error) {
      console.warn("Failed to resolve structure owner", error);
      return null;
    }

    let ownerId = "";
    try {
      ownerId = String(owner.id());
    } catch (error) {
      console.warn("Failed to resolve structure owner id", error);
    }

    const record = ownerId ? playerRecords.get(ownerId) : undefined;
    let ownerName = record?.name;
    if (!ownerName) {
      try {
        ownerName = owner.displayName();
      } catch (error) {
        ownerName = ownerId ? `Player ${ownerId}` : "Unknown player";
      }
    }

    let team = record?.team;
    if (!team) {
      try {
        const resolved = owner.team?.();
        if (resolved) {
          team = resolved;
        }
      } catch (error) {
        console.warn("Failed to resolve structure owner team", error);
      }
    }

    const clan = record?.clan ?? extractClanTag(ownerName);
    const tile = this.describeTile(unit.tile());
    const ownerColor = record?.color ?? this.resolvePlayerColor(owner);

    return {
      unitId: String(unit.id()),
      unitType: unit.type(),
      ownerId: ownerId || "unknown",
      ownerName,
      clan,
      team: team ?? undefined,
      tile,
      tick: this.getCurrentGameTick(),
      ownerColor: ownerColor ?? undefined,
      teamColor: team ? (ownerColor ?? undefined) : undefined,
      clanColor: clan ? (ownerColor ?? undefined) : undefined,
    } satisfies SidebarStructureBuiltEvent;
  }

  private startDisplayEventPolling(): void {
    if (typeof window === "undefined") {
      return;
    }
    this.stopDisplayEventPolling();
    this.displayEventPollingActive = true;
    const poll = (timestamp: number) => {
      if (!this.displayEventPollingActive) {
        return;
      }
      if (
        this.displayEventPollingLastTimestamp === 0 ||
        timestamp - this.displayEventPollingLastTimestamp >= TICK_MILLISECONDS
      ) {
        this.displayEventPollingLastTimestamp = timestamp;
        this.processRecentDisplayEvents();
      }
      if (this.displayEventPollingActive) {
        this.displayEventPollingHandle = window.requestAnimationFrame(poll);
      }
    };
    this.displayEventPollingLastTimestamp = 0;
    this.displayEventPollingHandle = window.requestAnimationFrame(poll);
  }

  private stopDisplayEventPolling(): void {
    if (typeof window === "undefined") {
      return;
    }
    this.displayEventPollingActive = false;
    if (this.displayEventPollingHandle !== undefined) {
      window.cancelAnimationFrame(this.displayEventPollingHandle);
      this.displayEventPollingHandle = undefined;
    }
    this.displayEventPollingLastTimestamp = 0;
    this.lastProcessedDisplayUpdates = null;
    this.lastProcessedDisplayEventArray = null;
    this.lastProcessedDisplayEventArrayLength = 0;
    this.recentTroopDonations.clear();
    this.recentGoldDonations.clear();
    this.pendingWebSocketDonationIntents = [];
  }

  private processRecentDisplayEvents(
    playerRecords?: Map<string, PlayerRecord>,
  ): void {
    if (!this.game || typeof this.game.updatesSinceLastTick !== "function") {
      return;
    }

    let updates: GameUpdatesLike;
    try {
      updates = this.game.updatesSinceLastTick();
    } catch (error) {
      console.warn("Failed to read recent game updates", error);
      return;
    }

    const records = playerRecords ?? this.buildPlayerRecordLookupFromSnapshot();
    this.processPendingWebSocketDonationIntents(records);

    const rawDisplayEvents = this.extractRawDisplayEvents(updates);
    if (!rawDisplayEvents) {
      this.lastProcessedDisplayUpdates = updates;
      this.lastProcessedDisplayEventArray = null;
      this.lastProcessedDisplayEventArrayLength = 0;
      return;
    }

    const sameUpdatesObject = updates === this.lastProcessedDisplayUpdates;
    const sameArrayObject =
      rawDisplayEvents === this.lastProcessedDisplayEventArray;
    const previousLength = sameArrayObject
      ? this.lastProcessedDisplayEventArrayLength
      : 0;

    if (
      sameUpdatesObject &&
      sameArrayObject &&
      rawDisplayEvents.length <= previousLength
    ) {
      return;
    }

    this.lastProcessedDisplayUpdates = updates;
    this.lastProcessedDisplayEventArray = rawDisplayEvents;
    this.lastProcessedDisplayEventArrayLength = rawDisplayEvents.length;

    const displayEvents: DisplayMessageUpdateLike[] = [];
    for (
      let index = previousLength;
      index < rawDisplayEvents.length;
      index += 1
    ) {
      const entry = rawDisplayEvents[index];
      if (this.isDisplayMessageUpdate(entry)) {
        displayEvents.push(entry);
      }
    }

    if (displayEvents.length === 0) {
      return;
    }

    const { troopDonations, goldDonations } = this.resolveDonationEvents(
      displayEvents,
      records,
    );

    for (const troopDonation of troopDonations) {
      this.handleResolvedDonation("troops", troopDonation);
    }

    for (const goldDonation of goldDonations) {
      this.handleResolvedDonation("gold", goldDonation);
    }
  }

  private processPendingWebSocketDonationIntents(
    playerRecords: Map<string, PlayerRecord>,
  ): void {
    if (this.pendingWebSocketDonationIntents.length === 0) {
      return;
    }

    const unresolved: WebSocketDonationIntentCandidate[] = [];
    const expirationThreshold = Date.now() - WEB_SOCKET_DONATION_PENDING_TTL_MS;
    for (const candidate of this.pendingWebSocketDonationIntents) {
      if (candidate.observedAtMs <= expirationThreshold) {
        continue;
      }

      const senderRecord = this.resolvePlayerRecordByClientId(
        candidate.senderClientId,
        playerRecords,
      );
      const recipientRecord = playerRecords.get(candidate.recipientPlayerId);
      if (!senderRecord || !recipientRecord) {
        unresolved.push(candidate);
      }
    }

    this.pendingWebSocketDonationIntents = unresolved;
  }

  private handleResolvedDonation(
    kind: DonationKind,
    donation: SidebarDonationEvent,
  ): void {
    const store =
      kind === "troops" ? this.recentTroopDonations : this.recentGoldDonations;
    if (!this.registerDonation(donation, store)) {
      return;
    }

    if (kind === "troops") {
      const event = donation as SidebarTroopDonationEvent;
      this.emitActionEvent("troopsDonated", event);
      if (this.troopDonationOverlay?.isActive()) {
        const senderView = this.resolvePlayerViewById(event.senderId);
        this.troopDonationOverlay.registerDonation(event, {
          fallbackColor: this.resolvePlayerColor(senderView),
        });
      }
      return;
    }

    const event = donation as SidebarGoldDonationEvent;
    this.emitActionEvent("goldDonated", event);
    if (this.goldDonationOverlay?.isActive()) {
      const senderView = this.resolvePlayerViewById(event.senderId);
      this.goldDonationOverlay.registerDonation(event, {
        fallbackColor: this.resolvePlayerColor(senderView),
      });
    }
  }

  private extractRawDisplayEvents(updates: GameUpdatesLike): unknown[] | null {
    if (!updates) {
      return null;
    }
    const raw = (updates as Record<number, unknown>)[
      GAME_UPDATE_TYPE_DISPLAY_EVENT
    ];
    return Array.isArray(raw) ? raw : null;
  }

  private extractDisplayEvents(
    updates: GameUpdatesLike,
  ): DisplayMessageUpdateLike[] {
    if (!updates) {
      return [];
    }
    const raw = (updates as Record<number, unknown>)[
      GAME_UPDATE_TYPE_DISPLAY_EVENT
    ];
    if (!Array.isArray(raw)) {
      return [];
    }
    const events: DisplayMessageUpdateLike[] = [];
    for (const entry of raw) {
      if (this.isDisplayMessageUpdate(entry)) {
        events.push(entry);
      }
    }
    return events;
  }

  private isDisplayMessageUpdate(
    value: unknown,
  ): value is DisplayMessageUpdateLike {
    if (!value || typeof value !== "object") {
      return false;
    }
    const candidate = value as Record<string, unknown>;
    if (typeof candidate.message !== "string") {
      return false;
    }
    if (typeof candidate.messageType !== "number") {
      return false;
    }
    const playerId = candidate.playerID;
    if (playerId !== null && typeof playerId !== "number") {
      return false;
    }
    return true;
  }

  private resolveDonationEvents(
    displayEvents: DisplayMessageUpdateLike[],
    playerRecords: Map<string, PlayerRecord>,
  ): {
    troopDonations: SidebarTroopDonationEvent[];
    goldDonations: SidebarGoldDonationEvent[];
  } {
    const candidates: DonationMessageCandidate[] = [];

    for (const event of displayEvents) {
      const troopParsed = this.parseTroopDonationMessage(event);
      if (troopParsed) {
        candidates.push({
          kind: "troops",
          direction: troopParsed.direction,
          amountDisplay: troopParsed.amountDisplay,
          amountApprox: this.parseDonationAmount(troopParsed.amountDisplay),
          otherName: troopParsed.otherName,
          playerSmallId: event.playerID,
        });
        continue;
      }

      const goldParsed = this.parseGoldDonationMessage(event);
      if (goldParsed) {
        candidates.push({
          kind: "gold",
          direction: goldParsed.direction,
          amountDisplay: goldParsed.amountDisplay,
          amountApprox: this.parseDonationAmount(goldParsed.amountDisplay),
          otherName: goldParsed.otherName,
          playerSmallId: event.playerID,
        });
      }
    }

    const troopDonations: SidebarTroopDonationEvent[] =
      this.resolveDonationCandidates(
        candidates.filter((candidate) => candidate.kind === "troops"),
        playerRecords,
      );
    const goldDonations: SidebarGoldDonationEvent[] =
      this.resolveDonationCandidates(
        candidates.filter((candidate) => candidate.kind === "gold"),
        playerRecords,
      );

    return { troopDonations, goldDonations };
  }

  private resolveDonationCandidates(
    candidates: DonationMessageCandidate[],
    playerRecords: Map<string, PlayerRecord>,
  ): SidebarDonationEvent[] {
    const resolved: SidebarDonationEvent[] = [];
    if (candidates.length === 0) {
      return resolved;
    }

    const used = new Set<number>();
    const nameCache = new Map<number, string | null>();
    const amountKeyFor = (candidate: DonationMessageCandidate): string =>
      this.buildDonationAmountKey(
        candidate.amountDisplay,
        candidate.amountApprox,
      );

    const resolveName = (smallId: number | null): string | null => {
      if (smallId === null) {
        return null;
      }
      if (nameCache.has(smallId)) {
        return nameCache.get(smallId) ?? null;
      }
      const name = this.resolveDisplayNameBySmallIdForDonation(smallId);
      const normalized = name ? this.normalizeDonationName(name) : null;
      nameCache.set(smallId, normalized);
      return normalized;
    };

    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = candidates[i];
      if (candidate.direction !== "sent") {
        continue;
      }
      if (used.has(i)) {
        continue;
      }
      const senderSmallId = candidate.playerSmallId;
      if (senderSmallId === null) {
        continue;
      }

      const senderName = resolveName(senderSmallId);
      if (!senderName) {
        continue;
      }
      const recipientNameFromMessage = this.normalizeDonationName(
        candidate.otherName,
      );
      const amountKey = amountKeyFor(candidate);

      let matchIndex: number | null = null;
      for (let j = 0; j < candidates.length; j += 1) {
        if (j === i || used.has(j)) {
          continue;
        }
        const other = candidates[j];
        if (other.direction !== "received") {
          continue;
        }
        if (other.playerSmallId === null) {
          continue;
        }
        if (amountKeyFor(other) !== amountKey) {
          continue;
        }
        const otherSenderName = this.normalizeDonationName(other.otherName);
        if (otherSenderName !== senderName) {
          continue;
        }
        const recipientName = resolveName(other.playerSmallId);
        if (!recipientName || recipientName !== recipientNameFromMessage) {
          continue;
        }
        matchIndex = j;
        break;
      }

      if (matchIndex !== null) {
        used.add(i);
        used.add(matchIndex);
        const recipientSmallId = candidates[matchIndex].playerSmallId!;
        const amountApprox =
          candidate.amountApprox ?? candidates[matchIndex].amountApprox ?? null;
        const donation = this.createDonationEventFromSmallIds(
          senderSmallId,
          recipientSmallId,
          candidate.amountDisplay,
          amountApprox,
          playerRecords,
        );
        if (donation) {
          resolved.push(donation);
        }
      }
    }

    for (let i = 0; i < candidates.length; i += 1) {
      if (used.has(i)) {
        continue;
      }
      const candidate = candidates[i];
      const actorSmallId = candidate.playerSmallId;
      if (actorSmallId === null) {
        continue;
      }
      const otherView = this.findPlayerViewByNameUnique(candidate.otherName);
      if (!otherView) {
        continue;
      }
      const otherSmallId = this.safePlayerSmallId(otherView);
      if (otherSmallId === null) {
        continue;
      }
      const senderSmallId =
        candidate.direction === "sent" ? actorSmallId : otherSmallId;
      const recipientSmallId =
        candidate.direction === "sent" ? otherSmallId : actorSmallId;

      const donation = this.createDonationEventFromSmallIds(
        senderSmallId,
        recipientSmallId,
        candidate.amountDisplay,
        candidate.amountApprox,
        playerRecords,
      );
      if (donation) {
        resolved.push(donation);
      }
    }

    return resolved;
  }

  private resolvePlayerRecordByClientId(
    clientId: string,
    records: Map<string, PlayerRecord>,
  ): PlayerRecord | null {
    const normalized = clientId.trim();
    if (!normalized) {
      return null;
    }

    for (const record of records.values()) {
      if (record.clientID === normalized) {
        return record;
      }
    }

    if (this.game && typeof this.game.playerByClientID === "function") {
      try {
        const view = this.game.playerByClientID(normalized);
        const id = view ? this.safePlayerId(view) : undefined;
        if (!id) {
          return null;
        }
        return records.get(id) ?? null;
      } catch {
        return null;
      }
    }

    return null;
  }

  private createDonationEventFromSmallIds(
    senderSmallId: number,
    recipientSmallId: number,
    amountDisplay: string,
    amountApprox: number | null,
    playerRecords: Map<string, PlayerRecord>,
  ): SidebarDonationEvent | null {
    const sender = this.buildPlayerSummaryFromSmallId(
      senderSmallId,
      playerRecords,
    );
    const recipient = this.buildPlayerSummaryFromSmallId(
      recipientSmallId,
      playerRecords,
    );

    if (!sender || !recipient) {
      return null;
    }

    return {
      senderId: sender.id,
      senderName: sender.name,
      senderClan: sender.clan ?? undefined,
      senderTeam: sender.team ?? undefined,
      senderIsSelf: sender.isSelf,
      senderColor: sender.color ?? undefined,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientClan: recipient.clan ?? undefined,
      recipientTeam: recipient.team ?? undefined,
      recipientIsSelf: recipient.isSelf,
      recipientColor: recipient.color ?? undefined,
      amountDisplay,
      amountApprox,
      tick: this.getCurrentGameTick(),
    } satisfies SidebarDonationEvent;
  }

  private buildDonationAmountKey(
    amountDisplay: string,
    amountApprox: number | null,
  ): string {
    const hasApprox = amountApprox !== null && amountApprox !== undefined;
    return hasApprox ? `~${amountApprox}` : amountDisplay.trim().toLowerCase();
  }

  private normalizeDonationName(name: string): string {
    return name.replace(/\s+/g, " ").trim();
  }

  private resolveDisplayNameBySmallIdForDonation(
    smallId: number,
  ): string | null {
    if (!this.game) {
      return null;
    }
    try {
      const entity = this.game.playerBySmallID(smallId);
      if ("displayName" in entity && typeof entity.displayName === "function") {
        const name = entity.displayName();
        return typeof name === "string" && name.trim() ? name.trim() : null;
      }
      if ("name" in entity && typeof entity.name === "function") {
        const name = entity.name();
        return typeof name === "string" && name.trim() ? name.trim() : null;
      }
    } catch {
      // Ignore name resolution failures for donation matching.
    }
    return null;
  }

  private findPlayerViewByNameUnique(name: string): PlayerViewLike | null {
    if (!this.game) {
      return null;
    }
    const normalized = this.normalizeDonationName(name);
    if (!normalized) {
      return null;
    }

    let match: PlayerViewLike | null = null;
    try {
      const players = this.game.playerViews();
      for (const player of players) {
        let displayName: string | null = null;
        try {
          displayName = this.normalizeDonationName(player.displayName());
        } catch {
          displayName = null;
        }
        if (!displayName || displayName !== normalized) {
          continue;
        }
        if (match) {
          return null;
        }
        match = player;
      }
    } catch (error) {
      console.warn("Failed to search players by name", error);
      return null;
    }

    return match;
  }

  private registerDonation(
    event: SidebarDonationEvent,
    store: Map<string, number>,
  ): boolean {
    const hasApproxAmount =
      event.amountApprox !== null && event.amountApprox !== undefined;
    const amountKey = hasApproxAmount
      ? `~${event.amountApprox}`
      : event.amountDisplay.trim().toLowerCase();
    const key = `${event.senderId}->${event.recipientId}:${amountKey}`;
    const previousTick = store.get(key);
    if (previousTick === event.tick) {
      return false;
    }
    store.set(key, event.tick);
    const expirationThreshold = event.tick - DONATION_DEDUP_TICK_WINDOW;
    for (const [entryKey, tick] of store) {
      if (tick <= expirationThreshold) {
        store.delete(entryKey);
      }
    }
    return true;
  }

  private parseTroopDonationMessage(update: DisplayMessageUpdateLike): {
    direction: "sent" | "received";
    amountDisplay: string;
    otherName: string;
  } | null {
    const message = update.message?.trim();
    const params = update.params;
    const paramValue = (key: string): string | null => {
      if (!params || typeof params !== "object") {
        return null;
      }
      const value = (params as Record<string, unknown>)[key];
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      }
      if (typeof value === "number") {
        return Number.isFinite(value) ? String(value) : null;
      }
      return null;
    };

    if (update.messageType === MESSAGE_TYPE_SENT_TROOPS_TO_PLAYER) {
      const troops = paramValue("troops");
      const name = paramValue("name");
      if (troops && name) {
        return { direction: "sent", amountDisplay: troops, otherName: name };
      }
      if (!message) {
        return null;
      }
      const match = /^Sent\s+([^\s].*?)\s+troops\s+to\s+(.+)$/.exec(message);
      if (!match) {
        return null;
      }
      return {
        direction: "sent",
        amountDisplay: match[1].trim(),
        otherName: match[2].trim(),
      };
    }

    if (update.messageType === MESSAGE_TYPE_RECEIVED_TROOPS_FROM_PLAYER) {
      const troops = paramValue("troops");
      const name = paramValue("name");
      if (troops && name) {
        return {
          direction: "received",
          amountDisplay: troops,
          otherName: name,
        };
      }
      if (!message) {
        return null;
      }
      const match = /^Received\s+([^\s].*?)\s+troops\s+from\s+(.+)$/.exec(
        message,
      );
      if (!match) {
        return null;
      }
      return {
        direction: "received",
        amountDisplay: match[1].trim(),
        otherName: match[2].trim(),
      };
    }

    return null;
  }

  private parseGoldDonationMessage(update: DisplayMessageUpdateLike): {
    direction: "sent" | "received";
    amountDisplay: string;
    otherName: string;
  } | null {
    const message = update.message?.trim();
    const params = update.params;
    const paramValue = (key: string): string | null => {
      if (!params || typeof params !== "object") {
        return null;
      }
      const value = (params as Record<string, unknown>)[key];
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      }
      if (typeof value === "number") {
        return Number.isFinite(value) ? String(value) : null;
      }
      if (typeof value === "bigint") {
        return value.toString();
      }
      return null;
    };

    if (update.messageType === MESSAGE_TYPE_SENT_GOLD_TO_PLAYER) {
      const gold = paramValue("gold");
      const name = paramValue("name");
      if (gold && name) {
        return { direction: "sent", amountDisplay: gold, otherName: name };
      }
      if (!message) {
        return null;
      }
      const match = /^Sent\s+([^\s].*?)\s+gold\s+to\s+(.+)$/.exec(message);
      if (!match) {
        return null;
      }
      return {
        direction: "sent",
        amountDisplay: match[1].trim(),
        otherName: match[2].trim(),
      };
    }

    if (update.messageType === MESSAGE_TYPE_RECEIVED_GOLD_FROM_PLAYER) {
      const gold = paramValue("gold");
      const name = paramValue("name");
      if (gold && name) {
        return { direction: "received", amountDisplay: gold, otherName: name };
      }
      if (!message) {
        return null;
      }
      const match = /^Received\s+([^\s].*?)\s+gold\s+from\s+(.+)$/.exec(
        message,
      );
      if (!match) {
        return null;
      }
      return {
        direction: "received",
        amountDisplay: match[1].trim(),
        otherName: match[2].trim(),
      };
    }

    return null;
  }

  private parseDonationAmount(value: string): number | null {
    const normalized = value.trim().replace(/,/g, "");
    if (normalized === "") {
      return null;
    }
    const match = /^([0-9]+(?:\.[0-9]+)?)([kKmM]?)$/.exec(normalized);
    if (!match) {
      const direct = Number(normalized);
      return Number.isFinite(direct) ? Math.round(direct) : null;
    }
    const base = Number(match[1]);
    if (!Number.isFinite(base)) {
      return null;
    }
    const suffix = match[2].toUpperCase();
    let multiplier = 1;
    if (suffix === "K") {
      multiplier = 1_000;
    } else if (suffix === "M") {
      multiplier = 1_000_000;
    }
    return Math.round(base * multiplier);
  }

  private buildPlayerRecordLookupFromSnapshot(): Map<string, PlayerRecord> {
    const lookup = new Map<string, PlayerRecord>();
    for (const record of this.snapshot.players) {
      lookup.set(record.id, record);
    }
    return lookup;
  }

  private buildPlayerSummaryFromSmallId(
    smallId: number | null,
    records: Map<string, PlayerRecord>,
  ): PlayerSummary | null {
    if (smallId === null || smallId === undefined) {
      return null;
    }
    const view = this.resolvePlayerById(String(smallId));
    return this.buildPlayerSummaryFromView(view, records);
  }

  private buildPlayerSummaryFromName(
    name: string,
    records: Map<string, PlayerRecord>,
  ): PlayerSummary | null {
    const trimmed = name.trim();
    if (trimmed === "") {
      return null;
    }
    const record = this.findRecordByName(trimmed, records);
    if (record) {
      return {
        id: record.id,
        name: record.name,
        clan: record.clan,
        team: record.team,
        isSelf: record.isSelf,
        color: record.color ?? null,
      } satisfies PlayerSummary;
    }
    const view = this.findPlayerViewByName(trimmed);
    return this.buildPlayerSummaryFromView(view, records, trimmed);
  }

  private buildPlayerSummaryFromView(
    view: PlayerViewLike | null,
    records: Map<string, PlayerRecord>,
    fallbackName?: string,
  ): PlayerSummary | null {
    if (!view) {
      if (!fallbackName) {
        return null;
      }
      return {
        id: fallbackName,
        name: fallbackName,
        clan: extractClanTag(fallbackName),
        team: null,
        isSelf: false,
      } satisfies PlayerSummary;
    }

    const id = this.safePlayerId(view);
    const name = this.safePlayerName(view) ?? fallbackName ?? "Unknown";
    const directRecord = id ? records.get(id) : undefined;
    const record = directRecord ?? this.findRecordByName(name, records);

    const summaryId = id ?? record?.id ?? name;
    const local = this.resolveLocalPlayer();
    const resolvedIsSelf =
      record?.isSelf ?? this.isSamePlayer(local, summaryId);

    const summary: PlayerSummary = {
      id: summaryId,
      name,
      clan: record?.clan ?? extractClanTag(name),
      team: record?.team ?? null,
      isSelf: resolvedIsSelf,
      color: record?.color ?? this.resolvePlayerColor(view) ?? null,
    };

    return summary;
  }

  private findPlayerViewByName(name: string): PlayerViewLike | null {
    if (!this.game) {
      return null;
    }
    try {
      const players = this.game.playerViews();
      for (const player of players) {
        try {
          if (player.displayName().trim() === name) {
            return player;
          }
        } catch (error) {
          // Ignore individual failures and continue searching.
        }
      }
    } catch (error) {
      console.warn("Failed to search players by name", error);
    }
    return null;
  }

  private resolvePlayerViewById(id: string): PlayerViewLike | null {
    if (!this.game) {
      return null;
    }

    const normalized = id.trim();
    if (normalized) {
      try {
        const candidate = this.game.player(normalized);
        if (candidate) {
          return candidate as PlayerViewLike;
        }
      } catch (error) {
        // Continue to numeric lookup.
      }
    }

    const numericId = Number(normalized);
    if (Number.isFinite(numericId)) {
      try {
        const player = this.game.playerBySmallID(numericId);
        if (
          player &&
          typeof (player as PlayerViewLike).displayName === "function" &&
          typeof (player as PlayerViewLike).id === "function"
        ) {
          return player as PlayerViewLike;
        }
      } catch (error) {
        console.warn("Failed to resolve player by small id", error);
      }
    }

    return null;
  }

  private findRecordByName(
    name: string,
    records: Map<string, PlayerRecord>,
  ): PlayerRecord | undefined {
    const trimmed = name.trim();
    if (!trimmed) {
      return undefined;
    }
    for (const record of records.values()) {
      if (record.name === trimmed) {
        return record;
      }
    }
    return undefined;
  }

  private safePlayerName(player: PlayerViewLike): string {
    try {
      const name = player.displayName();
      if (typeof name === "string" && name.trim()) {
        return name.trim();
      }
    } catch (error) {
      // Ignore and fall back to id-based name.
    }
    try {
      const id = player.id();
      return `Player ${id}`;
    } catch (error) {
      return "Unknown";
    }
  }

  private resolveShipRetreating(unit: UnitViewLike): boolean {
    if (typeof unit.retreating !== "function") {
      return false;
    }
    try {
      return unit.retreating();
    } catch (error) {
      console.warn("Failed to read ship retreating state", error);
      return false;
    }
  }

  private resolveShipOrigin(
    shipId: string,
    unit: UnitViewLike,
  ): TileSummary | undefined {
    const existing = this.shipOrigins.get(shipId);
    if (existing) {
      return existing;
    }

    const origin =
      this.describeTile(unit.lastTile()) ?? this.describeTile(unit.tile());
    if (origin) {
      this.shipOrigins.set(shipId, origin);
    }
    return origin;
  }

  private resolveShipDestination(
    shipId: string,
    unit: UnitViewLike,
    type: ShipType,
    retreating: boolean,
  ): TileSummary | undefined {
    if (retreating) {
      const origin = this.shipOrigins.get(shipId);
      if (origin) {
        this.shipDestinations.set(shipId, origin);
        return origin;
      }
    }

    const targetRef = this.getShipDestinationRef(unit, type);
    if (targetRef !== undefined) {
      const destination = this.describeTile(targetRef);
      if (destination) {
        this.shipDestinations.set(shipId, destination);
        return destination;
      }
    }

    const existing = this.shipDestinations.get(shipId);
    if (existing) {
      return existing;
    }

    if (type === "Transport") {
      const inferred = this.inferTransportDestination(shipId, unit, retreating);
      if (inferred) {
        return inferred;
      }
    }

    return undefined;
  }

  private getShipDestinationRef(
    unit: UnitViewLike,
    type: ShipType,
  ): number | undefined {
    try {
      const direct = unit.targetTile();
      if (direct !== undefined) {
        return direct;
      }
    } catch (error) {
      console.warn("Failed to read ship target tile", error);
    }

    if (type === "Trade Ship") {
      try {
        const targetUnitId = unit.targetUnitId();
        if (targetUnitId !== undefined) {
          const targetUnit = this.game?.unit(targetUnitId);
          if (targetUnit) {
            return targetUnit.tile();
          }
        }
      } catch (error) {
        console.warn("Failed to resolve trade ship destination", error);
      }
    }

    return undefined;
  }

  private resolveShipTroops(
    shipId: string,
    unit: UnitViewLike,
    type: ShipType,
  ): number {
    const troops = unit.troops();
    if (troops > 0 || !this.shipManifests.has(shipId)) {
      this.shipManifests.set(shipId, troops);
    }

    if (type === "Transport" && troops === 0) {
      return this.shipManifests.get(shipId) ?? troops;
    }

    return troops;
  }

  private pruneStaleShipMemory(activeIds: Set<string>): void {
    for (const [shipId] of this.shipOrigins) {
      if (!activeIds.has(shipId)) {
        this.shipOrigins.delete(shipId);
      }
    }
    for (const [shipId] of this.shipDestinations) {
      if (!activeIds.has(shipId)) {
        this.shipDestinations.delete(shipId);
      }
    }
    for (const [shipId] of this.shipManifests) {
      if (!activeIds.has(shipId)) {
        this.shipManifests.delete(shipId);
      }
    }
  }

  private inferTransportDestination(
    shipId: string,
    unit: UnitViewLike,
    retreating: boolean,
  ): TileSummary | undefined {
    if (!this.game || retreating) {
      return this.shipDestinations.get(shipId);
    }

    const cached = this.shipDestinations.get(shipId);
    if (cached) {
      return cached;
    }

    const start = unit.tile();
    const visited = new Set<number>([start]);
    const queue: number[] = [start];
    let index = 0;
    const ownerSmallId = this.safePlayerSmallId(unit.owner());
    const maxExplored = 4096;

    while (index < queue.length && visited.size <= maxExplored) {
      const current = queue[index++];
      const neighbors = this.game.neighbors(current) ?? [];
      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) {
          continue;
        }
        visited.add(neighbor);

        if (!this.game.isWater(neighbor)) {
          let ownerId: number | null = null;
          try {
            ownerId = this.game.hasOwner(neighbor)
              ? this.game.ownerID(neighbor)
              : null;
          } catch (error) {
            console.warn(
              "Failed to inspect transport destination owner",
              error,
            );
          }

          if (ownerSmallId !== null && ownerId === ownerSmallId) {
            continue;
          }

          const summary = this.describeTile(neighbor);
          if (summary) {
            this.shipDestinations.set(shipId, summary);
            return summary;
          }
          continue;
        }

        queue.push(neighbor);
      }
    }

    return this.shipDestinations.get(shipId);
  }

  private safePlayerSmallId(player: PlayerViewLike): number | null {
    try {
      const small = player.smallID();
      if (Number.isFinite(small)) {
        return small;
      }
    } catch (error) {
      console.warn("Failed to resolve player smallID", error);
    }

    const rawId = player.id();
    const numeric = typeof rawId === "number" ? rawId : Number(rawId);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private safePlayerId(player: PlayerViewLike): string | undefined {
    try {
      const raw = player.id();
      if (raw !== undefined && raw !== null) {
        return String(raw);
      }
    } catch (error) {
      console.warn("Failed to resolve player id", error);
    }
    const fallback = this.safePlayerSmallId(player);
    return fallback !== null ? String(fallback) : undefined;
  }

  private safePlayerClientId(player: PlayerViewLike): string | undefined {
    try {
      if (typeof player.clientID === "function") {
        const raw = player.clientID();
        if (typeof raw === "string" && raw.trim()) {
          return raw.trim();
        }
      }
    } catch (error) {
      console.warn("Failed to resolve player clientID", error);
    }

    const rawClientId = (player as { data?: { clientID?: unknown } }).data
      ?.clientID;
    if (typeof rawClientId === "string" && rawClientId.trim()) {
      return rawClientId.trim();
    }
    if (typeof rawClientId === "number" && Number.isFinite(rawClientId)) {
      return String(rawClientId);
    }

    return undefined;
  }

  private resolvePlayerViewByClientId(clientId: string): PlayerViewLike | null {
    if (!this.game) {
      return null;
    }
    const normalized = clientId.trim();
    if (!normalized) {
      return null;
    }

    if (typeof this.game.playerByClientID === "function") {
      try {
        const direct = this.game.playerByClientID(normalized);
        if (this.isPlayerViewLike(direct)) {
          return direct;
        }
      } catch {
        // Fall through to linear scan.
      }
    }

    try {
      const players = this.game.playerViews();
      for (const player of players) {
        if (this.safePlayerClientId(player) === normalized) {
          return player;
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  private resolvePlayerColor(
    player: PlayerViewLike | null | undefined,
  ): string | undefined {
    if (!player) {
      return undefined;
    }

    try {
      const direct = (player as { color?: string }).color;
      if (typeof direct === "string" && direct.trim()) {
        return direct.trim();
      }

      const callable = (player as { color?: () => string }).color;
      if (typeof callable === "function") {
        const result = callable.call(player);
        const normalized = this.normalizeColorValue(result);
        if (normalized) {
          return normalized;
        }
      }

      const territoryFn = (
        player as {
          territoryColor?: (tile?: number) => unknown;
        }
      ).territoryColor;
      if (typeof territoryFn === "function") {
        const territory = territoryFn.call(player);
        const normalized = this.normalizeColorValue(territory);
        if (normalized) {
          return normalized;
        }
      }

      const cosmetics = (
        player as {
          cosmetics?: { color?: { color?: string } };
        }
      ).cosmetics;
      const cosmeticColor = cosmetics?.color?.color;
      if (typeof cosmeticColor === "string" && cosmeticColor.trim()) {
        return cosmeticColor.trim();
      }
    } catch (error) {
      console.warn("Failed to resolve player color", error);
    }

    return undefined;
  }

  private normalizeColorValue(value: unknown): string | undefined {
    if (!value) {
      return undefined;
    }
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "object" && value !== null) {
      const hex = (value as { toHex?: () => string }).toHex?.();
      if (typeof hex === "string" && hex.trim()) {
        return hex.trim();
      }
      const rgb = (value as { toRgbString?: () => string }).toRgbString?.();
      if (typeof rgb === "string" && rgb.trim()) {
        return rgb.trim();
      }
    }
    return undefined;
  }

  private describeTile(ref: number | undefined): TileSummary | undefined {
    if (!this.game || ref === undefined) {
      return undefined;
    }
    const x = this.game.x(ref);
    const y = this.game.y(ref);
    let ownerId: string | undefined;
    let ownerName: string | undefined;
    if (this.game.hasOwner(ref)) {
      const smallId = this.game.ownerID(ref);
      ownerId = String(smallId);
      ownerName = this.resolveNameBySmallId(smallId);
    }
    return { ref, x, y, ownerId, ownerName } satisfies TileSummary;
  }

  private describePlayerFocus(player: PlayerViewLike): TileSummary | undefined {
    if (!this.game) {
      return undefined;
    }

    try {
      const location = player.nameLocation?.();
      if (!location) {
        return undefined;
      }

      const { x, y } = location;
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return undefined;
      }

      let ref: number | undefined;
      try {
        if (this.game.isValidCoord(x, y)) {
          ref = this.game.ref(x, y);
        }
      } catch (error) {
        console.warn("Failed to resolve player focus ref", error);
      }

      return {
        ref,
        x,
        y,
        ownerId: String(player.id()),
        ownerName: player.displayName(),
      } satisfies TileSummary;
    } catch (error) {
      console.warn("Failed to resolve player focus position", error);
      return undefined;
    }
  }

  private normalizeShipType(unitType: string): ShipType | null {
    switch (unitType) {
      case "Transport":
        return "Transport";
      case "Trade Ship":
        return "Trade Ship";
      case "Warship":
        return "Warship";
      default:
        return null;
    }
  }

  private captureAllianceChanges(players: PlayerViewLike[]): void {
    const nowTicks = this.game?.ticks() ?? 0;

    for (const player of players) {
      const playerId = String(player.id());
      const currentAlliances = new Set(
        player
          .alliances()
          .filter((alliance) => alliance.expiresAt > nowTicks)
          .map((alliance) => String(alliance.other)),
      );

      const previous = this.previousAlliances.get(playerId);
      if (previous) {
        const removed = [...previous].filter((id) => !currentAlliances.has(id));
        if (removed.length > 0 && this.isPlayerCurrentlyTraitor(player)) {
          for (const removedId of removed) {
            const targetName =
              this.resolveNameByPlayerId(removedId) ?? `Player ${removedId}`;
            this.getTraitorTargets(playerId).add(targetName);
          }
        }
      }

      this.previousAlliances.set(playerId, currentAlliances);
    }
  }

  private createPlayerRecord(
    player: PlayerViewLike,
    currentTimeMs: number,
    localPlayer: PlayerViewLike | null,
  ): PlayerRecord {
    const playerId = String(player.id());
    const name = player.displayName();
    const clan = extractClanTag(name);

    const incomingRaw = player
      .incomingAttacks()
      .filter((attack) => !attack.retreating);
    const outgoingRaw = player
      .outgoingAttacks()
      .filter((attack) => !attack.retreating);

    const incomingAttacks = this.mapIncomingAttacks(incomingRaw);
    const nonExpansionOutgoing = outgoingRaw.filter(
      (attack) => attack.targetID !== 0,
    );
    const outgoingAttacks = this.mapOutgoingAttacks(nonExpansionOutgoing);
    const expansions = outgoingRaw.length - nonExpansionOutgoing.length;

    const alliances = this.mapActiveAlliances(player);
    const goldValue = player.gold();
    const gold = typeof goldValue === "bigint" ? Number(goldValue) : goldValue;
    const troops = player.isAlive() ? player.troops() : 0;

    const tradeStatus = this.determineTradeStatus(localPlayer, player);
    const tradeStopped = tradeStatus.stopped;
    const tradeStoppedBySelf = tradeStatus.stoppedBySelf;
    const tradeStoppedByOther = tradeStatus.stoppedByOther;
    const isSelf = this.isSamePlayer(localPlayer, playerId);
    const clientID = this.safePlayerClientId(player);

    return {
      id: playerId,
      clientID,
      publicId: isSelf ? (this.localPlayerPublicId ?? undefined) : undefined,
      name,
      clan,
      team: player.team() ?? undefined,
      color: this.resolvePlayerColor(player) ?? undefined,
      position: this.describePlayerFocus(player),
      traitorTargets: Array.from(this.getTraitorTargets(playerId)),
      tradeStopped,
      tradeStoppedBySelf,
      tradeStoppedByOther,
      isSelf,
      tiles: player.numTilesOwned(),
      gold,
      troops,
      incomingAttacks,
      outgoingAttacks,
      defensiveSupports: [],
      expansions,
      waiting: !player.hasSpawned(),
      eliminated: !player.isAlive(),
      disconnected: player.isDisconnected(),
      traitor: player.isTraitor(),
      alliances,
      lastUpdatedMs: currentTimeMs,
    };
  }

  private mapIncomingAttacks(attacks: AttackUpdateLike[]): IncomingAttack[] {
    return attacks.map((attack) => ({
      id: attack.id,
      from: this.resolveNameBySmallId(attack.attackerID),
      troops: this.resolveAttackTroops(attack),
    }));
  }

  private mapOutgoingAttacks(attacks: AttackUpdateLike[]): OutgoingAttack[] {
    return attacks.map((attack) => ({
      id: attack.id,
      target: this.resolveNameBySmallId(attack.targetID),
      troops: this.resolveAttackTroops(attack),
    }));
  }

  private resolveAttackTroops(attack: AttackUpdateLike): number {
    if (attack.troops > 0) {
      return attack.troops;
    }

    const manifest = this.shipManifests.get(String(attack.id));
    return manifest ?? attack.troops;
  }

  private formatAttackBorderTroopCount(rawTroops: number): string | null {
    const normalized = Math.floor(Math.max(rawTroops, 0) / 10);
    if (normalized <= 0) {
      return null;
    }
    if (normalized < ATTACK_BORDER_TROOP_COMPACT_THRESHOLD) {
      return formatTroopCount(rawTroops);
    }
    try {
      return ATTACK_BORDER_TROOP_COMPACT_FORMATTER.format(normalized);
    } catch {
      return formatTroopCount(rawTroops);
    }
  }

  private resolveAttackBorderLabelMinScale(edgeCount: number): number {
    if (!Number.isFinite(edgeCount) || edgeCount <= 0) {
      return 0;
    }
    if (edgeCount <= ATTACK_BORDER_ZOOM_EDGE_TINY_MAX) {
      return ATTACK_BORDER_ZOOM_MIN_SCALE_TINY;
    }
    if (edgeCount <= ATTACK_BORDER_ZOOM_EDGE_SMALL_MAX) {
      return ATTACK_BORDER_ZOOM_MIN_SCALE_SMALL;
    }
    if (edgeCount <= ATTACK_BORDER_ZOOM_EDGE_MEDIUM_MAX) {
      return ATTACK_BORDER_ZOOM_MIN_SCALE_MEDIUM;
    }
    if (edgeCount <= ATTACK_BORDER_ZOOM_EDGE_LARGE_MAX) {
      return ATTACK_BORDER_ZOOM_MIN_SCALE_LARGE;
    }
    return 0;
  }

  private mapActiveAlliances(player: PlayerViewLike): AlliancePact[] {
    const nowTicks = this.game?.ticks() ?? 0;
    return player
      .alliances()
      .filter((alliance) => alliance.expiresAt > nowTicks)
      .map((alliance) => ({
        id: `${player.id()}-${alliance.id}`,
        partner:
          this.resolveNameByPlayerId(String(alliance.other)) ??
          `Player ${alliance.other}`,
        startedAtMs: alliance.createdAt * TICK_MILLISECONDS,
      }));
  }

  private resolveNameBySmallId(id: number): string {
    if (id === 0) {
      return "Terra Nullius";
    }

    if (!this.game) {
      return `Player ${id}`;
    }

    try {
      const entity = this.game.playerBySmallID(id);
      if ("displayName" in entity && typeof entity.displayName === "function") {
        return entity.displayName();
      }
      if ("name" in entity && typeof entity.name === "function") {
        return entity.name();
      }
    } catch (error) {
      console.warn("Failed to resolve player by small id", id, error);
    }

    return `Player ${id}`;
  }

  private resolveNameByPlayerId(id: string): string | undefined {
    if (!this.game) {
      return undefined;
    }

    try {
      return this.game.player(id).displayName();
    } catch (error) {
      console.warn("Failed to resolve player by id", id, error);
      return undefined;
    }
  }

  private getTraitorTargets(playerId: string): Set<string> {
    if (!this.traitorHistory.has(playerId)) {
      this.traitorHistory.set(playerId, new Set());
    }
    return this.traitorHistory.get(playerId)!;
  }

  private isPlayerCurrentlyTraitor(player: PlayerViewLike): boolean {
    if (player.isTraitor()) {
      return true;
    }
    if (typeof player.getTraitorRemainingTicks === "function") {
      return player.getTraitorRemainingTicks() > 0;
    }
    const remaining = player.traitorRemainingTicks;
    return typeof remaining === "number" ? remaining > 0 : false;
  }

  private resolveLocalPlayer(): PlayerViewLike | null {
    if (!this.game) {
      return null;
    }

    if (typeof this.game.myPlayer !== "function") {
      return null;
    }

    try {
      return this.game.myPlayer() ?? null;
    } catch (error) {
      console.warn("Failed to resolve local player", error);
      return null;
    }
  }

  private resolveLocalPlayerSmallId(): number | null {
    const local = this.resolveLocalPlayer();
    if (!local) {
      return null;
    }
    return this.safePlayerSmallId(local);
  }

  private determineTradeStatus(
    localPlayer: PlayerViewLike | null,
    other: PlayerViewLike,
  ): { stopped: boolean; stoppedBySelf: boolean; stoppedByOther: boolean } {
    const baseline = {
      stopped: false,
      stoppedBySelf: false,
      stoppedByOther: false,
    };
    if (!localPlayer) {
      return baseline;
    }

    if (this.isSamePlayer(localPlayer, String(other.id()))) {
      return baseline;
    }

    let aggregate: boolean | undefined;
    if (typeof localPlayer.hasEmbargo === "function") {
      try {
        const result = localPlayer.hasEmbargo(other);
        if (typeof result === "boolean") {
          aggregate = result;
        }
      } catch (error) {
        console.warn("Failed to read embargo state", error);
      }
    }

    let outbound: boolean | undefined;
    if (typeof localPlayer.hasEmbargoAgainst === "function") {
      try {
        const result = localPlayer.hasEmbargoAgainst(other);
        if (typeof result === "boolean") {
          outbound = result;
        }
      } catch (error) {
        console.warn("Failed to read outbound embargo state", error);
      }
    }

    let inbound: boolean | undefined;
    if (typeof other.hasEmbargoAgainst === "function") {
      try {
        const result = other.hasEmbargoAgainst(localPlayer);
        if (typeof result === "boolean") {
          inbound = result;
        }
      } catch (error) {
        console.warn("Failed to read inbound embargo state", error);
      }
    }

    let stoppedBySelf = outbound ?? false;
    let stoppedByOther = inbound ?? false;

    if (aggregate === true) {
      if (outbound === undefined && inbound === undefined) {
        stoppedBySelf = true;
        stoppedByOther = true;
      } else if (outbound === undefined && !stoppedByOther) {
        stoppedBySelf = true;
      } else if (inbound === undefined && !stoppedBySelf) {
        stoppedByOther = true;
      }
    }

    const stopped = Boolean(
      (aggregate ?? false) || stoppedBySelf || stoppedByOther,
    );
    return { stopped, stoppedBySelf, stoppedByOther };
  }

  private isSamePlayer(
    player: PlayerViewLike | null,
    otherId: string,
  ): boolean {
    if (!player) {
      return false;
    }

    try {
      const id = player.id();
      return String(id) === otherId;
    } catch (error) {
      console.warn("Failed to compare player identity", error);
      return false;
    }
  }

  private resolvePlayerById(playerId: string): PlayerViewLike | null {
    if (!this.game) {
      return null;
    }

    const attempts: Array<() => PlayerViewLike | null> = [
      () => {
        try {
          const candidate = this.game?.player(playerId);
          return this.isPlayerViewLike(candidate) ? candidate : null;
        } catch (error) {
          return null;
        }
      },
    ];

    const numericId = Number(playerId);
    if (Number.isFinite(numericId)) {
      attempts.push(() => {
        try {
          const candidate = this.game?.player(numericId);
          return this.isPlayerViewLike(candidate) ? candidate : null;
        } catch (error) {
          return null;
        }
      });
      attempts.push(() => {
        try {
          const candidate = this.game?.playerBySmallID(numericId);
          return this.isPlayerViewLike(candidate) ? candidate : null;
        } catch (error) {
          return null;
        }
      });
    }

    for (const attempt of attempts) {
      const result = attempt();
      if (result) {
        return result;
      }
    }

    console.warn(`Failed to resolve player ${playerId} in game context`);
    return null;
  }

  private isPlayerViewLike(value: unknown): value is PlayerViewLike {
    if (!value || typeof value !== "object") {
      return false;
    }
    const candidate = value as PlayerViewLike;
    return (
      typeof candidate.id === "function" &&
      typeof candidate.displayName === "function" &&
      typeof candidate.smallID === "function"
    );
  }

  private describePlayerForLog(player: PlayerViewLike): string {
    let name = "Unknown";
    let id: string | number = "?";
    try {
      name = player.displayName();
    } catch (error) {
      // ignore
    }
    try {
      id = player.id();
    } catch (error) {
      // ignore
    }
    return `${name} (#${id})`;
  }

  private startLobbyQueueUpdates(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (this.lobbyQueueRefreshHandle !== undefined) {
      window.clearInterval(this.lobbyQueueRefreshHandle);
    }
    const tick = () => this.enqueueLobbyQueueRefresh();
    tick();
    this.lobbyQueueRefreshHandle = window.setInterval(
      tick,
      PUBLIC_LOBBY_POLL_INTERVAL_MS,
    );
  }

  private enqueueLobbyQueueRefresh(): void {
    if (this.lobbyQueueRefreshPromise) {
      return;
    }
    this.lobbyQueueRefreshPromise = this.performLobbyQueueRefresh().finally(
      () => {
        this.lobbyQueueRefreshPromise = null;
      },
    );
  }

  private async performLobbyQueueRefresh(): Promise<void> {
    if (this.game) {
      this.clearLobbyQueueSnapshot();
      return;
    }

    const lobby = await this.resolveFeaturedLobby();
    if (this.game) {
      this.clearLobbyQueueSnapshot();
      return;
    }
    if (!lobby) {
      this.clearLobbyQueueSnapshot();
      return;
    }

    const queue = await this.buildLobbyQueueInfo(lobby);
    if (this.game) {
      this.clearLobbyQueueSnapshot();
      return;
    }
    if (!queue) {
      this.clearLobbyQueueSnapshot();
      return;
    }

    this.applyLobbyQueue(queue);
  }

  private clearLobbyQueueSnapshot(): void {
    const hadQueue = Boolean(this.snapshot.currentLobbyQueue);
    const shouldDropLobbyPlayers = !this.game;
    const hadLobbyPlayers = shouldDropLobbyPlayers
      ? this.snapshot.players.some((player) => player.isLobbyPlayer)
      : false;
    if (!hadQueue && !hadLobbyPlayers) {
      return;
    }
    this.lastLobbyTeamLogKey = null;
    if (shouldDropLobbyPlayers) {
      this.lastLiveGameTeamLogKey = null;
    }
    const players =
      shouldDropLobbyPlayers && hadLobbyPlayers
        ? this.snapshot.players.filter((player) => !player.isLobbyPlayer)
        : this.snapshot.players;
    const next = this.attachActionsState({
      ...this.snapshot,
      players,
      currentLobbyQueue: undefined,
    });
    if (hadQueue) {
      this.emitActionEvent("lobbyUpdated", null);
    }
    this.snapshot = next;
    this.notify();
  }

  private async resolveFeaturedLobby(): Promise<LobbySummary | null> {
    const fromElement = this.readLobbyFromElement();
    if (fromElement) {
      return fromElement;
    }
    const summaries = await this.fetchPublicLobbySummaries();
    return summaries.length ? summaries[0] : null;
  }

  private readLobbyFromElement(): LobbySummary | null {
    const element = this.hostDocument.querySelector(
      "public-lobby",
    ) as PublicLobbyElement | null;
    if (!element) {
      return null;
    }
    const lobbies = element.lobbies;
    if (!Array.isArray(lobbies) || lobbies.length === 0) {
      return null;
    }
    return this.normalizeLobbySummary(lobbies[0]);
  }

  private normalizeLobbySummary(
    input: LobbySummaryLike | null | undefined,
  ): LobbySummary | null {
    if (
      !input ||
      typeof input.gameID !== "string" ||
      input.gameID.length === 0
    ) {
      return null;
    }
    const summary: LobbySummary = {
      gameID: input.gameID,
    };
    if (typeof input.numClients === "number") {
      summary.numClients = input.numClients;
    }
    if (typeof input.msUntilStart === "number") {
      summary.msUntilStart = input.msUntilStart;
    }
    if (input.gameConfig) {
      summary.gameConfig = {
        gameMap:
          typeof input.gameConfig.gameMap === "string"
            ? input.gameConfig.gameMap
            : undefined,
        gameMode:
          typeof input.gameConfig.gameMode === "string"
            ? input.gameConfig.gameMode
            : undefined,
        maxPlayers:
          typeof input.gameConfig.maxPlayers === "number"
            ? input.gameConfig.maxPlayers
            : undefined,
        playerTeams:
          typeof input.gameConfig.playerTeams === "number" ||
          typeof input.gameConfig.playerTeams === "string"
            ? (input.gameConfig.playerTeams as LobbyTeamCountConfig)
            : undefined,
      };
    }
    return summary;
  }

  private async fetchPublicLobbySummaries(): Promise<LobbySummary[]> {
    if (typeof fetch !== "function") {
      return [];
    }
    try {
      const response = await fetch("/api/public_lobbies", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        return [];
      }
      const payload = (await response.json()) as {
        lobbies?: LobbySummaryLike[];
      };
      if (!payload || !Array.isArray(payload.lobbies)) {
        return [];
      }
      const summaries: LobbySummary[] = [];
      for (const entry of payload.lobbies) {
        const normalized = this.normalizeLobbySummary(entry);
        if (normalized) {
          summaries.push(normalized);
        }
      }
      return summaries;
    } catch (error) {
      console.warn("Failed to fetch public lobby list", error);
      return [];
    }
  }

  private async buildLobbyQueueInfo(
    summary: LobbySummary,
  ): Promise<LobbyQueueInfo | null> {
    const details = await this.fetchLobbyDetails(summary.gameID);
    if (!details) {
      return null;
    }
    const now = Date.now();
    const players = this.deriveLobbyPlayerList(details);
    const playerCount =
      players.length > 0
        ? players.length
        : (summary.numClients ?? details.numClients ?? 0);
    const mapName =
      summary.gameConfig?.gameMap ??
      details.gameConfig?.gameMap ??
      "Unknown map";
    const modeName =
      summary.gameConfig?.gameMode ??
      details.gameConfig?.gameMode ??
      "Unknown mode";
    const playerTeams =
      summary.gameConfig?.playerTeams ?? details.gameConfig?.playerTeams;
    const inferredMaxPlayers =
      summary.gameConfig?.maxPlayers ?? details.gameConfig?.maxPlayers;
    const maxPlayers =
      typeof inferredMaxPlayers === "number"
        ? Math.max(inferredMaxPlayers, playerCount)
        : Math.max(playerCount, 0);
    const startsAtMs = this.getLobbyStartTime(summary, details);
    return {
      gameId: summary.gameID,
      mapName,
      modeName,
      playerCount,
      maxPlayers,
      startsAtMs,
      updatedAtMs: now,
      players,
      playerTeams,
    };
  }

  private deriveLobbyPlayerList(
    details: LobbyDetails,
  ): LobbyQueueInfo["players"] {
    const players: LobbyQueueInfo["players"] = [];
    for (const client of details.clients) {
      const id =
        typeof client.clientID === "string" && client.clientID.length > 0
          ? client.clientID
          : `client-${players.length}`;
      const name =
        typeof client.username === "string" && client.username.trim().length > 0
          ? client.username.trim()
          : "Anonymous player";
      players.push({ id, name });
    }
    return players;
  }

  private createLobbyQueuePlayers(queue: LobbyQueueInfo): PlayerRecord[] {
    const now = Date.now();
    const fallbackTeamName =
      queue.modeName && queue.modeName !== "Unknown mode"
        ? `${queue.modeName} lobby`
        : "Lobby queue";
    const normalizedPlayers = queue.players.map((entry, index) => {
      const trimmedName = entry.name?.trim() ?? "Anonymous player";
      const safeName =
        trimmedName.length > 0 ? trimmedName : "Anonymous player";
      const playerId =
        entry.id && entry.id.length > 0
          ? `lobby:${queue.gameId}:${entry.id}`
          : `lobby:${queue.gameId}:slot-${index + 1}`;
      return {
        id: playerId,
        name: safeName,
        clan: extractClanTag(safeName),
        lobbyPosition: index + 1,
      };
    });

    const predictedTeams = predictLobbyTeams(
      normalizedPlayers.map((player) => ({ id: player.id, name: player.name })),
      {
        modeName: queue.modeName,
        playerTeams: queue.playerTeams,
        maxPlayers: queue.maxPlayers,
      },
    );

    return normalizedPlayers.map((player) => {
      const predictedTeam = predictedTeams.get(player.id);
      const wasKicked = predictedTeam === LOBBY_TEAM_KICKED;
      const teamLabel =
        !predictedTeam || wasKicked ? fallbackTeamName : predictedTeam;
      return {
        id: player.id,
        name: player.name,
        clan: player.clan,
        team: teamLabel,
        color: undefined,
        position: undefined,
        traitorTargets: [],
        tradeStopped: false,
        tradeStoppedBySelf: false,
        tradeStoppedByOther: false,
        isSelf: false,
        tiles: 0,
        gold: 0,
        troops: 0,
        incomingAttacks: [],
        outgoingAttacks: [],
        defensiveSupports: [],
        expansions: 0,
        waiting: true,
        eliminated: false,
        disconnected: false,
        traitor: false,
        alliances: [],
        lastUpdatedMs: now,
        isLobbyPlayer: true,
        lobbyPosition: player.lobbyPosition,
        wasKickedFromLobby: wasKicked,
      };
    });
  }

  private async fetchLobbyDetails(
    gameId: string,
  ): Promise<LobbyDetails | null> {
    const now = Date.now();
    const cached = this.lobbyDetailsCache.get(gameId);
    if (cached && cached.expiresAt > now) {
      return cached.details;
    }
    const workerPath = await this.resolveWorkerPath(gameId);
    if (!workerPath || typeof fetch !== "function") {
      return null;
    }
    try {
      const response = await fetch(`/${workerPath}/api/game/${gameId}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as LobbyDetailsLike;
      const normalized = this.normalizeLobbyDetails(payload);
      if (normalized) {
        this.lobbyDetailsCache.set(gameId, {
          expiresAt: now + LOBBY_DETAILS_CACHE_MS,
          details: normalized,
        });
        return normalized;
      }
    } catch (error) {
      console.warn(`Failed to fetch lobby ${gameId}`, error);
    }
    return null;
  }

  private normalizeLobbyDetails(
    details: LobbyDetailsLike | null | undefined,
  ): LobbyDetails | null {
    const summary = this.normalizeLobbySummary(details);
    if (!summary) {
      return null;
    }
    const clients: LobbyClientInfoLike[] = [];
    if (Array.isArray(details?.clients)) {
      for (const client of details.clients) {
        clients.push({
          clientID:
            typeof client.clientID === "string" && client.clientID.length > 0
              ? client.clientID
              : undefined,
          username:
            typeof client.username === "string" && client.username.length > 0
              ? client.username
              : undefined,
        });
      }
    }
    return {
      ...summary,
      clients,
    };
  }

  private async resolveWorkerPath(gameId: string): Promise<string | null> {
    const info = await this.getLobbyWorkerInfo();
    const workerCount = Math.max(1, info.workerCount);
    const index = hashString(gameId) % workerCount;
    return `w${index}`;
  }

  private async getLobbyWorkerInfo(): Promise<LobbyWorkerInfo> {
    if (this.lobbyWorkerInfoPromise) {
      return this.lobbyWorkerInfoPromise;
    }
    this.lobbyWorkerInfoPromise = this.fetchLobbyWorkerInfo();
    return this.lobbyWorkerInfoPromise;
  }

  private async fetchLobbyWorkerInfo(): Promise<LobbyWorkerInfo> {
    if (typeof fetch !== "function") {
      return { workerCount: DEFAULT_WORKER_COUNT };
    }
    try {
      const response = await fetch("/api/env", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        return { workerCount: DEFAULT_WORKER_COUNT };
      }
      const payload = (await response.json()) as { game_env?: string };
      const env = typeof payload?.game_env === "string" ? payload.game_env : "";
      const workerCount = WORKER_COUNT_BY_ENV[env] ?? DEFAULT_WORKER_COUNT;
      return { workerCount };
    } catch (error) {
      console.warn("Failed to resolve server environment", error);
      return { workerCount: DEFAULT_WORKER_COUNT };
    }
  }

  private applyLobbyQueue(queue: LobbyQueueInfo): void {
    const players = this.createLobbyQueuePlayers(queue);
    const nextSnapshot = this.attachActionsState({
      ...this.snapshot,
      players,
      currentLobbyQueue: queue,
      currentTimeMs: Date.now(),
    });
    const queueChanged = !this.areLobbyQueuesEqual(
      this.snapshot.currentLobbyQueue,
      queue,
    );
    const timeChanged =
      Math.abs(nextSnapshot.currentTimeMs - this.snapshot.currentTimeMs) >=
      1000;
    if (queueChanged || timeChanged) {
      if (queueChanged) {
        this.logLobbyTeamPredictions(queue, players);
        this.emitActionEvent("lobbyUpdated", queue);
      }
      this.snapshot = nextSnapshot;
      this.notify();
    }
  }

  private logLobbyTeamPredictions(
    queue: LobbyQueueInfo,
    players: PlayerRecord[],
  ): void {
    if (players.length === 0) {
      return;
    }
    const signature = this.buildPlayerTeamSignature(players, queue.gameId);
    if (this.lastLobbyTeamLogKey === signature) {
      return;
    }
    this.lastLobbyTeamLogKey = signature;
  }

  private logLiveGameTeams(players: PlayerRecord[]): void {
    if (players.length === 0) {
      return;
    }
  }

  private buildPlayerTeamSignature(
    players: PlayerRecord[],
    scope?: string,
  ): string {
    const prefix = scope ? `${scope}::` : "";
    const entries = players
      .map((player) => `${player.id}:${player.team ?? ""}`)
      .sort();
    return `${prefix}${entries.join("|")}`;
  }

  private areLobbyQueuesEqual(
    previous?: LobbyQueueInfo,
    next?: LobbyQueueInfo,
  ): boolean {
    if (!previous && !next) {
      return true;
    }
    if (!previous || !next) {
      return false;
    }
    if (
      previous.gameId !== next.gameId ||
      previous.mapName !== next.mapName ||
      previous.modeName !== next.modeName ||
      previous.playerCount !== next.playerCount ||
      previous.maxPlayers !== next.maxPlayers ||
      previous.startsAtMs !== next.startsAtMs
    ) {
      return false;
    }
    if (previous.players.length !== next.players.length) {
      return false;
    }
    for (let i = 0; i < previous.players.length; i++) {
      const left = previous.players[i];
      const right = next.players[i];
      if (left.id !== right.id || left.name !== right.name) {
        return false;
      }
    }
    return true;
  }

  private getLobbyStartTime(
    summary: LobbySummary,
    details?: LobbyDetails,
  ): number | undefined {
    if (
      typeof details?.msUntilStart === "number" &&
      Number.isFinite(details.msUntilStart)
    ) {
      return Date.now() + Math.max(0, details.msUntilStart);
    }
    if (
      typeof summary.msUntilStart === "number" &&
      Number.isFinite(summary.msUntilStart)
    ) {
      return Date.now() + Math.max(0, summary.msUntilStart);
    }
    return undefined;
  }
}
