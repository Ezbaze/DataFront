import { bench, describe } from "vitest";
import { compileSearchQuery, matchesSearchQuery } from "./query";
import type { PlayerRecord, SidebarLogEntry, SidebarLogToken } from "../types";

function makePlayers(count: number) {
  const players: PlayerRecord[] = [];
  for (let i = 0; i < count; i++) {
    const clan = i % 4 === 0 ? "nu" : i % 4 === 1 ? "ez" : "ok";
    const team = (i % 3) + 1;
    players.push({
      id: String(i + 1),
      name: `[${clan.toUpperCase()}] Player ${i}`,
      clan,
      team: String(team),
      troops: (i % 250_000) * 10,
      tiles: i % 10_000,
      gold: i % 50_000,
      cities: i % 500,
      traitorTargets: [],
    });
  }
  return players;
}

function makeLogEntries(count: number) {
  const entries: SidebarLogEntry[] = [];
  for (let i = 0; i < count; i++) {
    const message =
      i % 5 === 0
        ? "Captured a city"
        : i % 5 === 1
          ? "Lost a city"
          : i % 5 === 2
            ? "Formed an alliance"
            : i % 5 === 3
              ? "Betrayed an alliance"
              : "Sent troops";

    const tokens: SidebarLogToken[] | undefined =
      i % 2 === 0
        ? [
            {
              type: "player",
              id: "1",
              label: "Player 1",
              facets: { user: ["Player 1"], clan: ["NU"], team: ["1"] },
            },
            { type: "text", text: " did something" },
          ]
        : [{ type: "text", text: "something happened" }];

    entries.push({
      id: `log-${i}`,
      level: "info",
      message,
      timestampMs: i,
      tokens,
    });
  }
  return entries;
}

describe("search query performance", () => {
  const compileQueries = [
    "nu",
    'user:"player 120"',
    "clan:nu AND troops:10000..20000",
    "-(team:2 OR clan:ez)",
    "tiles:>=9000 AND gold:<1000",
    "captured OR betrayed",
  ];

  bench("compileSearchQuery (typical queries)", () => {
    for (const q of compileQueries) compileSearchQuery(q);
  });

  describe("matchesSearchQuery", () => {
    const players = makePlayers(2_000);
    const logs = makeLogEntries(2_000);
    const playerQuery = (() => {
      const q = "clan:nu AND troops:10000..20000";
      const res = compileSearchQuery(q);
      if (!res.ok) throw new Error(`Benchmark query failed to compile: ${q}`);
      return res.ast;
    })();

    const logQuery = (() => {
      const q = "captured OR betrayed";
      const res = compileSearchQuery(q);
      if (!res.ok) throw new Error(`Benchmark query failed to compile: ${q}`);
      return res.ast;
    })();

    bench("players (2k)", () => {
      let matches = 0;
      for (const player of players) {
        if (matchesSearchQuery(playerQuery, { kind: "player", player }))
          matches++;
      }
      if (matches < 0) throw new Error("unreachable");
    });

    bench("logs (2k)", () => {
      let matches = 0;
      for (const entry of logs) {
        if (matchesSearchQuery(logQuery, { kind: "log", entry })) matches++;
      }
      if (matches < 0) throw new Error("unreachable");
    });
  });
});
