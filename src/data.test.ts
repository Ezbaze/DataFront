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
