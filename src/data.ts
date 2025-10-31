import {
  createSidebarLogger,
  sidebarLogger,
  subscribeToSidebarLogs,
} from "./logger";
import {
  GoldDonationOverlay,
  HistoricalMissileTrajectoryOverlay,
  MissileFlightSummary,
  MissileSiloSummary,
  MissileTrajectoryOverlay,
  TransformHandlerLike,
  TroopDonationOverlay,
  TroopDonationOverlayPlayerSnapshot,
  UiStateLike,
} from "./overlays";
import {
  AlliancePact,
  GameSnapshot,
  IncomingAttack,
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
  SidebarLogEntry,
  SidebarLogger,
  SidebarOverlayDefinition,
  SidebarRunningAction,
  SidebarRunningActionStatus,
  SidebarStructureBuiltEvent,
  SidebarTroopDonationEvent,
  TileSummary,
} from "./types";
import { extractClanTag } from "./utils";

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
const DONATION_DEDUP_TICK_WINDOW = 5;
const TROOP_DONATION_OVERLAY_ID = "troop-donations";
const GOLD_DONATION_OVERLAY_ID = "gold-donations";

// These constants mirror the values defined in src/core/game/GameUpdates.ts and Game.ts.
const GAME_UPDATE_TYPE_DISPLAY_EVENT = 3;
const MESSAGE_TYPE_SENT_GOLD_TO_PLAYER = 18;
const MESSAGE_TYPE_RECEIVED_GOLD_FROM_PLAYER = 19;
const MESSAGE_TYPE_SENT_TROOPS_TO_PLAYER = 21;
const MESSAGE_TYPE_RECEIVED_TROOPS_FROM_PLAYER = 22;

type GameUpdatesLike = Record<number, unknown> | null;

type ActionExecutionState = Record<string, unknown>;

interface DisplayMessageUpdateLike {
  message: string;
  messageType: number;
  playerID: number | null;
  params?: Record<string, unknown>;
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
  displayName(): string;
  smallID(): number;
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
  forEachTile(fn: (ref: number) => void): void;
  myPlayer?(): PlayerViewLike | null;
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
  private missileOverlay?: MissileTrajectoryOverlay;
  private historicalMissileOverlay?: HistoricalMissileTrajectoryOverlay;
  private troopDonationOverlay?: TroopDonationOverlay;
  private goldDonationOverlay?: GoldDonationOverlay;
  private displayEventPollingHandle: number | undefined;
  private displayEventPollingActive = false;
  private displayEventPollingLastTimestamp = 0;
  private lastProcessedDisplayUpdates: GameUpdatesLike = null;
  private readonly recentTroopDonations: Map<string, number> = new Map();
  private readonly recentGoldDonations: Map<string, number> = new Map();
  private readonly logSubscriptionCleanup: () => void;

  constructor(initialSnapshot?: GameSnapshot) {
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
        () => this.logSubscriptionCleanup(),
        { once: true },
      );
    }

    if (typeof window !== "undefined") {
      this.scheduleGameDiscovery(true);
    }

    this.ensureAllEventActionsRunning();
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
        unitType,
      };

      flights.push(flight);
    }

    return flights;
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
    if (!this.historicalMissileOverlay) {
      return;
    }
    this.historicalMissileOverlay.setTrajectories(
      this.collectHistoricalMissiles(),
    );
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

  private resolveTransformHandler(): TransformHandlerLike | null {
    if (typeof document === "undefined") {
      return null;
    }

    const candidates: TransformHostElement[] = [
      document.querySelector("build-menu") as TransformHostElement,
      document.querySelector("emoji-table") as TransformHostElement,
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
    const controlPanel = document.querySelector(
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

    const actions = [
      tradeBan,
      enableTrade,
      missileSiloAlerts,
      troopDonationLogger,
      goldDonationLogger,
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
    this.sidebarLogs = [...this.sidebarLogs, entry];
    if (this.sidebarLogs.length > MAX_LOG_ENTRIES) {
      this.sidebarLogs = this.sidebarLogs.slice(-MAX_LOG_ENTRIES);
    }
    this.sidebarLogRevision += 1;
    this.snapshot = this.attachActionsState({ ...this.snapshot });
    this.notify();
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
    this.snapshot = this.attachActionsState({
      ...snapshot,
      currentTimeMs: snapshot.currentTimeMs ?? Date.now(),
      ships: snapshot.ships ?? [],
    });
    this.notify();
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

    if (overlayId === MISSILE_TRAJECTORY_OVERLAY_ID) {
      if (enabled) {
        const effect = this.ensureMissileOverlay();
        effect.setSiloPositions(this.collectMissileSiloPositions());
        effect.enable();
      } else if (this.missileOverlay) {
        this.missileOverlay.disable();
      }
    } else if (overlayId === HISTORICAL_MISSILE_OVERLAY_ID) {
      if (enabled) {
        const effect = this.ensureHistoricalMissileOverlay();
        effect.setTrajectories(this.collectHistoricalMissiles());
        effect.enable();
      } else if (this.historicalMissileOverlay) {
        this.historicalMissileOverlay.disable();
      }
    } else if (overlayId === TROOP_DONATION_OVERLAY_ID) {
      if (enabled) {
        const effect = this.ensureTroopDonationOverlay();
        this.syncTroopDonationOverlay();
        effect.enable();
      } else if (this.troopDonationOverlay) {
        this.troopDonationOverlay.disable();
      }
    } else if (overlayId === GOLD_DONATION_OVERLAY_ID) {
      if (enabled) {
        const effect = this.ensureGoldDonationOverlay();
        this.syncGoldDonationOverlay();
        effect.enable();
      } else if (this.goldDonationOverlay) {
        this.goldDonationOverlay.disable();
      }
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
      sidebarLogger.warn(
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
    const logger = createSidebarLogger(`Action ${run.name} [${run.id}]`);
    return {
      game: this.buildActionGameApi(),
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
          sidebarLogger.warn(`${label} failed.`);
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

    const element = document.querySelector(
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
        this.stopDisplayEventPolling();
        this.game = discovered;
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
    const candidates: NodeListOf<GameAwareElement> = document.querySelectorAll(
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
      const ships = this.createShipRecords();
      const records = players.map((player) =>
        this.createPlayerRecord(player, currentTimeMs, localPlayer),
      );
      const recordLookup = new Map<string, PlayerRecord>();
      for (const record of records) {
        recordLookup.set(record.id, record);
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
      this.notify();
    } catch (error) {
      // If the game context changes while we're reading from it, try attaching again.
      console.warn("Failed to refresh sidebar data", error);
      this.game = null;
      this.resetLiveGameTracking();
      this.troopDonationOverlay?.clear();
      this.goldDonationOverlay?.clear();
      if (this.refreshHandle !== undefined) {
        window.clearInterval(this.refreshHandle);
        this.refreshHandle = undefined;
      }
      this.stopDisplayEventPolling();
      this.scheduleGameDiscovery();
    }
  }

  private createShipRecords(): ShipRecord[] {
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
      ships.push(this.createShipRecord(unit, type));
    }
    ships.sort((a, b) => a.ownerName.localeCompare(b.ownerName));
    this.pruneStaleShipMemory(new Set(ships.map((ship) => ship.id)));
    return ships;
  }

  private createShipRecord(unit: UnitViewLike, type: ShipType): ShipRecord {
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
    return {
      id: String(unit.id()),
      type,
      ownerId,
      ownerName,
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
    this.recentTroopDonations.clear();
    this.recentGoldDonations.clear();
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

    if (updates === this.lastProcessedDisplayUpdates) {
      return;
    }

    this.lastProcessedDisplayUpdates = updates;
    const displayEvents = this.extractDisplayEvents(updates);
    if (displayEvents.length === 0) {
      return;
    }

    const records = playerRecords ?? this.buildPlayerRecordLookupFromSnapshot();
    for (const event of displayEvents) {
      const troopDonation = this.createTroopDonationEvent(event, records);
      if (
        troopDonation &&
        this.registerDonation(troopDonation, this.recentTroopDonations)
      ) {
        this.emitActionEvent("troopsDonated", troopDonation);
        if (this.troopDonationOverlay?.isActive()) {
          const senderView = this.resolvePlayerViewById(troopDonation.senderId);
          this.troopDonationOverlay.registerDonation(troopDonation, {
            fallbackColor: this.resolvePlayerColor(senderView),
          });
        }
        continue;
      }

      const goldDonation = this.createGoldDonationEvent(event, records);
      if (
        goldDonation &&
        this.registerDonation(goldDonation, this.recentGoldDonations)
      ) {
        this.emitActionEvent("goldDonated", goldDonation);
        if (this.goldDonationOverlay?.isActive()) {
          const senderView = this.resolvePlayerViewById(goldDonation.senderId);
          this.goldDonationOverlay.registerDonation(goldDonation, {
            fallbackColor: this.resolvePlayerColor(senderView),
          });
        }
      }
    }
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

  private createTroopDonationEvent(
    update: DisplayMessageUpdateLike,
    playerRecords: Map<string, PlayerRecord>,
  ): SidebarTroopDonationEvent | null {
    const parsed = this.parseTroopDonationMessage(update);
    if (!parsed) {
      return null;
    }

    const records = playerRecords;
    let sender: PlayerSummary | null = null;
    let recipient: PlayerSummary | null = null;

    if (parsed.direction === "sent") {
      sender = this.buildPlayerSummaryFromSmallId(update.playerID, records);
      recipient = this.buildPlayerSummaryFromName(parsed.otherName, records);
    } else {
      recipient = this.buildPlayerSummaryFromSmallId(update.playerID, records);
      sender = this.buildPlayerSummaryFromName(parsed.otherName, records);
    }

    if (!sender || !recipient) {
      return null;
    }

    const amountApprox = this.parseDonationAmount(parsed.amountDisplay);
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
      amountDisplay: parsed.amountDisplay,
      amountApprox,
      tick: this.getCurrentGameTick(),
    } satisfies SidebarTroopDonationEvent;
  }

  private createGoldDonationEvent(
    update: DisplayMessageUpdateLike,
    playerRecords: Map<string, PlayerRecord>,
  ): SidebarGoldDonationEvent | null {
    const parsed = this.parseGoldDonationMessage(update);
    if (!parsed) {
      return null;
    }

    const records = playerRecords;
    let sender: PlayerSummary | null = null;
    let recipient: PlayerSummary | null = null;

    if (parsed.direction === "sent") {
      sender = this.buildPlayerSummaryFromSmallId(update.playerID, records);
      recipient = this.buildPlayerSummaryFromName(parsed.otherName, records);
    } else {
      recipient = this.buildPlayerSummaryFromSmallId(update.playerID, records);
      sender = this.buildPlayerSummaryFromName(parsed.otherName, records);
    }

    if (!sender || !recipient) {
      return null;
    }

    const amountApprox = this.parseDonationAmount(parsed.amountDisplay);
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
      amountDisplay: parsed.amountDisplay,
      amountApprox,
      tick: this.getCurrentGameTick(),
    } satisfies SidebarGoldDonationEvent;
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
    if (!message) {
      return null;
    }

    if (update.messageType === MESSAGE_TYPE_SENT_TROOPS_TO_PLAYER) {
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
    if (!message) {
      return null;
    }

    if (update.messageType === MESSAGE_TYPE_SENT_GOLD_TO_PLAYER) {
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
    const outgoingAttacks = this.mapOutgoingAttacks(outgoingRaw);
    const expansions = outgoingRaw.filter(
      (attack) => attack.targetID === 0,
    ).length;

    const alliances = this.mapActiveAlliances(player);
    const goldValue = player.gold();
    const gold = typeof goldValue === "bigint" ? Number(goldValue) : goldValue;

    const tradeStatus = this.determineTradeStatus(localPlayer, player);
    const tradeStopped = tradeStatus.stopped;
    const tradeStoppedBySelf = tradeStatus.stoppedBySelf;
    const tradeStoppedByOther = tradeStatus.stoppedByOther;
    const isSelf = this.isSamePlayer(localPlayer, playerId);

    return {
      id: playerId,
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
      troops: player.troops(),
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
}
