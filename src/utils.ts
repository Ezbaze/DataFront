import type { TileSummary } from "./types";
import { SidebarRole } from "./sidebarRoles";

const CLAN_TAG_PATTERN = /^\[([a-zA-Z]{2,5})\]/;

const numberFormatter = new Intl.NumberFormat("en-US");

function normalizeTroopCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.floor(Math.max(value, 0) / 10);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatTroopCount(rawTroops: number): string {
  return formatNumber(normalizeTroopCount(rawTroops));
}

export function formatCountdown(targetMs: number, nowMs: number): string {
  const diff = targetMs - nowMs;
  if (!Number.isFinite(diff)) {
    return "—";
  }
  if (diff <= 0) {
    const elapsed = Math.abs(diff);
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `Expired ${minutes}:${seconds.toString().padStart(2, "0")} ago`;
  }
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatTimestamp(ms: number): string {
  const date = new Date(ms);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function extractClanTag(name: string): string | undefined {
  if (!name.startsWith("[")) {
    return undefined;
  }

  const match = name.match(CLAN_TAG_PATTERN);
  return match ? match[1] : undefined;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  textContent?: string,
  doc: Document = document,
): HTMLElementTagNameMap[K] {
  const el = doc.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (textContent !== undefined) {
    el.textContent = textContent;
  }
  return el;
}

type GoToEmitter = ((x: number, y: number) => void) | null;

let cachedGoToEmitter: GoToEmitter = null;
let cachedEmitterElement: Element | null = null;

const GO_TO_SELECTORS = [
  "events-display",
  "control-panel",
  "leader-board",
] as const;

function resolveGoToEmitter(): GoToEmitter {
  if (
    cachedGoToEmitter &&
    cachedEmitterElement &&
    document.contains(cachedEmitterElement)
  ) {
    return cachedGoToEmitter;
  }

  cachedGoToEmitter = null;
  cachedEmitterElement = null;

  for (const selector of GO_TO_SELECTORS) {
    const element = document.querySelector(selector) as
      | (Element & {
          emitGoToPositionEvent?: (x: number, y: number) => void;
        })
      | null;
    if (!element) {
      continue;
    }

    const emitter = element.emitGoToPositionEvent;
    if (typeof emitter === "function") {
      cachedEmitterElement = element;
      cachedGoToEmitter = emitter.bind(element);
      return cachedGoToEmitter;
    }

    const prototypeEmitter = (element as unknown as Record<string, unknown>)[
      "emitGoToPositionEvent"
    ];
    if (typeof prototypeEmitter === "function") {
      cachedEmitterElement = element;
      cachedGoToEmitter = (
        prototypeEmitter as (x: number, y: number) => void
      ).bind(element);
      return cachedGoToEmitter;
    }
  }

  return null;
}

export function focusTile(summary?: Pick<TileSummary, "x" | "y">): boolean {
  if (!summary) {
    return false;
  }

  const { x, y } = summary;
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return false;
  }

  const emitter = resolveGoToEmitter();
  if (!emitter) {
    console.warn("OpenFront sidebar: unable to locate go-to emitter");
    return false;
  }

  try {
    emitter(x, y);
    return true;
  } catch (error) {
    console.warn("OpenFront sidebar: failed to emit go-to event", error);
    return false;
  }
}

interface ContextMenuItem {
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  tooltip?: string;
}

interface ShowContextMenuOptions {
  x: number;
  y: number;
  title?: string;
  items: ContextMenuItem[];
  document?: Document;
}

interface ContextMenuState {
  element: HTMLDivElement | null;
  cleanup: (() => void) | null;
}

const contextMenuStates = new WeakMap<Document, ContextMenuState>();

function ensureContextMenuState(doc: Document): ContextMenuState {
  let state = contextMenuStates.get(doc);
  if (!state) {
    state = { element: null, cleanup: null };
    contextMenuStates.set(doc, state);
  }
  return state;
}

function ensureContextMenuElement(doc: Document): HTMLDivElement {
  const state = ensureContextMenuState(doc);
  if (!state.element) {
    state.element = createElement(
      "div",
      "fixed z-[2147483647] min-w-[160px] overflow-hidden rounded-md border " +
        "border-slate-700/80 bg-slate-950/95 text-sm text-slate-100 shadow-2xl " +
        "backdrop-blur",
      undefined,
      doc,
    );
    state.element.dataset.sidebarRole = SidebarRole.ContextMenu;
    state.element.style.pointerEvents = "auto";
    state.element.style.zIndex = "2147483647";
  }

  return state.element;
}

export function hideContextMenu(doc: Document = document): void {
  const state = ensureContextMenuState(doc);
  if (state.cleanup) {
    state.cleanup();
    state.cleanup = null;
  }

  if (state.element && state.element.parentElement) {
    state.element.parentElement.removeChild(state.element);
  }
}

export function showContextMenu(options: ShowContextMenuOptions): void {
  const { x, y, title, items } = options;
  const doc = options.document ?? document;
  const win = doc.defaultView ?? window;
  if (!items.length) {
    hideContextMenu(doc);
    return;
  }

  hideContextMenu(doc);

  const menu = ensureContextMenuElement(doc);
  menu.className =
    "fixed z-[2147483647] min-w-[160px] overflow-hidden rounded-md border " +
    "border-slate-700/80 bg-slate-950/95 text-sm text-slate-100 shadow-2xl " +
    "backdrop-blur";
  menu.style.zIndex = "2147483647";
  menu.style.visibility = "hidden";
  menu.style.left = "0px";
  menu.style.top = "0px";

  const wrapper = createElement("div", "flex flex-col", undefined, doc);

  if (title) {
    const header = createElement(
      "div",
      "border-b border-slate-800/80 px-3 py-2 text-xs font-semibold uppercase " +
        "tracking-wide text-slate-300",
      title,
      doc,
    );
    wrapper.appendChild(header);
  }

  const list = createElement("div", "py-1", undefined, doc);
  for (const item of items) {
    const button = createElement(
      "button",
      `${
        item.disabled
          ? "cursor-not-allowed text-slate-500"
          : "hover:bg-slate-800/80 hover:text-sky-200"
      } flex w-full items-center gap-2 px-3 py-2 text-left transition-colors`,
      item.label,
      doc,
    );
    button.type = "button";
    button.disabled = Boolean(item.disabled);
    if (item.tooltip) {
      button.title = item.tooltip;
    }
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      hideContextMenu(doc);
      item.onSelect?.();
    });
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    list.appendChild(button);
  }

  if (list.childElementCount === 0) {
    hideContextMenu(doc);
    return;
  }

  wrapper.appendChild(list);
  menu.replaceChildren(wrapper);
  doc.body.appendChild(menu);

  const rect = menu.getBoundingClientRect();
  const maxLeft = win.innerWidth - rect.width - 8;
  const maxTop = win.innerHeight - rect.height - 8;
  const left = Math.max(8, Math.min(x, Math.max(8, maxLeft)));
  const top = Math.max(8, Math.min(y, Math.max(8, maxTop)));
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.visibility = "visible";

  const state = ensureContextMenuState(doc);
  const cleanupHandlers: Array<() => void> = [];

  const cleanupContextMenu = () => {
    while (cleanupHandlers.length > 0) {
      const cleanup = cleanupHandlers.pop();
      try {
        cleanup?.();
      } catch (error) {
        console.warn("Failed to clean up context menu listener", error);
      }
    }
    if (menu.parentElement) {
      menu.parentElement.removeChild(menu);
    }
    state.cleanup = null;
  };

  state.cleanup = cleanupContextMenu;

  win.setTimeout(() => {
    if (state.cleanup !== cleanupContextMenu) {
      return;
    }

    const handlePointerDown = (event: Event) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      if (!menu.contains(event.target)) {
        hideContextMenu(doc);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        hideContextMenu(doc);
      }
    };

    const handleBlur = () => hideContextMenu(doc);
    const handleScroll = () => hideContextMenu(doc);

    doc.addEventListener("pointerdown", handlePointerDown, true);
    doc.addEventListener("contextmenu", handlePointerDown, true);
    doc.addEventListener("keydown", handleKeyDown);
    doc.addEventListener("scroll", handleScroll, true);
    win.addEventListener("blur", handleBlur);
    win.addEventListener("resize", handleBlur);

    cleanupHandlers.push(() => {
      doc.removeEventListener("pointerdown", handlePointerDown, true);
      doc.removeEventListener("contextmenu", handlePointerDown, true);
      doc.removeEventListener("keydown", handleKeyDown);
      doc.removeEventListener("scroll", handleScroll, true);
      win.removeEventListener("blur", handleBlur);
      win.removeEventListener("resize", handleBlur);
    });
  }, 0);
}
