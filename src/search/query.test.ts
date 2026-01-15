import { describe, expect, it } from "vitest";
import type {
  PlayerRecord,
  ShipRecord,
  SidebarActionDefinition,
  SidebarLogEntry,
  SidebarLogToken,
  SidebarRunningAction,
} from "../types";
import { compileSearchQuery, matchesSearchQuery } from "./query";

function mustCompile(query: string) {
  const compiled = compileSearchQuery(query);
  if (!compiled.ok) {
    throw new Error(`Expected query to compile: ${compiled.error.message}`);
  }
  return compiled.ast;
}

function makePlayer(overrides: Partial<PlayerRecord> = {}): PlayerRecord {
  return {
    id: "p1",
    name: "Alice",
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
    ...overrides,
  };
}

function makeShip(overrides: Partial<ShipRecord> = {}): ShipRecord {
  return {
    id: "12",
    type: "Transport",
    ownerId: "p1",
    ownerName: "Alice",
    troops: 10,
    retreating: false,
    reachedTarget: false,
    ...overrides,
  };
}

function makeLogEntry(
  overrides: Partial<SidebarLogEntry> = {},
): SidebarLogEntry {
  return {
    id: "log-1",
    level: "info",
    message: "Default message",
    timestampMs: 0,
    ...overrides,
  };
}

function makeAction(
  overrides: Partial<SidebarActionDefinition> = {},
): SidebarActionDefinition {
  return {
    id: "a1",
    name: "Test Action",
    code: "exports.run = () => {};",
    runMode: "event",
    enabled: true,
    description: "Does a thing",
    runIntervalTicks: 1,
    settings: [],
    createdAtMs: 0,
    updatedAtMs: 0,
    ...overrides,
  };
}

function makeRunningAction(
  overrides: Partial<SidebarRunningAction> = {},
): SidebarRunningAction {
  return {
    id: "run-1",
    actionId: "a1",
    name: "Test Action",
    description: "Running now",
    runMode: "event",
    runIntervalTicks: 1,
    status: "running",
    startedAtMs: 0,
    lastUpdatedMs: 0,
    settings: [],
    ...overrides,
  };
}

describe("compileSearchQuery", () => {
  it("parses key:value terms with implicit AND", () => {
    const ast = mustCompile("user:alice clan:nu");
    const entry = makeLogEntry({
      tokens: [
        { type: "player", id: "p1", label: "Alice" },
        { type: "clan", id: "nu", label: "Clan NU" },
      ],
    });
    expect(matchesSearchQuery(ast, { kind: "log", entry })).toBe(true);
  });

  it("respects operator precedence (AND before OR)", () => {
    const ast = mustCompile("user:alice OR clan:nu team:2");
    const entry = makeLogEntry({
      tokens: [
        { type: "clan", id: "nu", label: "Clan NU" },
        { type: "team", id: "2", label: "Team 2" },
      ],
    });
    expect(matchesSearchQuery(ast, { kind: "log", entry })).toBe(true);
  });

  it("supports parentheses for nesting", () => {
    const ast = mustCompile("(user:alice OR clan:nu) team:2");
    const entry = makeLogEntry({
      tokens: [
        { type: "clan", id: "nu", label: "Clan NU" },
        { type: "team", id: "2", label: "Team 2" },
      ],
    });
    expect(matchesSearchQuery(ast, { kind: "log", entry })).toBe(true);
  });

  it("supports quoted values", () => {
    const ast = mustCompile('source:"Action Test [a1]" AND level:warn');
    const entry = makeLogEntry({ source: "Action Test [a1]", level: "warn" });
    expect(matchesSearchQuery(ast, { kind: "log", entry })).toBe(true);
  });

  it("fails on missing value after ':'", () => {
    const compiled = compileSearchQuery("user:");
    expect(compiled.ok).toBe(false);
  });

  it("fails on unterminated quoted strings (even if empty)", () => {
    const compiled = compileSearchQuery('"');
    expect(compiled.ok).toBe(false);
  });

  it("supports NOT and -prefix negation", () => {
    const ast1 = mustCompile("NOT user:alice");
    const ast2 = mustCompile("-user:alice");
    const player = makePlayer({ name: "Alice" });
    expect(matchesSearchQuery(ast1, { kind: "player", player })).toBe(false);
    expect(matchesSearchQuery(ast2, { kind: "player", player })).toBe(false);
  });

  it("supports negating grouped expressions", () => {
    const ast = mustCompile("-(user:alice OR user:bob)");
    const player = makePlayer({ name: "Charlie" });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
    const player2 = makePlayer({ name: "Bob" });
    expect(matchesSearchQuery(ast, { kind: "player", player: player2 })).toBe(
      false,
    );
  });

  it("supports double-negation", () => {
    const ast = mustCompile("NOT NOT user:alice");
    const player = makePlayer({ name: "Alice" });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
  });

  it("supports numeric comparisons", () => {
    const ast = mustCompile("tiles:>=10 AND troops:<50");
    const player = makePlayer({ tiles: 10, troops: 200 }); // displayed troops = 20
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
  });

  it("supports spaced comparison operators (tiles:> 10)", () => {
    const ast = mustCompile("tiles:> 10");
    const player = makePlayer({ tiles: 11 });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
  });

  it("supports numeric ranges (tiles:10..20)", () => {
    const ast = mustCompile("tiles:10..20");
    expect(
      matchesSearchQuery(ast, {
        kind: "player",
        player: makePlayer({ tiles: 9 }),
      }),
    ).toBe(false);
    expect(
      matchesSearchQuery(ast, {
        kind: "player",
        player: makePlayer({ tiles: 10 }),
      }),
    ).toBe(true);
    expect(
      matchesSearchQuery(ast, {
        kind: "player",
        player: makePlayer({ tiles: 20 }),
      }),
    ).toBe(true);
    expect(
      matchesSearchQuery(ast, {
        kind: "player",
        player: makePlayer({ tiles: 21 }),
      }),
    ).toBe(false);
  });

  it("treats troops comparisons/ranges as displayed troop count", () => {
    // raw troops are divided by 10 in the UI
    const player = makePlayer({ troops: 150_000 }); // displayed = 15,000
    expect(
      matchesSearchQuery(mustCompile("troops:10000..20000"), {
        kind: "player",
        player,
      }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("troops:<10000"), {
        kind: "player",
        player,
      }),
    ).toBe(false);
  });

  it("supports open-ended ranges (tiles:..20 and tiles:10..)", () => {
    expect(
      matchesSearchQuery(mustCompile("tiles:..20"), {
        kind: "player",
        player: makePlayer({ tiles: 21 }),
      }),
    ).toBe(false);
    expect(
      matchesSearchQuery(mustCompile("tiles:..20"), {
        kind: "player",
        player: makePlayer({ tiles: 20 }),
      }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("tiles:10.."), {
        kind: "player",
        player: makePlayer({ tiles: 9 }),
      }),
    ).toBe(false);
    expect(
      matchesSearchQuery(mustCompile("tiles:10.."), {
        kind: "player",
        player: makePlayer({ tiles: 10 }),
      }),
    ).toBe(true);
  });

  it("supports spaced ranges (tiles:10 .. 20)", () => {
    const ast = mustCompile("tiles:10 .. 20");
    const player = makePlayer({ tiles: 15 });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
  });

  it("fails on comparisons without a number", () => {
    const compiled = compileSearchQuery("tiles:>nope");
    expect(compiled.ok).toBe(false);
  });

  it("fails on empty ranges (tiles:..)", () => {
    expect(compileSearchQuery("tiles:..").ok).toBe(false);
  });

  it("fails on mismatched parentheses", () => {
    expect(compileSearchQuery("(user:alice").ok).toBe(false);
    expect(compileSearchQuery("user:alice)").ok).toBe(false);
  });

  it("supports escaped quotes inside quoted strings", () => {
    const ast = mustCompile('source:"Action \\"X\\""');
    const entry = makeLogEntry({ source: 'Action "X"' });
    expect(matchesSearchQuery(ast, { kind: "log", entry })).toBe(true);
  });

  it("supports negative comparisons and ranges", () => {
    const ast = mustCompile("tiles:-5..5 AND tiles:>=-1");
    const player = makePlayer({ tiles: 0 });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("tiles:<-1"), { kind: "player", player }),
    ).toBe(false);
  });

  it("treats hyphens in values as literal (user:-bob, id:log-1)", () => {
    const player = makePlayer({ name: "-bob" });
    expect(
      matchesSearchQuery(mustCompile("user:-bob"), { kind: "player", player }),
    ).toBe(true);
    const entry = makeLogEntry({ id: "log-1" });
    expect(
      matchesSearchQuery(mustCompile("id:log-1"), { kind: "log", entry }),
    ).toBe(true);
  });

  it("supports decimal ranges and comparisons", () => {
    const ast = mustCompile("gold:0.5..1.5 AND gold:>1.0");
    const player = makePlayer({ gold: 1.25 });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
  });

  it("treats min>max ranges as non-matching", () => {
    const ast = mustCompile("tiles:10..5");
    const player = makePlayer({ tiles: 7 });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(false);
  });

  it("treats operator casing as case-insensitive", () => {
    const ast = mustCompile("UsEr:alice aNd TeAm:2");
    const player = makePlayer({ name: "Alice", team: "2" });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
  });
});

describe("matchesSearchQuery per view", () => {
  it("matches players by user/clan/team", () => {
    const ast = mustCompile("user:ali clan:nu team:2");
    const player = makePlayer({
      name: "[NU] Alice",
      clan: undefined,
      team: "2",
    });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
  });

  it("matches ships by owner/status/destination", () => {
    const ast = mustCompile("owner:alice status:en destination:12");
    const ship = makeShip({
      ownerName: "Alice",
      destination: { x: 12, y: 34 },
    });
    expect(matchesSearchQuery(ast, { kind: "ship", ship })).toBe(true);
  });

  it("matches log chips by type-specific keys (does not require splitting)", () => {
    const tokens: SidebarLogToken[] = [
      { type: "team", id: "2", label: "Team 2" },
      { type: "text", text: " built a Missile Silo (" },
      { type: "player", id: "p1", label: "Alice" },
      { type: "text", text: ")" },
    ];
    const entry = makeLogEntry({ tokens });
    expect(
      matchesSearchQuery(mustCompile("team:2"), { kind: "log", entry }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("user:alice"), { kind: "log", entry }),
    ).toBe(true);
  });

  it("allows player mention pills to match team/clan via facets", () => {
    const tokens: SidebarLogToken[] = [
      {
        type: "player",
        id: "p1",
        label: "Alice",
        facets: { team: ["2"], clan: ["nu"] },
      },
    ];
    const entry = makeLogEntry({ tokens });
    expect(
      matchesSearchQuery(mustCompile("team:2"), { kind: "log", entry }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("clan:nu"), { kind: "log", entry }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("user:alice"), { kind: "log", entry }),
    ).toBe(true);
  });

  it("matches players by publicid (string match + numeric compare/range)", () => {
    const player = makePlayer({
      id: "client-1",
      publicId: "98765",
      name: "Alice",
    });
    expect(Number(player.publicId)).toBe(98765);
    expect(
      matchesSearchQuery(mustCompile("publicid:987"), {
        kind: "player",
        player,
      }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("publicid:>90000"), {
        kind: "player",
        player,
      }),
    ).toBe(false);
  });

  it("supports custom facets via key:value", () => {
    const tokens: SidebarLogToken[] = [
      {
        type: "player",
        id: "p1",
        label: "Alice",
        facets: { role: ["builder"] },
      },
    ];
    const entry = makeLogEntry({ tokens });
    expect(
      matchesSearchQuery(mustCompile("role:build"), { kind: "log", entry }),
    ).toBe(true);
  });

  it("supports numeric comparisons against log token facets", () => {
    const tokens: SidebarLogToken[] = [
      {
        type: "player",
        id: "p1",
        label: "Alice",
        facets: { score: ["100"] },
      },
    ];
    const entry = makeLogEntry({ tokens });
    expect(
      matchesSearchQuery(mustCompile("score:>=50"), { kind: "log", entry }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("score:<50"), { kind: "log", entry }),
    ).toBe(false);
  });

  it("supports numeric ranges against log token facets", () => {
    const tokens: SidebarLogToken[] = [
      {
        type: "player",
        id: "p1",
        label: "Alice",
        facets: { score: ["100"] },
      },
    ];
    const entry = makeLogEntry({ tokens });
    expect(
      matchesSearchQuery(mustCompile("score:50..150"), { kind: "log", entry }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("score:..99"), { kind: "log", entry }),
    ).toBe(false);
  });

  it("supports NOT precedence over AND/OR", () => {
    const ast = mustCompile("user:alice OR NOT user:bob");
    const player = makePlayer({ name: "Bob" });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(false);
    const player2 = makePlayer({ name: "Charlie" });
    expect(matchesSearchQuery(ast, { kind: "player", player: player2 })).toBe(
      true,
    );
  });

  it("matches actions by enabled/mode/name/desc", () => {
    const ast = mustCompile('enabled:true AND mode:event AND desc:"does a"');
    const action = makeAction({ enabled: true, runMode: "event" });
    expect(matchesSearchQuery(ast, { kind: "action", action })).toBe(true);
  });

  it("matches running actions by status/mode", () => {
    const ast = mustCompile("status:running AND mode:event");
    const run = makeRunningAction({ status: "running", runMode: "event" });
    expect(matchesSearchQuery(ast, { kind: "runningAction", run })).toBe(true);
  });

  it("treats unknown keys as non-matching (but still allows OR)", () => {
    const ast = mustCompile("nope:thing OR user:alice");
    const player = makePlayer({ name: "Alice" });
    expect(matchesSearchQuery(ast, { kind: "player", player })).toBe(true);
  });

  it("supports timestamp comparisons in logs", () => {
    const entry = makeLogEntry({ timestampMs: 100 });
    expect(
      matchesSearchQuery(mustCompile("timestamp:>0"), { kind: "log", entry }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("time:>=100"), { kind: "log", entry }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("time:!=100"), { kind: "log", entry }),
    ).toBe(false);
  });

  it("supports != and = comparisons for numeric player keys", () => {
    const player = makePlayer({ tiles: 10 });
    expect(
      matchesSearchQuery(mustCompile("tiles:=10"), { kind: "player", player }),
    ).toBe(true);
    expect(
      matchesSearchQuery(mustCompile("tiles:!=10"), { kind: "player", player }),
    ).toBe(false);
  });
});
