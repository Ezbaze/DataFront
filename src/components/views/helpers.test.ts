import { describe, expect, it, vi } from "vitest";

import { createPlayerNameElement } from "./helpers";

class FakeElement {
  className = "";
  textContent: string | null = null;
  type = "";
  title = "";
  readonly listeners = new Map<string, Array<(event: FakeEvent) => void>>();

  constructor(readonly tagName: string) {}

  addEventListener(type: string, listener: (event: FakeEvent) => void): void {
    const existing = this.listeners.get(type) ?? [];
    existing.push(listener);
    this.listeners.set(type, existing);
  }

  dispatch(type: string, event: Partial<FakeEvent> = {}): void {
    const listeners = this.listeners.get(type) ?? [];
    const nextEvent: FakeEvent = {
      button: 0,
      detail: 1,
      preventDefault: () => undefined,
      stopPropagation: () => undefined,
      ...event,
    };
    for (const listener of listeners) {
      listener(nextEvent);
    }
  }
}

interface FakeEvent {
  button?: number;
  detail?: number;
  preventDefault: () => void;
  stopPropagation: () => void;
}

class FakeDocument {
  createElement(tag: string): FakeElement {
    return new FakeElement(tag);
  }
}

describe("createPlayerNameElement", () => {
  it("renders an interactive button when a custom activate handler is provided", () => {
    const onActivate = vi.fn();
    const doc = new FakeDocument() as unknown as Document;
    const nameElement = createPlayerNameElement("Alice", undefined, {
      document: doc,
      onActivate,
    }) as unknown as FakeElement;

    expect(nameElement.tagName).toBe("button");
    expect(nameElement.type).toBe("button");

    nameElement.dispatch("pointerdown");

    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("keeps non-interactive labels as text elements when nothing can be focused", () => {
    const doc = new FakeDocument() as unknown as Document;
    const nameElement = createPlayerNameElement("Alice", undefined, {
      document: doc,
      asBlock: true,
    }) as unknown as FakeElement;

    expect(nameElement.tagName).toBe("div");
    expect(nameElement.textContent).toBe("Alice");
  });
});
