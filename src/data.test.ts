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
      createTroopDonationEvent: (update: { message: string }) => unknown;
      registerDonation: () => boolean;
      emitActionEvent: (type: string, payload: unknown) => void;
    };

    store.buildPlayerRecordLookupFromSnapshot = () => new Map();
    store.createTroopDonationEvent = (update) =>
      update.message === "donation"
        ? {
            senderId: "1",
            recipientId: "2",
            amountDisplay: "10",
            amountApprox: 10,
            tick: 1,
          }
        : null;
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
});
