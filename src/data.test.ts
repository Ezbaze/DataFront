import { describe, expect, it, vi } from "vitest";

import { DataStore } from "./data";

describe("DataStore display event polling", () => {
  it("processes appended display events even when updates object is reused", () => {
    (globalThis as { document?: unknown }).document = {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as Document;

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
    (globalThis as { document?: unknown }).document = {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as Document;

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
    (globalThis as { document?: unknown }).document = {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as Document;

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
    (globalThis as { document?: unknown }).document = {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as Document;

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
    (globalThis as { document?: unknown }).document = {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as Document;

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
  function setMockDocument(): void {
    (globalThis as { document?: unknown }).document = {
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as Document;
  }

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
