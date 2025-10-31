
// ==UserScript==
// @name			OpenFront Strategic Sidebar
// @namespace		https://openfront.io/
// @version			0.1.0
// @description		Adds a resizable, splittable strategic sidebar for OpenFront players, clans, and teams.
// @author			ezbaze
// @match			https://*.openfront.io/*
// @match			https://openfront.io/*
// @license			MIT
// @updateURL		https://raw.githubusercontent.com/OpenFrontIO/main/datafront.user.js
// @downloadURL		https://raw.githubusercontent.com/OpenFrontIO/main/datafront.user.js
//
// Created with love using Gorilla
// ==/UserScript==

(function () {
  'use strict';

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const createSVGElement = ([tag, attrs, children]) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach((name) => {
      element.setAttribute(name, String(attrs[name]));
    });
    if (children?.length) {
      children.forEach((child) => {
        const childElement = createSVGElement(child);
        element.appendChild(childElement);
      });
    }
    return element;
  };
  const createElement$1 = (iconNode, customAttrs = {}) => {
    const tag = "svg";
    const attrs = {
      ...defaultAttributes,
      ...customAttrs
    };
    return createSVGElement([tag, attrs, iconNode]);
  };

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const ArrowDown = [
    ["path", { d: "M12 5v14" }],
    ["path", { d: "m19 12-7 7-7-7" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const CirclePoundSterling = [
    ["path", { d: "M10 16V9.5a1 1 0 0 1 5 0" }],
    ["path", { d: "M8 12h4" }],
    ["path", { d: "M8 16h7" }],
    ["circle", { cx: "12", cy: "12", r: "10" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const Columns3 = [
    ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }],
    ["path", { d: "M9 3v18" }],
    ["path", { d: "M15 3v18" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const Plus = [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "M12 5v14" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const SquareSplitHorizontal = [
    ["path", { d: "M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3" }],
    ["path", { d: "M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3" }],
    ["line", { x1: "12", x2: "12", y1: "4", y2: "20" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const SquareSplitVertical = [
    ["path", { d: "M5 8V5c0-1 1-2 2-2h10c1 0 2 1 2 2v3" }],
    ["path", { d: "M19 16v3c0 1-1 2-2 2H7c-1 0-2-1-2-2v-3" }],
    ["line", { x1: "4", x2: "20", y1: "12", y2: "12" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const Trash = [
    ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
    ["path", { d: "M3 6h18" }],
    ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const Users = [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744" }],
    ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }],
    ["circle", { cx: "9", cy: "7", r: "4" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const X = [
    ["path", { d: "M18 6 6 18" }],
    ["path", { d: "m6 6 12 12" }]
  ];

  const ICONS = {
      "split-horizontal": SquareSplitVertical,
      "split-vertical": SquareSplitHorizontal,
      close: X,
      plus: Plus,
      trash: Trash,
      "arrow-down": ArrowDown,
      columns: Columns3,
  };
  function renderIcon(kind, className) {
      const iconNode = ICONS[kind];
      const svg = createElement$1(iconNode);
      if (className) {
          svg.setAttribute("class", className);
      }
      svg.setAttribute("aria-hidden", "true");
      return svg;
  }

  const CLAN_TAG_PATTERN = /^\[([a-zA-Z]{2,5})\]/;
  const numberFormatter = new Intl.NumberFormat("en-US");
  function normalizeTroopCount(value) {
      if (!Number.isFinite(value)) {
          return 0;
      }
      return Math.floor(Math.max(value, 0) / 10);
  }
  function formatNumber(value) {
      return numberFormatter.format(value);
  }
  function formatTroopCount(rawTroops) {
      return formatNumber(normalizeTroopCount(rawTroops));
  }
  function formatCountdown(targetMs, nowMs) {
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
  function formatTimestamp(ms) {
      const date = new Date(ms);
      return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
      });
  }
  function extractClanTag(name) {
      if (!name.startsWith("[")) {
          return undefined;
      }
      const match = name.match(CLAN_TAG_PATTERN);
      return match ? match[1] : undefined;
  }
  function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
  }
  function createElement(tag, className, textContent) {
      const el = document.createElement(tag);
      if (className) {
          el.className = className;
      }
      if (textContent !== undefined) {
          el.textContent = textContent;
      }
      return el;
  }
  let cachedGoToEmitter = null;
  let cachedEmitterElement = null;
  const GO_TO_SELECTORS = [
      "events-display",
      "control-panel",
      "leader-board",
  ];
  function resolveGoToEmitter() {
      if (cachedGoToEmitter &&
          cachedEmitterElement &&
          document.contains(cachedEmitterElement)) {
          return cachedGoToEmitter;
      }
      cachedGoToEmitter = null;
      cachedEmitterElement = null;
      for (const selector of GO_TO_SELECTORS) {
          const element = document.querySelector(selector);
          if (!element) {
              continue;
          }
          const emitter = element.emitGoToPositionEvent;
          if (typeof emitter === "function") {
              cachedEmitterElement = element;
              cachedGoToEmitter = emitter.bind(element);
              return cachedGoToEmitter;
          }
          const prototypeEmitter = element["emitGoToPositionEvent"];
          if (typeof prototypeEmitter === "function") {
              cachedEmitterElement = element;
              cachedGoToEmitter = prototypeEmitter.bind(element);
              return cachedGoToEmitter;
          }
      }
      return null;
  }
  function focusTile(summary) {
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
      }
      catch (error) {
          console.warn("OpenFront sidebar: failed to emit go-to event", error);
          return false;
      }
  }
  let contextMenuElement = null;
  let contextMenuCleanup = null;
  function ensureContextMenuElement() {
      if (!contextMenuElement) {
          contextMenuElement = createElement("div", "fixed z-[2147483647] min-w-[160px] overflow-hidden rounded-md border " +
              "border-slate-700/80 bg-slate-950/95 text-sm text-slate-100 shadow-2xl " +
              "backdrop-blur");
          contextMenuElement.dataset.sidebarRole = "context-menu";
          contextMenuElement.style.pointerEvents = "auto";
          contextMenuElement.style.zIndex = "2147483647";
      }
      return contextMenuElement;
  }
  function hideContextMenu() {
      if (contextMenuCleanup) {
          contextMenuCleanup();
          contextMenuCleanup = null;
      }
      if (contextMenuElement && contextMenuElement.parentElement) {
          contextMenuElement.parentElement.removeChild(contextMenuElement);
      }
  }
  function showContextMenu(options) {
      const { x, y, title, items } = options;
      if (!items.length) {
          hideContextMenu();
          return;
      }
      hideContextMenu();
      const menu = ensureContextMenuElement();
      menu.className =
          "fixed z-[2147483647] min-w-[160px] overflow-hidden rounded-md border " +
              "border-slate-700/80 bg-slate-950/95 text-sm text-slate-100 shadow-2xl " +
              "backdrop-blur";
      menu.style.zIndex = "2147483647";
      menu.style.visibility = "hidden";
      menu.style.left = "0px";
      menu.style.top = "0px";
      const wrapper = createElement("div", "flex flex-col");
      if (title) {
          const header = createElement("div", "border-b border-slate-800/80 px-3 py-2 text-xs font-semibold uppercase " +
              "tracking-wide text-slate-300", title);
          wrapper.appendChild(header);
      }
      const list = createElement("div", "py-1");
      for (const item of items) {
          const button = createElement("button", `${item.disabled
            ? "cursor-not-allowed text-slate-500"
            : "hover:bg-slate-800/80 hover:text-sky-200"} flex w-full items-center gap-2 px-3 py-2 text-left transition-colors`, item.label);
          button.type = "button";
          button.disabled = Boolean(item.disabled);
          if (item.tooltip) {
              button.title = item.tooltip;
          }
          button.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              hideContextMenu();
              item.onSelect?.();
          });
          button.addEventListener("contextmenu", (event) => {
              event.preventDefault();
              event.stopPropagation();
          });
          list.appendChild(button);
      }
      if (list.childElementCount === 0) {
          hideContextMenu();
          return;
      }
      wrapper.appendChild(list);
      menu.replaceChildren(wrapper);
      document.body.appendChild(menu);
      const rect = menu.getBoundingClientRect();
      const maxLeft = window.innerWidth - rect.width - 8;
      const maxTop = window.innerHeight - rect.height - 8;
      const left = Math.max(8, Math.min(x, Math.max(8, maxLeft)));
      const top = Math.max(8, Math.min(y, Math.max(8, maxTop)));
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      menu.style.visibility = "visible";
      const cleanupHandlers = [];
      const cleanupContextMenu = () => {
          while (cleanupHandlers.length > 0) {
              const cleanup = cleanupHandlers.pop();
              try {
                  cleanup?.();
              }
              catch (error) {
                  console.warn("Failed to clean up context menu listener", error);
              }
          }
          if (menu.parentElement) {
              menu.parentElement.removeChild(menu);
          }
          contextMenuCleanup = null;
      };
      contextMenuCleanup = cleanupContextMenu;
      window.setTimeout(() => {
          if (contextMenuCleanup !== cleanupContextMenu) {
              return;
          }
          const handlePointerDown = (event) => {
              if (!(event.target instanceof Node)) {
                  return;
              }
              if (!menu.contains(event.target)) {
                  hideContextMenu();
              }
          };
          const handleKeyDown = (event) => {
              if (event.key === "Escape") {
                  event.preventDefault();
                  hideContextMenu();
              }
          };
          const handleBlur = () => hideContextMenu();
          const handleScroll = () => hideContextMenu();
          document.addEventListener("pointerdown", handlePointerDown, true);
          document.addEventListener("contextmenu", handlePointerDown, true);
          document.addEventListener("keydown", handleKeyDown);
          document.addEventListener("scroll", handleScroll, true);
          window.addEventListener("blur", handleBlur);
          window.addEventListener("resize", handleBlur);
          cleanupHandlers.push(() => {
              document.removeEventListener("pointerdown", handlePointerDown, true);
              document.removeEventListener("contextmenu", handlePointerDown, true);
              document.removeEventListener("keydown", handleKeyDown);
              document.removeEventListener("scroll", handleScroll, true);
              window.removeEventListener("blur", handleBlur);
              window.removeEventListener("resize", handleBlur);
          });
      }, 0);
  }

  const DEFAULT_ACTIONS = {
      toggleTrading: () => undefined,
      showPlayerDetails: () => undefined,
      focusPlayer: () => undefined,
      focusTeam: () => undefined,
      focusClan: () => undefined,
      createAction: () => undefined,
      selectAction: () => undefined,
      setActionEnabled: () => undefined,
      saveAction: () => undefined,
      deleteAction: () => undefined,
      startAction: () => undefined,
      selectRunningAction: () => undefined,
      stopRunningAction: () => undefined,
      updateRunningActionSetting: () => undefined,
      setRunningActionInterval: () => undefined,
      clearLogs: () => undefined,
      setOverlayEnabled: () => undefined,
  };
  const EMPTY_ACTIONS_STATE = {
      revision: 0,
      runningRevision: 0,
      actions: [],
      running: [],
  };
  function isTradeStoppedBySelf(carrier) {
      if (typeof carrier.tradeStoppedBySelf === "boolean") {
          return carrier.tradeStoppedBySelf;
      }
      if (carrier.tradeStopped !== true) {
          return false;
      }
      if (carrier.tradeStoppedByOther === true) {
          return false;
      }
      return true;
  }
  function isTradeStoppedByOther(carrier) {
      if (typeof carrier.tradeStoppedByOther === "boolean") {
          return carrier.tradeStoppedByOther;
      }
      if (carrier.tradeStopped !== true) {
          return false;
      }
      if (carrier.tradeStoppedBySelf === true) {
          return false;
      }
      return true;
  }
  let editorSettingIdCounter = 0;
  function nextEditorSettingId() {
      editorSettingIdCounter += 1;
      return `editor-setting-${editorSettingIdCounter}`;
  }
  function getActionsState(snapshot) {
      return snapshot.sidebarActions ?? EMPTY_ACTIONS_STATE;
  }
  function getRunModeLabel(mode) {
      switch (mode) {
          case "once":
              return "Run once";
          case "continuous":
              return "Continuous";
          case "event":
              return "Event-driven";
          default:
              return mode;
      }
  }
  function describeRunMode(mode) {
      switch (mode) {
          case "once":
              return "Runs a single time and removes itself from the running list.";
          case "continuous":
              return "Keeps running until you stop it manually.";
          case "event":
              return "Listens for subscribed game events and reacts when they fire.";
          default:
              return mode;
      }
  }
  const SELECTED_ROW_INDICATOR_BOX_SHADOW = "inset 0.25rem 0 0 0 rgba(125, 211, 252, 0.65)";
  const TABLE_CELL_BASE_CLASS = "border-b border-r border-slate-800 border-slate-900/80 px-3 py-2 last:border-r-0";
  const TABLE_CELL_EXPANDABLE_CLASS = "border-b border-r border-slate-800/60 px-3 py-2 last:border-r-0";
  function applyRowSelectionIndicator(row, isSelected) {
      row.style.boxShadow = isSelected ? SELECTED_ROW_INDICATOR_BOX_SHADOW : "";
  }
  function formatRunStatus(status) {
      switch (status) {
          case "running":
              return "Running";
          case "completed":
              return "Completed";
          case "stopped":
              return "Stopped";
          case "failed":
              return "Failed";
          default:
              return status;
      }
  }
  function defaultValueForType(type) {
      switch (type) {
          case "number":
              return 0;
          case "toggle":
              return false;
          default:
              return "";
      }
  }
  const TABLE_HEADERS = [
      { key: "label", label: "Clan / Player", align: "left", hideable: false },
      { key: "tiles", label: "Tiles", align: "right" },
      { key: "gold", label: "Gold", align: "right" },
      { key: "troops", label: "Troops", align: "right" },
      {
          key: "incoming",
          label: "⚠️",
          align: "center",
          title: "Incoming attacks",
      },
      {
          key: "outgoing",
          label: "⚔️",
          align: "center",
          title: "Outgoing attacks",
      },
      {
          key: "expanding",
          label: "🌱",
          align: "center",
          title: "Active expansions",
      },
      {
          key: "alliances",
          label: "🤝",
          align: "center",
          title: "Active alliances",
      },
      {
          key: "disconnected",
          label: "📡",
          align: "center",
          title: "Disconnected players",
      },
      {
          key: "traitor",
          label: "🕱",
          align: "center",
          title: "Traitor status",
      },
      {
          key: "stable",
          label: "🛡️",
          align: "center",
          title: "Stable (no alerts)",
      },
      {
          key: "waiting",
          label: "⏳",
          align: "center",
          title: "Waiting status",
      },
      {
          key: "eliminated",
          label: "☠️",
          align: "center",
          title: "Eliminated status",
      },
  ];
  const SHIP_HEADERS = [
      { key: "label", label: "Ship", align: "left", hideable: false },
      { key: "owner", label: "Owner", align: "left" },
      { key: "type", label: "Type", align: "left" },
      { key: "troops", label: "Troops", align: "right" },
      { key: "origin", label: "Origin", align: "left" },
      { key: "current", label: "Current", align: "left" },
      { key: "destination", label: "Destination", align: "left" },
      { key: "status", label: "Status", align: "left" },
  ];
  const DEFAULT_SORT_STATE = { key: "tiles", direction: "desc" };
  function ensureColumnVisibilityState(leaf, view, headers) {
      const current = leaf.columnVisibility[view] ?? {};
      const normalized = {};
      for (const header of headers) {
          const key = header.key;
          if (header.hideable === false) {
              normalized[key] = true;
              continue;
          }
          normalized[key] = current[key] === false ? false : true;
      }
      leaf.columnVisibility[view] = normalized;
      const hideableHeaders = headers.filter((header) => header.hideable !== false);
      if (hideableHeaders.length > 0) {
          const visibleCount = hideableHeaders.filter((header) => {
              const key = header.key;
              return normalized[key] !== false;
          }).length;
          if (visibleCount === 0) {
              const first = hideableHeaders[0];
              normalized[first.key] = true;
          }
      }
      return normalized;
  }
  function getVisibleHeaders(leaf, view, headers) {
      const visibility = ensureColumnVisibilityState(leaf, view, headers);
      return headers.filter((header) => visibility[header.key] !== false);
  }
  function getColumnVisibilitySignature(headers) {
      return headers.map((header) => header.key).join("|");
  }
  function buildViewContent(leaf, snapshot, requestRender, existingContainer, lifecycle, actions) {
      const view = leaf.view;
      const sortState = ensureSortState(leaf, view);
      const viewActions = actions ?? DEFAULT_ACTIONS;
      const handleSort = (key) => {
          const current = ensureSortState(leaf, view);
          let direction;
          if (current.key === key) {
              direction = current.direction === "asc" ? "desc" : "asc";
          }
          else {
              direction = getDefaultDirection(key);
          }
          leaf.sortStates[view] = { key, direction };
          requestRender();
      };
      switch (leaf.view) {
          case "players":
              return renderPlayersView({
                  leaf,
                  snapshot,
                  requestRender,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
                  lifecycle,
              });
          case "clanmates":
              return renderClanView({
                  leaf,
                  snapshot,
                  requestRender,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
                  lifecycle,
              });
          case "teams":
              return renderTeamView({
                  leaf,
                  snapshot,
                  requestRender,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
                  lifecycle,
              });
          case "ships":
              return renderShipView({
                  leaf,
                  snapshot,
                  requestRender,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
                  lifecycle,
              });
          case "player":
              return renderPlayerPanelView({
                  leaf,
                  snapshot,
                  requestRender,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
                  lifecycle,
              });
          case "actions":
              return renderActionsDirectoryView({
                  leaf,
                  snapshot,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
              });
          case "actionEditor":
              return renderActionEditorView({
                  leaf,
                  snapshot,
                  existingContainer,
                  lifecycle,
                  actions: viewActions,
              });
          case "runningActions":
              return renderRunningActionsView({
                  leaf,
                  snapshot,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
              });
          case "runningAction":
              return renderRunningActionDetailView({
                  leaf,
                  snapshot,
                  existingContainer,
                  lifecycle,
                  actions: viewActions,
              });
          case "logs":
              return renderLogView({
                  leaf,
                  snapshot,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
              });
          case "overlays":
              return renderOverlayView({
                  leaf,
                  snapshot,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
              });
          default:
              return createElement("div", "text-slate-200 text-sm", "Unsupported view");
      }
  }
  function ensureSortState(leaf, view) {
      const state = leaf.sortStates[view];
      if (state) {
          return state;
      }
      const fallback = { ...DEFAULT_SORT_STATE };
      leaf.sortStates[view] = fallback;
      return fallback;
  }
  function getDefaultDirection(key) {
      switch (key) {
          case "label":
          case "owner":
          case "type":
          case "origin":
          case "current":
          case "destination":
          case "status":
          case "source":
          case "message":
              return "asc";
          case "timestamp":
              return "asc";
          case "level":
              return "desc";
          default:
              return "desc";
      }
  }
  function renderPlayersView(options) {
      const { leaf, snapshot, sortState, onSort, existingContainer, actions } = options;
      const metricsCache = new Map();
      const visibleHeaders = getVisibleHeaders(leaf, leaf.view, TABLE_HEADERS);
      const { container, tbody } = createTableShell({
          sortState,
          onSort,
          existingContainer,
          view: leaf.view,
          headers: visibleHeaders,
      });
      const players = [...snapshot.players].sort((a, b) => comparePlayers({ a, b, sortState, snapshot, metricsCache }));
      for (const player of players) {
          appendPlayerRows({
              player,
              indent: 0,
              leaf,
              snapshot,
              tbody,
              metricsCache,
              actions,
              headers: visibleHeaders,
          });
      }
      registerContextMenuDelegation(container, actions);
      return container;
  }
  function renderClanView(options) {
      const { leaf, snapshot, requestRender, sortState, onSort, existingContainer, actions, } = options;
      const metricsCache = new Map();
      const visibleHeaders = getVisibleHeaders(leaf, leaf.view, TABLE_HEADERS);
      const { container, tbody } = createTableShell({
          sortState,
          onSort,
          existingContainer,
          view: leaf.view,
          headers: visibleHeaders,
      });
      const groups = groupPlayers({
          players: snapshot.players,
          snapshot,
          metricsCache,
          getKey: (player) => extractClanTag(player.name),
          sortState,
      });
      for (const group of groups) {
          appendGroupRows({
              group,
              leaf,
              snapshot,
              tbody,
              requestRender,
              groupType: "clan",
              metricsCache,
              actions,
              headers: visibleHeaders,
          });
      }
      registerContextMenuDelegation(container, actions);
      return container;
  }
  function renderTeamView(options) {
      const { leaf, snapshot, requestRender, sortState, onSort, existingContainer, actions, } = options;
      const metricsCache = new Map();
      const visibleHeaders = getVisibleHeaders(leaf, leaf.view, TABLE_HEADERS);
      const { container, tbody } = createTableShell({
          sortState,
          onSort,
          existingContainer,
          view: leaf.view,
          headers: visibleHeaders,
      });
      const groups = groupPlayers({
          players: snapshot.players,
          snapshot,
          metricsCache,
          getKey: (player) => player.team ?? "Solo",
          sortState,
      });
      for (const group of groups) {
          appendGroupRows({
              group,
              leaf,
              snapshot,
              tbody,
              requestRender,
              groupType: "team",
              metricsCache,
              actions,
              headers: visibleHeaders,
          });
      }
      registerContextMenuDelegation(container, actions);
      return container;
  }
  function renderShipView(options) {
      const { leaf, snapshot, sortState, onSort, existingContainer } = options;
      const visibleHeaders = getVisibleHeaders(leaf, leaf.view, SHIP_HEADERS);
      const { container, tbody } = createTableShell({
          sortState,
          onSort,
          existingContainer,
          view: leaf.view,
          headers: visibleHeaders,
      });
      const playerLookup = new Map(snapshot.players.map((player) => [player.id, player]));
      const ships = [...snapshot.ships].sort((a, b) => compareShips({ a, b, sortState }));
      for (const ship of ships) {
          const rowKey = `ship:${ship.id}`;
          const row = createElement("tr", "hover:bg-slate-800/50 transition-colors");
          applyPersistentHover(row, leaf, rowKey, "bg-slate-800/50");
          row.dataset.rowKey = rowKey;
          for (const column of visibleHeaders) {
              const td = createElement("td", cellClassForColumn(column, getShipExtraCellClass(column.key)));
              switch (column.key) {
                  case "origin":
                      td.appendChild(createCoordinateButton(ship.origin));
                      break;
                  case "current":
                      td.appendChild(createCoordinateButton(ship.current));
                      break;
                  case "destination":
                      td.appendChild(createCoordinateButton(ship.destination));
                      break;
                  case "owner": {
                      const ownerRecord = playerLookup.get(ship.ownerId);
                      td.appendChild(createPlayerNameElement(ship.ownerName, ownerRecord?.position, {
                          className: "inline-flex max-w-full items-center gap-1 text-left text-slate-200 hover:text-sky-200",
                      }));
                      break;
                  }
                  default:
                      td.textContent = getShipCellValue(column.key, ship);
                      break;
              }
              row.appendChild(td);
          }
          tbody.appendChild(row);
      }
      return container;
  }
  function renderPlayerPanelView(options) {
      const { leaf, snapshot, existingContainer } = options;
      const containerClass = "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
      const canReuse = !!existingContainer &&
          existingContainer.dataset.sidebarRole === "player-panel" &&
          existingContainer.dataset.sidebarView === leaf.view;
      const container = canReuse
          ? existingContainer
          : createElement("div", containerClass);
      container.className = containerClass;
      container.dataset.sidebarRole = "player-panel";
      container.dataset.sidebarView = leaf.view;
      const content = createElement("div", "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100");
      const playerId = leaf.selectedPlayerId;
      if (!playerId) {
          content.appendChild(createElement("p", "text-slate-400 italic", "Select a player from any table to view their details."));
      }
      else {
          const player = snapshot.players.find((entry) => entry.id === playerId);
          if (!player) {
              content.appendChild(createElement("p", "text-slate-400 italic", "That player is no longer available in the latest snapshot."));
          }
          else {
              const header = createElement("div", "space-y-3");
              const title = createElement("div", "flex flex-wrap items-baseline justify-between gap-3");
              const name = createPlayerNameElement(player.name, player.position, {
                  asBlock: true,
                  className: "text-lg font-semibold text-slate-100 transition-colors hover:text-sky-200",
              });
              title.appendChild(name);
              const meta = [player.clan, player.team].filter(Boolean).join(" • ");
              if (meta) {
                  title.appendChild(createElement("div", "text-xs uppercase tracking-wide text-slate-400", meta));
              }
              header.appendChild(title);
              const summary = createElement("div", "grid gap-3 sm:grid-cols-3 text-[0.75rem]");
              summary.appendChild(createSummaryStat("Tiles", formatNumber(player.tiles)));
              summary.appendChild(createSummaryStat("Gold", formatNumber(player.gold)));
              summary.appendChild(createSummaryStat("Troops", formatTroopCount(player.troops)));
              header.appendChild(summary);
              const playerStoppedBySelf = isTradeStoppedBySelf(player);
              const playerStoppedByOther = isTradeStoppedByOther(player);
              if (playerStoppedBySelf || playerStoppedByOther) {
                  let tradeMessage = "Trading is currently stopped with this player.";
                  if (playerStoppedBySelf && playerStoppedByOther) {
                      tradeMessage =
                          "Trading is currently stopped by both you and this player.";
                  }
                  else if (playerStoppedBySelf) {
                      tradeMessage = "You have stopped trading with this player.";
                  }
                  else {
                      tradeMessage = "This player has stopped trading with you.";
                  }
                  header.appendChild(createElement("p", "text-[0.7rem] font-semibold uppercase tracking-wide text-amber-300", tradeMessage));
              }
              content.appendChild(header);
              content.appendChild(renderPlayerDetails(player, snapshot));
          }
      }
      container.replaceChildren(content);
      return container;
  }
  function renderActionsDirectoryView(options) {
      const { leaf, snapshot, existingContainer, actions, sortState, onSort } = options;
      const state = getActionsState(snapshot);
      const signature = `${state.revision}:${state.selectedActionId ?? ""}:${state.running.length}`;
      const sortSignature = `${sortState.key}:${sortState.direction}`;
      const isDirectoryContainer = !!existingContainer &&
          existingContainer.dataset.sidebarRole === "actions-directory";
      const visibleHeaders = getVisibleHeaders(leaf, leaf.view, ACTIONS_TABLE_HEADERS);
      const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
      if (isDirectoryContainer &&
          existingContainer.dataset.signature === signature &&
          existingContainer.dataset.sortState === sortSignature &&
          existingContainer.dataset.columnVisibilitySignature === visibilitySignature) {
          existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
          return existingContainer;
      }
      const { container, tbody } = createTableShell({
          sortState,
          onSort,
          existingContainer: isDirectoryContainer ? existingContainer : undefined,
          view: leaf.view,
          headers: visibleHeaders,
          role: "actions-directory",
      });
      container.dataset.signature = signature;
      container.dataset.sortState = sortSignature;
      container.dataset.columnVisibilitySignature = visibilitySignature;
      const runningLookup = new Set(state.running.map((run) => run.actionId));
      const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
      const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
      const getStatusRank = (action) => {
          if (runningLookup.has(action.id)) {
              return 0;
          }
          return action.enabled ? 1 : 2;
      };
      const getEnabledRank = (action) => action.enabled ? 0 : 1;
      if (state.actions.length === 0) {
          const row = createElement("tr", "hover:bg-transparent");
          const cell = createElement("td", `${cellBaseClass} text-center text-slate-400`, "No actions yet. Create a new action to get started.");
          cell.colSpan = Math.max(1, visibleHeaders.length);
          row.appendChild(cell);
          tbody.appendChild(row);
      }
      else {
          const sortedActions = [...state.actions];
          if (sortState.key === "label") {
              sortedActions.sort((a, b) => compareSortValues(a.name.toLowerCase(), b.name.toLowerCase(), sortState.direction));
          }
          else if (sortState.key === "status") {
              sortedActions.sort((a, b) => {
                  const cmp = compareSortValues(getStatusRank(a), getStatusRank(b), sortState.direction);
                  if (cmp !== 0) {
                      return cmp;
                  }
                  return compareSortValues(a.name.toLowerCase(), b.name.toLowerCase(), "asc");
              });
          }
          else if (sortState.key === "enabled") {
              sortedActions.sort((a, b) => {
                  const cmp = compareSortValues(getEnabledRank(a), getEnabledRank(b), sortState.direction);
                  if (cmp !== 0) {
                      return cmp;
                  }
                  return compareSortValues(a.name.toLowerCase(), b.name.toLowerCase(), "asc");
              });
          }
          for (const action of sortedActions) {
              const isSelected = state.selectedActionId === action.id;
              const isRunning = runningLookup.has(action.id);
              const row = createElement("tr", "cursor-pointer transition-colors hover:bg-slate-800/40");
              applyRowSelectionIndicator(row, isSelected);
              row.dataset.actionId = action.id;
              row.addEventListener("click", () => {
                  actions.selectAction?.(action.id);
              });
              const nameCell = createElement("td", `${cellBaseClass} text-left`);
              const nameLine = createElement("div", "flex flex-wrap items-center gap-2");
              const nameLabel = createPlayerNameElement(action.name, undefined, {
                  className: "font-semibold text-slate-100 transition-colors hover:text-sky-200",
              });
              nameLine.appendChild(nameLabel);
              nameCell.appendChild(nameLine);
              const statusCell = createElement("td", `${cellBaseClass} text-left`);
              const statusBadges = createElement("div", "flex flex-wrap items-center gap-2");
              const updateStatusBadges = (enabled) => {
                  statusBadges.replaceChildren();
                  if (isRunning) {
                      statusBadges.appendChild(createActionStatusBadge("Running"));
                  }
                  if (!enabled) {
                      statusBadges.appendChild(createActionStatusBadge("Disabled"));
                  }
                  else if (!isRunning) {
                      statusBadges.appendChild(createActionStatusBadge("Enabled"));
                  }
              };
              let currentEnabled = action.enabled;
              updateStatusBadges(currentEnabled);
              statusCell.appendChild(statusBadges);
              if (visibleKeys.has("status")) {
                  row.appendChild(statusCell);
              }
              const toggleCell = createElement("td", `${cellBaseClass} text-center`);
              const toggleWrapper = createElement("div", "flex justify-center");
              const toggleButton = createElement("button", "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60");
              toggleButton.type = "button";
              toggleButton.setAttribute("role", "switch");
              const srToggleLabel = createElement("span", "sr-only", "Toggle action");
              const toggleKnob = createElement("span", "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out");
              toggleButton.appendChild(srToggleLabel);
              toggleButton.appendChild(toggleKnob);
              const runButton = createElement("button", "rounded-md border border-sky-500/50 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/20", "Run");
              runButton.type = "button";
              const updateRunButton = (enabled) => {
                  if (enabled) {
                      runButton.disabled = false;
                      runButton.classList.remove("cursor-not-allowed", "opacity-40", "pointer-events-none", "hover:bg-sky-500/10");
                      runButton.classList.add("hover:bg-sky-500/20");
                      runButton.title = "";
                  }
                  else {
                      runButton.disabled = true;
                      runButton.classList.add("cursor-not-allowed", "opacity-40", "pointer-events-none", "hover:bg-sky-500/10");
                      runButton.classList.remove("hover:bg-sky-500/20");
                      runButton.title = "Enable this action to run it.";
                  }
              };
              updateRunButton(currentEnabled);
              runButton.addEventListener("click", (event) => {
                  event.stopPropagation();
                  if (!currentEnabled) {
                      return;
                  }
                  actions.startAction?.(action.id);
              });
              const editButton = createElement("button", "rounded-md border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-sky-200", "Edit");
              editButton.type = "button";
              editButton.addEventListener("click", (event) => {
                  event.stopPropagation();
                  actions.selectAction?.(action.id);
              });
              const updateToggleAppearance = (enabled) => {
                  toggleButton.setAttribute("aria-checked", enabled ? "true" : "false");
                  toggleButton.classList.toggle("border-emerald-400/60", enabled);
                  toggleButton.classList.toggle("bg-emerald-500/40", enabled);
                  toggleButton.classList.toggle("hover:bg-emerald-500/50", enabled);
                  toggleButton.classList.toggle("border-slate-700", !enabled);
                  toggleButton.classList.toggle("bg-slate-800/70", !enabled);
                  toggleButton.classList.toggle("hover:bg-slate-700/80", !enabled);
                  toggleKnob.classList.toggle("bg-emerald-100", enabled);
                  toggleKnob.classList.toggle("bg-slate-300", !enabled);
                  toggleKnob.style.transform = enabled
                      ? "translateX(1.5rem)"
                      : "translateX(0)";
                  toggleButton.title = enabled
                      ? "Disable this action"
                      : "Enable this action";
              };
              updateToggleAppearance(currentEnabled);
              toggleButton.addEventListener("click", (event) => {
                  event.stopPropagation();
                  currentEnabled = !currentEnabled;
                  updateToggleAppearance(currentEnabled);
                  updateRunButton(currentEnabled);
                  updateStatusBadges(currentEnabled);
                  actions.setActionEnabled?.(action.id, currentEnabled);
              });
              toggleWrapper.appendChild(toggleButton);
              toggleCell.appendChild(toggleWrapper);
              if (visibleKeys.has("toggle")) {
                  row.appendChild(toggleCell);
              }
              const controlsCell = createElement("td", `${cellBaseClass} text-right`);
              const controls = createElement("div", "flex justify-end gap-2");
              controls.appendChild(runButton);
              controls.appendChild(editButton);
              controlsCell.appendChild(controls);
              if (visibleKeys.has("controls")) {
                  row.appendChild(controlsCell);
              }
              if (visibleKeys.has("name")) {
                  row.insertBefore(nameCell, row.firstChild);
              }
              tbody.appendChild(row);
          }
      }
      return container;
  }
  function renderActionEditorView(options) {
      const { leaf, snapshot, existingContainer, actions } = options;
      const state = getActionsState(snapshot);
      const selectedAction = state.actions.find((action) => action.id === state.selectedActionId);
      const signature = selectedAction
          ? `${state.revision}:${selectedAction.id}:${selectedAction.updatedAtMs}`
          : `${state.revision}:none`;
      const prior = existingContainer;
      const isEditorContainer = !!prior && prior.dataset.sidebarRole === "action-editor";
      const container = isEditorContainer
          ? prior
          : createElement("div", "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm");
      container.className =
          "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
      container.dataset.sidebarRole = "action-editor";
      container.dataset.sidebarView = leaf.view;
      if (container.dataset.signature === signature) {
          return container;
      }
      container.dataset.signature = signature;
      container.formState = undefined;
      if (!selectedAction) {
          container.replaceChildren(createElement("div", "flex h-full items-center justify-center p-6 text-center text-sm text-slate-400", state.actions.length === 0
              ? "Create an action to begin editing its script."
              : "Select an action from the Actions view to edit its script and settings."));
          return container;
      }
      const formState = {
          id: selectedAction.id,
          name: selectedAction.name,
          runMode: selectedAction.runMode,
          enabled: selectedAction.enabled,
          description: selectedAction.description ?? "",
          runIntervalTicks: selectedAction.runIntervalTicks ?? 1,
          code: selectedAction.code,
          settings: selectedAction.settings.map((setting) => ({
              id: setting.id ?? nextEditorSettingId(),
              key: setting.key,
              label: setting.label,
              type: setting.type,
              value: setting.value ?? defaultValueForType(setting.type),
          })),
      };
      container.formState = formState;
      const layout = createElement("div", "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100");
      const header = createElement("div", "flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-3");
      const initialTitle = formState.name.trim();
      const titlePreview = createElement("div", "text-lg font-semibold text-slate-100", initialTitle === "" ? "Untitled action" : formState.name);
      const descriptionPreview = createElement("div", "text-sm text-slate-400", formState.description.trim() === ""
          ? "Add a description..."
          : formState.description);
      if (formState.description.trim() === "") {
          descriptionPreview.classList.add("italic", "text-slate-500");
      }
      const headerText = createElement("div", "flex flex-col gap-1");
      headerText.appendChild(titlePreview);
      headerText.appendChild(descriptionPreview);
      header.appendChild(headerText);
      const headerMeta = createElement("div", "flex flex-col items-end gap-2 text-right text-[0.7rem] text-slate-400");
      const enabledToggleWrapper = createElement("div", "flex items-center");
      const enabledToggle = createElement("button", "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60");
      enabledToggle.type = "button";
      enabledToggle.setAttribute("role", "switch");
      const srEnabledLabel = createElement("span", "sr-only", "Toggle action");
      const enabledToggleKnob = createElement("span", "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out");
      enabledToggle.appendChild(srEnabledLabel);
      enabledToggle.appendChild(enabledToggleKnob);
      const updateToggleAppearance = (enabled) => {
          enabledToggle.setAttribute("aria-checked", enabled ? "true" : "false");
          enabledToggle.classList.toggle("border-emerald-400/60", enabled);
          enabledToggle.classList.toggle("bg-emerald-500/40", enabled);
          enabledToggle.classList.toggle("hover:bg-emerald-500/50", enabled);
          enabledToggle.classList.toggle("border-slate-700", !enabled);
          enabledToggle.classList.toggle("bg-slate-800/70", !enabled);
          enabledToggle.classList.toggle("hover:bg-slate-700/80", !enabled);
          enabledToggleKnob.classList.toggle("bg-emerald-100", enabled);
          enabledToggleKnob.classList.toggle("bg-slate-300", !enabled);
          enabledToggleKnob.style.transform = enabled
              ? "translateX(1.5rem)"
              : "translateX(0)";
          enabledToggle.title = enabled
              ? "Disable this action"
              : "Enable this action";
      };
      updateToggleAppearance(formState.enabled);
      enabledToggleWrapper.appendChild(enabledToggle);
      headerMeta.appendChild(enabledToggleWrapper);
      const headerMode = createElement("div", "", describeRunMode(formState.runMode));
      headerMeta.appendChild(headerMode);
      headerMeta.appendChild(createElement("div", "text-[0.65rem] uppercase tracking-wide text-slate-500", `Last updated ${formatTimestamp(selectedAction.updatedAtMs)}`));
      header.appendChild(headerMeta);
      layout.appendChild(header);
      const nameField = createElement("label", "flex flex-col gap-1");
      nameField.appendChild(createElement("span", "text-xs uppercase tracking-wide text-slate-400", "Name"));
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className =
          "rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      nameInput.value = formState.name;
      nameInput.addEventListener("input", () => {
          formState.name = nameInput.value;
          const trimmed = nameInput.value.trim();
          titlePreview.textContent =
              trimmed === "" ? "Untitled action" : nameInput.value;
      });
      nameField.appendChild(nameInput);
      layout.appendChild(nameField);
      const descriptionField = createElement("label", "flex flex-col gap-1");
      descriptionField.appendChild(createElement("span", "text-xs uppercase tracking-wide text-slate-400", "Description"));
      const descriptionInput = document.createElement("textarea");
      descriptionInput.className =
          "min-h-[72px] w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      descriptionInput.value = formState.description;
      descriptionInput.addEventListener("input", () => {
          formState.description = descriptionInput.value;
          const trimmed = descriptionInput.value.trim();
          if (trimmed === "") {
              descriptionPreview.textContent = "Add a description...";
              descriptionPreview.classList.add("italic", "text-slate-500");
          }
          else {
              descriptionPreview.textContent = descriptionInput.value;
              descriptionPreview.classList.remove("italic", "text-slate-500");
          }
      });
      descriptionField.appendChild(descriptionInput);
      layout.appendChild(descriptionField);
      const runConfigRow = createElement("div", "flex flex-wrap gap-4");
      const modeField = createElement("label", "flex flex-col gap-1");
      modeField.appendChild(createElement("span", "text-xs uppercase tracking-wide text-slate-400", "Run mode"));
      const modeSelect = document.createElement("select");
      modeSelect.className =
          "w-48 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      for (const option of [
          { value: "continuous", label: "Continuous" },
          { value: "once", label: "Run once" },
          { value: "event", label: "Event-driven" },
      ]) {
          const opt = document.createElement("option");
          opt.value = option.value;
          opt.textContent = option.label;
          modeSelect.appendChild(opt);
      }
      modeSelect.value = formState.runMode;
      modeField.appendChild(modeSelect);
      runConfigRow.appendChild(modeField);
      const intervalField = createElement("label", "flex flex-col gap-1");
      intervalField.appendChild(createElement("span", "text-xs uppercase tracking-wide text-slate-400", "Run every (ticks)"));
      const intervalInput = document.createElement("input");
      intervalInput.type = "number";
      intervalInput.min = "1";
      intervalInput.className =
          "w-40 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      intervalInput.value = String(formState.runIntervalTicks);
      intervalInput.addEventListener("change", () => {
          const numeric = Number(intervalInput.value);
          const normalized = Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
          intervalInput.value = String(normalized);
          formState.runIntervalTicks = normalized;
      });
      intervalField.appendChild(intervalInput);
      if (formState.runMode !== "continuous") {
          intervalField.classList.add("hidden");
      }
      runConfigRow.appendChild(intervalField);
      modeSelect.addEventListener("change", () => {
          formState.runMode = modeSelect.value;
          headerMode.textContent = describeRunMode(formState.runMode);
          intervalField.classList.toggle("hidden", formState.runMode !== "continuous");
      });
      layout.appendChild(runConfigRow);
      const codeField = createElement("div", "flex flex-col gap-2");
      codeField.appendChild(createElement("span", "text-xs uppercase tracking-wide text-slate-400", "Script"));
      const codeArea = document.createElement("textarea");
      codeArea.className =
          "min-h-[220px] w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      codeArea.value = formState.code;
      codeArea.spellcheck = false;
      codeArea.addEventListener("input", () => {
          formState.code = codeArea.value;
      });
      codeField.appendChild(codeArea);
      layout.appendChild(codeField);
      const settingsSection = createElement("div", "flex flex-col gap-3");
      const settingsHeader = createElement("div", "flex items-center justify-between gap-2");
      settingsHeader.appendChild(createElement("span", "text-xs uppercase tracking-wide text-slate-400", "Settings"));
      const settingsList = createElement("div", "flex flex-col gap-3");
      const removeSetting = (settingId) => {
          const index = formState.settings.findIndex((entry) => entry.id === settingId);
          if (index !== -1) {
              formState.settings.splice(index, 1);
          }
      };
      for (const setting of formState.settings) {
          settingsList.appendChild(createActionSettingEditorCard(formState, setting, removeSetting));
      }
      const addSettingButton = createElement("button", "rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-sky-200", "Add setting");
      addSettingButton.type = "button";
      addSettingButton.addEventListener("click", () => {
          const newSetting = {
              id: nextEditorSettingId(),
              key: "",
              label: "",
              type: "text",
              value: "",
          };
          formState.settings.push(newSetting);
          settingsList.appendChild(createActionSettingEditorCard(formState, newSetting, removeSetting));
      });
      settingsHeader.appendChild(addSettingButton);
      settingsSection.appendChild(settingsHeader);
      if (formState.settings.length === 0) {
          settingsSection.appendChild(createElement("p", "text-[0.75rem] text-slate-400", "Add settings to expose configurable values that can be adjusted while the action runs."));
      }
      settingsSection.appendChild(settingsList);
      layout.appendChild(settingsSection);
      const footer = createElement("div", "flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70 pt-4");
      const leftControls = createElement("div", "flex items-center gap-2");
      const runButton = createElement("button", "rounded-md border border-sky-500/60 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/20", "Run action");
      runButton.type = "button";
      const applyRunButtonState = (enabled) => {
          if (enabled) {
              runButton.disabled = false;
              runButton.classList.remove("cursor-not-allowed", "opacity-40", "pointer-events-none", "hover:bg-sky-500/10");
              runButton.classList.add("hover:bg-sky-500/20");
              runButton.title = "";
          }
          else {
              runButton.disabled = true;
              runButton.classList.add("cursor-not-allowed", "opacity-40", "pointer-events-none", "hover:bg-sky-500/10");
              runButton.classList.remove("hover:bg-sky-500/20");
              runButton.title = "Enable this action to run it.";
          }
      };
      applyRunButtonState(formState.enabled);
      runButton.addEventListener("click", () => {
          if (!formState.enabled) {
              return;
          }
          actions.startAction?.(selectedAction.id);
      });
      leftControls.appendChild(runButton);
      enabledToggle.addEventListener("click", () => {
          const nextEnabled = !formState.enabled;
          formState.enabled = nextEnabled;
          updateToggleAppearance(nextEnabled);
          applyRunButtonState(nextEnabled);
          actions.setActionEnabled?.(selectedAction.id, nextEnabled);
      });
      footer.appendChild(leftControls);
      const rightControls = createElement("div", "flex items-center gap-2");
      const deleteButton = createElement("button", "rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20", "Delete");
      deleteButton.type = "button";
      deleteButton.addEventListener("click", () => {
          actions.deleteAction?.(selectedAction.id);
      });
      const saveButton = createElement("button", "rounded-md border border-sky-500/60 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/30", "Save changes");
      saveButton.type = "button";
      saveButton.addEventListener("click", () => {
          const update = {
              name: formState.name,
              code: formState.code,
              runMode: formState.runMode,
              enabled: formState.enabled,
              description: formState.description,
              runIntervalTicks: formState.runIntervalTicks,
              settings: formState.settings.map((setting) => ({
                  id: setting.id,
                  key: setting.key,
                  label: setting.label,
                  type: setting.type,
                  value: setting.type === "number"
                      ? Number(setting.value)
                      : setting.type === "toggle"
                          ? Boolean(setting.value)
                          : String(setting.value ?? ""),
              })),
          };
          actions.saveAction?.(selectedAction.id, update);
      });
      rightControls.appendChild(deleteButton);
      rightControls.appendChild(saveButton);
      footer.appendChild(rightControls);
      layout.appendChild(footer);
      container.replaceChildren(layout);
      return container;
  }
  function renderRunningActionsView(options) {
      const { leaf, snapshot, existingContainer, actions, sortState, onSort } = options;
      const state = getActionsState(snapshot);
      const signature = `${state.runningRevision}:${state.selectedRunningActionId ?? ""}:${state.running.length}`;
      const sortSignature = `${sortState.key}:${sortState.direction}`;
      const isContainer = !!existingContainer &&
          existingContainer.dataset.sidebarRole === "running-actions";
      const visibleHeaders = getVisibleHeaders(leaf, leaf.view, RUNNING_ACTIONS_TABLE_HEADERS);
      const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
      if (isContainer &&
          existingContainer.dataset.signature === signature &&
          existingContainer.dataset.sortState === sortSignature &&
          existingContainer.dataset.columnVisibilitySignature === visibilitySignature) {
          existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
          return existingContainer;
      }
      const { container, tbody } = createTableShell({
          sortState,
          onSort,
          existingContainer: isContainer ? existingContainer : undefined,
          view: leaf.view,
          headers: visibleHeaders,
          role: "running-actions",
      });
      container.dataset.signature = signature;
      container.dataset.sortState = sortSignature;
      container.dataset.columnVisibilitySignature = visibilitySignature;
      const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
      const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
      const getStatusRank = (run) => {
          const rank = {
              running: 0,
              completed: 1,
              stopped: 2,
              failed: 3,
          };
          return rank[run.status] ?? 4;
      };
      if (state.running.length === 0) {
          const row = createElement("tr", "hover:bg-transparent");
          const cell = createElement("td", `${cellBaseClass} text-center text-slate-400`, "No actions are currently running.");
          cell.colSpan = Math.max(1, visibleHeaders.length);
          row.appendChild(cell);
          tbody.appendChild(row);
          return container;
      }
      const runs = [...state.running];
      if (sortState.key === "label") {
          runs.sort((a, b) => compareSortValues(a.name.toLowerCase(), b.name.toLowerCase(), sortState.direction));
      }
      else if (sortState.key === "status") {
          runs.sort((a, b) => {
              const cmp = compareSortValues(getStatusRank(a), getStatusRank(b), sortState.direction);
              if (cmp !== 0) {
                  return cmp;
              }
              return compareSortValues(a.name.toLowerCase(), b.name.toLowerCase(), "asc");
          });
      }
      for (const run of runs) {
          const isSelected = state.selectedRunningActionId === run.id;
          const row = createElement("tr", "cursor-pointer transition-colors hover:bg-slate-800/40");
          applyRowSelectionIndicator(row, isSelected);
          row.dataset.runningActionId = run.id;
          row.addEventListener("click", () => {
              actions.selectRunningAction?.(run.id);
          });
          const nameCell = createElement("td", `${cellBaseClass} text-left`);
          const nameLine = createElement("div", "flex flex-wrap items-center gap-2");
          const nameLabel = createPlayerNameElement(run.name, undefined, {
              className: "font-semibold text-slate-100 transition-colors hover:text-sky-200",
          });
          nameLine.appendChild(nameLabel);
          nameCell.appendChild(nameLine);
          const statusCell = createElement("td", `${cellBaseClass} text-left`);
          statusCell.appendChild(createRunStatusBadge(run.status));
          const modeCell = createElement("td", `${cellBaseClass} text-[0.75rem] uppercase tracking-wide text-slate-400`, getRunModeLabel(run.runMode));
          const startedCell = createElement("td", `${cellBaseClass} text-[0.75rem] text-slate-300`, formatTimestamp(run.startedAtMs));
          const controlsCell = createElement("td", `${cellBaseClass} text-right`);
          const stopButton = createElement("button", "rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20", "Stop");
          stopButton.type = "button";
          stopButton.addEventListener("click", (event) => {
              event.stopPropagation();
              actions.stopRunningAction?.(run.id);
          });
          if (run.status !== "running") {
              stopButton.disabled = true;
              stopButton.classList.add("cursor-not-allowed", "opacity-50");
          }
          controlsCell.appendChild(stopButton);
          if (visibleKeys.has("name")) {
              row.appendChild(nameCell);
          }
          if (visibleKeys.has("status")) {
              row.appendChild(statusCell);
          }
          if (visibleKeys.has("mode")) {
              row.appendChild(modeCell);
          }
          if (visibleKeys.has("started")) {
              row.appendChild(startedCell);
          }
          if (visibleKeys.has("controls")) {
              row.appendChild(controlsCell);
          }
          tbody.appendChild(row);
      }
      return container;
  }
  function renderRunningActionDetailView(options) {
      const { leaf, snapshot, existingContainer, actions } = options;
      const state = getActionsState(snapshot);
      const selectedRun = state.running.find((run) => run.id === state.selectedRunningActionId);
      const signature = selectedRun
          ? `${state.runningRevision}:${selectedRun.id}:${selectedRun.lastUpdatedMs}`
          : `${state.runningRevision}:none`;
      const isContainer = !!existingContainer &&
          existingContainer.dataset.sidebarRole === "running-action";
      const container = isContainer
          ? existingContainer
          : createElement("div", "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm");
      container.className =
          "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
      container.dataset.sidebarRole = "running-action";
      container.dataset.sidebarView = leaf.view;
      if (container.dataset.signature === signature) {
          return container;
      }
      container.dataset.signature = signature;
      if (!selectedRun) {
          container.replaceChildren(createElement("div", "flex h-full items-center justify-center p-6 text-center text-sm text-slate-400", state.running.length === 0
              ? "No actions are currently running."
              : "Select a running action to adjust its settings."));
          return container;
      }
      const layout = createElement("div", "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100");
      const header = createElement("div", "flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-3");
      const headerText = createElement("div", "flex flex-col gap-1");
      const titleLine = createElement("div", "flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-100");
      titleLine.appendChild(createElement("span", "", selectedRun.name));
      titleLine.appendChild(createRunStatusBadge(selectedRun.status));
      headerText.appendChild(titleLine);
      const trimmedDescription = selectedRun.description?.trim() ?? "";
      if (trimmedDescription !== "") {
          headerText.appendChild(createElement("div", "text-sm text-slate-400", trimmedDescription));
      }
      headerText.appendChild(createElement("div", "text-[0.7rem] text-slate-400", describeRunMode(selectedRun.runMode)));
      header.appendChild(headerText);
      const stopButton = createElement("button", "rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20", "Stop action");
      stopButton.type = "button";
      stopButton.addEventListener("click", () => {
          actions.stopRunningAction?.(selectedRun.id);
      });
      if (selectedRun.status !== "running") {
          stopButton.disabled = true;
          stopButton.classList.add("cursor-not-allowed", "opacity-50");
      }
      header.appendChild(stopButton);
      layout.appendChild(header);
      const meta = createElement("div", "grid gap-3 text-[0.75rem] sm:grid-cols-3");
      meta.appendChild(createSummaryStat("Status", formatRunStatus(selectedRun.status)));
      meta.appendChild(createSummaryStat("Started", formatTimestamp(selectedRun.startedAtMs)));
      meta.appendChild(createSummaryStat("Last update", formatTimestamp(selectedRun.lastUpdatedMs)));
      layout.appendChild(meta);
      if (selectedRun.runMode === "continuous") {
          const intervalField = createElement("label", "flex w-full max-w-xs flex-col gap-1");
          intervalField.appendChild(createElement("span", "text-xs uppercase tracking-wide text-slate-400", "Run every (ticks)"));
          const intervalInput = document.createElement("input");
          intervalInput.type = "number";
          intervalInput.min = "1";
          intervalInput.className =
              "w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
          intervalInput.value = String(selectedRun.runIntervalTicks ?? 1);
          intervalInput.addEventListener("change", () => {
              const numeric = Number(intervalInput.value);
              const normalized = Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
              intervalInput.value = String(normalized);
              if (normalized === selectedRun.runIntervalTicks) {
                  return;
              }
              actions.setRunningActionInterval?.(selectedRun.id, normalized);
          });
          intervalField.appendChild(intervalInput);
          layout.appendChild(intervalField);
      }
      const settingsSection = createElement("div", "flex flex-col gap-3");
      settingsSection.appendChild(createElement("span", "text-xs uppercase tracking-wide text-slate-400", "Runtime settings"));
      const settingsList = createElement("div", "flex flex-col gap-3");
      if (selectedRun.settings.length === 0) {
          settingsList.appendChild(createElement("p", "text-[0.75rem] text-slate-400", "This action does not expose any runtime settings."));
      }
      else {
          for (const setting of selectedRun.settings) {
              settingsList.appendChild(createRunningSettingField(selectedRun.id, setting, actions));
          }
      }
      settingsSection.appendChild(settingsList);
      layout.appendChild(settingsSection);
      container.replaceChildren(layout);
      return container;
  }
  const LOG_TABLE_HEADERS = [
      {
          key: "timestamp",
          label: "Timestamp",
          align: "left",
          sortKey: "timestamp",
          hideable: false,
      },
      { key: "level", label: "Level", align: "center", sortKey: "level" },
      { key: "source", label: "Source", align: "left", sortKey: "source" },
      { key: "message", label: "Message", align: "left", sortKey: "message" },
  ];
  const ACTIONS_TABLE_HEADERS = [
      {
          key: "name",
          label: "Action",
          align: "left",
          sortKey: "label",
          hideable: false,
      },
      { key: "status", label: "Status", align: "left", sortKey: "status" },
      { key: "toggle", label: "Enabled", align: "center", sortKey: "enabled" },
      { key: "controls", label: "Actions", align: "right", sortable: false },
  ];
  const RUNNING_ACTIONS_TABLE_HEADERS = [
      {
          key: "name",
          label: "Action",
          align: "left",
          sortKey: "label",
          hideable: false,
      },
      { key: "status", label: "Status", align: "left", sortKey: "status" },
      { key: "mode", label: "Mode", align: "left", sortable: false },
      { key: "started", label: "Started", align: "left", sortable: false },
      { key: "controls", label: "", align: "right", sortable: false },
  ];
  const OVERLAY_TABLE_HEADERS = [
      {
          key: "name",
          label: "Overlay",
          align: "left",
          sortKey: "label",
          hideable: false,
      },
      { key: "status", label: "Status", align: "right", sortKey: "status" },
  ];
  function getTableHeadersForView(view) {
      switch (view) {
          case "players":
          case "clanmates":
          case "teams":
              return TABLE_HEADERS;
          case "ships":
              return SHIP_HEADERS;
          case "actions":
              return ACTIONS_TABLE_HEADERS;
          case "runningActions":
              return RUNNING_ACTIONS_TABLE_HEADERS;
          case "logs":
              return LOG_TABLE_HEADERS;
          case "overlays":
              return OVERLAY_TABLE_HEADERS;
          default:
              return undefined;
      }
  }
  function renderOverlayView(options) {
      const { leaf, snapshot, existingContainer, actions, sortState, onSort } = options;
      const overlays = snapshot.sidebarOverlays ?? [];
      const revision = snapshot.sidebarOverlayRevision ?? 0;
      const signature = `${revision}:${overlays
        .map((overlay) => `${overlay.id}:${overlay.enabled ? 1 : 0}`)
        .join("|")}`;
      const sortSignature = `${sortState.key}:${sortState.direction}`;
      const isOverlayContainer = !!existingContainer &&
          existingContainer.dataset.sidebarRole === "overlays-directory";
      const visibleHeaders = getVisibleHeaders(leaf, leaf.view, OVERLAY_TABLE_HEADERS);
      const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
      if (isOverlayContainer &&
          existingContainer.dataset.signature === signature &&
          existingContainer.dataset.sortState === sortSignature &&
          existingContainer.dataset.columnVisibilitySignature === visibilitySignature) {
          existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
          return existingContainer;
      }
      const { container, tbody } = createTableShell({
          sortState,
          onSort,
          existingContainer: isOverlayContainer ? existingContainer : undefined,
          view: leaf.view,
          headers: visibleHeaders,
          role: "overlays-directory",
      });
      container.dataset.signature = signature;
      container.dataset.sortState = sortSignature;
      container.dataset.columnVisibilitySignature = visibilitySignature;
      const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
      const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
      if (overlays.length === 0) {
          const row = createElement("tr", "hover:bg-transparent");
          const cell = createElement("td", `${cellBaseClass} text-center text-slate-400`, "No overlays available.");
          cell.colSpan = Math.max(1, visibleHeaders.length);
          row.appendChild(cell);
          tbody.appendChild(row);
          return container;
      }
      const sortedOverlays = [...overlays];
      if (sortState.key === "label") {
          sortedOverlays.sort((a, b) => compareSortValues(a.label.toLowerCase(), b.label.toLowerCase(), sortState.direction));
      }
      else if (sortState.key === "status") {
          sortedOverlays.sort((a, b) => compareSortValues(a.enabled ? 1 : 0, b.enabled ? 1 : 0, sortState.direction));
      }
      for (const overlay of sortedOverlays) {
          const row = createElement("tr", "transition-colors hover:bg-slate-800/40");
          const nameCell = createElement("td", `${cellBaseClass} text-left`);
          const nameStack = createElement("div", "flex flex-col gap-1");
          const nameLabel = createElement("span", "font-semibold text-slate-100", overlay.label);
          nameStack.appendChild(nameLabel);
          nameCell.appendChild(nameStack);
          const statusCell = createElement("td", `${cellBaseClass} text-right`);
          const toggleWrapper = createElement("div", "flex justify-end");
          const toggleButton = createElement("button", "relative inline-flex h-6 w-12 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60");
          toggleButton.type = "button";
          toggleButton.setAttribute("role", "switch");
          const srToggleLabel = createElement("span", "sr-only", "Toggle overlay");
          const toggleKnob = createElement("span", "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out");
          toggleButton.appendChild(srToggleLabel);
          toggleButton.appendChild(toggleKnob);
          const updateToggleAppearance = (enabled) => {
              toggleButton.setAttribute("aria-checked", enabled ? "true" : "false");
              toggleButton.classList.toggle("border-emerald-400/60", enabled);
              toggleButton.classList.toggle("bg-emerald-500/40", enabled);
              toggleButton.classList.toggle("hover:bg-emerald-500/50", enabled);
              toggleButton.classList.toggle("border-slate-700", !enabled);
              toggleButton.classList.toggle("bg-slate-800/70", !enabled);
              toggleButton.classList.toggle("hover:bg-slate-700/80", !enabled);
              toggleKnob.classList.toggle("bg-emerald-100", enabled);
              toggleKnob.classList.toggle("bg-slate-300", !enabled);
              toggleKnob.style.transform = enabled
                  ? "translateX(1.5rem)"
                  : "translateX(0)";
              toggleButton.title = enabled ? "Disable overlay" : "Enable overlay";
          };
          let currentEnabled = overlay.enabled;
          updateToggleAppearance(currentEnabled);
          toggleButton.addEventListener("click", (event) => {
              event.stopPropagation();
              currentEnabled = !currentEnabled;
              updateToggleAppearance(currentEnabled);
              actions.setOverlayEnabled?.(overlay.id, currentEnabled);
          });
          toggleWrapper.appendChild(toggleButton);
          statusCell.appendChild(toggleWrapper);
          if (visibleKeys.has("status")) {
              row.appendChild(statusCell);
          }
          if (visibleKeys.has("name")) {
              row.insertBefore(nameCell, row.firstChild);
          }
          tbody.appendChild(row);
      }
      return container;
  }
  function renderLogView(options) {
      const { leaf, snapshot, existingContainer, actions, sortState, onSort } = options;
      const logActions = actions ?? DEFAULT_ACTIONS;
      const logs = snapshot.sidebarLogs ?? [];
      const revision = snapshot.sidebarLogRevision ?? 0;
      const followEnabled = leaf.logFollowEnabled !== false;
      const supportedSortKeys = [
          "timestamp",
          "level",
          "source",
          "message",
      ];
      let activeSortState = sortState;
      if (!supportedSortKeys.includes(sortState.key)) {
          const fallbackDirection = getDefaultDirection("timestamp");
          activeSortState = { key: "timestamp", direction: fallbackDirection };
          leaf.sortStates[leaf.view] = activeSortState;
      }
      const sortSignature = `${activeSortState.key}:${activeSortState.direction}`;
      const isLogContainer = !!existingContainer && existingContainer.dataset.sidebarRole === "log-view";
      const visibleHeaders = getVisibleHeaders(leaf, leaf.view, LOG_TABLE_HEADERS);
      const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
      if (isLogContainer) {
          existingContainer.dataset.logFollowState = followEnabled
              ? "following"
              : "paused";
          existingContainer.dataset.logStickToBottom = followEnabled
              ? "true"
              : "false";
          const previousRevision = Number(existingContainer.dataset.logRevision ?? "-1");
          const previousSortState = existingContainer.dataset.sortState ?? "";
          const previousVisibility = existingContainer.dataset.columnVisibilitySignature ?? "";
          if (previousRevision === revision &&
              previousSortState === sortSignature &&
              previousVisibility === visibilitySignature) {
              existingContainer.dataset.logRevision = String(revision);
              existingContainer.dataset.sortState = sortSignature;
              existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
              return existingContainer;
          }
      }
      const { container, tbody } = createTableShell({
          sortState: activeSortState,
          onSort,
          existingContainer: isLogContainer ? existingContainer : undefined,
          view: leaf.view,
          headers: visibleHeaders,
          role: "log-view",
      });
      container.dataset.logFollowState = followEnabled ? "following" : "paused";
      container.dataset.logStickToBottom = followEnabled ? "true" : "false";
      container.dataset.logRevision = String(revision);
      container.dataset.sortState = sortSignature;
      container.dataset.columnVisibilitySignature = visibilitySignature;
      const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
      if (logs.length === 0) {
          const emptyRow = createElement("tr");
          const emptyCell = createElement("td", `${TABLE_CELL_BASE_CLASS} py-8 text-center text-[0.75rem] italic text-slate-500`, "No log messages yet.");
          emptyCell.colSpan = Math.max(1, visibleHeaders.length);
          emptyRow.appendChild(emptyCell);
          tbody.appendChild(emptyRow);
      }
      else {
          const sortedLogs = [...logs];
          switch (activeSortState.key) {
              case "timestamp":
                  sortedLogs.sort((a, b) => compareSortValues(a.timestampMs, b.timestampMs, activeSortState.direction));
                  break;
              case "level":
                  sortedLogs.sort((a, b) => compareSortValues(getLogLevelWeight(a.level), getLogLevelWeight(b.level), activeSortState.direction));
                  break;
              case "source":
                  sortedLogs.sort((a, b) => compareSortValues((a.source ?? "").toLowerCase(), (b.source ?? "").toLowerCase(), activeSortState.direction));
                  break;
              case "message":
                  sortedLogs.sort((a, b) => compareSortValues(getLogMessageSortValue(a), getLogMessageSortValue(b), activeSortState.direction));
                  break;
          }
          for (const entry of sortedLogs) {
              tbody.appendChild(renderLogRow(entry, logActions, visibleKeys));
          }
      }
      return container;
  }
  function renderLogRow(entry, actions, visibleKeys) {
      const row = createElement("tr", "transition-colors hover:bg-slate-900/40");
      row.dataset.sidebarRole = "log-entry";
      row.dataset.logEntryId = entry.id;
      row.dataset.logLevel = entry.level;
      row.dataset.logTimestamp = String(entry.timestampMs);
      row.style.boxShadow = `inset 0.25rem 0 0 0 ${getLogAccentColor(entry.level)}`;
      const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
      const timestampCell = createElement("td", `${cellBaseClass} font-mono text-[0.75rem] text-slate-300 whitespace-nowrap`, formatTimestamp(entry.timestampMs));
      const levelCell = createElement("td", `${cellBaseClass} text-center`);
      const levelBadge = createElement("span", `inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${getLogLevelBadgeClass(entry.level)}`, entry.level.toUpperCase());
      levelCell.appendChild(levelBadge);
      const hasSource = !!entry.source && entry.source.trim().length > 0;
      const sourceCell = createElement("td", `${cellBaseClass} text-[0.75rem] text-slate-400 whitespace-nowrap`, hasSource ? entry.source : "–");
      const messageCellClass = `${cellBaseClass} font-mono text-[0.75rem] whitespace-pre-wrap break-words `;
      const messageCell = createElement("td", `${messageCellClass}${getLogMessageClass(entry.level)}`);
      if (entry.tokens && entry.tokens.length > 0) {
          messageCell.appendChild(renderLogTokens(entry.tokens, actions));
      }
      else {
          messageCell.textContent = entry.message;
      }
      if (visibleKeys.has("timestamp")) {
          row.appendChild(timestampCell);
      }
      if (visibleKeys.has("level")) {
          row.appendChild(levelCell);
      }
      if (visibleKeys.has("source")) {
          row.appendChild(sourceCell);
      }
      if (visibleKeys.has("message")) {
          row.appendChild(messageCell);
      }
      return row;
  }
  function getLogLevelWeight(level) {
      switch (level) {
          case "error":
              return 3;
          case "warn":
              return 2;
          case "info":
              return 1;
          case "debug":
              return 0;
          default:
              return 0;
      }
  }
  function getLogMessageSortValue(entry) {
      if (entry.tokens && entry.tokens.length > 0) {
          return entry.tokens
              .map((token) => (token.type === "text" ? token.text : token.label))
              .join(" ")
              .toLowerCase();
      }
      return entry.message.toLowerCase();
  }
  function renderLogTokens(tokens, actions) {
      const fragment = document.createDocumentFragment();
      for (const token of tokens) {
          if (token.type === "text") {
              fragment.appendChild(document.createTextNode(token.text));
              continue;
          }
          fragment.appendChild(createLogMentionPill(token, actions));
      }
      return fragment;
  }
  function createLogMentionPill(token, actions) {
      const button = createElement("button", "inline-flex max-w-full items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/40 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-200 transition-colors hover:border-sky-500/70 hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60");
      button.type = "button";
      button.dataset.sidebarRole = "log-mention";
      button.dataset.mentionType = token.type;
      button.dataset.mentionId = token.id;
      if (token.color) {
          button.style.borderColor = token.color;
      }
      if (token.color) {
          const swatch = createElement("span", "h-2 w-2 shrink-0 rounded-full border border-slate-900/70");
          swatch.style.backgroundColor = token.color;
          button.appendChild(swatch);
      }
      const label = createElement("span", "max-w-[10rem] truncate text-left", token.label);
      label.title = token.label;
      button.appendChild(label);
      switch (token.type) {
          case "player":
              button.title = `Focus on ${token.label}`;
              button.addEventListener("click", (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  actions.focusPlayer?.(token.id);
              });
              break;
          case "team":
              button.title = `Show team ${token.label}`;
              button.addEventListener("click", (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  actions.focusTeam?.(token.id);
              });
              break;
          case "clan":
              button.title = `Show clan ${token.label}`;
              button.addEventListener("click", (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  actions.focusClan?.(token.id);
              });
              break;
      }
      return button;
  }
  function getLogLevelBadgeClass(level) {
      switch (level) {
          case "error":
              return "border border-rose-500/40 bg-rose-500/15 text-rose-200";
          case "warn":
              return "border border-amber-400/40 bg-amber-400/15 text-amber-200";
          case "debug":
              return "border border-slate-600/50 bg-slate-800/70 text-slate-300";
          default:
              return "border border-sky-400/40 bg-sky-400/15 text-sky-200";
      }
  }
  function getLogMessageClass(level) {
      switch (level) {
          case "error":
              return "text-rose-200";
          case "warn":
              return "text-amber-200";
          case "debug":
              return "text-slate-400";
          default:
              return "text-slate-200";
      }
  }
  function getLogAccentColor(level) {
      switch (level) {
          case "error":
              return "rgba(248, 113, 113, 0.75)";
          case "warn":
              return "rgba(251, 191, 36, 0.75)";
          case "debug":
              return "rgba(148, 163, 184, 0.55)";
          default:
              return "rgba(56, 189, 248, 0.65)";
      }
  }
  let columnMenuElement = null;
  let columnMenuCleanup = null;
  function ensureColumnMenuElement() {
      if (!columnMenuElement) {
          columnMenuElement = createElement("div");
          columnMenuElement.dataset.sidebarRole = "column-visibility-menu";
          columnMenuElement.style.pointerEvents = "auto";
          columnMenuElement.style.zIndex = "2147483647";
      }
      columnMenuElement.className =
          "fixed z-[2147483647] min-w-[200px] overflow-hidden rounded-md border " +
              "border-slate-700/80 bg-slate-950/95 text-sm text-slate-100 shadow-2xl " +
              "backdrop-blur";
      return columnMenuElement;
  }
  function hideColumnVisibilityMenu() {
      if (columnMenuCleanup) {
          const cleanup = columnMenuCleanup;
          columnMenuCleanup = null;
          cleanup();
          return;
      }
      if (columnMenuElement && columnMenuElement.parentElement) {
          columnMenuElement.parentElement.removeChild(columnMenuElement);
      }
  }
  function isColumnVisibilitySupported(view) {
      const headers = getTableHeadersForView(view);
      return Array.isArray(headers) && headers.length > 0;
  }
  function showColumnVisibilityMenu(options) {
      const { leaf, anchor, onChange } = options;
      const baseHeaders = getTableHeadersForView(leaf.view);
      if (!baseHeaders || baseHeaders.length === 0) {
          hideColumnVisibilityMenu();
          return;
      }
      const visibility = ensureColumnVisibilityState(leaf, leaf.view, baseHeaders);
      const hideableHeaders = baseHeaders.filter((header) => header.hideable !== false);
      hideColumnVisibilityMenu();
      const menu = ensureColumnMenuElement();
      menu.style.visibility = "hidden";
      menu.style.left = "0px";
      menu.style.top = "0px";
      const wrapper = createElement("div", "flex flex-col");
      wrapper.appendChild(createElement("div", "border-b border-slate-800/80 px-3 py-2 text-xs font-semibold uppercase " +
          "tracking-wide text-slate-300", "Columns"));
      const list = createElement("div", "py-1");
      for (const header of baseHeaders) {
          const key = header.key;
          const item = createElement("label", `${header.hideable === false
            ? "cursor-default text-slate-300"
            : "cursor-pointer text-slate-200 hover:bg-slate-800/70"} flex items-center gap-3 px-3 py-2 text-xs transition-colors`);
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className =
              "h-3.5 w-3.5 rounded border border-slate-600 bg-slate-900 text-sky-400 " +
                  "focus:outline-none focus:ring-2 focus:ring-sky-500";
          checkbox.checked = visibility[key] !== false;
          checkbox.disabled = header.hideable === false;
          item.appendChild(checkbox);
          const label = createElement("span", "flex-1 truncate", header.label);
          item.appendChild(label);
          if (header.hideable === false) {
              item.title = "This column is always visible.";
              item.appendChild(createElement("span", "rounded-full border border-slate-700/70 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-slate-400", "Pinned"));
          }
          checkbox.addEventListener("change", () => {
              if (header.hideable === false) {
                  checkbox.checked = true;
                  return;
              }
              const nextVisible = checkbox.checked;
              if (!nextVisible) {
                  const remainingVisible = hideableHeaders.filter((candidate) => {
                      if (candidate.key === header.key) {
                          return false;
                      }
                      const candidateKey = candidate.key;
                      return visibility[candidateKey] !== false;
                  }).length;
                  if (remainingVisible === 0) {
                      checkbox.checked = true;
                      return;
                  }
              }
              visibility[key] = nextVisible;
              leaf.columnVisibility[leaf.view] = { ...visibility };
              onChange?.();
          });
          list.appendChild(item);
      }
      if (list.childElementCount === 0) {
          hideColumnVisibilityMenu();
          return;
      }
      wrapper.appendChild(list);
      menu.replaceChildren(wrapper);
      document.body.appendChild(menu);
      const menuRect = menu.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      let top = anchorRect.bottom + 6;
      let left = anchorRect.left;
      if (top + menuRect.height > viewportHeight - 8) {
          top = anchorRect.top - menuRect.height - 6;
      }
      if (top < 8) {
          top = Math.max(8, Math.min(anchorRect.bottom + 6, viewportHeight - menuRect.height - 8));
      }
      if (left + menuRect.width > viewportWidth - 8) {
          left = anchorRect.right - menuRect.width;
      }
      if (left < 8) {
          left = 8;
      }
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      menu.style.visibility = "visible";
      const cleanupHandlers = [];
      const cleanupMenu = () => {
          while (cleanupHandlers.length > 0) {
              const cleanup = cleanupHandlers.pop();
              try {
                  cleanup?.();
              }
              catch (error) {
                  console.warn("Failed to clean up column visibility menu listener", error);
              }
          }
          if (menu.parentElement) {
              menu.parentElement.removeChild(menu);
          }
          if (columnMenuCleanup === cleanupMenu) {
              columnMenuCleanup = null;
          }
      };
      columnMenuCleanup = cleanupMenu;
      window.setTimeout(() => {
          if (columnMenuCleanup !== cleanupMenu) {
              return;
          }
          const handlePointerDown = (event) => {
              if (!(event.target instanceof Node)) {
                  return;
              }
              if (!menu.contains(event.target) && !anchor.contains(event.target)) {
                  hideColumnVisibilityMenu();
              }
          };
          const handleKeyDown = (event) => {
              if (event.key === "Escape") {
                  hideColumnVisibilityMenu();
              }
          };
          const handleScroll = (event) => {
              if (!event.isTrusted) {
                  return;
              }
              hideColumnVisibilityMenu();
          };
          const handleBlur = () => hideColumnVisibilityMenu();
          document.addEventListener("pointerdown", handlePointerDown, true);
          document.addEventListener("keydown", handleKeyDown, true);
          window.addEventListener("scroll", handleScroll, true);
          window.addEventListener("blur", handleBlur);
          cleanupHandlers.push(() => document.removeEventListener("pointerdown", handlePointerDown, true));
          cleanupHandlers.push(() => document.removeEventListener("keydown", handleKeyDown, true));
          cleanupHandlers.push(() => window.removeEventListener("scroll", handleScroll, true));
          cleanupHandlers.push(() => window.removeEventListener("blur", handleBlur));
      }, 0);
  }
  function createActionSettingEditorCard(formState, setting, onRemove) {
      const card = createElement("div", "rounded-md border border-slate-800/70 bg-slate-900/70 p-3");
      const header = createElement("div", "flex flex-wrap items-center gap-3");
      const labelField = createElement("label", "flex min-w-[160px] flex-1 flex-col gap-1");
      labelField.appendChild(createElement("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", "Label"));
      const labelInput = document.createElement("input");
      labelInput.type = "text";
      labelInput.className =
          "rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      labelInput.value = setting.label;
      labelInput.addEventListener("input", () => {
          setting.label = labelInput.value;
      });
      labelField.appendChild(labelInput);
      header.appendChild(labelField);
      const keyField = createElement("label", "flex w-36 flex-col gap-1");
      keyField.appendChild(createElement("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", "Key"));
      const keyInput = document.createElement("input");
      keyInput.type = "text";
      keyInput.className =
          "rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      keyInput.value = setting.key;
      keyInput.addEventListener("input", () => {
          setting.key = keyInput.value;
      });
      keyField.appendChild(keyInput);
      header.appendChild(keyField);
      const typeField = createElement("label", "flex w-32 flex-col gap-1");
      typeField.appendChild(createElement("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", "Type"));
      const typeSelect = document.createElement("select");
      typeSelect.className =
          "rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      for (const option of [
          { value: "text", label: "Text" },
          { value: "number", label: "Number" },
          { value: "toggle", label: "Toggle" },
      ]) {
          const opt = document.createElement("option");
          opt.value = option.value;
          opt.textContent = option.label;
          typeSelect.appendChild(opt);
      }
      typeSelect.value = setting.type;
      typeField.appendChild(typeSelect);
      header.appendChild(typeField);
      const removeButton = createElement("button", "rounded-md border border-slate-700 bg-transparent px-2 py-1 text-xs text-slate-300 transition-colors hover:border-rose-500/60 hover:text-rose-300", "Remove");
      removeButton.type = "button";
      removeButton.addEventListener("click", (event) => {
          event.preventDefault();
          onRemove(setting.id);
          card.remove();
      });
      header.appendChild(removeButton);
      card.appendChild(header);
      const valueWrapper = createElement("div", "mt-3 flex flex-col gap-1");
      valueWrapper.appendChild(createElement("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", "Value"));
      const valueContainer = createElement("div", "flex items-center gap-2");
      const updateValue = (value) => {
          setting.value = value;
      };
      let control = createSettingValueInput(setting, updateValue);
      valueContainer.appendChild(control);
      valueWrapper.appendChild(valueContainer);
      card.appendChild(valueWrapper);
      typeSelect.addEventListener("change", () => {
          const nextType = typeSelect.value;
          setting.type = nextType;
          setting.value = defaultValueForType(nextType);
          control = createSettingValueInput(setting, updateValue);
          valueContainer.replaceChildren(control);
      });
      return card;
  }
  function createSettingValueInput(setting, onChange) {
      switch (setting.type) {
          case "number": {
              const input = document.createElement("input");
              input.type = "number";
              input.className =
                  "w-40 rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
              input.value = setting.value !== undefined ? String(setting.value) : "0";
              input.addEventListener("change", () => {
                  const numeric = Number(input.value);
                  onChange(Number.isFinite(numeric) ? numeric : 0);
              });
              return input;
          }
          case "toggle": {
              const wrapper = createElement("label", "flex items-center gap-2 text-xs text-slate-200");
              const toggle = document.createElement("input");
              toggle.type = "checkbox";
              toggle.className =
                  "h-4 w-4 rounded border border-slate-600 bg-slate-900 text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500";
              toggle.checked = Boolean(setting.value);
              toggle.addEventListener("change", () => {
                  onChange(toggle.checked);
              });
              wrapper.appendChild(toggle);
              wrapper.appendChild(createElement("span", "", "Enabled"));
              return wrapper;
          }
          default: {
              const input = document.createElement("input");
              input.type = "text";
              input.className =
                  "w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
              input.value = setting.value !== undefined ? String(setting.value) : "";
              input.addEventListener("input", () => {
                  onChange(input.value);
              });
              return input;
          }
      }
  }
  function createRunningSettingField(runId, setting, actions) {
      const field = createElement("div", "rounded-md border border-slate-800/70 bg-slate-900/70 p-3");
      const header = createElement("div", "flex items-center justify-between gap-2");
      const rawLabel = setting.label?.trim() ?? "";
      const rawKey = setting.key?.trim() ?? "";
      const displayLabel = rawLabel !== "" ? rawLabel : rawKey !== "" ? rawKey : "Setting";
      header.appendChild(createElement("div", "text-sm font-medium text-slate-100", displayLabel));
      header.appendChild(createElement("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", setting.type));
      field.appendChild(header);
      if (setting.key) {
          field.appendChild(createElement("div", "text-[0.65rem] text-slate-500", `Key: ${setting.key}`));
      }
      const controlContainer = createElement("div", "mt-3");
      switch (setting.type) {
          case "number": {
              const input = document.createElement("input");
              input.type = "number";
              input.className =
                  "w-40 rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
              input.value = setting.value !== undefined ? String(setting.value) : "0";
              input.addEventListener("change", () => {
                  const numeric = Number(input.value);
                  actions.updateRunningActionSetting?.(runId, setting.id, Number.isFinite(numeric) ? numeric : 0);
              });
              controlContainer.appendChild(input);
              break;
          }
          case "toggle": {
              const wrapper = createElement("label", "flex items-center gap-2 text-xs text-slate-200");
              const toggle = document.createElement("input");
              toggle.type = "checkbox";
              toggle.className =
                  "h-4 w-4 rounded border border-slate-600 bg-slate-900 text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500";
              toggle.checked = Boolean(setting.value);
              toggle.addEventListener("change", () => {
                  actions.updateRunningActionSetting?.(runId, setting.id, toggle.checked);
              });
              wrapper.appendChild(toggle);
              wrapper.appendChild(createElement("span", "", "Enabled"));
              controlContainer.appendChild(wrapper);
              break;
          }
          default: {
              const input = document.createElement("input");
              input.type = "text";
              input.className =
                  "w-full rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
              input.value = setting.value !== undefined ? String(setting.value) : "";
              input.addEventListener("change", () => {
                  actions.updateRunningActionSetting?.(runId, setting.id, input.value);
              });
              controlContainer.appendChild(input);
              break;
          }
      }
      field.appendChild(controlContainer);
      return field;
  }
  function createTableShell(options) {
      const { sortState, onSort, existingContainer, view, headers, role } = options;
      const containerClass = "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
      const tableClass = "min-w-full border-collapse text-xs text-slate-100";
      const targetRole = role ?? "table-container";
      const canReuse = !!existingContainer &&
          existingContainer.dataset.sidebarRole === targetRole &&
          existingContainer.dataset.sidebarView === view;
      const container = canReuse
          ? existingContainer
          : createElement("div", containerClass);
      container.className = containerClass;
      container.dataset.sidebarRole = targetRole;
      container.dataset.sidebarView = view;
      let table = container.querySelector("table");
      if (!table || !canReuse) {
          table = createElement("table", tableClass);
      }
      else {
          table.className = tableClass;
      }
      const thead = table.tHead ?? createElement("thead", "sticky top-0 z-10");
      thead.className = "sticky top-0 z-10";
      thead.replaceChildren();
      const headerRow = createElement("tr", "bg-slate-900/95");
      for (const column of headers) {
          const th = createElement("th", `border-b border-r border-slate-800 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-300 last:border-r-0 ${column.align === "left"
            ? "text-left"
            : column.align === "right"
                ? "text-right"
                : "text-center"}`);
          th.classList.add("bg-slate-900/90");
          const labelWrapper = createElement("span", `flex w-full items-center gap-1 text-inherit ${column.align === "left"
            ? "justify-start"
            : column.align === "right"
                ? "justify-end"
                : "justify-center"}`, column.label);
          if (column.title) {
              th.title = column.title;
              th.setAttribute("aria-label", column.title);
          }
          const isSortable = (column.sortable ?? true) &&
              sortState !== undefined &&
              onSort !== undefined;
          if (isSortable) {
              const sortKey = column.sortKey ?? column.key;
              const isActive = sortState.key === sortKey;
              const indicator = createElement("span", `text-[0.6rem] ${isActive ? "text-sky-300" : "text-slate-500"}`, isActive ? (sortState.direction === "asc" ? "▲" : "▼") : "↕");
              if (column.align === "right") {
                  labelWrapper.appendChild(indicator);
              }
              else {
                  labelWrapper.insertBefore(indicator, labelWrapper.firstChild);
              }
              th.classList.add("cursor-pointer", "select-none");
              th.dataset.sortKey = sortKey;
              th.addEventListener("click", (event) => {
                  event.preventDefault();
                  onSort(sortKey);
              });
          }
          th.appendChild(labelWrapper);
          headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);
      const tbody = table.tBodies[0] ?? createElement("tbody", "text-[0.75rem]");
      tbody.className = "text-[0.75rem]";
      tbody.replaceChildren();
      if (!table.contains(thead)) {
          table.appendChild(thead);
      }
      if (!table.contains(tbody)) {
          table.appendChild(tbody);
      }
      if (container.firstElementChild !== table ||
          container.childElementCount !== 1) {
          container.replaceChildren(table);
      }
      return { container, tbody };
  }
  function getShipExtraCellClass(key) {
      switch (key) {
          case "label":
              return "font-semibold text-slate-100";
          case "owner":
              return "text-slate-200";
          case "type":
              return "text-[0.75rem] text-slate-300";
          case "troops":
              return "font-mono text-[0.75rem] text-slate-200";
          case "status":
              return "capitalize text-slate-200";
          case "origin":
          case "current":
          case "destination":
              return "text-[0.75rem] text-slate-300";
          default:
              return "text-slate-300";
      }
  }
  function attachImmediateTileFocus(element, focus) {
      element.addEventListener("pointerdown", (event) => {
          if (event.button !== 0 && event.button !== undefined) {
              return;
          }
          event.preventDefault();
          event.stopPropagation();
          focus();
      });
      element.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.detail === 0) {
              focus();
          }
      });
  }
  function createCoordinateButton(summary) {
      if (!summary) {
          return createElement("span", "text-slate-500", "–");
      }
      const label = formatTileSummary(summary);
      const button = createElement("button", "inline-flex max-w-full items-center rounded-sm px-0 text-left text-sky-300 transition-colors hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60", label);
      button.type = "button";
      button.title = `Focus on ${label}`;
      attachImmediateTileFocus(button, () => {
          focusTile(summary);
      });
      return button;
  }
  function createPlayerNameElement(label, position, options) {
      const classNames = [];
      if (options?.className) {
          classNames.push(options.className);
      }
      if (position) {
          classNames.push("cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 rounded-sm transition-colors");
      }
      const className = classNames.filter(Boolean).join(" ").trim();
      if (!position) {
          const tag = options?.asBlock ? "div" : "span";
          return createElement(tag, className, label);
      }
      const button = createElement("button", className, label);
      button.type = "button";
      button.title = `Focus on ${label}`;
      attachImmediateTileFocus(button, () => {
          focusTile(position);
      });
      return button;
  }
  function getShipCellValue(key, ship) {
      switch (key) {
          case "label":
              return `${ship.type} #${ship.id}`;
          case "owner":
              return ship.ownerName;
          case "type":
              return ship.type;
          case "troops":
              return formatTroopCount(ship.troops);
          case "origin":
              return formatTileSummary(ship.origin);
          case "current":
              return formatTileSummary(ship.current);
          case "destination":
              return formatTileSummary(ship.destination);
          case "status":
              return deriveShipStatus(ship);
          default:
              return "";
      }
  }
  function compareShips(options) {
      const { a, b, sortState } = options;
      const valueA = getShipSortValue(a, sortState.key);
      const valueB = getShipSortValue(b, sortState.key);
      const result = compareSortValues(valueA, valueB, sortState.direction);
      if (result !== 0) {
          return result;
      }
      const ownerCompare = a.ownerName.localeCompare(b.ownerName, undefined, {
          sensitivity: "base",
      });
      if (ownerCompare !== 0) {
          return ownerCompare;
      }
      return a.id.localeCompare(b.id, undefined, { sensitivity: "base" });
  }
  function getShipSortValue(ship, key) {
      switch (key) {
          case "label":
              return `${ship.type.toLowerCase()}-${ship.id}`;
          case "owner":
              return ship.ownerName.toLowerCase();
          case "type":
              return ship.type.toLowerCase();
          case "troops":
              return ship.troops;
          case "origin":
              return tileSortValue(ship.origin);
          case "current":
              return tileSortValue(ship.current);
          case "destination":
              return tileSortValue(ship.destination);
          case "status":
              return deriveShipStatus(ship).toLowerCase();
          default:
              return 0;
      }
  }
  function tileSortValue(summary) {
      if (!summary) {
          return "";
      }
      const x = summary.x.toString().padStart(5, "0");
      const y = summary.y.toString().padStart(5, "0");
      const owner = summary.ownerName?.toLowerCase() ?? "";
      return `${x}:${y}:${owner}`;
  }
  function formatTileSummary(summary) {
      if (!summary) {
          return "–";
      }
      const coords = `${summary.x}, ${summary.y}`;
      return summary.ownerName ? `${coords} (${summary.ownerName})` : coords;
  }
  function deriveShipStatus(ship) {
      if (ship.retreating) {
          return "Retreating";
      }
      if (ship.reachedTarget) {
          return "Arrived";
      }
      if (ship.type === "Transport") {
          return "En Route";
      }
      if (!ship.destination) {
          return ship.current ? "Idle" : "Unknown";
      }
      if (ship.current &&
          ship.destination &&
          ship.current.ref === ship.destination.ref) {
          return "Stationed";
      }
      return "En route";
  }
  const tableContextActions = new WeakMap();
  const playerContextTargets = new WeakMap();
  const groupContextTargets = new WeakMap();
  function findContextMenuTarget(event, container) {
      if (event.target instanceof HTMLElement && container.contains(event.target)) {
          let current = event.target;
          while (current && current !== container) {
              const type = current.dataset.contextTarget;
              if (type === "player" || type === "group") {
                  return { element: current, type };
              }
              current = current.parentElement;
          }
      }
      const composedPath = typeof event.composedPath === "function" ? event.composedPath() : [];
      for (const node of composedPath) {
          if (!(node instanceof HTMLElement)) {
              continue;
          }
          if (!container.contains(node)) {
              continue;
          }
          const type = node.dataset.contextTarget;
          if (type === "player" || type === "group") {
              return { element: node, type };
          }
      }
      return null;
  }
  function registerContextMenuDelegation(container, actions) {
      tableContextActions.set(container, actions);
      if (container.dataset.contextMenuDelegated === "true") {
          return;
      }
      const handleContextMenu = (event) => {
          const tableContainer = event.currentTarget;
          const activeActions = tableContextActions.get(tableContainer);
          if (!activeActions) {
              return;
          }
          const targetInfo = findContextMenuTarget(event, tableContainer);
          if (!targetInfo) {
              return;
          }
          if (targetInfo.type === "player") {
              const target = playerContextTargets.get(targetInfo.element);
              if (!target) {
                  return;
              }
              event.preventDefault();
              event.stopPropagation();
              const stoppedBySelf = isTradeStoppedBySelf(target);
              const stoppedByOther = isTradeStoppedByOther(target);
              const nextStopped = !stoppedBySelf;
              const disabled = target.isSelf;
              const actionLabel = nextStopped ? "Stop trading" : "Start trading";
              const tooltip = disabled
                  ? "You cannot toggle trading with yourself."
                  : !nextStopped && stoppedByOther
                      ? "The other player is also stopping trade with you."
                      : nextStopped && stoppedByOther
                          ? "This player has already stopped trading with you."
                          : undefined;
              showContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  title: target.name,
                  items: [
                      {
                          label: actionLabel,
                          disabled,
                          tooltip,
                          onSelect: disabled
                              ? undefined
                              : () => activeActions.toggleTrading([target.id], nextStopped),
                      },
                  ],
              });
              return;
          }
          const target = groupContextTargets.get(targetInfo.element);
          if (!target) {
              return;
          }
          event.preventDefault();
          event.stopPropagation();
          if (target.players.length === 0) {
              showContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  title: target.label,
                  items: [
                      {
                          label: "Stop trading",
                          disabled: true,
                          tooltip: "No eligible players in this group.",
                      },
                  ],
              });
              return;
          }
          const tradingPlayers = target.players.filter((player) => !isTradeStoppedBySelf(player));
          const stoppedPlayers = target.players.filter((player) => isTradeStoppedBySelf(player));
          const buildIdList = (players) => Array.from(new Set(players.map((player) => player.id)));
          const items = [];
          if (tradingPlayers.length > 0) {
              const ids = buildIdList(tradingPlayers);
              items.push({
                  label: tradingPlayers.length === target.players.length
                      ? "Stop trading"
                      : `Stop trading (${tradingPlayers.length})`,
                  onSelect: () => activeActions.toggleTrading(ids, true),
              });
          }
          if (stoppedPlayers.length > 0) {
              const ids = buildIdList(stoppedPlayers);
              items.push({
                  label: stoppedPlayers.length === target.players.length
                      ? "Start trading"
                      : `Start trading (${stoppedPlayers.length})`,
                  onSelect: () => activeActions.toggleTrading(ids, false),
              });
          }
          if (!items.length) {
              items.push({
                  label: "Stop trading",
                  disabled: true,
                  tooltip: "No eligible players in this group.",
              });
          }
          showContextMenu({
              x: event.clientX,
              y: event.clientY,
              title: target.label,
              items,
          });
      };
      container.addEventListener("contextmenu", handleContextMenu);
      container.dataset.contextMenuDelegated = "true";
  }
  function appendPlayerRows(options) {
      const { player, indent, leaf, snapshot, tbody, metricsCache, actions } = options;
      const headers = options.headers;
      const metrics = getMetrics(player, snapshot, metricsCache);
      const rowKey = player.id;
      const tr = createElement("tr", "hover:bg-slate-800/50 transition-colors");
      tr.dataset.rowKey = rowKey;
      applyPersistentHover(tr, leaf, rowKey, "bg-slate-800/50");
      tr.dataset.contextTarget = "player";
      playerContextTargets.set(tr, {
          id: player.id,
          name: player.name,
          tradeStopped: player.tradeStopped ?? false,
          tradeStoppedBySelf: player.tradeStoppedBySelf,
          tradeStoppedByOther: player.tradeStoppedByOther,
          isSelf: player.isSelf ?? false,
      });
      const labelHeader = headers.find((header) => header.key === "label");
      if (labelHeader) {
          const firstCell = createElement("td", cellClassForColumn(labelHeader, "align-top"));
          firstCell.appendChild(createLabelBlock({
              label: player.name,
              subtitle: [player.clan, player.team].filter(Boolean).join(" • ") || undefined,
              indent,
              focus: player.position,
          }));
          tr.appendChild(firstCell);
      }
      appendMetricCells(tr, metrics, player, headers);
      tbody.appendChild(tr);
      tr.addEventListener("click", () => {
          actions.showPlayerDetails(player.id);
      });
  }
  function appendGroupRows(options) {
      const { group, leaf, snapshot, tbody, requestRender, groupType, metricsCache, actions, headers, } = options;
      const groupKey = `${groupType}:${group.key}`;
      const expanded = leaf.expandedGroups.has(groupKey);
      const row = createElement("tr", "bg-slate-900/70 hover:bg-slate-800/60 transition-colors font-semibold");
      row.dataset.groupKey = groupKey;
      applyPersistentHover(row, leaf, groupKey, "bg-slate-800/60");
      const eligiblePlayers = group.players.filter((player) => !player.isSelf);
      row.dataset.contextTarget = "group";
      groupContextTargets.set(row, {
          label: group.label,
          players: eligiblePlayers,
      });
      const labelHeader = headers.find((header) => header.key === "label");
      if (labelHeader) {
          const firstCell = createElement("td", cellClassForColumn(labelHeader, "align-top", {
              variant: "expandable",
          }));
          firstCell.appendChild(createLabelBlock({
              label: `${group.label} (${group.players.length})`,
              subtitle: groupType === "clan" ? "Clan summary" : "Team summary",
              indent: 0,
              expanded,
              toggleAttribute: "data-group-toggle",
              rowKey: groupKey,
              onToggle: (next) => {
                  if (next) {
                      leaf.expandedGroups.add(groupKey);
                  }
                  else {
                      leaf.expandedGroups.delete(groupKey);
                  }
                  requestRender();
              },
              persistHover: leaf.hoveredGroupToggleKey === groupKey,
              onToggleHoverChange: (hovered) => {
                  if (hovered) {
                      leaf.hoveredGroupToggleKey = groupKey;
                  }
                  else if (leaf.hoveredGroupToggleKey === groupKey) {
                      leaf.hoveredGroupToggleKey = undefined;
                  }
              },
          }));
          row.appendChild(firstCell);
      }
      appendAggregateCells(row, group.metrics, group.totals, headers, {
          variant: "expandable",
      });
      tbody.appendChild(row);
      if (expanded) {
          for (const player of group.players) {
              appendPlayerRows({
                  player,
                  indent: 1,
                  leaf,
                  snapshot,
                  tbody,
                  metricsCache,
                  actions,
                  headers,
              });
          }
      }
  }
  function applyPersistentHover(element, leaf, rowKey, highlightClass) {
      element.dataset.hoverHighlightClass = highlightClass;
      if (leaf.hoveredRowKey === rowKey) {
          if (leaf.hoveredRowElement && leaf.hoveredRowElement !== element) {
              const previousClass = leaf.hoveredRowElement.dataset.hoverHighlightClass;
              if (previousClass) {
                  leaf.hoveredRowElement.classList.remove(previousClass);
              }
          }
          leaf.hoveredRowElement = element;
          element.classList.add(highlightClass);
      }
      element.addEventListener("pointerenter", () => {
          if (leaf.hoveredRowElement && leaf.hoveredRowElement !== element) {
              const previousClass = leaf.hoveredRowElement.dataset.hoverHighlightClass;
              if (previousClass) {
                  leaf.hoveredRowElement.classList.remove(previousClass);
              }
          }
          leaf.hoveredRowKey = rowKey;
          leaf.hoveredRowElement = element;
          element.classList.add(highlightClass);
      });
  }
  function appendMetricCells(row, metrics, player, headers) {
      for (const column of headers) {
          if (column.key === "label") {
              continue;
          }
          const extraClasses = [getExtraCellClass(column.key, false)];
          if (column.key === "incoming" && metrics.incoming > 0) {
              extraClasses.push("bg-red-500 text-white");
          }
          const td = createElement("td", cellClassForColumn(column, extraClasses.filter(Boolean).join(" ")));
          td.textContent = getPlayerCellValue(column.key, metrics, player);
          row.appendChild(td);
      }
  }
  function appendAggregateCells(row, metrics, totals, headers, options) {
      const variant = options?.variant ?? "default";
      for (const column of headers) {
          if (column.key === "label") {
              continue;
          }
          const extraClasses = [getExtraCellClass(column.key, true)];
          if (column.key === "incoming" && metrics.incoming > 0) {
              extraClasses.push("bg-red-500 text-white");
          }
          const td = createElement("td", cellClassForColumn(column, extraClasses.filter(Boolean).join(" "), {
              variant,
          }));
          td.textContent = getAggregateCellValue(column.key, metrics, totals);
          row.appendChild(td);
      }
  }
  function renderPlayerDetails(player, snapshot) {
      const wrapper = createElement("div", "space-y-4 text-[0.75rem] text-slate-100");
      const metrics = computePlayerMetrics(player, snapshot);
      const badgeRow = createElement("div", "flex flex-wrap gap-2");
      badgeRow.appendChild(createBadge("⚠️ Incoming", metrics.incoming));
      badgeRow.appendChild(createBadge("⚔️ Outgoing", metrics.outgoing));
      badgeRow.appendChild(createBadge("🌱 Expanding", metrics.expanding));
      badgeRow.appendChild(createBadge("🤝 Alliances", metrics.alliances));
      badgeRow.appendChild(createBadge("📡 Disconnected", metrics.disconnected));
      badgeRow.appendChild(createBadge("🕱 Traitor", metrics.traitor));
      badgeRow.appendChild(createBadge("⏳ Waiting", metrics.waiting));
      badgeRow.appendChild(createBadge("☠️ Eliminated", metrics.eliminated));
      badgeRow.appendChild(createBadge("🛡️ Stable", metrics.stable, metrics.stable > 0));
      wrapper.appendChild(badgeRow);
      const grid = createElement("div", "grid gap-4 md:grid-cols-2");
      grid.appendChild(createDetailSection("Incoming attacks", player.incomingAttacks, (attack) => `${attack.from} – ${formatTroopCount(attack.troops)} troops`));
      grid.appendChild(createDetailSection("Outgoing attacks", player.outgoingAttacks, (attack) => `${attack.target} – ${formatTroopCount(attack.troops)} troops`));
      grid.appendChild(createDetailSection("Defensive supports", player.defensiveSupports, (support) => `${support.ally} – ${formatTroopCount(support.troops)} troops`));
      const activeAlliances = getActiveAlliances(player, snapshot);
      grid.appendChild(createDetailSection("Alliances", activeAlliances, (pact) => {
          const expiresAt = pact.startedAtMs + snapshot.allianceDurationMs;
          const countdown = formatCountdown(expiresAt, snapshot.currentTimeMs);
          return `${pact.partner} – expires in ${countdown}`;
      }));
      if (player.traitor || player.traitorTargets.length) {
          grid.appendChild(createDetailSection("Traitor activity", player.traitorTargets, (target) => `Betrayed ${target}`));
      }
      wrapper.appendChild(grid);
      return wrapper;
  }
  function createDetailSection(title, entries, toLabel) {
      const section = createElement("section", "space-y-2");
      const heading = createElement("h4", "font-semibold uppercase text-slate-300 tracking-wide text-[0.7rem]", title);
      section.appendChild(heading);
      if (!entries.length) {
          section.appendChild(createElement("p", "text-slate-500 italic", "No records."));
          return section;
      }
      const list = createElement("ul", "space-y-2");
      for (const entry of entries) {
          const item = createElement("li", "rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2");
          item.appendChild(createElement("div", "font-medium text-slate-200", toLabel(entry)));
          list.appendChild(item);
      }
      section.appendChild(list);
      return section;
  }
  function createBadge(label, value, highlight = value > 0) {
      const badge = createElement("span", `inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-semibold ${highlight
        ? "bg-sky-500/20 text-sky-200 border border-sky-500/40"
        : "bg-slate-800/80 text-slate-300"}`);
      const [emoji, ...rest] = label.split(" ");
      const emojiSpan = createElement("span", "text-base");
      emojiSpan.textContent = emoji;
      badge.appendChild(emojiSpan);
      badge.appendChild(createElement("span", "", rest.join(" ")));
      badge.appendChild(createElement("span", "font-mono text-[0.7rem]", String(value)));
      return badge;
  }
  function createActionStatusBadge(status) {
      const baseClass = "rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide";
      const styles = {
          Enabled: "bg-sky-500/20 text-sky-200",
          Running: "bg-emerald-500/20 text-emerald-200",
          Disabled: "bg-slate-700/60 text-slate-200",
      };
      return createElement("span", `${baseClass} ${styles[status]}`, status);
  }
  function createRunStatusBadge(status) {
      const baseClass = "rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide";
      const styles = {
          running: "bg-emerald-500/20 text-emerald-200",
          completed: "bg-sky-500/20 text-sky-200",
          stopped: "bg-amber-500/20 text-amber-200",
          failed: "bg-rose-500/20 text-rose-200",
      };
      const className = `${baseClass} ${styles[status] ?? "bg-slate-700/60 text-slate-200"}`;
      return createElement("span", className, formatRunStatus(status));
  }
  function createSummaryStat(label, value) {
      const wrapper = createElement("div", "rounded-md border border-slate-800/70 bg-slate-900/70 px-3 py-2");
      const title = createElement("div", "text-[0.65rem] uppercase tracking-wide text-slate-400", label);
      const content = createElement("div", "font-mono text-base text-slate-100", value);
      wrapper.appendChild(title);
      wrapper.appendChild(content);
      return wrapper;
  }
  function createLabelBlock(options) {
      const { label, subtitle, indent, expanded, toggleAttribute, rowKey, onToggle, focus, persistHover, onToggleHoverChange, } = options;
      const container = createElement("div", "flex items-start gap-3");
      container.style.marginLeft = `${indent * 1.5}rem`;
      const labelBlock = createElement("div", "space-y-1");
      const labelEl = createPlayerNameElement(label, focus, {
          asBlock: true,
          className: "block font-semibold text-slate-100 transition-colors hover:text-sky-200",
      });
      labelBlock.appendChild(labelEl);
      if (subtitle) {
          labelBlock.appendChild(createElement("div", "text-[0.65rem] uppercase tracking-wide text-slate-400", subtitle));
      }
      if (toggleAttribute && rowKey && typeof expanded === "boolean" && onToggle) {
          const button = createElement("button", "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-colors");
          button.setAttribute(toggleAttribute, rowKey);
          button.type = "button";
          let currentExpanded = expanded;
          const updateToggleState = (nextExpanded) => {
              currentExpanded = nextExpanded;
              button.title = nextExpanded ? "Collapse" : "Expand";
              button.textContent = nextExpanded ? "−" : "+";
          };
          const setHoverState = (hovered) => {
              if (hovered) {
                  button.classList.add("text-slate-50");
              }
              else {
                  button.classList.remove("text-slate-50");
              }
              onToggleHoverChange?.(hovered);
          };
          updateToggleState(currentExpanded);
          if (persistHover) {
              setHoverState(true);
          }
          button.addEventListener("pointerenter", () => {
              setHoverState(true);
          });
          button.addEventListener("pointerleave", () => {
              requestAnimationFrame(() => {
                  if (!button.isConnected) {
                      return;
                  }
                  setHoverState(false);
              });
          });
          let pointerHandled = false;
          button.addEventListener("pointerdown", (event) => {
              if (event.button !== 0) {
                  return;
              }
              event.preventDefault();
              event.stopPropagation();
              pointerHandled = true;
              const nextExpanded = !currentExpanded;
              updateToggleState(nextExpanded);
              onToggle(nextExpanded);
          });
          button.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (pointerHandled) {
                  pointerHandled = false;
                  return;
              }
              const nextExpanded = !currentExpanded;
              updateToggleState(nextExpanded);
              onToggle(nextExpanded);
          });
          container.appendChild(button);
      }
      container.appendChild(labelBlock);
      return container;
  }
  function cellClassForColumn(column, extra = "", options) {
      const variant = options?.variant ?? "default";
      const alignClass = column.align === "left"
          ? "text-left"
          : column.align === "right"
              ? "text-right"
              : "text-center";
      const baseClass = variant === "expandable"
          ? TABLE_CELL_EXPANDABLE_CLASS
          : TABLE_CELL_BASE_CLASS;
      return [baseClass, alignClass, extra].filter(Boolean).join(" ");
  }
  function getExtraCellClass(key, aggregate) {
      if (key === "tiles" || key === "gold" || key === "troops") {
          return "font-mono text-[0.75rem]";
      }
      return aggregate ? "font-semibold" : "font-semibold";
  }
  function getPlayerCellValue(key, metrics, player) {
      switch (key) {
          case "tiles":
              return formatNumber(player.tiles);
          case "gold":
              return formatNumber(player.gold);
          case "troops":
              return formatTroopCount(player.troops);
          case "incoming":
              return String(metrics.incoming);
          case "outgoing":
              return String(metrics.outgoing);
          case "expanding":
              return String(metrics.expanding);
          case "alliances":
              return String(metrics.alliances);
          case "disconnected":
              return String(metrics.disconnected);
          case "traitor":
              return String(metrics.traitor);
          case "stable":
              return String(metrics.stable);
          case "waiting":
              return String(metrics.waiting);
          case "eliminated":
              return String(metrics.eliminated);
          default:
              return "";
      }
  }
  function getAggregateCellValue(key, metrics, totals) {
      switch (key) {
          case "tiles":
              return formatNumber(totals.tiles);
          case "gold":
              return formatNumber(totals.gold);
          case "troops":
              return formatTroopCount(totals.troops);
          case "incoming":
              return String(metrics.incoming);
          case "outgoing":
              return String(metrics.outgoing);
          case "expanding":
              return String(metrics.expanding);
          case "alliances":
              return String(metrics.alliances);
          case "disconnected":
              return String(metrics.disconnected);
          case "traitor":
              return String(metrics.traitor);
          case "stable":
              return String(metrics.stable);
          case "waiting":
              return String(metrics.waiting);
          case "eliminated":
              return String(metrics.eliminated);
          default:
              return "";
      }
  }
  function getMetrics(player, snapshot, cache) {
      const cached = cache.get(player.id);
      if (cached) {
          return cached;
      }
      const metrics = computePlayerMetrics(player, snapshot);
      cache.set(player.id, metrics);
      return metrics;
  }
  function comparePlayers(options) {
      const { a, b, sortState, snapshot, metricsCache } = options;
      const metricsA = getMetrics(a, snapshot, metricsCache);
      const metricsB = getMetrics(b, snapshot, metricsCache);
      const valueA = getPlayerSortValue(a, metricsA, sortState.key);
      const valueB = getPlayerSortValue(b, metricsB, sortState.key);
      const result = compareSortValues(valueA, valueB, sortState.direction);
      if (result !== 0) {
          return result;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  }
  function compareAggregated(options) {
      const { a, b, sortState } = options;
      const valueA = getAggregateSortValue(a, sortState.key);
      const valueB = getAggregateSortValue(b, sortState.key);
      const result = compareSortValues(valueA, valueB, sortState.direction);
      if (result !== 0) {
          return result;
      }
      return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
  }
  function compareSortValues(a, b, direction) {
      if (typeof a === "string" && typeof b === "string") {
          const cmp = a.localeCompare(b, undefined, { sensitivity: "base" });
          return direction === "asc" ? cmp : -cmp;
      }
      const numA = Number(a);
      const numB = Number(b);
      if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          const diff = numA - numB;
          if (diff !== 0) {
              return direction === "asc" ? diff : -diff;
          }
          return 0;
      }
      const fallback = String(a).localeCompare(String(b), undefined, {
          sensitivity: "base",
      });
      return direction === "asc" ? fallback : -fallback;
  }
  function getPlayerSortValue(player, metrics, key) {
      switch (key) {
          case "label":
              return player.name.toLowerCase();
          case "tiles":
              return player.tiles;
          case "gold":
              return player.gold;
          case "troops":
              return player.troops;
          case "incoming":
              return metrics.incoming;
          case "outgoing":
              return metrics.outgoing;
          case "expanding":
              return metrics.expanding;
          case "alliances":
              return metrics.alliances;
          case "disconnected":
              return metrics.disconnected;
          case "traitor":
              return metrics.traitor;
          case "stable":
              return metrics.stable;
          case "waiting":
              return metrics.waiting;
          case "eliminated":
              return metrics.eliminated;
          default:
              return 0;
      }
  }
  function getAggregateSortValue(row, key) {
      switch (key) {
          case "label":
              return row.label.toLowerCase();
          case "tiles":
              return row.totals.tiles;
          case "gold":
              return row.totals.gold;
          case "troops":
              return row.totals.troops;
          case "incoming":
              return row.metrics.incoming;
          case "outgoing":
              return row.metrics.outgoing;
          case "expanding":
              return row.metrics.expanding;
          case "alliances":
              return row.metrics.alliances;
          case "disconnected":
              return row.metrics.disconnected;
          case "traitor":
              return row.metrics.traitor;
          case "stable":
              return row.metrics.stable;
          case "waiting":
              return row.metrics.waiting;
          case "eliminated":
              return row.metrics.eliminated;
          default:
              return 0;
      }
  }
  function groupPlayers(options) {
      const { players, snapshot, metricsCache, getKey, sortState } = options;
      const map = new Map();
      for (const player of players) {
          const key = getKey(player) ?? "Unaffiliated";
          if (!map.has(key)) {
              map.set(key, {
                  key,
                  label: key,
                  players: [],
                  metrics: {
                      incoming: 0,
                      outgoing: 0,
                      expanding: 0,
                      waiting: 0,
                      eliminated: 0,
                      disconnected: 0,
                      traitor: 0,
                      alliances: 0,
                      stable: 0,
                  },
                  totals: {
                      tiles: 0,
                      gold: 0,
                      troops: 0,
                  },
              });
          }
          const entry = map.get(key);
          entry.players.push(player);
          const metrics = getMetrics(player, snapshot, metricsCache);
          entry.metrics.incoming += metrics.incoming;
          entry.metrics.outgoing += metrics.outgoing;
          entry.metrics.expanding += metrics.expanding;
          entry.metrics.waiting += metrics.waiting;
          entry.metrics.eliminated += metrics.eliminated;
          entry.metrics.disconnected += metrics.disconnected;
          entry.metrics.traitor += metrics.traitor;
          entry.metrics.alliances += metrics.alliances;
          entry.metrics.stable += metrics.stable;
          entry.totals.tiles += player.tiles;
          entry.totals.gold += player.gold;
          entry.totals.troops += player.troops;
      }
      const rows = Array.from(map.values());
      for (const row of rows) {
          row.players.sort((a, b) => comparePlayers({ a, b, sortState, snapshot, metricsCache }));
      }
      rows.sort((a, b) => compareAggregated({ a, b, sortState }));
      return rows;
  }
  function computePlayerMetrics(player, snapshot) {
      const incoming = player.incomingAttacks.length;
      const outgoing = player.outgoingAttacks.length;
      const expanding = player.expansions;
      const waiting = player.waiting ? 1 : 0;
      const eliminated = player.eliminated ? 1 : 0;
      const disconnected = player.disconnected ? 1 : 0;
      const traitor = player.traitor ? 1 : 0;
      const alliances = getActiveAlliances(player, snapshot).length;
      const stable = incoming +
          outgoing +
          expanding +
          waiting +
          eliminated +
          disconnected +
          traitor ===
          0
          ? 1
          : 0;
      return {
          incoming,
          outgoing,
          expanding,
          waiting,
          eliminated,
          disconnected,
          traitor,
          alliances,
          stable,
      };
  }
  function getActiveAlliances(player, snapshot) {
      return player.alliances.filter((pact) => {
          const expiresAt = pact.startedAtMs + snapshot.allianceDurationMs;
          return expiresAt > snapshot.currentTimeMs;
      });
  }

  const VIEW_OPTIONS = [
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
  function ensureSidebarStyles() {
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
  const OVERLAY_SELECTORS = ["game-left-sidebar", "control-panel"];
  let leafIdCounter = 0;
  let groupIdCounter = 0;
  const DEFAULT_SORT_STATES = {
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
  function createLeaf(view) {
      return {
          id: `leaf-${++leafIdCounter}`,
          type: "leaf",
          view,
          expandedRows: new Set(),
          expandedGroups: new Set(),
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
  function createGroup(orientation, children) {
      const count = Math.max(children.length, 1);
      return {
          id: `group-${++groupIdCounter}`,
          type: "group",
          orientation,
          children,
          sizes: new Array(count).fill(1 / count),
      };
  }
  function createDefaultRootNode() {
      const clanmatesLeaf = createLeaf("clanmates");
      const logsLeaf = createLeaf("logs");
      const group = createGroup("horizontal", [clanmatesLeaf, logsLeaf]);
      group.sizes = [0.8, 0.2];
      return group;
  }
  class SidebarApp {
      constructor(store) {
          this.overlayElements = new Map();
          this.handleOverlayRealign = () => this.repositionGameOverlay();
          this.handleGlobalKeyDown = (event) => this.onGlobalKeyDown(event);
          this.isSidebarHidden = false;
          this.store = store;
          this.snapshot = store.getSnapshot();
          ensureSidebarStyles();
          this.sidebar = this.createSidebarShell();
          this.layoutContainer = this.sidebar.querySelector("[data-sidebar-layout]");
          this.rootNode = createDefaultRootNode();
          this.viewActions = {
              toggleTrading: (playerIds, stopped) => this.store.setTradingStopped(playerIds, stopped),
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
              const joinedNewGame = (previousSnapshot.players.length === 0 &&
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
      onGlobalKeyDown(event) {
          if (event.defaultPrevented || event.repeat) {
              return;
          }
          const target = event.target;
          if (target instanceof HTMLElement) {
              if (target.isContentEditable) {
                  return;
              }
              const editableTarget = target.closest("input, textarea, select, [contenteditable='true' i], [contenteditable='']");
              if (editableTarget) {
                  return;
              }
          }
          const isToggleShortcut = event.code === "KeyH" &&
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
      createSidebarShell() {
          const existing = document.getElementById("openfront-strategic-sidebar");
          if (existing) {
              existing.remove();
          }
          const sidebar = createElement("aside", "fixed top-0 left-0 z-[2147483646] flex h-full max-w-[90vw] flex-col border-r border-slate-800/80 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur");
          sidebar.id = "openfront-strategic-sidebar";
          sidebar.style.width = "420px";
          sidebar.style.fontFamily = `'Inter', 'Segoe UI', system-ui, sans-serif`;
          const resizer = createElement("div", "group absolute right-0 top-0 flex h-full w-3 translate-x-full cursor-col-resize items-center justify-center rounded-r-full bg-transparent transition-colors duration-150 hover:bg-sky-500/10");
          resizer.appendChild(createElement("span", "h-12 w-px rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60"));
          resizer.addEventListener("pointerdown", (event) => this.startSidebarResize(event));
          sidebar.appendChild(resizer);
          const layout = createElement("div", "flex h-full flex-1 flex-col gap-3 overflow-hidden p-3");
          layout.dataset.sidebarLayout = "true";
          sidebar.appendChild(layout);
          document.body.appendChild(sidebar);
          return sidebar;
      }
      startSidebarResize(event) {
          event.preventDefault();
          const startWidth = this.sidebar.getBoundingClientRect().width;
          const startX = event.clientX;
          const originalUserSelect = document.body.style.userSelect;
          document.body.style.userSelect = "none";
          const onMove = (moveEvent) => {
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
      observeGameOverlays() {
          let discovered = false;
          for (const selector of OVERLAY_SELECTORS) {
              const registration = this.overlayElements.get(selector);
              if (registration?.root.isConnected && registration.target.isConnected) {
                  continue;
              }
              const found = document.querySelector(selector);
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
              return (!registration ||
                  !registration.root.isConnected ||
                  !registration.target.isConnected);
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
                  const candidate = document.querySelector(selector);
                  if (candidate) {
                      const target = this.resolveOverlayTarget(selector, candidate);
                      if (target) {
                          this.registerOverlay(selector, candidate, target);
                          updated = true;
                      }
                  }
                  else if (registration) {
                      this.overlayElements.delete(selector);
                      updated = true;
                  }
              }
              if (updated) {
                  this.repositionGameOverlay();
              }
              const stillMissing = OVERLAY_SELECTORS.some((selector) => {
                  const current = this.overlayElements.get(selector);
                  return (!current || !current.root.isConnected || !current.target.isConnected);
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
      repositionGameOverlay() {
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
              }
              else {
                  target.style.left = `${offset}px`;
                  target.style.right = "auto";
                  target.style.maxWidth = `calc(100vw - ${offset + 24}px)`;
              }
          }
          if (missingElement) {
              this.observeGameOverlays();
          }
      }
      ensureOverlayRegistration(selector) {
          let registration = this.overlayElements.get(selector) ?? null;
          let root = registration?.root;
          if (!root || !root.isConnected) {
              const candidate = document.querySelector(selector);
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
          if (!registration ||
              registration.root !== root ||
              registration.target !== target) {
              this.registerOverlay(selector, root, target);
              registration = this.overlayElements.get(selector) ?? null;
          }
          return registration;
      }
      registerOverlay(selector, root, target) {
          const existing = this.overlayElements.get(selector);
          const originalLeft = existing && existing.target === target
              ? existing.originalLeft
              : target.style.left;
          const originalRight = existing && existing.target === target
              ? existing.originalRight
              : target.style.right;
          const originalMaxWidth = existing && existing.target === target
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
      toggleSidebarVisibility(force) {
          const nextHidden = typeof force === "boolean" ? force : !this.isSidebarHidden;
          if (nextHidden === this.isSidebarHidden) {
              return;
          }
          this.isSidebarHidden = nextHidden;
          if (nextHidden) {
              this.sidebar.style.display = "none";
              this.sidebar.setAttribute("aria-hidden", "true");
              this.sidebar.dataset.sidebarHidden = "true";
          }
          else {
              this.sidebar.style.display = "";
              this.sidebar.removeAttribute("aria-hidden");
              delete this.sidebar.dataset.sidebarHidden;
          }
          this.repositionGameOverlay();
      }
      resolveOverlayTarget(selector, root) {
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
              const aside = root.querySelector("aside");
              if (aside) {
                  return aside;
              }
          }
          return root;
      }
      findPositionedAncestor(element) {
          let current = element;
          while (current) {
              const position = window.getComputedStyle(current).position;
              if (position && position !== "static") {
                  return current;
              }
              current = current.parentElement;
          }
          return null;
      }
      findPositionedChild(root) {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
          const current = walker.currentNode;
          if (current !== root) {
              const position = window.getComputedStyle(current).position;
              if (position && position !== "static") {
                  return current;
              }
          }
          while (true) {
              const next = walker.nextNode();
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
      renderLayout() {
          this.layoutContainer.innerHTML = "";
          const rootElement = this.buildNodeElement(this.rootNode);
          rootElement.classList.add("flex-1", "min-h-0");
          rootElement.style.flex = "1 1 0%";
          this.layoutContainer.appendChild(rootElement);
          this.refreshAllLeaves();
      }
      buildNodeElement(node) {
          if (node.type === "leaf") {
              return this.buildLeafElement(node);
          }
          return this.buildGroupElement(node);
      }
      buildLeafElement(leaf) {
          const wrapper = createElement("div", "flex min-h-[200px] flex-1 flex-col overflow-hidden rounded-lg border border-slate-800/70 bg-slate-900/70 shadow-inner");
          wrapper.dataset.nodeId = leaf.id;
          const header = createElement("div", "flex items-center justify-between gap-2 border-b border-slate-800/70 bg-slate-900/80 px-3 py-2");
          const headerControls = createElement("div", "flex items-center gap-2");
          const select = createElement("select", "h-7 min-w-[8rem] max-w-full shrink-0 rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70");
          for (const option of VIEW_OPTIONS) {
              const opt = document.createElement("option");
              opt.value = option.value;
              opt.textContent = option.label;
              select.appendChild(opt);
          }
          select.value = leaf.view;
          headerControls.appendChild(select);
          const columnVisibilityButton = createElement("button", "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-100 transition-colors hover:border-sky-500/70 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70");
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
          const newActionButton = createElement("button", "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-100 transition-colors hover:border-sky-500/70 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70");
          newActionButton.type = "button";
          newActionButton.setAttribute("aria-label", "New action");
          newActionButton.appendChild(renderIcon("plus", "h-4 w-4"));
          newActionButton.addEventListener("click", () => {
              this.store.createAction();
          });
          headerControls.appendChild(newActionButton);
          const clearLogsButton = createElement("button", "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-100 transition-colors hover:border-rose-500/70 hover:text-rose-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70");
          clearLogsButton.type = "button";
          clearLogsButton.setAttribute("aria-label", "Clear logs");
          clearLogsButton.appendChild(renderIcon("trash", "h-4 w-4"));
          clearLogsButton.addEventListener("click", () => {
              this.store.clearLogs();
          });
          headerControls.appendChild(clearLogsButton);
          const followLogsButton = createElement("button", "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-100 transition-colors hover:border-sky-500/70 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70");
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
              leaf.view = select.value;
              this.updateLeafHeaderControls(leaf);
              this.refreshLeafContent(leaf);
          });
          header.appendChild(headerControls);
          const actions = createElement("div", "flex items-center gap-2");
          actions.appendChild(this.createActionButton("Split horizontally", "split-horizontal", () => this.splitLeaf(leaf, "horizontal")));
          actions.appendChild(this.createActionButton("Split vertically", "split-vertical", () => this.splitLeaf(leaf, "vertical")));
          actions.appendChild(this.createActionButton("Close panel", "close", () => this.closeLeaf(leaf)));
          header.appendChild(actions);
          const body = createElement("div", "flex flex-1 min-h-0 flex-col overflow-hidden");
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
          };
          this.updateLeafHeaderControls(leaf);
          this.refreshLeafContent(leaf);
          return wrapper;
      }
      createActionButton(label, icon, handler) {
          const button = createElement("button", "flex h-7 w-7 items-center justify-center rounded-md border border-slate-700/70 bg-slate-800/70 text-slate-300 transition-colors hover:border-sky-500/60 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50");
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
      buildGroupElement(group) {
          const wrapper = createElement("div", group.orientation === "horizontal"
              ? "flex min-h-0 flex-1 flex-col"
              : "flex min-h-0 flex-1 flex-row");
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
                  const handle = createElement("div", group.orientation === "horizontal"
                      ? "group relative -my-px flex h-3 w-full cursor-row-resize items-center justify-center rounded-md bg-transparent transition-colors duration-150 hover:bg-sky-500/10"
                      : "group relative -mx-px flex w-3 h-full cursor-col-resize items-center justify-center rounded-md bg-transparent transition-colors duration-150 hover:bg-sky-500/10");
                  handle.appendChild(createElement("span", group.orientation === "horizontal"
                      ? "h-px w-10 rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60"
                      : "w-px h-10 rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60"));
                  handle.dataset.handleIndex = String(i);
                  handle.addEventListener("pointerdown", (event) => this.startPanelResize(group, i, event));
                  wrapper.appendChild(handle);
              }
          }
          return wrapper;
      }
      startPanelResize(group, index, event) {
          const wrapper = group.element?.wrapper;
          if (!wrapper) {
              return;
          }
          const childA = wrapper.querySelector(`[data-panel-child="${index}"]`);
          const childB = wrapper.querySelector(`[data-panel-child="${index + 1}"]`);
          if (!childA || !childB) {
              return;
          }
          event.preventDefault();
          const orientation = group.orientation;
          const rectA = childA.getBoundingClientRect();
          const rectB = childB.getBoundingClientRect();
          const totalPixels = orientation === "horizontal"
              ? rectA.height + rectB.height
              : rectA.width + rectB.width;
          const initialPixelsA = orientation === "horizontal" ? rectA.height : rectA.width;
          const sizeA = group.sizes[index] ?? 1;
          const sizeB = group.sizes[index + 1] ?? 1;
          const combinedShareRaw = sizeA + sizeB;
          const combinedShare = combinedShareRaw > 0 ? combinedShareRaw : 1;
          const startCoord = orientation === "horizontal" ? event.clientY : event.clientX;
          const originalUserSelect = document.body.style.userSelect;
          document.body.style.userSelect = "none";
          const onMove = (moveEvent) => {
              const currentCoord = orientation === "horizontal" ? moveEvent.clientY : moveEvent.clientX;
              const delta = currentCoord - startCoord;
              const rawRatioA = totalPixels === 0 ? 0.5 : (initialPixelsA + delta) / totalPixels;
              const baseMinRatio = 0.15;
              const baseMaxRatio = 0.85;
              const minPanelPixels = 200;
              let minRatio = baseMinRatio;
              let maxRatio = baseMaxRatio;
              if (orientation === "horizontal") {
                  const minRatioFromPixels = totalPixels === 0 ? 0 : minPanelPixels / totalPixels;
                  const maxRatioFromPixels = totalPixels === 0 ? 1 : 1 - minRatioFromPixels;
                  minRatio = Math.max(minRatio, Math.min(minRatioFromPixels, baseMaxRatio));
                  maxRatio = Math.min(maxRatio, Math.max(maxRatioFromPixels, baseMinRatio));
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
      splitLeaf(leaf, orientation) {
          const newLeaf = createLeaf(leaf.view);
          const parentInfo = this.findParent(leaf);
          if (!parentInfo) {
              this.rootNode = createGroup(orientation, [leaf, newLeaf]);
          }
          else {
              const { parent, index } = parentInfo;
              if (parent.orientation === orientation) {
                  const otherSizes = parent.sizes.reduce((sum, size, i) => {
                      if (i === index) {
                          return sum;
                      }
                      return sum + size;
                  }, 0);
                  const fallbackSize = parent.children.length > 0 ? 1 / parent.children.length : 1;
                  const inferredSize = Math.max(1 - otherSizes, 0);
                  const currentSize = parent.sizes[index] ??
                      (inferredSize > 0 ? inferredSize : fallbackSize);
                  const newSize = currentSize / 2;
                  parent.sizes[index] = currentSize - newSize;
                  parent.children.splice(index + 1, 0, newLeaf);
                  parent.sizes.splice(index + 1, 0, newSize);
              }
              else {
                  const replacement = createGroup(orientation, [leaf, newLeaf]);
                  parent.children[index] = replacement;
              }
          }
          this.renderLayout();
      }
      closeLeaf(leaf) {
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
          }
          else if (parent.children.length === 1) {
              this.replaceNode(parent, parent.children[0]);
          }
          else {
              this.normalizeSizes(parent);
          }
          this.renderLayout();
      }
      replaceNode(target, replacement) {
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
      findParent(target, current = this.rootNode) {
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
      normalizeSizes(group) {
          const count = group.children.length;
          if (count === 0) {
              group.sizes = [];
              return;
          }
          const size = 1 / count;
          group.sizes = new Array(count).fill(size);
      }
      refreshAllLeaves() {
          for (const leaf of this.getLeaves()) {
              this.refreshLeafContent(leaf);
          }
      }
      updateLeafHeaderControls(leaf) {
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
          }
          else {
              columnVisibilityButton.setAttribute("aria-hidden", "true");
              columnVisibilityButton.tabIndex = -1;
              hideColumnVisibilityMenu();
          }
          const shouldShowNewAction = leaf.view === "actions" || leaf.view === "actionEditor";
          element.newActionButton.style.display = shouldShowNewAction ? "" : "none";
          if (shouldShowNewAction) {
              element.newActionButton.removeAttribute("aria-hidden");
              element.newActionButton.tabIndex = 0;
          }
          else {
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
              }
              else {
                  element.clearLogsButton.title = "No log entries to clear.";
              }
          }
          else {
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
              followLogsButton.setAttribute("aria-pressed", followEnabled ? "true" : "false");
              followLogsButton.classList.toggle("border-slate-700", !followEnabled);
              followLogsButton.classList.toggle("bg-slate-900/60", !followEnabled);
              followLogsButton.classList.toggle("text-slate-100", !followEnabled);
              followLogsButton.classList.toggle("border-sky-500/70", followEnabled);
              followLogsButton.classList.toggle("bg-sky-500/20", followEnabled);
              followLogsButton.classList.toggle("text-sky-100", followEnabled);
              followLogsButton.title = followEnabled
                  ? "Following latest logs (click to pause)"
                  : "Auto-scroll paused (click to resume)";
          }
          else {
              followLogsButton.setAttribute("aria-hidden", "true");
              followLogsButton.tabIndex = -1;
              followLogsButton.removeAttribute("aria-pressed");
              followLogsButton.removeAttribute("title");
          }
      }
      refreshLeafContent(leaf) {
          const element = leaf.element;
          if (!element) {
              return;
          }
          this.updateLeafHeaderControls(leaf);
          const previousContainer = leaf.contentContainer ??
              element.body.firstElementChild;
          const previousCleanup = leaf.viewCleanup;
          const previousScrollTop = leaf.scrollTop ?? previousContainer?.scrollTop ?? 0;
          const previousScrollLeft = leaf.scrollLeft ?? previousContainer?.scrollLeft ?? 0;
          const lifecycle = this.createViewLifecycle(leaf);
          const nextContainer = buildViewContent(leaf, this.snapshot, () => this.refreshLeafContent(leaf), previousContainer ?? undefined, lifecycle.callbacks, this.viewActions);
          const replaced = !!previousContainer && nextContainer !== previousContainer;
          if (replaced) {
              if (previousCleanup) {
                  previousCleanup();
              }
          }
          const newCleanup = lifecycle.getCleanup();
          if (newCleanup) {
              leaf.viewCleanup = newCleanup;
          }
          else if (!replaced) {
              leaf.viewCleanup = previousCleanup;
          }
          else {
              leaf.viewCleanup = undefined;
          }
          if (!previousContainer ||
              nextContainer !== previousContainer ||
              nextContainer.parentElement !== element.body) {
              element.body.replaceChildren(nextContainer);
          }
          leaf.contentContainer = nextContainer;
          if (nextContainer) {
              const shouldStickToBottom = leaf.view === "logs" &&
                  nextContainer.dataset.logStickToBottom === "true";
              if (shouldStickToBottom) {
                  nextContainer.scrollTop = nextContainer.scrollHeight;
              }
              else {
                  nextContainer.scrollTop = previousScrollTop;
              }
              nextContainer.scrollLeft = previousScrollLeft;
              leaf.scrollTop = nextContainer.scrollTop;
              leaf.scrollLeft = nextContainer.scrollLeft;
              this.bindLeafContainerInteractions(leaf, nextContainer);
          }
          else {
              leaf.scrollTop = 0;
              leaf.scrollLeft = 0;
          }
      }
      scrollLogViewToBottom(leaf) {
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
      createViewLifecycle(leaf) {
          let cleanup;
          const callbacks = {
              registerCleanup: (fn) => {
                  cleanup = fn;
              },
          };
          return {
              callbacks,
              getCleanup: () => cleanup,
          };
      }
      cleanupLeafView(leaf) {
          const cleanup = leaf.viewCleanup;
          leaf.viewCleanup = undefined;
          if (cleanup) {
              cleanup();
          }
      }
      bindLeafContainerInteractions(leaf, container) {
          if (leaf.hoveredRowElement && !leaf.hoveredRowElement.isConnected) {
              leaf.hoveredRowElement = null;
          }
          if (leaf.boundContainer && leaf.boundContainer !== container) {
              if (leaf.scrollHandler) {
                  leaf.boundContainer.removeEventListener("scroll", leaf.scrollHandler);
              }
              if (leaf.pointerLeaveHandler) {
                  leaf.boundContainer.removeEventListener("pointerleave", leaf.pointerLeaveHandler);
              }
          }
          if (leaf.boundContainer !== container) {
              const handleScroll = () => {
                  leaf.scrollTop = container.scrollTop;
                  leaf.scrollLeft = container.scrollLeft;
                  if (leaf.view === "logs") {
                      const nearBottom = container.scrollHeight -
                          container.scrollTop -
                          container.clientHeight <=
                          4;
                      if (nearBottom) {
                          if (!leaf.logFollowEnabled) {
                              leaf.logFollowEnabled = true;
                              this.updateLeafHeaderControls(leaf);
                          }
                      }
                      else if (leaf.logFollowEnabled) {
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
      clearLeafHover(leaf) {
          if (leaf.hoveredRowElement) {
              const highlightClass = leaf.hoveredRowElement.dataset.hoverHighlightClass;
              if (highlightClass) {
                  leaf.hoveredRowElement.classList.remove(highlightClass);
              }
          }
          leaf.hoveredRowElement = null;
          leaf.hoveredRowKey = undefined;
      }
      showPlayerDetails(playerId) {
          for (const leaf of this.getLeaves()) {
              if (leaf.view !== "player") {
                  continue;
              }
              leaf.selectedPlayerId = playerId;
              this.refreshLeafContent(leaf);
          }
      }
      focusPlayerInSidebar(playerId) {
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
      focusTeamInSidebar(teamId) {
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
          const representative = this.snapshot.players.find((player) => this.normalizeTeamId(player.team) === normalized);
          if (representative) {
              for (const leaf of leaves) {
                  if (leaf.view === "players") {
                      this.revealPlayerRow(leaf, representative.id);
                  }
              }
          }
      }
      focusClanInSidebar(clanId) {
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
          const representative = this.snapshot.players.find((player) => this.resolveClanId(player) === normalized);
          if (representative) {
              for (const leaf of leaves) {
                  if (leaf.view === "players") {
                      this.revealPlayerRow(leaf, representative.id);
                  }
              }
          }
      }
      highlightPlayerAcrossViews(player) {
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
              }
          }
      }
      revealPlayerRow(leaf, rowKey) {
          leaf.hoveredRowKey = rowKey;
          leaf.hoveredRowElement = null;
          this.refreshLeafContent(leaf);
          this.scrollRowIntoView(leaf, rowKey);
      }
      revealPlayerInGroup(leaf, groupKey, rowKey) {
          leaf.expandedGroups.add(groupKey);
          this.revealPlayerRow(leaf, rowKey);
      }
      scrollRowIntoView(leaf, rowKey) {
          const container = leaf.contentContainer;
          if (!container) {
              return;
          }
          const row = container.querySelector(`[data-row-key="${rowKey}"]`);
          if (!row) {
              return;
          }
          this.scrollElementIntoView(container, row);
          leaf.scrollTop = container.scrollTop;
          leaf.hoveredRowElement = row;
      }
      scrollGroupIntoView(leaf, groupKey) {
          const container = leaf.contentContainer;
          if (!container) {
              return;
          }
          const group = container.querySelector(`[data-group-key="${groupKey}"]`);
          if (!group) {
              return;
          }
          this.scrollElementIntoView(container, group);
          leaf.scrollTop = container.scrollTop;
          leaf.hoveredRowElement = group;
      }
      scrollElementIntoView(container, element) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const elementTop = elementRect.top - containerRect.top + container.scrollTop;
          const elementBottom = elementRect.bottom - containerRect.top + container.scrollTop;
          const visibleTop = container.scrollTop;
          const visibleBottom = visibleTop + container.clientHeight;
          const padding = container.clientHeight * 0.25;
          if (elementTop < visibleTop) {
              container.scrollTop = Math.max(elementTop - padding, 0);
          }
          else if (elementBottom > visibleBottom) {
              container.scrollTop = Math.max(elementBottom - container.clientHeight + padding, 0);
          }
      }
      getTeamGroupKeyFromId(teamId) {
          return `team:${this.normalizeTeamId(teamId)}`;
      }
      getClanGroupKeyFromId(clanId) {
          return `clan:${this.normalizeClanId(clanId)}`;
      }
      normalizeTeamId(teamId) {
          const trimmed = teamId?.trim();
          return trimmed && trimmed.length > 0 ? trimmed : "Solo";
      }
      normalizeClanId(clanId) {
          const trimmed = clanId?.trim();
          return trimmed && trimmed.length > 0 ? trimmed : "Unaffiliated";
      }
      resolveClanId(player) {
          const tag = extractClanTag(player.name) ?? player.clan;
          return this.normalizeClanId(tag);
      }
      getSelfPlayer(snapshot) {
          return snapshot.players.find((player) => player.isSelf);
      }
      expandSelfClanmates(snapshot) {
          const self = this.getSelfPlayer(snapshot);
          if (!self) {
              return;
          }
          const clanmatesLeaves = this.getLeaves().filter((leaf) => leaf.view === "clanmates");
          if (clanmatesLeaves.length === 0) {
              return;
          }
          const clanTag = extractClanTag(self.name) ?? "Unaffiliated";
          const groupKey = `clan:${clanTag}`;
          for (const leaf of clanmatesLeaves) {
              leaf.expandedGroups.add(groupKey);
          }
      }
      getLeaves(node = this.rootNode, acc = []) {
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

  const listeners = new Set();
  let logEntryCounter = 0;
  function formatLogArg(arg) {
      if (typeof arg === "string") {
          return arg;
      }
      if (typeof arg === "number" ||
          typeof arg === "boolean" ||
          arg === null ||
          arg === undefined) {
          return String(arg);
      }
      if (arg instanceof Error) {
          return arg.stack ?? `${arg.name}: ${arg.message}`;
      }
      try {
          return JSON.stringify(arg);
      }
      catch (error) {
          return String(arg);
      }
  }
  function isLogToken(value) {
      if (!value || typeof value !== "object") {
          return false;
      }
      const token = value;
      if (token.type === "text") {
          return typeof value.text === "string";
      }
      if (token.type === "player" ||
          token.type === "team" ||
          token.type === "clan") {
          const { id, label } = value;
          return typeof id === "string" && typeof label === "string";
      }
      return false;
  }
  function isLogMetadata(value) {
      if (!value || typeof value !== "object") {
          return false;
      }
      const tokens = value.tokens;
      if (tokens === undefined) {
          return false;
      }
      if (!Array.isArray(tokens)) {
          return false;
      }
      return tokens.every((token) => isLogToken(token));
  }
  function extractLogMetadata(args) {
      if (args.length === 0) {
          return { args: [] };
      }
      const last = args[args.length - 1];
      if (isLogMetadata(last)) {
          return { args: Array.from(args.slice(0, -1)), metadata: last };
      }
      return { args: Array.from(args) };
  }
  function sanitizeTokens(tokens) {
      if (!tokens || tokens.length === 0) {
          return undefined;
      }
      const sanitized = [];
      for (const token of tokens) {
          if (token.type === "text") {
              sanitized.push({ type: "text", text: token.text ?? "" });
              continue;
          }
          const label = typeof token.label === "string" ? token.label : "";
          const id = typeof token.id === "string" ? token.id : "";
          const color = typeof token.color === "string" ? token.color : undefined;
          if (!label || !id) {
              continue;
          }
          sanitized.push({ type: token.type, id, label, color });
      }
      return sanitized.length > 0 ? sanitized : undefined;
  }
  function emitLogEntry(level, args, source) {
      const { args: normalizedArgs, metadata } = extractLogMetadata(args);
      const message = normalizedArgs.map((arg) => formatLogArg(arg)).join(" ");
      const entry = {
          id: `log-${++logEntryCounter}`,
          level,
          message,
          timestampMs: Date.now(),
          source,
          tokens: sanitizeTokens(metadata?.tokens),
      };
      for (const listener of listeners) {
          listener(entry);
      }
      return entry;
  }
  function callConsole(method, args) {
      const fn = console[method];
      if (typeof fn === "function") {
          fn.apply(console, args);
          return;
      }
      console.log(...args);
  }
  function logWithConsole(method, level, source, args) {
      callConsole(method, args);
      emitLogEntry(level, args, source);
  }
  function createSidebarLogger(source) {
      return {
          log: (...args) => logWithConsole("log", "info", source, args),
          info: (...args) => logWithConsole("info", "info", source, args),
          warn: (...args) => logWithConsole("warn", "warn", source, args),
          error: (...args) => logWithConsole("error", "error", source, args),
          debug: (...args) => logWithConsole("debug", "debug", source, args),
      };
  }
  const sidebarLogger = createSidebarLogger("Sidebar");
  function subscribeToSidebarLogs(listener) {
      listeners.add(listener);
      return () => {
          listeners.delete(listener);
      };
  }

  function computeMirvSplitPoint(start, target) {
      const startTileX = Math.floor(start.x);
      const targetTileX = Math.floor(target.x);
      const targetTileY = Math.floor(target.y);
      const splitTileX = Math.floor((startTileX + targetTileX) / 2);
      const splitTileY = Math.max(0, targetTileY - 500) + 50;
      return { x: splitTileX + 0.5, y: splitTileY + 0.5 };
  }
  class MissileTrajectoryOverlay {
      constructor(options) {
          this.options = options;
          this.rafHandle = null;
          this.pointer = null;
          this.lastValidPointer = null;
          this.siloPositions = [];
          this.active = false;
          this.attached = false;
          this.hostElement = null;
          this.cleanupCallbacks = [];
          this.cssWidth = 0;
          this.cssHeight = 0;
          this.pixelRatio = 1;
          this.offsetLeft = 0;
          this.offsetTop = 0;
          if (typeof document === "undefined") {
              throw new Error("MissileTrajectoryOverlay requires a browser environment");
          }
          this.canvas = document.createElement("canvas");
          this.canvas.style.position = "fixed";
          this.canvas.style.left = "0";
          this.canvas.style.top = "0";
          this.canvas.style.width = "100%";
          this.canvas.style.height = "100%";
          this.canvas.style.pointerEvents = "none";
          this.canvas.style.zIndex = "30";
          this.canvas.style.display = "none";
          this.context = this.canvas.getContext("2d");
      }
      setSiloPositions(positions) {
          this.siloPositions = positions.map((position) => ({ ...position }));
      }
      enable() {
          if (typeof document === "undefined" || typeof window === "undefined") {
              return;
          }
          if (this.active) {
              return;
          }
          this.active = true;
          this.ensureAttached();
          this.canvas.style.display = "block";
          this.updateCanvasSize();
          this.registerEventListeners();
          this.render();
          this.scheduleRender();
      }
      disable() {
          if (!this.active) {
              return;
          }
          this.active = false;
          this.canvas.style.display = "none";
          this.cancelRender();
          this.cleanupEventListeners();
          this.pointer = null;
          this.lastValidPointer = null;
          this.clearCanvas();
      }
      dispose() {
          this.disable();
          if (this.attached) {
              this.canvas.remove();
              this.attached = false;
              this.hostElement = null;
          }
      }
      registerEventListeners() {
          if (typeof window === "undefined") {
              return;
          }
          if (this.cleanupCallbacks.length > 0) {
              return;
          }
          const handlePointer = (event) => {
              this.pointer = { x: event.clientX, y: event.clientY };
          };
          const handlePointerLeave = () => {
              this.pointer = null;
          };
          const handleResize = () => {
              this.updateCanvasSize();
          };
          window.addEventListener("pointermove", handlePointer, { passive: true });
          window.addEventListener("pointerdown", handlePointer, { passive: true });
          window.addEventListener("pointerleave", handlePointerLeave);
          window.addEventListener("blur", handlePointerLeave);
          window.addEventListener("resize", handleResize);
          this.cleanupCallbacks = [
              () => window.removeEventListener("pointermove", handlePointer),
              () => window.removeEventListener("pointerdown", handlePointer),
              () => window.removeEventListener("pointerleave", handlePointerLeave),
              () => window.removeEventListener("blur", handlePointerLeave),
              () => window.removeEventListener("resize", handleResize),
          ];
      }
      cleanupEventListeners() {
          if (this.cleanupCallbacks.length === 0) {
              return;
          }
          for (const cleanup of this.cleanupCallbacks) {
              try {
                  cleanup();
              }
              catch {
                  // Ignore listener cleanup failures; browser will detach them on navigation.
              }
          }
          this.cleanupCallbacks = [];
      }
      scheduleRender() {
          if (typeof window === "undefined") {
              return;
          }
          if (this.rafHandle !== null) {
              return;
          }
          const loop = () => {
              this.rafHandle = window.requestAnimationFrame(loop);
              this.render();
          };
          this.rafHandle = window.requestAnimationFrame(loop);
      }
      cancelRender() {
          if (typeof window === "undefined") {
              return;
          }
          if (this.rafHandle !== null) {
              window.cancelAnimationFrame(this.rafHandle);
              this.rafHandle = null;
          }
      }
      updateCanvasSize() {
          if (!this.context || typeof window === "undefined") {
              return;
          }
          this.ensureAttached();
          const transform = this.options.resolveTransform?.();
          const rect = transform?.boundingRect?.();
          const width = rect?.width ?? window.innerWidth;
          const height = rect?.height ?? window.innerHeight;
          const left = rect?.left ?? 0;
          const top = rect?.top ?? 0;
          const ratio = window.devicePixelRatio || 1;
          const pixelWidth = Math.round(width * ratio);
          const pixelHeight = Math.round(height * ratio);
          if (this.canvas.width !== pixelWidth ||
              this.canvas.height !== pixelHeight) {
              this.canvas.width = pixelWidth;
              this.canvas.height = pixelHeight;
          }
          if (this.canvas.style.width !== `${width}px`) {
              this.canvas.style.width = `${width}px`;
          }
          if (this.canvas.style.height !== `${height}px`) {
              this.canvas.style.height = `${height}px`;
          }
          const host = this.hostElement;
          let relativeLeft = left;
          let relativeTop = top;
          if (host && host !== document.body) {
              const hostRect = host.getBoundingClientRect();
              relativeLeft = left - hostRect.left;
              relativeTop = top - hostRect.top;
              if (this.canvas.style.position !== "absolute") {
                  this.canvas.style.position = "absolute";
              }
              this.ensureContainerPositioned(host);
          }
          else {
              if (this.canvas.style.position !== "fixed") {
                  this.canvas.style.position = "fixed";
              }
          }
          if (this.canvas.style.left !== `${relativeLeft}px`) {
              this.canvas.style.left = `${relativeLeft}px`;
          }
          if (this.canvas.style.top !== `${relativeTop}px`) {
              this.canvas.style.top = `${relativeTop}px`;
          }
          this.context.setTransform(ratio, 0, 0, ratio, -left * ratio, -top * ratio);
          this.cssWidth = width;
          this.cssHeight = height;
          this.pixelRatio = ratio;
          this.offsetLeft = left;
          this.offsetTop = top;
      }
      clearCanvas() {
          if (!this.context) {
              return;
          }
          this.updateCanvasSize();
          this.context.save();
          this.context.setTransform(1, 0, 0, 1, 0, 0);
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.context.restore();
          this.maskSidebarRegion();
      }
      resolveHostElement() {
          if (typeof document === "undefined") {
              return null;
          }
          const transform = this.options.resolveTransform?.();
          const candidateCanvas = transform?.canvas;
          if (candidateCanvas instanceof HTMLCanvasElement) {
              return candidateCanvas.parentElement ?? candidateCanvas;
          }
          const fallbackCanvas = document.querySelector("canvas");
          if (fallbackCanvas instanceof HTMLCanvasElement) {
              return fallbackCanvas.parentElement ?? fallbackCanvas;
          }
          return document.body;
      }
      ensureAttached() {
          if (typeof document === "undefined") {
              return;
          }
          let container = this.resolveHostElement();
          if (!container) {
              return;
          }
          if (container instanceof HTMLCanvasElement) {
              container = container.parentElement ?? document.body;
          }
          if (!(container instanceof HTMLElement)) {
              return;
          }
          if (this.canvas.parentElement !== container) {
              this.canvas.remove();
              container.appendChild(this.canvas);
          }
          this.hostElement = container;
          this.attached = true;
      }
      ensureContainerPositioned(container) {
          if (typeof window === "undefined") {
              return;
          }
          if (container === document.body) {
              return;
          }
          const position = window.getComputedStyle(container).position;
          if (position === "static") {
              container.style.position = "relative";
          }
      }
      render() {
          const ctx = this.context;
          if (!ctx) {
              return;
          }
          this.updateCanvasSize();
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          ctx.restore();
          this.maskSidebarRegion();
          if (!this.active) {
              return;
          }
          const transform = this.options.resolveTransform();
          const uiState = this.options.resolveUiState();
          if (!transform || !uiState || !this.isNukeSelected(uiState)) {
              return;
          }
          if (this.siloPositions.length === 0) {
              return;
          }
          const rect = transform.boundingRect?.();
          let pointer = this.pointer;
          if (pointer && rect && !this.isPointerInside(rect, pointer)) {
              pointer = null;
          }
          if (pointer && this.isPointerOverSidebar(pointer)) {
              pointer = null;
          }
          pointer = pointer ?? this.lastValidPointer;
          if (!pointer) {
              return;
          }
          if (rect && !this.isPointerInside(rect, pointer)) {
              return;
          }
          this.lastValidPointer = pointer;
          const worldCell = transform.screenToWorldCoordinates(pointer.x, pointer.y);
          if (!this.isFinitePoint(worldCell)) {
              return;
          }
          const targetCell = { x: worldCell.x, y: worldCell.y };
          const targetWorld = {
              x: targetCell.x + 0.5,
              y: targetCell.y + 0.5,
          };
          const targetScreen = transform.worldToScreenCoordinates(targetWorld);
          if (!this.isFinitePoint(targetScreen)) {
              return;
          }
          if (this.siloPositions.length === 0) {
              return;
          }
          ctx.save();
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = 2;
          const activeIndex = this.resolveActiveSiloIndex(targetCell);
          const mirvSelected = this.isMirvSelected(uiState);
          let referenceStart = null;
          let activeStart = null;
          for (let index = 0; index < this.siloPositions.length; index++) {
              const silo = this.siloPositions[index];
              const startWorld = this.toCellCenter(silo);
              const distance = this.distanceBetween(startWorld, targetWorld);
              if (!Number.isFinite(distance) || distance === 0) {
                  continue;
              }
              const startScreen = transform.worldToScreenCoordinates(startWorld);
              if (!this.isFinitePoint(startScreen)) {
                  continue;
              }
              const color = this.normalizeColor(silo.color);
              ctx.save();
              ctx.globalAlpha = index === activeIndex ? 1 : 0.2;
              ctx.strokeStyle = color;
              if (mirvSelected) {
                  this.drawMirvTrajectory(ctx, transform, startWorld, targetWorld, color, index === activeIndex);
              }
              else {
                  const controls = this.computeControlPoints(startWorld, targetWorld);
                  const control1Screen = transform.worldToScreenCoordinates(controls.control1);
                  const control2Screen = transform.worldToScreenCoordinates(controls.control2);
                  if (this.isFinitePoint(control1Screen) &&
                      this.isFinitePoint(control2Screen)) {
                      ctx.beginPath();
                      ctx.moveTo(startScreen.x, startScreen.y);
                      ctx.bezierCurveTo(control1Screen.x, control1Screen.y, control2Screen.x, control2Screen.y, targetScreen.x, targetScreen.y);
                      ctx.stroke();
                  }
              }
              ctx.restore();
              referenceStart = referenceStart ?? startWorld;
              if (index === activeIndex) {
                  activeStart = startWorld;
              }
          }
          const siloRadius = Math.max(2, 4 - transform.scale * 0.15);
          for (let index = 0; index < this.siloPositions.length; index++) {
              const silo = this.siloPositions[index];
              const color = this.normalizeColor(silo.color);
              const screen = transform.worldToScreenCoordinates(this.toCellCenter(silo));
              if (!this.isFinitePoint(screen)) {
                  continue;
              }
              ctx.beginPath();
              ctx.arc(screen.x, screen.y, siloRadius, 0, Math.PI * 2);
              ctx.save();
              ctx.globalAlpha = index === activeIndex ? 0.85 : 0.3;
              ctx.fillStyle = color;
              ctx.fill();
              ctx.restore();
          }
          const activeColor = (activeIndex !== null
              ? this.normalizeColor(this.siloPositions[activeIndex]?.color)
              : this.normalizeColor()) ?? "rgba(2, 132, 199, 0.95)";
          if (mirvSelected) {
              this.drawMirvTargetIndicators(ctx, transform, targetWorld, activeColor, transform.scale, activeStart ?? referenceStart ?? null);
          }
          else {
              const targetRadius = Math.max(3.5, 5 - transform.scale * 0.2);
              ctx.beginPath();
              ctx.arc(targetScreen.x, targetScreen.y, targetRadius, 0, Math.PI * 2);
              ctx.save();
              ctx.globalAlpha = 0.9;
              ctx.fillStyle = activeColor;
              ctx.fill();
              ctx.restore();
              ctx.save();
              ctx.lineWidth = 1.5;
              ctx.globalAlpha = 0.8;
              ctx.strokeStyle = activeColor;
              ctx.stroke();
              ctx.restore();
          }
          ctx.restore();
          this.maskSidebarRegion();
      }
      isFinitePoint(point) {
          return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
      }
      isPointerInside(rect, pointer) {
          return (pointer.x >= rect.left &&
              pointer.x <= rect.right &&
              pointer.y >= rect.top &&
              pointer.y <= rect.bottom);
      }
      isPointerOverSidebar(pointer) {
          if (typeof document === "undefined") {
              return false;
          }
          const sidebar = document.getElementById("openfront-strategic-sidebar");
          if (!sidebar) {
              return false;
          }
          const rect = sidebar.getBoundingClientRect();
          return this.isPointerInside(rect, pointer);
      }
      maskSidebarRegion() {
          if (!this.context || typeof document === "undefined") {
              return;
          }
          const sidebar = document.getElementById("openfront-strategic-sidebar");
          if (!sidebar) {
              return;
          }
          const rect = sidebar.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) {
              return;
          }
          const ratio = this.pixelRatio || 1;
          const offsetLeft = this.offsetLeft || 0;
          const offsetTop = this.offsetTop || 0;
          const x = (rect.left - offsetLeft) * ratio;
          const y = (rect.top - offsetTop) * ratio;
          const width = rect.width * ratio;
          const height = rect.height * ratio;
          if (!Number.isFinite(x) || !Number.isFinite(y)) {
              return;
          }
          this.context.save();
          this.context.setTransform(1, 0, 0, 1, 0, 0);
          this.context.clearRect(x, y, width, height);
          this.context.restore();
      }
      isNukeSelected(uiState) {
          const selection = this.normalizeSelection(uiState.ghostStructure);
          if (!selection) {
              return false;
          }
          return (selection === "atom bomb" ||
              selection === "hydrogen bomb" ||
              selection === "mirv");
      }
      isMirvSelected(uiState) {
          const selection = this.normalizeSelection(uiState.ghostStructure);
          return selection === "mirv";
      }
      toCellCenter(point) {
          return { x: point.x + 0.5, y: point.y + 0.5 };
      }
      normalizeSelection(value) {
          if (typeof value !== "string") {
              return null;
          }
          const normalized = value.replace(/\s+/g, " ").trim().toLowerCase();
          return normalized.length > 0 ? normalized : null;
      }
      drawMirvTrajectory(ctx, transform, startWorld, targetWorld, color, emphasize) {
          const startScreen = transform.worldToScreenCoordinates(startWorld);
          if (!this.isFinitePoint(startScreen)) {
              return;
          }
          const splitWorld = computeMirvSplitPoint(startWorld, targetWorld);
          const splitScreen = transform.worldToScreenCoordinates(splitWorld);
          if (!this.isFinitePoint(splitScreen)) {
              return;
          }
          const splitControls = this.computeControlPoints(startWorld, splitWorld);
          const splitControl1 = transform.worldToScreenCoordinates(splitControls.control1);
          const splitControl2 = transform.worldToScreenCoordinates(splitControls.control2);
          if (!this.isFinitePoint(splitControl1) ||
              !this.isFinitePoint(splitControl2)) {
              return;
          }
          const baseAlpha = emphasize ? 1 : 0.25;
          ctx.save();
          ctx.lineWidth = 2;
          ctx.globalAlpha = baseAlpha * 0.9;
          ctx.beginPath();
          ctx.moveTo(startScreen.x, startScreen.y);
          ctx.bezierCurveTo(splitControl1.x, splitControl1.y, splitControl2.x, splitControl2.y, splitScreen.x, splitScreen.y);
          ctx.stroke();
          const warheadControls = this.computeControlPoints(splitWorld, targetWorld, false);
          const warheadControl1 = transform.worldToScreenCoordinates(warheadControls.control1);
          const warheadControl2 = transform.worldToScreenCoordinates(warheadControls.control2);
          const targetScreen = transform.worldToScreenCoordinates(targetWorld);
          if (this.isFinitePoint(warheadControl1) &&
              this.isFinitePoint(warheadControl2) &&
              this.isFinitePoint(targetScreen)) {
              ctx.save();
              ctx.lineWidth = 1.8;
              ctx.globalAlpha = baseAlpha * 0.75;
              ctx.setLineDash([6, 4]);
              ctx.beginPath();
              ctx.moveTo(splitScreen.x, splitScreen.y);
              ctx.bezierCurveTo(warheadControl1.x, warheadControl1.y, warheadControl2.x, warheadControl2.y, targetScreen.x, targetScreen.y);
              ctx.stroke();
              ctx.restore();
          }
          ctx.restore();
      }
      drawMirvTargetIndicators(ctx, transform, targetWorld, activeColor, scale, referenceStart) {
          const targetScreen = transform.worldToScreenCoordinates(targetWorld);
          if (!this.isFinitePoint(targetScreen)) {
              return;
          }
          const primaryRadius = Math.max(3.5, 5 - scale * 0.2);
          ctx.beginPath();
          ctx.arc(targetScreen.x, targetScreen.y, primaryRadius, 0, Math.PI * 2);
          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = activeColor;
          ctx.fill();
          ctx.restore();
          ctx.save();
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.8;
          ctx.strokeStyle = activeColor;
          ctx.stroke();
          ctx.restore();
          if (referenceStart) {
              const splitWorld = computeMirvSplitPoint(referenceStart, targetWorld);
              const splitScreen = transform.worldToScreenCoordinates(splitWorld);
              if (this.isFinitePoint(splitScreen)) {
                  const splitRadius = Math.max(2.2, 4 - scale * 0.18);
                  ctx.save();
                  ctx.globalAlpha = 0.7;
                  ctx.fillStyle = activeColor;
                  ctx.beginPath();
                  ctx.arc(splitScreen.x, splitScreen.y, splitRadius, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.restore();
              }
          }
      }
      computeControlPoints(start, end, distanceBasedHeight = true) {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxHeight = distanceBasedHeight ? Math.max(distance / 3, 50) : 0;
          const control1 = {
              x: start.x + dx / 4,
              y: Math.max(start.y + dy / 4 - maxHeight, 0),
          };
          const control2 = {
              x: start.x + (dx * 3) / 4,
              y: Math.max(start.y + (dy * 3) / 4 - maxHeight, 0),
          };
          return { control1, control2 };
      }
      resolveActiveSiloIndex(target) {
          if (this.siloPositions.length === 0) {
              return null;
          }
          const candidates = [];
          for (let index = 0; index < this.siloPositions.length; index++) {
              const silo = this.siloPositions[index];
              const distance = this.manhattanDistance(silo, target);
              if (!Number.isFinite(distance)) {
                  continue;
              }
              candidates.push({ index, distance, ready: silo.ready });
          }
          if (candidates.length === 0) {
              return null;
          }
          const ready = candidates.filter((candidate) => candidate.ready);
          const pool = ready.length > 0 ? ready : candidates;
          let best = null;
          for (const candidate of pool) {
              if (best === null || candidate.distance < best.distance) {
                  best = candidate;
              }
          }
          return best?.index ?? null;
      }
      manhattanDistance(a, b) {
          return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      }
      distanceBetween(a, b) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          return Math.sqrt(dx * dx + dy * dy);
      }
      normalizeColor(color) {
          if (color && color.trim()) {
              return color.trim();
          }
          return "rgb(56, 189, 248)";
      }
  }
  class HistoricalMissileTrajectoryOverlay {
      constructor(options) {
          this.options = options;
          this.rafHandle = null;
          this.trajectories = [];
          this.attached = false;
          this.active = false;
          this.hostElement = null;
          this.cssWidth = 0;
          this.cssHeight = 0;
          this.pixelRatio = 1;
          this.offsetLeft = 0;
          this.offsetTop = 0;
          if (typeof document === "undefined") {
              throw new Error("HistoricalMissileTrajectoryOverlay requires a browser environment");
          }
          this.canvas = document.createElement("canvas");
          this.canvas.style.position = "fixed";
          this.canvas.style.left = "0";
          this.canvas.style.top = "0";
          this.canvas.style.width = "100%";
          this.canvas.style.height = "100%";
          this.canvas.style.pointerEvents = "none";
          this.canvas.style.zIndex = "29";
          this.canvas.style.display = "none";
          this.context = this.canvas.getContext("2d");
      }
      setTrajectories(trajectories) {
          this.trajectories = trajectories.map((entry) => ({ ...entry }));
      }
      enable() {
          if (typeof document === "undefined" || typeof window === "undefined") {
              return;
          }
          if (this.active) {
              return;
          }
          this.active = true;
          this.ensureAttached();
          this.canvas.style.display = "block";
          this.updateCanvasSize();
          this.render();
          this.scheduleRender();
      }
      disable() {
          if (!this.active) {
              return;
          }
          this.active = false;
          this.canvas.style.display = "none";
          this.cancelRender();
          this.clearCanvas();
      }
      dispose() {
          this.disable();
          if (this.attached) {
              this.canvas.remove();
              this.attached = false;
              this.hostElement = null;
          }
      }
      scheduleRender() {
          if (typeof window === "undefined") {
              return;
          }
          if (this.rafHandle !== null) {
              return;
          }
          const loop = () => {
              this.rafHandle = window.requestAnimationFrame(loop);
              this.render();
          };
          this.rafHandle = window.requestAnimationFrame(loop);
      }
      cancelRender() {
          if (typeof window === "undefined") {
              return;
          }
          if (this.rafHandle !== null) {
              window.cancelAnimationFrame(this.rafHandle);
              this.rafHandle = null;
          }
      }
      updateCanvasSize() {
          if (!this.context || typeof window === "undefined") {
              return;
          }
          this.ensureAttached();
          const transform = this.options.resolveTransform?.();
          const rect = transform?.boundingRect?.();
          const width = rect?.width ?? window.innerWidth;
          const height = rect?.height ?? window.innerHeight;
          const left = rect?.left ?? 0;
          const top = rect?.top ?? 0;
          const ratio = window.devicePixelRatio || 1;
          const pixelWidth = Math.round(width * ratio);
          const pixelHeight = Math.round(height * ratio);
          if (this.canvas.width !== pixelWidth ||
              this.canvas.height !== pixelHeight) {
              this.canvas.width = pixelWidth;
              this.canvas.height = pixelHeight;
          }
          if (this.canvas.style.width !== `${width}px`) {
              this.canvas.style.width = `${width}px`;
          }
          if (this.canvas.style.height !== `${height}px`) {
              this.canvas.style.height = `${height}px`;
          }
          const host = this.hostElement;
          let relativeLeft = left;
          let relativeTop = top;
          if (host && host !== document.body) {
              const hostRect = host.getBoundingClientRect();
              relativeLeft = left - hostRect.left;
              relativeTop = top - hostRect.top;
              if (this.canvas.style.position !== "absolute") {
                  this.canvas.style.position = "absolute";
              }
              this.ensureContainerPositioned(host);
          }
          else {
              if (this.canvas.style.position !== "fixed") {
                  this.canvas.style.position = "fixed";
              }
          }
          if (this.canvas.style.left !== `${relativeLeft}px`) {
              this.canvas.style.left = `${relativeLeft}px`;
          }
          if (this.canvas.style.top !== `${relativeTop}px`) {
              this.canvas.style.top = `${relativeTop}px`;
          }
          this.context.setTransform(ratio, 0, 0, ratio, -left * ratio, -top * ratio);
          this.cssWidth = width;
          this.cssHeight = height;
          this.pixelRatio = ratio;
          this.offsetLeft = left;
          this.offsetTop = top;
      }
      clearCanvas() {
          if (!this.context) {
              return;
          }
          this.updateCanvasSize();
          this.context.save();
          this.context.setTransform(1, 0, 0, 1, 0, 0);
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.context.restore();
          this.maskSidebarRegion();
      }
      resolveHostElement() {
          if (typeof document === "undefined") {
              return null;
          }
          const transform = this.options.resolveTransform?.();
          const candidateCanvas = transform?.canvas;
          if (candidateCanvas instanceof HTMLCanvasElement) {
              return candidateCanvas.parentElement ?? candidateCanvas;
          }
          const fallbackCanvas = document.querySelector("canvas");
          if (fallbackCanvas instanceof HTMLCanvasElement) {
              return fallbackCanvas.parentElement ?? fallbackCanvas;
          }
          return document.body;
      }
      ensureAttached() {
          if (typeof document === "undefined") {
              return;
          }
          let container = this.resolveHostElement();
          if (!container) {
              return;
          }
          if (container instanceof HTMLCanvasElement) {
              container = container.parentElement ?? document.body;
          }
          if (!(container instanceof HTMLElement)) {
              return;
          }
          if (this.canvas.parentElement !== container) {
              this.canvas.remove();
              container.appendChild(this.canvas);
          }
          this.hostElement = container;
          this.attached = true;
      }
      ensureContainerPositioned(container) {
          if (typeof window === "undefined") {
              return;
          }
          if (container === document.body) {
              return;
          }
          const position = window.getComputedStyle(container).position;
          if (position === "static") {
              container.style.position = "relative";
          }
      }
      render() {
          const ctx = this.context;
          if (!ctx) {
              return;
          }
          this.updateCanvasSize();
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          ctx.restore();
          this.maskSidebarRegion();
          if (!this.active) {
              return;
          }
          const transform = this.options.resolveTransform();
          if (!transform) {
              return;
          }
          if (this.trajectories.length === 0) {
              return;
          }
          ctx.save();
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = 2;
          for (const trajectory of this.trajectories) {
              const variant = this.resolveTrajectoryVariant(trajectory);
              const isMirvWarhead = variant === "mirv-warhead";
              const isMirv = variant === "mirv";
              const origin = this.toCellCenter(trajectory.origin);
              const target = this.toCellCenter(trajectory.target);
              const startScreen = transform.worldToScreenCoordinates(origin);
              const targetScreen = transform.worldToScreenCoordinates(target);
              if (!this.isFinitePoint(startScreen) ||
                  !this.isFinitePoint(targetScreen)) {
                  continue;
              }
              const color = this.normalizeColor(trajectory.color);
              const strokeAlpha = isMirvWarhead ? 0.65 : isMirv ? 0.75 : 0.8;
              const lineWidth = isMirvWarhead ? 1.5 : 2;
              let markerWorld = target;
              ctx.save();
              ctx.strokeStyle = color;
              ctx.globalAlpha = strokeAlpha;
              ctx.lineWidth = lineWidth;
              if (isMirv) {
                  const splitWorld = trajectory.split
                      ? this.toCellCenter(trajectory.split)
                      : computeMirvSplitPoint(origin, target);
                  const splitScreen = transform.worldToScreenCoordinates(splitWorld);
                  const splitControls = this.computeControlPoints(origin, splitWorld);
                  const splitControl1 = transform.worldToScreenCoordinates(splitControls.control1);
                  const splitControl2 = transform.worldToScreenCoordinates(splitControls.control2);
                  if (this.isFinitePoint(splitScreen) &&
                      this.isFinitePoint(splitControl1) &&
                      this.isFinitePoint(splitControl2)) {
                      ctx.beginPath();
                      ctx.moveTo(startScreen.x, startScreen.y);
                      ctx.bezierCurveTo(splitControl1.x, splitControl1.y, splitControl2.x, splitControl2.y, splitScreen.x, splitScreen.y);
                      ctx.stroke();
                      markerWorld = splitWorld;
                  }
              }
              else {
                  const controls = this.computeControlPoints(origin, target, !isMirvWarhead);
                  const control1 = transform.worldToScreenCoordinates(controls.control1);
                  const control2 = transform.worldToScreenCoordinates(controls.control2);
                  const targetScreen = transform.worldToScreenCoordinates(target);
                  if (this.isFinitePoint(control1) &&
                      this.isFinitePoint(control2) &&
                      this.isFinitePoint(targetScreen)) {
                      if (isMirvWarhead) {
                          ctx.setLineDash([4, 3]);
                      }
                      ctx.beginPath();
                      ctx.moveTo(startScreen.x, startScreen.y);
                      ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, targetScreen.x, targetScreen.y);
                      ctx.stroke();
                  }
              }
              ctx.restore();
              const originScreen = startScreen;
              const originRadius = Math.max(isMirvWarhead ? 1.8 : 2, (isMirvWarhead ? 3.5 : 4) - transform.scale * 0.15);
              ctx.save();
              ctx.fillStyle = color;
              ctx.globalAlpha = isMirvWarhead ? 0.35 : 0.4;
              ctx.beginPath();
              ctx.arc(originScreen.x, originScreen.y, originRadius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
              if (markerWorld) {
                  const markerScreen = transform.worldToScreenCoordinates(markerWorld);
                  if (this.isFinitePoint(markerScreen)) {
                      const targetRadius = Math.max(isMirvWarhead ? 2.8 : isMirv ? 3 : 3.5, (isMirvWarhead ? 4.5 : 5) - transform.scale * 0.2);
                      ctx.save();
                      ctx.fillStyle = color;
                      ctx.globalAlpha = isMirvWarhead ? 0.75 : isMirv ? 0.8 : 0.85;
                      ctx.beginPath();
                      ctx.arc(markerScreen.x, markerScreen.y, targetRadius, 0, Math.PI * 2);
                      ctx.fill();
                      ctx.restore();
                  }
              }
              if (trajectory.current) {
                  const currentScreen = transform.worldToScreenCoordinates(this.toCellCenter(trajectory.current));
                  if (this.isFinitePoint(currentScreen)) {
                      const currentRadius = Math.max(isMirvWarhead ? 2 : 2.5, (isMirvWarhead ? 3.8 : 4.5) - transform.scale * 0.18);
                      ctx.save();
                      ctx.fillStyle = color;
                      ctx.globalAlpha = isMirvWarhead ? 0.95 : 1;
                      ctx.beginPath();
                      ctx.arc(currentScreen.x, currentScreen.y, currentRadius, 0, Math.PI * 2);
                      ctx.fill();
                      ctx.restore();
                  }
              }
          }
          ctx.restore();
          this.maskSidebarRegion();
      }
      maskSidebarRegion() {
          if (!this.context || typeof document === "undefined") {
              return;
          }
          const sidebar = document.getElementById("openfront-strategic-sidebar");
          if (!sidebar) {
              return;
          }
          const rect = sidebar.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) {
              return;
          }
          const ratio = this.pixelRatio || 1;
          const offsetLeft = this.offsetLeft || 0;
          const offsetTop = this.offsetTop || 0;
          const x = (rect.left - offsetLeft) * ratio;
          const y = (rect.top - offsetTop) * ratio;
          const width = rect.width * ratio;
          const height = rect.height * ratio;
          if (!Number.isFinite(x) || !Number.isFinite(y)) {
              return;
          }
          this.context.save();
          this.context.setTransform(1, 0, 0, 1, 0, 0);
          this.context.clearRect(x, y, width, height);
          this.context.restore();
      }
      isFinitePoint(point) {
          return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
      }
      toCellCenter(point) {
          return { x: point.x + 0.5, y: point.y + 0.5 };
      }
      computeControlPoints(start, end, distanceBasedHeight = true) {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxHeight = distanceBasedHeight ? Math.max(distance / 3, 50) : 0;
          const control1 = {
              x: start.x + dx / 4,
              y: Math.max(start.y + dy / 4 - maxHeight, 0),
          };
          const control2 = {
              x: start.x + (dx * 3) / 4,
              y: Math.max(start.y + (dy * 3) / 4 - maxHeight, 0),
          };
          return { control1, control2 };
      }
      resolveTrajectoryVariant(trajectory) {
          const normalized = trajectory.unitType
              ?.toString()
              .replace(/\s+/g, "")
              .toLowerCase();
          if (normalized === "mirvwarhead") {
              return "mirv-warhead";
          }
          if (normalized === "mirv") {
              return "mirv";
          }
          return "standard";
      }
      normalizeColor(color) {
          if (color && color.trim()) {
              return color.trim();
          }
          return "rgb(56, 189, 248)";
      }
  }
  const SVG_NS = "http://www.w3.org/2000/svg";
  class DonationOverlay {
      constructor(options) {
          this.options = options;
          this.entries = new Map();
          this.playerSnapshots = new Map();
          this.rafHandle = null;
          this.attached = false;
          this.active = false;
          this.hostElement = null;
          this.offsetLeft = 0;
          this.offsetTop = 0;
          this.cssWidth = 0;
          this.cssHeight = 0;
          this.nextEntryId = 0;
          if (typeof document === "undefined") {
              throw new Error("DonationOverlay requires a browser environment");
          }
          this.container = document.createElement("div");
          this.container.style.position = "fixed";
          this.container.style.left = "0";
          this.container.style.top = "0";
          this.container.style.width = "100%";
          this.container.style.height = "100%";
          this.container.style.pointerEvents = "none";
          this.container.style.zIndex = "31";
          this.container.style.display = "none";
          this.container.style.fontFamily =
              'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          this.svg = document.createElementNS(SVG_NS, "svg");
          this.svg.setAttribute("xmlns", SVG_NS);
          this.svg.setAttribute("fill", "none");
          this.svg.style.position = "absolute";
          this.svg.style.left = "0";
          this.svg.style.top = "0";
          this.svg.style.width = "100%";
          this.svg.style.height = "100%";
          this.svg.style.pointerEvents = "none";
          this.defs = document.createElementNS(SVG_NS, "defs");
          this.svg.appendChild(this.defs);
          this.labelLayer = document.createElement("div");
          this.labelLayer.style.position = "absolute";
          this.labelLayer.style.left = "0";
          this.labelLayer.style.top = "0";
          this.labelLayer.style.width = "100%";
          this.labelLayer.style.height = "100%";
          this.labelLayer.style.pointerEvents = "none";
          this.container.appendChild(this.svg);
          this.container.appendChild(this.labelLayer);
          const colorCanvas = document.createElement("canvas");
          this.colorContext = colorCanvas.getContext("2d");
          this.labelIcon = options.labelIcon;
      }
      enable() {
          if (typeof document === "undefined" || typeof window === "undefined") {
              return;
          }
          if (this.active) {
              return;
          }
          this.active = true;
          this.ensureAttached();
          this.container.style.display = "block";
          this.updateContainerFrame();
          this.render();
          this.scheduleRender();
      }
      disable() {
          if (!this.active) {
              return;
          }
          this.active = false;
          this.container.style.display = "none";
          this.cancelRender();
          this.clearEntries();
      }
      dispose() {
          this.disable();
          if (this.attached) {
              this.container.remove();
              this.attached = false;
              this.hostElement = null;
          }
      }
      isActive() {
          return this.active;
      }
      registerDonation(donation, options) {
          if (!this.active) {
              return;
          }
          const now = this.now();
          const id = `donation-${this.nextEntryId}`;
          this.nextEntryId += 1;
          const line = document.createElementNS(SVG_NS, "line");
          line.setAttribute("stroke-width", "2.5");
          line.setAttribute("stroke-linecap", "round");
          line.style.opacity = "0";
          this.svg.appendChild(line);
          const marker = this.createArrowMarker("rgba(59, 130, 246, 0.9)");
          line.setAttribute("marker-end", `url(#${marker.id})`);
          const label = document.createElement("div");
          label.style.position = "absolute";
          label.style.padding = "4px 8px";
          label.style.borderRadius = "6px";
          label.style.fontSize = "0.7rem";
          label.style.fontWeight = "600";
          label.style.letterSpacing = "0.02em";
          label.style.color = "#e2e8f0";
          label.style.background = "rgba(15, 23, 42, 0.85)";
          label.style.boxShadow = "0 4px 12px rgba(2, 6, 23, 0.35)";
          label.style.whiteSpace = "nowrap";
          label.style.transform = "translate(-50%, -50%)";
          label.style.opacity = "0";
          label.style.display = "inline-flex";
          label.style.alignItems = "center";
          label.style.gap = "6px";
          const text = document.createElement("span");
          text.textContent = `${donation.amountDisplay} • ${donation.senderName} → ${donation.recipientName}`;
          const icon = this.createLabelIcon();
          if (icon) {
              label.appendChild(icon);
          }
          label.appendChild(text);
          this.labelLayer.appendChild(label);
          const entry = {
              id,
              senderId: donation.senderId,
              recipientId: donation.recipientId,
              label,
              line,
              marker,
              createdAt: now,
              lifespanMs: 8000,
              fadeMs: 1600,
              strokeColor: "rgba(59, 130, 246, 0.9)",
              fallbackColor: options?.fallbackColor,
          };
          this.entries.set(id, entry);
      }
      createLabelIcon() {
          if (!this.labelIcon) {
              return null;
          }
          const svg = createElement$1(this.labelIcon);
          svg.setAttribute("aria-hidden", "true");
          svg.style.width = "14px";
          svg.style.height = "14px";
          svg.style.flexShrink = "0";
          svg.style.color = "inherit";
          return svg;
      }
      setPlayerSnapshots(snapshots) {
          this.playerSnapshots.clear();
          for (const snapshot of snapshots) {
              this.playerSnapshots.set(snapshot.id, snapshot);
          }
      }
      clear() {
          this.playerSnapshots.clear();
          this.clearEntries();
      }
      createArrowMarker(color) {
          const marker = document.createElementNS(SVG_NS, "marker");
          marker.id = `donation-arrow-${this.nextEntryId}-${Math.floor(Math.random() * 1000000)}`;
          marker.setAttribute("viewBox", "0 0 10 10");
          marker.setAttribute("refX", "9");
          marker.setAttribute("refY", "5");
          marker.setAttribute("markerWidth", "6");
          marker.setAttribute("markerHeight", "6");
          marker.setAttribute("orient", "auto");
          const path = document.createElementNS(SVG_NS, "path");
          path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
          path.setAttribute("fill", color);
          marker.appendChild(path);
          this.defs.appendChild(marker);
          return marker;
      }
      now() {
          if (typeof performance !== "undefined" && performance.now) {
              return this.options.now?.() ?? performance.now();
          }
          return this.options.now?.() ?? Date.now();
      }
      scheduleRender() {
          if (typeof window === "undefined") {
              return;
          }
          if (this.rafHandle !== null) {
              return;
          }
          const loop = () => {
              this.rafHandle = window.requestAnimationFrame(loop);
              this.render();
          };
          this.rafHandle = window.requestAnimationFrame(loop);
      }
      cancelRender() {
          if (typeof window === "undefined") {
              return;
          }
          if (this.rafHandle !== null) {
              window.cancelAnimationFrame(this.rafHandle);
              this.rafHandle = null;
          }
      }
      updateContainerFrame() {
          if (typeof window === "undefined") {
              return;
          }
          this.ensureAttached();
          const transform = this.options.resolveTransform?.();
          const rect = transform?.boundingRect?.();
          const width = rect?.width ?? window.innerWidth;
          const height = rect?.height ?? window.innerHeight;
          const left = rect?.left ?? 0;
          const top = rect?.top ?? 0;
          if (this.cssWidth !== width) {
              this.container.style.width = `${width}px`;
              this.cssWidth = width;
          }
          if (this.cssHeight !== height) {
              this.container.style.height = `${height}px`;
              this.cssHeight = height;
          }
          let relativeLeft = left;
          let relativeTop = top;
          const host = this.hostElement;
          if (host && host !== document.body) {
              const hostRect = host.getBoundingClientRect();
              relativeLeft = left - hostRect.left;
              relativeTop = top - hostRect.top;
              if (this.container.style.position !== "absolute") {
                  this.container.style.position = "absolute";
              }
              this.ensureContainerPositioned(host);
          }
          else if (this.container.style.position !== "fixed") {
              this.container.style.position = "fixed";
          }
          if (this.container.style.left !== `${relativeLeft}px`) {
              this.container.style.left = `${relativeLeft}px`;
          }
          if (this.container.style.top !== `${relativeTop}px`) {
              this.container.style.top = `${relativeTop}px`;
          }
          this.offsetLeft = left;
          this.offsetTop = top;
          this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      }
      ensureAttached() {
          if (typeof document === "undefined") {
              return;
          }
          let container = this.resolveHostElement();
          if (!container) {
              return;
          }
          if (container instanceof HTMLCanvasElement) {
              container = container.parentElement ?? document.body;
          }
          if (!(container instanceof HTMLElement)) {
              return;
          }
          if (this.container.parentElement !== container) {
              this.container.remove();
              container.appendChild(this.container);
          }
          this.hostElement = container;
          this.attached = true;
      }
      resolveHostElement() {
          if (typeof document === "undefined") {
              return null;
          }
          const transform = this.options.resolveTransform?.();
          const candidateCanvas = transform?.canvas;
          if (candidateCanvas instanceof HTMLCanvasElement) {
              return candidateCanvas.parentElement ?? candidateCanvas;
          }
          const fallbackCanvas = document.querySelector("canvas");
          if (fallbackCanvas instanceof HTMLCanvasElement) {
              return fallbackCanvas.parentElement ?? fallbackCanvas;
          }
          return document.body;
      }
      ensureContainerPositioned(container) {
          if (typeof window === "undefined") {
              return;
          }
          if (container === document.body) {
              return;
          }
          const position = window.getComputedStyle(container).position;
          if (position === "static") {
              container.style.position = "relative";
          }
      }
      render() {
          if (!this.active) {
              return;
          }
          const transform = this.options.resolveTransform?.();
          if (!transform) {
              this.hideAllEntries();
              return;
          }
          this.updateContainerFrame();
          const now = this.now();
          const removals = [];
          for (const [id, entry] of this.entries) {
              const sender = this.playerSnapshots.get(entry.senderId);
              const recipient = this.playerSnapshots.get(entry.recipientId);
              if (!sender || !recipient) {
                  removals.push(id);
                  continue;
              }
              if (!sender.alive || !recipient.alive) {
                  removals.push(id);
                  continue;
              }
              if (sender.x === undefined ||
                  sender.x === null ||
                  sender.y === undefined ||
                  sender.y === null ||
                  recipient.x === undefined ||
                  recipient.x === null ||
                  recipient.y === undefined ||
                  recipient.y === null) {
                  this.hideEntry(entry);
                  continue;
              }
              const start = transform.worldToScreenCoordinates({
                  x: sender.x,
                  y: sender.y,
              });
              const end = transform.worldToScreenCoordinates({
                  x: recipient.x,
                  y: recipient.y,
              });
              const localStartX = start.x - this.offsetLeft;
              const localStartY = start.y - this.offsetTop;
              const localEndX = end.x - this.offsetLeft;
              const localEndY = end.y - this.offsetTop;
              entry.line.setAttribute("x1", localStartX.toFixed(2));
              entry.line.setAttribute("y1", localStartY.toFixed(2));
              entry.line.setAttribute("x2", localEndX.toFixed(2));
              entry.line.setAttribute("y2", localEndY.toFixed(2));
              entry.line.style.display = "";
              const midpointX = (localStartX + localEndX) / 2;
              const midpointY = (localStartY + localEndY) / 2;
              entry.label.style.left = `${midpointX}px`;
              entry.label.style.top = `${midpointY}px`;
              entry.label.style.display = "inline-flex";
              const baseColor = sender.color ?? entry.baseColor ?? entry.fallbackColor ?? "#38bdf8";
              if (baseColor !== entry.baseColor) {
                  entry.baseColor = baseColor;
                  entry.strokeColor = this.darkenColor(baseColor);
                  entry.line.setAttribute("stroke", entry.strokeColor);
                  this.updateMarkerColor(entry.marker, entry.strokeColor);
              }
              const elapsed = now - entry.createdAt;
              if (elapsed >= entry.lifespanMs) {
                  removals.push(id);
                  continue;
              }
              const fadeStart = entry.lifespanMs - entry.fadeMs;
              let opacity = 1;
              if (elapsed > fadeStart) {
                  opacity = Math.max(0, 1 - (elapsed - fadeStart) / entry.fadeMs);
              }
              entry.line.style.opacity = opacity.toFixed(3);
              entry.label.style.opacity = opacity.toFixed(3);
          }
          for (const id of removals) {
              this.removeEntry(id);
          }
      }
      hideAllEntries() {
          for (const entry of this.entries.values()) {
              this.hideEntry(entry);
          }
      }
      hideEntry(entry) {
          entry.line.style.display = "none";
          entry.label.style.display = "none";
      }
      clearEntries() {
          for (const id of Array.from(this.entries.keys())) {
              this.removeEntry(id);
          }
      }
      removeEntry(id) {
          const entry = this.entries.get(id);
          if (!entry) {
              return;
          }
          entry.line.remove();
          entry.label.remove();
          entry.marker.remove();
          this.entries.delete(id);
      }
      updateMarkerColor(marker, color) {
          const path = marker.firstElementChild;
          if (path) {
              path.setAttribute("fill", color);
          }
      }
      darkenColor(color) {
          const parsed = this.parseColor(color);
          if (!parsed) {
              return "rgba(30, 64, 175, 0.9)";
          }
          const factor = 0.5;
          const r = Math.max(0, Math.min(255, Math.round(parsed.r * factor)));
          const g = Math.max(0, Math.min(255, Math.round(parsed.g * factor)));
          const b = Math.max(0, Math.min(255, Math.round(parsed.b * factor)));
          const alpha = Math.max(0, Math.min(1, parsed.a));
          return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
      }
      parseColor(color) {
          if (!color || typeof color !== "string") {
              return null;
          }
          if (!this.colorContext) {
              return null;
          }
          try {
              this.colorContext.fillStyle = "#000";
              this.colorContext.fillStyle = color;
              const computed = this.colorContext.fillStyle;
              if (typeof computed !== "string" || !computed) {
                  return null;
              }
              if (computed.startsWith("#")) {
                  const hex = computed.slice(1);
                  if (hex.length === 6) {
                      const r = parseInt(hex.slice(0, 2), 16);
                      const g = parseInt(hex.slice(2, 4), 16);
                      const b = parseInt(hex.slice(4, 6), 16);
                      return { r, g, b, a: 1 };
                  }
              }
              const match = /rgba?\(([^)]+)\)/.exec(computed);
              if (!match) {
                  return null;
              }
              const parts = match[1]
                  .split(",")
                  .map((segment) => segment.trim())
                  .filter((segment) => segment.length > 0);
              if (parts.length < 3) {
                  return null;
              }
              const [rRaw, gRaw, bRaw, aRaw] = parts;
              const r = this.parseChannel(rRaw);
              const g = this.parseChannel(gRaw);
              const b = this.parseChannel(bRaw);
              const a = aRaw !== undefined ? Number(aRaw) : 1;
              if ([r, g, b].some((value) => Number.isNaN(value))) {
                  return null;
              }
              return { r, g, b, a: Number.isFinite(a) ? a : 1 };
          }
          catch {
              return null;
          }
      }
      parseChannel(value) {
          if (value.endsWith("%")) {
              const percentage = Number(value.slice(0, -1));
              if (!Number.isFinite(percentage)) {
                  return NaN;
              }
              return Math.max(0, Math.min(255, Math.round((percentage / 100) * 255)));
          }
          const numeric = Number(value);
          if (Number.isFinite(numeric)) {
              return Math.max(0, Math.min(255, Math.round(numeric)));
          }
          return NaN;
      }
  }
  class TroopDonationOverlay extends DonationOverlay {
      constructor(options) {
          super({ ...options, labelIcon: options.labelIcon ?? Users });
      }
  }
  class GoldDonationOverlay extends DonationOverlay {
      constructor(options) {
          super({ ...options, labelIcon: options.labelIcon ?? CirclePoundSterling });
      }
  }

  const TICK_MILLISECONDS = 100;
  const MAX_LOG_ENTRIES = 500;
  const STRUCTURE_UNIT_TYPES = new Set([
      "City",
      "Port",
      "Factory",
      "Missile Silo",
      "Defense Post",
      "SAM Launcher",
  ]);
  const MISSILE_TRAJECTORY_OVERLAY_ID = "missile-trajectories";
  const HISTORICAL_MISSILE_OVERLAY_ID = "historical-missiles";
  const DONATION_DEDUP_TICK_WINDOW = 5;
  const TROOP_DONATION_OVERLAY_ID = "troop-donations";
  const GOLD_DONATION_OVERLAY_ID = "gold-donations";
  // These constants mirror the values defined in src/core/game/GameUpdates.ts and Game.ts.
  const GAME_UPDATE_TYPE_DISPLAY_EVENT = 3;
  const MESSAGE_TYPE_SENT_GOLD_TO_PLAYER = 18;
  const MESSAGE_TYPE_RECEIVED_GOLD_FROM_PLAYER = 19;
  const MESSAGE_TYPE_SENT_TROOPS_TO_PLAYER = 21;
  const MESSAGE_TYPE_RECEIVED_TROOPS_FROM_PLAYER = 22;
  const UNKNOWN_SCOPE_KEY = "__unknown__";
  function isPromiseLike(value) {
      return (value !== null &&
          (typeof value === "object" || typeof value === "function") &&
          typeof value.then === "function");
  }
  class ActionEventManager {
      constructor(label, register, touch) {
          this.label = label;
          this.register = register;
          this.touch = touch;
          this.subscriptions = new Set();
      }
      on(eventName, handler, options) {
          const listener = (payload) => {
              const typed = payload;
              if (options?.filter && !options.filter(typed)) {
                  return;
              }
              try {
                  const output = handler(typed);
                  if (isPromiseLike(output)) {
                      void output.then(undefined, (error) => {
                          sidebarLogger.error(`${this.label} event handler failed for ${eventName}`, error);
                      });
                  }
              }
              catch (error) {
                  sidebarLogger.error(`${this.label} event handler failed for ${eventName}`, error);
              }
              finally {
                  this.touch();
              }
          };
          const unregister = this.register(eventName, listener);
          const disposer = () => {
              unregister();
              this.subscriptions.delete(disposer);
          };
          this.subscriptions.add(disposer);
          return disposer;
      }
      once(eventName, handler, options) {
          let active = true;
          let disposer = () => undefined;
          disposer = this.on(eventName, (payload) => {
              if (!active) {
                  return;
              }
              active = false;
              try {
                  handler(payload);
              }
              finally {
                  disposer();
              }
          }, options);
          return () => {
              if (active) {
                  active = false;
                  disposer();
              }
          };
      }
      oncePerTeam(eventName, handler, options) {
          return this.oncePerKey(eventName, (payload) => payload.team ?? undefined, handler, options);
      }
      oncePerClan(eventName, handler, options) {
          return this.oncePerKey(eventName, (payload) => payload.clan ?? undefined, handler, options);
      }
      dispose() {
          const entries = Array.from(this.subscriptions);
          for (const dispose of entries) {
              dispose();
          }
          this.subscriptions.clear();
      }
      oncePerKey(eventName, keySelector, handler, options) {
          const seen = new Set();
          return this.on(eventName, (payload) => {
              const rawKey = keySelector(payload);
              if (rawKey === null) {
                  return;
              }
              const key = rawKey === undefined || rawKey === ""
                  ? UNKNOWN_SCOPE_KEY
                  : String(rawKey);
              if (seen.has(key)) {
                  return;
              }
              seen.add(key);
              handler(payload);
          }, options);
      }
  }
  class DataStore {
      constructor(initialSnapshot) {
          this.listeners = new Set();
          this.game = null;
          this.previousAlliances = new Map();
          this.traitorHistory = new Map();
          this.shipOrigins = new Map();
          this.shipDestinations = new Map();
          this.shipManifests = new Map();
          this.missileOrigins = new Map();
          this.missileTargets = new Map();
          this.actionIdCounter = 0;
          this.runningActionIdCounter = 0;
          this.settingIdCounter = 0;
          this.runningRemovalTimers = new Map();
          this.actionRuntimes = new Map();
          this.actionEventListeners = new Map();
          this.actionEventManagers = new Map();
          this.eventCleanupHandlers = new Map();
          this.knownStructureIds = new Set();
          this.structuresInitialized = false;
          this.sidebarLogs = [];
          this.sidebarLogRevision = 0;
          this.sidebarOverlays = [];
          this.sidebarOverlayRevision = 0;
          this.displayEventPollingActive = false;
          this.displayEventPollingLastTimestamp = 0;
          this.lastProcessedDisplayUpdates = null;
          this.recentTroopDonations = new Map();
          this.recentGoldDonations = new Map();
          this.actionsState = this.createInitialActionsState();
          this.sidebarOverlays = [
              {
                  id: MISSILE_TRAJECTORY_OVERLAY_ID,
                  label: "Missile trajectories",
                  description: "Draws projected missile paths from each silo to your selected Atom or Hydrogen bomb target.",
                  enabled: false,
              },
              {
                  id: HISTORICAL_MISSILE_OVERLAY_ID,
                  label: "Active missile trajectories",
                  description: "Shows the live flight paths for missiles currently in the air, colored by their owners.",
                  enabled: false,
              },
              {
                  id: TROOP_DONATION_OVERLAY_ID,
                  label: "Troop donations",
                  description: "Shows temporary arrows and labels across the map when players send troops to each other.",
                  enabled: false,
              },
              {
                  id: GOLD_DONATION_OVERLAY_ID,
                  label: "Gold donations",
                  description: "Shows temporary arrows and labels across the map when players send gold to each other.",
                  enabled: false,
              },
          ];
          this.sidebarOverlayRevision = 1;
          if (initialSnapshot?.sidebarLogs?.length) {
              this.sidebarLogs = [...initialSnapshot.sidebarLogs];
              this.sidebarLogRevision = initialSnapshot.sidebarLogRevision ?? 0;
          }
          const baseSnapshot = initialSnapshot ?? {
              players: [],
              allianceDurationMs: 0,
              currentTimeMs: Date.now(),
              ships: [],
          };
          this.snapshot = this.attachActionsState({
              ...baseSnapshot,
              currentTimeMs: baseSnapshot.currentTimeMs ?? Date.now(),
              ships: baseSnapshot.ships ?? [],
          });
          this.logSubscriptionCleanup = subscribeToSidebarLogs((entry) => {
              this.appendLogEntry(entry);
          });
          if (typeof window !== "undefined") {
              window.addEventListener("beforeunload", () => this.logSubscriptionCleanup(), { once: true });
          }
          if (typeof window !== "undefined") {
              this.scheduleGameDiscovery(true);
          }
          this.ensureAllEventActionsRunning();
      }
      attachActionsState(snapshot) {
          return {
              ...snapshot,
              sidebarActions: this.actionsState,
              sidebarLogs: this.sidebarLogs.slice(),
              sidebarLogRevision: this.sidebarLogRevision,
              sidebarOverlays: this.cloneSidebarOverlays(),
              sidebarOverlayRevision: this.sidebarOverlayRevision,
          };
      }
      cloneSidebarOverlays() {
          return this.sidebarOverlays.map((overlay) => ({ ...overlay }));
      }
      ensureMissileOverlay() {
          this.missileOverlay =
              this.missileOverlay ??
                  new MissileTrajectoryOverlay({
                      resolveTransform: () => this.resolveTransformHandler(),
                      resolveUiState: () => this.resolveUiState(),
                  });
          return this.missileOverlay;
      }
      ensureHistoricalMissileOverlay() {
          this.historicalMissileOverlay =
              this.historicalMissileOverlay ??
                  new HistoricalMissileTrajectoryOverlay({
                      resolveTransform: () => this.resolveTransformHandler(),
                  });
          return this.historicalMissileOverlay;
      }
      ensureTroopDonationOverlay() {
          this.troopDonationOverlay =
              this.troopDonationOverlay ??
                  new TroopDonationOverlay({
                      resolveTransform: () => this.resolveTransformHandler(),
                  });
          return this.troopDonationOverlay;
      }
      ensureGoldDonationOverlay() {
          this.goldDonationOverlay =
              this.goldDonationOverlay ??
                  new GoldDonationOverlay({
                      resolveTransform: () => this.resolveTransformHandler(),
                  });
          return this.goldDonationOverlay;
      }
      collectMissileSiloPositions() {
          if (!this.game) {
              return [];
          }
          let units;
          try {
              units = this.game.units("Missile Silo");
          }
          catch (error) {
              console.warn("Failed to enumerate missile silos", error);
              return [];
          }
          const positions = [];
          for (const unit of units) {
              const tile = this.describeTile(unit.tile());
              if (tile) {
                  let owner = null;
                  try {
                      owner = unit.owner();
                  }
                  catch (error) {
                      console.warn("Failed to resolve missile silo owner", error);
                  }
                  positions.push({
                      x: tile.x,
                      y: tile.y,
                      ready: this.isMissileSiloReady(unit),
                      ownerId: owner ? this.safePlayerId(owner) : undefined,
                      color: this.resolvePlayerColor(owner),
                  });
              }
          }
          return positions;
      }
      collectMissileSiloOrigins() {
          if (!this.game) {
              return [];
          }
          const silos = this.collectMissileSiloPositions();
          const origins = [];
          for (const silo of silos) {
              let ref;
              try {
                  if (this.game.isValidCoord(silo.x, silo.y)) {
                      ref = this.game.ref(silo.x, silo.y);
                  }
              }
              catch (error) {
                  console.warn("Failed to resolve missile silo ref", error);
                  ref = undefined;
              }
              if (ref === undefined) {
                  continue;
              }
              const summary = this.describeTile(ref);
              if (!summary) {
                  continue;
              }
              origins.push({
                  ...summary,
                  ownerId: silo.ownerId ?? summary.ownerId,
              });
          }
          return origins;
      }
      syncMissileOverlaySilos() {
          if (!this.missileOverlay) {
              return;
          }
          this.missileOverlay.setSiloPositions(this.collectMissileSiloPositions());
      }
      collectHistoricalMissiles() {
          if (!this.game) {
              return [];
          }
          const mirvLaunchOrigins = this.collectMissileSiloOrigins();
          let units;
          try {
              units = this.game.units("Atom Bomb", "Hydrogen Bomb", "MIRV", "MIRV Warhead");
          }
          catch (error) {
              console.warn("Failed to enumerate missiles in flight", error);
              return [];
          }
          const flights = [];
          for (const unit of units) {
              let owner = null;
              try {
                  owner = unit.owner();
              }
              catch (error) {
                  console.warn("Failed to resolve missile owner", error);
              }
              const ownerId = owner ? this.safePlayerId(owner) : undefined;
              let unitType = "Missile";
              try {
                  const resolved = unit.type();
                  if (resolved) {
                      unitType = resolved;
                  }
              }
              catch (error) {
                  console.warn("Failed to resolve missile type", error);
              }
              const normalizedType = unitType.replace(/\s+/g, "").toLowerCase();
              const isMirv = normalizedType === "mirv";
              const isMirvWarhead = normalizedType === "mirvwarhead";
              let rawId;
              try {
                  rawId = String(unit.id());
              }
              catch (error) {
                  console.warn("Failed to resolve missile id", error);
              }
              const currentTile = this.describeTile(unit.tile());
              const targetRef = (() => {
                  try {
                      return unit.targetTile();
                  }
                  catch (error) {
                      console.warn("Failed to resolve missile target tile", error);
                      return undefined;
                  }
              })();
              const lastTile = this.describeTile(unit.lastTile());
              const targetTile = targetRef === undefined ? undefined : this.describeTile(targetRef);
              let missileId = rawId;
              let resolvedTarget = targetTile;
              if (!resolvedTarget && missileId) {
                  const cachedTarget = this.missileTargets.get(missileId);
                  if (cachedTarget) {
                      resolvedTarget = { ...cachedTarget };
                  }
              }
              if (!resolvedTarget && isMirv) {
                  resolvedTarget = currentTile ?? lastTile ?? undefined;
              }
              if (!resolvedTarget) {
                  if (missileId) {
                      this.missileTargets.delete(missileId);
                  }
                  if (rawId) {
                      this.missileOrigins.delete(rawId);
                  }
                  continue;
              }
              missileId =
                  missileId ?? this.composeMissileKey(unitType, resolvedTarget, ownerId);
              const cachedTarget = this.missileTargets.get(missileId);
              if (targetTile) {
                  this.missileTargets.set(missileId, { ...targetTile });
                  resolvedTarget = targetTile;
              }
              else if (cachedTarget) {
                  resolvedTarget = { ...cachedTarget };
              }
              else {
                  this.missileTargets.set(missileId, { ...resolvedTarget });
              }
              let reachedTarget = false;
              try {
                  reachedTarget = unit.reachedTarget();
              }
              catch (error) {
                  console.warn("Failed to inspect missile progress", error);
                  this.missileOrigins.delete(missileId);
                  this.missileTargets.delete(missileId);
                  continue;
              }
              if (reachedTarget) {
                  this.missileOrigins.delete(missileId);
                  this.missileTargets.delete(missileId);
                  continue;
              }
              const fallbackOrigin = lastTile ?? currentTile;
              if (!fallbackOrigin) {
                  this.missileOrigins.delete(missileId);
                  this.missileTargets.delete(missileId);
                  continue;
              }
              const existingOrigin = this.missileOrigins.get(missileId);
              const hasMatchingSilo = existingOrigin !== undefined &&
                  mirvLaunchOrigins.some((candidate) => {
                      if (candidate.x !== existingOrigin.x ||
                          candidate.y !== existingOrigin.y) {
                          return false;
                      }
                      if (!ownerId) {
                          return true;
                      }
                      return candidate.ownerId === ownerId;
                  });
              let originTile = existingOrigin;
              if (!originTile || (isMirv && !hasMatchingSilo)) {
                  let resolvedOrigin = fallbackOrigin;
                  if (isMirv) {
                      const launchSite = this.findMirvLaunchSite(fallbackOrigin, resolvedTarget, ownerId, mirvLaunchOrigins);
                      if (launchSite) {
                          resolvedOrigin = launchSite;
                      }
                  }
                  originTile = { ...resolvedOrigin };
                  this.missileOrigins.set(missileId, originTile);
              }
              const flight = {
                  id: missileId,
                  origin: originTile,
                  target: resolvedTarget,
                  current: currentTile ?? null,
                  split: isMirvWarhead ? null : undefined,
                  color: this.resolvePlayerColor(owner),
                  ownerId,
                  unitType,
              };
              flights.push(flight);
          }
          return flights;
      }
      findMirvLaunchSite(fallbackOrigin, target, ownerId, siloOrigins) {
          if (siloOrigins.length === 0) {
              return undefined;
          }
          const ownerMatched = ownerId
              ? siloOrigins.filter((candidate) => candidate.ownerId === ownerId)
              : siloOrigins;
          const candidates = ownerMatched.length > 0 ? ownerMatched : siloOrigins;
          let best = null;
          for (const candidate of candidates) {
              const dxTarget = target.x - candidate.x;
              const dyTarget = target.y - candidate.y;
              const launchLengthSq = dxTarget * dxTarget + dyTarget * dyTarget;
              if (launchLengthSq === 0) {
                  continue;
              }
              const dxFallback = fallbackOrigin.x - candidate.x;
              const dyFallback = fallbackOrigin.y - candidate.y;
              const along = (dxFallback * dxTarget + dyFallback * dyTarget) / launchLengthSq;
              const fallbackDistanceSq = dxFallback * dxFallback + dyFallback * dyFallback;
              if (along < 0 && fallbackDistanceSq > 4) {
                  continue;
              }
              if (along > 1.25) {
                  continue;
              }
              const clampedAlong = Math.min(Math.max(along, 0), 1);
              const closestX = candidate.x + dxTarget * clampedAlong;
              const closestY = candidate.y + dyTarget * clampedAlong;
              const offAxisX = fallbackOrigin.x - closestX;
              const offAxisY = fallbackOrigin.y - closestY;
              const offAxisSq = offAxisX * offAxisX + offAxisY * offAxisY;
              if (!best) {
                  best = {
                      tile: candidate,
                      offAxisSq,
                      distanceSq: fallbackDistanceSq,
                  };
                  continue;
              }
              if (offAxisSq < best.offAxisSq - 1e-6) {
                  best = {
                      tile: candidate,
                      offAxisSq,
                      distanceSq: fallbackDistanceSq,
                  };
                  continue;
              }
              if (Math.abs(offAxisSq - best.offAxisSq) <= 1e-6 &&
                  fallbackDistanceSq < best.distanceSq) {
                  best = {
                      tile: candidate,
                      offAxisSq,
                      distanceSq: fallbackDistanceSq,
                  };
              }
          }
          return best?.tile;
      }
      composeMissileKey(type, target, ownerId) {
          const normalizedType = type.replace(/\s+/g, "-").toLowerCase();
          const ownerSegment = ownerId ?? "unknown";
          return `missile-${normalizedType}-${target.x}-${target.y}-${ownerSegment}`;
      }
      syncHistoricalMissileOverlay() {
          if (!this.historicalMissileOverlay) {
              return;
          }
          this.historicalMissileOverlay.setTrajectories(this.collectHistoricalMissiles());
      }
      syncDonationOverlay(overlay, players) {
          if (!overlay) {
              return;
          }
          let source = players;
          if (!source) {
              try {
                  source = this.game?.playerViews?.();
              }
              catch (error) {
                  console.warn("Failed to refresh donation overlay players", error);
                  source = [];
              }
          }
          if (!Array.isArray(source)) {
              source = [];
          }
          const snapshots = [];
          for (const player of source) {
              try {
                  const id = this.safePlayerId(player);
                  if (!id) {
                      continue;
                  }
                  let location;
                  try {
                      location = player.nameLocation?.();
                  }
                  catch (error) {
                      console.warn("Failed to read player name location", error);
                  }
                  snapshots.push({
                      id,
                      name: this.safePlayerName(player),
                      x: location?.x ?? null,
                      y: location?.y ?? null,
                      color: this.resolvePlayerColor(player),
                      alive: player.isAlive(),
                  });
              }
              catch (error) {
                  console.warn("Failed to update donation overlay for player", error);
              }
          }
          overlay.setPlayerSnapshots(snapshots);
      }
      syncTroopDonationOverlay(players) {
          this.syncDonationOverlay(this.troopDonationOverlay, players);
      }
      syncGoldDonationOverlay(players) {
          this.syncDonationOverlay(this.goldDonationOverlay, players);
      }
      resolveTransformHandler() {
          if (typeof document === "undefined") {
              return null;
          }
          const candidates = [
              document.querySelector("build-menu"),
              document.querySelector("emoji-table"),
          ].filter((element) => !!element);
          for (const element of candidates) {
              if (element.transformHandler) {
                  return element.transformHandler;
              }
          }
          return null;
      }
      resolveUiState() {
          if (typeof document === "undefined") {
              return null;
          }
          const controlPanel = document.querySelector("control-panel");
          if (controlPanel?.uiState) {
              return controlPanel.uiState;
          }
          return null;
      }
      isMissileSiloReady(unit) {
          const levelValue = this.extractMissileSiloLevel(unit);
          if (typeof levelValue !== "number" || !Number.isFinite(levelValue)) {
              return true;
          }
          const queue = this.extractMissileTimerQueue(unit);
          if (!Array.isArray(queue)) {
              return true;
          }
          return queue.length < levelValue;
      }
      extractMissileSiloLevel(unit) {
          const candidate = unit;
          if (typeof candidate.level === "function") {
              try {
                  const value = candidate.level.call(unit);
                  if (Number.isFinite(value)) {
                      return value;
                  }
              }
              catch (error) {
                  // Ignore failures; we'll fall back to other sources below.
              }
          }
          else if (typeof candidate.level === "number" &&
              Number.isFinite(candidate.level)) {
              return candidate.level;
          }
          const dataLevel = candidate.data?.level;
          if (typeof dataLevel === "number" && Number.isFinite(dataLevel)) {
              return dataLevel;
          }
          return undefined;
      }
      extractMissileTimerQueue(unit) {
          const candidate = unit;
          const direct = candidate.missileTimerQueue;
          if (Array.isArray(direct)) {
              return direct;
          }
          if (typeof direct === "function") {
              try {
                  const value = direct.call(unit);
                  if (Array.isArray(value)) {
                      return value;
                  }
              }
              catch (error) {
                  // Ignore failures; fall back to other representations.
              }
          }
          const dataQueue = candidate.data?.missileTimerQueue;
          if (Array.isArray(dataQueue)) {
              return dataQueue;
          }
          return undefined;
      }
      createInitialActionsState() {
          const now = Date.now();
          const tradeBan = this.createActionDefinition({
              name: "Trade ban everyone in the game",
              code: "// Stops trading with every known player\n" +
                  "for (const player of game.players) {\n" +
                  "  game.stopTrade(player.id);\n" +
                  "}\n",
              runMode: "once",
              description: "Stops trading with every known player immediately.",
              runIntervalTicks: 1,
              settings: [
                  this.createSetting({
                      key: "includeAllies",
                      label: "Include allies",
                      type: "toggle",
                      value: false,
                  }),
              ],
              timestamp: now,
          });
          const enableTrade = this.createActionDefinition({
              name: "Enable trade with everyone in the game",
              code: "// Restores trading with every known player\n" +
                  "for (const player of game.players) {\n" +
                  "  game.startTrade(player.id);\n" +
                  "}\n",
              runMode: "once",
              description: "Resumes trading with every known player.",
              runIntervalTicks: 1,
              settings: [
                  this.createSetting({
                      key: "skipAllies",
                      label: "Skip current allies",
                      type: "toggle",
                      value: true,
                  }),
              ],
              timestamp: now,
          });
          const missileSiloAlerts = this.createActionDefinition({
              name: "Warn when missile silos are built",
              code: "exports.run = ({ events, logger }) => {\n" +
                  "  const formatLocation = (event) => {\n" +
                  "    if (event.tile) {\n" +
                  "      return `${event.tile.x}, ${event.tile.y}`;\n" +
                  "    }\n" +
                  '    return "unknown location";\n' +
                  "  };\n" +
                  "  const describeOwner = (event) => event.ownerName ?? `Player ${event.ownerId}`;\n" +
                  '  const missileSiloFilter = (event) => event.unitType === "Missile Silo";\n' +
                  "  events.oncePerTeam(\n" +
                  '    "structureBuilt",\n' +
                  "    (event) => {\n" +
                  '      const teamLabel = event.team ?? "No team";\n' +
                  '      const teamId = event.team ?? "Solo";\n' +
                  "      const locationLabel = formatLocation(event);\n" +
                  "      logger.warn(\n" +
                  "        `${teamLabel} built a Missile Silo at ${locationLabel} (${describeOwner(event)})`,\n" +
                  "        {\n" +
                  "          tokens: [\n" +
                  '            { type: "team", id: teamId, label: teamLabel, color: event.teamColor ?? event.ownerColor },\n' +
                  '            { type: "text", text: " built a Missile Silo at " + locationLabel + " (" },\n' +
                  '            { type: "player", id: event.ownerId, label: describeOwner(event), color: event.ownerColor },\n' +
                  '            { type: "text", text: ")" },\n' +
                  "          ],\n" +
                  "        },\n" +
                  "      );\n" +
                  "    },\n" +
                  "    { filter: missileSiloFilter },\n" +
                  "  );\n" +
                  "  events.oncePerClan(\n" +
                  '    "structureBuilt",\n' +
                  "    (event) => {\n" +
                  '      const clanLabel = event.clan ? `Clan ${event.clan}` : "No clan";\n' +
                  '      const clanId = event.clan ?? "Unaffiliated";\n' +
                  "      const locationLabel = formatLocation(event);\n" +
                  "      logger.warn(\n" +
                  "        `${clanLabel} built a Missile Silo at ${locationLabel} (${describeOwner(event)})`,\n" +
                  "        {\n" +
                  "          tokens: [\n" +
                  '            { type: "clan", id: clanId, label: clanLabel, color: event.clanColor ?? event.ownerColor },\n' +
                  '            { type: "text", text: " built a Missile Silo at " + locationLabel + " (" },\n' +
                  '            { type: "player", id: event.ownerId, label: describeOwner(event), color: event.ownerColor },\n' +
                  '            { type: "text", text: ")" },\n' +
                  "          ],\n" +
                  "        },\n" +
                  "      );\n" +
                  "    },\n" +
                  "    { filter: missileSiloFilter },\n" +
                  "  );\n" +
                  "};\n",
              runMode: "event",
              description: "Logs a warning the first time each team and clan places a Missile Silo while the action is running.",
              runIntervalTicks: 1,
              settings: [],
              timestamp: now,
          });
          const troopDonationLogger = this.createActionDefinition({
              name: "Log troop donations",
              code: "exports.run = ({ events, logger }) => {\n" +
                  "  events.on(\n" +
                  '    "troopsDonated",\n' +
                  "    ({ senderId, senderName, senderColor, recipientId, recipientName, recipientColor, amountDisplay }) => {\n" +
                  "      logger.info(\n" +
                  "        `${senderName} sent ${amountDisplay} troops to ${recipientName}`,\n" +
                  "        {\n" +
                  "          tokens: [\n" +
                  '            { type: "player", id: senderId, label: senderName, color: senderColor },\n' +
                  '            { type: "text", text: " sent " + amountDisplay + " troops to " },\n' +
                  '            { type: "player", id: recipientId, label: recipientName, color: recipientColor },\n' +
                  "          ],\n" +
                  "        },\n" +
                  "      );\n" +
                  "    },\n" +
                  "  );\n" +
                  "};\n",
              runMode: "event",
              description: "Writes an info log entry whenever a troop donation is detected while the action is running.",
              runIntervalTicks: 1,
              settings: [],
              timestamp: now,
          });
          const goldDonationLogger = this.createActionDefinition({
              name: "Log gold donations",
              code: "exports.run = ({ events, logger }) => {\n" +
                  "  events.on(\n" +
                  '    "goldDonated",\n' +
                  "    ({ senderId, senderName, senderColor, recipientId, recipientName, recipientColor, amountDisplay }) => {\n" +
                  "      logger.info(\n" +
                  "        `${senderName} sent ${amountDisplay} gold to ${recipientName}`,\n" +
                  "        {\n" +
                  "          tokens: [\n" +
                  '            { type: "player", id: senderId, label: senderName, color: senderColor },\n' +
                  '            { type: "text", text: " sent " + amountDisplay + " gold to " },\n' +
                  '            { type: "player", id: recipientId, label: recipientName, color: recipientColor },\n' +
                  "          ],\n" +
                  "        },\n" +
                  "      );\n" +
                  "    },\n" +
                  "  );\n" +
                  "};\n",
              runMode: "event",
              description: "Writes an info log entry whenever a gold donation is detected while the action is running.",
              runIntervalTicks: 1,
              settings: [],
              timestamp: now,
          });
          const actions = [
              tradeBan,
              enableTrade,
              missileSiloAlerts,
              troopDonationLogger,
              goldDonationLogger,
          ];
          return {
              revision: 1,
              runningRevision: 1,
              actions,
              running: [],
              selectedActionId: actions[0]?.id,
              selectedRunningActionId: undefined,
          };
      }
      nextActionId() {
          this.actionIdCounter += 1;
          return `action-${this.actionIdCounter}`;
      }
      nextRunningActionId() {
          this.runningActionIdCounter += 1;
          return `run-${this.runningActionIdCounter}`;
      }
      nextSettingId() {
          this.settingIdCounter += 1;
          return `setting-${this.settingIdCounter}`;
      }
      normalizeSettingValue(type, value) {
          switch (type) {
              case "number": {
                  const numeric = Number(value);
                  return Number.isFinite(numeric) ? numeric : 0;
              }
              case "toggle":
                  return Boolean(value);
              default:
                  return String(value ?? "");
          }
      }
      createSetting(options) {
          const type = options.type ?? "text";
          const fallback = type === "number" ? 0 : type === "toggle" ? false : "";
          const rawValue = options.value ?? fallback;
          return {
              id: this.nextSettingId(),
              key: options.key,
              label: options.label,
              type,
              value: this.normalizeSettingValue(type, rawValue),
          };
      }
      createActionDefinition(options) {
          const createdAtMs = options.timestamp ?? Date.now();
          const settings = options.settings
              ? options.settings.map((setting) => ({ ...setting }))
              : [];
          const interval = Math.max(1, Math.floor(options.runIntervalTicks ?? 1));
          return {
              id: this.nextActionId(),
              name: options.name,
              code: options.code,
              runMode: options.runMode,
              enabled: options.enabled ?? true,
              description: options.description?.trim() ?? "",
              runIntervalTicks: interval,
              settings,
              createdAtMs,
              updatedAtMs: createdAtMs,
          };
      }
      cloneSetting(setting) {
          return {
              ...setting,
              id: this.nextSettingId(),
              value: this.normalizeSettingValue(setting.type, setting.value),
          };
      }
      cloneSettings(settings) {
          return settings.map((setting) => this.cloneSetting(setting));
      }
      sanitizeSetting(setting) {
          const type = setting.type ?? "text";
          const key = setting.key?.trim() ?? "";
          const label = setting.label?.trim() ?? "";
          const id = setting.id?.trim() ? setting.id : this.nextSettingId();
          const resolvedLabel = label !== "" ? label : key !== "" ? key : "Setting";
          return {
              id,
              key,
              label: resolvedLabel,
              type,
              value: this.normalizeSettingValue(type, setting.value),
          };
      }
      clearRunningRemovalTimer(runId) {
          const handle = this.runningRemovalTimers.get(runId);
          if (handle !== undefined) {
              clearTimeout(handle);
              this.runningRemovalTimers.delete(runId);
          }
      }
      scheduleOneShotRemoval(runId) {
          this.clearRunningRemovalTimer(runId);
          const handler = () => {
              this.runningRemovalTimers.delete(runId);
              this.completeRunningAction(runId);
          };
          const timeout = setTimeout(handler, 1500);
          this.runningRemovalTimers.set(runId, timeout);
      }
      appendLogEntry(entry) {
          this.sidebarLogs = [...this.sidebarLogs, entry];
          if (this.sidebarLogs.length > MAX_LOG_ENTRIES) {
              this.sidebarLogs = this.sidebarLogs.slice(-MAX_LOG_ENTRIES);
          }
          this.sidebarLogRevision += 1;
          this.snapshot = this.attachActionsState({ ...this.snapshot });
          this.notify();
      }
      commitActionsState(updater) {
          this.actionsState = updater(this.actionsState);
          this.snapshot = this.attachActionsState(this.snapshot);
          this.notify();
      }
      ensureAllEventActionsRunning() {
          const actions = this.actionsState.actions.filter((action) => action.runMode === "event" && action.enabled);
          for (const action of actions) {
              this.ensureEventActionRunning(action.id);
          }
      }
      ensureEventActionRunning(actionId) {
          const action = this.actionsState.actions.find((entry) => entry.id === actionId);
          if (!action || action.runMode !== "event" || !action.enabled) {
              return;
          }
          const alreadyRunning = this.actionsState.running.some((run) => run.actionId === actionId && run.status === "running");
          if (alreadyRunning) {
              return;
          }
          this.startAction(actionId);
      }
      stopRunsForAction(actionId, predicate) {
          const runs = this.actionsState.running.filter((run) => {
              if (run.actionId !== actionId) {
                  return false;
              }
              if (run.status !== "running") {
                  return false;
              }
              if (predicate && !predicate(run)) {
                  return false;
              }
              return true;
          });
          for (const run of runs) {
              this.stopRunningAction(run.id);
          }
      }
      stopEventRunsForAction(actionId) {
          this.stopRunsForAction(actionId, (run) => run.runMode === "event");
      }
      completeRunningAction(runId) {
          this.runningRemovalTimers.delete(runId);
          this.clearRunningController(runId);
          this.commitActionsState((state) => {
              if (!state.running.some((run) => run.id === runId)) {
                  return state;
              }
              const running = state.running.filter((run) => run.id !== runId);
              const selectedRunningActionId = state.selectedRunningActionId === runId
                  ? running[running.length - 1]?.id
                  : state.selectedRunningActionId;
              return {
                  ...state,
                  running,
                  runningRevision: state.runningRevision + 1,
                  selectedRunningActionId,
              };
          });
      }
      getSnapshot() {
          return this.snapshot;
      }
      subscribe(listener) {
          this.listeners.add(listener);
          listener(this.snapshot);
          return () => {
              this.listeners.delete(listener);
          };
      }
      update(snapshot) {
          this.snapshot = this.attachActionsState({
              ...snapshot,
              currentTimeMs: snapshot.currentTimeMs ?? Date.now(),
              ships: snapshot.ships ?? [],
          });
          this.notify();
      }
      setOverlayEnabled(overlayId, enabled) {
          const overlay = this.sidebarOverlays.find((entry) => entry.id === overlayId);
          if (!overlay) {
              console.warn(`Sidebar overlay ${overlayId} not found`);
              return;
          }
          if (overlay.enabled === enabled) {
              return;
          }
          overlay.enabled = enabled;
          this.sidebarOverlayRevision += 1;
          this.snapshot = this.attachActionsState({ ...this.snapshot });
          this.notify();
          if (overlayId === MISSILE_TRAJECTORY_OVERLAY_ID) {
              if (enabled) {
                  const effect = this.ensureMissileOverlay();
                  effect.setSiloPositions(this.collectMissileSiloPositions());
                  effect.enable();
              }
              else if (this.missileOverlay) {
                  this.missileOverlay.disable();
              }
          }
          else if (overlayId === HISTORICAL_MISSILE_OVERLAY_ID) {
              if (enabled) {
                  const effect = this.ensureHistoricalMissileOverlay();
                  effect.setTrajectories(this.collectHistoricalMissiles());
                  effect.enable();
              }
              else if (this.historicalMissileOverlay) {
                  this.historicalMissileOverlay.disable();
              }
          }
          else if (overlayId === TROOP_DONATION_OVERLAY_ID) {
              if (enabled) {
                  const effect = this.ensureTroopDonationOverlay();
                  this.syncTroopDonationOverlay();
                  effect.enable();
              }
              else if (this.troopDonationOverlay) {
                  this.troopDonationOverlay.disable();
              }
          }
          else if (overlayId === GOLD_DONATION_OVERLAY_ID) {
              if (enabled) {
                  const effect = this.ensureGoldDonationOverlay();
                  this.syncGoldDonationOverlay();
                  effect.enable();
              }
              else if (this.goldDonationOverlay) {
                  this.goldDonationOverlay.disable();
              }
          }
      }
      setTradingStopped(targetPlayerIds, stopped) {
          if (!this.game) {
              console.warn("Sidebar trading toggle skipped: game unavailable");
              return;
          }
          const localPlayer = this.resolveLocalPlayer();
          if (!localPlayer) {
              console.warn("Sidebar trading toggle skipped: local player unavailable");
              return;
          }
          const selfId = this.resolveSelfId(localPlayer);
          const uniqueIds = new Set(targetPlayerIds);
          const targets = [];
          for (const id of uniqueIds) {
              if (selfId !== null && id === selfId) {
                  continue;
              }
              const resolved = this.resolvePlayerById(id);
              if (resolved) {
                  targets.push(resolved);
              }
          }
          if (targets.length === 0) {
              return;
          }
          const panel = this.resolvePlayerPanel();
          const handler = stopped
              ? panel?.handleEmbargoClick
              : panel?.handleStopEmbargoClick;
          if (panel && typeof handler === "function") {
              for (const target of targets) {
                  try {
                      handler.call(panel, new MouseEvent("click", { bubbles: false, cancelable: true }), localPlayer, target);
                  }
                  catch (error) {
                      console.warn("Sidebar trading toggle failed via player panel", this.describePlayerForLog(target), error);
                  }
              }
              this.scheduleTradingRefresh();
              return;
          }
          if (stopped) {
              const addEmbargo = localPlayer.addEmbargo;
              if (typeof addEmbargo !== "function") {
                  console.warn("Sidebar trading toggle skipped: local player cannot add embargoes");
                  return;
              }
              for (const target of targets) {
                  try {
                      addEmbargo.call(localPlayer, target, false);
                  }
                  catch (error) {
                      console.warn("Failed to stop trading with player", this.describePlayerForLog(target), error);
                  }
              }
          }
          else {
              const stopEmbargo = localPlayer.stopEmbargo;
              if (typeof stopEmbargo !== "function") {
                  console.warn("Sidebar trading toggle skipped: local player cannot stop embargoes");
                  return;
              }
              for (const target of targets) {
                  try {
                      stopEmbargo.call(localPlayer, target);
                  }
                  catch (error) {
                      console.warn("Failed to resume trading with player", this.describePlayerForLog(target), error);
                  }
              }
          }
          this.scheduleTradingRefresh();
      }
      scheduleTradingRefresh() {
          if (typeof window === "undefined") {
              this.refreshFromGame();
              return;
          }
          if (this.pendingTradingRefreshHandle !== undefined) {
              return;
          }
          this.pendingTradingRefreshHandle = window.setTimeout(() => {
              this.pendingTradingRefreshHandle = undefined;
              this.refreshFromGame();
          }, 0);
      }
      createAction() {
          const existingCount = this.actionsState.actions.length + 1;
          const action = this.createActionDefinition({
              name: `New action ${existingCount}`,
              code: "// Access the game through the `game` helper\n" +
                  "// This function is invoked whenever the action runs\n" +
                  "export function run(context) {\n" +
                  "  context.logger.info('Running action tick', context.game.tick);\n" +
                  "}\n",
              runMode: "continuous",
              description: "Describe what this action does.",
              runIntervalTicks: 1,
              settings: [],
          });
          this.commitActionsState((state) => ({
              ...state,
              actions: [...state.actions, action],
              revision: state.revision + 1,
              selectedActionId: action.id,
          }));
          return action.id;
      }
      selectAction(actionId) {
          if (this.actionsState.selectedActionId === actionId) {
              return;
          }
          this.commitActionsState((state) => {
              if (state.selectedActionId === actionId) {
                  return state;
              }
              return { ...state, selectedActionId: actionId };
          });
      }
      saveAction(actionId, update) {
          const normalizedSettings = update.settings.map((setting) => this.sanitizeSetting(setting));
          const trimmedName = update.name.trim();
          const resolvedName = trimmedName === "" ? "Untitled action" : trimmedName;
          const trimmedDescription = update.description?.trim() ?? "";
          const interval = Math.max(1, Math.floor(update.runIntervalTicks ?? 1));
          let previousRunMode;
          let nextRunMode;
          let nextEnabled;
          const normalizedEnabled = Boolean(update.enabled);
          this.commitActionsState((state) => {
              const index = state.actions.findIndex((action) => action.id === actionId);
              if (index === -1) {
                  return state;
              }
              const current = state.actions[index];
              previousRunMode = current.runMode;
              const next = {
                  ...current,
                  name: resolvedName,
                  code: update.code,
                  runMode: update.runMode,
                  enabled: normalizedEnabled,
                  description: trimmedDescription,
                  runIntervalTicks: interval,
                  settings: normalizedSettings.map((setting) => ({ ...setting })),
                  updatedAtMs: Date.now(),
              };
              nextRunMode = next.runMode;
              nextEnabled = next.enabled;
              const actions = [...state.actions];
              actions[index] = next;
              return {
                  ...state,
                  actions,
                  revision: state.revision + 1,
              };
          });
          if (nextEnabled === false) {
              this.stopRunsForAction(actionId);
          }
          if (nextRunMode === "event" && nextEnabled) {
              this.ensureEventActionRunning(actionId);
          }
          else if (previousRunMode === "event" && nextRunMode !== "event") {
              this.stopEventRunsForAction(actionId);
          }
      }
      setActionEnabled(actionId, enabled) {
          const normalized = Boolean(enabled);
          let previousEnabled;
          let runMode;
          this.commitActionsState((state) => {
              const index = state.actions.findIndex((action) => action.id === actionId);
              if (index === -1) {
                  return state;
              }
              const current = state.actions[index];
              previousEnabled = current.enabled;
              runMode = current.runMode;
              if (current.enabled === normalized) {
                  return state;
              }
              const next = {
                  ...current,
                  enabled: normalized,
                  updatedAtMs: Date.now(),
              };
              runMode = next.runMode;
              const actions = [...state.actions];
              actions[index] = next;
              return {
                  ...state,
                  actions,
                  revision: state.revision + 1,
              };
          });
          if (previousEnabled === undefined || previousEnabled === normalized) {
              return;
          }
          if (!normalized) {
              this.stopRunsForAction(actionId);
              return;
          }
          if (runMode === "event") {
              this.ensureEventActionRunning(actionId);
          }
      }
      deleteAction(actionId) {
          this.commitActionsState((state) => {
              const index = state.actions.findIndex((action) => action.id === actionId);
              if (index === -1) {
                  return state;
              }
              const actions = state.actions.filter((action) => action.id !== actionId);
              let selectedActionId = state.selectedActionId;
              if (selectedActionId === actionId) {
                  selectedActionId = actions[index]?.id ?? actions[index - 1]?.id;
              }
              const removedRuns = state.running.filter((run) => run.actionId === actionId);
              for (const run of removedRuns) {
                  this.clearRunningRemovalTimer(run.id);
                  this.clearRunningController(run.id);
                  this.disposeActionEvents(run.id);
              }
              const running = removedRuns.length
                  ? state.running.filter((run) => run.actionId !== actionId)
                  : state.running;
              const runningRevision = removedRuns.length
                  ? state.runningRevision + 1
                  : state.runningRevision;
              const selectedRunningActionId = running.some((run) => run.id === state.selectedRunningActionId)
                  ? state.selectedRunningActionId
                  : running[running.length - 1]?.id;
              return {
                  ...state,
                  actions,
                  revision: state.revision + 1,
                  running,
                  runningRevision,
                  selectedActionId,
                  selectedRunningActionId,
              };
          });
      }
      startAction(actionId) {
          const action = this.actionsState.actions.find((entry) => entry.id === actionId);
          if (!action) {
              return;
          }
          if (!action.enabled) {
              sidebarLogger.info(`Action "${action.name}" is disabled; ignoring run request.`);
              return;
          }
          const now = Date.now();
          const run = {
              id: this.nextRunningActionId(),
              actionId: action.id,
              name: action.name,
              description: action.description,
              runMode: action.runMode,
              runIntervalTicks: action.runIntervalTicks,
              status: "running",
              startedAtMs: now,
              lastUpdatedMs: now,
              settings: this.cloneSettings(action.settings),
          };
          this.commitActionsState((state) => ({
              ...state,
              running: [...state.running, run],
              runningRevision: state.runningRevision + 1,
              selectedRunningActionId: run.id,
          }));
          sidebarLogger.info(`Started action "${action.name}" [${run.id}] (${action.runMode})`);
          this.launchAction(action, run.id);
      }
      launchAction(action, runId) {
          const run = this.getRunningActionEntry(runId);
          if (!run) {
              return;
          }
          if (action.runMode === "once") {
              const state = {};
              void this.executeActionScript(action, run, state)
                  .then(() => {
                  this.touchRunningAction(runId);
                  this.finalizeRunningAction(runId, "completed");
              })
                  .catch((error) => {
                  sidebarLogger.error(`Action "${action.name}" [${runId}] failed`, error);
                  this.finalizeRunningAction(runId, "failed");
              });
              return;
          }
          if (action.runMode === "event") {
              this.startEventRuntime(action, run);
              return;
          }
          this.startContinuousRuntime(action, run);
      }
      startContinuousRuntime(action, run) {
          if (typeof window === "undefined") {
              sidebarLogger.warn("Continuous sidebar actions are unavailable outside the browser.");
              this.finalizeRunningAction(run.id, "failed");
              return;
          }
          const runId = run.id;
          const runtime = {
              intervalTicks: Math.max(1, run.runIntervalTicks ?? 1),
              lastExecutedTick: this.getCurrentGameTick() - Math.max(1, run.runIntervalTicks ?? 1),
              active: true,
              state: {},
              stop: () => {
                  if (!runtime.active) {
                      return;
                  }
                  runtime.active = false;
                  window.clearInterval(intervalHandle);
              },
              updateInterval: (ticks) => {
                  const normalized = Math.max(1, Math.floor(Number(ticks) || 1));
                  runtime.intervalTicks = normalized;
              },
          };
          const execute = async () => {
              if (!runtime.active) {
                  return;
              }
              const currentRun = this.getRunningActionEntry(runId);
              if (!currentRun) {
                  runtime.stop();
                  return;
              }
              const currentTick = this.getCurrentGameTick();
              if (currentTick - runtime.lastExecutedTick < runtime.intervalTicks) {
                  return;
              }
              runtime.lastExecutedTick = currentTick;
              try {
                  await this.executeActionScript(action, currentRun, runtime.state);
                  this.touchRunningAction(runId);
              }
              catch (error) {
                  sidebarLogger.error(`Action "${action.name}" [${runId}] failed`, error);
                  this.finalizeRunningAction(runId, "failed");
              }
          };
          const intervalHandle = window.setInterval(() => {
              void execute();
          }, TICK_MILLISECONDS);
          this.actionRuntimes.set(runId, runtime);
          void execute();
      }
      startEventRuntime(action, run) {
          const runId = run.id;
          const state = {};
          void this.executeActionScript(action, run, state)
              .then((result) => {
              this.touchRunningAction(runId);
              if (typeof result === "function") {
                  this.eventCleanupHandlers.set(runId, result);
              }
          })
              .catch((error) => {
              sidebarLogger.error(`Action "${action.name}" [${runId}] failed`, error);
              this.finalizeRunningAction(runId, "failed");
          });
      }
      selectRunningAction(runId) {
          this.commitActionsState((state) => {
              const effectiveId = runId && state.running.some((entry) => entry.id === runId)
                  ? runId
                  : undefined;
              if (state.selectedRunningActionId === effectiveId) {
                  return state;
              }
              return { ...state, selectedRunningActionId: effectiveId };
          });
      }
      stopRunningAction(runId) {
          const exists = this.actionsState.running.some((run) => run.id === runId);
          if (!exists) {
              return;
          }
          this.clearRunningRemovalTimer(runId);
          this.finalizeRunningAction(runId, "stopped");
      }
      updateRunningActionSetting(runId, settingId, value) {
          this.commitActionsState((state) => {
              const index = state.running.findIndex((run) => run.id === runId);
              if (index === -1) {
                  return state;
              }
              const entry = state.running[index];
              let changed = false;
              const settings = entry.settings.map((setting) => {
                  if (setting.id !== settingId) {
                      return setting;
                  }
                  const normalized = this.normalizeSettingValue(setting.type, value);
                  if (setting.value === normalized) {
                      return setting;
                  }
                  changed = true;
                  return { ...setting, value: normalized };
              });
              if (!changed) {
                  return state;
              }
              const running = [...state.running];
              running[index] = {
                  ...entry,
                  settings,
                  lastUpdatedMs: Date.now(),
              };
              return {
                  ...state,
                  running,
                  runningRevision: state.runningRevision + 1,
              };
          });
      }
      setRunningActionInterval(runId, ticks) {
          const normalized = Math.max(1, Math.floor(Number(ticks) || 1));
          this.commitActionsState((state) => {
              const index = state.running.findIndex((run) => run.id === runId);
              if (index === -1) {
                  return state;
              }
              const current = state.running[index];
              if (current.runIntervalTicks === normalized) {
                  return state;
              }
              const running = [...state.running];
              running[index] = {
                  ...current,
                  runIntervalTicks: normalized,
                  lastUpdatedMs: Date.now(),
              };
              return {
                  ...state,
                  running,
                  runningRevision: state.runningRevision + 1,
              };
          });
          const runtime = this.actionRuntimes.get(runId);
          runtime?.updateInterval(normalized);
      }
      clearLogs() {
          if (this.sidebarLogs.length === 0) {
              return;
          }
          this.sidebarLogs = [];
          this.sidebarLogRevision += 1;
          this.snapshot = this.attachActionsState({ ...this.snapshot });
          this.notify();
      }
      async executeActionScript(action, run, state) {
          const context = this.createActionExecutionContext(run, state);
          const module = { exports: {} };
          const exports = module.exports;
          const evaluator = new Function("game", "settings", "context", "exports", "module", '"use strict";\n' + action.code);
          const result = evaluator(context.game, context.settings, context, exports, module);
          const runFunction = this.resolveActionRunFunction(module.exports) ??
              this.resolveActionRunFunction(exports) ??
              this.resolveActionRunFunction(result);
          if (runFunction) {
              const output = runFunction(context);
              if (isPromiseLike(output)) {
                  return await output;
              }
              return output;
          }
          if (isPromiseLike(result)) {
              return await result;
          }
          return result;
      }
      resolveActionRunFunction(candidate) {
          if (!candidate) {
              return null;
          }
          if (typeof candidate === "function") {
              return candidate;
          }
          if (typeof candidate === "object") {
              const run = candidate.run;
              if (typeof run === "function") {
                  return run;
              }
              const defaultExport = candidate.default;
              if (typeof defaultExport === "function") {
                  return defaultExport;
              }
          }
          return null;
      }
      getOrCreateEventManager(run) {
          let manager = this.actionEventManagers.get(run.id);
          if (!manager) {
              const label = `Action "${run.name}" [${run.id}]`;
              manager = new ActionEventManager(label, (eventName, handler) => this.registerActionEventListener(run.id, eventName, handler), () => this.touchRunningAction(run.id));
              this.actionEventManagers.set(run.id, manager);
          }
          return manager;
      }
      registerActionEventListener(runId, eventName, handler) {
          let listeners = this.actionEventListeners.get(eventName);
          if (!listeners) {
              listeners = new Map();
              this.actionEventListeners.set(eventName, listeners);
          }
          let runListeners = listeners.get(runId);
          if (!runListeners) {
              runListeners = new Set();
              listeners.set(runId, runListeners);
          }
          runListeners.add(handler);
          return () => {
              const byEvent = this.actionEventListeners.get(eventName);
              if (!byEvent) {
                  return;
              }
              const handlers = byEvent.get(runId);
              if (!handlers) {
                  return;
              }
              handlers.delete(handler);
              if (handlers.size === 0) {
                  byEvent.delete(runId);
              }
              if (byEvent.size === 0) {
                  this.actionEventListeners.delete(eventName);
              }
          };
      }
      emitActionEvent(eventName, payload) {
          const listeners = this.actionEventListeners.get(eventName);
          if (!listeners) {
              return;
          }
          const batches = Array.from(listeners.values()).map((set) => Array.from(set));
          for (const handlers of batches) {
              for (const handler of handlers) {
                  try {
                      handler(payload);
                  }
                  catch (error) {
                      sidebarLogger.error(`Failed to process action event "${eventName}"`, error);
                  }
              }
          }
      }
      createActionExecutionContext(run, state) {
          const settings = {};
          for (const setting of run.settings) {
              const key = setting.key?.trim();
              if (!key) {
                  continue;
              }
              settings[key] = setting.value;
          }
          const logger = createSidebarLogger(`Action ${run.name} [${run.id}]`);
          return {
              game: this.buildActionGameApi(),
              settings,
              state,
              run,
              snapshot: this.snapshot,
              logger,
              events: this.getOrCreateEventManager(run),
          };
      }
      buildActionGameApi() {
          const players = this.snapshot.players.map((player) => ({
              id: player.id,
              name: player.name,
              isSelf: player.isSelf ?? false,
              tradeStopped: player.tradeStopped ?? false,
              tiles: player.tiles,
              gold: player.gold,
              troops: player.troops,
          }));
          const createHandler = (stopped) => (target) => {
              const ids = this.normalizeTargetIds(target);
              if (ids.length === 0) {
                  return;
              }
              this.setTradingStopped(ids, stopped);
          };
          return {
              players,
              tick: this.getCurrentGameTick(),
              stopTrade: createHandler(true),
              startTrade: createHandler(false),
          };
      }
      normalizeTargetIds(target) {
          if (typeof target === "string" || typeof target === "number") {
              return [String(target)];
          }
          const iterable = target;
          if (!iterable || typeof iterable[Symbol.iterator] !== "function") {
              return [];
          }
          const unique = new Set();
          for (const entry of iterable) {
              if (entry === undefined || entry === null) {
                  continue;
              }
              unique.add(String(entry));
          }
          return [...unique];
      }
      resetLiveGameTracking() {
          this.knownStructureIds = new Set();
          this.structuresInitialized = false;
          this.missileOrigins.clear();
          this.lastProcessedDisplayUpdates = null;
          this.troopDonationOverlay?.clear();
          this.goldDonationOverlay?.clear();
      }
      getCurrentGameTick() {
          if (this.game && typeof this.game.ticks === "function") {
              try {
                  return this.game.ticks();
              }
              catch (error) {
                  // Ignore and fall back to a derived tick counter.
              }
          }
          const now = Date.now();
          const base = this.snapshot.currentTimeMs ?? now;
          if (!Number.isFinite(base)) {
              return 0;
          }
          return Math.max(0, Math.floor((now - base) / TICK_MILLISECONDS));
      }
      touchRunningAction(runId) {
          this.commitActionsState((state) => {
              const index = state.running.findIndex((run) => run.id === runId);
              if (index === -1) {
                  return state;
              }
              const current = state.running[index];
              const next = {
                  ...current,
                  lastUpdatedMs: Date.now(),
                  status: current.status === "running" ? "running" : current.status,
              };
              const running = [...state.running];
              running[index] = next;
              return {
                  ...state,
                  running,
                  runningRevision: state.runningRevision + 1,
              };
          });
      }
      finalizeRunningAction(runId, status) {
          const currentEntry = this.getRunningActionEntry(runId);
          if (currentEntry) {
              const label = `Action "${currentEntry.name}" [${runId}]`;
              switch (status) {
                  case "completed":
                      sidebarLogger.info(`${label} completed.`);
                      break;
                  case "stopped":
                      sidebarLogger.info(`${label} stopped.`);
                      break;
                  case "failed":
                      sidebarLogger.warn(`${label} failed.`);
                      break;
              }
          }
          this.clearRunningController(runId);
          this.disposeActionEvents(runId);
          this.clearRunningRemovalTimer(runId);
          this.commitActionsState((state) => {
              const index = state.running.findIndex((run) => run.id === runId);
              if (index === -1) {
                  return state;
              }
              const current = state.running[index];
              const next = {
                  ...current,
                  status,
                  lastUpdatedMs: Date.now(),
              };
              const running = [...state.running];
              running[index] = next;
              return {
                  ...state,
                  running,
                  runningRevision: state.runningRevision + 1,
              };
          });
          this.scheduleOneShotRemoval(runId);
      }
      clearRunningController(runId) {
          const runtime = this.actionRuntimes.get(runId);
          if (!runtime) {
              return;
          }
          runtime.stop();
          this.actionRuntimes.delete(runId);
      }
      disposeActionEvents(runId) {
          const manager = this.actionEventManagers.get(runId);
          if (manager) {
              manager.dispose();
              this.actionEventManagers.delete(runId);
          }
          for (const [eventName, listeners] of Array.from(this.actionEventListeners.entries())) {
              if (listeners.delete(runId) && listeners.size === 0) {
                  this.actionEventListeners.delete(eventName);
              }
          }
          const cleanup = this.eventCleanupHandlers.get(runId);
          if (cleanup) {
              try {
                  cleanup();
              }
              catch (error) {
                  sidebarLogger.error(`Cleanup for action run [${runId}] failed`, error);
              }
              this.eventCleanupHandlers.delete(runId);
          }
      }
      getRunningActionEntry(runId) {
          return this.actionsState.running.find((run) => run.id === runId);
      }
      resolvePlayerPanel() {
          if (typeof document === "undefined") {
              return null;
          }
          const element = document.querySelector("player-panel");
          return element ?? null;
      }
      resolveSelfId(localPlayer) {
          if (localPlayer) {
              try {
                  return String(localPlayer.id());
              }
              catch (error) {
                  console.warn("Failed to read local player id", error);
              }
          }
          const snapshotSelf = this.snapshot.players.find((player) => player.isSelf);
          return snapshotSelf?.id ?? null;
      }
      notify() {
          for (const listener of this.listeners) {
              listener(this.snapshot);
          }
      }
      scheduleGameDiscovery(immediate = false) {
          if (typeof window === "undefined") {
              return;
          }
          if (!immediate && this.attachHandle !== undefined) {
              return;
          }
          const attemptAttach = () => {
              const discovered = this.findLiveGame();
              if (discovered) {
                  this.stopDisplayEventPolling();
                  this.game = discovered;
                  this.resetLiveGameTracking();
                  this.refreshFromGame();
                  if (this.attachHandle !== undefined) {
                      window.clearTimeout(this.attachHandle);
                      this.attachHandle = undefined;
                  }
                  if (this.refreshHandle !== undefined) {
                      window.clearInterval(this.refreshHandle);
                  }
                  this.refreshHandle = window.setInterval(() => this.refreshFromGame(), 500);
                  this.startDisplayEventPolling();
              }
              else {
                  this.attachHandle = window.setTimeout(attemptAttach, 1000);
              }
          };
          if (immediate) {
              attemptAttach();
          }
          else {
              this.attachHandle = window.setTimeout(attemptAttach, 0);
          }
      }
      findLiveGame() {
          const candidates = document.querySelectorAll("player-panel, leader-board, game-right-sidebar");
          for (const element of candidates) {
              if (element.g) {
                  return element.g;
              }
              if (element.game) {
                  return element.game;
              }
          }
          return null;
      }
      refreshFromGame() {
          if (!this.game) {
              return;
          }
          try {
              const players = this.game.playerViews();
              this.captureAllianceChanges(players);
              const currentTick = this.game.ticks();
              const currentTimeMs = currentTick * TICK_MILLISECONDS;
              const allianceDurationMs = this.game.config().allianceDuration() * TICK_MILLISECONDS;
              const localPlayer = this.resolveLocalPlayer();
              const ships = this.createShipRecords();
              const records = players.map((player) => this.createPlayerRecord(player, currentTimeMs, localPlayer));
              const recordLookup = new Map();
              for (const record of records) {
                  recordLookup.set(record.id, record);
              }
              this.detectStructurePlacements(recordLookup);
              this.processRecentDisplayEvents(recordLookup);
              this.snapshot = this.attachActionsState({
                  players: records,
                  allianceDurationMs,
                  currentTimeMs,
                  ships,
              });
              this.syncMissileOverlaySilos();
              this.syncHistoricalMissileOverlay();
              this.syncTroopDonationOverlay(players);
              this.syncGoldDonationOverlay(players);
              this.notify();
          }
          catch (error) {
              // If the game context changes while we're reading from it, try attaching again.
              console.warn("Failed to refresh sidebar data", error);
              this.game = null;
              this.resetLiveGameTracking();
              this.troopDonationOverlay?.clear();
              this.goldDonationOverlay?.clear();
              if (this.refreshHandle !== undefined) {
                  window.clearInterval(this.refreshHandle);
                  this.refreshHandle = undefined;
              }
              this.stopDisplayEventPolling();
              this.scheduleGameDiscovery();
          }
      }
      createShipRecords() {
          if (!this.game) {
              return [];
          }
          const units = this.game.units("Transport", "Trade Ship", "Warship");
          const ships = [];
          for (const unit of units) {
              const type = this.normalizeShipType(unit.type());
              if (!type) {
                  continue;
              }
              ships.push(this.createShipRecord(unit, type));
          }
          ships.sort((a, b) => a.ownerName.localeCompare(b.ownerName));
          this.pruneStaleShipMemory(new Set(ships.map((ship) => ship.id)));
          return ships;
      }
      createShipRecord(unit, type) {
          const owner = unit.owner();
          const ownerId = String(owner.id());
          const ownerName = owner.displayName();
          const shipId = String(unit.id());
          const troops = this.resolveShipTroops(shipId, unit, type);
          const origin = this.resolveShipOrigin(shipId, unit);
          const current = this.describeTile(unit.tile());
          const retreating = this.resolveShipRetreating(unit);
          const destination = this.resolveShipDestination(shipId, unit, type, retreating);
          return {
              id: String(unit.id()),
              type,
              ownerId,
              ownerName,
              troops,
              origin,
              current,
              destination,
              retreating,
              reachedTarget: unit.reachedTarget(),
          };
      }
      detectStructurePlacements(playerRecords) {
          if (!this.game) {
              return;
          }
          let units;
          try {
              units = this.game.units(...STRUCTURE_UNIT_TYPES);
          }
          catch (error) {
              console.warn("Failed to enumerate game units for event tracking", error);
              return;
          }
          const currentIds = new Set();
          for (const unit of units) {
              const unitId = String(unit.id());
              currentIds.add(unitId);
              if (this.structuresInitialized && !this.knownStructureIds.has(unitId)) {
                  const event = this.createStructureBuiltEvent(unit, playerRecords);
                  if (event) {
                      this.emitActionEvent("structureBuilt", event);
                  }
              }
          }
          this.knownStructureIds = currentIds;
          if (!this.structuresInitialized) {
              this.structuresInitialized = true;
          }
      }
      createStructureBuiltEvent(unit, playerRecords) {
          let owner;
          try {
              owner = unit.owner();
          }
          catch (error) {
              console.warn("Failed to resolve structure owner", error);
              return null;
          }
          let ownerId = "";
          try {
              ownerId = String(owner.id());
          }
          catch (error) {
              console.warn("Failed to resolve structure owner id", error);
          }
          const record = ownerId ? playerRecords.get(ownerId) : undefined;
          let ownerName = record?.name;
          if (!ownerName) {
              try {
                  ownerName = owner.displayName();
              }
              catch (error) {
                  ownerName = ownerId ? `Player ${ownerId}` : "Unknown player";
              }
          }
          let team = record?.team;
          if (!team) {
              try {
                  const resolved = owner.team?.();
                  if (resolved) {
                      team = resolved;
                  }
              }
              catch (error) {
                  console.warn("Failed to resolve structure owner team", error);
              }
          }
          const clan = record?.clan ?? extractClanTag(ownerName);
          const tile = this.describeTile(unit.tile());
          const ownerColor = record?.color ?? this.resolvePlayerColor(owner);
          return {
              unitId: String(unit.id()),
              unitType: unit.type(),
              ownerId: ownerId || "unknown",
              ownerName,
              clan,
              team: team ?? undefined,
              tile,
              tick: this.getCurrentGameTick(),
              ownerColor: ownerColor ?? undefined,
              teamColor: team ? (ownerColor ?? undefined) : undefined,
              clanColor: clan ? (ownerColor ?? undefined) : undefined,
          };
      }
      startDisplayEventPolling() {
          if (typeof window === "undefined") {
              return;
          }
          this.stopDisplayEventPolling();
          this.displayEventPollingActive = true;
          const poll = (timestamp) => {
              if (!this.displayEventPollingActive) {
                  return;
              }
              if (this.displayEventPollingLastTimestamp === 0 ||
                  timestamp - this.displayEventPollingLastTimestamp >= TICK_MILLISECONDS) {
                  this.displayEventPollingLastTimestamp = timestamp;
                  this.processRecentDisplayEvents();
              }
              if (this.displayEventPollingActive) {
                  this.displayEventPollingHandle = window.requestAnimationFrame(poll);
              }
          };
          this.displayEventPollingLastTimestamp = 0;
          this.displayEventPollingHandle = window.requestAnimationFrame(poll);
      }
      stopDisplayEventPolling() {
          if (typeof window === "undefined") {
              return;
          }
          this.displayEventPollingActive = false;
          if (this.displayEventPollingHandle !== undefined) {
              window.cancelAnimationFrame(this.displayEventPollingHandle);
              this.displayEventPollingHandle = undefined;
          }
          this.displayEventPollingLastTimestamp = 0;
          this.lastProcessedDisplayUpdates = null;
          this.recentTroopDonations.clear();
          this.recentGoldDonations.clear();
      }
      processRecentDisplayEvents(playerRecords) {
          if (!this.game || typeof this.game.updatesSinceLastTick !== "function") {
              return;
          }
          let updates;
          try {
              updates = this.game.updatesSinceLastTick();
          }
          catch (error) {
              console.warn("Failed to read recent game updates", error);
              return;
          }
          if (updates === this.lastProcessedDisplayUpdates) {
              return;
          }
          this.lastProcessedDisplayUpdates = updates;
          const displayEvents = this.extractDisplayEvents(updates);
          if (displayEvents.length === 0) {
              return;
          }
          const records = playerRecords ?? this.buildPlayerRecordLookupFromSnapshot();
          for (const event of displayEvents) {
              const troopDonation = this.createTroopDonationEvent(event, records);
              if (troopDonation &&
                  this.registerDonation(troopDonation, this.recentTroopDonations)) {
                  this.emitActionEvent("troopsDonated", troopDonation);
                  if (this.troopDonationOverlay?.isActive()) {
                      const senderView = this.resolvePlayerViewById(troopDonation.senderId);
                      this.troopDonationOverlay.registerDonation(troopDonation, {
                          fallbackColor: this.resolvePlayerColor(senderView),
                      });
                  }
                  continue;
              }
              const goldDonation = this.createGoldDonationEvent(event, records);
              if (goldDonation &&
                  this.registerDonation(goldDonation, this.recentGoldDonations)) {
                  this.emitActionEvent("goldDonated", goldDonation);
                  if (this.goldDonationOverlay?.isActive()) {
                      const senderView = this.resolvePlayerViewById(goldDonation.senderId);
                      this.goldDonationOverlay.registerDonation(goldDonation, {
                          fallbackColor: this.resolvePlayerColor(senderView),
                      });
                  }
              }
          }
      }
      extractDisplayEvents(updates) {
          if (!updates) {
              return [];
          }
          const raw = updates[GAME_UPDATE_TYPE_DISPLAY_EVENT];
          if (!Array.isArray(raw)) {
              return [];
          }
          const events = [];
          for (const entry of raw) {
              if (this.isDisplayMessageUpdate(entry)) {
                  events.push(entry);
              }
          }
          return events;
      }
      isDisplayMessageUpdate(value) {
          if (!value || typeof value !== "object") {
              return false;
          }
          const candidate = value;
          if (typeof candidate.message !== "string") {
              return false;
          }
          if (typeof candidate.messageType !== "number") {
              return false;
          }
          const playerId = candidate.playerID;
          if (playerId !== null && typeof playerId !== "number") {
              return false;
          }
          return true;
      }
      createTroopDonationEvent(update, playerRecords) {
          const parsed = this.parseTroopDonationMessage(update);
          if (!parsed) {
              return null;
          }
          const records = playerRecords;
          let sender = null;
          let recipient = null;
          if (parsed.direction === "sent") {
              sender = this.buildPlayerSummaryFromSmallId(update.playerID, records);
              recipient = this.buildPlayerSummaryFromName(parsed.otherName, records);
          }
          else {
              recipient = this.buildPlayerSummaryFromSmallId(update.playerID, records);
              sender = this.buildPlayerSummaryFromName(parsed.otherName, records);
          }
          if (!sender || !recipient) {
              return null;
          }
          const amountApprox = this.parseDonationAmount(parsed.amountDisplay);
          return {
              senderId: sender.id,
              senderName: sender.name,
              senderClan: sender.clan ?? undefined,
              senderTeam: sender.team ?? undefined,
              senderIsSelf: sender.isSelf,
              senderColor: sender.color ?? undefined,
              recipientId: recipient.id,
              recipientName: recipient.name,
              recipientClan: recipient.clan ?? undefined,
              recipientTeam: recipient.team ?? undefined,
              recipientIsSelf: recipient.isSelf,
              recipientColor: recipient.color ?? undefined,
              amountDisplay: parsed.amountDisplay,
              amountApprox,
              tick: this.getCurrentGameTick(),
          };
      }
      createGoldDonationEvent(update, playerRecords) {
          const parsed = this.parseGoldDonationMessage(update);
          if (!parsed) {
              return null;
          }
          const records = playerRecords;
          let sender = null;
          let recipient = null;
          if (parsed.direction === "sent") {
              sender = this.buildPlayerSummaryFromSmallId(update.playerID, records);
              recipient = this.buildPlayerSummaryFromName(parsed.otherName, records);
          }
          else {
              recipient = this.buildPlayerSummaryFromSmallId(update.playerID, records);
              sender = this.buildPlayerSummaryFromName(parsed.otherName, records);
          }
          if (!sender || !recipient) {
              return null;
          }
          const amountApprox = this.parseDonationAmount(parsed.amountDisplay);
          return {
              senderId: sender.id,
              senderName: sender.name,
              senderClan: sender.clan ?? undefined,
              senderTeam: sender.team ?? undefined,
              senderIsSelf: sender.isSelf,
              senderColor: sender.color ?? undefined,
              recipientId: recipient.id,
              recipientName: recipient.name,
              recipientClan: recipient.clan ?? undefined,
              recipientTeam: recipient.team ?? undefined,
              recipientIsSelf: recipient.isSelf,
              recipientColor: recipient.color ?? undefined,
              amountDisplay: parsed.amountDisplay,
              amountApprox,
              tick: this.getCurrentGameTick(),
          };
      }
      registerDonation(event, store) {
          const hasApproxAmount = event.amountApprox !== null && event.amountApprox !== undefined;
          const amountKey = hasApproxAmount
              ? `~${event.amountApprox}`
              : event.amountDisplay.trim().toLowerCase();
          const key = `${event.senderId}->${event.recipientId}:${amountKey}`;
          const previousTick = store.get(key);
          if (previousTick === event.tick) {
              return false;
          }
          store.set(key, event.tick);
          const expirationThreshold = event.tick - DONATION_DEDUP_TICK_WINDOW;
          for (const [entryKey, tick] of store) {
              if (tick <= expirationThreshold) {
                  store.delete(entryKey);
              }
          }
          return true;
      }
      parseTroopDonationMessage(update) {
          const message = update.message?.trim();
          if (!message) {
              return null;
          }
          if (update.messageType === MESSAGE_TYPE_SENT_TROOPS_TO_PLAYER) {
              const match = /^Sent\s+([^\s].*?)\s+troops\s+to\s+(.+)$/.exec(message);
              if (!match) {
                  return null;
              }
              return {
                  direction: "sent",
                  amountDisplay: match[1].trim(),
                  otherName: match[2].trim(),
              };
          }
          if (update.messageType === MESSAGE_TYPE_RECEIVED_TROOPS_FROM_PLAYER) {
              const match = /^Received\s+([^\s].*?)\s+troops\s+from\s+(.+)$/.exec(message);
              if (!match) {
                  return null;
              }
              return {
                  direction: "received",
                  amountDisplay: match[1].trim(),
                  otherName: match[2].trim(),
              };
          }
          return null;
      }
      parseGoldDonationMessage(update) {
          const message = update.message?.trim();
          if (!message) {
              return null;
          }
          if (update.messageType === MESSAGE_TYPE_SENT_GOLD_TO_PLAYER) {
              const match = /^Sent\s+([^\s].*?)\s+gold\s+to\s+(.+)$/.exec(message);
              if (!match) {
                  return null;
              }
              return {
                  direction: "sent",
                  amountDisplay: match[1].trim(),
                  otherName: match[2].trim(),
              };
          }
          if (update.messageType === MESSAGE_TYPE_RECEIVED_GOLD_FROM_PLAYER) {
              const match = /^Received\s+([^\s].*?)\s+gold\s+from\s+(.+)$/.exec(message);
              if (!match) {
                  return null;
              }
              return {
                  direction: "received",
                  amountDisplay: match[1].trim(),
                  otherName: match[2].trim(),
              };
          }
          return null;
      }
      parseDonationAmount(value) {
          const normalized = value.trim().replace(/,/g, "");
          if (normalized === "") {
              return null;
          }
          const match = /^([0-9]+(?:\.[0-9]+)?)([kKmM]?)$/.exec(normalized);
          if (!match) {
              const direct = Number(normalized);
              return Number.isFinite(direct) ? Math.round(direct) : null;
          }
          const base = Number(match[1]);
          if (!Number.isFinite(base)) {
              return null;
          }
          const suffix = match[2].toUpperCase();
          let multiplier = 1;
          if (suffix === "K") {
              multiplier = 1000;
          }
          else if (suffix === "M") {
              multiplier = 1000000;
          }
          return Math.round(base * multiplier);
      }
      buildPlayerRecordLookupFromSnapshot() {
          const lookup = new Map();
          for (const record of this.snapshot.players) {
              lookup.set(record.id, record);
          }
          return lookup;
      }
      buildPlayerSummaryFromSmallId(smallId, records) {
          if (smallId === null || smallId === undefined) {
              return null;
          }
          const view = this.resolvePlayerById(String(smallId));
          return this.buildPlayerSummaryFromView(view, records);
      }
      buildPlayerSummaryFromName(name, records) {
          const trimmed = name.trim();
          if (trimmed === "") {
              return null;
          }
          const record = this.findRecordByName(trimmed, records);
          if (record) {
              return {
                  id: record.id,
                  name: record.name,
                  clan: record.clan,
                  team: record.team,
                  isSelf: record.isSelf,
                  color: record.color ?? null,
              };
          }
          const view = this.findPlayerViewByName(trimmed);
          return this.buildPlayerSummaryFromView(view, records, trimmed);
      }
      buildPlayerSummaryFromView(view, records, fallbackName) {
          if (!view) {
              if (!fallbackName) {
                  return null;
              }
              return {
                  id: fallbackName,
                  name: fallbackName,
                  clan: extractClanTag(fallbackName),
                  team: null,
                  isSelf: false,
              };
          }
          const id = this.safePlayerId(view);
          const name = this.safePlayerName(view) ?? fallbackName ?? "Unknown";
          const directRecord = id ? records.get(id) : undefined;
          const record = directRecord ?? this.findRecordByName(name, records);
          const summaryId = id ?? record?.id ?? name;
          const local = this.resolveLocalPlayer();
          const resolvedIsSelf = record?.isSelf ?? this.isSamePlayer(local, summaryId);
          const summary = {
              id: summaryId,
              name,
              clan: record?.clan ?? extractClanTag(name),
              team: record?.team ?? null,
              isSelf: resolvedIsSelf,
              color: record?.color ?? this.resolvePlayerColor(view) ?? null,
          };
          return summary;
      }
      findPlayerViewByName(name) {
          if (!this.game) {
              return null;
          }
          try {
              const players = this.game.playerViews();
              for (const player of players) {
                  try {
                      if (player.displayName().trim() === name) {
                          return player;
                      }
                  }
                  catch (error) {
                      // Ignore individual failures and continue searching.
                  }
              }
          }
          catch (error) {
              console.warn("Failed to search players by name", error);
          }
          return null;
      }
      resolvePlayerViewById(id) {
          if (!this.game) {
              return null;
          }
          const normalized = id.trim();
          if (normalized) {
              try {
                  const candidate = this.game.player(normalized);
                  if (candidate) {
                      return candidate;
                  }
              }
              catch (error) {
                  // Continue to numeric lookup.
              }
          }
          const numericId = Number(normalized);
          if (Number.isFinite(numericId)) {
              try {
                  const player = this.game.playerBySmallID(numericId);
                  if (player &&
                      typeof player.displayName === "function" &&
                      typeof player.id === "function") {
                      return player;
                  }
              }
              catch (error) {
                  console.warn("Failed to resolve player by small id", error);
              }
          }
          return null;
      }
      findRecordByName(name, records) {
          const trimmed = name.trim();
          if (!trimmed) {
              return undefined;
          }
          for (const record of records.values()) {
              if (record.name === trimmed) {
                  return record;
              }
          }
          return undefined;
      }
      safePlayerName(player) {
          try {
              const name = player.displayName();
              if (typeof name === "string" && name.trim()) {
                  return name.trim();
              }
          }
          catch (error) {
              // Ignore and fall back to id-based name.
          }
          try {
              const id = player.id();
              return `Player ${id}`;
          }
          catch (error) {
              return "Unknown";
          }
      }
      resolveShipRetreating(unit) {
          if (typeof unit.retreating !== "function") {
              return false;
          }
          try {
              return unit.retreating();
          }
          catch (error) {
              console.warn("Failed to read ship retreating state", error);
              return false;
          }
      }
      resolveShipOrigin(shipId, unit) {
          const existing = this.shipOrigins.get(shipId);
          if (existing) {
              return existing;
          }
          const origin = this.describeTile(unit.lastTile()) ?? this.describeTile(unit.tile());
          if (origin) {
              this.shipOrigins.set(shipId, origin);
          }
          return origin;
      }
      resolveShipDestination(shipId, unit, type, retreating) {
          if (retreating) {
              const origin = this.shipOrigins.get(shipId);
              if (origin) {
                  this.shipDestinations.set(shipId, origin);
                  return origin;
              }
          }
          const targetRef = this.getShipDestinationRef(unit, type);
          if (targetRef !== undefined) {
              const destination = this.describeTile(targetRef);
              if (destination) {
                  this.shipDestinations.set(shipId, destination);
                  return destination;
              }
          }
          const existing = this.shipDestinations.get(shipId);
          if (existing) {
              return existing;
          }
          if (type === "Transport") {
              const inferred = this.inferTransportDestination(shipId, unit, retreating);
              if (inferred) {
                  return inferred;
              }
          }
          return undefined;
      }
      getShipDestinationRef(unit, type) {
          try {
              const direct = unit.targetTile();
              if (direct !== undefined) {
                  return direct;
              }
          }
          catch (error) {
              console.warn("Failed to read ship target tile", error);
          }
          if (type === "Trade Ship") {
              try {
                  const targetUnitId = unit.targetUnitId();
                  if (targetUnitId !== undefined) {
                      const targetUnit = this.game?.unit(targetUnitId);
                      if (targetUnit) {
                          return targetUnit.tile();
                      }
                  }
              }
              catch (error) {
                  console.warn("Failed to resolve trade ship destination", error);
              }
          }
          return undefined;
      }
      resolveShipTroops(shipId, unit, type) {
          const troops = unit.troops();
          if (troops > 0 || !this.shipManifests.has(shipId)) {
              this.shipManifests.set(shipId, troops);
          }
          if (type === "Transport" && troops === 0) {
              return this.shipManifests.get(shipId) ?? troops;
          }
          return troops;
      }
      pruneStaleShipMemory(activeIds) {
          for (const [shipId] of this.shipOrigins) {
              if (!activeIds.has(shipId)) {
                  this.shipOrigins.delete(shipId);
              }
          }
          for (const [shipId] of this.shipDestinations) {
              if (!activeIds.has(shipId)) {
                  this.shipDestinations.delete(shipId);
              }
          }
          for (const [shipId] of this.shipManifests) {
              if (!activeIds.has(shipId)) {
                  this.shipManifests.delete(shipId);
              }
          }
      }
      inferTransportDestination(shipId, unit, retreating) {
          if (!this.game || retreating) {
              return this.shipDestinations.get(shipId);
          }
          const cached = this.shipDestinations.get(shipId);
          if (cached) {
              return cached;
          }
          const start = unit.tile();
          const visited = new Set([start]);
          const queue = [start];
          let index = 0;
          const ownerSmallId = this.safePlayerSmallId(unit.owner());
          const maxExplored = 4096;
          while (index < queue.length && visited.size <= maxExplored) {
              const current = queue[index++];
              const neighbors = this.game.neighbors(current) ?? [];
              for (const neighbor of neighbors) {
                  if (visited.has(neighbor)) {
                      continue;
                  }
                  visited.add(neighbor);
                  if (!this.game.isWater(neighbor)) {
                      let ownerId = null;
                      try {
                          ownerId = this.game.hasOwner(neighbor)
                              ? this.game.ownerID(neighbor)
                              : null;
                      }
                      catch (error) {
                          console.warn("Failed to inspect transport destination owner", error);
                      }
                      if (ownerSmallId !== null && ownerId === ownerSmallId) {
                          continue;
                      }
                      const summary = this.describeTile(neighbor);
                      if (summary) {
                          this.shipDestinations.set(shipId, summary);
                          return summary;
                      }
                      continue;
                  }
                  queue.push(neighbor);
              }
          }
          return this.shipDestinations.get(shipId);
      }
      safePlayerSmallId(player) {
          try {
              const small = player.smallID();
              if (Number.isFinite(small)) {
                  return small;
              }
          }
          catch (error) {
              console.warn("Failed to resolve player smallID", error);
          }
          const rawId = player.id();
          const numeric = typeof rawId === "number" ? rawId : Number(rawId);
          return Number.isFinite(numeric) ? numeric : null;
      }
      safePlayerId(player) {
          try {
              const raw = player.id();
              if (raw !== undefined && raw !== null) {
                  return String(raw);
              }
          }
          catch (error) {
              console.warn("Failed to resolve player id", error);
          }
          const fallback = this.safePlayerSmallId(player);
          return fallback !== null ? String(fallback) : undefined;
      }
      resolvePlayerColor(player) {
          if (!player) {
              return undefined;
          }
          try {
              const direct = player.color;
              if (typeof direct === "string" && direct.trim()) {
                  return direct.trim();
              }
              const callable = player.color;
              if (typeof callable === "function") {
                  const result = callable.call(player);
                  const normalized = this.normalizeColorValue(result);
                  if (normalized) {
                      return normalized;
                  }
              }
              const territoryFn = player.territoryColor;
              if (typeof territoryFn === "function") {
                  const territory = territoryFn.call(player);
                  const normalized = this.normalizeColorValue(territory);
                  if (normalized) {
                      return normalized;
                  }
              }
              const cosmetics = player.cosmetics;
              const cosmeticColor = cosmetics?.color?.color;
              if (typeof cosmeticColor === "string" && cosmeticColor.trim()) {
                  return cosmeticColor.trim();
              }
          }
          catch (error) {
              console.warn("Failed to resolve player color", error);
          }
          return undefined;
      }
      normalizeColorValue(value) {
          if (!value) {
              return undefined;
          }
          if (typeof value === "string" && value.trim()) {
              return value.trim();
          }
          if (typeof value === "object" && value !== null) {
              const hex = value.toHex?.();
              if (typeof hex === "string" && hex.trim()) {
                  return hex.trim();
              }
              const rgb = value.toRgbString?.();
              if (typeof rgb === "string" && rgb.trim()) {
                  return rgb.trim();
              }
          }
          return undefined;
      }
      describeTile(ref) {
          if (!this.game || ref === undefined) {
              return undefined;
          }
          const x = this.game.x(ref);
          const y = this.game.y(ref);
          let ownerId;
          let ownerName;
          if (this.game.hasOwner(ref)) {
              const smallId = this.game.ownerID(ref);
              ownerId = String(smallId);
              ownerName = this.resolveNameBySmallId(smallId);
          }
          return { ref, x, y, ownerId, ownerName };
      }
      describePlayerFocus(player) {
          if (!this.game) {
              return undefined;
          }
          try {
              const location = player.nameLocation?.();
              if (!location) {
                  return undefined;
              }
              const { x, y } = location;
              if (!Number.isFinite(x) || !Number.isFinite(y)) {
                  return undefined;
              }
              let ref;
              try {
                  if (this.game.isValidCoord(x, y)) {
                      ref = this.game.ref(x, y);
                  }
              }
              catch (error) {
                  console.warn("Failed to resolve player focus ref", error);
              }
              return {
                  ref,
                  x,
                  y,
                  ownerId: String(player.id()),
                  ownerName: player.displayName(),
              };
          }
          catch (error) {
              console.warn("Failed to resolve player focus position", error);
              return undefined;
          }
      }
      normalizeShipType(unitType) {
          switch (unitType) {
              case "Transport":
                  return "Transport";
              case "Trade Ship":
                  return "Trade Ship";
              case "Warship":
                  return "Warship";
              default:
                  return null;
          }
      }
      captureAllianceChanges(players) {
          const nowTicks = this.game?.ticks() ?? 0;
          for (const player of players) {
              const playerId = String(player.id());
              const currentAlliances = new Set(player
                  .alliances()
                  .filter((alliance) => alliance.expiresAt > nowTicks)
                  .map((alliance) => String(alliance.other)));
              const previous = this.previousAlliances.get(playerId);
              if (previous) {
                  const removed = [...previous].filter((id) => !currentAlliances.has(id));
                  if (removed.length > 0 && this.isPlayerCurrentlyTraitor(player)) {
                      for (const removedId of removed) {
                          const targetName = this.resolveNameByPlayerId(removedId) ?? `Player ${removedId}`;
                          this.getTraitorTargets(playerId).add(targetName);
                      }
                  }
              }
              this.previousAlliances.set(playerId, currentAlliances);
          }
      }
      createPlayerRecord(player, currentTimeMs, localPlayer) {
          const playerId = String(player.id());
          const name = player.displayName();
          const clan = extractClanTag(name);
          const incomingRaw = player
              .incomingAttacks()
              .filter((attack) => !attack.retreating);
          const outgoingRaw = player
              .outgoingAttacks()
              .filter((attack) => !attack.retreating);
          const incomingAttacks = this.mapIncomingAttacks(incomingRaw);
          const outgoingAttacks = this.mapOutgoingAttacks(outgoingRaw);
          const expansions = outgoingRaw.filter((attack) => attack.targetID === 0).length;
          const alliances = this.mapActiveAlliances(player);
          const goldValue = player.gold();
          const gold = typeof goldValue === "bigint" ? Number(goldValue) : goldValue;
          const tradeStatus = this.determineTradeStatus(localPlayer, player);
          const tradeStopped = tradeStatus.stopped;
          const tradeStoppedBySelf = tradeStatus.stoppedBySelf;
          const tradeStoppedByOther = tradeStatus.stoppedByOther;
          const isSelf = this.isSamePlayer(localPlayer, playerId);
          return {
              id: playerId,
              name,
              clan,
              team: player.team() ?? undefined,
              color: this.resolvePlayerColor(player) ?? undefined,
              position: this.describePlayerFocus(player),
              traitorTargets: Array.from(this.getTraitorTargets(playerId)),
              tradeStopped,
              tradeStoppedBySelf,
              tradeStoppedByOther,
              isSelf,
              tiles: player.numTilesOwned(),
              gold,
              troops: player.troops(),
              incomingAttacks,
              outgoingAttacks,
              defensiveSupports: [],
              expansions,
              waiting: !player.hasSpawned(),
              eliminated: !player.isAlive(),
              disconnected: player.isDisconnected(),
              traitor: player.isTraitor(),
              alliances,
              lastUpdatedMs: currentTimeMs,
          };
      }
      mapIncomingAttacks(attacks) {
          return attacks.map((attack) => ({
              id: attack.id,
              from: this.resolveNameBySmallId(attack.attackerID),
              troops: this.resolveAttackTroops(attack),
          }));
      }
      mapOutgoingAttacks(attacks) {
          return attacks.map((attack) => ({
              id: attack.id,
              target: this.resolveNameBySmallId(attack.targetID),
              troops: this.resolveAttackTroops(attack),
          }));
      }
      resolveAttackTroops(attack) {
          if (attack.troops > 0) {
              return attack.troops;
          }
          const manifest = this.shipManifests.get(String(attack.id));
          return manifest ?? attack.troops;
      }
      mapActiveAlliances(player) {
          const nowTicks = this.game?.ticks() ?? 0;
          return player
              .alliances()
              .filter((alliance) => alliance.expiresAt > nowTicks)
              .map((alliance) => ({
              id: `${player.id()}-${alliance.id}`,
              partner: this.resolveNameByPlayerId(String(alliance.other)) ??
                  `Player ${alliance.other}`,
              startedAtMs: alliance.createdAt * TICK_MILLISECONDS,
          }));
      }
      resolveNameBySmallId(id) {
          if (id === 0) {
              return "Terra Nullius";
          }
          if (!this.game) {
              return `Player ${id}`;
          }
          try {
              const entity = this.game.playerBySmallID(id);
              if ("displayName" in entity && typeof entity.displayName === "function") {
                  return entity.displayName();
              }
              if ("name" in entity && typeof entity.name === "function") {
                  return entity.name();
              }
          }
          catch (error) {
              console.warn("Failed to resolve player by small id", id, error);
          }
          return `Player ${id}`;
      }
      resolveNameByPlayerId(id) {
          if (!this.game) {
              return undefined;
          }
          try {
              return this.game.player(id).displayName();
          }
          catch (error) {
              console.warn("Failed to resolve player by id", id, error);
              return undefined;
          }
      }
      getTraitorTargets(playerId) {
          if (!this.traitorHistory.has(playerId)) {
              this.traitorHistory.set(playerId, new Set());
          }
          return this.traitorHistory.get(playerId);
      }
      isPlayerCurrentlyTraitor(player) {
          if (player.isTraitor()) {
              return true;
          }
          if (typeof player.getTraitorRemainingTicks === "function") {
              return player.getTraitorRemainingTicks() > 0;
          }
          const remaining = player.traitorRemainingTicks;
          return typeof remaining === "number" ? remaining > 0 : false;
      }
      resolveLocalPlayer() {
          if (!this.game) {
              return null;
          }
          if (typeof this.game.myPlayer !== "function") {
              return null;
          }
          try {
              return this.game.myPlayer() ?? null;
          }
          catch (error) {
              console.warn("Failed to resolve local player", error);
              return null;
          }
      }
      determineTradeStatus(localPlayer, other) {
          const baseline = {
              stopped: false,
              stoppedBySelf: false,
              stoppedByOther: false,
          };
          if (!localPlayer) {
              return baseline;
          }
          if (this.isSamePlayer(localPlayer, String(other.id()))) {
              return baseline;
          }
          let aggregate;
          if (typeof localPlayer.hasEmbargo === "function") {
              try {
                  const result = localPlayer.hasEmbargo(other);
                  if (typeof result === "boolean") {
                      aggregate = result;
                  }
              }
              catch (error) {
                  console.warn("Failed to read embargo state", error);
              }
          }
          let outbound;
          if (typeof localPlayer.hasEmbargoAgainst === "function") {
              try {
                  const result = localPlayer.hasEmbargoAgainst(other);
                  if (typeof result === "boolean") {
                      outbound = result;
                  }
              }
              catch (error) {
                  console.warn("Failed to read outbound embargo state", error);
              }
          }
          let inbound;
          if (typeof other.hasEmbargoAgainst === "function") {
              try {
                  const result = other.hasEmbargoAgainst(localPlayer);
                  if (typeof result === "boolean") {
                      inbound = result;
                  }
              }
              catch (error) {
                  console.warn("Failed to read inbound embargo state", error);
              }
          }
          let stoppedBySelf = outbound ?? false;
          let stoppedByOther = inbound ?? false;
          if (aggregate === true) {
              if (outbound === undefined && inbound === undefined) {
                  stoppedBySelf = true;
                  stoppedByOther = true;
              }
              else if (outbound === undefined && !stoppedByOther) {
                  stoppedBySelf = true;
              }
              else if (inbound === undefined && !stoppedBySelf) {
                  stoppedByOther = true;
              }
          }
          const stopped = Boolean((aggregate ?? false) || stoppedBySelf || stoppedByOther);
          return { stopped, stoppedBySelf, stoppedByOther };
      }
      isSamePlayer(player, otherId) {
          if (!player) {
              return false;
          }
          try {
              const id = player.id();
              return String(id) === otherId;
          }
          catch (error) {
              console.warn("Failed to compare player identity", error);
              return false;
          }
      }
      resolvePlayerById(playerId) {
          if (!this.game) {
              return null;
          }
          const attempts = [
              () => {
                  try {
                      const candidate = this.game?.player(playerId);
                      return this.isPlayerViewLike(candidate) ? candidate : null;
                  }
                  catch (error) {
                      return null;
                  }
              },
          ];
          const numericId = Number(playerId);
          if (Number.isFinite(numericId)) {
              attempts.push(() => {
                  try {
                      const candidate = this.game?.player(numericId);
                      return this.isPlayerViewLike(candidate) ? candidate : null;
                  }
                  catch (error) {
                      return null;
                  }
              });
              attempts.push(() => {
                  try {
                      const candidate = this.game?.playerBySmallID(numericId);
                      return this.isPlayerViewLike(candidate) ? candidate : null;
                  }
                  catch (error) {
                      return null;
                  }
              });
          }
          for (const attempt of attempts) {
              const result = attempt();
              if (result) {
                  return result;
              }
          }
          console.warn(`Failed to resolve player ${playerId} in game context`);
          return null;
      }
      isPlayerViewLike(value) {
          if (!value || typeof value !== "object") {
              return false;
          }
          const candidate = value;
          return (typeof candidate.id === "function" &&
              typeof candidate.displayName === "function" &&
              typeof candidate.smallID === "function");
      }
      describePlayerForLog(player) {
          let name = "Unknown";
          let id = "?";
          try {
              name = player.displayName();
          }
          catch (error) {
              // ignore
          }
          try {
              id = player.id();
          }
          catch (error) {
              // ignore
          }
          return `${name} (#${id})`;
      }
  }

  async function ensureTailwind() {
      if (document.querySelector("script[data-openfront-tailwind]")) {
          return;
      }
      await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://cdn.tailwindcss.com?plugins=forms,typography";
          script.dataset.openfrontTailwind = "true";
          script.async = true;
          const tailwindGlobal = window.tailwind ?? {};
          tailwindGlobal.config = {
              corePlugins: {
                  preflight: false,
              },
              theme: {
                  extend: {},
              },
          };
          window.tailwind = tailwindGlobal;
          script.onload = () => resolve();
          script.onerror = () => resolve();
          document.head.appendChild(script);
      });
  }
  async function initializeSidebar() {
      if (window.openFrontStrategicSidebar) {
          return;
      }
      await ensureTailwind();
      const store = new DataStore();
      new SidebarApp(store);
      window.openFrontStrategicSidebar = {
          updateData: (snapshot) => store.update(snapshot),
          logger: sidebarLogger,
      };
  }
  if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => void initializeSidebar());
  }
  else {
      void initializeSidebar();
  }

})();
