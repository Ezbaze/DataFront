import { describe, expect, it, vi } from "vitest";

import { createSidebarLogger, subscribeToSidebarLogs } from "./logger";

describe("logger", () => {
  it("coerces numeric token facet values to strings", () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    try {
      const entries: unknown[] = [];
      const unsubscribe = subscribeToSidebarLogs((entry) =>
        entries.push(entry),
      );
      try {
        const logger = createSidebarLogger("Test");
        logger.info("hello", {
          tokens: [
            {
              type: "player",
              id: "1",
              label: "Player",
              facets: { score: [100] },
            },
          ],
        });
      } finally {
        unsubscribe();
      }

      expect(entries).toHaveLength(1);
      const entry = entries[0] as {
        tokens?: Array<{ facets?: Record<string, string[]> }>;
      };
      expect(entry.tokens?.[0]?.facets?.score).toEqual(["100"]);
    } finally {
      vi.restoreAllMocks();
    }
  });
});
