import { describe, expect, it, vi } from "vitest";

import { DataStore } from "./data";

function setMockDocument(): void {
  (globalThis as { document?: unknown }).document = {
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true,
    querySelector: () => null,
  } as unknown as Document;
}

function setMockWindow(): void {
  (globalThis as { window?: unknown }).window = {
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  } as unknown as Window;
}

function setMockStorage() {
  const values = new Map<string, string>();
  (globalThis as { GM_getValue?: unknown }).GM_getValue = (
    key: string,
    fallback: string | null,
  ) => values.get(key) ?? fallback;
  (globalThis as { GM_setValue?: unknown }).GM_setValue = (
    key: string,
    value: string,
  ) => {
    values.set(key, value);
  };
  return values;
}

function captureGlobalState() {
  return {
    window: (globalThis as { window?: unknown }).window,
    document: (globalThis as { document?: unknown }).document,
    gmGetValue: (globalThis as { GM_getValue?: unknown }).GM_getValue,
    gmSetValue: (globalThis as { GM_setValue?: unknown }).GM_setValue,
  };
}

function restoreGlobalState(
  state: ReturnType<typeof captureGlobalState>,
): void {
  (globalThis as { window?: unknown }).window = state.window;
  (globalThis as { document?: unknown }).document = state.document;
  (globalThis as { GM_getValue?: unknown }).GM_getValue = state.gmGetValue;
  (globalThis as { GM_setValue?: unknown }).GM_setValue = state.gmSetValue;
}

describe("DataStore lobby queues", () => {
  it("normalizes featured lobby updates into ordered featured queues", () => {
    setMockDocument();

    const store = new DataStore(undefined as unknown as never) as unknown as {
      normalizePublicLobbyUpdatePayload: (payload: unknown) => Array<{
        gameID: string;
        publicGameType?: string;
        startsAt?: number;
      }>;
    };

    const summaries = store.normalizePublicLobbyUpdatePayload({
      serverTime: 1_000_000,
      games: {
        team: [
          {
            gameID: "team-1",
            msUntilStart: 20_000,
          },
        ],
        special: [
          {
            gameID: "special-1",
            startsAt: 1_111_111,
          },
        ],
        ffa: [
          {
            gameID: "ffa-1",
            msUntilStart: 10_000,
          },
          {
            gameID: "ffa-2",
            msUntilStart: 30_000,
          },
        ],
      },
    });

    expect(summaries.map((summary) => summary.gameID)).toEqual([
      "special-1",
      "ffa-1",
      "team-1",
    ]);
    expect(summaries.map((summary) => summary.publicGameType)).toEqual([
      "special",
      "ffa",
      "team",
    ]);
    expect(summaries[1]?.startsAt).toBe(1_010_000);
    expect(summaries[2]?.startsAt).toBe(1_020_000);
  });

  it("stores all featured lobby queues in the snapshot", () => {
    setMockDocument();

    const store = new DataStore(undefined as unknown as never) as unknown as {
      applyLobbyQueues: (queues: Array<Record<string, unknown>>) => void;
      snapshot: {
        currentLobbyQueue?: { gameId: string };
        currentLobbyQueues?: Array<{ gameId: string }>;
        players: Array<{
          isLobbyPlayer?: boolean;
          lobbyGameId?: string;
          lobbyLabel?: string;
        }>;
      };
    };

    store.applyLobbyQueues([
      {
        gameId: "special-1",
        mapName: "Europe",
        modeName: "Team",
        lobbyLabel: "Europe • Team",
        playerCount: 2,
        maxPlayers: 20,
        updatedAtMs: 1,
        players: [
          { id: "a", name: "[TAG] Alpha" },
          { id: "b", name: "Bravo" },
        ],
        playerTeams: "Duos",
        publicGameType: "special",
      },
      {
        gameId: "ffa-1",
        mapName: "World",
        modeName: "FFA",
        lobbyLabel: "World • FFA",
        playerCount: 1,
        maxPlayers: 50,
        updatedAtMs: 1,
        players: [{ id: "c", name: "Charlie" }],
        publicGameType: "ffa",
      },
    ]);

    expect(store.snapshot.currentLobbyQueue?.gameId).toBe("special-1");
    expect(
      store.snapshot.currentLobbyQueues?.map((queue) => queue.gameId),
    ).toEqual(["special-1", "ffa-1"]);
    expect(
      store.snapshot.players
        .filter((player) => player.isLobbyPlayer)
        .map((player) => ({
          gameId: player.lobbyGameId,
          label: player.lobbyLabel,
        })),
    ).toEqual([
      { gameId: "special-1", label: "Europe • Team" },
      { gameId: "special-1", label: "Europe • Team" },
      { gameId: "ffa-1", label: "World • FFA" },
    ]);
  });

  it("refreshes lobby queues immediately when featured lobby events arrive", () => {
    setMockDocument();

    const store = new DataStore(undefined as unknown as never) as unknown as {
      publicLobbiesHandler: (event: Event) => void;
      latestFeaturedLobbySummaries: Array<{ gameID: string }> | null;
      enqueueLobbyQueueRefresh: () => void;
    };
    const enqueueLobbyQueueRefresh = vi.fn();
    store.enqueueLobbyQueueRefresh = enqueueLobbyQueueRefresh;

    store.publicLobbiesHandler({
      detail: {
        payload: {
          serverTime: 1_000,
          games: {
            special: [{ gameID: "special-1", msUntilStart: 5_000 }],
          },
        },
      },
    } as unknown as Event);

    expect(
      store.latestFeaturedLobbySummaries?.map((entry) => entry.gameID),
    ).toEqual(["special-1"]);
    expect(enqueueLobbyQueueRefresh).toHaveBeenCalledTimes(1);
  });

  it("updates the snapshot when only lobby metadata changes", () => {
    setMockDocument();
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1_000);

    try {
      const store = new DataStore(undefined as unknown as never) as unknown as {
        applyLobbyQueues: (queues: Array<Record<string, unknown>>) => void;
        snapshot: {
          currentLobbyQueues?: Array<{
            gameId: string;
            lobbyLabel: string;
            playerTeams?: string;
            publicGameType?: string;
          }>;
        };
      };

      store.applyLobbyQueues([
        {
          gameId: "special-1",
          mapName: "Europe",
          modeName: "Team",
          lobbyLabel: "Europe • Team",
          playerCount: 2,
          maxPlayers: 20,
          updatedAtMs: 1,
          players: [
            { id: "a", name: "[TAG] Alpha" },
            { id: "b", name: "Bravo" },
          ],
          playerTeams: "Duos",
          publicGameType: "special",
        },
      ]);

      store.applyLobbyQueues([
        {
          gameId: "special-1",
          mapName: "Europe",
          modeName: "Team",
          lobbyLabel: "Europe • Duos",
          playerCount: 2,
          maxPlayers: 20,
          updatedAtMs: 1,
          players: [
            { id: "a", name: "[TAG] Alpha" },
            { id: "b", name: "Bravo" },
          ],
          playerTeams: "Trios",
          publicGameType: "team",
        },
      ]);

      expect(store.snapshot.currentLobbyQueues?.[0]).toMatchObject({
        gameId: "special-1",
        lobbyLabel: "Europe • Duos",
        playerTeams: "Trios",
        publicGameType: "team",
      });
    } finally {
      nowSpy.mockRestore();
    }
  });
});

describe("DataStore lobby display name", () => {
  it("reads clan tag and username from the split lobby input", () => {
    const state = captureGlobalState();
    try {
      setMockWindow();
      const tagInput = {
        type: "text",
        value: "TAG",
        dispatchEvent: () => true,
      };
      const baseInput = {
        type: "text",
        value: "Mate",
        dispatchEvent: () => true,
      };
      const usernameInput: {
        getCurrentUsername?: () => string;
        querySelectorAll: () => [typeof tagInput, typeof baseInput];
      } = {
        querySelectorAll: () => [tagInput, baseInput],
      };
      usernameInput.getCurrentUsername = () => "[TAG] Mate";
      (globalThis as { document?: unknown }).document = {
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => true,
        querySelector: (selector: string) =>
          selector === "username-input" ? usernameInput : null,
        querySelectorAll: () => [],
      } as unknown as Document;

      const store = new DataStore(undefined as unknown as never) as unknown as {
        readLobbyDisplayName: () => string | undefined;
        resolveCurrentLobbyClanTag: () => string | undefined;
      };

      expect(store.readLobbyDisplayName()).toBe("[TAG] Mate");
      expect(store.resolveCurrentLobbyClanTag()).toBe("TAG");
    } finally {
      restoreGlobalState(state);
    }
  });

  it("updates split lobby inputs when changing the display name", () => {
    const state = captureGlobalState();
    try {
      setMockWindow();
      const storage = setMockStorage();
      const tagInput = {
        type: "text",
        value: "",
        dispatchEvent: vi.fn(() => true),
      };
      const baseInput = {
        type: "text",
        value: "Anon123",
        dispatchEvent: vi.fn(() => true),
      };
      const usernameInput = {
        querySelectorAll: () => [tagInput, baseInput],
      };
      (globalThis as { document?: unknown }).document = {
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => true,
        querySelector: (selector: string) =>
          selector === "username-input" ? usernameInput : null,
        querySelectorAll: () => [],
      } as unknown as Document;

      const store = new DataStore(undefined as unknown as never) as unknown as {
        applyLobbyDisplayName: (name: string) => boolean;
        readLobbyDisplayName: () => string | undefined;
        resolveCurrentLobbyClanTag: () => string | undefined;
      };

      expect(store.applyLobbyDisplayName("[ABC] Zed")).toBe(true);
      expect(tagInput.value).toBe("ABC");
      expect(baseInput.value).toBe("Zed");
      expect(storage.get("username")).toBe("[ABC] Zed");
      expect(store.readLobbyDisplayName()).toBe("[ABC] Zed");
      expect(store.resolveCurrentLobbyClanTag()).toBe("ABC");
    } finally {
      restoreGlobalState(state);
    }
  });
});

describe("DataStore display event polling", () => {
  it("processes appended display events even when updates object is reused", () => {
    setMockDocument();

    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      processRecentDisplayEvents: () => void;
      buildPlayerRecordLookupFromSnapshot: () => Map<string, unknown>;
      resolveDonationEvents: (events: Array<{ message: string }>) => {
        troopDonations: Array<Record<string, unknown>>;
        goldDonations: Array<Record<string, unknown>>;
      };
      registerDonation: () => boolean;
      emitActionEvent: (type: string, payload: unknown) => void;
    };

    store.buildPlayerRecordLookupFromSnapshot = () => new Map();
    store.resolveDonationEvents = (events) => ({
      troopDonations: events.length
        ? [
            {
              senderId: "1",
              senderName: "Sender",
              recipientId: "2",
              recipientName: "Recipient",
              amountDisplay: "10",
              amountApprox: 10,
              tick: 1,
            },
          ]
        : [],
      goldDonations: [],
    });
    store.registerDonation = () => true;

    const emitted: string[] = [];
    store.emitActionEvent = (type) => emitted.push(type);

    const displayEvents: Array<unknown> = [
      { message: "donation", messageType: 1, playerID: 1 },
    ];
    const updates = { 3: displayEvents };

    store.game = {
      updatesSinceLastTick: () => updates,
    };

    store.processRecentDisplayEvents();
    expect(emitted).toEqual(["troopsDonated"]);

    displayEvents.push({ message: "donation", messageType: 1, playerID: 1 });
    store.processRecentDisplayEvents();
    expect(emitted).toEqual(["troopsDonated", "troopsDonated"]);

    vi.restoreAllMocks();
  });

  it("extracts donation intents from websocket turn payloads", () => {
    setMockDocument();

    const store = new DataStore(undefined as unknown as never) as unknown as {
      extractWebSocketDonationIntentCandidatesFromMessage: (
        message: unknown,
      ) => Array<{
        kind: "troops" | "gold";
        senderClientId: string;
        recipientPlayerId: string;
        amountDisplay: string;
        amountApprox: number | null;
      }>;
    };

    const candidates =
      store.extractWebSocketDonationIntentCandidatesFromMessage({
        type: "turn",
        turn: {
          intents: [
            {
              type: "donate_troops",
              clientID: "sender-a",
              recipient: "2",
              troops: 1250,
            },
            {
              type: "donate_gold",
              clientID: "sender-b",
              recipient: "5",
              gold: 99999,
            },
            {
              type: "attack",
              clientID: "sender-c",
              targetID: "2",
              troops: 100,
            },
          ],
        },
      });

    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toMatchObject({
      kind: "troops",
      senderClientId: "sender-a",
      recipientPlayerId: "2",
      amountDisplay: "125",
      amountApprox: 1250,
    });
    expect(candidates[1]).toMatchObject({
      kind: "gold",
      senderClientId: "sender-b",
      recipientPlayerId: "5",
      amountDisplay: "99.9K",
      amountApprox: 99999,
    });
  });

  it("infers null websocket donation amounts from current game state", () => {
    setMockDocument();

    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      extractWebSocketDonationIntentCandidatesFromMessage: (
        message: unknown,
      ) => Array<{
        kind: "troops" | "gold";
        senderClientId: string;
        recipientPlayerId: string;
        amountDisplay: string;
        amountApprox: number | null;
      }>;
    };

    const sender = {
      id: () => "1",
      displayName: () => "Sender",
      smallID: () => 1,
      clientID: () => "sender-a",
      gold: () => 9_000,
      troops: () => 3_000,
    };
    const recipient = {
      id: () => "2",
      displayName: () => "Recipient",
      smallID: () => 2,
      gold: () => 1_000,
      troops: () => 1_700,
    };

    store.game = {
      playerByClientID: (id: string) => (id === "sender-a" ? sender : null),
      player: (id: string) => (id === "2" ? recipient : null),
      config: () => ({
        maxTroops: () => 2_000,
      }),
    };

    const candidates =
      store.extractWebSocketDonationIntentCandidatesFromMessage({
        type: "turn",
        turn: {
          intents: [
            {
              type: "donate_gold",
              clientID: "sender-a",
              recipient: "2",
              gold: null,
            },
            {
              type: "donate_troops",
              clientID: "sender-a",
              recipient: "2",
              troops: null,
            },
          ],
        },
      });

    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toMatchObject({
      kind: "gold",
      amountApprox: 3000,
      amountDisplay: "3.00K",
    });
    expect(candidates[1]).toMatchObject({
      kind: "troops",
      amountApprox: 300,
      amountDisplay: "30",
    });
  });

  it("does not emit websocket intents without execution-result updates", () => {
    setMockDocument();

    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      processRecentDisplayEvents: () => void;
      buildPlayerRecordLookupFromSnapshot: () => Map<string, unknown>;
      registerDonation: () => boolean;
      emitActionEvent: (type: string, payload: unknown) => void;
      pendingWebSocketDonationIntents: Array<Record<string, unknown>>;
    };

    store.buildPlayerRecordLookupFromSnapshot = () =>
      new Map([
        [
          "1",
          {
            id: "1",
            clientID: "sender-client",
            name: "Sender",
          },
        ],
        [
          "2",
          {
            id: "2",
            name: "Recipient",
          },
        ],
      ]);
    store.registerDonation = () => true;

    const emitted: string[] = [];
    store.emitActionEvent = (type) => emitted.push(type);
    store.pendingWebSocketDonationIntents = [
      {
        kind: "troops",
        senderClientId: "sender-client",
        recipientPlayerId: "2",
        amountDisplay: "750",
        amountApprox: 750,
        observedAtMs: Date.now(),
      },
    ];

    store.game = {
      ticks: () => 10,
      updatesSinceLastTick: () => ({ 3: [] }),
    };

    store.processRecentDisplayEvents();
    expect(emitted).toEqual([]);
  });

  it("restores WebSocket globals when the last donation hook unsubscribes", () => {
    setMockDocument();

    type MessageHandler = (event: { data: unknown }) => void;
    class FakeWebSocket {
      private readonly messageHandlers = new Set<MessageHandler>();

      addEventListener(type: string, handler: MessageHandler): void {
        if (type === "message") {
          this.messageHandlers.add(handler);
        }
      }

      send(_data: unknown): void {
        // no-op
      }
    }

    const fakeWindow = {
      WebSocket: FakeWebSocket as unknown as typeof WebSocket,
    } as unknown as Window & { WebSocket: typeof WebSocket };
    const nativeCtor = fakeWindow.WebSocket;
    const nativeSend = nativeCtor.prototype.send;

    const storeA = new DataStore(undefined as unknown as never) as unknown as {
      hostWindow: Window;
      installWebSocketDonationHook: () => (() => void) | null;
    };
    storeA.hostWindow = fakeWindow;
    const cleanupA = storeA.installWebSocketDonationHook();
    expect(cleanupA).toBeTypeOf("function");
    expect(fakeWindow.WebSocket).not.toBe(nativeCtor);
    expect(nativeCtor.prototype.send).not.toBe(nativeSend);

    const storeB = new DataStore(undefined as unknown as never) as unknown as {
      hostWindow: Window;
      installWebSocketDonationHook: () => (() => void) | null;
    };
    storeB.hostWindow = fakeWindow;
    const cleanupB = storeB.installWebSocketDonationHook();
    expect(cleanupB).toBeTypeOf("function");

    cleanupA?.();
    expect(fakeWindow.WebSocket).not.toBe(nativeCtor);
    expect(nativeCtor.prototype.send).not.toBe(nativeSend);

    cleanupB?.();
    expect(fakeWindow.WebSocket).toBe(nativeCtor);
    expect(nativeCtor.prototype.send).toBe(nativeSend);
  });
});

describe("DataStore attack border fronts", () => {
  function createGridGame(options: {
    width: number;
    height: number;
    owners: number[];
    players: unknown[];
    attackAveragePositions?: Record<string, { x: number; y: number } | null>;
  }) {
    const { width, height, owners, players, attackAveragePositions } = options;
    const ref = (x: number, y: number) => y * width + x;
    return {
      playerViews: () => players,
      ownerID: (tileRef: number) => owners[tileRef] ?? 0,
      x: (tileRef: number) => tileRef % width,
      y: (tileRef: number) => Math.floor(tileRef / width),
      attackAveragePosition: async (_playerID: number, attackID: string) =>
        attackAveragePositions?.[attackID] ?? null,
      neighbors: (tileRef: number) => {
        const x = tileRef % width;
        const y = Math.floor(tileRef / width);
        const out: number[] = [];
        if (y > 0) out.push(ref(x, y - 1));
        if (y + 1 < height) out.push(ref(x, y + 1));
        if (x > 0) out.push(ref(x - 1, y));
        if (x + 1 < width) out.push(ref(x + 1, y));
        return out;
      },
    };
  }

  function createAttackPlayer(options: {
    id: string;
    smallID: number;
    outgoingAttacks: Array<{
      attackerID: number;
      targetID: number;
      troops: number;
      id: string;
      retreating: boolean;
    }>;
    borderTiles: number[];
  }) {
    const { id, smallID, outgoingAttacks, borderTiles } = options;
    return {
      id: () => id,
      clientID: () => id,
      displayName: () => `Player ${smallID}`,
      smallID: () => smallID,
      borderTiles: async () => ({ borderTiles: new Set(borderTiles) }),
      nameLocation: () => undefined,
      team: () => null,
      numTilesOwned: () => borderTiles.length,
      gold: () => 0,
      troops: () => 0,
      incomingAttacks: () => [],
      outgoingAttacks: () => outgoingAttacks,
      alliances: () => [],
      hasSpawned: () => true,
      isAlive: () => true,
      isDisconnected: () => false,
      isTraitor: () => false,
    };
  }

  it("treats one contiguous attacker-target border as a single front", async () => {
    setMockDocument();
    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      computeAttackBorderLabels: (
        players?: unknown[],
      ) => Promise<Array<{ id: string; x: number; y: number }>>;
    };

    const width = 6;
    const height = 2;
    const owners = new Array(width * height).fill(0);
    const ref = (x: number, y: number) => y * width + x;
    for (let x = 0; x < width; x += 1) {
      owners[ref(x, 0)] = 2;
      owners[ref(x, 1)] = 1;
    }

    const attacker = createAttackPlayer({
      id: "attacker",
      smallID: 1,
      outgoingAttacks: [
        {
          id: "a-1",
          attackerID: 1,
          targetID: 2,
          troops: 1500,
          retreating: false,
        },
      ],
      borderTiles: Array.from({ length: width }, (_, x) => ref(x, 1)),
    });
    const target = createAttackPlayer({
      id: "target",
      smallID: 2,
      outgoingAttacks: [],
      borderTiles: [],
    });

    store.game = createGridGame({
      width,
      height,
      owners,
      players: [attacker, target],
    });

    const labels = await store.computeAttackBorderLabels([attacker, target]);
    expect(labels).toHaveLength(1);
  });

  it("splits disconnected attacker-target borders into separate fronts", async () => {
    setMockDocument();
    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      computeAttackBorderLabels: (
        players?: unknown[],
      ) => Promise<Array<{ id: string; x: number; y: number }>>;
    };

    const width = 6;
    const height = 2;
    const owners = new Array(width * height).fill(0);
    const ref = (x: number, y: number) => y * width + x;
    for (let x = 0; x < width; x += 1) {
      owners[ref(x, 1)] = 1;
    }
    owners[ref(0, 0)] = 2;
    owners[ref(1, 0)] = 2;
    owners[ref(4, 0)] = 2;
    owners[ref(5, 0)] = 2;

    const attacker = createAttackPlayer({
      id: "attacker",
      smallID: 1,
      outgoingAttacks: [
        {
          id: "a-1",
          attackerID: 1,
          targetID: 2,
          troops: 2000,
          retreating: false,
        },
      ],
      borderTiles: Array.from({ length: width }, (_, x) => ref(x, 1)),
    });
    const target = createAttackPlayer({
      id: "target",
      smallID: 2,
      outgoingAttacks: [],
      borderTiles: [],
    });

    store.game = createGridGame({
      width,
      height,
      owners,
      players: [attacker, target],
    });

    const labels = await store.computeAttackBorderLabels([attacker, target]);
    expect(labels).toHaveLength(2);
  });

  it("shows labels only on fronts near active attack positions", async () => {
    setMockDocument();
    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      computeAttackBorderLabels: (
        players?: unknown[],
      ) => Promise<Array<{ id: string; text: string }>>;
    };

    const width = 6;
    const height = 2;
    const owners = new Array(width * height).fill(0);
    const ref = (x: number, y: number) => y * width + x;
    for (let x = 0; x < width; x += 1) {
      owners[ref(x, 1)] = 1;
    }
    owners[ref(0, 0)] = 2;
    owners[ref(1, 0)] = 2;
    owners[ref(4, 0)] = 2;
    owners[ref(5, 0)] = 2;

    const attacker = createAttackPlayer({
      id: "attacker",
      smallID: 1,
      outgoingAttacks: [
        {
          id: "a-right",
          attackerID: 1,
          targetID: 2,
          troops: 5000,
          retreating: false,
        },
      ],
      borderTiles: Array.from({ length: width }, (_, x) => ref(x, 1)),
    });
    (
      attacker as unknown as {
        attackAveragePosition?: (
          playerID: number,
          attackID: string,
        ) => Promise<{ x: number; y: number } | null>;
      }
    ).attackAveragePosition = async (_playerID: number, attackID: string) =>
      attackID === "a-right" ? { x: 4.5, y: 0.5 } : null;
    const target = createAttackPlayer({
      id: "target",
      smallID: 2,
      outgoingAttacks: [],
      borderTiles: [],
    });

    store.game = createGridGame({
      width,
      height,
      owners,
      players: [attacker, target],
    });

    const labels = await store.computeAttackBorderLabels([attacker, target]);
    expect(labels).toHaveLength(1);
    expect(labels[0]?.text).toBe("500");
  });

  it("uses non-aggregated attack troops per front label", async () => {
    setMockDocument();
    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      computeAttackBorderLabels: (
        players?: unknown[],
      ) => Promise<Array<{ id: string; text: string }>>;
    };

    const width = 6;
    const height = 2;
    const owners = new Array(width * height).fill(0);
    const ref = (x: number, y: number) => y * width + x;
    for (let x = 0; x < width; x += 1) {
      owners[ref(x, 1)] = 1;
    }
    owners[ref(0, 0)] = 2;
    owners[ref(1, 0)] = 2;
    owners[ref(4, 0)] = 2;
    owners[ref(5, 0)] = 2;

    const attacker = createAttackPlayer({
      id: "attacker",
      smallID: 1,
      outgoingAttacks: [
        {
          id: "a-left",
          attackerID: 1,
          targetID: 2,
          troops: 2000,
          retreating: false,
        },
        {
          id: "a-right",
          attackerID: 1,
          targetID: 2,
          troops: 5000,
          retreating: false,
        },
      ],
      borderTiles: Array.from({ length: width }, (_, x) => ref(x, 1)),
    });
    const target = createAttackPlayer({
      id: "target",
      smallID: 2,
      outgoingAttacks: [],
      borderTiles: [],
    });

    store.game = createGridGame({
      width,
      height,
      owners,
      players: [attacker, target],
      attackAveragePositions: {
        "a-left": { x: 0.5, y: 0.5 },
        "a-right": { x: 4.5, y: 0.5 },
      },
    });

    const labels = await store.computeAttackBorderLabels([attacker, target]);
    expect(labels).toHaveLength(2);
    const labelTexts = labels.map((label) => label.text).sort();
    expect(labelTexts).toEqual(["200", "500"]);
  });

  it("merges micro-gapped edge fragments into one front", async () => {
    setMockDocument();
    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      computeAttackBorderLabels: (
        players?: unknown[],
      ) => Promise<Array<{ id: string; x: number; y: number }>>;
    };

    const width = 5;
    const height = 2;
    const owners = new Array(width * height).fill(0);
    const ref = (x: number, y: number) => y * width + x;
    for (let x = 0; x < width; x += 1) {
      owners[ref(x, 1)] = 1;
    }
    owners[ref(0, 0)] = 2;
    owners[ref(1, 0)] = 2;
    owners[ref(3, 0)] = 2;
    owners[ref(4, 0)] = 2;

    const attacker = createAttackPlayer({
      id: "attacker",
      smallID: 1,
      outgoingAttacks: [
        {
          id: "a-1",
          attackerID: 1,
          targetID: 2,
          troops: 2000,
          retreating: false,
        },
      ],
      borderTiles: Array.from({ length: width }, (_, x) => ref(x, 1)),
    });
    const target = createAttackPlayer({
      id: "target",
      smallID: 2,
      outgoingAttacks: [],
      borderTiles: [],
    });

    store.game = createGridGame({
      width,
      height,
      owners,
      players: [attacker, target],
    });

    const labels = await store.computeAttackBorderLabels([attacker, target]);
    expect(labels).toHaveLength(1);
  });

  it("omits border labels when the rendered troop value would be zero", async () => {
    setMockDocument();
    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      computeAttackBorderLabels: (
        players?: unknown[],
      ) => Promise<Array<{ id: string; x: number; y: number }>>;
    };

    const width = 4;
    const height = 2;
    const owners = new Array(width * height).fill(0);
    const ref = (x: number, y: number) => y * width + x;
    for (let x = 0; x < width; x += 1) {
      owners[ref(x, 0)] = 2;
      owners[ref(x, 1)] = 1;
    }

    const attacker = createAttackPlayer({
      id: "attacker",
      smallID: 1,
      outgoingAttacks: [
        {
          id: "a-1",
          attackerID: 1,
          targetID: 2,
          troops: 5,
          retreating: false,
        },
      ],
      borderTiles: Array.from({ length: width }, (_, x) => ref(x, 1)),
    });
    const target = createAttackPlayer({
      id: "target",
      smallID: 2,
      outgoingAttacks: [],
      borderTiles: [],
    });

    store.game = createGridGame({
      width,
      height,
      owners,
      players: [attacker, target],
    });

    const labels = await store.computeAttackBorderLabels([attacker, target]);
    expect(labels).toHaveLength(0);
  });

  it("requires closer zoom for smaller fronts", async () => {
    setMockDocument();
    const store = new DataStore(undefined as unknown as never) as unknown as {
      game: unknown;
      computeAttackBorderLabels: (
        players?: unknown[],
      ) => Promise<
        Array<{ id: string; x: number; y: number; minScale?: number }>
      >;
    };

    const largeWidth = 8;
    const largeHeight = 2;
    const largeOwners = new Array(largeWidth * largeHeight).fill(0);
    const largeRef = (x: number, y: number) => y * largeWidth + x;
    for (let x = 0; x < largeWidth; x += 1) {
      largeOwners[largeRef(x, 0)] = 2;
      largeOwners[largeRef(x, 1)] = 1;
    }
    const largeAttacker = createAttackPlayer({
      id: "attacker-large",
      smallID: 1,
      outgoingAttacks: [
        {
          id: "a-large",
          attackerID: 1,
          targetID: 2,
          troops: 5000,
          retreating: false,
        },
      ],
      borderTiles: Array.from({ length: largeWidth }, (_, x) => largeRef(x, 1)),
    });
    const largeTarget = createAttackPlayer({
      id: "target-large",
      smallID: 2,
      outgoingAttacks: [],
      borderTiles: [],
    });
    store.game = createGridGame({
      width: largeWidth,
      height: largeHeight,
      owners: largeOwners,
      players: [largeAttacker, largeTarget],
    });
    const largeLabels = await store.computeAttackBorderLabels([
      largeAttacker,
      largeTarget,
    ]);
    expect(largeLabels).toHaveLength(1);

    const smallWidth = 2;
    const smallHeight = 2;
    const smallOwners = new Array(smallWidth * smallHeight).fill(0);
    const smallRef = (x: number, y: number) => y * smallWidth + x;
    smallOwners[smallRef(0, 1)] = 1;
    smallOwners[smallRef(0, 0)] = 2;
    const smallAttacker = createAttackPlayer({
      id: "attacker-small",
      smallID: 1,
      outgoingAttacks: [
        {
          id: "a-small",
          attackerID: 1,
          targetID: 2,
          troops: 5000,
          retreating: false,
        },
      ],
      borderTiles: [smallRef(0, 1)],
    });
    const smallTarget = createAttackPlayer({
      id: "target-small",
      smallID: 2,
      outgoingAttacks: [],
      borderTiles: [],
    });
    store.game = createGridGame({
      width: smallWidth,
      height: smallHeight,
      owners: smallOwners,
      players: [smallAttacker, smallTarget],
    });
    const smallLabels = await store.computeAttackBorderLabels([
      smallAttacker,
      smallTarget,
    ]);
    expect(smallLabels).toHaveLength(1);

    const largeMinScale = largeLabels[0].minScale ?? 0;
    const smallMinScale = smallLabels[0].minScale ?? 0;
    expect(smallMinScale).toBeGreaterThan(largeMinScale);
    expect(smallMinScale).toBeGreaterThanOrEqual(2.5);
  });
});
