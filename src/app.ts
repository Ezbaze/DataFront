import { DataStore } from "./data";
import { renderIcon } from "./icons";
import { createDefaultRootNode, splitPanelLeaf } from "./panelLayout";
import { startPanelResize } from "./panelResize";
import {
  GameSnapshot,
  PanelGroupNode,
  PanelLeafElements,
  PanelLeafNode,
  PanelNode,
  PanelOrientation,
  PlayerRecord,
  ViewType,
} from "./types";
import { clamp, createElement, extractClanTag, focusTile } from "./utils";
import {
  buildViewContent,
  hideColumnVisibilityMenu,
  isColumnVisibilitySupported,
  showColumnVisibilityMenu,
  ViewActionHandlers,
  ViewLifecycleCallbacks,
} from "./components/views";
import { SidebarRole } from "./sidebarRoles";

interface SidebarAppOptions {
  enableOverlayAlignment?: boolean;
  onRequestNewWindow?: () => void;
  onPlayerDetailsSelected?: (playerId: string) => void;
  onSearchFilterChanged?: (query: string) => void;
  windowMode?: "embedded" | "standalone";
}

const VIEW_OPTIONS: { value: ViewType; label: string }[] = [
  { value: "players", label: "Players" },
  { value: "clanmates", label: "Clanmates" },
  { value: "teams", label: "Teams" },
  { value: "ships", label: "Ships" },
  { value: "player", label: "Player panel" },
  { value: "actions", label: "Actions" },
  { value: "actionEditor", label: "Action Editor" },
  { value: "runningActions", label: "Running Actions" },
  { value: "runningAction", label: "Running Action" },
  { value: "logs", label: "Logs" },
  { value: "overlays", label: "Overlays" },
];

const PANEL_ACTION_BUTTON_BASE_CLASS = [
  "flex h-7 w-7 items-center justify-center",
  "rounded-md border border-slate-700/70",
  "bg-slate-800/70 text-slate-300 transition-colors",
  "hover:border-sky-500/60 hover:text-sky-200",
  "focus:outline-none focus:ring-2 focus:ring-sky-500/50",
].join(" ");

function getPanelActionButtonClass(extra?: string): string {
  return extra
    ? `${PANEL_ACTION_BUTTON_BASE_CLASS} ${extra}`
    : PANEL_ACTION_BUTTON_BASE_CLASS;
}

const SIDEBAR_STYLE_ID = "openfront-strategic-sidebar-styles";

function ensureSidebarStyles(targetDocument: Document): void {
  if (targetDocument.getElementById(SIDEBAR_STYLE_ID)) {
    return;
  }

  const style = targetDocument.createElement("style");
  style.id = SIDEBAR_STYLE_ID;
  const roles = [SidebarRole.TableContainer, SidebarRole.LogView];
  style.textContent = roles
    .map(
      (role) => `
    #openfront-strategic-sidebar [data-sidebar-role="${role}"] {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.7) transparent;
    }

    #openfront-strategic-sidebar [data-sidebar-role="${role}"]::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    #openfront-strategic-sidebar [data-sidebar-role="${role}"]::-webkit-scrollbar-thumb {
      background-color: rgba(148, 163, 184, 0.7);
      border-radius: 9999px;
    }

    #openfront-strategic-sidebar [data-sidebar-role="${role}"]::-webkit-scrollbar-track {
      background-color: transparent;
    }`,
    )
    .join("\n");

  targetDocument.head.appendChild(style);
}

const OVERLAY_SELECTORS = ["game-left-sidebar", "control-panel"] as const;
type OverlaySelector = (typeof OVERLAY_SELECTORS)[number];

interface OverlayRegistration {
  root: HTMLElement;
  target: HTMLElement;
  originalLeft: string;
  originalRight: string;
  originalMaxWidth: string;
}

export class SidebarApp {
  private readonly hostDocument = document;
  private readonly hostWindow = window;
  private uiDocument: Document = document;
  private uiWindow: Window = window;
  private readonly sidebar: HTMLElement;
  private readonly layoutContainer: HTMLElement;
  private readonly store: DataStore;
  private snapshot: GameSnapshot;
  private rootNode: PanelNode;
  private readonly overlayElements = new Map<
    OverlaySelector,
    OverlayRegistration
  >();
  private overlayObserver?: MutationObserver;
  private overlayResizeObserver?: ResizeObserver;
  private readonly handleOverlayRealign = () =>
    this.runWithUiContext(() => this.repositionGameOverlay());
  private readonly handleGlobalKeyDown = (event: KeyboardEvent) =>
    this.onGlobalKeyDown(event);
  private readonly viewActions: ViewActionHandlers;
  private searchInput?: HTMLInputElement;
  private searchFilter = "";
  private isSidebarHidden = false;
  private sidebarResizer: HTMLElement | null = null;
  private sidebarDefaultWidth = "420px";
  private hostSidebarWidth = "420px";
  private quickActionsButton?: HTMLButtonElement;
  private quickActionsMenu?: HTMLDivElement;
  private isQuickActionsMenuOpen = false;
  private readonly handleQuickActionsPointerDown = (event: PointerEvent) =>
    this.runWithUiContext(() => this.onQuickActionsPointerDown(event));
  private readonly handleQuickActionsKeyDown = (event: KeyboardEvent) =>
    this.runWithUiContext(() => this.onQuickActionsKeyDown(event));
  private readonly enableOverlayAlignment: boolean;
  private readonly enableGlobalHotkeys: boolean;
  private readonly onRequestNewWindow?: () => void;
  private readonly onPlayerDetailsSelected?: (playerId: string) => void;
  private readonly onSearchFilterChanged?: (query: string) => void;
  private readonly windowMode: SidebarAppOptions["windowMode"];

  constructor(
    store: DataStore,
    options?: SidebarAppOptions,
    uiDocument: Document = document,
    uiWindow: Window = window,
  ) {
    this.enableOverlayAlignment = options?.enableOverlayAlignment ?? true;
    this.onRequestNewWindow = options?.onRequestNewWindow;
    this.onPlayerDetailsSelected = options?.onPlayerDetailsSelected;
    this.onSearchFilterChanged = options?.onSearchFilterChanged;
    this.windowMode = options?.windowMode ?? "embedded";
    this.enableGlobalHotkeys = this.windowMode === "embedded";
    this.setUiEnvironment(uiDocument, uiWindow);
    this.store = store;
    this.snapshot = store.getSnapshot();
    this.runWithUiContext(() => {
      ensureSidebarStyles(this.uiDocument);
    });
    this.sidebar = this.createSidebarShell();
    this.layoutContainer = this.sidebar.querySelector(
      "[data-sidebar-layout]",
    ) as HTMLElement;
    this.sidebarDefaultWidth =
      this.sidebar.style.width || this.sidebarDefaultWidth;
    this.hostSidebarWidth = this.sidebarDefaultWidth;
    this.applySidebarLayoutMode();
    this.rootNode = createDefaultRootNode();
    this.viewActions = {
      toggleTrading: (playerIds, stopped) =>
        this.store.setTradingStopped(playerIds, stopped),
      showPlayerDetails: (playerId) => this.showPlayerDetails(playerId),
      focusPlayer: (playerId) => this.focusPlayerInSidebar(playerId),
      focusTeam: (teamId) => this.focusTeamInSidebar(teamId),
      focusClan: (clanId) => this.focusClanInSidebar(clanId),
      createAction: () => {
        this.store.createAction();
      },
      selectAction: (actionId) => {
        this.store.selectAction(actionId);
      },
      setActionEnabled: (actionId, enabled) => {
        this.store.setActionEnabled(actionId, enabled);
      },
      saveAction: (actionId, update) => {
        this.store.saveAction(actionId, update);
      },
      deleteAction: (actionId) => {
        this.store.deleteAction(actionId);
      },
      startAction: (actionId) => {
        this.store.startAction(actionId);
      },
      selectRunningAction: (runningId) => {
        this.store.selectRunningAction(runningId);
      },
      stopRunningAction: (runningId) => {
        this.store.stopRunningAction(runningId);
      },
      updateRunningActionSetting: (runningId, settingId, value) => {
        this.store.updateRunningActionSetting(runningId, settingId, value);
      },
      setRunningActionInterval: (runningId, ticks) => {
        this.store.setRunningActionInterval(runningId, ticks);
      },
      clearLogs: () => {
        this.store.clearLogs();
      },
      setOverlayEnabled: (overlayId, enabled) => {
        this.store.setOverlayEnabled(overlayId, enabled);
      },
    };
    this.renderLayout();
    this.store.subscribe((snapshot) => {
      this.runWithUiContext(() => {
        const previousSnapshot = this.snapshot;
        const previousSelf = this.getSelfPlayer(previousSnapshot);
        const nextSelf = this.getSelfPlayer(snapshot);
        const joinedNewGame =
          (previousSnapshot.players.length === 0 &&
            snapshot.players.length > 0) ||
          (previousSelf && nextSelf && previousSelf.id !== nextSelf.id);
        this.snapshot = snapshot;
        if (joinedNewGame) {
          this.expandSelfClanmates(snapshot);
        }
        this.refreshAllLeaves();
      });
    });
    if (this.enableOverlayAlignment) {
      this.observeGameOverlays();
      this.overlayResizeObserver = new ResizeObserver(
        this.handleOverlayRealign,
      );
      this.overlayResizeObserver.observe(this.sidebar);
      this.hostWindow.addEventListener("resize", this.handleOverlayRealign);
    }
    if (this.enableGlobalHotkeys) {
      this.hostWindow.addEventListener("keydown", this.handleGlobalKeyDown);
    }
    this.repositionGameOverlay();
  }

  syncPlayerDetails(playerId: string): void {
    this.syncPlayerSelection(playerId);
  }

  syncPlayerSelection(playerId: string): void {
    const trimmed = playerId.trim();
    if (!trimmed) {
      return;
    }
    this.applyPlayerDetailsSelection(trimmed);
    const player = this.snapshot.players.find((entry) => entry.id === trimmed);
    if (player) {
      this.highlightPlayerAcrossViews(player);
    }
  }

  syncSearchFilter(query: string): void {
    const trimmed = query.trim();
    const next = trimmed.length >= 2 ? trimmed : "";
    if (this.searchInput) {
      this.searchInput.value = next;
    }
    this.updateSearchFilter(next, { notify: false });
  }

  destroy(): void {
    this.runWithUiContext(() => {
      if (this.overlayObserver) {
        this.overlayObserver.disconnect();
      }
      if (this.overlayResizeObserver) {
        this.overlayResizeObserver.disconnect();
      }
      this.hostWindow.removeEventListener("resize", this.handleOverlayRealign);
      if (this.enableGlobalHotkeys) {
        this.hostWindow.removeEventListener(
          "keydown",
          this.handleGlobalKeyDown,
        );
      }
      this.closeQuickActionsMenu();
    });
  }

  private setUiEnvironment(doc: Document, win: Window): void {
    this.uiDocument = doc;
    this.uiWindow = win;
  }

  private runWithUiContext<T>(fn: () => T): T {
    return fn();
  }

  private createUiElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    textContent?: string,
  ): HTMLElementTagNameMap[K] {
    return createElement(tag, className, textContent, this.uiDocument);
  }

  private onGlobalKeyDown(event: KeyboardEvent): void {
    this.runWithUiContext(() => this.handleKeyDownInternal(event));
  }

  private handleKeyDownInternal(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.repeat) {
      return;
    }

    const target = event.target;
    if (target instanceof HTMLElement) {
      if (target.isContentEditable) {
        return;
      }
      const editableTarget = target.closest(
        "input, textarea, select, [contenteditable='true' i], [contenteditable='']",
      );
      if (editableTarget) {
        return;
      }
    }

    const isToggleShortcut =
      event.code === "KeyH" &&
      event.ctrlKey &&
      event.altKey &&
      !event.shiftKey &&
      !event.metaKey;

    if (!isToggleShortcut) {
      return;
    }

    event.preventDefault();
    this.toggleSidebarVisibility();
  }

  private createSidebarShell(): HTMLElement {
    const existing = this.uiDocument.getElementById(
      "openfront-strategic-sidebar",
    );
    if (existing) {
      existing.remove();
    }

    const sidebar = this.createUiElement(
      "aside",
      "fixed top-0 left-0 z-[2147483646] flex h-full max-w-[90vw] flex-col border-r border-slate-800/80 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur",
    );
    sidebar.id = "openfront-strategic-sidebar";
    sidebar.style.width = this.windowMode === "standalone" ? "100%" : "420px";
    sidebar.style.maxWidth = this.windowMode === "standalone" ? "100%" : "90vw";
    sidebar.style.fontFamily = `'Inter', 'Segoe UI', system-ui, sans-serif`;

    const resizer = this.createUiElement(
      "div",
      "group absolute right-0 top-0 flex h-full w-3 translate-x-full cursor-col-resize items-center justify-center rounded-r-full bg-transparent transition-colors duration-150 hover:bg-sky-500/10",
    );
    resizer.dataset.sidebarResizer = "true";
    this.sidebarResizer = resizer;
    resizer.appendChild(
      this.createUiElement(
        "span",
        "h-12 w-px rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60",
      ),
    );
    resizer.addEventListener("pointerdown", (event) =>
      this.runWithUiContext(() => this.startSidebarResize(event)),
    );
    sidebar.appendChild(resizer);

    const layout = this.createUiElement(
      "div",
      "flex h-full flex-1 flex-col gap-3 overflow-hidden p-3",
    );
    layout.dataset.sidebarLayout = "true";
    sidebar.appendChild(layout);

    this.uiDocument.body.appendChild(sidebar);
    return sidebar;
  }

  private startSidebarResize(event: PointerEvent): void {
    this.runWithUiContext(() => {
      event.preventDefault();
      const startWidth = this.sidebar.getBoundingClientRect().width;
      const startX = event.clientX;
      const originalUserSelect = this.uiDocument.body.style.userSelect;
      this.uiDocument.body.style.userSelect = "none";
      const onMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
        const nextWidth = clamp(
          startWidth + delta,
          280,
          (this.uiWindow.innerWidth ?? window.innerWidth) * 0.9,
        );
        this.sidebar.style.width = `${nextWidth}px`;
        this.repositionGameOverlay();
      };
      const onUp = () => {
        this.uiWindow.removeEventListener("pointermove", onMove);
        this.uiWindow.removeEventListener("pointerup", onUp);
        this.uiWindow.removeEventListener("pointercancel", onUp);
        this.uiDocument.body.style.userSelect = originalUserSelect;
      };
      this.uiWindow.addEventListener("pointermove", onMove);
      this.uiWindow.addEventListener("pointerup", onUp);
      this.uiWindow.addEventListener("pointercancel", onUp);
    });
  }

  private applySidebarLayoutMode(): void {
    const resizer =
      this.sidebarResizer ??
      (this.sidebar.querySelector(
        "[data-sidebar-resizer]",
      ) as HTMLElement | null);
    const isStandalone = this.windowMode === "standalone";
    const targetWidth = isStandalone
      ? "100%"
      : this.hostSidebarWidth || this.sidebarDefaultWidth;
    this.sidebar.style.width = targetWidth;
    this.sidebar.style.maxWidth = isStandalone ? "100%" : "90vw";
    if (resizer) {
      if (isStandalone) {
        resizer.style.display = "none";
        resizer.setAttribute("aria-hidden", "true");
      } else {
        resizer.style.display = "";
        resizer.removeAttribute("aria-hidden");
      }
    }
  }

  private observeGameOverlays(): void {
    if (!this.enableOverlayAlignment) {
      return;
    }
    let discovered = false;
    for (const selector of OVERLAY_SELECTORS) {
      const registration = this.overlayElements.get(selector);
      if (registration?.root.isConnected && registration.target.isConnected) {
        continue;
      }
      const found = document.querySelector<HTMLElement>(selector);
      if (found) {
        const target = this.resolveOverlayTarget(selector, found);
        if (target) {
          this.registerOverlay(selector, found, target);
          discovered = true;
        }
      }
    }

    if (discovered) {
      this.repositionGameOverlay();
    }

    const hasMissing = OVERLAY_SELECTORS.some((selector) => {
      const registration = this.overlayElements.get(selector);
      return (
        !registration ||
        !registration.root.isConnected ||
        !registration.target.isConnected
      );
    });

    if (!hasMissing) {
      if (this.overlayObserver) {
        this.overlayObserver.disconnect();
        this.overlayObserver = undefined;
      }
      return;
    }

    if (this.overlayObserver) {
      return;
    }

    this.overlayObserver = new MutationObserver(() => {
      let updated = false;
      for (const selector of OVERLAY_SELECTORS) {
        const registration = this.overlayElements.get(selector);
        if (registration?.root.isConnected && registration.target.isConnected) {
          continue;
        }
        const candidate = document.querySelector<HTMLElement>(selector);
        if (candidate) {
          const target = this.resolveOverlayTarget(selector, candidate);
          if (target) {
            this.registerOverlay(selector, candidate, target);
            updated = true;
          }
        } else if (registration) {
          this.overlayElements.delete(selector);
          updated = true;
        }
      }

      if (updated) {
        this.repositionGameOverlay();
      }

      const stillMissing = OVERLAY_SELECTORS.some((selector) => {
        const current = this.overlayElements.get(selector);
        return (
          !current || !current.root.isConnected || !current.target.isConnected
        );
      });

      if (!stillMissing) {
        this.overlayObserver?.disconnect();
        this.overlayObserver = undefined;
      }
    });

    this.overlayObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private repositionGameOverlay(): void {
    if (!this.enableOverlayAlignment) {
      return;
    }
    let missingElement = false;
    const treatHidden = this.isSidebarHidden;
    const sidebarWidth = treatHidden
      ? 0
      : this.sidebar.getBoundingClientRect().width;
    const offset = Math.round(sidebarWidth) + 16;
    for (const selector of OVERLAY_SELECTORS) {
      const registration = this.ensureOverlayRegistration(selector);
      if (!registration) {
        missingElement = true;
        continue;
      }

      const target = registration.target;
      if (treatHidden) {
        target.style.left = registration.originalLeft;
        target.style.right = registration.originalRight;
        target.style.maxWidth = registration.originalMaxWidth;
      } else {
        target.style.left = `${offset}px`;
        target.style.right = "auto";
        target.style.maxWidth = `calc(100vw - ${offset + 24}px)`;
      }
    }

    if (missingElement) {
      this.observeGameOverlays();
    }
  }

  private ensureOverlayRegistration(
    selector: OverlaySelector,
  ): OverlayRegistration | null {
    let registration = this.overlayElements.get(selector) ?? null;
    let root = registration?.root;

    if (!root || !root.isConnected) {
      const candidate = document.querySelector<HTMLElement>(selector);
      if (!candidate) {
        this.overlayElements.delete(selector);
        return null;
      }
      root = candidate;
    }

    let target = registration?.target;
    if (!target || !target.isConnected) {
      const resolved = this.resolveOverlayTarget(selector, root);
      if (!resolved) {
        this.overlayElements.delete(selector);
        return null;
      }
      target = resolved;
    }

    if (
      !registration ||
      registration.root !== root ||
      registration.target !== target
    ) {
      this.registerOverlay(selector, root, target);
      registration = this.overlayElements.get(selector) ?? null;
    }

    return registration;
  }

  private registerOverlay(
    selector: OverlaySelector,
    root: HTMLElement,
    target: HTMLElement,
  ): void {
    const existing = this.overlayElements.get(selector);
    const originalLeft =
      existing && existing.target === target
        ? existing.originalLeft
        : target.style.left;
    const originalRight =
      existing && existing.target === target
        ? existing.originalRight
        : target.style.right;
    const originalMaxWidth =
      existing && existing.target === target
        ? existing.originalMaxWidth
        : target.style.maxWidth;

    this.overlayElements.set(selector, {
      root,
      target,
      originalLeft,
      originalRight,
      originalMaxWidth,
    });
  }

  private toggleSidebarVisibility(force?: boolean): void {
    const nextHidden =
      typeof force === "boolean" ? force : !this.isSidebarHidden;
    if (nextHidden === this.isSidebarHidden) {
      return;
    }

    this.isSidebarHidden = nextHidden;
    if (nextHidden) {
      this.sidebar.style.display = "none";
      this.sidebar.setAttribute("aria-hidden", "true");
      this.sidebar.dataset.sidebarHidden = "true";
    } else {
      this.sidebar.style.display = "";
      this.sidebar.removeAttribute("aria-hidden");
      delete this.sidebar.dataset.sidebarHidden;
    }

    this.repositionGameOverlay();
  }

  private resolveOverlayTarget(
    selector: OverlaySelector,
    root: HTMLElement,
  ): HTMLElement | null {
    if (!root.isConnected) {
      return null;
    }

    if (selector === "game-left-sidebar") {
      const fixedChild = this.findPositionedChild(root);
      if (fixedChild) {
        return fixedChild;
      }
    }

    const ancestor = this.findPositionedAncestor(root);
    if (ancestor) {
      return ancestor;
    }

    if (selector === "game-left-sidebar") {
      const aside = root.querySelector<HTMLElement>("aside");
      if (aside) {
        return aside;
      }
    }

    return root;
  }

  private findPositionedAncestor(element: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = element;
    while (current) {
      const position = window.getComputedStyle(current).position;
      if (position && position !== "static") {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  private findPositionedChild(root: HTMLElement): HTMLElement | null {
    const walker = (root.ownerDocument ?? document).createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
    );
    const current = walker.currentNode as HTMLElement;
    if (current !== root) {
      const position = window.getComputedStyle(current).position;
      if (position && position !== "static") {
        return current;
      }
    }
    while (true) {
      const next = walker.nextNode() as HTMLElement | null;
      if (!next) {
        break;
      }
      const position = window.getComputedStyle(next).position;
      if (position && position !== "static") {
        return next;
      }
    }
    return null;
  }

  private renderLayout(): void {
    this.runWithUiContext(() => {
      this.doRenderLayout();
    });
  }

  private doRenderLayout(): void {
    this.searchInput = undefined;
    this.closeQuickActionsMenu();
    this.layoutContainer.innerHTML = "";
    this.layoutContainer.appendChild(this.buildSidebarTopBars());
    const rootElement = this.buildNodeElement(this.rootNode);
    rootElement.classList.add("flex-1", "min-h-0");
    rootElement.style.flex = "1 1 0%";
    this.layoutContainer.appendChild(rootElement);
    this.refreshAllLeaves();
  }

  private buildSidebarTopBars(): HTMLElement {
    const container = this.createUiElement("div", "flex gap-3");
    const quickActionsWrapper = this.createUiElement("div", "relative");
    const quickActionsButton = this.createUiElement(
      "button",
      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800/70 bg-slate-900/70 text-slate-200 shadow-inner transition hover:border-sky-500/70 focus:outline-none focus:ring-2 focus:ring-sky-500/50",
    );
    quickActionsButton.type = "button";
    quickActionsButton.setAttribute("aria-haspopup", "menu");
    quickActionsButton.setAttribute("aria-expanded", "false");
    quickActionsButton.setAttribute("aria-label", "Open menu");
    quickActionsButton.appendChild(renderIcon("radar", "h-5 w-5"));
    quickActionsButton.addEventListener("click", () =>
      this.runWithUiContext(() => this.toggleQuickActionsMenu()),
    );
    quickActionsWrapper.appendChild(quickActionsButton);
    this.quickActionsButton = quickActionsButton;
    container.appendChild(quickActionsWrapper);

    const searchWrapper = this.createUiElement(
      "div",
      "relative flex-1 min-w-0 space-y-1",
    );
    const searchBar = this.createUiElement(
      "label",
      "flex h-10 items-center rounded-lg border border-slate-800/70 bg-slate-900/70 px-2 shadow-inner",
    );
    const searchInput = this.createUiElement(
      "input",
      "flex-1 min-w-0 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 appearance-none border-none ring-0 focus:outline-none focus:ring-0 focus:border-transparent",
    );
    searchInput.type = "search";
    searchInput.autocomplete = "off";
    searchInput.placeholder = "Search players, clans, teams, or coordinates…";
    this.searchInput = searchInput;
    searchInput.value = this.searchFilter;
    searchInput.addEventListener("input", () =>
      this.handleSearchInput(searchInput.value),
    );
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.handleSearchSubmit();
      }
    });
    searchBar.appendChild(searchInput);

    searchWrapper.appendChild(searchBar);

    container.appendChild(searchWrapper);
    return container;
  }

  private toggleQuickActionsMenu(): void {
    if (this.isQuickActionsMenuOpen) {
      this.closeQuickActionsMenu();
      return;
    }
    this.openQuickActionsMenu();
  }

  private openQuickActionsMenu(): void {
    if (!this.quickActionsButton || this.isQuickActionsMenuOpen) {
      return;
    }
    const parent = this.quickActionsButton.parentElement;
    if (!parent) {
      return;
    }
    const menu = this.buildQuickActionsMenu();
    parent.appendChild(menu);
    this.quickActionsMenu = menu;
    this.isQuickActionsMenuOpen = true;
    this.quickActionsButton.setAttribute("aria-expanded", "true");
    this.uiDocument.addEventListener(
      "pointerdown",
      this.handleQuickActionsPointerDown,
      true,
    );
    this.uiDocument.addEventListener(
      "keydown",
      this.handleQuickActionsKeyDown,
      true,
    );
  }

  private closeQuickActionsMenu(): void {
    if (!this.isQuickActionsMenuOpen) {
      return;
    }
    this.isQuickActionsMenuOpen = false;
    this.quickActionsButton?.setAttribute("aria-expanded", "false");
    if (this.quickActionsMenu?.parentElement) {
      this.quickActionsMenu.parentElement.removeChild(this.quickActionsMenu);
    }
    this.quickActionsMenu = undefined;
    this.uiDocument.removeEventListener(
      "pointerdown",
      this.handleQuickActionsPointerDown,
      true,
    );
    this.uiDocument.removeEventListener(
      "keydown",
      this.handleQuickActionsKeyDown,
      true,
    );
  }

  private buildQuickActionsMenu(): HTMLDivElement {
    const menu = this.createUiElement(
      "div",
      "absolute left-0 z-[2147483646] mt-2 w-44 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/95 text-sm shadow-xl backdrop-blur",
    );
    menu.role = "menu";
    menu.tabIndex = -1;

    const list = this.createUiElement("div", "py-1");
    list.appendChild(
      this.createQuickActionItem("New window", "external-link", () =>
        this.onRequestNewWindow?.(),
      ),
    );
    menu.appendChild(list);
    return menu;
  }

  private createQuickActionItem(
    label: string,
    icon: Parameters<typeof renderIcon>[0],
    onSelect?: () => void,
  ): HTMLButtonElement {
    const button = this.createUiElement(
      "button",
      "flex w-full items-center gap-2 px-3 py-2 text-left text-slate-100 transition-colors hover:bg-slate-800/80 hover:text-sky-200",
      label,
    );
    button.type = "button";
    button.prepend(renderIcon(icon, "h-4 w-4 text-slate-300"));
    button.addEventListener("click", () => {
      this.closeQuickActionsMenu();
      this.runWithUiContext(() => onSelect?.());
    });
    return button;
  }

  private onQuickActionsPointerDown(event: PointerEvent): void {
    if (!this.isQuickActionsMenuOpen) {
      return;
    }
    const target = event.target as Node | null;
    if (
      (target && this.quickActionsMenu?.contains(target)) ||
      (target && this.quickActionsButton?.contains(target))
    ) {
      return;
    }
    this.closeQuickActionsMenu();
  }

  private onQuickActionsKeyDown(event: KeyboardEvent): void {
    if (!this.isQuickActionsMenuOpen) {
      return;
    }
    if (event.key === "Escape") {
      this.closeQuickActionsMenu();
    }
  }

  private handleSearchInput(raw: string): void {
    this.runWithUiContext(() => {
      const trimmed = raw.trim();
      this.updateSearchFilter(trimmed.length >= 2 ? trimmed : "");
    });
  }

  private handleSearchSubmit(): void {
    this.runWithUiContext(() => {
      const query = this.searchInput?.value ?? "";
      const trimmed = query.trim();
      if (!trimmed) {
        return;
      }
      this.updateSearchFilter(trimmed.length >= 2 ? trimmed : "");
      const coordinates = this.parseCoordinates(trimmed);
      if (coordinates) {
        focusTile(coordinates);
      }
    });
  }

  private parseCoordinates(query: string): { x: number; y: number } | null {
    const match = /^-?\d{1,5}\s*[, ]\s*-?\d{1,5}$/.exec(query);
    if (!match) {
      return null;
    }
    const [xRaw, yRaw] = query.split(/[, ]/).filter(Boolean);
    const x = Number(xRaw);
    const y = Number(yRaw);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return null;
    }
    return { x, y };
  }

  private buildNodeElement(node: PanelNode): HTMLElement {
    if (node.type === "leaf") {
      return this.buildLeafElement(node);
    }
    return this.buildGroupElement(node);
  }

  private updateSearchFilter(
    next: string,
    options?: { notify?: boolean },
  ): void {
    const normalized = next.trim().toLowerCase();
    if (this.searchFilter === normalized) {
      return;
    }
    this.searchFilter = normalized;
    this.refreshAllLeaves();
    if (options?.notify !== false) {
      this.onSearchFilterChanged?.(next);
    }
  }

  private getFilteredSnapshot(view: ViewType): GameSnapshot {
    const filter = this.searchFilter.trim().toLowerCase();
    if (!filter) {
      return this.snapshot;
    }

    const matchesPlayer = (player: PlayerRecord): boolean => {
      const fields = [
        player.name,
        player.id,
        player.team ?? "",
        player.clan ? `[${player.clan}]` : "",
      ];
      return fields.some((field) =>
        field.toString().toLowerCase().includes(filter),
      );
    };

    if (view === "players" || view === "clanmates" || view === "teams") {
      const players = this.snapshot.players.filter(matchesPlayer);
      return { ...this.snapshot, players };
    }

    if (view === "ships") {
      const ships = this.snapshot.ships.filter((ship) => {
        const computedStatus = ship.retreating
          ? "Retreating"
          : ship.reachedTarget
            ? "Arrived"
            : ship.destination
              ? "En route"
              : "Unknown";
        const fields = [
          `${ship.type} #${ship.id}`,
          ship.ownerName,
          ship.type,
          computedStatus,
          ship.origin ? `${ship.origin.x},${ship.origin.y}` : "",
          ship.destination ? `${ship.destination.x},${ship.destination.y}` : "",
        ];
        return fields.some((field) =>
          `${field ?? ""}`.toLowerCase().includes(filter),
        );
      });
      return { ...this.snapshot, ships };
    }

    if (view === "logs") {
      const sidebarLogs =
        this.snapshot.sidebarLogs?.filter((entry) => {
          const message = entry.message?.toLowerCase() ?? "";
          const source = entry.source?.toLowerCase() ?? "";
          const level = entry.level?.toLowerCase() ?? "";
          const tokenText = (entry.tokens ?? [])
            .map((token) =>
              token.type === "text" ? token.text : (token.label ?? ""),
            )
            .join(" ")
            .toLowerCase();
          return (
            message.includes(filter) ||
            source.includes(filter) ||
            level.includes(filter) ||
            tokenText.includes(filter)
          );
        }) ?? [];
      return { ...this.snapshot, sidebarLogs };
    }

    if (view === "actions") {
      const state = this.snapshot.sidebarActions;
      if (!state) {
        return this.snapshot;
      }
      const filteredActions = state.actions.filter((action) => {
        const description = action.description?.toLowerCase() ?? "";
        return (
          action.name.toLowerCase().includes(filter) ||
          description.includes(filter)
        );
      });
      const filteredRunning = state.running.filter((run) => {
        const fields = [run.name, run.status, run.runMode];
        return fields.some((field) =>
          `${field ?? ""}`.toLowerCase().includes(filter),
        );
      });
      const sidebarActions = {
        ...state,
        actions: filteredActions,
        running: filteredRunning,
      };
      return { ...this.snapshot, sidebarActions };
    }

    if (view === "runningActions") {
      const state = this.snapshot.sidebarActions;
      if (!state) {
        return this.snapshot;
      }
      const filteredRunning = state.running.filter((run) => {
        const fields = [run.name, run.status, run.runMode];
        return fields.some((field) =>
          field.toString().toLowerCase().includes(filter),
        );
      });
      const sidebarActions = { ...state, running: filteredRunning };
      return { ...this.snapshot, sidebarActions };
    }

    return this.snapshot;
  }

  private buildLeafElement(leaf: PanelLeafNode): HTMLElement {
    const wrapper = this.createUiElement(
      "div",
      "flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-800/70 bg-slate-900/70 shadow-inner",
    );
    wrapper.dataset.nodeId = leaf.id;

    const header = this.createUiElement(
      "div",
      "flex items-center justify-between gap-2 border-b border-slate-800/70 bg-slate-900/80 px-3 py-2",
    );

    const headerControls = this.createUiElement(
      "div",
      "flex items-center gap-2",
    );

    const select = this.createUiElement(
      "select",
      "h-7 min-w-[8rem] max-w-full shrink-0 rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70",
    );
    for (const option of VIEW_OPTIONS) {
      const opt = this.uiDocument.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      select.appendChild(opt);
    }
    select.value = leaf.view;
    headerControls.appendChild(select);

    const columnVisibilityButton = this.createUiElement(
      "button",
      getPanelActionButtonClass(),
    );
    columnVisibilityButton.type = "button";
    columnVisibilityButton.setAttribute("aria-label", "Choose visible columns");
    columnVisibilityButton.appendChild(renderIcon("columns", "h-4 w-4"));
    columnVisibilityButton.addEventListener("click", (event) => {
      this.runWithUiContext(() => {
        event.preventDefault();
        event.stopPropagation();
        if (!isColumnVisibilitySupported(leaf.view)) {
          return;
        }
        showColumnVisibilityMenu({
          leaf,
          anchor: columnVisibilityButton,
          onChange: () => {
            this.refreshLeafContent(leaf);
          },
        });
      });
    });

    headerControls.appendChild(columnVisibilityButton);

    const newActionButton = this.createUiElement(
      "button",
      getPanelActionButtonClass(),
    );
    newActionButton.type = "button";
    newActionButton.setAttribute("aria-label", "New action");
    newActionButton.appendChild(renderIcon("plus", "h-4 w-4"));
    newActionButton.addEventListener("click", () => {
      this.runWithUiContext(() => {
        this.store.createAction();
      });
    });

    headerControls.appendChild(newActionButton);

    const clearLogsButton = this.createUiElement(
      "button",
      getPanelActionButtonClass(
        "hover:!border-rose-500/70 hover:!text-rose-200",
      ),
    );
    clearLogsButton.type = "button";
    clearLogsButton.setAttribute("aria-label", "Clear logs");
    clearLogsButton.appendChild(renderIcon("trash", "h-4 w-4"));
    clearLogsButton.addEventListener("click", () => {
      this.runWithUiContext(() => {
        this.store.clearLogs();
      });
    });

    headerControls.appendChild(clearLogsButton);

    const followLogsButton = this.createUiElement(
      "button",
      getPanelActionButtonClass(),
    );
    followLogsButton.type = "button";
    followLogsButton.setAttribute("aria-label", "Toggle log auto-scroll");
    followLogsButton.appendChild(renderIcon("arrow-down", "h-4 w-4"));
    followLogsButton.addEventListener("click", () => {
      this.runWithUiContext(() => {
        leaf.logFollowEnabled = !leaf.logFollowEnabled;
        if (leaf.logFollowEnabled) {
          this.scrollLogViewToBottom(leaf);
        }
        const container = leaf.contentContainer;
        if (
          container &&
          container.dataset.sidebarRole === SidebarRole.LogView
        ) {
          container.dataset.logFollowState = leaf.logFollowEnabled
            ? "following"
            : "paused";
          container.dataset.logStickToBottom = leaf.logFollowEnabled
            ? "true"
            : "false";
        }
        this.updateLeafHeaderControls(leaf);
      });
    });

    headerControls.appendChild(followLogsButton);

    select.addEventListener("change", () =>
      this.runWithUiContext(() => {
        leaf.view = select.value as ViewType;
        this.updateLeafHeaderControls(leaf);
        this.refreshLeafContent(leaf);
      }),
    );
    header.appendChild(headerControls);

    const actions = this.createUiElement("div", "flex items-center gap-2");
    actions.appendChild(
      this.createActionButton("Split horizontally", "split-horizontal", () =>
        this.splitLeaf(leaf, "horizontal"),
      ),
    );
    actions.appendChild(
      this.createActionButton("Split vertically", "split-vertical", () =>
        this.splitLeaf(leaf, "vertical"),
      ),
    );
    actions.appendChild(
      this.createActionButton("Close panel", "close", () =>
        this.closeLeaf(leaf),
      ),
    );
    header.appendChild(actions);

    const body = this.createUiElement(
      "div",
      "flex flex-1 min-h-0 flex-col overflow-hidden",
    );

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    leaf.element = {
      wrapper,
      header,
      body,
      viewSelect: select,
      columnVisibilityButton,
      newActionButton,
      clearLogsButton,
      followLogsButton,
    } satisfies PanelLeafElements;
    this.updateLeafHeaderControls(leaf);
    this.refreshLeafContent(leaf);
    return wrapper;
  }

  private createActionButton(
    label: string,
    icon: "split-horizontal" | "split-vertical" | "close",
    handler: () => void,
  ) {
    const button = this.createUiElement("button", getPanelActionButtonClass());
    button.type = "button";
    button.title = label;
    button.appendChild(renderIcon(icon, "h-4 w-4"));
    button.addEventListener("click", (event) => {
      this.runWithUiContext(() => {
        event.preventDefault();
        event.stopPropagation();
        handler();
      });
    });
    return button;
  }

  private buildGroupElement(group: PanelGroupNode): HTMLElement {
    const wrapper = this.createUiElement(
      "div",
      group.orientation === "horizontal"
        ? "flex min-h-0 min-w-0 flex-1 flex-col"
        : "flex min-h-0 min-w-0 flex-1 flex-row",
    );
    wrapper.dataset.groupId = group.id;
    group.element = { wrapper };

    const count = group.children.length;
    if (group.sizes.length !== count) {
      this.normalizeSizes(group);
    }

    for (let i = 0; i < count; i++) {
      const child = group.children[i];
      const childWrapper = this.createUiElement(
        "div",
        "flex min-h-0 min-w-0 flex-1",
      );
      childWrapper.dataset.panelChild = String(i);
      childWrapper.style.flex = `${group.sizes[i] ?? 1} 1 0%`;
      childWrapper.appendChild(this.buildNodeElement(child));
      wrapper.appendChild(childWrapper);

      if (i < count - 1) {
        const handle = this.createUiElement(
          "div",
          group.orientation === "horizontal"
            ? "group relative -my-px flex h-3 w-full cursor-row-resize items-center justify-center rounded-md bg-transparent transition-colors duration-150 hover:bg-sky-500/10"
            : "group relative -mx-px flex w-3 h-full cursor-col-resize items-center justify-center rounded-md bg-transparent transition-colors duration-150 hover:bg-sky-500/10",
        );
        handle.appendChild(
          this.createUiElement(
            "span",
            group.orientation === "horizontal"
              ? "h-px w-10 rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60"
              : "w-px h-10 rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60",
          ),
        );
        handle.dataset.handleIndex = String(i);
        handle.addEventListener("pointerdown", (event) =>
          this.runWithUiContext(() => startPanelResize(group, i, event)),
        );
        wrapper.appendChild(handle);
      }
    }

    return wrapper;
  }

  private splitLeaf(leaf: PanelLeafNode, orientation: PanelOrientation): void {
    this.rootNode = splitPanelLeaf(this.rootNode, leaf, orientation);
    this.renderLayout();
  }

  private closeLeaf(leaf: PanelLeafNode): void {
    this.cleanupLeafView(leaf);
    const parentInfo = this.findParent(leaf);
    if (!parentInfo) {
      this.rootNode = createDefaultRootNode();
      this.renderLayout();
      return;
    }
    const { parent, index } = parentInfo;
    parent.children.splice(index, 1);
    parent.sizes.splice(index, 1);

    if (parent.children.length === 0) {
      this.rootNode = createDefaultRootNode();
    } else if (parent.children.length === 1) {
      this.replaceNode(parent, parent.children[0]);
    } else {
      this.normalizeSizes(parent);
    }
    this.renderLayout();
  }

  private replaceNode(target: PanelNode, replacement: PanelNode): void {
    if (this.rootNode === target) {
      this.rootNode = replacement;
      return;
    }
    const parentInfo = this.findParent(target);
    if (!parentInfo) {
      return;
    }
    const { parent, index } = parentInfo;
    parent.children[index] = replacement;
    this.normalizeSizes(parent);
  }

  private findParent(
    target: PanelNode,
    current: PanelNode = this.rootNode,
  ): { parent: PanelGroupNode; index: number } | null {
    if (current.type === "group") {
      for (let i = 0; i < current.children.length; i++) {
        const child = current.children[i];
        if (child === target) {
          return { parent: current, index: i };
        }
        const result = this.findParent(target, child);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  private normalizeSizes(group: PanelGroupNode): void {
    const count = group.children.length;
    if (count === 0) {
      group.sizes = [];
      return;
    }
    const size = 1 / count;
    group.sizes = new Array(count).fill(size);
  }

  private refreshAllLeaves(): void {
    for (const leaf of this.getLeaves()) {
      this.refreshLeafContent(leaf);
    }
  }

  private updateLeafHeaderControls(leaf: PanelLeafNode): void {
    const element = leaf.element;
    if (!element) {
      return;
    }

    if (element.viewSelect.value !== leaf.view) {
      element.viewSelect.value = leaf.view;
    }

    const columnVisibilityButton = element.columnVisibilityButton;
    const supportsColumns = isColumnVisibilitySupported(leaf.view);
    columnVisibilityButton.style.display = supportsColumns ? "" : "none";
    if (supportsColumns) {
      columnVisibilityButton.removeAttribute("aria-hidden");
      columnVisibilityButton.tabIndex = 0;
    } else {
      columnVisibilityButton.setAttribute("aria-hidden", "true");
      columnVisibilityButton.tabIndex = -1;
      hideColumnVisibilityMenu(this.uiDocument);
    }

    const shouldShowNewAction =
      leaf.view === "actions" || leaf.view === "actionEditor";
    element.newActionButton.style.display = shouldShowNewAction ? "" : "none";
    if (shouldShowNewAction) {
      element.newActionButton.removeAttribute("aria-hidden");
      element.newActionButton.tabIndex = 0;
    } else {
      element.newActionButton.setAttribute("aria-hidden", "true");
      element.newActionButton.tabIndex = -1;
    }

    const hasClearLogsAction = typeof this.viewActions.clearLogs === "function";
    const shouldShowClearLogs = leaf.view === "logs" && hasClearLogsAction;
    const logCount = this.snapshot.sidebarLogs?.length ?? 0;
    element.clearLogsButton.style.display = shouldShowClearLogs ? "" : "none";
    if (shouldShowClearLogs) {
      element.clearLogsButton.removeAttribute("aria-hidden");
      element.clearLogsButton.tabIndex = 0;
      const canClear = logCount > 0;
      element.clearLogsButton.disabled = !canClear;
      if (canClear) {
        element.clearLogsButton.title = "Clear sidebar logs";
      } else {
        element.clearLogsButton.title = "No log entries to clear.";
      }
    } else {
      element.clearLogsButton.setAttribute("aria-hidden", "true");
      element.clearLogsButton.tabIndex = -1;
      element.clearLogsButton.disabled = false;
      element.clearLogsButton.removeAttribute("title");
    }

    const followLogsButton = element.followLogsButton;
    const shouldShowFollowLogs = leaf.view === "logs";
    followLogsButton.style.display = shouldShowFollowLogs ? "" : "none";
    if (shouldShowFollowLogs) {
      followLogsButton.removeAttribute("aria-hidden");
      followLogsButton.tabIndex = 0;
      const followEnabled = leaf.logFollowEnabled !== false;
      followLogsButton.setAttribute(
        "aria-pressed",
        followEnabled ? "true" : "false",
      );
      followLogsButton.classList.toggle("border-slate-700/70", !followEnabled);
      followLogsButton.classList.toggle("bg-slate-800/70", !followEnabled);
      followLogsButton.classList.toggle("text-slate-300", !followEnabled);
      followLogsButton.classList.toggle("border-sky-500/70", followEnabled);
      followLogsButton.classList.toggle("bg-sky-500/20", followEnabled);
      followLogsButton.classList.toggle("text-sky-100", followEnabled);
      followLogsButton.title = followEnabled
        ? "Following latest logs (click to pause)"
        : "Auto-scroll paused (click to resume)";
    } else {
      followLogsButton.setAttribute("aria-hidden", "true");
      followLogsButton.tabIndex = -1;
      followLogsButton.removeAttribute("aria-pressed");
      followLogsButton.removeAttribute("title");
    }
  }

  private refreshLeafContent(leaf: PanelLeafNode): void {
    this.runWithUiContext(() => this.doRefreshLeafContent(leaf));
  }

  private doRefreshLeafContent(leaf: PanelLeafNode): void {
    const element = leaf.element;
    if (!element) {
      return;
    }
    this.updateLeafHeaderControls(leaf);
    const previousContainer =
      leaf.contentContainer ??
      (element.body.firstElementChild as HTMLElement | null);
    const previousCleanup = leaf.viewCleanup;
    const previousScrollTop =
      leaf.scrollTop ?? previousContainer?.scrollTop ?? 0;
    const previousScrollLeft =
      leaf.scrollLeft ?? previousContainer?.scrollLeft ?? 0;
    const lifecycle = this.createViewLifecycle(leaf);
    const nextContainer = buildViewContent(
      leaf,
      this.getFilteredSnapshot(leaf.view),
      () => this.refreshLeafContent(leaf),
      { document: this.uiDocument, window: this.uiWindow },
      previousContainer ?? undefined,
      lifecycle.callbacks,
      this.viewActions,
      this.searchFilter,
    );
    const replaced = !!previousContainer && nextContainer !== previousContainer;
    if (replaced) {
      if (previousCleanup) {
        previousCleanup();
      }
    }

    const newCleanup = lifecycle.getCleanup();
    if (newCleanup) {
      leaf.viewCleanup = newCleanup;
    } else if (!replaced) {
      leaf.viewCleanup = previousCleanup;
    } else {
      leaf.viewCleanup = undefined;
    }

    if (
      !previousContainer ||
      nextContainer !== previousContainer ||
      nextContainer.parentElement !== element.body
    ) {
      element.body.replaceChildren(nextContainer);
    }

    leaf.contentContainer = nextContainer;

    if (nextContainer) {
      const shouldStickToBottom =
        leaf.view === "logs" &&
        nextContainer.dataset.logStickToBottom === "true";
      if (shouldStickToBottom) {
        nextContainer.scrollTop = nextContainer.scrollHeight;
      } else {
        nextContainer.scrollTop = previousScrollTop;
      }
      nextContainer.scrollLeft = previousScrollLeft;
      leaf.scrollTop = nextContainer.scrollTop;
      leaf.scrollLeft = nextContainer.scrollLeft;
      this.bindLeafContainerInteractions(leaf, nextContainer);
    } else {
      leaf.scrollTop = 0;
      leaf.scrollLeft = 0;
    }
  }

  private scrollLogViewToBottom(leaf: PanelLeafNode): void {
    if (leaf.view !== "logs") {
      return;
    }
    const container = leaf.contentContainer;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
    leaf.scrollTop = container.scrollTop;
  }

  private createViewLifecycle(leaf: PanelLeafNode): {
    callbacks: ViewLifecycleCallbacks;
    getCleanup: () => (() => void) | undefined;
  } {
    let cleanup: (() => void) | undefined;
    const callbacks: ViewLifecycleCallbacks = {
      registerCleanup: (fn) => {
        cleanup = fn;
      },
    };
    return {
      callbacks,
      getCleanup: () => cleanup,
    };
  }

  private cleanupLeafView(leaf: PanelLeafNode): void {
    const cleanup = leaf.viewCleanup;
    leaf.viewCleanup = undefined;
    if (cleanup) {
      cleanup();
    }
  }

  private bindLeafContainerInteractions(
    leaf: PanelLeafNode,
    container: HTMLElement,
  ): void {
    if (leaf.hoveredRowElement && !leaf.hoveredRowElement.isConnected) {
      leaf.hoveredRowElement = null;
    }

    if (leaf.boundContainer && leaf.boundContainer !== container) {
      if (leaf.scrollHandler) {
        leaf.boundContainer.removeEventListener("scroll", leaf.scrollHandler);
      }
      if (leaf.pointerLeaveHandler) {
        leaf.boundContainer.removeEventListener(
          "pointerleave",
          leaf.pointerLeaveHandler,
        );
      }
    }

    if (leaf.boundContainer !== container) {
      const handleScroll = () => {
        leaf.scrollTop = container.scrollTop;
        leaf.scrollLeft = container.scrollLeft;
        if (leaf.view === "logs") {
          const nearBottom =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <=
            4;
          if (nearBottom) {
            if (!leaf.logFollowEnabled) {
              leaf.logFollowEnabled = true;
              this.updateLeafHeaderControls(leaf);
            }
          } else if (leaf.logFollowEnabled) {
            leaf.logFollowEnabled = false;
            this.updateLeafHeaderControls(leaf);
          }
          container.dataset.logFollowState = leaf.logFollowEnabled
            ? "following"
            : "paused";
          container.dataset.logStickToBottom = leaf.logFollowEnabled
            ? "true"
            : "false";
        }
      };
      const handlePointerLeave = () => this.clearLeafHover(leaf);
      container.addEventListener("scroll", handleScroll, { passive: true });
      container.addEventListener("pointerleave", handlePointerLeave);
      leaf.boundContainer = container;
      leaf.scrollHandler = handleScroll;
      leaf.pointerLeaveHandler = handlePointerLeave;
      if (leaf.view === "logs") {
        container.dataset.logFollowState = leaf.logFollowEnabled
          ? "following"
          : "paused";
        container.dataset.logStickToBottom = leaf.logFollowEnabled
          ? "true"
          : "false";
      }
    }
  }

  private clearLeafHover(leaf: PanelLeafNode): void {
    if (leaf.hoveredRowElement) {
      const highlightClass = leaf.hoveredRowElement.dataset.hoverHighlightClass;
      if (highlightClass) {
        leaf.hoveredRowElement.classList.remove(highlightClass);
      }
    }
    leaf.hoveredRowElement = null;
    leaf.hoveredRowKey = undefined;
  }

  private applyPlayerDetailsSelection(playerId: string): void {
    for (const leaf of this.getLeaves()) {
      if (leaf.view !== "player") {
        continue;
      }
      leaf.selectedPlayerId = playerId;
      this.refreshLeafContent(leaf);
    }
  }

  private showPlayerDetails(playerId: string): void {
    const trimmed = playerId.trim();
    if (!trimmed) {
      return;
    }
    this.applyPlayerDetailsSelection(trimmed);
    const player = this.snapshot.players.find((entry) => entry.id === trimmed);
    if (player) {
      this.highlightPlayerAcrossViews(player);
    }
    this.onPlayerDetailsSelected?.(trimmed);
  }

  private focusPlayerInSidebar(playerId: string): void {
    const trimmed = playerId?.trim();
    if (!trimmed) {
      return;
    }
    const player = this.snapshot.players.find((entry) => entry.id === trimmed);
    if (!player) {
      return;
    }
    this.showPlayerDetails(trimmed);
    if (player.position) {
      focusTile(player.position);
    }
    this.highlightPlayerAcrossViews(player);
  }

  private focusTeamInSidebar(teamId: string): void {
    const normalized = this.normalizeTeamId(teamId);
    const groupKey = this.getTeamGroupKeyFromId(normalized);
    const leaves = this.getLeaves();
    for (const leaf of leaves) {
      if (leaf.view !== "teams") {
        continue;
      }
      leaf.expandedGroups.add(groupKey);
      leaf.hoveredRowKey = groupKey;
      leaf.hoveredRowElement = null;
      this.refreshLeafContent(leaf);
      this.scrollGroupIntoView(leaf, groupKey);
    }
    const representative = this.snapshot.players.find(
      (player) => this.normalizeTeamId(player.team) === normalized,
    );
    if (representative) {
      for (const leaf of leaves) {
        if (leaf.view === "players") {
          this.revealPlayerRow(leaf, representative.id);
        }
      }
    }
  }

  private focusClanInSidebar(clanId: string): void {
    const normalized = this.normalizeClanId(clanId);
    const groupKey = this.getClanGroupKeyFromId(normalized);
    const leaves = this.getLeaves();
    for (const leaf of leaves) {
      if (leaf.view !== "clanmates") {
        continue;
      }
      leaf.expandedGroups.add(groupKey);
      leaf.hoveredRowKey = groupKey;
      leaf.hoveredRowElement = null;
      this.refreshLeafContent(leaf);
      this.scrollGroupIntoView(leaf, groupKey);
    }
    const representative = this.snapshot.players.find(
      (player) => this.resolveClanId(player) === normalized,
    );
    if (representative) {
      for (const leaf of leaves) {
        if (leaf.view === "players") {
          this.revealPlayerRow(leaf, representative.id);
        }
      }
    }
  }

  private highlightPlayerAcrossViews(player: PlayerRecord): void {
    const leaves = this.getLeaves();
    const clanGroupKey = this.getClanGroupKeyFromId(this.resolveClanId(player));
    const teamGroupKey = this.getTeamGroupKeyFromId(player.team);
    for (const leaf of leaves) {
      switch (leaf.view) {
        case "players":
          this.revealPlayerRow(leaf, player.id);
          break;
        case "clanmates":
          this.revealPlayerInGroup(leaf, clanGroupKey, player.id);
          break;
        case "teams":
          this.revealPlayerInGroup(leaf, teamGroupKey, player.id);
          break;
        default:
          break;
      }
    }
  }

  private revealPlayerRow(leaf: PanelLeafNode, rowKey: string): void {
    leaf.hoveredRowKey = rowKey;
    leaf.hoveredRowElement = null;
    this.refreshLeafContent(leaf);
    this.scrollRowIntoView(leaf, rowKey);
  }

  private revealPlayerInGroup(
    leaf: PanelLeafNode,
    groupKey: string,
    rowKey: string,
  ): void {
    leaf.expandedGroups.add(groupKey);
    this.revealPlayerRow(leaf, rowKey);
  }

  private scrollRowIntoView(leaf: PanelLeafNode, rowKey: string): void {
    const container = leaf.contentContainer;
    if (!container) {
      return;
    }
    const row = container.querySelector<HTMLElement>(
      `[data-row-key="${rowKey}"]`,
    );
    if (!row) {
      return;
    }
    this.scrollElementIntoView(container, row);
    leaf.scrollTop = container.scrollTop;
    leaf.hoveredRowElement = row;
  }

  private scrollGroupIntoView(leaf: PanelLeafNode, groupKey: string): void {
    const container = leaf.contentContainer;
    if (!container) {
      return;
    }
    const group = container.querySelector<HTMLElement>(
      `[data-group-key="${groupKey}"]`,
    );
    if (!group) {
      return;
    }
    this.scrollElementIntoView(container, group);
    leaf.scrollTop = container.scrollTop;
    leaf.hoveredRowElement = group;
  }

  private scrollElementIntoView(
    container: HTMLElement,
    element: HTMLElement,
  ): void {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const elementTop =
      elementRect.top - containerRect.top + container.scrollTop;
    const elementBottom =
      elementRect.bottom - containerRect.top + container.scrollTop;
    const visibleTop = container.scrollTop;
    const visibleBottom = visibleTop + container.clientHeight;
    const padding = container.clientHeight * 0.25;

    if (elementTop < visibleTop) {
      container.scrollTop = Math.max(elementTop - padding, 0);
    } else if (elementBottom > visibleBottom) {
      container.scrollTop = Math.max(
        elementBottom - container.clientHeight + padding,
        0,
      );
    }
  }

  private getTeamGroupKeyFromId(teamId?: string): string {
    return `team:${this.normalizeTeamId(teamId)}`;
  }

  private getClanGroupKeyFromId(clanId?: string): string {
    return `clan:${this.normalizeClanId(clanId)}`;
  }

  private normalizeTeamId(teamId?: string): string {
    const trimmed = teamId?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : "Solo";
  }

  private normalizeClanId(clanId?: string): string {
    const trimmed = clanId?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : "Unaffiliated";
  }

  private resolveClanId(player: PlayerRecord): string {
    const tag = extractClanTag(player.name) ?? player.clan;
    return this.normalizeClanId(tag);
  }

  private getSelfPlayer(snapshot: GameSnapshot): PlayerRecord | undefined {
    return snapshot.players.find((player) => player.isSelf);
  }

  private expandSelfClanmates(snapshot: GameSnapshot): void {
    const self = this.getSelfPlayer(snapshot);
    if (!self) {
      return;
    }
    const clanmatesLeaves = this.getLeaves().filter(
      (leaf) => leaf.view === "clanmates",
    );
    if (clanmatesLeaves.length === 0) {
      return;
    }
    const clanTag = extractClanTag(self.name) ?? "Unaffiliated";
    const groupKey = `clan:${clanTag}`;
    for (const leaf of clanmatesLeaves) {
      leaf.expandedGroups.add(groupKey);
    }
  }

  private getLeaves(
    node: PanelNode = this.rootNode,
    acc: PanelLeafNode[] = [],
  ): PanelLeafNode[] {
    if (node.type === "leaf") {
      acc.push(node);
      return acc;
    }
    for (const child of node.children) {
      this.getLeaves(child, acc);
    }
    return acc;
  }
}
