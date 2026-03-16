import { afterEach, describe, expect, it, vi } from "vitest";

import { extractClanTag, focusTile } from "./utils";

const originalDocument = globalThis.document;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalDocument === undefined) {
    Reflect.deleteProperty(globalThis, "document");
    return;
  }
  globalThis.document = originalDocument;
});

describe("extractClanTag", () => {
  it("returns undefined when no bracketed tag exists", () => {
    expect(extractClanTag("Alice")).toBeUndefined();
    expect(extractClanTag("[oops")).toBeUndefined();
    expect(extractClanTag("oops]")).toBeUndefined();
  });

  it("matches `[TAG]` anywhere in the name", () => {
    expect(extractClanTag("[NU] Alice")).toBe("NU");
    expect(extractClanTag("Alice [NU]")).toBe("NU");
    expect(extractClanTag("Alice [NU] Bob")).toBe("NU");
  });

  it("allows alphanumeric tags 2..5 chars", () => {
    expect(extractClanTag("[A1] Alice")).toBe("A1");
    expect(extractClanTag("[AB12] Alice")).toBe("AB12");
    expect(extractClanTag("[ABCDE] Alice")).toBe("ABCDE");
    expect(extractClanTag("[A] Alice")).toBeUndefined();
    expect(extractClanTag("[ABCDEF] Alice")).toBeUndefined();
  });

  it("normalizes to uppercase for matching", () => {
    expect(extractClanTag("[nu] Alice")).toBe("NU");
    expect(extractClanTag("[nU1] Alice")).toBe("NU1");
  });
});

describe("focusTile", () => {
  it("uses the OpenFront transform handler when present", () => {
    const onGoToPosition = vi.fn();
    const fakeDocument = {
      querySelector: vi.fn((selector: string) => {
        if (selector === "emoji-table") {
          return {
            transformHandler: {
              onGoToPosition,
            },
          };
        }
        return null;
      }),
      contains: vi.fn(() => true),
    } as unknown as Document;
    globalThis.document = fakeDocument;

    const focused = focusTile({ x: 12, y: 34 });

    expect(focused).toBe(true);
    expect(onGoToPosition).toHaveBeenCalledWith({ x: 12, y: 34 });
  });
});
