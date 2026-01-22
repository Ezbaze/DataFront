import { describe, expect, it } from "vitest";

import type { GameSnapshot, PlayerRecord } from "./types";

// Provide minimal global stubs so the app module (and its transitive imports)
// can be evaluated in the Node test environment.
const fakeDocument = {} as unknown as Document;
const fakeWindow = {} as unknown as Window;
const testGlobals = globalThis as typeof globalThis & {
  document: Document;
  window: Window;
};
testGlobals.document = fakeDocument;
testGlobals.window = fakeWindow;

function makePlayer(name: string): PlayerRecord {
  return {
    id: name.toLowerCase(),
    name,
    traitorTargets: [],
    tiles: 0,
    gold: 0,
    troops: 0,
    incomingAttacks: [],
    outgoingAttacks: [],
    defensiveSupports: [],
    expansions: 0,
    waiting: false,
    eliminated: false,
    disconnected: false,
    traitor: false,
    alliances: [],
    lastUpdatedMs: 0,
  };
}

function makeSnapshot(players: PlayerRecord[]): GameSnapshot {
  return {
    players,
    allianceDurationMs: 0,
    currentTimeMs: 0,
    ships: [],
  };
}

describe("SidebarApp view + global search composition", () => {
  it("applies the per-view filter first, then the global filter", async () => {
    const { SidebarApp } = await import("./app");
    const app = Object.create(SidebarApp.prototype) as SidebarApp & {
      snapshot: GameSnapshot;
    };
    app.snapshot = makeSnapshot([
      makePlayer("Alice"),
      makePlayer("Bob"),
      makePlayer("Alice Bob"),
    ]);

    const result = (
      app as {
        getFilteredSnapshot: (
          view: string,
          viewFilter: string,
          globalFilter: string,
        ) => GameSnapshot;
      }
    ).getFilteredSnapshot("players", "alice", "bob") as GameSnapshot;

    expect(result.players.map((p) => p.name)).toEqual(["Alice Bob"]);
  });

  it("still applies the global filter when view filter is empty", async () => {
    const { SidebarApp } = await import("./app");
    const app = Object.create(SidebarApp.prototype) as SidebarApp & {
      snapshot: GameSnapshot;
    };
    app.snapshot = makeSnapshot([makePlayer("Bob"), makePlayer("Charlie")]);

    const result = (
      app as {
        getFilteredSnapshot: (
          view: string,
          viewFilter: string,
          globalFilter: string,
        ) => GameSnapshot;
      }
    ).getFilteredSnapshot("players", "", "char") as GameSnapshot;

    expect(result.players.map((p) => p.name)).toEqual(["Charlie"]);
  });
});
