import { describe, expect, it } from "vitest";

import { extractClanTag } from "./utils";

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
