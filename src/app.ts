import { DataStore } from "./data";
import { renderIcon } from "./icons";
import {
  GameSnapshot,
  PanelGroupNode,
  PanelLeafElements,
  PanelLeafNode,
  PanelNode,
  PanelOrientation,
  PlayerRecord,
  SortState,
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
} from "./views";

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

const SIDEBAR_STYLE_ID = "openfront-strategic-sidebar-styles";

function ensureSidebarStyles(): void {
  if (document.getElementById(SIDEBAR_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = SIDEBAR_STYLE_ID;
  style.textContent = `
    #openfront-strategic-sidebar [data-sidebar-role="table-container"] {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.7) transparent;
    }

    #openfront-strategic-sidebar [data-sidebar-role="table-container"]::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    #openfront-strategic-sidebar [data-sidebar-role="table-container"]::-webkit-scrollbar-thumb {
      background-color: rgba(148, 163, 184, 0.7);
      border-radius: 9999px;
    }

    #openfront-strategic-sidebar [data-sidebar-role="table-container"]::-webkit-scrollbar-track {
      background-color: transparent;
    }
  `;

  document.head.appendChild(style);
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

let leafIdCounter = 0;
let groupIdCounter = 0;

const DEFAULT_SORT_STATES: Record<ViewType, SortState> = {
  players: { key: "tiles", direction: "desc" },
  clanmates: { key: "label", direction: "asc" },
  teams: { key: "tiles", direction: "desc" },
  ships: { key: "owner", direction: "asc" },
  player: { key: "tiles", direction: "desc" },
  actions: { key: "label", direction: "asc" },
  actionEditor: { key: "label", direction: "asc" },
  runningActions: { key: "label", direction: "asc" },
  runningAction: { key: "label", direction: "asc" },
  logs: { key: "label", direction: "asc" },
  overlays: { key: "label", direction: "asc" },
};

function createLeaf(view: ViewType): PanelLeafNode {
  return {
    id: `leaf-${++leafIdCounter}`,
    type: "leaf",
    view,
    expandedRows: new Set<string>(),
    expandedGroups: new Set<string>(),
    sortStates: {
      players: { ...DEFAULT_SORT_STATES.players },
      clanmates: { ...DEFAULT_SORT_STATES.clanmates },
      teams: { ...DEFAULT_SORT_STATES.teams },
      ships: { ...DEFAULT_SORT_STATES.ships },
      player: { ...DEFAULT_SORT_STATES.player },
      actions: { ...DEFAULT_SORT_STATES.actions },
      actionEditor: { ...DEFAULT_SORT_STATES.actionEditor },
      runningActions: { ...DEFAULT_SORT_STATES.runningActions },
      runningAction: { ...DEFAULT_SORT_STATES.runningAction },
      logs: { ...DEFAULT_SORT_STATES.logs },
      overlays: { ...DEFAULT_SORT_STATES.overlays },
    },
    scrollTop: 0,
    scrollLeft: 0,
    logFollowEnabled: true,
    columnVisibility: {},
    hoveredRowElement: null,
  };
}

function createGroup(
  orientation: PanelOrientation,
  children: PanelNode[],
): PanelGroupNode {
  const count = Math.max(children.length, 1);
  return {
    id: `group-${++groupIdCounter}`,
    type: "group",
    orientation,
    children,
    sizes: new Array(count).fill(1 / count),
  };
}

function createDefaultRootNode(): PanelNode {
  const clanmatesLeaf = createLeaf("clanmates");
  const logsLeaf = createLeaf("logs");
  const group = createGroup("horizontal", [clanmatesLeaf, logsLeaf]);
  group.sizes = [0.8, 0.2];
  return group;
}

export class SidebarApp {
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
  private readonly handleOverlayRealign = () => this.repositionGameOverlay();
  private readonly handleGlobalKeyDown = (event: KeyboardEvent) =>
    this.onGlobalKeyDown(event);
  private readonly viewActions: ViewActionHandlers;
  private isSidebarHidden = false;

  constructor(store: DataStore) {
    this.store = store;
    this.snapshot = store.getSnapshot();
    ensureSidebarStyles();
    this.sidebar = this.createSidebarShell();
    this.layoutContainer = this.sidebar.querySelector(
      "[data-sidebar-layout]",
    ) as HTMLElement;
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
    this.observeGameOverlays();
    this.overlayResizeObserver = new ResizeObserver(this.handleOverlayRealign);
    this.overlayResizeObserver.observe(this.sidebar);
    window.addEventListener("resize", this.handleOverlayRealign);
    window.addEventListener("keydown", this.handleGlobalKeyDown);
    this.repositionGameOverlay();
  }

  private onGlobalKeyDown(event: KeyboardEvent): void {
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
    const existing = document.getElementById("openfront-strategic-sidebar");
    if (existing) {
      existing.remove();
    }

    const sidebar = createElement(
      "aside",
      "fixed top-0 left-0 z-[2147483646] flex h-full max-w-[90vw] flex-col border-r border-slate-800/80 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur",
    );
    sidebar.id = "openfront-strategic-sidebar";
    sidebar.style.width = "420px";
    sidebar.style.fontFamily = `'Inter', 'Segoe UI', system-ui, sans-serif`;

    const resizer = createElement(
      "div",
      "group absolute right-0 top-0 flex h-full w-3 translate-x-full cursor-col-resize items-center justify-center rounded-r-full bg-transparent transition-colors duration-150 hover:bg-sky-500/10",
    );
    resizer.appendChild(
      createElement(
        "span",
        "h-12 w-px rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60",
      ),
    );
    resizer.addEventListener("pointerdown", (event) =>
      this.startSidebarResize(event),
    );
    sidebar.appendChild(resizer);

    const layout = createElement(
      "div",
      "flex h-full flex-1 flex-col gap-3 overflow-hidden p-3",
    );
    layout.dataset.sidebarLayout = "true";
    sidebar.appendChild(layout);

    document.body.appendChild(sidebar);
    return sidebar;
  }

  private startSidebarResize(event: PointerEvent): void {
    event.preventDefault();
    const startWidth = this.sidebar.getBoundingClientRect().width;
    const startX = event.clientX;
    const originalUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    const onMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      const nextWidth = clamp(startWidth + delta, 280, window.innerWidth * 0.9);
      this.sidebar.style.width = `${nextWidth}px`;
      this.repositionGameOverlay();
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.body.style.userSelect = originalUserSelect;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  private observeGameOverlays(): void {
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
    let missingElement = false;
    const sidebarWidth = this.isSidebarHidden
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
      if (this.isSidebarHidden) {
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
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
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
    this.layoutContainer.innerHTML = "";
    const rootElement = this.buildNodeElement(this.rootNode);
    rootElement.classList.add("flex-1", "min-h-0");
    rootElement.style.flex = "1 1 0%";
    this.layoutContainer.appendChild(rootElement);
    this.refreshAllLeaves();
  }

  private buildNodeElement(node: PanelNode): HTMLElement {
    if (node.type === "leaf") {
      return this.buildLeafElement(node);
    }
    return this.buildGroupElement(node);
  }

  private buildLeafElement(leaf: PanelLeafNode): HTMLElement {
    const wrapper = createElement(
      "div",
      "flex min-h-[200px] flex-1 flex-col overflow-hidden rounded-lg border border-slate-800/70 bg-slate-900/70 shadow-inner",
    );
    wrapper.dataset.nodeId = leaf.id;

    const header = createElement(
      "div",
      "flex items-center justify-between gap-2 border-b border-slate-800/70 bg-slate-900/80 px-3 py-2",
    );

    const headerControls = createElement("div", "flex items-center gap-2");

    const select = createElement(
      "select",
      "h-7 min-w-[8rem] max-w-full shrink-0 rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70",
    );
    for (const option of VIEW_OPTIONS) {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      select.appendChild(opt);
    }
    select.value = leaf.view;
    headerControls.appendChild(select);

    const columnVisibilityButton = createElement(
      "button",
      "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-100 transition-colors hover:border-sky-500/70 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70",
    );
    columnVisibilityButton.type = "button";
    columnVisibilityButton.setAttribute("aria-label", "Choose visible columns");
    columnVisibilityButton.appendChild(renderIcon("columns", "h-4 w-4"));
    columnVisibilityButton.addEventListener("click", (event) => {
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

    headerControls.appendChild(columnVisibilityButton);

    const newActionButton = createElement(
      "button",
      "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-100 transition-colors hover:border-sky-500/70 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70",
    );
    newActionButton.type = "button";
    newActionButton.setAttribute("aria-label", "New action");
    newActionButton.appendChild(renderIcon("plus", "h-4 w-4"));
    newActionButton.addEventListener("click", () => {
      this.store.createAction();
    });

    headerControls.appendChild(newActionButton);

    const clearLogsButton = createElement(
      "button",
      "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-100 transition-colors hover:border-rose-500/70 hover:text-rose-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70",
    );
    clearLogsButton.type = "button";
    clearLogsButton.setAttribute("aria-label", "Clear logs");
    clearLogsButton.appendChild(renderIcon("trash", "h-4 w-4"));
    clearLogsButton.addEventListener("click", () => {
      this.store.clearLogs();
    });

    headerControls.appendChild(clearLogsButton);

    const followLogsButton = createElement(
      "button",
      "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-100 transition-colors hover:border-sky-500/70 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70",
    );
    followLogsButton.type = "button";
    followLogsButton.setAttribute("aria-label", "Toggle log auto-scroll");
    followLogsButton.appendChild(renderIcon("arrow-down", "h-4 w-4"));
    followLogsButton.addEventListener("click", () => {
      leaf.logFollowEnabled = !leaf.logFollowEnabled;
      if (leaf.logFollowEnabled) {
        this.scrollLogViewToBottom(leaf);
      }
      const container = leaf.contentContainer;
      if (container && container.dataset.sidebarRole === "log-view") {
        container.dataset.logFollowState = leaf.logFollowEnabled
          ? "following"
          : "paused";
        container.dataset.logStickToBottom = leaf.logFollowEnabled
          ? "true"
          : "false";
      }
      this.updateLeafHeaderControls(leaf);
    });

    headerControls.appendChild(followLogsButton);

    select.addEventListener("change", () => {
      leaf.view = select.value as ViewType;
      this.updateLeafHeaderControls(leaf);
      this.refreshLeafContent(leaf);
    });
    header.appendChild(headerControls);

    const actions = createElement("div", "flex items-center gap-2");
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

    const body = createElement(
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
    const button = createElement(
      "button",
      "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700/70 bg-slate-800/70 text-slate-300 transition-colors hover:border-sky-500/60 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50",
    );
    button.type = "button";
    button.title = label;
    button.appendChild(renderIcon(icon, "h-4 w-4"));
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handler();
    });
    return button;
  }

  private buildGroupElement(group: PanelGroupNode): HTMLElement {
    const wrapper = createElement(
      "div",
      group.orientation === "horizontal"
        ? "flex min-h-0 flex-1 flex-col"
        : "flex min-h-0 flex-1 flex-row",
    );
    wrapper.dataset.groupId = group.id;
    group.element = { wrapper };

    const count = group.children.length;
    if (group.sizes.length !== count) {
      this.normalizeSizes(group);
    }

    for (let i = 0; i < count; i++) {
      const child = group.children[i];
      const childWrapper = createElement("div", "flex min-h-0 flex-1");
      childWrapper.dataset.panelChild = String(i);
      childWrapper.style.flex = `${group.sizes[i] ?? 1} 1 0%`;
      childWrapper.appendChild(this.buildNodeElement(child));
      wrapper.appendChild(childWrapper);

      if (i < count - 1) {
        const handle = createElement(
          "div",
          group.orientation === "horizontal"
            ? "group relative -my-px flex h-3 w-full cursor-row-resize items-center justify-center rounded-md bg-transparent transition-colors duration-150 hover:bg-sky-500/10"
            : "group relative -mx-px flex w-3 h-full cursor-col-resize items-center justify-center rounded-md bg-transparent transition-colors duration-150 hover:bg-sky-500/10",
        );
        handle.appendChild(
          createElement(
            "span",
            group.orientation === "horizontal"
              ? "h-px w-10 rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60"
              : "w-px h-10 rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60",
          ),
        );
        handle.dataset.handleIndex = String(i);
        handle.addEventListener("pointerdown", (event) =>
          this.startPanelResize(group, i, event),
        );
        wrapper.appendChild(handle);
      }
    }

    return wrapper;
  }

  private startPanelResize(
    group: PanelGroupNode,
    index: number,
    event: PointerEvent,
  ): void {
    const wrapper = group.element?.wrapper;
    if (!wrapper) {
      return;
    }
    const childA = wrapper.querySelector<HTMLElement>(
      `[data-panel-child="${index}"]`,
    );
    const childB = wrapper.querySelector<HTMLElement>(
      `[data-panel-child="${index + 1}"]`,
    );
    if (!childA || !childB) {
      return;
    }

    event.preventDefault();
    const orientation = group.orientation;
    const rectA = childA.getBoundingClientRect();
    const rectB = childB.getBoundingClientRect();
    const totalPixels =
      orientation === "horizontal"
        ? rectA.height + rectB.height
        : rectA.width + rectB.width;
    const initialPixelsA =
      orientation === "horizontal" ? rectA.height : rectA.width;
    const sizeA = group.sizes[index] ?? 1;
    const sizeB = group.sizes[index + 1] ?? 1;
    const combinedShareRaw = sizeA + sizeB;
    const combinedShare = combinedShareRaw > 0 ? combinedShareRaw : 1;
    const startCoord =
      orientation === "horizontal" ? event.clientY : event.clientX;
    const originalUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const onMove = (moveEvent: PointerEvent) => {
      const currentCoord =
        orientation === "horizontal" ? moveEvent.clientY : moveEvent.clientX;
      const delta = currentCoord - startCoord;
      const rawRatioA =
        totalPixels === 0 ? 0.5 : (initialPixelsA + delta) / totalPixels;
      const baseMinRatio = 0.15;
      const baseMaxRatio = 0.85;
      const minPanelPixels = 200;
      let minRatio = baseMinRatio;
      let maxRatio = baseMaxRatio;
      if (orientation === "horizontal") {
        const minRatioFromPixels =
          totalPixels === 0 ? 0 : minPanelPixels / totalPixels;
        const maxRatioFromPixels =
          totalPixels === 0 ? 1 : 1 - minRatioFromPixels;
        minRatio = Math.max(
          minRatio,
          Math.min(minRatioFromPixels, baseMaxRatio),
        );
        maxRatio = Math.min(
          maxRatio,
          Math.max(maxRatioFromPixels, baseMinRatio),
        );
        if (minRatio > maxRatio) {
          const middle = (minRatio + maxRatio) / 2;
          minRatio = middle;
          maxRatio = middle;
        }
      }
      const ratioA = clamp(rawRatioA, minRatio, maxRatio);
      const ratioB = 1 - ratioA;
      const nextSizeA = combinedShare * ratioA;
      const nextSizeB = combinedShare * ratioB;
      group.sizes[index] = nextSizeA;
      group.sizes[index + 1] = nextSizeB;
      childA.style.flex = `${nextSizeA} 1 0%`;
      childB.style.flex = `${nextSizeB} 1 0%`;
    };

    const stop = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      document.body.style.userSelect = originalUserSelect;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  }

  private splitLeaf(leaf: PanelLeafNode, orientation: PanelOrientation): void {
    const newLeaf = createLeaf(leaf.view);
    const parentInfo = this.findParent(leaf);
    if (!parentInfo) {
      this.rootNode = createGroup(orientation, [leaf, newLeaf]);
    } else {
      const { parent, index } = parentInfo;
      if (parent.orientation === orientation) {
        const otherSizes = parent.sizes.reduce((sum, size, i) => {
          if (i === index) {
            return sum;
          }
          return sum + size;
        }, 0);
        const fallbackSize =
          parent.children.length > 0 ? 1 / parent.children.length : 1;
        const inferredSize = Math.max(1 - otherSizes, 0);
        const currentSize =
          parent.sizes[index] ??
          (inferredSize > 0 ? inferredSize : fallbackSize);
        const newSize = currentSize / 2;
        parent.sizes[index] = currentSize - newSize;
        parent.children.splice(index + 1, 0, newLeaf);
        parent.sizes.splice(index + 1, 0, newSize);
      } else {
        const replacement = createGroup(orientation, [leaf, newLeaf]);
        parent.children[index] = replacement;
      }
    }
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
      hideColumnVisibilityMenu();
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
      followLogsButton.classList.toggle("border-slate-700", !followEnabled);
      followLogsButton.classList.toggle("bg-slate-900/60", !followEnabled);
      followLogsButton.classList.toggle("text-slate-100", !followEnabled);
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
      this.snapshot,
      () => this.refreshLeafContent(leaf),
      previousContainer ?? undefined,
      lifecycle.callbacks,
      this.viewActions,
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

  private showPlayerDetails(playerId: string): void {
    for (const leaf of this.getLeaves()) {
      if (leaf.view !== "player") {
        continue;
      }
      leaf.selectedPlayerId = playerId;
      this.refreshLeafContent(leaf);
    }
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
