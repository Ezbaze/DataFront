
// ==UserScript==
// @name			DataFront
// @namespace		https://openfront.io/
// @version			0.2.0
// @description		Adds a resizable, splittable strategic sidebar for OpenFront players, clans, and teams.
// @author			ezbaze
// @match			https://*.openfront.io/*
// @match			https://openfront.io/*
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			unsafeWindow
// @license			MIT
// @updateURL		https://raw.githubusercontent.com/Ezbaze/DataFront/main/dist/datafront.user.js
// @downloadURL		https://raw.githubusercontent.com/Ezbaze/DataFront/main/dist/datafront.user.js
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
  const createElement$9 = (iconNode, customAttrs = {}) => {
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

  const ChevronDown = [["path", { d: "m6 9 6 6 6-6" }]];

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

  const ExternalLink = [
    ["path", { d: "M15 3h6v6" }],
    ["path", { d: "M10 14 21 3" }],
    ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }]
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

  const Radar = [
    ["path", { d: "M19.07 4.93A10 10 0 0 0 6.99 3.34" }],
    ["path", { d: "M4 6h.01" }],
    ["path", { d: "M2.29 9.62A10 10 0 1 0 21.31 8.35" }],
    ["path", { d: "M16.24 7.76A6 6 0 1 0 8.23 16.67" }],
    ["path", { d: "M12 18h.01" }],
    ["path", { d: "M17.99 11.66A6 6 0 0 1 15.77 16.67" }],
    ["circle", { cx: "12", cy: "12", r: "2" }],
    ["path", { d: "m13.41 10.59 5.66-5.66" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const Save = [
    [
      "path",
      {
        d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
      }
    ],
    ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" }],
    ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const Search = [
    ["path", { d: "m21 21-4.34-4.34" }],
    ["circle", { cx: "11", cy: "11", r: "8" }]
  ];

  /**
   * @license lucide v0.545.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */

  const Ship = [
    ["path", { d: "M12 10.189V14" }],
    ["path", { d: "M12 2v3" }],
    ["path", { d: "M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" }],
    [
      "path",
      {
        d: "M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"
      }
    ],
    [
      "path",
      {
        d: "M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"
      }
    ]
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
      save: Save,
      trash: Trash,
      "arrow-down": ArrowDown,
      columns: Columns3,
      radar: Radar,
      search: Search,
      "chevron-down": ChevronDown,
      "external-link": ExternalLink,
  };
  function renderIcon(kind, className) {
      const iconNode = ICONS[kind];
      const svg = createElement$9(iconNode);
      if (className) {
          svg.setAttribute("class", className);
      }
      svg.setAttribute("aria-hidden", "true");
      return svg;
  }

  const DEFAULT_SORT_STATES = {
      players: { key: "tiles", direction: "desc" },
      clanmates: { key: "label", direction: "asc" },
      teams: { key: "tiles", direction: "desc" },
      attacks: { key: "troops", direction: "desc" },
      ships: { key: "owner", direction: "asc" },
      player: { key: "tiles", direction: "desc" },
      actions: { key: "label", direction: "asc" },
      actionEditor: { key: "label", direction: "asc" },
      runningActions: { key: "label", direction: "asc" },
      runningAction: { key: "label", direction: "asc" },
      logs: { key: "label", direction: "asc" },
      overlays: { key: "label", direction: "asc" },
  };
  let leafIdCounter = 0;
  let groupIdCounter = 0;
  function createLeaf(view) {
      return {
          id: `leaf-${++leafIdCounter}`,
          type: "leaf",
          view,
          viewSearchFilters: {},
          viewSearchEnabled: {},
          expandedRows: new Set(),
          expandedGroups: new Set(),
          sortStates: {
              players: { ...DEFAULT_SORT_STATES.players },
              clanmates: { ...DEFAULT_SORT_STATES.clanmates },
              teams: { ...DEFAULT_SORT_STATES.teams },
              attacks: { ...DEFAULT_SORT_STATES.attacks },
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
  function findPanelParent(current, target) {
      if (current.type !== "group") {
          return null;
      }
      for (let i = 0; i < current.children.length; i++) {
          const child = current.children[i];
          if (child === target) {
              return { parent: current, index: i };
          }
          const result = findPanelParent(child, target);
          if (result) {
              return result;
          }
      }
      return null;
  }
  function splitPanelLeaf(rootNode, leaf, orientation) {
      const newLeaf = createLeaf(leaf.view);
      const parentInfo = findPanelParent(rootNode, leaf);
      if (!parentInfo) {
          return createGroup(orientation, [leaf, newLeaf]);
      }
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
          const currentSize = parent.sizes[index] ?? (inferredSize > 0 ? inferredSize : fallbackSize);
          const newSize = currentSize / 2;
          parent.sizes[index] = currentSize - newSize;
          parent.children.splice(index + 1, 0, newLeaf);
          parent.sizes.splice(index + 1, 0, newSize);
      }
      else {
          const replacement = createGroup(orientation, [leaf, newLeaf]);
          parent.children[index] = replacement;
      }
      return rootNode;
  }

  const SidebarRole = {
      TableContainer: "table-container",
      ColumnVisibilityMenu: "column-visibility-menu",
      ContextMenu: "context-menu",
      ActionsDirectory: "actions-directory",
      ActionEditor: "action-editor",
      RunningActions: "running-actions",
      RunningActionDetail: "running-action",
      LogView: "log-view",
      LogEntry: "log-entry",
      LogMention: "log-mention",
      OverlaysDirectory: "overlays-directory",
      PlayerPanel: "player-panel",
  };

  const SIDEBAR_ID = "datafront";
  const SIDEBAR_STYLE_ID = "datafront-styles";

  // Mirrors OpenFrontIO clan parsing:
  // - Matches the first `[TAG]` anywhere in the name
  // - Allows alphanumeric tags 2..5 chars
  // - Normalizes to uppercase for grouping/matching
  const CLAN_TAG_PATTERN = /\[([a-zA-Z0-9]{2,5})\]/;
  const numberFormatter = new Intl.NumberFormat("en-US");
  function getMenuMount(doc) {
      return doc.getElementById(SIDEBAR_ID) ?? doc.body;
  }
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
      if (!name.includes("[") || !name.includes("]")) {
          return undefined;
      }
      const match = name.match(CLAN_TAG_PATTERN);
      return match ? match[1].toUpperCase() : undefined;
  }
  function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
  }
  function createElement$8(tag, className, textContent, doc = document) {
      const el = doc.createElement(tag);
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
  const TRANSFORM_HANDLER_SELECTORS = [
      "emoji-table",
      "build-menu",
      "spawn-timer",
      "player-info-overlay",
  ];
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
      for (const selector of TRANSFORM_HANDLER_SELECTORS) {
          const element = document.querySelector(selector);
          if (!element) {
              continue;
          }
          const transformHandler = element.transformHandler ?? element.transform;
          const onGoToPosition = transformHandler?.onGoToPosition;
          if (typeof onGoToPosition === "function") {
              cachedEmitterElement = element;
              cachedGoToEmitter = (x, y) => {
                  onGoToPosition.call(transformHandler, { x, y });
              };
              return cachedGoToEmitter;
          }
      }
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
  const contextMenuStates = new WeakMap();
  function ensureContextMenuState(doc) {
      let state = contextMenuStates.get(doc);
      if (!state) {
          state = { element: null, cleanup: null };
          contextMenuStates.set(doc, state);
      }
      return state;
  }
  function ensureContextMenuElement(doc) {
      const state = ensureContextMenuState(doc);
      if (!state.element) {
          state.element = createElement$8("div", "fixed z-[2147483647] min-w-[160px] overflow-hidden rounded-md border " +
              "border-slate-700/80 bg-slate-950/95 text-sm text-slate-100 shadow-2xl " +
              "backdrop-blur", undefined, doc);
          state.element.dataset.sidebarRole = SidebarRole.ContextMenu;
          state.element.style.pointerEvents = "auto";
          state.element.style.zIndex = "2147483647";
      }
      return state.element;
  }
  function hideContextMenu(doc = document) {
      const state = ensureContextMenuState(doc);
      if (state.cleanup) {
          state.cleanup();
          state.cleanup = null;
      }
      if (state.element && state.element.parentElement) {
          state.element.parentElement.removeChild(state.element);
      }
  }
  function showContextMenu(options) {
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
      const wrapper = createElement$8("div", "flex flex-col", undefined, doc);
      if (title) {
          const header = createElement$8("div", "border-b border-slate-800/80 px-3 py-2 text-xs font-semibold uppercase " +
              "tracking-wide text-slate-300", title, doc);
          wrapper.appendChild(header);
      }
      const list = createElement$8("div", "py-1", undefined, doc);
      for (const item of items) {
          const button = createElement$8("button", `${item.disabled
            ? "cursor-not-allowed text-slate-500"
            : "hover:bg-slate-800/80 hover:text-sky-200"} flex w-full items-center gap-2 px-3 py-2 text-left transition-colors`, item.label, doc);
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
      getMenuMount(doc).appendChild(menu);
      const rect = menu.getBoundingClientRect();
      const maxLeft = win.innerWidth - rect.width - 8;
      const maxTop = win.innerHeight - rect.height - 8;
      const left = Math.max(8, Math.min(x, Math.max(8, maxLeft)));
      const top = Math.max(8, Math.min(y, Math.max(8, maxTop)));
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      menu.style.visibility = "visible";
      const state = ensureContextMenuState(doc);
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
          state.cleanup = null;
      };
      state.cleanup = cleanupContextMenu;
      win.setTimeout(() => {
          if (state.cleanup !== cleanupContextMenu) {
              return;
          }
          const handlePointerDown = (event) => {
              if (!(event.target instanceof Node)) {
                  return;
              }
              if (!menu.contains(event.target)) {
                  hideContextMenu(doc);
              }
          };
          const handleKeyDown = (event) => {
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
  async function copyTextToClipboard(text, doc = document) {
      const win = doc.defaultView ?? window;
      try {
          const clipboard = win.navigator?.clipboard;
          if (clipboard?.writeText) {
              await clipboard.writeText(text);
              return true;
          }
      }
      catch (error) {
          console.warn("Failed to write to clipboard", error);
      }
      try {
          const textarea = doc.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.left = "-9999px";
          textarea.style.top = "-9999px";
          textarea.setAttribute("readonly", "true");
          doc.body.appendChild(textarea);
          textarea.select();
          const ok = doc.execCommand?.("copy") ?? false;
          doc.body.removeChild(textarea);
          return ok;
      }
      catch (error) {
          console.warn("Failed to copy via fallback", error);
          return false;
      }
  }

  function startPanelResize(group, index, event) {
      // Use the event's ownerDocument without relying on instanceof checks that
      // break across window boundaries (e.g., pop-out sidebar).
      const target = event.target;
      const current = event.currentTarget;
      const doc = target?.ownerDocument ?? current?.ownerDocument ?? document;
      const win = doc.defaultView ?? window;
      const wrapper = group.element?.wrapper;
      if (!wrapper) {
          return;
      }
      const HtmlElementCtor = doc.defaultView?.HTMLElement ?? HTMLElement;
      const findChildWrapper = (targetIndex) => {
          const targetValue = String(targetIndex);
          for (let i = 0; i < wrapper.children.length; i += 1) {
              const child = wrapper.children[i];
              if (child instanceof HtmlElementCtor &&
                  child.dataset.panelChild === targetValue) {
                  return child;
              }
          }
          return null;
      };
      const childA = findChildWrapper(index);
      const childB = findChildWrapper(index + 1);
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
      const originalUserSelect = doc.body.style.userSelect;
      doc.body.style.userSelect = "none";
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
          win.removeEventListener("pointermove", onMove);
          win.removeEventListener("pointerup", stop);
          win.removeEventListener("pointercancel", stop);
          doc.body.style.userSelect = originalUserSelect;
      };
      win.addEventListener("pointermove", onMove);
      win.addEventListener("pointerup", stop);
      win.addEventListener("pointercancel", stop);
  }

  const SELECTED_ROW_INDICATOR_BOX_SHADOW = "inset 0.25rem 0 0 0 rgba(125, 211, 252, 0.65)";
  const TABLE_CELL_BASE_CLASS = "border-b border-r border-slate-800 border-slate-900/80 px-3 py-2 last:border-r-0";
  const TABLE_CELL_EXPANDABLE_CLASS = "border-b border-r border-slate-800/60 px-3 py-2 last:border-r-0";
  function applyRowSelectionIndicator(row, isSelected) {
      row.style.boxShadow = isSelected ? SELECTED_ROW_INDICATOR_BOX_SHADOW : "";
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
  function createPlayerNameElement(label, position, options) {
      const doc = options?.document ?? document;
      const classNames = [];
      if (options?.className) {
          classNames.push(options.className);
      }
      const isInteractive = typeof options?.onActivate === "function" || !!position;
      if (isInteractive) {
          classNames.push("cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 rounded-sm transition-colors");
      }
      const className = classNames.filter(Boolean).join(" ").trim();
      if (!isInteractive) {
          const tag = options?.asBlock ? "div" : "span";
          return createElement$8(tag, className, label, doc);
      }
      const button = createElement$8("button", className, label, doc);
      button.type = "button";
      button.title = `Focus on ${label}`;
      attachImmediateTileFocus(button, () => {
          if (typeof options?.onActivate === "function") {
              options.onActivate();
              return;
          }
          focusTile(position);
      });
      return button;
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
  const ATTACK_HEADERS = [
      { key: "label", label: "Attacker", align: "left", hideable: false },
      { key: "owner", label: "Target", align: "left" },
      { key: "troops", label: "Troops", align: "right" },
  ];
  const DEFAULT_SORT_STATE = {
      key: "tiles",
      direction: "desc",
  };
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
      { key: "scope", label: "Scope", align: "left", sortKey: "scope" },
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
          case "attacks":
              return ATTACK_HEADERS;
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
  function createTableShell(options) {
      const { sortState, onSort, existingContainer, view, headers, role } = options;
      const doc = existingContainer?.ownerDocument ?? options.document ?? document;
      const containerClass = "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
      const tableClass = "min-w-full border-collapse text-xs text-slate-100";
      const targetRole = role ?? SidebarRole.TableContainer;
      const canReuse = !!existingContainer &&
          existingContainer.dataset.sidebarRole === targetRole &&
          existingContainer.dataset.sidebarView === view;
      const container = canReuse
          ? existingContainer
          : createElement$8("div", containerClass, undefined, doc);
      container.className = containerClass;
      container.dataset.sidebarRole = targetRole;
      container.dataset.sidebarView = view;
      let table = container.querySelector("table");
      if (!table || !canReuse) {
          table = createElement$8("table", tableClass, undefined, doc);
      }
      else {
          table.className = tableClass;
      }
      const thead = table.tHead ?? createElement$8("thead", "sticky top-0 z-10", undefined, doc);
      thead.className = "sticky top-0 z-10";
      thead.replaceChildren();
      const headerRow = createElement$8("tr", "bg-slate-900/95", undefined, doc);
      for (const column of headers) {
          const th = createElement$8("th", `border-b border-r border-slate-800 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-300 last:border-r-0 ${column.align === "left"
            ? "text-left"
            : column.align === "right"
                ? "text-right"
                : "text-center"}`, undefined, doc);
          th.classList.add("bg-slate-900/90");
          const labelWrapper = createElement$8("span", `flex w-full items-center gap-1 text-inherit ${column.align === "left"
            ? "justify-start"
            : column.align === "right"
                ? "justify-end"
                : "justify-center"}`, column.label, doc);
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
              const indicator = createElement$8("span", `text-[0.6rem] ${isActive ? "text-sky-300" : "text-slate-500"}`, isActive ? (sortState.direction === "asc" ? "▲" : "▼") : "↕", doc);
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
      const tbody = table.tBodies[0] ??
          createElement$8("tbody", "text-[0.75rem]", undefined, doc);
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
  const columnMenuStates = new WeakMap();
  function ensureColumnMenuState(doc) {
      let state = columnMenuStates.get(doc);
      if (!state) {
          state = { element: null, cleanup: null };
          columnMenuStates.set(doc, state);
      }
      return state;
  }
  function ensureColumnMenuElement(doc) {
      const state = ensureColumnMenuState(doc);
      if (!state.element) {
          state.element = createElement$8("div", undefined, undefined, doc);
          state.element.dataset.sidebarRole = SidebarRole.ColumnVisibilityMenu;
          state.element.style.pointerEvents = "auto";
          state.element.style.zIndex = "2147483647";
      }
      state.element.className =
          "fixed z-[2147483647] min-w-[200px] overflow-hidden rounded-md border " +
              "border-slate-700/80 bg-slate-950/95 text-sm text-slate-100 shadow-2xl " +
              "backdrop-blur";
      return state.element;
  }
  function hideColumnVisibilityMenu(doc = document) {
      const state = ensureColumnMenuState(doc);
      if (state.cleanup) {
          const cleanup = state.cleanup;
          state.cleanup = null;
          cleanup();
          return;
      }
      if (state.element && state.element.parentElement) {
          state.element.parentElement.removeChild(state.element);
      }
  }
  function isColumnVisibilitySupported(view) {
      const headers = getTableHeadersForView(view);
      return Array.isArray(headers) && headers.length > 0;
  }
  function showColumnVisibilityMenu(options) {
      const { leaf, anchor, onChange } = options;
      const doc = anchor.ownerDocument ?? document;
      const win = doc.defaultView ?? window;
      const baseHeaders = getTableHeadersForView(leaf.view);
      if (!baseHeaders || baseHeaders.length === 0) {
          hideColumnVisibilityMenu(doc);
          return;
      }
      const visibility = ensureColumnVisibilityState(leaf, leaf.view, baseHeaders);
      const hideableHeaders = baseHeaders.filter((header) => header.hideable !== false);
      hideColumnVisibilityMenu(doc);
      const menu = ensureColumnMenuElement(doc);
      menu.style.visibility = "hidden";
      menu.style.left = "0px";
      menu.style.top = "0px";
      const wrapper = createElement$8("div", "flex flex-col", undefined, doc);
      wrapper.appendChild(createElement$8("div", "border-b border-slate-800/80 px-3 py-2 text-xs font-semibold uppercase " +
          "tracking-wide text-slate-300", "Columns", doc));
      const list = createElement$8("div", "py-1", undefined, doc);
      for (const header of baseHeaders) {
          const key = header.key;
          const item = createElement$8("label", `${header.hideable === false
            ? "cursor-default text-slate-300"
            : "cursor-pointer text-slate-200 hover:bg-slate-800/70"} flex items-center gap-3 px-3 py-2 text-xs transition-colors`, undefined, doc);
          const checkbox = doc.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className =
              "h-3.5 w-3.5 rounded border border-slate-600 bg-slate-900 text-sky-400 " +
                  "focus:outline-none focus:ring-2 focus:ring-sky-500";
          checkbox.checked = visibility[key] !== false;
          checkbox.disabled = header.hideable === false;
          item.appendChild(checkbox);
          const label = createElement$8("span", "flex-1 truncate", header.label, doc);
          item.appendChild(label);
          if (header.hideable === false) {
              item.title = "This column is always visible.";
              item.appendChild(createElement$8("span", "rounded-full border border-slate-700/70 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-slate-400", "Pinned", doc));
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
              leaf.columnVisibility[leaf.view] = {
                  ...visibility,
              };
              onChange?.();
          });
          list.appendChild(item);
      }
      if (list.childElementCount === 0) {
          hideColumnVisibilityMenu(doc);
          return;
      }
      wrapper.appendChild(list);
      menu.replaceChildren(wrapper);
      (doc.getElementById(SIDEBAR_ID) ?? doc.body).appendChild(menu);
      const menuRect = menu.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const viewportWidth = win.innerWidth;
      const viewportHeight = win.innerHeight;
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
      const state = ensureColumnMenuState(doc);
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
          if (state.cleanup === cleanupMenu) {
              state.cleanup = null;
          }
      };
      state.cleanup = cleanupMenu;
      win.setTimeout(() => {
          if (state.cleanup !== cleanupMenu) {
              return;
          }
          const handlePointerDown = (event) => {
              if (!(event.target instanceof Node)) {
                  return;
              }
              if (!menu.contains(event.target) && !anchor.contains(event.target)) {
                  hideColumnVisibilityMenu(doc);
              }
          };
          const handleKeyDown = (event) => {
              if (event.key === "Escape") {
                  hideColumnVisibilityMenu(doc);
              }
          };
          const handleScroll = (event) => {
              if (!event.isTrusted) {
                  return;
              }
              hideColumnVisibilityMenu(doc);
          };
          const handleBlur = () => hideColumnVisibilityMenu(doc);
          doc.addEventListener("pointerdown", handlePointerDown, true);
          doc.addEventListener("keydown", handleKeyDown, true);
          win.addEventListener("scroll", handleScroll, true);
          win.addEventListener("blur", handleBlur);
          cleanupHandlers.push(() => doc.removeEventListener("pointerdown", handlePointerDown, true));
          cleanupHandlers.push(() => doc.removeEventListener("keydown", handleKeyDown, true));
          cleanupHandlers.push(() => win.removeEventListener("scroll", handleScroll, true));
          cleanupHandlers.push(() => win.removeEventListener("blur", handleBlur));
      }, 0);
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

  function normalizeTroopCountForSearch(rawTroops) {
      if (!Number.isFinite(rawTroops)) {
          return 0;
      }
      return Math.floor(Math.max(rawTroops, 0) / 10);
  }
  function isPrimaryStart(token) {
      return (token.type === "not" ||
          token.type === "lparen" ||
          token.type === "word" ||
          token.type === "quoted");
  }
  function tokenize(input) {
      const tokens = [];
      let i = 0;
      const error = (message, index) => ({
          ok: false,
          error: { message, index },
      });
      while (i < input.length) {
          const ch = input[i];
          if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
              i += 1;
              continue;
          }
          if (ch === "(") {
              tokens.push({ type: "lparen", index: i });
              i += 1;
              continue;
          }
          if (ch === ")") {
              tokens.push({ type: "rparen", index: i });
              i += 1;
              continue;
          }
          if (ch === ":") {
              tokens.push({ type: "colon", index: i });
              i += 1;
              continue;
          }
          if (ch === "-") {
              const prev = i === 0 ? " " : input[i - 1];
              const next = input[i + 1];
              const precededByBoundary = i === 0 ||
                  prev === " " ||
                  prev === "\t" ||
                  prev === "\n" ||
                  prev === "\r" ||
                  prev === "(";
              const looksLikeNegation = next === "(" ||
                  next === '"' ||
                  (typeof next === "string" && /[a-zA-Z_]/.test(next));
              if (precededByBoundary && looksLikeNegation) {
                  tokens.push({ type: "not", index: i });
                  i += 1;
                  continue;
              }
          }
          if (ch === '"') {
              const start = i;
              i += 1;
              let value = "";
              let closed = false;
              while (i < input.length) {
                  const qch = input[i];
                  if (qch === '"') {
                      i += 1;
                      tokens.push({ type: "quoted", index: start, value });
                      value = "";
                      closed = true;
                      break;
                  }
                  if (qch === "\\") {
                      const next = input[i + 1];
                      if (next === undefined) {
                          return error("Unterminated escape sequence", i);
                      }
                      if (next === '"' || next === "\\" || next === "n" || next === "t") {
                          value +=
                              next === "n"
                                  ? "\n"
                                  : next === "t"
                                      ? "\t"
                                      : next === '"'
                                          ? '"'
                                          : "\\";
                          i += 2;
                          continue;
                      }
                      value += next;
                      i += 2;
                      continue;
                  }
                  value += qch;
                  i += 1;
              }
              if (!closed) {
                  return error("Unterminated quoted string", start);
              }
              continue;
          }
          const start = i;
          while (i < input.length) {
              const c = input[i];
              if (c === " " ||
                  c === "\t" ||
                  c === "\n" ||
                  c === "\r" ||
                  c === "(" ||
                  c === ")" ||
                  c === ":") {
                  break;
              }
              i += 1;
          }
          const word = input.slice(start, i);
          if (!word) {
              return error("Unexpected character", start);
          }
          tokens.push({ type: "word", index: start, value: word });
      }
      tokens.push({ type: "eof", index: input.length });
      return { ok: true, tokens };
  }
  class Parser {
      constructor(tokens) {
          this.index = 0;
          this.tokens = tokens;
      }
      peek() {
          return (this.tokens[this.index] ?? { type: "eof", index: this.tokens.length });
      }
      consume() {
          const token = this.peek();
          this.index = Math.min(this.index + 1, this.tokens.length);
          return token;
      }
      expect(type, message) {
          const token = this.peek();
          if (token.type !== type) {
              return { ok: false, error: { message, index: token.index } };
          }
          return { ok: true, token: this.consume() };
      }
      matchOperator(op) {
          const token = this.peek();
          return token.type === "word" && token.value.toLowerCase() === op;
      }
      parse() {
          const expr = this.parseOr();
          if (!expr.ok) {
              return expr;
          }
          const extra = this.peek();
          if (extra.type !== "eof") {
              return {
                  ok: false,
                  error: { message: "Unexpected token", index: extra.index },
              };
          }
          return { ok: true, ast: expr.ast };
      }
      parseOr() {
          let left = this.parseAnd();
          if (!left.ok) {
              return left;
          }
          while (this.matchOperator("or")) {
              this.consume();
              const right = this.parseAnd();
              if (!right.ok) {
                  return right;
              }
              left = {
                  ok: true,
                  ast: { type: "or", left: left.ast, right: right.ast },
              };
          }
          return left;
      }
      parseAnd() {
          let left = this.parseNot();
          if (!left.ok) {
              return left;
          }
          while (true) {
              if (this.matchOperator("and")) {
                  this.consume();
                  const right = this.parseNot();
                  if (!right.ok) {
                      return right;
                  }
                  left = {
                      ok: true,
                      ast: { type: "and", left: left.ast, right: right.ast },
                  };
                  continue;
              }
              const next = this.peek();
              if (next.type === "eof" ||
                  next.type === "rparen" ||
                  this.matchOperator("or")) {
                  break;
              }
              if (isPrimaryStart(next)) {
                  const right = this.parseNot();
                  if (!right.ok) {
                      return right;
                  }
                  left = {
                      ok: true,
                      ast: { type: "and", left: left.ast, right: right.ast },
                  };
                  continue;
              }
              break;
          }
          return left;
      }
      parseNot() {
          const token = this.peek();
          if (token.type === "not" ||
              (token.type === "word" && token.value.toLowerCase() === "not")) {
              this.consume();
              const expr = this.parseNot();
              if (!expr.ok) {
                  return expr;
              }
              return { ok: true, ast: { type: "not", expr: expr.ast } };
          }
          return this.parsePrimary();
      }
      parsePrimary() {
          const token = this.peek();
          if (token.type === "lparen") {
              this.consume();
              const expr = this.parseOr();
              if (!expr.ok) {
                  return expr;
              }
              const rparen = this.expect("rparen", "Expected ')'");
              if (!rparen.ok) {
                  return rparen;
              }
              return expr;
          }
          return this.parseTerm();
      }
      parseTerm() {
          const token = this.peek();
          if (token.type !== "word" && token.type !== "quoted") {
              return {
                  ok: false,
                  error: { message: "Expected search term", index: token.index },
              };
          }
          if (token.type === "word") {
              const next = this.tokens[this.index + 1];
              if (next?.type === "colon") {
                  const keyToken = this.consume();
                  this.consume(); // colon
                  const valueToken = this.peek();
                  if (valueToken.type !== "word" && valueToken.type !== "quoted") {
                      return {
                          ok: false,
                          error: {
                              message: "Expected value after ':'",
                              index: valueToken.index,
                          },
                      };
                  }
                  this.consume();
                  const key = keyToken.value.toLowerCase();
                  const compareOps = new Set([">", ">=", "<", "<=", "=", "!="]);
                  let rawValue = valueToken.value;
                  if (valueToken.type === "word" && compareOps.has(rawValue)) {
                      const possibleNumberToken = this.peek();
                      if ((possibleNumberToken.type === "word" ||
                          possibleNumberToken.type === "quoted") &&
                          Number.isFinite(Number(possibleNumberToken.value))) {
                          rawValue = `${rawValue} ${possibleNumberToken.value}`;
                          this.consume();
                      }
                  }
                  rawValue = this.maybeJoinRangeTokens(rawValue);
                  const value = rawValue.toLowerCase();
                  if (!value.trim()) {
                      return {
                          ok: false,
                          error: {
                              message: "Empty value is not allowed",
                              index: valueToken.index,
                          },
                      };
                  }
                  const compare = parseCompareValue(value);
                  if (compare.ok) {
                      return {
                          ok: true,
                          ast: {
                              type: "term",
                              term: {
                                  type: "compare",
                                  key,
                                  op: compare.op,
                                  value: compare.value,
                              },
                          },
                      };
                  }
                  if (compare.isCompareSyntax) {
                      return {
                          ok: false,
                          error: { message: compare.errorMessage, index: valueToken.index },
                      };
                  }
                  const range = parseRangeValue(value);
                  if (range.ok) {
                      return {
                          ok: true,
                          ast: {
                              type: "term",
                              term: { type: "range", key, min: range.min, max: range.max },
                          },
                      };
                  }
                  if (range.isRangeSyntax) {
                      return {
                          ok: false,
                          error: { message: range.errorMessage, index: valueToken.index },
                      };
                  }
                  return {
                      ok: true,
                      ast: { type: "term", term: { type: "keyValue", key, value } },
                  };
              }
          }
          const consumed = this.consume();
          const value = consumed.value.toLowerCase();
          if (!value.trim()) {
              return {
                  ok: false,
                  error: { message: "Empty term is not allowed", index: consumed.index },
              };
          }
          return {
              ok: true,
              ast: { type: "term", term: { type: "freeText", value } },
          };
      }
      maybeJoinRangeTokens(rawValue) {
          const looksNumeric = Number.isFinite(Number(rawValue));
          const next = this.peek();
          if (rawValue === "..") {
              if ((next.type === "word" && Number.isFinite(Number(next.value))) ||
                  (next.type === "quoted" && Number.isFinite(Number(next.value)))) {
                  rawValue = `..${next.value}`;
                  this.consume();
              }
              return rawValue;
          }
          if (rawValue.endsWith("..")) {
              if ((next.type === "word" && Number.isFinite(Number(next.value))) ||
                  (next.type === "quoted" && Number.isFinite(Number(next.value)))) {
                  rawValue = `${rawValue}${next.value}`;
                  this.consume();
              }
              return rawValue;
          }
          if (looksNumeric) {
              if (next.type === "word" && next.value === "..") {
                  this.consume(); // consume the ".."
                  const after = this.peek();
                  if ((after.type === "word" && Number.isFinite(Number(after.value))) ||
                      (after.type === "quoted" && Number.isFinite(Number(after.value)))) {
                      rawValue = `${rawValue}..${after.value}`;
                      this.consume();
                      return rawValue;
                  }
                  rawValue = `${rawValue}..`;
                  return rawValue;
              }
              if (next.type === "word" && next.value.startsWith("..")) {
                  rawValue = `${rawValue}${next.value}`;
                  this.consume();
                  return rawValue;
              }
          }
          return rawValue;
      }
  }
  function compileSearchQuery(input) {
      const trimmed = input.trim();
      if (!trimmed) {
          return {
              ok: true,
              ast: { type: "term", term: { type: "freeText", value: "" } },
          };
      }
      const tokenized = tokenize(trimmed);
      if (!tokenized.ok) {
          return { ok: false, error: tokenized.error };
      }
      const parser = new Parser(tokenized.tokens);
      return parser.parse();
  }
  function matchesSearchQuery(ast, target) {
      switch (ast.type) {
          case "and":
              return (matchesSearchQuery(ast.left, target) &&
                  matchesSearchQuery(ast.right, target));
          case "or":
              return (matchesSearchQuery(ast.left, target) ||
                  matchesSearchQuery(ast.right, target));
          case "not":
              return !matchesSearchQuery(ast.expr, target);
          case "term":
              return matchesTerm(ast.term, target);
          default:
              return false;
      }
  }
  function includes(haystack, needle) {
      if (!needle) {
          return true;
      }
      return haystack.includes(needle);
  }
  function parseBoolean(value) {
      switch (value.trim().toLowerCase()) {
          case "true":
          case "1":
          case "yes":
          case "y":
          case "on":
              return true;
          case "false":
          case "0":
          case "no":
          case "n":
          case "off":
              return false;
          default:
              return null;
      }
  }
  function logTokenText(tokens) {
      if (!tokens || tokens.length === 0) {
          return "";
      }
      return tokens
          .map((token) => (token.type === "text" ? token.text : (token.label ?? "")))
          .join(" ")
          .toLowerCase();
  }
  function logTokenMatchesType(tokens, type, value) {
      if (!tokens || tokens.length === 0) {
          return false;
      }
      const needle = value.toLowerCase();
      for (const token of tokens) {
          if (token.type !== type) {
              continue;
          }
          const label = (token.label ?? "").toLowerCase();
          const id = (token.id ?? "").toLowerCase();
          if (includes(label, needle) || includes(id, needle)) {
              return true;
          }
      }
      return false;
  }
  function logTokenMatchesFacet(tokens, key, value) {
      if (!tokens || tokens.length === 0) {
          return false;
      }
      const needle = value.toLowerCase();
      const facetKey = key.toLowerCase();
      for (const token of tokens) {
          if (token.type === "text") {
              continue;
          }
          const facets = token.facets;
          if (!facets) {
              continue;
          }
          const facetValues = facets[facetKey];
          if (!facetValues || facetValues.length === 0) {
              continue;
          }
          for (const facetValue of facetValues) {
              if (includes(String(facetValue ?? "").toLowerCase(), needle)) {
                  return true;
              }
          }
      }
      return false;
  }
  function formatTileSummaryForSearch(summary) {
      if (!summary) {
          return "";
      }
      const coords = `${summary.x}, ${summary.y}`;
      return summary.ownerName
          ? `${coords} (${summary.ownerName})`.toLowerCase()
          : coords.toLowerCase();
  }
  function deriveShipStatusForSearch(ship) {
      if (ship.retreating) {
          return "retreating";
      }
      if (ship.reachedTarget) {
          return "arrived";
      }
      if (ship.type === "Transport") {
          return "en route";
      }
      if (!ship.destination) {
          return ship.current ? "idle" : "unknown";
      }
      if (ship.current &&
          ship.destination &&
          ship.current.ref === ship.destination.ref) {
          return "stationed";
      }
      return "en route";
  }
  function defaultTextForTarget(target) {
      switch (target.kind) {
          case "player": {
              const p = target.player;
              const derivedClanTag = extractClanTag(p.name);
              const clan = p.clan ?? derivedClanTag ?? "";
              const clanTag = clan ? `[${clan}]` : "";
              const fields = [
                  p.name,
                  p.id,
                  p.team ?? "",
                  clan,
                  clanTag,
                  p.lobbyLabel ?? "",
                  p.lobbyGameId ?? "",
              ];
              return fields.join(" ").toLowerCase();
          }
          case "ship": {
              const s = target.ship;
              const label = `${s.type} #${s.id}`;
              const fields = [
                  label,
                  s.id,
                  s.type,
                  s.ownerName,
                  s.ownerId,
                  deriveShipStatusForSearch(s),
                  formatTileSummaryForSearch(s.origin),
                  formatTileSummaryForSearch(s.current),
                  formatTileSummaryForSearch(s.destination),
              ];
              return fields.join(" ").toLowerCase();
          }
          case "attack": {
              const a = target.attack;
              const fields = [a.id, a.attacker, a.target, a.troops.toString()];
              return fields.join(" ").toLowerCase();
          }
          case "log": {
              const e = target.entry;
              const fields = [
                  e.id,
                  e.level,
                  e.source ?? "",
                  e.message ?? "",
                  logTokenText(e.tokens),
              ];
              return fields.join(" ").toLowerCase();
          }
          case "action": {
              const a = target.action;
              const fields = [
                  a.id,
                  a.name,
                  a.description ?? "",
                  a.runMode,
                  a.enabled ? "enabled" : "disabled",
              ];
              return fields.join(" ").toLowerCase();
          }
          case "runningAction": {
              const r = target.run;
              const fields = [
                  r.id,
                  r.actionId,
                  r.name,
                  r.description ?? "",
                  r.runMode,
                  r.status,
              ];
              return fields.join(" ").toLowerCase();
          }
          default:
              return "";
      }
  }
  function matchesTerm(term, target) {
      if (term.type === "freeText") {
          return includes(defaultTextForTarget(target), term.value);
      }
      if (term.type === "compare") {
          return matchesComparison(term, target);
      }
      if (term.type === "range") {
          return matchesRange(term, target);
      }
      const key = term.key;
      const value = term.value;
      if (key === "text" || key === "message") {
          return includes(defaultTextForTarget(target), value);
      }
      if (key === "id") {
          switch (target.kind) {
              case "player":
                  return includes(target.player.id.toLowerCase(), value);
              case "ship":
                  return includes(target.ship.id.toLowerCase(), value);
              case "attack":
                  return includes(target.attack.id.toLowerCase(), value);
              case "log":
                  return includes(target.entry.id.toLowerCase(), value);
              case "action":
                  return includes(target.action.id.toLowerCase(), value);
              case "runningAction":
                  return includes(`${target.run.id} ${target.run.actionId}`.toLowerCase(), value);
              default:
                  return false;
          }
      }
      if (key === "publicid") {
          switch (target.kind) {
              case "player":
                  return includes((target.player.publicId ?? "").toLowerCase(), value);
              case "log":
                  return logTokenMatchesFacet(target.entry.tokens, "publicid", value);
              default:
                  return false;
          }
      }
      switch (target.kind) {
          case "player": {
              const p = target.player;
              switch (key) {
                  case "user":
                  case "player":
                      return includes(`${p.name} ${p.id}`.toLowerCase(), value);
                  case "clan": {
                      const derivedClanTag = extractClanTag(p.name);
                      const clan = p.clan ?? derivedClanTag ?? "";
                      const clanTag = clan ? `[${clan}]` : "";
                      return includes(`${clan} ${clanTag}`.toLowerCase(), value);
                  }
                  case "team":
                      return includes((p.team ?? "").toLowerCase(), value);
                  case "lobby":
                      return includes(`${p.lobbyLabel ?? ""} ${p.lobbyGameId ?? ""}`.toLowerCase(), value);
                  case "queueid":
                      return includes((p.lobbyGameId ?? "").toLowerCase(), value);
                  case "alive": {
                      const parsed = parseBoolean(value);
                      if (parsed === null) {
                          return false;
                      }
                      return !p.eliminated === parsed;
                  }
                  case "dead": {
                      const parsed = parseBoolean(value);
                      if (parsed === null) {
                          return false;
                      }
                      return p.eliminated === parsed;
                  }
                  default:
                      return false;
              }
          }
          case "ship": {
              const s = target.ship;
              switch (key) {
                  case "owner":
                  case "user":
                      return includes(`${s.ownerName} ${s.ownerId}`.toLowerCase(), value);
                  case "type":
                      return includes(s.type.toLowerCase(), value);
                  case "status":
                      return includes(deriveShipStatusForSearch(s), value);
                  case "origin":
                      return includes(formatTileSummaryForSearch(s.origin), value);
                  case "current":
                      return includes(formatTileSummaryForSearch(s.current), value);
                  case "destination":
                      return includes(formatTileSummaryForSearch(s.destination), value);
                  case "clan":
                      return includes((s.ownerClan ?? "").toLowerCase(), value);
                  case "team":
                      return includes((s.ownerTeam ?? "").toLowerCase(), value);
                  default:
                      return false;
              }
          }
          case "attack": {
              const a = target.attack;
              switch (key) {
                  case "user":
                  case "player":
                      return includes(`${a.attacker} ${a.target}`.toLowerCase(), value);
                  case "attacker":
                  case "from":
                      return includes(a.attacker.toLowerCase(), value);
                  case "target":
                  case "to":
                      return includes(a.target.toLowerCase(), value);
                  default:
                      return false;
              }
          }
          case "log": {
              const e = target.entry;
              switch (key) {
                  case "user":
                  case "player":
                      return (logTokenMatchesType(e.tokens, "player", value) ||
                          logTokenMatchesFacet(e.tokens, "user", value) ||
                          logTokenMatchesFacet(e.tokens, "player", value));
                  case "clan":
                      return (logTokenMatchesType(e.tokens, "clan", value) ||
                          logTokenMatchesFacet(e.tokens, "clan", value));
                  case "team":
                      return (logTokenMatchesType(e.tokens, "team", value) ||
                          logTokenMatchesFacet(e.tokens, "team", value));
                  case "level":
                      return includes((e.level ?? "").toLowerCase(), value);
                  case "source":
                      return includes((e.source ?? "").toLowerCase(), value);
                  default:
                      return logTokenMatchesFacet(e.tokens, key, value);
              }
          }
          case "action": {
              const a = target.action;
              switch (key) {
                  case "name":
                  case "action":
                      return includes(a.name.toLowerCase(), value);
                  case "desc":
                  case "description":
                      return includes((a.description ?? "").toLowerCase(), value);
                  case "mode":
                  case "runmode":
                      return includes(a.runMode.toLowerCase(), value);
                  case "enabled": {
                      const parsed = parseBoolean(value);
                      if (parsed === null) {
                          return false;
                      }
                      return a.enabled === parsed;
                  }
                  default:
                      return false;
              }
          }
          case "runningAction": {
              const r = target.run;
              switch (key) {
                  case "name":
                  case "action":
                      return includes(r.name.toLowerCase(), value);
                  case "desc":
                  case "description":
                      return includes((r.description ?? "").toLowerCase(), value);
                  case "mode":
                  case "runmode":
                      return includes(r.runMode.toLowerCase(), value);
                  case "status":
                      return includes(r.status.toLowerCase(), value);
                  default:
                      return false;
              }
          }
          default:
              return false;
      }
  }
  function parseCompareValue(value) {
      const match = /^(>=|<=|!=|=|>|<)\s*(.+)$/.exec(value.trim());
      if (!match) {
          return { ok: false, isCompareSyntax: false, errorMessage: "" };
      }
      const [, opRaw, numberRaw] = match;
      const op = opRaw;
      const num = Number(numberRaw);
      if (!Number.isFinite(num)) {
          return {
              ok: false,
              isCompareSyntax: true,
              errorMessage: `Expected a number after '${op}'`,
          };
      }
      return { ok: true, op, value: num };
  }
  function parseRangeValue(value) {
      const trimmed = value.trim();
      const match = /^\s*(-?\d+(?:\.\d+)?)?\s*\.\.\s*(-?\d+(?:\.\d+)?)?\s*$/.exec(trimmed);
      if (!match) {
          return { ok: false, isRangeSyntax: false, errorMessage: "" };
      }
      const [, leftTextRaw, rightTextRaw] = match;
      const hasLeft = typeof leftTextRaw === "string" && leftTextRaw.trim() !== "";
      const hasRight = typeof rightTextRaw === "string" && rightTextRaw.trim() !== "";
      if (!hasLeft && !hasRight) {
          return {
              ok: false,
              isRangeSyntax: true,
              errorMessage: "Range must specify at least one bound",
          };
      }
      const min = hasLeft ? Number(leftTextRaw) : undefined;
      const max = hasRight ? Number(rightTextRaw) : undefined;
      if (hasLeft && !Number.isFinite(min)) {
          return {
              ok: false,
              isRangeSyntax: true,
              errorMessage: "Range lower bound must be a number",
          };
      }
      if (hasRight && !Number.isFinite(max)) {
          return {
              ok: false,
              isRangeSyntax: true,
              errorMessage: "Range upper bound must be a number",
          };
      }
      return { ok: true, min, max };
  }
  function compareNumber(op, left, right) {
      switch (op) {
          case ">":
              return left > right;
          case ">=":
              return left >= right;
          case "<":
              return left < right;
          case "<=":
              return left <= right;
          case "=":
              return left === right;
          case "!=":
              return left !== right;
          default:
              return false;
      }
  }
  function matchesComparison(term, target) {
      const key = term.key;
      const right = term.value;
      const tryLogFacetNumber = () => {
          if (target.kind !== "log") {
              return false;
          }
          const tokens = target.entry.tokens;
          if (!tokens) {
              return false;
          }
          for (const token of tokens) {
              if (token.type === "text") {
                  continue;
              }
              const values = token.facets?.[key];
              if (!values) {
                  continue;
              }
              for (const raw of values) {
                  const left = typeof raw === "number"
                      ? raw
                      : typeof raw === "string"
                          ? Number(raw)
                          : NaN;
                  if (!Number.isFinite(left)) {
                      continue;
                  }
                  if (compareNumber(term.op, left, right)) {
                      return true;
                  }
              }
          }
          return false;
      };
      switch (target.kind) {
          case "player": {
              const p = target.player;
              let left = null;
              switch (key) {
                  case "id": {
                      const num = Number(p.id);
                      left = Number.isFinite(num) ? num : null;
                      break;
                  }
                  case "tiles":
                      left = p.tiles;
                      break;
                  case "gold":
                      left = p.gold;
                      break;
                  case "troops":
                      left = normalizeTroopCountForSearch(p.troops);
                      break;
                  case "expansions":
                      left = p.expansions;
                      break;
                  case "incoming":
                      left = p.incomingAttacks.length;
                      break;
                  case "outgoing":
                      left = p.outgoingAttacks.length;
                      break;
                  case "supports":
                  case "defensive":
                      left = p.defensiveSupports.length;
                      break;
                  case "alliances":
                      left = p.alliances.length;
                      break;
                  case "updated":
                  case "lastupdated":
                      left = p.lastUpdatedMs;
                      break;
                  case "lobbypos":
                  case "lobbyposition":
                      left = typeof p.lobbyPosition === "number" ? p.lobbyPosition : null;
                      break;
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : compareNumber(term.op, left, right);
          }
          case "ship": {
              const s = target.ship;
              let left = null;
              switch (key) {
                  case "troops":
                      left = normalizeTroopCountForSearch(s.troops);
                      break;
                  case "id": {
                      const num = Number(s.id);
                      left = Number.isFinite(num) ? num : null;
                      break;
                  }
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : compareNumber(term.op, left, right);
          }
          case "attack": {
              const a = target.attack;
              let left = null;
              switch (key) {
                  case "troops":
                      left = normalizeTroopCountForSearch(a.troops);
                      break;
                  case "id": {
                      const num = Number(a.id);
                      left = Number.isFinite(num) ? num : null;
                      break;
                  }
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : compareNumber(term.op, left, right);
          }
          case "log": {
              const e = target.entry;
              let left = null;
              switch (key) {
                  case "timestamp":
                  case "time":
                      left = e.timestampMs;
                      break;
                  default:
                      left = null;
                      break;
              }
              if (left !== null) {
                  return compareNumber(term.op, left, right);
              }
              return tryLogFacetNumber();
          }
          case "action": {
              const a = target.action;
              let left = null;
              switch (key) {
                  case "interval":
                  case "runinterval":
                  case "runintervalticks":
                      left = a.runIntervalTicks;
                      break;
                  case "created":
                  case "createdat":
                  case "createdatms":
                      left = a.createdAtMs;
                      break;
                  case "updated":
                  case "updatedat":
                  case "updatedatms":
                      left = a.updatedAtMs;
                      break;
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : compareNumber(term.op, left, right);
          }
          case "runningAction": {
              const r = target.run;
              let left = null;
              switch (key) {
                  case "interval":
                  case "runinterval":
                  case "runintervalticks":
                      left = r.runIntervalTicks;
                      break;
                  case "started":
                  case "startedat":
                  case "startedatms":
                      left = r.startedAtMs;
                      break;
                  case "updated":
                  case "lastupdated":
                  case "lastupdatedms":
                      left = r.lastUpdatedMs;
                      break;
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : compareNumber(term.op, left, right);
          }
          default:
              return false;
      }
  }
  function matchesRange(term, target) {
      const key = term.key;
      const min = term.min;
      const max = term.max;
      const matchesNumber = (left) => {
          if (min !== undefined && left < min) {
              return false;
          }
          if (max !== undefined && left > max) {
              return false;
          }
          return true;
      };
      const tryLogFacetNumber = () => {
          if (target.kind !== "log") {
              return false;
          }
          const tokens = target.entry.tokens;
          if (!tokens) {
              return false;
          }
          for (const token of tokens) {
              if (token.type === "text") {
                  continue;
              }
              const values = token.facets?.[key];
              if (!values) {
                  continue;
              }
              for (const raw of values) {
                  const left = typeof raw === "number"
                      ? raw
                      : typeof raw === "string"
                          ? Number(raw)
                          : NaN;
                  if (!Number.isFinite(left)) {
                      continue;
                  }
                  if (matchesNumber(left)) {
                      return true;
                  }
              }
          }
          return false;
      };
      switch (target.kind) {
          case "player": {
              const p = target.player;
              let left = null;
              switch (key) {
                  case "id": {
                      const num = Number(p.id);
                      left = Number.isFinite(num) ? num : null;
                      break;
                  }
                  case "tiles":
                      left = p.tiles;
                      break;
                  case "gold":
                      left = p.gold;
                      break;
                  case "troops":
                      left = normalizeTroopCountForSearch(p.troops);
                      break;
                  case "expansions":
                      left = p.expansions;
                      break;
                  case "incoming":
                      left = p.incomingAttacks.length;
                      break;
                  case "outgoing":
                      left = p.outgoingAttacks.length;
                      break;
                  case "supports":
                  case "defensive":
                      left = p.defensiveSupports.length;
                      break;
                  case "alliances":
                      left = p.alliances.length;
                      break;
                  case "updated":
                  case "lastupdated":
                      left = p.lastUpdatedMs;
                      break;
                  case "lobbypos":
                  case "lobbyposition":
                      left = typeof p.lobbyPosition === "number" ? p.lobbyPosition : null;
                      break;
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : matchesNumber(left);
          }
          case "ship": {
              const s = target.ship;
              let left = null;
              switch (key) {
                  case "troops":
                      left = normalizeTroopCountForSearch(s.troops);
                      break;
                  case "id": {
                      const num = Number(s.id);
                      left = Number.isFinite(num) ? num : null;
                      break;
                  }
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : matchesNumber(left);
          }
          case "attack": {
              const a = target.attack;
              let left = null;
              switch (key) {
                  case "troops":
                      left = normalizeTroopCountForSearch(a.troops);
                      break;
                  case "id": {
                      const num = Number(a.id);
                      left = Number.isFinite(num) ? num : null;
                      break;
                  }
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : matchesNumber(left);
          }
          case "log": {
              const e = target.entry;
              let left = null;
              switch (key) {
                  case "timestamp":
                  case "time":
                      left = e.timestampMs;
                      break;
                  default:
                      left = null;
                      break;
              }
              if (left !== null) {
                  return matchesNumber(left);
              }
              return tryLogFacetNumber();
          }
          case "action": {
              const a = target.action;
              let left = null;
              switch (key) {
                  case "interval":
                  case "runinterval":
                  case "runintervalticks":
                      left = a.runIntervalTicks;
                      break;
                  case "created":
                  case "createdat":
                  case "createdatms":
                      left = a.createdAtMs;
                      break;
                  case "updated":
                  case "updatedat":
                  case "updatedatms":
                      left = a.updatedAtMs;
                      break;
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : matchesNumber(left);
          }
          case "runningAction": {
              const r = target.run;
              let left = null;
              switch (key) {
                  case "interval":
                  case "runinterval":
                  case "runintervalticks":
                      left = r.runIntervalTicks;
                      break;
                  case "started":
                  case "startedat":
                  case "startedatms":
                      left = r.startedAtMs;
                      break;
                  case "updated":
                  case "lastupdated":
                  case "lastupdatedms":
                      left = r.lastUpdatedMs;
                      break;
                  default:
                      left = null;
                      break;
              }
              return left === null ? false : matchesNumber(left);
          }
          default:
              return false;
      }
  }

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

  let viewDocument$7 = document;
  function withViewDocument$7(doc, fn) {
      const previous = viewDocument$7;
      viewDocument$7 = doc;
      try {
          return fn();
      }
      finally {
          viewDocument$7 = previous;
      }
  }
  function createElement$7(tag, className, textContent) {
      return createElement$8(tag, className, textContent, viewDocument$7);
  }
  const PLAYER_ALERT_CLASS = "bg-red-500 text-white";
  const PLAYER_COUNT_CLASS = "font-semibold";
  const PLAYER_NUMERIC_CLASS = "font-mono text-[0.75rem]";
  const PLAYER_COLUMN_CONFIG = {
      label: {
          cellClass: "font-semibold",
          aggregateCellClass: "font-semibold",
          getValue: ({ player }) => player.name,
          getAggregateValue: ({ group }) => group.label,
          getSortValue: ({ player }) => player.name.toLowerCase(),
          getAggregateSortValue: ({ group }) => group.label.toLowerCase(),
      },
      tiles: createResourceColumn({
          formatter: formatNumber,
          value: ({ player }) => player.tiles,
          aggregateValue: ({ totals }) => totals.tiles,
      }),
      gold: createResourceColumn({
          formatter: formatNumber,
          value: ({ player }) => player.gold,
          aggregateValue: ({ totals }) => totals.gold,
      }),
      troops: createResourceColumn({
          formatter: formatTroopCount,
          value: ({ player }) => player.troops,
          aggregateValue: ({ totals }) => totals.troops,
      }),
      incoming: createMetricColumn("incoming", { highlightPositive: true }),
      outgoing: createMetricColumn("outgoing"),
      expanding: createMetricColumn("expanding"),
      alliances: createMetricColumn("alliances"),
      disconnected: createMetricColumn("disconnected"),
      traitor: createMetricColumn("traitor"),
      stable: createMetricColumn("stable"),
      waiting: createMetricColumn("waiting"),
      eliminated: createMetricColumn("eliminated"),
  };
  function createResourceColumn(options) {
      return {
          cellClass: PLAYER_NUMERIC_CLASS,
          aggregateCellClass: PLAYER_NUMERIC_CLASS,
          getValue: (context) => options.formatter(options.value(context)),
          getAggregateValue: (context) => options.formatter(options.aggregateValue(context)),
          getSortValue: (context) => options.value(context),
          getAggregateSortValue: (context) => options.aggregateValue(context),
      };
  }
  function createMetricColumn(metric, options) {
      const getHighlightClass = options?.highlightPositive
          ? (value) => (value > 0 ? PLAYER_ALERT_CLASS : undefined)
          : () => undefined;
      return {
          cellClass: PLAYER_COUNT_CLASS,
          aggregateCellClass: PLAYER_COUNT_CLASS,
          getValue: ({ metrics }) => String(metrics[metric]),
          getAggregateValue: ({ metrics }) => String(metrics[metric]),
          getSortValue: ({ metrics }) => metrics[metric],
          getAggregateSortValue: ({ metrics }) => metrics[metric],
          getValueClass: ({ metrics }) => getHighlightClass(metrics[metric]),
          getAggregateValueClass: ({ metrics }) => getHighlightClass(metrics[metric]),
      };
  }
  function getPlayerColumnConfig(key) {
      if (key in PLAYER_COLUMN_CONFIG) {
          return PLAYER_COLUMN_CONFIG[key];
      }
      return undefined;
  }
  const tableContextActions = new WeakMap();
  const playerContextTargets$1 = new WeakMap();
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
  function registerContextMenuDelegation$1(container, actions) {
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
              const target = playerContextTargets$1.get(targetInfo.element);
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
                  document: viewDocument$7,
                  items: [
                      {
                          label: actionLabel,
                          disabled,
                          tooltip,
                          onSelect: disabled
                              ? undefined
                              : () => activeActions.toggleTrading([target.id], nextStopped),
                      },
                      {
                          label: "Copy username",
                          onSelect: () => void copyTextToClipboard(target.name, viewDocument$7),
                      },
                      {
                          label: "Copy player id",
                          onSelect: () => void copyTextToClipboard(target.publicId ?? target.id, viewDocument$7),
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
          const tradingPlayers = target.players.filter((player) => !isTradeStoppedBySelf(player));
          const stoppedPlayers = target.players.filter((player) => isTradeStoppedBySelf(player));
          const items = [];
          if (tradingPlayers.length > 0) {
              const ids = tradingPlayers.map((player) => player.id);
              items.push({
                  label: tradingPlayers.length === target.players.length
                      ? "Stop trading"
                      : `Stop trading (${tradingPlayers.length})`,
                  onSelect: () => activeActions.toggleTrading(ids, true),
              });
          }
          if (stoppedPlayers.length > 0) {
              const ids = stoppedPlayers.map((player) => player.id);
              items.push({
                  label: stoppedPlayers.length === target.players.length
                      ? "Start trading"
                      : `Start trading (${stoppedPlayers.length})`,
                  onSelect: () => activeActions.toggleTrading(ids, false),
              });
          }
          items.push({
              label: "Copy usernames",
              onSelect: () => void copyTextToClipboard(target.players.map((player) => player.name).join("\n"), viewDocument$7),
          });
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
              document: viewDocument$7,
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
      const isLobbyPlayer = Boolean(player.isLobbyPlayer);
      const focusPlayer = () => {
          if (typeof actions.focusPlayer === "function") {
              actions.focusPlayer(player.id);
              return;
          }
          actions.showPlayerDetails(player.id);
          if (player.position) {
              focusTile(player.position);
          }
      };
      const tr = createElement$7("tr", "hover:bg-slate-800/50 transition-colors");
      tr.dataset.rowKey = rowKey;
      applyPersistentHover(tr, leaf, rowKey, "bg-slate-800/50");
      if (!isLobbyPlayer) {
          tr.dataset.contextTarget = "player";
          playerContextTargets$1.set(tr, {
              id: player.id,
              publicId: player.publicId,
              name: player.name,
              tradeStopped: player.tradeStopped ?? false,
              tradeStoppedBySelf: player.tradeStoppedBySelf,
              tradeStoppedByOther: player.tradeStoppedByOther,
              isSelf: player.isSelf ?? false,
          });
      }
      const labelHeader = headers.find((header) => header.key === "label");
      if (labelHeader) {
          const firstCell = createElement$7("td", cellClassForColumn(labelHeader, "align-top"));
          let subtitleClassName;
          const subtitle = (() => {
              if (isLobbyPlayer) {
                  if (player.wasKickedFromLobby) {
                      subtitleClassName =
                          "text-[0.65rem] uppercase tracking-wide text-rose-400";
                      return "KICKED";
                  }
                  const queue = snapshot.currentLobbyQueues?.find((entry) => entry.gameId === player.lobbyGameId) ?? snapshot.currentLobbyQueue;
                  const hasPosition = typeof player.lobbyPosition === "number" &&
                      Number.isFinite(player.lobbyPosition);
                  const positionLabel = hasPosition
                      ? `#${player.lobbyPosition}`
                      : "Queued";
                  const queueLabel = player.lobbyLabel ?? queue?.lobbyLabel;
                  if (!queue) {
                      return queueLabel
                          ? `${queueLabel} • Queue ${positionLabel}`
                          : `Queue ${positionLabel}`;
                  }
                  const totalSlots = queue.maxPlayers ?? queue.playerCount;
                  const hasTotalSlots = typeof totalSlots === "number" &&
                      Number.isFinite(totalSlots) &&
                      totalSlots > 0;
                  let label;
                  if (hasTotalSlots && hasPosition) {
                      label = `Queue ${positionLabel}/${totalSlots}`;
                  }
                  else if (hasTotalSlots) {
                      label = `Queue ${totalSlots} players`;
                  }
                  else {
                      label = `Queue ${positionLabel}`;
                  }
                  if (queueLabel && !options.lobbyLabelHidden) {
                      label = `${queueLabel} • ${label}`;
                  }
                  const playerTeamLabel = getLobbyLocalTeamLabel(player);
                  if (queue.playerTeams && playerTeamLabel) {
                      label = `${label} • ${playerTeamLabel}`;
                  }
                  return label;
              }
              return ([player.clan, player.team].filter(Boolean).join(" • ") || undefined);
          })();
          const focusTarget = isLobbyPlayer ? undefined : player.position;
          firstCell.appendChild(createLabelBlock({
              label: player.name,
              subtitle,
              subtitleClassName,
              indent,
              focus: focusTarget,
              onFocus: isLobbyPlayer ? undefined : focusPlayer,
          }));
          tr.appendChild(firstCell);
      }
      appendMetricCells({
          row: tr,
          metrics,
          player,
          snapshot,
          headers,
      });
      tbody.appendChild(tr);
      if (!isLobbyPlayer) {
          tr.addEventListener("click", () => {
              actions.showPlayerDetails(player.id);
          });
      }
  }
  function appendGroupRows(options) {
      const { group, groupKey, subtitle, leaf, snapshot, tbody, requestRender, metricsCache, actions, headers, visiblePlayers, expandedOverride, disableToggle, indent, childIndent, defaultExpanded, lobbyLabelHidden, renderExpandedContent, } = options;
      const isExpandedByDefault = defaultExpanded ?? false;
      const expanded = expandedOverride ??
          (isExpandedByDefault
              ? !leaf.expandedGroups.has(groupKey)
              : leaf.expandedGroups.has(groupKey));
      const playersToRender = visiblePlayers ?? group.players;
      const row = createElement$7("tr", "bg-slate-900/70 hover:bg-slate-800/60 transition-colors font-semibold");
      row.dataset.groupKey = groupKey;
      applyPersistentHover(row, leaf, groupKey, "bg-slate-800/60");
      const eligiblePlayers = playersToRender.filter((player) => !player.isSelf && !player.isLobbyPlayer);
      if (eligiblePlayers.length > 0) {
          row.dataset.contextTarget = "group";
          groupContextTargets.set(row, {
              label: group.label,
              players: eligiblePlayers,
          });
      }
      const labelHeader = headers.find((header) => header.key === "label");
      if (labelHeader) {
          const firstCell = createElement$7("td", cellClassForColumn(labelHeader, "align-top", {
              variant: "expandable",
          }));
          const countLabel = playersToRender === group.players
              ? `${group.players.length}`
              : `${playersToRender.length}/${group.players.length}`;
          const toggleAttribute = disableToggle ? undefined : "data-group-toggle";
          firstCell.appendChild(createLabelBlock({
              label: `${group.label} (${countLabel})`,
              subtitle,
              indent: indent ?? 0,
              expanded,
              toggleAttribute,
              rowKey: groupKey,
              onToggle: toggleAttribute &&
                  ((next) => {
                      if (isExpandedByDefault) {
                          if (next) {
                              leaf.expandedGroups.delete(groupKey);
                          }
                          else {
                              leaf.expandedGroups.add(groupKey);
                          }
                      }
                      else {
                          if (next) {
                              leaf.expandedGroups.add(groupKey);
                          }
                          else {
                              leaf.expandedGroups.delete(groupKey);
                          }
                      }
                      requestRender();
                  }),
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
      appendAggregateCells({
          row,
          group,
          snapshot,
          headers,
          variant: "expandable",
      });
      tbody.appendChild(row);
      if (expanded) {
          if (renderExpandedContent) {
              renderExpandedContent(playersToRender);
          }
          else {
              for (const player of playersToRender) {
                  appendPlayerRows({
                      player,
                      indent: childIndent ?? 1,
                      leaf,
                      snapshot,
                      tbody,
                      metricsCache,
                      actions,
                      headers,
                      lobbyLabelHidden,
                  });
              }
          }
      }
  }
  function appendMetricCells(options) {
      const { row, metrics, player, snapshot, headers } = options;
      const context = { player, metrics, snapshot };
      for (const column of headers) {
          if (column.key === "label") {
              continue;
          }
          const config = getPlayerColumnConfig(column.key);
          const className = [config?.cellClass, config?.getValueClass?.(context)]
              .filter(Boolean)
              .join(" ");
          const td = createElement$7("td", cellClassForColumn(column, className));
          td.textContent = config?.getValue?.(context) ?? "";
          row.appendChild(td);
      }
  }
  function appendAggregateCells(options) {
      const { row, group, snapshot, headers } = options;
      const variant = options.variant ?? "default";
      const context = {
          group,
          metrics: group.metrics,
          totals: group.totals,
          snapshot,
      };
      for (const column of headers) {
          if (column.key === "label") {
              continue;
          }
          const config = getPlayerColumnConfig(column.key);
          const className = [
              config?.aggregateCellClass,
              config?.getAggregateValueClass?.(context),
          ]
              .filter(Boolean)
              .join(" ");
          const td = createElement$7("td", cellClassForColumn(column, className, { variant }));
          td.textContent = config?.getAggregateValue?.(context) ?? "";
          row.appendChild(td);
      }
  }
  function createLabelBlock(options) {
      const { label, subtitle, subtitleClassName, indent, expanded, toggleAttribute, rowKey, onToggle, focus, onFocus, persistHover, onToggleHoverChange, } = options;
      const container = createElement$7("div", "flex items-start gap-3");
      container.style.marginLeft = `${indent * 1.5}rem`;
      const labelBlock = createElement$7("div", "space-y-1");
      const labelEl = createPlayerNameElement(label, focus, {
          asBlock: true,
          className: "block font-semibold text-slate-100 transition-colors hover:text-sky-200",
          document: viewDocument$7,
          onActivate: onFocus,
      });
      labelBlock.appendChild(labelEl);
      if (subtitle) {
          const defaultSubtitleClass = "text-[0.65rem] uppercase tracking-wide text-slate-400";
          labelBlock.appendChild(createElement$7("div", subtitleClassName ?? defaultSubtitleClass, subtitle));
      }
      if (toggleAttribute && rowKey && typeof expanded === "boolean" && onToggle) {
          const button = createElement$7("button", "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/60 transition-colors");
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
      const column = getPlayerColumnConfig(sortState.key);
      const contextA = {
          player: a,
          metrics: metricsA,
          snapshot,
      };
      const contextB = {
          player: b,
          metrics: metricsB,
          snapshot,
      };
      const valueA = column?.getSortValue?.(contextA) ??
          getDefaultPlayerSortValue(sortState.key, contextA);
      const valueB = column?.getSortValue?.(contextB) ??
          getDefaultPlayerSortValue(sortState.key, contextB);
      const result = compareSortValues(valueA, valueB, sortState.direction);
      if (result !== 0) {
          return result;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  }
  function compareAggregated(options) {
      const { a, b, sortState, snapshot } = options;
      const column = getPlayerColumnConfig(sortState.key);
      const contextA = {
          group: a,
          metrics: a.metrics,
          totals: a.totals,
          snapshot,
      };
      const contextB = {
          group: b,
          metrics: b.metrics,
          totals: b.totals,
          snapshot,
      };
      const valueA = column?.getAggregateSortValue?.(contextA) ??
          getDefaultAggregateSortValue(sortState.key, contextA);
      const valueB = column?.getAggregateSortValue?.(contextB) ??
          getDefaultAggregateSortValue(sortState.key, contextB);
      const result = compareSortValues(valueA, valueB, sortState.direction);
      if (result !== 0) {
          return result;
      }
      return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
  }
  function getDefaultPlayerSortValue(key, context) {
      const { player, metrics } = context;
      switch (key) {
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
              return player.name.toLowerCase();
      }
  }
  function getDefaultAggregateSortValue(key, context) {
      const { group, metrics, totals } = context;
      switch (key) {
          case "tiles":
              return totals.tiles;
          case "gold":
              return totals.gold;
          case "troops":
              return totals.troops;
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
          case "label":
              return group.label.toLowerCase();
          default:
              return group.label.toLowerCase();
      }
  }
  function groupPlayers(options) {
      const { players, snapshot, metricsCache, getKey, getLabel, sortState } = options;
      const map = new Map();
      for (const player of players) {
          const key = getKey(player) ?? "Unaffiliated";
          if (!map.has(key)) {
              map.set(key, {
                  key,
                  label: getLabel?.(player, key) ?? key,
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
          row.players.sort((a, b) => comparePlayers({
              a,
              b,
              sortState,
              snapshot,
              metricsCache,
          }));
      }
      rows.sort((a, b) => compareAggregated({ a, b, sortState, snapshot }));
      return rows;
  }
  function getLobbyLocalTeamLabel(player) {
      if (!player.isLobbyPlayer) {
          return player.team;
      }
      const team = player.team?.trim();
      if (!team) {
          return undefined;
      }
      const lobbyLabel = player.lobbyLabel?.trim();
      if (!lobbyLabel) {
          return team;
      }
      if (team === lobbyLabel) {
          return undefined;
      }
      const prefix = `${lobbyLabel} • `;
      return team.startsWith(prefix) ? team.slice(prefix.length) : team;
  }
  function isMultiLobbySnapshot(snapshot) {
      return (!snapshot.players.some((player) => !player.isLobbyPlayer) &&
          (snapshot.currentLobbyQueues?.length ?? 0) > 1);
  }
  function buildLobbyGroups(options) {
      const { snapshot, players, metricsCache, sortState } = options;
      const grouped = groupPlayers({
          players,
          snapshot,
          metricsCache,
          getKey: (player) => player.lobbyGameId ?? player.lobbyLabel ?? "Lobby",
          getLabel: (player) => player.lobbyLabel ?? player.lobbyGameId ?? "Lobby",
          sortState,
      });
      const groupedByKey = new Map(grouped.map((group) => [group.key, group]));
      const ordered = [];
      for (const queue of snapshot.currentLobbyQueues ?? []) {
          const key = queue.gameId;
          const group = groupedByKey.get(key);
          if (!group) {
              continue;
          }
          ordered.push({
              ...group,
              queueLabel: queue.lobbyLabel,
          });
          groupedByKey.delete(key);
      }
      for (const group of groupedByKey.values()) {
          ordered.push({
              ...group,
              queueLabel: group.label,
          });
      }
      return ordered;
  }
  function createPlayerMatcher(searchFilter, extraFields) {
      const filter = (searchFilter ?? "").trim().toLowerCase();
      const compiled = filter ? compileSearchQuery(filter) : null;
      const hasStructuredQuery = !!compiled && compiled.ok;
      const matcher = ((player) => {
          if (!filter) {
              return true;
          }
          if (hasStructuredQuery) {
              return matchesSearchQuery(compiled.ast, { kind: "player", player });
          }
          const clan = extractClanTag(player.name);
          const fields = [
              player.name,
              player.id,
              player.team ?? "",
              clan ?? "",
              ...(extraFields?.(player) ?? []),
          ];
          return fields.some((field) => String(field ?? "")
              .toLowerCase()
              .includes(filter));
      });
      matcher.filter = filter;
      return matcher;
  }
  function appendLobbyGroupedView(options) {
      const { lobbyGroups, leaf, snapshot, tbody, requestRender, metricsCache, actions, headers, filter, renderLobbyContent, } = options;
      for (const lobbyGroup of lobbyGroups) {
          const groupLabelMatches = filter
              ? lobbyGroup.label.toLowerCase().includes(filter)
              : false;
          const matchedPlayers = filter
              ? lobbyGroup.players.filter(createPlayerMatcher(filter, (player) => [
                  player.lobbyLabel ?? "",
                  getLobbyLocalTeamLabel(player) ?? "",
              ]))
              : lobbyGroup.players;
          const playersToRender = groupLabelMatches
              ? lobbyGroup.players
              : matchedPlayers;
          if (filter && playersToRender.length === 0) {
              continue;
          }
          appendGroupRows({
              group: lobbyGroup,
              groupKey: `lobby:${lobbyGroup.key}`,
              subtitle: "Lobby queue",
              leaf,
              snapshot,
              tbody,
              requestRender,
              metricsCache,
              actions,
              headers,
              visiblePlayers: playersToRender,
              expandedOverride: filter ? true : undefined,
              defaultExpanded: true,
              indent: 0,
              childIndent: 1,
              disableToggle: Boolean(filter),
              lobbyLabelHidden: true,
              renderExpandedContent: (visibleLobbyPlayers) => {
                  renderLobbyContent(lobbyGroup, visibleLobbyPlayers);
              },
          });
      }
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
  function renderPlayersView(options) {
      return withViewDocument$7(options.ui.document, () => {
          const { leaf, snapshot, sortState, onSort, existingContainer, actions, requestRender, searchFilter, } = options;
          const metricsCache = new Map();
          const visibleHeaders = getVisibleHeaders(leaf, leaf.view, TABLE_HEADERS);
          const { container, tbody } = createTableShell({
              sortState,
              onSort,
              existingContainer,
              view: leaf.view,
              headers: visibleHeaders,
              document: viewDocument$7,
          });
          const players = [...snapshot.players].sort((a, b) => comparePlayers({ a, b, sortState, snapshot, metricsCache }));
          const matchesPlayer = createPlayerMatcher(searchFilter, (player) => [
              player.lobbyLabel ?? "",
              getLobbyLocalTeamLabel(player) ?? "",
          ]);
          if (isMultiLobbySnapshot(snapshot)) {
              const lobbyGroups = buildLobbyGroups({
                  snapshot,
                  players,
                  metricsCache,
                  sortState,
              });
              appendLobbyGroupedView({
                  lobbyGroups,
                  leaf,
                  snapshot,
                  tbody,
                  requestRender,
                  metricsCache,
                  actions,
                  headers: visibleHeaders,
                  filter: matchesPlayer.filter,
                  renderLobbyContent: (_lobbyGroup, lobbyPlayers) => {
                      for (const player of lobbyPlayers) {
                          appendPlayerRows({
                              player,
                              indent: 1,
                              leaf,
                              snapshot,
                              tbody,
                              metricsCache,
                              actions,
                              headers: visibleHeaders,
                              lobbyLabelHidden: true,
                          });
                      }
                  },
              });
          }
          else {
              for (const player of players) {
                  if (matchesPlayer.filter && !matchesPlayer(player)) {
                      continue;
                  }
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
          }
          registerContextMenuDelegation$1(container, actions);
          return container;
      });
  }
  function renderClanView(options) {
      return withViewDocument$7(options.ui.document, () => {
          const { leaf, snapshot, requestRender, sortState, onSort, existingContainer, actions, searchFilter, } = options;
          const metricsCache = new Map();
          const visibleHeaders = getVisibleHeaders(leaf, leaf.view, TABLE_HEADERS);
          const { container, tbody } = createTableShell({
              sortState,
              onSort,
              existingContainer,
              view: leaf.view,
              headers: visibleHeaders,
              document: viewDocument$7,
          });
          const matchesPlayer = createPlayerMatcher(searchFilter, (player) => [
              player.lobbyLabel ?? "",
              getLobbyLocalTeamLabel(player) ?? "",
          ]);
          if (isMultiLobbySnapshot(snapshot)) {
              const sortedPlayers = [...snapshot.players].sort((a, b) => comparePlayers({ a, b, sortState, snapshot, metricsCache }));
              const lobbyGroups = buildLobbyGroups({
                  snapshot,
                  players: sortedPlayers,
                  metricsCache,
                  sortState,
              });
              appendLobbyGroupedView({
                  lobbyGroups,
                  leaf,
                  snapshot,
                  tbody,
                  requestRender,
                  metricsCache,
                  actions,
                  headers: visibleHeaders,
                  filter: matchesPlayer.filter,
                  renderLobbyContent: (lobbyGroup, lobbyPlayers) => {
                      const groups = groupPlayers({
                          players: lobbyPlayers,
                          snapshot,
                          metricsCache,
                          getKey: (player) => extractClanTag(player.name),
                          sortState,
                      });
                      for (const group of groups) {
                          const groupLabelMatches = matchesPlayer.filter
                              ? group.label.toLowerCase().includes(matchesPlayer.filter)
                              : false;
                          const matchedPlayers = matchesPlayer.filter
                              ? group.players.filter(matchesPlayer)
                              : group.players;
                          const playersToRender = groupLabelMatches
                              ? group.players
                              : matchedPlayers;
                          if (matchesPlayer.filter && playersToRender.length === 0) {
                              continue;
                          }
                          appendGroupRows({
                              group,
                              groupKey: `lobby:${lobbyGroup.key}:clan:${group.key}`,
                              subtitle: "Clan summary",
                              leaf,
                              snapshot,
                              tbody,
                              requestRender,
                              metricsCache,
                              actions,
                              headers: visibleHeaders,
                              visiblePlayers: playersToRender,
                              expandedOverride: matchesPlayer.filter ? true : undefined,
                              indent: 1,
                              childIndent: 2,
                              disableToggle: Boolean(matchesPlayer.filter),
                              lobbyLabelHidden: true,
                          });
                      }
                  },
              });
          }
          else {
              const groups = groupPlayers({
                  players: snapshot.players,
                  snapshot,
                  metricsCache,
                  getKey: (player) => extractClanTag(player.name),
                  sortState,
              });
              for (const group of groups) {
                  const groupLabelMatches = matchesPlayer.filter
                      ? group.label.toLowerCase().includes(matchesPlayer.filter)
                      : false;
                  const matchedPlayers = matchesPlayer.filter
                      ? group.players.filter(matchesPlayer)
                      : group.players;
                  const playersToRender = groupLabelMatches
                      ? group.players
                      : matchedPlayers;
                  if (matchesPlayer.filter && playersToRender.length === 0) {
                      continue;
                  }
                  appendGroupRows({
                      group,
                      groupKey: `clan:${group.key}`,
                      subtitle: "Clan summary",
                      leaf,
                      snapshot,
                      tbody,
                      requestRender,
                      metricsCache,
                      actions,
                      headers: visibleHeaders,
                      visiblePlayers: playersToRender,
                      expandedOverride: matchesPlayer.filter ? true : undefined,
                      disableToggle: Boolean(matchesPlayer.filter),
                  });
              }
          }
          registerContextMenuDelegation$1(container, actions);
          return container;
      });
  }
  function renderTeamView(options) {
      return withViewDocument$7(options.ui.document, () => {
          const { leaf, snapshot, requestRender, sortState, onSort, existingContainer, actions, searchFilter, } = options;
          const metricsCache = new Map();
          const visibleHeaders = getVisibleHeaders(leaf, leaf.view, TABLE_HEADERS);
          const { container, tbody } = createTableShell({
              sortState,
              onSort,
              existingContainer,
              view: leaf.view,
              headers: visibleHeaders,
              document: viewDocument$7,
          });
          const matchesPlayer = createPlayerMatcher(searchFilter, (player) => [
              player.lobbyLabel ?? "",
              getLobbyLocalTeamLabel(player) ?? "",
          ]);
          if (isMultiLobbySnapshot(snapshot)) {
              const sortedPlayers = [...snapshot.players].sort((a, b) => comparePlayers({ a, b, sortState, snapshot, metricsCache }));
              const lobbyGroups = buildLobbyGroups({
                  snapshot,
                  players: sortedPlayers,
                  metricsCache,
                  sortState,
              });
              appendLobbyGroupedView({
                  lobbyGroups,
                  leaf,
                  snapshot,
                  tbody,
                  requestRender,
                  metricsCache,
                  actions,
                  headers: visibleHeaders,
                  filter: matchesPlayer.filter,
                  renderLobbyContent: (lobbyGroup, lobbyPlayers) => {
                      const groups = groupPlayers({
                          players: lobbyPlayers,
                          snapshot,
                          metricsCache,
                          getKey: (player) => getLobbyLocalTeamLabel(player) ?? "Solo",
                          getLabel: (player) => getLobbyLocalTeamLabel(player) ?? "Solo",
                          sortState,
                      });
                      for (const group of groups) {
                          const groupLabelMatches = matchesPlayer.filter
                              ? group.label.toLowerCase().includes(matchesPlayer.filter)
                              : false;
                          const matchedPlayers = matchesPlayer.filter
                              ? group.players.filter(matchesPlayer)
                              : group.players;
                          const playersToRender = groupLabelMatches
                              ? group.players
                              : matchedPlayers;
                          if (matchesPlayer.filter && playersToRender.length === 0) {
                              continue;
                          }
                          appendGroupRows({
                              group,
                              groupKey: `lobby:${lobbyGroup.key}:team:${group.key}`,
                              subtitle: "Team summary",
                              leaf,
                              snapshot,
                              tbody,
                              requestRender,
                              metricsCache,
                              actions,
                              headers: visibleHeaders,
                              visiblePlayers: playersToRender,
                              expandedOverride: matchesPlayer.filter ? true : undefined,
                              indent: 1,
                              childIndent: 2,
                              disableToggle: Boolean(matchesPlayer.filter),
                              lobbyLabelHidden: true,
                          });
                      }
                  },
              });
          }
          else {
              const groups = groupPlayers({
                  players: snapshot.players,
                  snapshot,
                  metricsCache,
                  getKey: (player) => player.team ?? "Solo",
                  getLabel: (player) => player.team ?? "Solo",
                  sortState,
              });
              for (const group of groups) {
                  const groupLabelMatches = matchesPlayer.filter
                      ? group.label.toLowerCase().includes(matchesPlayer.filter)
                      : false;
                  const matchedPlayers = matchesPlayer.filter
                      ? group.players.filter(matchesPlayer)
                      : group.players;
                  const playersToRender = groupLabelMatches
                      ? group.players
                      : matchedPlayers;
                  if (matchesPlayer.filter && playersToRender.length === 0) {
                      continue;
                  }
                  appendGroupRows({
                      group,
                      groupKey: `team:${group.key}`,
                      subtitle: "Team summary",
                      leaf,
                      snapshot,
                      tbody,
                      requestRender,
                      metricsCache,
                      actions,
                      headers: visibleHeaders,
                      visiblePlayers: playersToRender,
                      expandedOverride: matchesPlayer.filter ? true : undefined,
                      disableToggle: Boolean(matchesPlayer.filter),
                  });
              }
          }
          registerContextMenuDelegation$1(container, actions);
          return container;
      });
  }

  let viewDocument$6 = document;
  function withViewDocument$6(doc, fn) {
      const previous = viewDocument$6;
      viewDocument$6 = doc;
      try {
          return fn();
      }
      finally {
          viewDocument$6 = previous;
      }
  }
  function createElement$6(tag, className, textContent) {
      return createElement$8(tag, className, textContent, viewDocument$6);
  }
  const playerContextTargets = new WeakMap();
  function normalizePlayerLabel(label) {
      return (label
          .trim()
          // Strip leading clan tags like "[NU] Alice"
          .replace(/^\[[^\]]+\]\s*/g, "")
          .replace(/\s+/g, " ")
          .toLowerCase());
  }
  function registerContextMenuDelegation(container, actions) {
      if (container.dataset.contextMenuDelegated === "true") {
          return;
      }
      const handleContextMenu = (event) => {
          const targetElement = event.target instanceof HTMLElement ? event.target : null;
          if (!targetElement) {
              return;
          }
          const menuTarget = targetElement.closest('[data-context-target="player"]');
          if (!menuTarget) {
              return;
          }
          const target = playerContextTargets.get(menuTarget);
          if (!target) {
              return;
          }
          event.preventDefault();
          event.stopPropagation();
          if (!target.id) {
              showContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  title: target.name,
                  document: viewDocument$6,
                  items: [
                      {
                          label: "Copy username",
                          onSelect: () => void copyTextToClipboard(target.name, viewDocument$6),
                      },
                  ],
              });
              return;
          }
          const disabled = target.isSelf;
          const stoppedBySelf = isTradeStoppedBySelf(target);
          const stoppedByOther = isTradeStoppedByOther(target);
          const nextStopped = !stoppedBySelf;
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
              document: viewDocument$6,
              items: [
                  {
                      label: actionLabel,
                      disabled,
                      tooltip,
                      onSelect: disabled
                          ? undefined
                          : () => actions.toggleTrading([target.id], nextStopped),
                  },
                  {
                      label: "Copy username",
                      onSelect: () => void copyTextToClipboard(target.name, viewDocument$6),
                  },
                  {
                      label: "Copy player id",
                      onSelect: () => void copyTextToClipboard(target.publicId ?? target.id, viewDocument$6),
                  },
              ],
          });
      };
      container.addEventListener("contextmenu", handleContextMenu);
      container.dataset.contextMenuDelegated = "true";
  }
  function renderAttacksView(options) {
      return withViewDocument$6(options.ui.document, () => {
          const { leaf, snapshot, sortState, onSort, existingContainer, actions } = options;
          const visibleHeaders = getVisibleHeaders(leaf, leaf.view, ATTACK_HEADERS);
          const { container, tbody } = createTableShell({
              sortState,
              onSort,
              existingContainer,
              view: leaf.view,
              headers: visibleHeaders,
              document: viewDocument$6,
          });
          registerContextMenuDelegation(container, actions);
          const playerByName = buildPlayerNameIndex(snapshot.players);
          const attacks = collectAttacks(snapshot.players).sort((a, b) => compareAttacks({ a, b, sortState }));
          for (const attack of attacks) {
              const rowKey = `attack:${attack.id}`;
              const row = createElement$6("tr", "hover:bg-slate-800/50 transition-colors");
              applyPersistentHover(row, leaf, rowKey, "bg-slate-800/50");
              row.dataset.rowKey = rowKey;
              for (const column of visibleHeaders) {
                  const td = createElement$6("td", cellClassForColumn(column, getAttackExtraCellClass(column.key)));
                  if (column.key === "label" || column.key === "owner") {
                      const name = column.key === "label" ? attack.attacker : attack.target;
                      const player = playerByName.get(normalizePlayerLabel(name)) ??
                          playerByName.get(name.toLowerCase());
                      const button = createPlayerNameElement(name, player?.position, {
                          className: "inline-flex max-w-full items-center gap-1 text-left text-slate-200 hover:text-sky-200",
                          document: viewDocument$6,
                      });
                      button.dataset.contextTarget = "player";
                      td.dataset.contextTarget = "player";
                      if (player) {
                          const contextTarget = {
                              id: player.id,
                              publicId: player.publicId,
                              name: player.name,
                              tradeStopped: player.tradeStopped ?? false,
                              tradeStoppedBySelf: player.tradeStoppedBySelf,
                              tradeStoppedByOther: player.tradeStoppedByOther,
                              isSelf: player.isSelf ?? false,
                          };
                          playerContextTargets.set(button, contextTarget);
                          playerContextTargets.set(td, contextTarget);
                      }
                      else {
                          const contextTarget = {
                              id: "",
                              name,
                              tradeStopped: false,
                              isSelf: false,
                          };
                          playerContextTargets.set(button, contextTarget);
                          playerContextTargets.set(td, contextTarget);
                      }
                      td.appendChild(button);
                  }
                  else {
                      td.textContent = getAttackCellValue(column.key, attack);
                  }
                  row.appendChild(td);
              }
              tbody.appendChild(row);
          }
          if (attacks.length === 0) {
              const row = createElement$6("tr", "text-slate-400");
              const td = createElement$6("td", "border-b border-slate-900/80 px-3 py-4 text-center", "No active attacks.");
              td.colSpan = visibleHeaders.length;
              row.appendChild(td);
              tbody.appendChild(row);
          }
          return container;
      });
  }
  function collectAttacks(players) {
      const byId = new Map();
      for (const player of players) {
          for (const attack of player.outgoingAttacks) {
              if (byId.has(attack.id)) {
                  continue;
              }
              byId.set(attack.id, {
                  id: attack.id,
                  attacker: player.name,
                  target: attack.target,
                  troops: attack.troops,
              });
          }
      }
      return Array.from(byId.values());
  }
  function buildPlayerNameIndex(players) {
      const map = new Map();
      for (const player of players) {
          const key = normalizePlayerLabel(player.name);
          if (!map.has(key)) {
              map.set(key, player);
          }
          const raw = player.name.toLowerCase();
          if (!map.has(raw)) {
              map.set(raw, player);
          }
      }
      return map;
  }
  function getAttackExtraCellClass(key) {
      switch (key) {
          case "label":
              return "font-semibold text-slate-100";
          case "owner":
              return "text-slate-200";
          case "troops":
              return "font-mono text-[0.75rem] text-slate-200";
          default:
              return "text-slate-300";
      }
  }
  function getAttackCellValue(key, attack) {
      switch (key) {
          case "label":
              return attack.attacker;
          case "owner":
              return attack.target;
          case "troops":
              return formatTroopCount(attack.troops);
          default:
              return "";
      }
  }
  function compareAttacks(options) {
      const { a, b, sortState } = options;
      const valueA = getAttackSortValue(a, sortState.key);
      const valueB = getAttackSortValue(b, sortState.key);
      const result = compareSortValues(valueA, valueB, sortState.direction);
      if (result !== 0) {
          return result;
      }
      const attackerCompare = a.attacker.localeCompare(b.attacker, undefined, {
          sensitivity: "base",
      });
      if (attackerCompare !== 0) {
          return attackerCompare;
      }
      return a.id.localeCompare(b.id, undefined, { sensitivity: "base" });
  }
  function getAttackSortValue(entry, key) {
      switch (key) {
          case "label":
              return entry.attacker.toLowerCase();
          case "owner":
              return entry.target.toLowerCase();
          case "troops":
              return entry.troops;
          default:
              return 0;
      }
  }

  let viewDocument$5 = document;
  function withViewDocument$5(doc, fn) {
      const previous = viewDocument$5;
      viewDocument$5 = doc;
      try {
          return fn();
      }
      finally {
          viewDocument$5 = previous;
      }
  }
  function createElement$5(tag, className, textContent) {
      return createElement$8(tag, className, textContent, viewDocument$5);
  }
  function renderShipView(options) {
      return withViewDocument$5(options.ui.document, () => {
          const { leaf, snapshot, sortState, onSort, existingContainer } = options;
          const visibleHeaders = getVisibleHeaders(leaf, leaf.view, SHIP_HEADERS);
          const { container, tbody } = createTableShell({
              sortState,
              onSort,
              existingContainer,
              view: leaf.view,
              headers: visibleHeaders,
              document: viewDocument$5,
          });
          const playerLookup = new Map(snapshot.players.map((player) => [player.id, player]));
          const ships = [...snapshot.ships].sort((a, b) => compareShips({ a, b, sortState }));
          for (const ship of ships) {
              const rowKey = `ship:${ship.id}`;
              const row = createElement$5("tr", "hover:bg-slate-800/50 transition-colors");
              applyPersistentHover(row, leaf, rowKey, "bg-slate-800/50");
              row.dataset.rowKey = rowKey;
              for (const column of visibleHeaders) {
                  const td = createElement$5("td", cellClassForColumn(column, getShipExtraCellClass(column.key)));
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
                              document: viewDocument$5,
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
      });
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
  function createCoordinateButton(summary) {
      if (!summary) {
          return createElement$5("span", "text-slate-500", "–");
      }
      const label = formatTileSummary(summary);
      const button = createElement$5("button", "inline-flex max-w-full items-center rounded-sm px-0 text-left text-sky-300 transition-colors hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60", label);
      button.type = "button";
      button.title = `Focus on ${label}`;
      attachImmediateTileFocus(button, () => {
          focusTile(summary);
      });
      return button;
  }

  let viewDocument$4 = document;
  function withViewDocument$4(doc, fn) {
      const previous = viewDocument$4;
      viewDocument$4 = doc;
      try {
          return fn();
      }
      finally {
          viewDocument$4 = previous;
      }
  }
  function createElement$4(tag, className, textContent) {
      return createElement$8(tag, className, textContent, viewDocument$4);
  }
  function renderPlayerPanelView(options) {
      return withViewDocument$4(options.ui.document, () => {
          const { leaf, snapshot, existingContainer, actions } = options;
          const containerClass = "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
          const canReuse = !!existingContainer &&
              existingContainer.dataset.sidebarRole === SidebarRole.PlayerPanel &&
              existingContainer.dataset.sidebarView === leaf.view;
          const container = canReuse
              ? existingContainer
              : createElement$4("div", containerClass);
          container.className = containerClass;
          container.dataset.sidebarRole = SidebarRole.PlayerPanel;
          container.dataset.sidebarView = leaf.view;
          const content = createElement$4("div", "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100");
          const playerId = leaf.selectedPlayerId;
          if (!playerId) {
              content.appendChild(createElement$4("p", "text-slate-400 italic", "Select a player from any table to view their details."));
          }
          else {
              const player = snapshot.players.find((entry) => entry.id === playerId);
              if (!player) {
                  content.appendChild(createElement$4("p", "text-slate-400 italic", "That player is no longer available in the latest snapshot."));
              }
              else {
                  const header = createElement$4("div", "space-y-3");
                  const title = createElement$4("div", "flex flex-wrap items-baseline justify-between gap-3");
                  const focusPlayer = actions.focusPlayer;
                  const name = createPlayerNameElement(player.name, player.position, {
                      asBlock: true,
                      className: "text-lg font-semibold text-slate-100 transition-colors hover:text-sky-200",
                      document: viewDocument$4,
                      onActivate: typeof focusPlayer === "function"
                          ? () => focusPlayer(player.id)
                          : player.position
                              ? () => {
                                  focusTile(player.position);
                              }
                              : undefined,
                  });
                  title.appendChild(name);
                  const meta = [player.clan, player.team].filter(Boolean).join(" • ");
                  if (meta) {
                      title.appendChild(createElement$4("div", "text-xs uppercase tracking-wide text-slate-400", meta));
                  }
                  header.appendChild(title);
                  const summary = createElement$4("div", "grid gap-3 sm:grid-cols-3 text-[0.75rem]");
                  summary.appendChild(createSummaryStat$1("Tiles", formatNumber(player.tiles)));
                  summary.appendChild(createSummaryStat$1("Gold", formatNumber(player.gold)));
                  summary.appendChild(createSummaryStat$1("Troops", formatTroopCount(player.troops)));
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
                      header.appendChild(createElement$4("p", "text-[0.7rem] font-semibold uppercase tracking-wide text-amber-300", tradeMessage));
                  }
                  content.appendChild(header);
                  content.appendChild(renderPlayerDetails(player, snapshot));
              }
          }
          container.replaceChildren(content);
          return container;
      });
  }
  function renderPlayerDetails(player, snapshot) {
      const wrapper = createElement$4("div", "space-y-4 text-[0.75rem] text-slate-100");
      const metrics = computePlayerMetrics(player, snapshot);
      const badgeRow = createElement$4("div", "flex flex-wrap gap-2");
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
      const grid = createElement$4("div", "grid gap-4 md:grid-cols-2");
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
      const section = createElement$4("section", "space-y-2");
      const heading = createElement$4("h4", "font-semibold uppercase text-slate-300 tracking-wide text-[0.7rem]", title);
      section.appendChild(heading);
      if (!entries.length) {
          section.appendChild(createElement$4("p", "text-slate-500 italic", "No records."));
          return section;
      }
      const list = createElement$4("ul", "space-y-2");
      for (const entry of entries) {
          const item = createElement$4("li", "rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2");
          item.appendChild(createElement$4("div", "font-medium text-slate-200", toLabel(entry)));
          list.appendChild(item);
      }
      section.appendChild(list);
      return section;
  }
  function createBadge(label, value, highlight = value > 0) {
      const badge = createElement$4("span", `inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-semibold ${highlight
        ? "bg-sky-500/20 text-sky-200 border border-sky-500/40"
        : "bg-slate-800/80 text-slate-300"}`);
      const [emoji, ...rest] = label.split(" ");
      const emojiSpan = createElement$4("span", "text-base");
      emojiSpan.textContent = emoji;
      badge.appendChild(emojiSpan);
      badge.appendChild(createElement$4("span", "", rest.join(" ")));
      badge.appendChild(createElement$4("span", "font-mono text-[0.7rem]", String(value)));
      return badge;
  }
  function createSummaryStat$1(label, value) {
      const wrapper = createElement$4("div", "rounded-md border border-slate-800/70 bg-slate-900/70 px-3 py-2");
      const title = createElement$4("div", "text-[0.65rem] uppercase tracking-wide text-slate-400", label);
      const content = createElement$4("div", "font-mono text-base text-slate-100", value);
      wrapper.appendChild(title);
      wrapper.appendChild(content);
      return wrapper;
  }

  const EMPTY_ACTIONS_STATE = {
      revision: 0,
      runningRevision: 0,
      actions: [],
      running: [],
  };
  function getActionsState(snapshot) {
      return snapshot.sidebarActions ?? EMPTY_ACTIONS_STATE;
  }

  let viewDocument$3 = document;
  function withViewDocument$3(doc, fn) {
      const previous = viewDocument$3;
      viewDocument$3 = doc;
      try {
          return fn();
      }
      finally {
          viewDocument$3 = previous;
      }
  }
  function createElement$3(tag, className, textContent) {
      return createElement$8(tag, className, textContent, viewDocument$3);
  }
  let editorSettingIdCounter = 0;
  function nextEditorSettingId() {
      editorSettingIdCounter += 1;
      return `editor-setting-${editorSettingIdCounter}`;
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
  function renderActionsDirectoryView(options) {
      return withViewDocument$3(options.ui.document, () => {
          const { leaf, snapshot, existingContainer, actions, sortState, onSort } = options;
          const state = getActionsState(snapshot);
          const runningSignature = state.running.length === 0
              ? "none"
              : state.running
                  .map((run) => [run.id, run.actionId, run.status, run.lastUpdatedMs ?? "0"].join(":"))
                  .sort()
                  .join("|");
          const signature = `${state.revision}:${state.runningRevision}:${state.selectedActionId ?? ""}:${runningSignature}`;
          const sortSignature = `${sortState.key}:${sortState.direction}`;
          const isDirectoryContainer = !!existingContainer &&
              existingContainer.dataset.sidebarRole === SidebarRole.ActionsDirectory;
          const visibleHeaders = getVisibleHeaders(leaf, leaf.view, ACTIONS_TABLE_HEADERS);
          const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
          if (isDirectoryContainer &&
              existingContainer.dataset.signature === signature &&
              existingContainer.dataset.sortState === sortSignature &&
              existingContainer.dataset.columnVisibilitySignature ===
                  visibilitySignature) {
              existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
              return existingContainer;
          }
          const { container, tbody } = createTableShell({
              sortState,
              onSort,
              existingContainer: isDirectoryContainer ? existingContainer : undefined,
              view: leaf.view,
              headers: visibleHeaders,
              role: SidebarRole.ActionsDirectory,
              document: viewDocument$3,
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
              const row = createElement$3("tr", "hover:bg-transparent");
              const cell = createElement$3("td", `${cellBaseClass} text-center text-slate-400`, "No actions yet. Create a new action to get started.");
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
                  const row = createElement$3("tr", "cursor-pointer transition-colors hover:bg-slate-800/40");
                  applyRowSelectionIndicator(row, isSelected);
                  row.dataset.actionId = action.id;
                  row.addEventListener("click", () => {
                      actions.selectAction?.(action.id);
                  });
                  const nameCell = createElement$3("td", `${cellBaseClass} text-left`);
                  const nameLine = createElement$3("div", "flex flex-wrap items-center gap-2");
                  const nameLabel = createPlayerNameElement(action.name, undefined, {
                      className: "font-semibold text-slate-100 transition-colors hover:text-sky-200",
                      document: viewDocument$3,
                  });
                  nameLine.appendChild(nameLabel);
                  nameCell.appendChild(nameLine);
                  const statusCell = createElement$3("td", `${cellBaseClass} text-left`);
                  const statusBadges = createElement$3("div", "flex flex-wrap items-center gap-2");
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
                  const toggleCell = createElement$3("td", `${cellBaseClass} text-center`);
                  const toggleWrapper = createElement$3("div", "flex justify-center");
                  const toggleButton = createElement$3("button", "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60");
                  toggleButton.type = "button";
                  toggleButton.setAttribute("role", "switch");
                  const srToggleLabel = createElement$3("span", "sr-only", "Toggle action");
                  const toggleKnob = createElement$3("span", "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out");
                  toggleButton.appendChild(srToggleLabel);
                  toggleButton.appendChild(toggleKnob);
                  const runButton = createElement$3("button", "rounded-md border border-sky-500/50 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/20", "Run");
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
                  const editButton = createElement$3("button", "rounded-md border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-sky-200", "Edit");
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
                  const controlsCell = createElement$3("td", `${cellBaseClass} text-right`);
                  const controls = createElement$3("div", "flex justify-end gap-2");
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
      });
  }
  function renderActionEditorView(options) {
      return withViewDocument$3(options.ui.document, () => {
          const { leaf, snapshot, existingContainer, actions } = options;
          const state = getActionsState(snapshot);
          const selectedAction = state.actions.find((action) => action.id === state.selectedActionId);
          const signature = selectedAction
              ? `${state.revision}:${selectedAction.id}:${selectedAction.updatedAtMs}`
              : `${state.revision}:none`;
          const prior = existingContainer;
          const isEditorContainer = !!prior && prior.dataset.sidebarRole === SidebarRole.ActionEditor;
          const container = isEditorContainer
              ? prior
              : createElement$3("div", "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm");
          container.className =
              "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
          container.dataset.sidebarRole = SidebarRole.ActionEditor;
          container.dataset.sidebarView = leaf.view;
          if (container.dataset.signature === signature) {
              return container;
          }
          container.dataset.signature = signature;
          container.formState = undefined;
          if (!selectedAction) {
              container.replaceChildren(createElement$3("div", "flex h-full items-center justify-center p-6 text-center text-sm text-slate-400", state.actions.length === 0
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
          const layout = createElement$3("div", "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100");
          const header = createElement$3("div", "flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-3");
          const initialTitle = formState.name.trim();
          const titlePreview = createElement$3("div", "text-lg font-semibold text-slate-100", initialTitle === "" ? "Untitled action" : formState.name);
          const descriptionPreview = createElement$3("div", "text-sm text-slate-400", formState.description.trim() === ""
              ? "Add a description..."
              : formState.description);
          if (formState.description.trim() === "") {
              descriptionPreview.classList.add("italic", "text-slate-500");
          }
          const headerText = createElement$3("div", "flex flex-col gap-1");
          headerText.appendChild(titlePreview);
          headerText.appendChild(descriptionPreview);
          header.appendChild(headerText);
          const headerMeta = createElement$3("div", "flex flex-col items-end gap-2 text-right text-[0.7rem] text-slate-400");
          const enabledToggleWrapper = createElement$3("div", "flex items-center");
          const enabledToggle = createElement$3("button", "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60");
          enabledToggle.type = "button";
          enabledToggle.setAttribute("role", "switch");
          const srEnabledLabel = createElement$3("span", "sr-only", "Toggle action");
          const enabledToggleKnob = createElement$3("span", "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out");
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
          const headerMode = createElement$3("div", "", describeRunMode(formState.runMode));
          headerMeta.appendChild(headerMode);
          headerMeta.appendChild(createElement$3("div", "text-[0.65rem] uppercase tracking-wide text-slate-500", `Last updated ${formatTimestamp(selectedAction.updatedAtMs)}`));
          header.appendChild(headerMeta);
          layout.appendChild(header);
          const nameField = createElement$3("label", "flex flex-col gap-1");
          nameField.appendChild(createElement$3("span", "text-xs uppercase tracking-wide text-slate-400", "Name"));
          const nameInput = viewDocument$3.createElement("input");
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
          const descriptionField = createElement$3("label", "flex flex-col gap-1");
          descriptionField.appendChild(createElement$3("span", "text-xs uppercase tracking-wide text-slate-400", "Description"));
          const descriptionInput = viewDocument$3.createElement("textarea");
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
          const runConfigRow = createElement$3("div", "flex flex-wrap gap-4");
          const modeField = createElement$3("label", "flex flex-col gap-1");
          modeField.appendChild(createElement$3("span", "text-xs uppercase tracking-wide text-slate-400", "Run mode"));
          const modeSelect = viewDocument$3.createElement("select");
          modeSelect.className =
              "w-48 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
          for (const option of [
              { value: "continuous", label: "Continuous" },
              { value: "once", label: "Run once" },
              { value: "event", label: "Event-driven" },
          ]) {
              const opt = viewDocument$3.createElement("option");
              opt.value = option.value;
              opt.textContent = option.label;
              modeSelect.appendChild(opt);
          }
          modeSelect.value = formState.runMode;
          modeField.appendChild(modeSelect);
          runConfigRow.appendChild(modeField);
          const intervalField = createElement$3("label", "flex flex-col gap-1");
          intervalField.appendChild(createElement$3("span", "text-xs uppercase tracking-wide text-slate-400", "Run every (ticks)"));
          const intervalInput = viewDocument$3.createElement("input");
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
          const codeField = createElement$3("div", "flex flex-col gap-2");
          codeField.appendChild(createElement$3("span", "text-xs uppercase tracking-wide text-slate-400", "Script"));
          const codeArea = viewDocument$3.createElement("textarea");
          codeArea.className =
              "min-h-[220px] w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
          codeArea.value = formState.code;
          codeArea.spellcheck = false;
          codeArea.addEventListener("input", () => {
              formState.code = codeArea.value;
          });
          codeField.appendChild(codeArea);
          layout.appendChild(codeField);
          const settingsSection = createElement$3("div", "flex flex-col gap-3");
          const settingsHeader = createElement$3("div", "flex items-center justify-between gap-2");
          settingsHeader.appendChild(createElement$3("span", "text-xs uppercase tracking-wide text-slate-400", "Settings"));
          const settingsList = createElement$3("div", "flex flex-col gap-3");
          const removeSetting = (settingId) => {
              const index = formState.settings.findIndex((entry) => entry.id === settingId);
              if (index !== -1) {
                  formState.settings.splice(index, 1);
              }
          };
          for (const setting of formState.settings) {
              settingsList.appendChild(createActionSettingEditorCard(formState, setting, removeSetting));
          }
          const addSettingButton = createElement$3("button", "rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-sky-200", "Add setting");
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
              settingsSection.appendChild(createElement$3("p", "text-[0.75rem] text-slate-400", "Add settings to expose configurable values that can be adjusted while the action runs."));
          }
          settingsSection.appendChild(settingsList);
          layout.appendChild(settingsSection);
          const footer = createElement$3("div", "flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70 pt-4");
          const leftControls = createElement$3("div", "flex items-center gap-2");
          const runButton = createElement$3("button", "rounded-md border border-sky-500/60 bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/30", "Run action");
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
          const rightControls = createElement$3("div", "flex items-center gap-2");
          const deleteButton = createElement$3("button", "rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20", "Delete");
          deleteButton.type = "button";
          deleteButton.addEventListener("click", () => {
              actions.deleteAction?.(selectedAction.id);
          });
          const saveButton = createElement$3("button", "rounded-md border border-sky-500/60 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/30", "Save changes");
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
      });
  }
  function createActionStatusBadge(status) {
      const baseClass = "rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide";
      const styles = {
          Enabled: "bg-sky-500/20 text-sky-200",
          Running: "bg-emerald-500/20 text-emerald-200",
          Disabled: "bg-slate-700/60 text-slate-200",
      };
      return createElement$3("span", `${baseClass} ${styles[status]}`, status);
  }
  function createActionSettingEditorCard(formState, setting, onRemove) {
      const card = createElement$3("div", "rounded-md border border-slate-800/70 bg-slate-900/70 p-3");
      const header = createElement$3("div", "flex flex-wrap items-center gap-3");
      const labelField = createElement$3("label", "flex min-w-[160px] flex-1 flex-col gap-1");
      labelField.appendChild(createElement$3("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", "Label"));
      const labelInput = viewDocument$3.createElement("input");
      labelInput.type = "text";
      labelInput.className =
          "rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      labelInput.value = setting.label;
      labelInput.addEventListener("input", () => {
          setting.label = labelInput.value;
      });
      labelField.appendChild(labelInput);
      header.appendChild(labelField);
      const keyField = createElement$3("label", "flex w-36 flex-col gap-1");
      keyField.appendChild(createElement$3("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", "Key"));
      const keyInput = viewDocument$3.createElement("input");
      keyInput.type = "text";
      keyInput.className =
          "rounded-md border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      keyInput.value = setting.key;
      keyInput.addEventListener("input", () => {
          setting.key = keyInput.value;
      });
      keyField.appendChild(keyInput);
      header.appendChild(keyField);
      const typeField = createElement$3("label", "flex w-32 flex-col gap-1");
      typeField.appendChild(createElement$3("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", "Type"));
      const typeSelect = viewDocument$3.createElement("select");
      typeSelect.className =
          "rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
      for (const option of [
          { value: "text", label: "Text" },
          { value: "number", label: "Number" },
          { value: "toggle", label: "Toggle" },
      ]) {
          const opt = viewDocument$3.createElement("option");
          opt.value = option.value;
          opt.textContent = option.label;
          typeSelect.appendChild(opt);
      }
      typeSelect.value = setting.type;
      typeField.appendChild(typeSelect);
      header.appendChild(typeField);
      const removeButton = createElement$3("button", "rounded-md border border-slate-700 bg-transparent px-2 py-1 text-xs text-slate-300 transition-colors hover:border-rose-500/60 hover:text-rose-300", "Remove");
      removeButton.type = "button";
      removeButton.addEventListener("click", (event) => {
          event.preventDefault();
          onRemove(setting.id);
          card.remove();
      });
      header.appendChild(removeButton);
      card.appendChild(header);
      const valueWrapper = createElement$3("div", "mt-3 flex flex-col gap-1");
      valueWrapper.appendChild(createElement$3("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", "Value"));
      const valueContainer = createElement$3("div", "flex items-center gap-2");
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
              const input = viewDocument$3.createElement("input");
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
              const wrapper = createElement$3("label", "flex items-center gap-2 text-xs text-slate-200");
              const toggle = viewDocument$3.createElement("input");
              toggle.type = "checkbox";
              toggle.className =
                  "h-4 w-4 rounded border border-slate-600 bg-slate-900 text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500";
              toggle.checked = Boolean(setting.value);
              toggle.addEventListener("change", () => {
                  onChange(toggle.checked);
              });
              wrapper.appendChild(toggle);
              wrapper.appendChild(createElement$3("span", "", "Enabled"));
              return wrapper;
          }
          default: {
              const input = viewDocument$3.createElement("input");
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

  let viewDocument$2 = document;
  function withViewDocument$2(doc, fn) {
      const previous = viewDocument$2;
      viewDocument$2 = doc;
      try {
          return fn();
      }
      finally {
          viewDocument$2 = previous;
      }
  }
  function createElement$2(tag, className, textContent) {
      return createElement$8(tag, className, textContent, viewDocument$2);
  }
  function renderRunningActionsView(options) {
      return withViewDocument$2(options.ui.document, () => {
          const { leaf, snapshot, existingContainer, actions, sortState, onSort } = options;
          const state = getActionsState(snapshot);
          const signature = `${state.runningRevision}:${state.selectedRunningActionId ?? ""}:${state.running.length}`;
          const sortSignature = `${sortState.key}:${sortState.direction}`;
          const isContainer = !!existingContainer &&
              existingContainer.dataset.sidebarRole === SidebarRole.RunningActions;
          const visibleHeaders = getVisibleHeaders(leaf, leaf.view, RUNNING_ACTIONS_TABLE_HEADERS);
          const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
          if (isContainer &&
              existingContainer.dataset.signature === signature &&
              existingContainer.dataset.sortState === sortSignature &&
              existingContainer.dataset.columnVisibilitySignature ===
                  visibilitySignature) {
              existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
              return existingContainer;
          }
          const { container, tbody } = createTableShell({
              sortState,
              onSort,
              existingContainer: isContainer ? existingContainer : undefined,
              view: leaf.view,
              headers: visibleHeaders,
              role: SidebarRole.RunningActions,
              document: viewDocument$2,
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
              const row = createElement$2("tr", "hover:bg-transparent");
              const cell = createElement$2("td", `${cellBaseClass} text-center text-slate-400`, "No actions are currently running.");
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
              const row = createElement$2("tr", "cursor-pointer transition-colors hover:bg-slate-800/40");
              applyRowSelectionIndicator(row, isSelected);
              row.dataset.runningActionId = run.id;
              row.addEventListener("click", () => {
                  actions.selectRunningAction?.(run.id);
              });
              const nameCell = createElement$2("td", `${cellBaseClass} text-left`);
              const nameLine = createElement$2("div", "flex flex-wrap items-center gap-2");
              const nameLabel = createPlayerNameElement(run.name, undefined, {
                  className: "font-semibold text-slate-100 transition-colors hover:text-sky-200",
                  document: viewDocument$2,
              });
              nameLine.appendChild(nameLabel);
              nameCell.appendChild(nameLine);
              const statusCell = createElement$2("td", `${cellBaseClass} text-left`);
              statusCell.appendChild(createRunStatusBadge(run.status));
              const modeCell = createElement$2("td", `${cellBaseClass} text-[0.75rem] uppercase tracking-wide text-slate-400`, getRunModeLabel(run.runMode));
              const startedCell = createElement$2("td", `${cellBaseClass} text-[0.75rem] text-slate-300`, formatTimestamp(run.startedAtMs));
              const controlsCell = createElement$2("td", `${cellBaseClass} text-right`);
              const stopButton = createElement$2("button", "rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20", "Stop");
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
      });
  }
  function renderRunningActionDetailView(options) {
      return withViewDocument$2(options.ui.document, () => {
          const { leaf, snapshot, existingContainer, actions } = options;
          const state = getActionsState(snapshot);
          const selectedRun = state.running.find((run) => run.id === state.selectedRunningActionId);
          const signature = selectedRun
              ? `${state.runningRevision}:${selectedRun.id}:${selectedRun.lastUpdatedMs}`
              : `${state.runningRevision}:none`;
          const isContainer = !!existingContainer &&
              existingContainer.dataset.sidebarRole === SidebarRole.RunningActionDetail;
          const container = isContainer
              ? existingContainer
              : createElement$2("div", "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm");
          container.className =
              "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
          container.dataset.sidebarRole = SidebarRole.RunningActionDetail;
          container.dataset.sidebarView = leaf.view;
          if (container.dataset.signature === signature) {
              return container;
          }
          container.dataset.signature = signature;
          if (!selectedRun) {
              container.replaceChildren(createElement$2("div", "flex h-full items-center justify-center p-6 text-center text-sm text-slate-400", state.running.length === 0
                  ? "No actions are currently running."
                  : "Select a running action to adjust its settings."));
              return container;
          }
          const layout = createElement$2("div", "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100");
          const header = createElement$2("div", "flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-3");
          const headerText = createElement$2("div", "flex flex-col gap-1");
          const titleLine = createElement$2("div", "flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-100");
          titleLine.appendChild(createElement$2("span", "", selectedRun.name));
          titleLine.appendChild(createRunStatusBadge(selectedRun.status));
          headerText.appendChild(titleLine);
          const trimmedDescription = selectedRun.description?.trim() ?? "";
          if (trimmedDescription !== "") {
              headerText.appendChild(createElement$2("div", "text-sm text-slate-400", trimmedDescription));
          }
          headerText.appendChild(createElement$2("div", "text-[0.7rem] text-slate-400", describeRunMode(selectedRun.runMode)));
          header.appendChild(headerText);
          const stopButton = createElement$2("button", "rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20", "Stop action");
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
          const meta = createElement$2("div", "grid gap-3 text-[0.75rem] sm:grid-cols-3");
          meta.appendChild(createSummaryStat("Status", formatRunStatus(selectedRun.status)));
          meta.appendChild(createSummaryStat("Started", formatTimestamp(selectedRun.startedAtMs)));
          meta.appendChild(createSummaryStat("Last update", formatTimestamp(selectedRun.lastUpdatedMs)));
          layout.appendChild(meta);
          if (selectedRun.runMode === "continuous") {
              const intervalField = createElement$2("label", "flex w-full max-w-xs flex-col gap-1");
              intervalField.appendChild(createElement$2("span", "text-xs uppercase tracking-wide text-slate-400", "Run every (ticks)"));
              const intervalInput = viewDocument$2.createElement("input");
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
          const settingsSection = createElement$2("div", "flex flex-col gap-3");
          settingsSection.appendChild(createElement$2("span", "text-xs uppercase tracking-wide text-slate-400", "Runtime settings"));
          const settingsList = createElement$2("div", "flex flex-col gap-3");
          if (selectedRun.settings.length === 0) {
              settingsList.appendChild(createElement$2("p", "text-[0.75rem] text-slate-400", "This action does not expose any runtime settings."));
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
      });
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
      return createElement$2("span", className, formatRunStatus(status));
  }
  function createSummaryStat(label, value) {
      const wrapper = createElement$2("div", "rounded-md border border-slate-800/70 bg-slate-900/70 px-3 py-2");
      const title = createElement$2("div", "text-[0.65rem] uppercase tracking-wide text-slate-400", label);
      const content = createElement$2("div", "font-mono text-base text-slate-100", value);
      wrapper.appendChild(title);
      wrapper.appendChild(content);
      return wrapper;
  }
  function createRunningSettingField(runId, setting, actions) {
      const field = createElement$2("div", "rounded-md border border-slate-800/70 bg-slate-900/70 p-3");
      const header = createElement$2("div", "flex items-center justify-between gap-2");
      const rawLabel = setting.label?.trim() ?? "";
      const rawKey = setting.key?.trim() ?? "";
      const displayLabel = rawLabel !== "" ? rawLabel : rawKey !== "" ? rawKey : "Setting";
      header.appendChild(createElement$2("div", "text-sm font-medium text-slate-100", displayLabel));
      header.appendChild(createElement$2("span", "text-[0.65rem] uppercase tracking-wide text-slate-400", setting.type));
      field.appendChild(header);
      if (setting.key) {
          field.appendChild(createElement$2("div", "text-[0.65rem] text-slate-500", `Key: ${setting.key}`));
      }
      const controlContainer = createElement$2("div", "mt-3");
      switch (setting.type) {
          case "number": {
              const input = viewDocument$2.createElement("input");
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
              const wrapper = createElement$2("label", "flex items-center gap-2 text-xs text-slate-200");
              const toggle = viewDocument$2.createElement("input");
              toggle.type = "checkbox";
              toggle.className =
                  "h-4 w-4 rounded border border-slate-600 bg-slate-900 text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500";
              toggle.checked = Boolean(setting.value);
              toggle.addEventListener("change", () => {
                  actions.updateRunningActionSetting?.(runId, setting.id, toggle.checked);
              });
              wrapper.appendChild(toggle);
              wrapper.appendChild(createElement$2("span", "", "Enabled"));
              controlContainer.appendChild(wrapper);
              break;
          }
          default: {
              const input = viewDocument$2.createElement("input");
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

  let viewDocument$1 = document;
  function withViewDocument$1(doc, fn) {
      const previous = viewDocument$1;
      viewDocument$1 = doc;
      try {
          return fn();
      }
      finally {
          viewDocument$1 = previous;
      }
  }
  function createElement$1(tag, className, textContent) {
      return createElement$8(tag, className, textContent, viewDocument$1);
  }
  function renderLogView(options) {
      return withViewDocument$1(options.ui.document, () => {
          const { leaf, snapshot, existingContainer, actions, sortState, onSort, searchFilter, } = options;
          const logActions = actions;
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
          const isLogContainer = !!existingContainer &&
              existingContainer.dataset.sidebarRole === SidebarRole.LogView;
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
              const previousSearchFilter = existingContainer.dataset.searchFilter ?? "";
              if (previousRevision === revision &&
                  previousSortState === sortSignature &&
                  previousVisibility === visibilitySignature &&
                  previousSearchFilter === (searchFilter ?? "")) {
                  existingContainer.dataset.logRevision = String(revision);
                  existingContainer.dataset.sortState = sortSignature;
                  existingContainer.dataset.columnVisibilitySignature =
                      visibilitySignature;
                  existingContainer.dataset.searchFilter = searchFilter ?? "";
                  return existingContainer;
              }
          }
          const { container, tbody } = createTableShell({
              sortState: activeSortState,
              onSort,
              existingContainer: isLogContainer ? existingContainer : undefined,
              view: leaf.view,
              headers: visibleHeaders,
              role: SidebarRole.LogView,
              document: viewDocument$1,
          });
          container.dataset.logFollowState = followEnabled ? "following" : "paused";
          container.dataset.logStickToBottom = followEnabled ? "true" : "false";
          container.dataset.logRevision = String(revision);
          container.dataset.sortState = sortSignature;
          container.dataset.columnVisibilitySignature = visibilitySignature;
          container.dataset.searchFilter = searchFilter ?? "";
          const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
          if (logs.length === 0) {
              const emptyRow = createElement$1("tr");
              const emptyCell = createElement$1("td", `${TABLE_CELL_BASE_CLASS} py-8 text-center text-[0.75rem] italic text-slate-500`, "No log messages yet.");
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
                  default:
                      break;
              }
              for (const entry of sortedLogs) {
                  tbody.appendChild(renderLogRow(entry, logActions, visibleKeys));
              }
          }
          return container;
      });
  }
  function renderLogRow(entry, actions, visibleKeys) {
      const row = createElement$1("tr", "transition-colors hover:bg-slate-900/40");
      row.dataset.sidebarRole = SidebarRole.LogEntry;
      row.dataset.logEntryId = entry.id;
      row.dataset.logLevel = entry.level;
      row.dataset.logTimestamp = String(entry.timestampMs);
      row.style.boxShadow = `inset 0.25rem 0 0 0 ${getLogAccentColor(entry.level)}`;
      const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
      const timestampCell = createElement$1("td", `${cellBaseClass} font-mono text-[0.75rem] text-slate-300 whitespace-nowrap`, formatTimestamp(entry.timestampMs));
      const levelCell = createElement$1("td", `${cellBaseClass} text-center`);
      const levelBadge = createElement$1("span", `inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${getLogLevelBadgeClass(entry.level)}`, entry.level.toUpperCase());
      levelCell.appendChild(levelBadge);
      const hasSource = !!entry.source && entry.source.trim().length > 0;
      const sourceCell = createElement$1("td", `${cellBaseClass} text-[0.75rem] text-slate-400 whitespace-nowrap`, hasSource ? entry.source : "–");
      const messageCellClass = `${cellBaseClass} font-mono text-[0.75rem] whitespace-pre-wrap break-words `;
      const messageCell = createElement$1("td", `${messageCellClass}${getLogMessageClass(entry.level)}`);
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
      const fragment = viewDocument$1.createDocumentFragment();
      for (const token of tokens) {
          if (token.type === "text") {
              fragment.appendChild(viewDocument$1.createTextNode(token.text));
              continue;
          }
          fragment.appendChild(createLogMentionPill(token, actions));
      }
      return fragment;
  }
  function createLogMentionPill(token, actions) {
      const button = createElement$1("button", "inline-flex max-w-full items-center gap-1 rounded-full border border-slate-700/70 bg-slate-900/40 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-200 transition-colors hover:border-sky-500/70 hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60");
      button.type = "button";
      button.dataset.sidebarRole = SidebarRole.LogMention;
      button.dataset.mentionType = token.type;
      button.dataset.mentionId = token.id;
      if (token.color) {
          button.style.borderColor = token.color;
          const swatch = createElement$1("span", "h-2 w-2 shrink-0 rounded-full border border-slate-900/70");
          swatch.style.backgroundColor = token.color;
          button.appendChild(swatch);
      }
      const label = createElement$1("span", "max-w-[10rem] truncate text-left", token.label);
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

  let viewDocument = document;
  function withViewDocument(doc, fn) {
      const previous = viewDocument;
      viewDocument = doc;
      try {
          return fn();
      }
      finally {
          viewDocument = previous;
      }
  }
  function createElement(tag, className, textContent) {
      return createElement$8(tag, className, textContent, viewDocument);
  }
  function renderOverlayView(options) {
      return withViewDocument(options.ui.document, () => {
          const { leaf, snapshot, existingContainer, actions, sortState, onSort } = options;
          const overlays = snapshot.sidebarOverlays ?? [];
          const revision = snapshot.sidebarOverlayRevision ?? 0;
          const signature = `${revision}:${overlays
            .map((overlay) => `${overlay.id}:${overlay.enabled ? 1 : 0}:${overlay.scope}:${overlay.label}`)
            .join("|")}`;
          const sortSignature = `${sortState.key}:${sortState.direction}`;
          const isOverlayContainer = !!existingContainer &&
              existingContainer.dataset.sidebarRole === SidebarRole.OverlaysDirectory;
          const visibleHeaders = getVisibleHeaders(leaf, leaf.view, OVERLAY_TABLE_HEADERS);
          const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
          if (isOverlayContainer &&
              existingContainer.dataset.signature === signature &&
              existingContainer.dataset.sortState === sortSignature &&
              existingContainer.dataset.columnVisibilitySignature ===
                  visibilitySignature) {
              existingContainer.dataset.columnVisibilitySignature = visibilitySignature;
              return existingContainer;
          }
          const { container, tbody } = createTableShell({
              sortState,
              onSort,
              existingContainer: isOverlayContainer ? existingContainer : undefined,
              view: leaf.view,
              headers: visibleHeaders,
              role: SidebarRole.OverlaysDirectory,
              document: viewDocument,
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
          else if (sortState.key === "scope") {
              sortedOverlays.sort((a, b) => compareSortValues(a.scope, b.scope, sortState.direction));
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
              const scopeCell = createElement("td", `${cellBaseClass} text-left`);
              scopeCell.textContent = overlay.scope === "lobby" ? "Lobby" : "Game";
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
              if (visibleKeys.has("name")) {
                  row.appendChild(nameCell);
              }
              if (visibleKeys.has("scope")) {
                  row.appendChild(scopeCell);
              }
              if (visibleKeys.has("status")) {
                  row.appendChild(statusCell);
              }
              tbody.appendChild(row);
          }
          return container;
      });
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
  function buildViewContent(leaf, snapshot, requestRender, ui, existingContainer, lifecycle, actions, searchFilter) {
      const view = leaf.view;
      const sortState = ensureSortState(leaf, view);
      const viewActions = actions ?? DEFAULT_ACTIONS;
      const handleSort = (key) => {
          const current = ensureSortState(leaf, view);
          const direction = current.key === key
              ? current.direction === "asc"
                  ? "desc"
                  : "asc"
              : getDefaultDirection(key);
          leaf.sortStates[view] = { key, direction };
          requestRender();
      };
      switch (view) {
          case "players":
              return renderPlayersView({
                  leaf,
                  snapshot,
                  requestRender,
                  ui,
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
                  ui,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
                  lifecycle,
                  searchFilter,
              });
          case "teams":
              return renderTeamView({
                  leaf,
                  snapshot,
                  requestRender,
                  ui,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
                  lifecycle,
                  searchFilter,
              });
          case "attacks":
              return renderAttacksView({
                  leaf,
                  snapshot,
                  requestRender,
                  ui,
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
                  ui,
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
                  ui,
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
                  ui,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
              });
          case "actionEditor":
              return renderActionEditorView({
                  leaf,
                  snapshot,
                  ui,
                  existingContainer,
                  lifecycle,
                  actions: viewActions,
              });
          case "runningActions":
              return renderRunningActionsView({
                  leaf,
                  snapshot,
                  ui,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
              });
          case "runningAction":
              return renderRunningActionDetailView({
                  leaf,
                  snapshot,
                  ui,
                  existingContainer,
                  lifecycle,
                  actions: viewActions,
              });
          case "logs":
              return renderLogView({
                  leaf,
                  snapshot,
                  ui,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
                  searchFilter,
              });
          case "overlays":
              return renderOverlayView({
                  leaf,
                  snapshot,
                  ui,
                  sortState,
                  onSort: handleSort,
                  existingContainer,
                  actions: viewActions,
              });
          default:
              return createElement$8("div", "text-slate-200 text-sm", "Unsupported view", ui.document);
      }
  }

  const VIEW_OPTIONS = [
      { value: "players", label: "Players" },
      { value: "clanmates", label: "Clanmates" },
      { value: "teams", label: "Teams" },
      { value: "attacks", label: "Attacks" },
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
      "flex h-7 w-7 shrink-0 items-center justify-center",
      "rounded-md border border-slate-700/70",
      "bg-slate-800/70 text-slate-300 transition-colors",
      "hover:border-sky-500/60 hover:text-sky-200",
      "focus:outline-none focus:ring-2 focus:ring-sky-500/50",
  ].join(" ");
  const PROJECT_DOCS_URL = "https://github.com/Ezbaze/DataFront/blob/main/docs/README.md";
  const LOBBY_CLAN_TAG_COUNTS_OVERLAY_ID$1 = "lobby-clan-tag-counts";
  const LOBBY_CLAN_TAG_PILL_SELECTOR = "[data-datafront-lobby-clan-pill='true']";
  function getPanelActionButtonClass(extra) {
      return extra
          ? `${PANEL_ACTION_BUTTON_BASE_CLASS} ${extra}`
          : PANEL_ACTION_BUTTON_BASE_CLASS;
  }
  function ensureSidebarStyles(targetDocument) {
      const style = targetDocument.getElementById(SIDEBAR_STYLE_ID);
      if (style) {
          return;
      }
      const nextStyle = targetDocument.createElement("style");
      nextStyle.id = SIDEBAR_STYLE_ID;
      const roles = [SidebarRole.TableContainer, SidebarRole.LogView];
      nextStyle.textContent = roles
          .map((role) => `
    #${SIDEBAR_ID} [data-sidebar-role="${role}"] {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.7) transparent;
    }

    #${SIDEBAR_ID} [data-sidebar-role="${role}"]::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    #${SIDEBAR_ID} [data-sidebar-role="${role}"]::-webkit-scrollbar-thumb {
      background-color: rgba(148, 163, 184, 0.7);
      border-radius: 9999px;
    }

    #${SIDEBAR_ID} [data-sidebar-role="${role}"]::-webkit-scrollbar-track {
      background-color: transparent;
    }`)
          .join("\n").concat(`
    #${SIDEBAR_ID} .df-header-controls {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    #${SIDEBAR_ID} .df-header-controls::-webkit-scrollbar {
      display: none;
    }`);
      targetDocument.head.appendChild(nextStyle);
  }
  const OVERLAY_SELECTORS = ["game-left-sidebar", "control-panel"];
  class SidebarApp {
      constructor(store, options, uiDocument = document, uiWindow = window) {
          this.hostDocument = document;
          this.hostWindow = window;
          this.uiDocument = document;
          this.uiWindow = window;
          this.overlayElements = new Map();
          this.isSyncingLobbyCardOverlays = false;
          this.handleOverlayRealign = () => this.runWithUiContext(() => this.repositionGameOverlay());
          this.handleGlobalKeyDown = (event) => this.onGlobalKeyDown(event);
          this.searchFilter = "";
          this.isSidebarHidden = false;
          this.areOverlaysHidden = false;
          this.sidebarResizer = null;
          this.sidebarDefaultWidth = "420px";
          this.hostSidebarWidth = "420px";
          this.isQuickActionsMenuOpen = false;
          this.handleQuickActionsPointerDown = (event) => this.runWithUiContext(() => this.onQuickActionsPointerDown(event));
          this.handleQuickActionsKeyDown = (event) => this.runWithUiContext(() => this.onQuickActionsKeyDown(event));
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
          this.layoutContainer = this.sidebar.querySelector("[data-sidebar-layout]");
          this.sidebarDefaultWidth =
              this.sidebar.style.width || this.sidebarDefaultWidth;
          this.hostSidebarWidth = this.sidebarDefaultWidth;
          this.applySidebarLayoutMode();
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
              this.runWithUiContext(() => {
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
                  this.syncLobbyClanTagCardOverlays();
              });
          });
          if (this.enableOverlayAlignment) {
              this.observeGameOverlays();
              this.overlayResizeObserver = new ResizeObserver(this.handleOverlayRealign);
              this.overlayResizeObserver.observe(this.sidebar);
              this.hostWindow.addEventListener("resize", this.handleOverlayRealign);
          }
          if (this.enableGlobalHotkeys) {
              this.hostWindow.addEventListener("keydown", this.handleGlobalKeyDown);
          }
          this.repositionGameOverlay();
          this.syncLobbyClanTagCardOverlays();
      }
      syncPlayerDetails(playerId) {
          this.syncPlayerSelection(playerId);
      }
      syncPlayerSelection(playerId) {
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
      syncSearchFilter(query) {
          const trimmed = query.trim();
          const next = trimmed.length >= 1 ? trimmed : "";
          if (this.searchInput) {
              this.searchInput.value = next;
          }
          this.updateSearchFilter(next, { notify: false });
      }
      destroy() {
          this.runWithUiContext(() => {
              if (this.overlayObserver) {
                  this.overlayObserver.disconnect();
              }
              if (this.overlayResizeObserver) {
                  this.overlayResizeObserver.disconnect();
              }
              if (this.overlayMutationFrame !== undefined) {
                  this.hostWindow.cancelAnimationFrame(this.overlayMutationFrame);
                  this.overlayMutationFrame = undefined;
              }
              if (this.lobbyCardObserver) {
                  this.lobbyCardObserver.disconnect();
              }
              if (this.lobbyCardMutationFrame !== undefined) {
                  this.hostWindow.cancelAnimationFrame(this.lobbyCardMutationFrame);
                  this.lobbyCardMutationFrame = undefined;
              }
              this.hostWindow.removeEventListener("resize", this.handleOverlayRealign);
              if (this.enableGlobalHotkeys) {
                  this.hostWindow.removeEventListener("keydown", this.handleGlobalKeyDown);
              }
              this.closeQuickActionsMenu();
              this.clearLobbyClanTagCardOverlays();
          });
      }
      setUiEnvironment(doc, win) {
          this.uiDocument = doc;
          this.uiWindow = win;
      }
      runWithUiContext(fn) {
          return fn();
      }
      createUiElement(tag, className, textContent) {
          return createElement$8(tag, className, textContent, this.uiDocument);
      }
      onGlobalKeyDown(event) {
          this.runWithUiContext(() => this.handleKeyDownInternal(event));
      }
      handleKeyDownInternal(event) {
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
          const isToggleShortcut = event.ctrlKey && event.altKey && !event.shiftKey && !event.metaKey;
          if (!isToggleShortcut) {
              return;
          }
          if (event.code !== "KeyH" && event.code !== "KeyO") {
              return;
          }
          event.preventDefault();
          if (event.code === "KeyH") {
              this.toggleSidebarVisibility();
              return;
          }
          this.toggleOverlaysVisibility();
      }
      createSidebarShell() {
          this.uiDocument.getElementById(SIDEBAR_ID)?.remove();
          const sidebar = this.createUiElement("aside");
          sidebar.id = SIDEBAR_ID;
          sidebar.style.position = "fixed";
          sidebar.style.top = "0";
          sidebar.style.left = "0";
          sidebar.style.zIndex = "2147483646";
          sidebar.style.display = "flex";
          sidebar.style.flexDirection = "column";
          sidebar.style.height = "100%";
          sidebar.style.borderRight = "1px solid rgba(30, 41, 59, 0.8)";
          sidebar.style.background = "rgba(2, 6, 23, 0.95)";
          sidebar.style.color = "#f1f5f9";
          sidebar.style.boxShadow = "0 25px 50px -12px rgb(0 0 0 / 0.25)";
          sidebar.style.backdropFilter = "blur(12px)";
          sidebar.style.webkitBackdropFilter = "blur(12px)";
          sidebar.style.width = this.windowMode === "standalone" ? "100%" : "420px";
          sidebar.style.maxWidth = this.windowMode === "standalone" ? "100%" : "90vw";
          sidebar.style.fontFamily = `'Inter', 'Segoe UI', system-ui, sans-serif`;
          const resizer = this.createUiElement("div", "group absolute right-0 top-0 flex h-full w-3 translate-x-full cursor-col-resize items-center justify-center rounded-r-full bg-transparent transition-colors duration-150 hover:bg-sky-500/10");
          resizer.dataset.sidebarResizer = "true";
          this.sidebarResizer = resizer;
          resizer.appendChild(this.createUiElement("span", "h-12 w-px rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60"));
          resizer.addEventListener("pointerdown", (event) => this.runWithUiContext(() => this.startSidebarResize(event)));
          sidebar.appendChild(resizer);
          const layout = this.createUiElement("div", "flex h-full flex-1 flex-col gap-3 overflow-hidden p-3");
          layout.dataset.sidebarLayout = "true";
          sidebar.appendChild(layout);
          this.uiDocument.body.appendChild(sidebar);
          return sidebar;
      }
      startSidebarResize(event) {
          this.runWithUiContext(() => {
              event.preventDefault();
              const startWidth = this.sidebar.getBoundingClientRect().width;
              const startX = event.clientX;
              const originalUserSelect = this.uiDocument.body.style.userSelect;
              this.uiDocument.body.style.userSelect = "none";
              const onMove = (moveEvent) => {
                  const delta = moveEvent.clientX - startX;
                  const nextWidth = clamp(startWidth + delta, 280, (this.uiWindow.innerWidth ?? window.innerWidth) * 0.9);
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
      applySidebarLayoutMode() {
          const resizer = this.sidebarResizer ??
              this.sidebar.querySelector("[data-sidebar-resizer]");
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
              }
              else {
                  resizer.style.display = "";
                  resizer.removeAttribute("aria-hidden");
              }
          }
      }
      scheduleOverlayRealign() {
          if (this.overlayMutationFrame !== undefined) {
              return;
          }
          this.overlayMutationFrame = this.hostWindow.requestAnimationFrame(() => {
              this.overlayMutationFrame = undefined;
              this.repositionGameOverlay();
          });
      }
      observeGameOverlays() {
          if (!this.enableOverlayAlignment || this.overlayObserver) {
              return;
          }
          this.overlayObserver = new MutationObserver(() => {
              this.scheduleOverlayRealign();
          });
          this.overlayObserver.observe(document.body, {
              childList: true,
              subtree: true,
          });
      }
      repositionGameOverlay() {
          if (!this.enableOverlayAlignment) {
              return;
          }
          let missingElement = false;
          const treatHidden = this.isSidebarHidden;
          const sidebarWidth = treatHidden
              ? 0
              : this.sidebar.getBoundingClientRect().width;
          const sidebarOffset = Math.round(sidebarWidth);
          const offset = sidebarOffset + 16;
          for (const selector of OVERLAY_SELECTORS) {
              const registration = this.ensureOverlayRegistration(selector);
              if (!registration) {
                  missingElement = true;
                  continue;
              }
              registration.target;
              if (treatHidden) {
                  this.restoreOverlayRegistration(selector, registration);
                  continue;
              }
              this.applyOverlayOffset(selector, registration, offset);
          }
          if (missingElement) {
              this.observeGameOverlays();
          }
      }
      restoreOverlayRegistration(selector, registration) {
          registration.target.style.left = registration.originalLeft;
          registration.target.style.right = registration.originalRight;
          registration.target.style.width = registration.originalWidth;
          registration.target.style.maxWidth = registration.originalMaxWidth;
      }
      applyOverlayOffset(selector, registration, offset) {
          if (selector === "control-panel") {
              registration.target.style.left = `${offset}px`;
              registration.target.style.right = registration.originalRight;
              registration.target.style.width = `calc(100vw - ${offset}px)`;
              registration.target.style.maxWidth = `calc(100vw - ${offset}px)`;
              return;
          }
          registration.target.style.left = `${offset}px`;
          registration.target.style.right = "auto";
          registration.target.style.width = registration.originalWidth;
          registration.target.style.maxWidth = `calc(100vw - ${offset + 24}px)`;
      }
      ensureOverlayRegistration(selector) {
          const root = document.querySelector(selector);
          let registration = this.overlayElements.get(selector) ?? null;
          if (!root) {
              if (registration) {
                  this.restoreOverlayRegistration(selector, registration);
                  this.overlayElements.delete(selector);
              }
              return null;
          }
          const target = this.resolveOverlayTarget(selector, root);
          if (!target) {
              if (registration) {
                  this.restoreOverlayRegistration(selector, registration);
                  this.overlayElements.delete(selector);
              }
              return null;
          }
          if (!registration ||
              registration.root !== root ||
              registration.target !== target) {
              if (registration) {
                  this.restoreOverlayRegistration(selector, registration);
              }
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
          const originalWidth = existing && existing.target === target
              ? existing.originalWidth
              : target.style.width;
          const originalMaxWidth = existing && existing.target === target
              ? existing.originalMaxWidth
              : target.style.maxWidth;
          this.overlayElements.set(selector, {
              root,
              target,
              originalLeft,
              originalRight,
              originalWidth,
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
      toggleOverlaysVisibility(force) {
          const nextHidden = typeof force === "boolean" ? force : !this.areOverlaysHidden;
          if (nextHidden === this.areOverlaysHidden) {
              return;
          }
          this.areOverlaysHidden = nextHidden;
          this.store.setOverlaysTemporarilyHidden(nextHidden);
          this.syncLobbyClanTagCardOverlays();
      }
      syncLobbyClanTagCardOverlays() {
          const selector = this.hostDocument.querySelector("game-mode-selector");
          const shouldRender = !this.areOverlaysHidden &&
              this.isOverlayEnabled(LOBBY_CLAN_TAG_COUNTS_OVERLAY_ID$1) &&
              !this.snapshot.players.some((player) => !player.isLobbyPlayer) &&
              (this.snapshot.currentLobbyQueues?.length ?? 0) > 0 &&
              typeof this.snapshot.currentLobbyClanTag === "string" &&
              this.snapshot.currentLobbyClanTag.length > 0;
          this.observeLobbyCardMutations(shouldRender && selector?.isConnected ? selector : undefined);
          if (!shouldRender || !selector?.isConnected) {
              this.clearLobbyClanTagCardOverlays();
              return;
          }
          this.isSyncingLobbyCardOverlays = true;
          try {
              const buttons = this.collectLobbyCardButtons(selector);
              const cardQueues = this.buildLobbyCardQueueSequence();
              this.clearLobbyClanTagCardOverlays(selector);
              const clanTag = this.snapshot.currentLobbyClanTag ?? "";
              const total = Math.min(buttons.length, cardQueues.length);
              for (let index = 0; index < total; index += 1) {
                  const button = buttons[index];
                  const queue = cardQueues[index];
                  if (!button || !queue) {
                      continue;
                  }
                  const count = this.countPlayersWithClanTag(queue.players, clanTag);
                  this.renderLobbyClanTagCardAugment(button, clanTag, count);
              }
          }
          finally {
              this.isSyncingLobbyCardOverlays = false;
          }
      }
      observeLobbyCardMutations(root) {
          if (this.lobbyCardObservedRoot === root && this.lobbyCardObserver) {
              return;
          }
          if (this.lobbyCardObserver) {
              this.lobbyCardObserver.disconnect();
              this.lobbyCardObserver = undefined;
          }
          this.lobbyCardObservedRoot = root;
          if (!root) {
              return;
          }
          this.lobbyCardObserver = new MutationObserver(() => {
              if (this.isSyncingLobbyCardOverlays) {
                  return;
              }
              if (this.lobbyCardMutationFrame !== undefined) {
                  return;
              }
              this.lobbyCardMutationFrame = this.hostWindow.requestAnimationFrame(() => {
                  this.lobbyCardMutationFrame = undefined;
                  this.syncLobbyClanTagCardOverlays();
              });
          });
          this.lobbyCardObserver.observe(root, {
              childList: true,
              subtree: true,
              characterData: true,
          });
      }
      isOverlayEnabled(overlayId) {
          return (this.snapshot.sidebarOverlays?.some((overlay) => overlay.id === overlayId && overlay.enabled) ?? false);
      }
      collectLobbyCardButtons(root) {
          return Array.from(root.querySelectorAll("button")).filter((element) => element instanceof HTMLButtonElement &&
              element.classList.contains("rounded-2xl"));
      }
      buildLobbyCardQueueSequence() {
          const queues = this.snapshot.currentLobbyQueues ?? [];
          const queueByType = new Map();
          for (const queue of queues) {
              if (queue.publicGameType === "special" ||
                  queue.publicGameType === "ffa" ||
                  queue.publicGameType === "team") {
                  queueByType.set(queue.publicGameType, queue);
              }
          }
          const orderedTypes = [
              "special",
              "ffa",
              "team",
          ];
          const orderedQueues = [];
          for (const type of orderedTypes) {
              const queue = queueByType.get(type);
              if (queue) {
                  orderedQueues.push(queue);
              }
          }
          const fallbackQueues = orderedQueues.length > 0
              ? queues.filter((queue) => !orderedQueues.some((orderedQueue) => orderedQueue.gameId === queue.gameId))
              : queues;
          const displayQueues = [...orderedQueues, ...fallbackQueues];
          if (displayQueues.length === 0) {
              return [];
          }
          return [...displayQueues, ...displayQueues];
      }
      countPlayersWithClanTag(players, clanTag) {
          const normalizedTarget = this.normalizeClanTag(clanTag);
          if (!normalizedTarget) {
              return 0;
          }
          let count = 0;
          for (const player of players) {
              if (this.normalizeClanTag(extractClanTag(player.name)) === normalizedTarget) {
                  count += 1;
              }
          }
          return count;
      }
      normalizeClanTag(clanTag) {
          const trimmed = clanTag?.trim();
          return trimmed && trimmed.length > 0 ? trimmed.toUpperCase() : "";
      }
      renderLobbyClanTagCardAugment(button, clanTag, count) {
          const pill = this.findLobbyCardPlayerCountPill(button);
          if (!pill) {
              return;
          }
          const container = pill.parentElement ?? button;
          const computedStyle = this.hostWindow.getComputedStyle(pill);
          const rightOffset = Number.parseFloat(computedStyle.right || "0");
          const gapPx = 4;
          const pillWidth = Math.ceil(pill.getBoundingClientRect().width);
          const clanPill = this.createUiElement("span", [
              "absolute bottom-full mb-1 rounded px-2 py-0.5",
              "bg-black/70 backdrop-blur-sm text-xs font-bold tracking-widest",
              count > 0 ? "text-emerald-100" : "text-slate-300",
          ].join(" "), `${count} [${clanTag}]`);
          clanPill.dataset.datafrontLobbyClanPill = "true";
          clanPill.title = `Players with your clan tag ([${clanTag}]) in this lobby`;
          clanPill.style.right = `${rightOffset + pillWidth + gapPx}px`;
          container.appendChild(clanPill);
      }
      findLobbyCardPlayerCountPill(button) {
          const directMatch = button.querySelector("span.absolute.bottom-full.right-2");
          if (directMatch?.isConnected) {
              return directMatch;
          }
          for (const child of Array.from(button.querySelectorAll("span"))) {
              if (child instanceof HTMLElement &&
                  child.querySelector("svg") &&
                  child.textContent?.includes("/")) {
                  return child;
              }
          }
          return null;
      }
      clearLobbyClanTagCardOverlays(root) {
          const scope = root ?? this.hostDocument;
          for (const pill of Array.from(scope.querySelectorAll(LOBBY_CLAN_TAG_PILL_SELECTOR))) {
              pill.remove();
          }
      }
      resolveOverlayTarget(selector, root) {
          if (!root.isConnected) {
              return null;
          }
          if (selector === "game-left-sidebar") {
              return this.resolveGameLeftSidebarTarget(root);
          }
          if (selector === "control-panel") {
              return this.resolveBottomHudTarget(root);
          }
          return root;
      }
      resolveGameLeftSidebarTarget(root) {
          const aside = root.querySelector("aside");
          if (aside?.isConnected) {
              return aside;
          }
          const fixedDescendant = this.findPositionedDescendant(root);
          if (fixedDescendant) {
              return fixedDescendant;
          }
          return this.findPositionedAncestor(root) ?? root;
      }
      resolveBottomHudTarget(root) {
          const hudContainer = this.findBottomHudContainer(root);
          if (hudContainer) {
              return hudContainer;
          }
          return this.findPositionedAncestor(root) ?? root;
      }
      findBottomHudContainer(root) {
          let current = root.parentElement;
          while (current) {
              if (this.isBottomHudContainer(current)) {
                  return current;
              }
              current = current.parentElement;
          }
          return null;
      }
      isBottomHudContainer(element) {
          const style = this.hostWindow.getComputedStyle(element);
          if (style.position !== "fixed") {
              return false;
          }
          const hasHudContent = element.querySelector("control-panel") instanceof HTMLElement &&
              element.querySelector("attacks-display") instanceof HTMLElement &&
              element.querySelector("events-display") instanceof HTMLElement;
          if (!hasHudContent) {
              return false;
          }
          return style.left === "0px" || style.bottom === "0px";
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
      findPositionedDescendant(root) {
          const walker = (root.ownerDocument ?? document).createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
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
          this.runWithUiContext(() => {
              this.doRenderLayout();
          });
      }
      doRenderLayout() {
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
      buildSidebarTopBars() {
          const container = this.createUiElement("div", "flex gap-3");
          const quickActionsWrapper = this.createUiElement("div", "relative");
          const quickActionsButton = this.createUiElement("button", "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-800/70 bg-slate-900/70 text-slate-200 shadow-inner transition hover:border-sky-500/70 focus:outline-none focus:ring-2 focus:ring-sky-500/50");
          quickActionsButton.type = "button";
          quickActionsButton.setAttribute("aria-haspopup", "menu");
          quickActionsButton.setAttribute("aria-expanded", "false");
          quickActionsButton.setAttribute("aria-label", "Open menu");
          quickActionsButton.appendChild(renderIcon("radar", "h-5 w-5"));
          quickActionsButton.addEventListener("click", () => this.runWithUiContext(() => this.toggleQuickActionsMenu()));
          quickActionsWrapper.appendChild(quickActionsButton);
          this.quickActionsButton = quickActionsButton;
          container.appendChild(quickActionsWrapper);
          const searchWrapper = this.createUiElement("div", "relative flex-1 min-w-0 space-y-1");
          const searchBar = this.createUiElement("label", "flex h-10 items-center rounded-lg border border-slate-800/70 bg-slate-900/70 px-2 shadow-inner");
          const searchInput = this.createUiElement("input", "flex-1 min-w-0 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 appearance-none border-none ring-0 focus:outline-none focus:ring-0 focus:border-transparent");
          searchInput.type = "search";
          searchInput.autocomplete = "off";
          searchInput.placeholder = "Search...";
          this.searchInput = searchInput;
          searchInput.value = this.searchFilter;
          searchInput.addEventListener("input", () => this.handleSearchInput(searchInput.value));
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
      toggleQuickActionsMenu() {
          if (this.isQuickActionsMenuOpen) {
              this.closeQuickActionsMenu();
              return;
          }
          this.openQuickActionsMenu();
      }
      openQuickActionsMenu() {
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
          this.uiDocument.addEventListener("pointerdown", this.handleQuickActionsPointerDown, true);
          this.uiDocument.addEventListener("keydown", this.handleQuickActionsKeyDown, true);
      }
      closeQuickActionsMenu() {
          if (!this.isQuickActionsMenuOpen) {
              return;
          }
          this.isQuickActionsMenuOpen = false;
          this.quickActionsButton?.setAttribute("aria-expanded", "false");
          if (this.quickActionsMenu?.parentElement) {
              this.quickActionsMenu.parentElement.removeChild(this.quickActionsMenu);
          }
          this.quickActionsMenu = undefined;
          this.uiDocument.removeEventListener("pointerdown", this.handleQuickActionsPointerDown, true);
          this.uiDocument.removeEventListener("keydown", this.handleQuickActionsKeyDown, true);
      }
      buildQuickActionsMenu() {
          const menu = this.createUiElement("div", "absolute left-0 z-[2147483646] mt-2 w-44 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/95 text-sm shadow-xl backdrop-blur");
          menu.role = "menu";
          menu.tabIndex = -1;
          const list = this.createUiElement("div", "py-1");
          list.appendChild(this.createQuickActionItem("New window", "external-link", () => this.onRequestNewWindow?.()));
          list.appendChild(this.createQuickActionItem("Docs", "external-link", () => this.openProjectDocs()));
          list.appendChild(this.createQuickActionItem("Save state", "save", () => this.store.saveSidebarState()));
          menu.appendChild(list);
          return menu;
      }
      createQuickActionItem(label, icon, onSelect) {
          const button = this.createUiElement("button", "flex w-full items-center gap-2 px-3 py-2 text-left text-slate-100 transition-colors hover:bg-slate-800/80 hover:text-sky-200", label);
          button.type = "button";
          button.prepend(renderIcon(icon, "h-4 w-4 text-slate-300"));
          button.addEventListener("click", () => {
              this.closeQuickActionsMenu();
              this.runWithUiContext(() => onSelect?.());
          });
          return button;
      }
      openProjectDocs() {
          this.uiWindow.open(PROJECT_DOCS_URL, "_blank", "noopener,noreferrer");
      }
      onQuickActionsPointerDown(event) {
          if (!this.isQuickActionsMenuOpen) {
              return;
          }
          const target = event.target;
          if ((target && this.quickActionsMenu?.contains(target)) ||
              (target && this.quickActionsButton?.contains(target))) {
              return;
          }
          this.closeQuickActionsMenu();
      }
      onQuickActionsKeyDown(event) {
          if (!this.isQuickActionsMenuOpen) {
              return;
          }
          if (event.key === "Escape") {
              this.closeQuickActionsMenu();
          }
      }
      handleSearchInput(raw) {
          this.runWithUiContext(() => {
              const trimmed = raw.trim();
              this.updateSearchFilter(trimmed.length >= 1 ? trimmed : "");
          });
      }
      handleSearchSubmit() {
          this.runWithUiContext(() => {
              const query = this.searchInput?.value ?? "";
              const trimmed = query.trim();
              if (!trimmed) {
                  return;
              }
              this.updateSearchFilter(trimmed.length >= 1 ? trimmed : "");
              const coordinates = this.parseCoordinates(trimmed);
              if (coordinates) {
                  focusTile(coordinates);
              }
          });
      }
      parseCoordinates(query) {
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
      buildNodeElement(node) {
          if (node.type === "leaf") {
              return this.buildLeafElement(node);
          }
          return this.buildGroupElement(node);
      }
      updateSearchFilter(next, options) {
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
      isViewSearchSupported(view) {
          return (view === "players" ||
              view === "clanmates" ||
              view === "teams" ||
              view === "attacks" ||
              view === "ships" ||
              view === "logs" ||
              view === "actions" ||
              view === "runningActions");
      }
      updateLeafSearchFilter(leaf, next) {
          const current = leaf.viewSearchFilters[leaf.view] ?? "";
          if (current === next) {
              return;
          }
          leaf.viewSearchFilters[leaf.view] = next;
          this.refreshLeafContent(leaf);
      }
      handleLeafSearchInput(leaf, raw) {
          this.runWithUiContext(() => {
              const hasContent = raw.trim().length >= 1;
              this.updateLeafSearchFilter(leaf, hasContent ? raw : "");
          });
      }
      handleLeafSearchSubmit(leaf, raw) {
          this.runWithUiContext(() => {
              if (!raw.trim()) {
                  return;
              }
              this.updateLeafSearchFilter(leaf, raw);
              const coordinates = this.parseCoordinates(raw.trim());
              if (coordinates) {
                  focusTile(coordinates);
              }
          });
      }
      toggleLeafSearchEnabled(leaf) {
          const view = leaf.view;
          const supportsSearch = this.isViewSearchSupported(view);
          if (!supportsSearch) {
              return;
          }
          const nextEnabled = !(leaf.viewSearchEnabled[view] ?? false);
          leaf.viewSearchEnabled[view] = nextEnabled;
          if (!nextEnabled) {
              leaf.viewSearchFilters[view] = "";
          }
          this.refreshLeafContent(leaf);
          if (nextEnabled) {
              this.uiWindow.setTimeout(() => {
                  leaf.element?.viewSearchInput?.focus();
                  leaf.element?.viewSearchInput?.select();
              }, 0);
          }
      }
      ensureLeafViewSearchElements(leaf) {
          const element = leaf.element;
          if (!element) {
              throw new Error("Leaf UI not initialized");
          }
          if (element.viewSearchWrapper && element.viewSearchInput) {
              return {
                  wrapper: element.viewSearchWrapper,
                  input: element.viewSearchInput,
              };
          }
          const wrapper = this.createUiElement("div", "border-b border-slate-800/70 bg-slate-950/40 px-2 py-2");
          const input = this.createUiElement("input", "h-8 w-full rounded-md border border-slate-800/70 bg-slate-900/70 px-2 text-xs leading-none text-slate-100 shadow-inner placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50");
          input.type = "search";
          input.autocomplete = "off";
          input.placeholder = "Search view...";
          input.addEventListener("input", () => this.handleLeafSearchInput(leaf, input.value));
          input.addEventListener("keydown", (event) => {
              if (event.key === "Enter") {
                  event.preventDefault();
                  this.handleLeafSearchSubmit(leaf, input.value);
              }
              else if (event.key === "Escape") {
                  event.preventDefault();
                  leaf.viewSearchEnabled[leaf.view] = false;
                  leaf.viewSearchFilters[leaf.view] = "";
                  this.refreshLeafContent(leaf);
              }
          });
          wrapper.appendChild(input);
          element.viewSearchWrapper = wrapper;
          element.viewSearchInput = input;
          return { wrapper, input };
      }
      getFilteredSnapshot(view, viewSearchFilter, globalSearchFilter) {
          const applyFilter = (source, searchFilter) => {
              const filter = searchFilter.trim().toLowerCase();
              if (!filter) {
                  return source;
              }
              const compiledQuery = compileSearchQuery(filter);
              const useSimpleSearch = !compiledQuery.ok;
              const ast = compiledQuery.ok ? compiledQuery.ast : null;
              const matchesPlayer = (player) => {
                  const fields = [
                      player.name,
                      player.id,
                      player.team ?? "",
                      player.clan ? `[${player.clan}]` : "",
                  ];
                  return fields.some((field) => field.toString().toLowerCase().includes(filter));
              };
              if (view === "clanmates" || view === "teams") {
                  return source;
              }
              if (view === "attacks") {
                  const players = source.players.map((player) => {
                      const outgoingAttacks = player.outgoingAttacks.filter((attack) => {
                          if (useSimpleSearch) {
                              const fields = [
                                  attack.id,
                                  player.name,
                                  attack.target,
                                  attack.troops.toString(),
                              ];
                              return fields.some((field) => `${field ?? ""}`.toLowerCase().includes(filter));
                          }
                          return matchesSearchQuery(ast, {
                              kind: "attack",
                              attack: {
                                  id: attack.id,
                                  attacker: player.name,
                                  target: attack.target,
                                  troops: attack.troops,
                              },
                          });
                      });
                      return { ...player, outgoingAttacks };
                  });
                  return { ...source, players };
              }
              if (view === "players") {
                  const players = useSimpleSearch
                      ? source.players.filter(matchesPlayer)
                      : source.players.filter((player) => matchesSearchQuery(ast, { kind: "player", player }));
                  return { ...source, players };
              }
              if (view === "ships") {
                  const ships = useSimpleSearch
                      ? source.ships.filter((ship) => {
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
                              ship.destination
                                  ? `${ship.destination.x},${ship.destination.y}`
                                  : "",
                          ];
                          return fields.some((field) => `${field ?? ""}`.toLowerCase().includes(filter));
                      })
                      : source.ships.filter((ship) => matchesSearchQuery(ast, { kind: "ship", ship }));
                  return { ...source, ships };
              }
              if (view === "logs") {
                  const sidebarLogs = source.sidebarLogs?.filter((entry) => {
                      if (!useSimpleSearch) {
                          return matchesSearchQuery(ast, { kind: "log", entry });
                      }
                      const message = entry.message?.toLowerCase() ?? "";
                      const logSource = entry.source?.toLowerCase() ?? "";
                      const level = entry.level?.toLowerCase() ?? "";
                      const tokenText = (entry.tokens ?? [])
                          .map((token) => token.type === "text" ? token.text : (token.label ?? ""))
                          .join(" ")
                          .toLowerCase();
                      return (message.includes(filter) ||
                          logSource.includes(filter) ||
                          level.includes(filter) ||
                          tokenText.includes(filter));
                  }) ?? [];
                  return { ...source, sidebarLogs };
              }
              if (view === "actions") {
                  const state = source.sidebarActions;
                  if (!state) {
                      return source;
                  }
                  const filteredActions = useSimpleSearch
                      ? state.actions.filter((action) => {
                          const description = action.description?.toLowerCase() ?? "";
                          return (action.name.toLowerCase().includes(filter) ||
                              description.includes(filter));
                      })
                      : state.actions.filter((action) => matchesSearchQuery(ast, { kind: "action", action }));
                  const filteredRunning = useSimpleSearch
                      ? state.running.filter((run) => {
                          const fields = [run.name, run.status, run.runMode];
                          return fields.some((field) => `${field ?? ""}`.toLowerCase().includes(filter));
                      })
                      : state.running.filter((run) => matchesSearchQuery(ast, { kind: "runningAction", run }));
                  const sidebarActions = {
                      ...state,
                      actions: filteredActions,
                      running: filteredRunning,
                  };
                  return { ...source, sidebarActions };
              }
              if (view === "runningActions") {
                  const state = source.sidebarActions;
                  if (!state) {
                      return source;
                  }
                  const filteredRunning = useSimpleSearch
                      ? state.running.filter((run) => {
                          const fields = [run.name, run.status, run.runMode];
                          return fields.some((field) => field.toString().toLowerCase().includes(filter));
                      })
                      : state.running.filter((run) => matchesSearchQuery(ast, { kind: "runningAction", run }));
                  const sidebarActions = { ...state, running: filteredRunning };
                  return { ...source, sidebarActions };
              }
              return source;
          };
          const afterViewFilter = applyFilter(this.snapshot, viewSearchFilter);
          return applyFilter(afterViewFilter, globalSearchFilter);
      }
      buildLeafElement(leaf) {
          const wrapper = this.createUiElement("div", "flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-800/70 bg-slate-900/70 shadow-inner");
          wrapper.dataset.nodeId = leaf.id;
          const header = this.createUiElement("div", "flex items-center justify-between gap-2 border-b border-slate-800/70 bg-slate-900/80 px-2 py-2");
          const headerControls = this.createUiElement("div", "df-header-controls flex flex-1 min-w-0 items-center gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap");
          const selectWrapper = this.createUiElement("div", "relative shrink-0");
          const select = this.createUiElement("select", "h-7 min-w-[8rem] max-w-full rounded-md border border-slate-700 bg-slate-900/80 bg-none px-2 py-1 pr-7 text-xs text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/70");
          for (const option of VIEW_OPTIONS) {
              const opt = this.uiDocument.createElement("option");
              opt.value = option.value;
              opt.textContent = option.label;
              select.appendChild(opt);
          }
          select.value = leaf.view;
          selectWrapper.appendChild(select);
          selectWrapper.appendChild(renderIcon("chevron-down", "pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300"));
          headerControls.appendChild(selectWrapper);
          const columnVisibilityButton = this.createUiElement("button", getPanelActionButtonClass());
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
          const viewSearchButton = this.createUiElement("button", getPanelActionButtonClass());
          viewSearchButton.type = "button";
          viewSearchButton.setAttribute("aria-label", "Toggle view search");
          viewSearchButton.appendChild(renderIcon("search", "h-4 w-4"));
          viewSearchButton.addEventListener("click", (event) => {
              this.runWithUiContext(() => {
                  event.preventDefault();
                  event.stopPropagation();
                  this.toggleLeafSearchEnabled(leaf);
              });
          });
          headerControls.appendChild(viewSearchButton);
          const newActionButton = this.createUiElement("button", getPanelActionButtonClass());
          newActionButton.type = "button";
          newActionButton.setAttribute("aria-label", "New action");
          newActionButton.appendChild(renderIcon("plus", "h-4 w-4"));
          newActionButton.addEventListener("click", () => {
              this.runWithUiContext(() => {
                  this.store.createAction();
              });
          });
          headerControls.appendChild(newActionButton);
          const clearLogsButton = this.createUiElement("button", getPanelActionButtonClass("hover:!border-rose-500/70 hover:!text-rose-200"));
          clearLogsButton.type = "button";
          clearLogsButton.setAttribute("aria-label", "Clear logs");
          clearLogsButton.appendChild(renderIcon("trash", "h-4 w-4"));
          clearLogsButton.addEventListener("click", () => {
              this.runWithUiContext(() => {
                  this.store.clearLogs();
              });
          });
          headerControls.appendChild(clearLogsButton);
          const followLogsButton = this.createUiElement("button", getPanelActionButtonClass());
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
                  if (container &&
                      container.dataset.sidebarRole === SidebarRole.LogView) {
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
          select.addEventListener("change", () => this.runWithUiContext(() => {
              leaf.view = select.value;
              this.updateLeafHeaderControls(leaf);
              this.refreshLeafContent(leaf);
          }));
          header.appendChild(headerControls);
          const actions = this.createUiElement("div", "flex items-center gap-2");
          actions.appendChild(this.createActionButton("Split horizontally", "split-horizontal", () => this.splitLeaf(leaf, "horizontal")));
          actions.appendChild(this.createActionButton("Split vertically", "split-vertical", () => this.splitLeaf(leaf, "vertical")));
          actions.appendChild(this.createActionButton("Close panel", "close", () => this.closeLeaf(leaf)));
          header.appendChild(actions);
          const body = this.createUiElement("div", "flex flex-1 min-h-0 flex-col overflow-hidden");
          wrapper.appendChild(header);
          wrapper.appendChild(body);
          leaf.element = {
              wrapper,
              header,
              body,
              viewSelect: select,
              viewSearchButton,
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
      buildGroupElement(group) {
          const wrapper = this.createUiElement("div", group.orientation === "horizontal"
              ? "flex min-h-0 min-w-0 flex-1 flex-col"
              : "flex min-h-0 min-w-0 flex-1 flex-row");
          wrapper.dataset.groupId = group.id;
          group.element = { wrapper };
          const count = group.children.length;
          if (group.sizes.length !== count) {
              this.normalizeSizes(group);
          }
          for (let i = 0; i < count; i++) {
              const child = group.children[i];
              const childWrapper = this.createUiElement("div", "flex min-h-0 min-w-0 flex-1");
              childWrapper.dataset.panelChild = String(i);
              childWrapper.style.flex = `${group.sizes[i] ?? 1} 1 0%`;
              childWrapper.appendChild(this.buildNodeElement(child));
              wrapper.appendChild(childWrapper);
              if (i < count - 1) {
                  const handle = this.createUiElement("div", group.orientation === "horizontal"
                      ? "group relative -my-px flex h-3 w-full cursor-row-resize items-center justify-center rounded-md bg-transparent transition-colors duration-150 hover:bg-sky-500/10"
                      : "group relative -mx-px flex w-3 h-full cursor-col-resize items-center justify-center rounded-md bg-transparent transition-colors duration-150 hover:bg-sky-500/10");
                  handle.appendChild(this.createUiElement("span", group.orientation === "horizontal"
                      ? "h-px w-10 rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60"
                      : "w-px h-10 rounded-full bg-slate-600/60 transition-colors duration-150 group-hover:bg-sky-400/60"));
                  handle.dataset.handleIndex = String(i);
                  handle.addEventListener("pointerdown", (event) => this.runWithUiContext(() => startPanelResize(group, i, event)));
                  wrapper.appendChild(handle);
              }
          }
          return wrapper;
      }
      splitLeaf(leaf, orientation) {
          this.rootNode = splitPanelLeaf(this.rootNode, leaf, orientation);
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
          const viewSearchButton = element.viewSearchButton;
          const supportsSearch = this.isViewSearchSupported(leaf.view);
          viewSearchButton.style.display = supportsSearch ? "" : "none";
          if (supportsSearch) {
              viewSearchButton.removeAttribute("aria-hidden");
              viewSearchButton.tabIndex = 0;
              const enabled = leaf.viewSearchEnabled[leaf.view] ?? false;
              viewSearchButton.setAttribute("aria-pressed", enabled ? "true" : "false");
              viewSearchButton.classList.toggle("border-slate-700/70", !enabled);
              viewSearchButton.classList.toggle("bg-slate-800/70", !enabled);
              viewSearchButton.classList.toggle("text-slate-300", !enabled);
              viewSearchButton.classList.toggle("border-sky-500/70", enabled);
              viewSearchButton.classList.toggle("bg-sky-500/20", enabled);
              viewSearchButton.classList.toggle("text-sky-100", enabled);
              viewSearchButton.title = enabled
                  ? "Disable view search"
                  : "Enable view search";
          }
          else {
              viewSearchButton.setAttribute("aria-hidden", "true");
              viewSearchButton.tabIndex = -1;
              viewSearchButton.removeAttribute("aria-pressed");
              viewSearchButton.removeAttribute("title");
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
              hideColumnVisibilityMenu(this.uiDocument);
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
              followLogsButton.classList.toggle("border-slate-700/70", !followEnabled);
              followLogsButton.classList.toggle("bg-slate-800/70", !followEnabled);
              followLogsButton.classList.toggle("text-slate-300", !followEnabled);
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
          this.runWithUiContext(() => this.doRefreshLeafContent(leaf));
      }
      doRefreshLeafContent(leaf) {
          const element = leaf.element;
          if (!element) {
              return;
          }
          this.updateLeafHeaderControls(leaf);
          const previousContainer = leaf.contentContainer ??
              element.body.querySelector('[data-datafront-view-container="true"]') ??
              element.body.firstElementChild;
          const previousCleanup = leaf.viewCleanup;
          const previousScrollTop = leaf.scrollTop ?? previousContainer?.scrollTop ?? 0;
          const previousScrollLeft = leaf.scrollLeft ?? previousContainer?.scrollLeft ?? 0;
          const lifecycle = this.createViewLifecycle(leaf);
          const viewSearchEnabled = this.isViewSearchSupported(leaf.view) &&
              (leaf.viewSearchEnabled[leaf.view] ?? false);
          const viewSearchFilter = viewSearchEnabled
              ? (leaf.viewSearchFilters[leaf.view] ?? "")
              : "";
          const combinedSearchFilter = [viewSearchFilter, this.searchFilter]
              .map((value) => value.trim())
              .filter(Boolean)
              .join(" ");
          const nextContainer = buildViewContent(leaf, this.getFilteredSnapshot(leaf.view, viewSearchFilter, this.searchFilter), () => this.refreshLeafContent(leaf), { document: this.uiDocument, window: this.uiWindow }, previousContainer ?? undefined, lifecycle.callbacks, this.viewActions, combinedSearchFilter);
          nextContainer.dataset.datafrontViewContainer = "true";
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
          let viewSearchWrapper;
          if (viewSearchEnabled) {
              const searchElements = this.ensureLeafViewSearchElements(leaf);
              viewSearchWrapper = searchElements.wrapper;
              const expected = leaf.viewSearchFilters[leaf.view] ?? "";
              if (searchElements.input.value !== expected) {
                  searchElements.input.value = expected;
              }
          }
          const desiredChildren = viewSearchEnabled
              ? [viewSearchWrapper, nextContainer]
              : [nextContainer];
          const shouldReplace = element.body.childElementCount !== desiredChildren.length ||
              element.body.firstElementChild !== desiredChildren[0] ||
              element.body.lastElementChild !==
                  desiredChildren[desiredChildren.length - 1];
          if (shouldReplace) {
              element.body.replaceChildren(...desiredChildren);
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
      applyPlayerDetailsSelection(playerId) {
          for (const leaf of this.getLeaves()) {
              if (leaf.view !== "player") {
                  continue;
              }
              leaf.selectedPlayerId = playerId;
              this.refreshLeafContent(leaf);
          }
      }
      showPlayerDetails(playerId) {
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
      catch {
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
  function sanitizeTokenFacets(facets) {
      if (!facets || typeof facets !== "object") {
          return undefined;
      }
      const output = {};
      for (const [rawKey, rawValue] of Object.entries(facets)) {
          if (typeof rawKey !== "string") {
              continue;
          }
          const key = rawKey.trim().toLowerCase();
          if (!key) {
              continue;
          }
          if (!Array.isArray(rawValue)) {
              continue;
          }
          const values = rawValue
              .flatMap((entry) => {
              if (typeof entry === "string") {
                  const trimmed = entry.trim();
                  return trimmed ? [trimmed] : [];
              }
              if (typeof entry === "number" && Number.isFinite(entry)) {
                  return [String(entry)];
              }
              return [];
          })
              .filter(Boolean);
          if (values.length === 0) {
              continue;
          }
          output[key] = values;
      }
      return Object.keys(output).length > 0 ? output : undefined;
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
          const facets = sanitizeTokenFacets(token.facets);
          if (!label || !id) {
              continue;
          }
          sanitized.push({ type: token.type, id, label, color, facets });
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
  function logWithConsole(method, level, source, args, options) {
      if (options?.emitToConsole !== false) {
          callConsole(method, args);
      }
      emitLogEntry(level, args, source);
  }
  function createSidebarLogger(source, options) {
      return {
          log: (...args) => logWithConsole("log", "info", source, args, options),
          info: (...args) => logWithConsole("info", "info", source, args, options),
          warn: (...args) => logWithConsole("warn", "warn", source, args, options),
          error: (...args) => logWithConsole("error", "error", source, args, options),
          debug: (...args) => logWithConsole("debug", "debug", source, args, options),
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
          this.visible = true;
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
          this.canvas.style.display = this.visible ? "block" : "none";
          this.updateCanvasSize();
          this.registerEventListeners();
          this.render();
          this.scheduleRender();
      }
      setVisible(visible) {
          this.visible = visible;
          if (!this.active) {
              return;
          }
          this.canvas.style.display = this.visible ? "block" : "none";
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
          const sidebar = document.getElementById(SIDEBAR_ID);
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
          const sidebar = document.getElementById(SIDEBAR_ID);
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
          this.visible = true;
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
          this.canvas.style.display = this.visible ? "block" : "none";
          this.updateCanvasSize();
          this.render();
          this.scheduleRender();
      }
      setVisible(visible) {
          this.visible = visible;
          if (!this.active) {
              return;
          }
          this.canvas.style.display = this.visible ? "block" : "none";
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
          const sidebar = document.getElementById(SIDEBAR_ID);
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
          const normalized = this.normalizeUnitType(trajectory.unitType);
          if (normalized === "mirvwarhead") {
              return "mirv-warhead";
          }
          if (normalized === "mirv") {
              return "mirv";
          }
          return "standard";
      }
      normalizeUnitType(unitType) {
          if (typeof unitType !== "string") {
              return null;
          }
          const normalized = unitType.replace(/\s+/g, "").toLowerCase();
          return normalized.length > 0 ? normalized : null;
      }
      normalizeColor(color) {
          if (color && color.trim()) {
              return color.trim();
          }
          return "rgb(56, 189, 248)";
      }
  }
  class MissileImpactOverlay {
      constructor(options) {
          this.options = options;
          this.rafHandle = null;
          this.trajectories = [];
          this.teamColors = new Map();
          this.attached = false;
          this.active = false;
          this.hostElement = null;
          this.cssWidth = 0;
          this.cssHeight = 0;
          this.pixelRatio = 1;
          this.offsetLeft = 0;
          this.offsetTop = 0;
          this.visible = true;
          if (typeof document === "undefined") {
              throw new Error("MissileImpactOverlay requires a browser environment");
          }
          this.canvas = document.createElement("canvas");
          this.canvas.style.position = "fixed";
          this.canvas.style.left = "0";
          this.canvas.style.top = "0";
          this.canvas.style.width = "100%";
          this.canvas.style.height = "100%";
          this.canvas.style.pointerEvents = "none";
          this.canvas.style.zIndex = "28";
          this.canvas.style.display = "none";
          this.context = this.canvas.getContext("2d");
      }
      setTrajectories(trajectories) {
          this.trajectories = trajectories.map((entry) => ({ ...entry }));
          for (const trajectory of this.trajectories) {
              const teamKey = this.normalizeTeamKey(trajectory.ownerTeam);
              if (!teamKey || this.teamColors.has(teamKey)) {
                  continue;
              }
              this.teamColors.set(teamKey, this.normalizeColor(trajectory.color));
          }
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
          this.canvas.style.display = this.visible ? "block" : "none";
          this.updateCanvasSize();
          this.render();
          this.scheduleRender();
      }
      setVisible(visible) {
          this.visible = visible;
          if (!this.active) {
              return;
          }
          this.canvas.style.display = this.visible ? "block" : "none";
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
          if (!this.active || this.trajectories.length === 0) {
              return;
          }
          const transform = this.options.resolveTransform();
          if (!transform) {
              return;
          }
          const nowMs = performance.now();
          const renderedTargets = new Set();
          for (const trajectory of this.trajectories) {
              if (trajectory.isLocalOwner || trajectory.isLocalTeam) {
                  // OpenFront already shows local/team impact rings.
                  continue;
              }
              const impact = this.resolveImpactRadii(trajectory.unitType);
              if (!impact) {
                  continue;
              }
              const teamKey = this.normalizeTeamKey(trajectory.ownerTeam) ??
                  (trajectory.ownerId ? `player:${trajectory.ownerId}` : "unknown");
              const dedupeKey = `${teamKey}:${impact.inner}:${impact.outer}:${trajectory.target.x}:${trajectory.target.y}`;
              if (renderedTargets.has(dedupeKey)) {
                  continue;
              }
              renderedTargets.add(dedupeKey);
              const target = this.toCellCenter(trajectory.target);
              const color = this.resolveTeamColor(teamKey, trajectory.color);
              this.drawImpactRing(ctx, transform, target, impact, color, this.hashString(teamKey) % 360, nowMs);
          }
          this.maskSidebarRegion();
      }
      maskSidebarRegion() {
          if (!this.context || typeof document === "undefined") {
              return;
          }
          const sidebar = document.getElementById(SIDEBAR_ID);
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
      resolveImpactRadii(unitType) {
          const normalized = this.normalizeUnitType(unitType);
          if (!normalized) {
              return null;
          }
          switch (normalized) {
              case "atombomb":
                  return { inner: 12, outer: 30 };
              case "hydrogenbomb":
                  return { inner: 80, outer: 100 };
              case "mirvwarhead":
              case "mirv":
                  return { inner: 12, outer: 18 };
              default:
                  return null;
          }
      }
      drawImpactRing(ctx, transform, targetWorld, radii, color, dashSeed, nowMs) {
          const center = transform.worldToScreenCoordinates(targetWorld);
          if (!this.isFinitePoint(center)) {
              return;
          }
          const scale = Math.max(transform.scale, 0.01);
          const innerRadius = Math.max(3, radii.inner * scale);
          const outerRadius = Math.max(innerRadius + 2, radii.outer * scale);
          const circumference = 2 * Math.PI * outerRadius;
          const numDash = Math.max(12, Math.floor(outerRadius / 6));
          const dashSize = circumference / (numDash * 2);
          const dashPeriod = dashSize * 2;
          const animatedOffset = ((nowMs / 1000) * 20 * scale) % dashPeriod;
          const seededOffset = ((dashSeed % 360) / 360) * dashPeriod;
          ctx.save();
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.9;
          ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 0.24;
          ctx.fill();
          ctx.beginPath();
          ctx.lineWidth = Math.max(2, scale);
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.85;
          ctx.setLineDash([dashSize, dashSize]);
          ctx.lineDashOffset = seededOffset + animatedOffset;
          ctx.arc(center.x, center.y, outerRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
      }
      normalizeUnitType(unitType) {
          if (typeof unitType !== "string") {
              return null;
          }
          const normalized = unitType.replace(/\s+/g, "").toLowerCase();
          return normalized.length > 0 ? normalized : null;
      }
      normalizeTeamKey(teamId) {
          if (typeof teamId !== "string") {
              return null;
          }
          const normalized = teamId.trim().toLowerCase();
          return normalized.length > 0 ? normalized : null;
      }
      resolveTeamColor(teamKey, fallbackColor) {
          const known = this.teamColors.get(teamKey);
          if (known) {
              return known;
          }
          const normalizedFallback = this.normalizeColor(fallbackColor);
          this.teamColors.set(teamKey, normalizedFallback);
          return normalizedFallback;
      }
      hashString(input) {
          let hash = 0;
          for (let i = 0; i < input.length; i += 1) {
              hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
          }
          return hash;
      }
      isFinitePoint(point) {
          return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
      }
      toCellCenter(point) {
          return { x: point.x + 0.5, y: point.y + 0.5 };
      }
      normalizeColor(color) {
          if (color && color.trim()) {
              return color.trim();
          }
          return "rgb(56, 189, 248)";
      }
  }
  class TransportDestinationOverlay {
      constructor(options) {
          this.options = options;
          this.rafHandle = null;
          this.destinations = [];
          this.attached = false;
          this.active = false;
          this.hostElement = null;
          this.cssWidth = 0;
          this.cssHeight = 0;
          this.pixelRatio = 1;
          this.offsetLeft = 0;
          this.offsetTop = 0;
          this.visible = true;
          if (typeof document === "undefined") {
              throw new Error("TransportDestinationOverlay requires a browser environment");
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
          this.colorContext = document.createElement("canvas").getContext("2d");
      }
      setDestinations(destinations) {
          this.destinations = destinations
              .filter((entry) => Number.isFinite(entry.x) &&
              Number.isFinite(entry.y) &&
              Number.isFinite(entry.count) &&
              entry.count > 0)
              .map((entry) => ({
              ...entry,
              count: Math.max(1, Math.floor(entry.count)),
          }));
      }
      clear() {
          this.destinations = [];
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
          this.canvas.style.display = this.visible ? "block" : "none";
          this.updateCanvasSize();
          this.render();
          this.scheduleRender();
      }
      setVisible(visible) {
          this.visible = visible;
          if (!this.active) {
              return;
          }
          this.canvas.style.display = this.visible ? "block" : "none";
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
          else if (this.canvas.style.position !== "fixed") {
              this.canvas.style.position = "fixed";
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
          if (!this.active || this.destinations.length === 0) {
              return;
          }
          const transform = this.options.resolveTransform?.();
          if (!transform) {
              return;
          }
          const nowMs = typeof performance !== "undefined" &&
              typeof performance.now === "function"
              ? performance.now()
              : Date.now();
          for (let index = 0; index < this.destinations.length; index += 1) {
              const destination = this.destinations[index];
              const center = transform.worldToScreenCoordinates(this.toCellCenter(destination));
              if (!this.isFinitePoint(center)) {
                  continue;
              }
              const radius = this.resolveMarkerRadius(destination.count);
              const markerVisible = this.isScreenPointInsideViewport(center, radius);
              const labelVisible = this.isScreenPointInsideViewport(center);
              if (!markerVisible && !labelVisible) {
                  continue;
              }
              const pulse = 0.65 + 0.35 * Math.sin(nowMs / 600 + index * 0.9);
              const color = this.normalizeColor(destination.color);
              ctx.save();
              ctx.strokeStyle = color;
              ctx.fillStyle = color;
              if (markerVisible) {
                  ctx.globalAlpha = 0.22 + pulse * 0.16;
                  ctx.beginPath();
                  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.globalAlpha = 0.92;
                  ctx.lineWidth = Math.max(2, Math.min(4, radius / 3));
                  ctx.beginPath();
                  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.strokeStyle = "rgba(15, 23, 42, 0.9)";
                  ctx.globalAlpha = 0.85;
                  ctx.lineWidth = 1.25;
                  ctx.beginPath();
                  ctx.arc(center.x, center.y, Math.max(2, radius * 0.45), 0, Math.PI * 2);
                  ctx.stroke();
                  if (destination.count > 1) {
                      const fontSize = Math.max(10, Math.min(14, radius + 3));
                      ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
                      ctx.textAlign = "center";
                      ctx.textBaseline = "middle";
                      ctx.lineWidth = 3;
                      ctx.globalAlpha = 0.95;
                      ctx.strokeStyle = "rgba(15, 23, 42, 0.95)";
                      ctx.strokeText(String(destination.count), center.x, center.y);
                      ctx.fillStyle = "#f8fafc";
                      ctx.fillText(String(destination.count), center.x, center.y);
                  }
              }
              if (labelVisible) {
                  this.drawLabel(ctx, center, radius, destination.label, color, transform.scale);
              }
              ctx.restore();
          }
          this.maskSidebarRegion();
      }
      maskSidebarRegion() {
          if (!this.context || typeof document === "undefined") {
              return;
          }
          const sidebar = document.getElementById(SIDEBAR_ID);
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
      resolveMarkerRadius(count) {
          const safeCount = Math.max(1, Math.floor(count));
          return Math.min(18, 6 + Math.log2(safeCount) * 3);
      }
      drawLabel(ctx, center, radius, rawLabel, accentColor, transformScale) {
          const zoomScale = this.resolveLabelZoomScale(transformScale);
          if (zoomScale <= 0.36) {
              return;
          }
          const label = this.normalizeLabel(rawLabel, this.resolveLabelMaxChars(zoomScale));
          if (!label) {
              return;
          }
          const fontSize = Math.max(8, Math.min(12, Math.round(11 * zoomScale)));
          const horizontalPadding = Math.max(4, Math.min(8, Math.round(6 * zoomScale)));
          const boxHeight = Math.max(13, Math.min(22, Math.round(18 * zoomScale)));
          const offset = Math.max(8, Math.round((radius + 12) * zoomScale));
          const centerY = Math.max(boxHeight / 2 + 2, center.y - offset);
          ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const textWidth = ctx.measureText(label).width;
          const boxWidth = Math.max(28, Math.ceil(textWidth + horizontalPadding * 2));
          const boxX = center.x - boxWidth / 2;
          const boxY = centerY - boxHeight / 2;
          const cornerRadius = Math.max(3, Math.min(6, Math.round(5 * zoomScale)));
          this.roundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, cornerRadius);
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.shadowColor = "rgba(2, 6, 23, 0.35)";
          ctx.shadowBlur = Math.max(4, 8 * zoomScale);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = Math.max(1, 3 * zoomScale);
          ctx.globalAlpha = 0.96;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          this.roundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, cornerRadius);
          ctx.strokeStyle = this.mixLabelBorderColor(accentColor);
          ctx.globalAlpha = 0.55;
          ctx.lineWidth = Math.max(0.75, Math.min(1.1, 0.9 * zoomScale));
          ctx.stroke();
          ctx.fillStyle = "#e2e8f0";
          ctx.globalAlpha = 0.98;
          ctx.fillText(label, center.x, centerY + 0.5);
      }
      roundedRectPath(ctx, x, y, width, height, radius) {
          const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
          ctx.beginPath();
          ctx.moveTo(x + safeRadius, y);
          ctx.lineTo(x + width - safeRadius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
          ctx.lineTo(x + width, y + height - safeRadius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
          ctx.lineTo(x + safeRadius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
          ctx.lineTo(x, y + safeRadius);
          ctx.quadraticCurveTo(x, y, x + safeRadius, y);
          ctx.closePath();
      }
      normalizeLabel(rawLabel, maxChars) {
          if (typeof rawLabel !== "string") {
              return null;
          }
          const trimmed = rawLabel.trim();
          if (!trimmed) {
              return null;
          }
          if (trimmed.length <= maxChars) {
              return trimmed;
          }
          return `${trimmed.slice(0, maxChars - 1)}…`;
      }
      resolveLabelZoomScale(transformScale) {
          const numericScale = Number.isFinite(transformScale) ? transformScale : 1;
          return Math.max(0.35, Math.min(1, numericScale / 1.8));
      }
      resolveLabelMaxChars(zoomScale) {
          const clamped = Math.max(0.35, Math.min(1, zoomScale));
          return Math.max(10, Math.min(34, Math.round(10 + clamped * 24)));
      }
      mixLabelBorderColor(accentColor) {
          const parsed = this.parseColor(accentColor);
          if (!parsed) {
              return "rgba(148, 163, 184, 0.75)";
          }
          const blendWith = { r: 148, g: 163, b: 184 };
          const weight = 0.5;
          const r = Math.round(parsed.r * weight + blendWith.r * (1 - weight));
          const g = Math.round(parsed.g * weight + blendWith.g * (1 - weight));
          const b = Math.round(parsed.b * weight + blendWith.b * (1 - weight));
          return `rgba(${r}, ${g}, ${b}, 0.75)`;
      }
      parseColor(color) {
          if (!color || typeof color !== "string") {
              return null;
          }
          const context = this.colorContext;
          if (!context) {
              return null;
          }
          try {
              context.fillStyle = "#000";
              context.fillStyle = color;
              const computed = context.fillStyle;
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
      isFinitePoint(point) {
          return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
      }
      isScreenPointInsideViewport(point, padding = 0) {
          if (this.cssWidth <= 0 || this.cssHeight <= 0) {
              return false;
          }
          return (point.x >= this.offsetLeft - padding &&
              point.x <= this.offsetLeft + this.cssWidth + padding &&
              point.y >= this.offsetTop - padding &&
              point.y <= this.offsetTop + this.cssHeight + padding);
      }
      toCellCenter(point) {
          return { x: point.x + 0.5, y: point.y + 0.5 };
      }
      normalizeColor(color) {
          if (typeof color === "string" && color.trim().length > 0) {
              return color.trim();
          }
          return "rgb(56, 189, 248)";
      }
  }
  class MinPriorityQueue {
      constructor() {
          this.heap = [];
      }
      enqueue(item) {
          this.heap.push(item);
          this.bubbleUp(this.heap.length - 1);
      }
      dequeue() {
          if (this.heap.length === 0) {
              return undefined;
          }
          const root = this.heap[0];
          const tail = this.heap.pop();
          if (this.heap.length > 0 && tail !== undefined) {
              this.heap[0] = tail;
              this.bubbleDown(0);
          }
          return root;
      }
      isEmpty() {
          return this.heap.length === 0;
      }
      bubbleUp(index) {
          while (index > 0) {
              const parent = Math.floor((index - 1) / 2);
              if (this.heap[parent].fScore <= this.heap[index].fScore) {
                  break;
              }
              [this.heap[parent], this.heap[index]] = [
                  this.heap[index],
                  this.heap[parent],
              ];
              index = parent;
          }
      }
      bubbleDown(index) {
          const length = this.heap.length;
          while (true) {
              const left = index * 2 + 1;
              const right = left + 1;
              let smallest = index;
              if (left < length &&
                  this.heap[left].fScore < this.heap[smallest].fScore) {
                  smallest = left;
              }
              if (right < length &&
                  this.heap[right].fScore < this.heap[smallest].fScore) {
                  smallest = right;
              }
              if (smallest === index) {
                  return;
              }
              [this.heap[index], this.heap[smallest]] = [
                  this.heap[smallest],
                  this.heap[index],
              ];
              index = smallest;
          }
      }
  }
  class TradeRouteOverlay {
      constructor(options) {
          this.options = options;
          this.cleanupCallbacks = [];
          this.pointer = null;
          this.attached = false;
          this.active = false;
          this.hostElement = null;
          this.cssWidth = 0;
          this.cssHeight = 0;
          this.pixelRatio = 1;
          this.offsetLeft = 0;
          this.offsetTop = 0;
          this.rafHandle = null;
          this.portSummaries = [];
          this.portsRevision = 0;
          this.routes = [];
          this.labelPool = new Map();
          this.lastLocalSmallId = null;
          this.lastComputation = {
              pointerRef: null,
              candidateRef: null,
              portsRevision: -1,
              localSmallId: null,
          };
          this.visible = true;
          if (typeof document === "undefined") {
              throw new Error("TradeRouteOverlay requires a browser environment");
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
          this.labelContainer = document.createElement("div");
          this.labelContainer.style.position = "fixed";
          this.labelContainer.style.left = "0";
          this.labelContainer.style.top = "0";
          this.labelContainer.style.width = "100%";
          this.labelContainer.style.height = "100%";
          this.labelContainer.style.pointerEvents = "none";
          this.labelContainer.style.zIndex = "31";
          this.labelContainer.style.display = "none";
          this.labelContainer.style.fontFamily =
              'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      }
      setPortSummaries(summaries) {
          const next = summaries.map((summary) => ({ ...summary }));
          if (!this.arePortSummariesEqual(next)) {
              this.portSummaries = next;
              this.portsRevision += 1;
          }
      }
      setLocalPlayerSmallId(smallId) {
          if (this.lastLocalSmallId !== smallId) {
              this.lastLocalSmallId = smallId;
              this.lastComputation.pointerRef = null;
          }
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
          this.canvas.style.display = this.visible ? "block" : "none";
          this.labelContainer.style.display = this.visible ? "block" : "none";
          this.updateCanvasSize();
          this.registerEventListeners();
          this.render();
          this.scheduleRender();
      }
      setVisible(visible) {
          this.visible = visible;
          if (!this.active) {
              return;
          }
          const display = this.visible ? "block" : "none";
          this.canvas.style.display = display;
          this.labelContainer.style.display = display;
      }
      disable() {
          if (!this.active) {
              return;
          }
          this.active = false;
          this.canvas.style.display = "none";
          this.labelContainer.style.display = "none";
          this.cancelRender();
          this.cleanupEventListeners();
          this.routes = [];
          this.hideAllLabels();
          this.clearCanvas();
      }
      dispose() {
          this.disable();
          if (this.attached) {
              this.canvas.remove();
              this.labelContainer.remove();
              this.attached = false;
              this.hostElement = null;
          }
      }
      clear() {
          this.routes = [];
          this.hideAllLabels();
          this.clearCanvas();
          this.lastComputation = {
              pointerRef: null,
              candidateRef: null,
              portsRevision: -1,
              localSmallId: this.lastLocalSmallId,
          };
      }
      arePortSummariesEqual(next) {
          if (this.portSummaries.length !== next.length) {
              return false;
          }
          const current = new Map(this.portSummaries.map((entry) => [entry.id, entry]));
          for (const summary of next) {
              const existing = current.get(summary.id);
              if (!existing) {
                  return false;
              }
              if (existing.tileRef !== summary.tileRef ||
                  existing.ownerId !== summary.ownerId ||
                  existing.ownerSmallId !== summary.ownerSmallId ||
                  existing.ownerColor !== summary.ownerColor ||
                  existing.includeFromLocal !== summary.includeFromLocal ||
                  existing.includeToLocal !== summary.includeToLocal) {
                  return false;
              }
          }
          return true;
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
                  // Ignore cleanup failures.
              }
          }
          this.cleanupCallbacks = [];
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
          if (this.labelContainer.parentElement !== container) {
              this.labelContainer.remove();
              container.appendChild(this.labelContainer);
          }
          this.hostElement = container;
          this.attached = true;
          this.ensureContainerPositioned(container);
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
              if (this.labelContainer.style.position !== "absolute") {
                  this.labelContainer.style.position = "absolute";
              }
              this.ensureContainerPositioned(host);
          }
          else {
              if (this.canvas.style.position !== "fixed") {
                  this.canvas.style.position = "fixed";
              }
              if (this.labelContainer.style.position !== "fixed") {
                  this.labelContainer.style.position = "fixed";
              }
          }
          if (this.canvas.style.left !== `${relativeLeft}px`) {
              this.canvas.style.left = `${relativeLeft}px`;
          }
          if (this.canvas.style.top !== `${relativeTop}px`) {
              this.canvas.style.top = `${relativeTop}px`;
          }
          if (this.labelContainer.style.left !== `${relativeLeft}px`) {
              this.labelContainer.style.left = `${relativeLeft}px`;
          }
          if (this.labelContainer.style.top !== `${relativeTop}px`) {
              this.labelContainer.style.top = `${relativeTop}px`;
          }
          if (this.labelContainer.style.width !== `${width}px`) {
              this.labelContainer.style.width = `${width}px`;
          }
          if (this.labelContainer.style.height !== `${height}px`) {
              this.labelContainer.style.height = `${height}px`;
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
              this.hideAllLabels();
              return;
          }
          const transform = this.options.resolveTransform();
          const uiState = this.options.resolveUiState();
          if (!transform || !this.isPortSelected(uiState)) {
              this.routes = [];
              this.hideAllLabels();
              return;
          }
          const pointer = this.resolvePointer(transform);
          if (!pointer) {
              this.routes = [];
              this.hideAllLabels();
              return;
          }
          const game = this.options.resolveGame();
          if (!game) {
              this.routes = [];
              this.hideAllLabels();
              return;
          }
          const pointerRef = this.toTileRef(game, pointer);
          if (pointerRef === null) {
              this.routes = [];
              this.hideAllLabels();
              return;
          }
          const localSmallId = this.options.resolveLocalPlayerSmallId?.() ?? null;
          const candidateRef = this.findPortSpawnRef(game, pointerRef, localSmallId);
          if (this.lastComputation.pointerRef !== pointerRef ||
              this.lastComputation.candidateRef !== candidateRef ||
              this.lastComputation.portsRevision !== this.portsRevision ||
              this.lastComputation.localSmallId !== localSmallId) {
              this.routes = this.computeRoutes(game, candidateRef);
              this.lastComputation = {
                  pointerRef,
                  candidateRef,
                  portsRevision: this.portsRevision,
                  localSmallId,
              };
          }
          this.drawRoutes(transform);
          this.updateLabels(transform);
          this.maskSidebarRegion();
      }
      resolvePointer(transform) {
          let pointer = this.pointer;
          const rect = transform.boundingRect?.();
          if (pointer && rect && !this.isPointerInside(rect, pointer)) {
              pointer = null;
          }
          if (pointer && this.isPointerOverSidebar(pointer)) {
              pointer = null;
          }
          return pointer ?? null;
      }
      toTileRef(game, pointer) {
          const transform = this.options.resolveTransform?.();
          if (!transform) {
              return null;
          }
          const world = transform.screenToWorldCoordinates(pointer.x, pointer.y);
          if (!this.isFinitePoint(world)) {
              return null;
          }
          const tileX = Math.floor(world.x);
          const tileY = Math.floor(world.y);
          if (!Number.isFinite(tileX) || !Number.isFinite(tileY)) {
              return null;
          }
          if (!game.isValidCoord(tileX, tileY)) {
              return null;
          }
          try {
              return game.ref(tileX, tileY);
          }
          catch {
              return null;
          }
      }
      computeRoutes(game, candidateRef) {
          if (candidateRef === null) {
              return [];
          }
          const results = [];
          const destPoint = {
              x: game.x(candidateRef) + 0.5,
              y: game.y(candidateRef) + 0.5,
          };
          for (const port of this.portSummaries) {
              if (!port.includeFromLocal || !port.includeToLocal) {
                  continue;
              }
              if (port.tileRef === candidateRef) {
                  continue;
              }
              const pathRefs = this.findRoutePath(game, port.tileRef, candidateRef);
              if (!pathRefs || pathRefs.length < 2) {
                  continue;
              }
              const distance = pathRefs.length - 1;
              if (distance <= 0) {
                  continue;
              }
              const path = pathRefs.map((ref) => ({
                  x: game.x(ref) + 0.5,
                  y: game.y(ref) + 0.5,
              }));
              const midpoint = path[Math.floor(path.length / 2)] ?? destPoint;
              const ownerColor = this.normalizeColor(port.ownerColor);
              const resolvedOwnerId = typeof port.ownerId === "string"
                  ? port.ownerId.trim()
                  : `${port.ownerId}`;
              const ownerName = port.ownerName?.trim() ||
                  (resolvedOwnerId ? `Player ${resolvedOwnerId}` : "Unknown player");
              const baseGold = this.computeBaseGold(game, distance);
              results.push({
                  portId: port.id,
                  ownerColor,
                  ownerName,
                  distance,
                  baseGold,
                  path,
                  midpoint,
                  includeFromLocal: port.includeFromLocal,
                  includeToLocal: port.includeToLocal,
              });
          }
          return results;
      }
      drawRoutes(transform) {
          const ctx = this.context;
          if (!ctx) {
              return;
          }
          ctx.save();
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = 2.4;
          for (const route of this.routes) {
              if (route.path.length < 2) {
                  continue;
              }
              ctx.save();
              ctx.strokeStyle = route.ownerColor;
              ctx.globalAlpha = 0.85;
              ctx.beginPath();
              let started = false;
              for (const point of route.path) {
                  const screen = transform.worldToScreenCoordinates(point);
                  if (!this.isFinitePoint(screen)) {
                      started = false;
                      break;
                  }
                  if (!started) {
                      ctx.moveTo(screen.x, screen.y);
                      started = true;
                  }
                  else {
                      ctx.lineTo(screen.x, screen.y);
                  }
              }
              if (started) {
                  ctx.stroke();
              }
              ctx.restore();
              this.drawEndpoint(transform, route.path[0], route.ownerColor, 0.6);
              this.drawEndpoint(transform, route.path[route.path.length - 1], route.ownerColor, 0.85);
          }
          ctx.restore();
      }
      drawEndpoint(transform, point, color, alpha) {
          const ctx = this.context;
          if (!ctx) {
              return;
          }
          const screen = transform.worldToScreenCoordinates(point);
          if (!this.isFinitePoint(screen)) {
              return;
          }
          ctx.save();
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          const radius = Math.max(2.8, 4.5 - transform.scale * 0.15);
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
      }
      updateLabels(transform) {
          const used = new Set();
          for (const route of this.routes) {
              const key = route.portId;
              const entry = this.ensureLabelEntry(key);
              used.add(key);
              entry.distanceText.textContent = `${route.distance.toLocaleString()} tiles`;
              entry.usernameText.textContent = route.ownerName;
              entry.goldText.textContent = `${route.baseGold.toLocaleString()} gold`;
              entry.container.style.color = route.ownerColor;
              const midpointScreen = transform.worldToScreenCoordinates(route.midpoint);
              if (!this.isFinitePoint(midpointScreen)) {
                  entry.container.style.display = "none";
                  continue;
              }
              entry.container.style.left = `${midpointScreen.x}px`;
              entry.container.style.top = `${midpointScreen.y}px`;
              entry.container.style.display = "inline-flex";
          }
          for (const [key, entry] of this.labelPool.entries()) {
              if (used.has(key)) {
                  continue;
              }
              entry.container.remove();
              this.labelPool.delete(key);
          }
      }
      ensureLabelEntry(key) {
          let entry = this.labelPool.get(key);
          if (!entry) {
              entry = this.createRouteLabel();
              this.labelPool.set(key, entry);
          }
          return entry;
      }
      createRouteLabel() {
          const container = document.createElement("div");
          container.style.position = "absolute";
          container.style.padding = "4px 8px";
          container.style.borderRadius = "6px";
          container.style.fontSize = "0.7rem";
          container.style.fontWeight = "600";
          container.style.letterSpacing = "0.02em";
          container.style.color = "#e2e8f0";
          container.style.background = "rgba(15, 23, 42, 0.85)";
          container.style.boxShadow = "0 4px 12px rgba(2, 6, 23, 0.35)";
          container.style.whiteSpace = "nowrap";
          container.style.transform = "translate(-50%, -50%)";
          container.style.display = "none";
          container.style.alignItems = "center";
          container.style.gap = "6px";
          const shipIcon = createElement$9(Ship);
          shipIcon.setAttribute("aria-hidden", "true");
          shipIcon.style.width = "14px";
          shipIcon.style.height = "14px";
          shipIcon.style.flexShrink = "0";
          shipIcon.style.color = "inherit";
          const distanceText = document.createElement("span");
          distanceText.textContent = "";
          const distanceSeparator = document.createElement("span");
          distanceSeparator.textContent = "•";
          distanceSeparator.setAttribute("aria-hidden", "true");
          const goldIcon = createElement$9(CirclePoundSterling);
          goldIcon.setAttribute("aria-hidden", "true");
          goldIcon.style.width = "14px";
          goldIcon.style.height = "14px";
          goldIcon.style.flexShrink = "0";
          goldIcon.style.color = "inherit";
          const goldText = document.createElement("span");
          goldText.textContent = "";
          const goldSeparator = document.createElement("span");
          goldSeparator.textContent = "•";
          goldSeparator.setAttribute("aria-hidden", "true");
          const usernameText = document.createElement("span");
          usernameText.textContent = "";
          container.appendChild(shipIcon);
          container.appendChild(distanceText);
          container.appendChild(distanceSeparator);
          container.appendChild(goldIcon);
          container.appendChild(goldText);
          container.appendChild(goldSeparator);
          container.appendChild(usernameText);
          this.labelContainer.appendChild(container);
          return { container, distanceText, usernameText, goldText };
      }
      hideAllLabels() {
          for (const entry of this.labelPool.values()) {
              entry.container.style.display = "none";
          }
      }
      findPortSpawnRef(game, pointerRef, localSmallId) {
          if (localSmallId === null) {
              return null;
          }
          const originX = game.x(pointerRef);
          const originY = game.y(pointerRef);
          const radius = 20;
          let bestRef = null;
          let bestDistance = Number.POSITIVE_INFINITY;
          for (let dx = -radius; dx <= radius; dx++) {
              const x = originX + dx;
              for (let dy = -radius; dy <= radius; dy++) {
                  const y = originY + dy;
                  const manhattan = Math.abs(dx) + Math.abs(dy);
                  if (manhattan > radius) {
                      continue;
                  }
                  if (!game.isValidCoord(x, y)) {
                      continue;
                  }
                  let ref;
                  try {
                      ref = game.ref(x, y);
                  }
                  catch {
                      continue;
                  }
                  if (this.isWaterTile(game, ref)) {
                      continue;
                  }
                  let ownerIdMatches = false;
                  try {
                      ownerIdMatches = game.ownerID(ref) === localSmallId;
                  }
                  catch {
                      continue;
                  }
                  if (!ownerIdMatches) {
                      continue;
                  }
                  if (!this.hasAdjacentWater(game, ref)) {
                      continue;
                  }
                  if (manhattan < bestDistance) {
                      bestDistance = manhattan;
                      bestRef = ref;
                  }
              }
          }
          return bestRef;
      }
      isWaterTile(game, ref) {
          try {
              return game.isWater(ref);
          }
          catch {
              return false;
          }
      }
      hasAdjacentWater(game, ref) {
          try {
              return game.neighbors(ref).some((neighbor) => game.isWater(neighbor));
          }
          catch {
              return false;
          }
      }
      findRoutePath(game, startRef, destRef) {
          if (startRef === destRef) {
              return [startRef];
          }
          const open = new MinPriorityQueue();
          const cameFrom = new Map();
          const gScore = new Map();
          const visited = new Set();
          gScore.set(startRef, 0);
          open.enqueue({
              ref: startRef,
              fScore: this.heuristic(game, startRef, destRef),
          });
          const maxIterations = 75000;
          let iterations = 0;
          while (!open.isEmpty() && iterations < maxIterations) {
              iterations += 1;
              const current = open.dequeue();
              if (!current) {
                  break;
              }
              const currentRef = current.ref;
              if (currentRef === destRef) {
                  return this.reconstructPath(cameFrom, currentRef);
              }
              if (visited.has(currentRef)) {
                  continue;
              }
              visited.add(currentRef);
              let neighbors;
              try {
                  neighbors = game.neighbors(currentRef);
              }
              catch {
                  continue;
              }
              for (const neighbor of neighbors) {
                  if (!this.isTraversable(game, currentRef, neighbor, startRef, destRef)) {
                      continue;
                  }
                  const stepCost = this.computeTraversalCost(game, neighbor);
                  if (!Number.isFinite(stepCost) || stepCost <= 0) {
                      continue;
                  }
                  const currentCost = gScore.get(currentRef) ?? Infinity;
                  const tentative = currentCost + stepCost;
                  if (tentative >= (gScore.get(neighbor) ?? Infinity)) {
                      continue;
                  }
                  cameFrom.set(neighbor, currentRef);
                  gScore.set(neighbor, tentative);
                  open.enqueue({
                      ref: neighbor,
                      fScore: tentative + this.heuristic(game, neighbor, destRef),
                  });
              }
          }
          return null;
      }
      reconstructPath(cameFrom, current) {
          const path = [current];
          while (cameFrom.has(current)) {
              current = cameFrom.get(current);
              path.unshift(current);
          }
          return path;
      }
      isTraversable(game, from, to, startRef, destRef) {
          if (to === destRef) {
              return true;
          }
          if (from === startRef) {
              try {
                  return game.isWater(to);
              }
              catch {
                  return false;
              }
          }
          try {
              return game.isWater(from) && game.isWater(to);
          }
          catch {
              return false;
          }
      }
      heuristic(game, from, to) {
          const distance = this.computeManhattanDistance(game, from, to);
          if (!Number.isFinite(distance) || distance <= 0) {
              return 0;
          }
          return distance * 2;
      }
      computeManhattanDistance(game, from, to) {
          try {
              if (typeof game.manhattanDist === "function") {
                  const resolved = game.manhattanDist(from, to);
                  if (Number.isFinite(resolved)) {
                      return Math.max(0, resolved);
                  }
              }
          }
          catch {
              // fall back to coordinate-based distance
          }
          try {
              const dx = Math.abs(game.x(from) - game.x(to));
              const dy = Math.abs(game.y(from) - game.y(to));
              const sum = dx + dy;
              return Number.isFinite(sum) ? Math.max(0, sum) : 0;
          }
          catch {
              return 0;
          }
      }
      computeTraversalCost(game, ref) {
          try {
              if (typeof game.cost === "function") {
                  const resolved = game.cost(ref);
                  if (Number.isFinite(resolved) && resolved > 0) {
                      return resolved;
                  }
              }
          }
          catch {
              // fall through to default cost
          }
          return 1;
      }
      computeBaseGold(game, distance) {
          if (distance <= 0) {
              return 0;
          }
          const configBaseGold = this.computeBaseGoldFromGameConfig(game, distance);
          if (configBaseGold !== null) {
              return configBaseGold;
          }
          const ratio = distance / (distance + 50);
          const base = Math.floor(100000 * ratio + 100 * distance);
          return base;
      }
      computeBaseGoldFromGameConfig(game, distance) {
          let config;
          try {
              config = typeof game.config === "function" ? game.config() : null;
          }
          catch {
              return null;
          }
          const tradeShipGold = config?.tradeShipGold;
          if (typeof tradeShipGold !== "function") {
              return null;
          }
          let result;
          try {
              result = tradeShipGold.call(config, distance, 1);
          }
          catch {
              return null;
          }
          if (typeof result === "number" && Number.isFinite(result)) {
              return Math.floor(result);
          }
          if (typeof result === "bigint") {
              const numeric = Number(result);
              return Number.isFinite(numeric) ? Math.floor(numeric) : null;
          }
          return null;
      }
      isPortSelected(uiState) {
          const selection = this.normalizeSelection(uiState?.ghostStructure);
          return selection === "port";
      }
      normalizeSelection(value) {
          if (typeof value !== "string") {
              return null;
          }
          const normalized = value.replace(/\s+/g, " ").trim().toLowerCase();
          return normalized.length > 0 ? normalized : null;
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
          const sidebar = document.getElementById(SIDEBAR_ID);
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
          const sidebar = document.getElementById(SIDEBAR_ID);
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
      normalizeColor(color) {
          if (color && color.trim()) {
              return color.trim();
          }
          return "rgba(56, 189, 248, 0.95)";
      }
      isFinitePoint(point) {
          return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
      }
  }
  const SVG_NS = "http://www.w3.org/2000/svg";
  class AttackBorderOverlay {
      constructor(options) {
          this.options = options;
          this.labelPool = new Map();
          this.labelSummaries = [];
          this.rafHandle = null;
          this.attached = false;
          this.active = false;
          this.hostElement = null;
          this.offsetLeft = 0;
          this.offsetTop = 0;
          this.cssWidth = 0;
          this.cssHeight = 0;
          this.visible = true;
          if (typeof document === "undefined") {
              throw new Error("AttackBorderOverlay requires a browser environment");
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
          this.labelLayer = document.createElement("div");
          this.labelLayer.style.position = "absolute";
          this.labelLayer.style.left = "0";
          this.labelLayer.style.top = "0";
          this.labelLayer.style.width = "100%";
          this.labelLayer.style.height = "100%";
          this.labelLayer.style.pointerEvents = "none";
          this.container.appendChild(this.labelLayer);
      }
      setLabels(summaries) {
          this.labelSummaries = summaries.map((summary) => ({ ...summary }));
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
          this.container.style.display = this.visible ? "block" : "none";
          this.updateContainerFrame();
          this.render();
          this.scheduleRender();
      }
      setVisible(visible) {
          this.visible = visible;
          if (!this.active) {
              return;
          }
          this.container.style.display = this.visible ? "block" : "none";
      }
      disable() {
          if (!this.active) {
              return;
          }
          this.active = false;
          this.container.style.display = "none";
          this.cancelRender();
          this.hideAllLabels();
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
      clear() {
          this.labelSummaries = [];
          for (const entry of this.labelPool.values()) {
              entry.container.remove();
          }
          this.labelPool.clear();
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
              this.hideAllLabels();
              return;
          }
          this.updateContainerFrame();
          this.updateLabels(transform);
      }
      updateLabels(transform) {
          const used = new Set();
          for (const summary of this.labelSummaries) {
              if (!Number.isFinite(summary.x) || !Number.isFinite(summary.y)) {
                  continue;
              }
              const entry = this.ensureLabelEntry(summary.id);
              used.add(summary.id);
              entry.text.textContent = summary.text;
              entry.container.style.color = summary.color ?? "#e2e8f0";
              const minScale = summary.minScale ?? 0;
              if (transform.scale < minScale) {
                  entry.container.style.display = "none";
                  continue;
              }
              const screen = transform.worldToScreenCoordinates({
                  x: summary.x,
                  y: summary.y,
              });
              if (!this.isFinitePoint(screen)) {
                  entry.container.style.display = "none";
                  continue;
              }
              const localX = screen.x - this.offsetLeft;
              const localY = screen.y - this.offsetTop;
              entry.container.style.left = `${localX}px`;
              entry.container.style.top = `${localY}px`;
              entry.container.style.display = "inline-flex";
          }
          for (const [key, entry] of this.labelPool.entries()) {
              if (used.has(key)) {
                  continue;
              }
              entry.container.remove();
              this.labelPool.delete(key);
          }
      }
      ensureLabelEntry(key) {
          let entry = this.labelPool.get(key);
          if (!entry) {
              entry = this.createLabel();
              this.labelPool.set(key, entry);
          }
          return entry;
      }
      createLabel() {
          const container = document.createElement("div");
          container.style.position = "absolute";
          container.style.padding = "3px 6px";
          container.style.borderRadius = "5px";
          container.style.fontSize = "clamp(0.52rem, 0.62vw, 0.62rem)";
          container.style.lineHeight = "1";
          container.style.fontWeight = "600";
          container.style.letterSpacing = "0.02em";
          container.style.color = "#e2e8f0";
          container.style.background = "rgba(15, 23, 42, 0.85)";
          container.style.boxShadow = "0 4px 12px rgba(2, 6, 23, 0.35)";
          container.style.whiteSpace = "nowrap";
          container.style.transform = "translate(-50%, -50%)";
          container.style.display = "none";
          container.style.alignItems = "center";
          container.style.gap = "5px";
          const icon = createElement$9(Users);
          icon.setAttribute("aria-hidden", "true");
          icon.style.width = "9px";
          icon.style.height = "9px";
          icon.style.flexShrink = "0";
          icon.style.color = "inherit";
          const text = document.createElement("span");
          text.textContent = "";
          container.appendChild(icon);
          container.appendChild(text);
          this.labelLayer.appendChild(container);
          return { container, icon, text };
      }
      hideAllLabels() {
          for (const entry of this.labelPool.values()) {
              entry.container.style.display = "none";
          }
      }
      isFinitePoint(point) {
          return Boolean(point && Number.isFinite(point.x) && Number.isFinite(point.y));
      }
  }
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
          this.visible = true;
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
          this.container.style.display = this.visible ? "block" : "none";
          this.updateContainerFrame();
          this.render();
          this.scheduleRender();
      }
      setVisible(visible) {
          this.visible = visible;
          if (!this.active) {
              return;
          }
          this.container.style.display = this.visible ? "block" : "none";
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
          const svg = createElement$9(this.labelIcon);
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

  const TEAM_COLOR_SEQUENCE = [
      "Red",
      "Blue",
      "Yellow",
      "Green",
      "Purple",
      "Orange",
      "Teal",
  ];
  const TEAM_CONFIG_DUOS = "Duos";
  const TEAM_CONFIG_TRIOS = "Trios";
  const TEAM_CONFIG_QUADS = "Quads";
  const TEAM_CONFIG_HUMANS_VS_NATIONS = "Humans Vs Nations";
  const LOBBY_TEAM_KICKED = "kicked";
  function predictLobbyTeams(players, options) {
      if (!players.length) {
          return new Map();
      }
      const { playerTeams } = options;
      if (!playerTeams) {
          return new Map();
      }
      if (playerTeams === TEAM_CONFIG_HUMANS_VS_NATIONS) {
          return new Map();
      }
      const configuredMaxPlayers = typeof options.maxPlayers === "number" &&
          Number.isFinite(options.maxPlayers)
          ? options.maxPlayers
          : null;
      const playerCountForTeams = configuredMaxPlayers && configuredMaxPlayers > 0
          ? Math.max(players.length, configuredMaxPlayers)
          : players.length;
      const teamLabels = buildTeamLabels(playerTeams, playerCountForTeams);
      if (teamLabels.length < 2) {
          return new Map();
      }
      const normalizedPlayers = players.map((player) => ({
          ...player,
          clan: extractClanTag(player.name) ?? undefined,
      }));
      const assignments = assignTeams(normalizedPlayers, teamLabels, playerCountForTeams);
      return assignments;
  }
  function buildTeamLabels(config, expectedPlayers) {
      let teamCount = null;
      if (typeof config === "number") {
          teamCount = Number.isFinite(config) ? config : null;
      }
      else {
          switch (config) {
              case TEAM_CONFIG_DUOS:
                  teamCount = Math.ceil(expectedPlayers / 2);
                  break;
              case TEAM_CONFIG_TRIOS:
                  teamCount = Math.ceil(expectedPlayers / 3);
                  break;
              case TEAM_CONFIG_QUADS:
                  teamCount = Math.ceil(expectedPlayers / 4);
                  break;
              default:
                  teamCount = null;
                  break;
          }
      }
      if (teamCount === null || !Number.isFinite(teamCount) || teamCount < 2) {
          return [];
      }
      if (teamCount < TEAM_COLOR_SEQUENCE.length + 1) {
          return TEAM_COLOR_SEQUENCE.slice(0, teamCount);
      }
      return Array.from({ length: teamCount }, (_, index) => `Team ${index + 1}`);
  }
  function assignTeams(players, teams, playerCount) {
      const result = new Map();
      const teamPlayerCount = new Map();
      const clanGroups = new Map();
      const unclanned = [];
      for (const player of players) {
          if (player.clan) {
              const clanKey = player.clan;
              if (!clanGroups.has(clanKey)) {
                  clanGroups.set(clanKey, []);
              }
              clanGroups.get(clanKey).push(player);
          }
          else {
              unclanned.push(player);
          }
      }
      const maxTeamSize = Math.ceil(playerCount / teams.length);
      if (!Number.isFinite(maxTeamSize) || maxTeamSize <= 0) {
          return result;
      }
      const sortedClans = Array.from(clanGroups.values()).sort((a, b) => b.length - a.length);
      for (const clanPlayers of sortedClans) {
          const assignment = pickTeam(teams, teamPlayerCount);
          if (!assignment) {
              break;
          }
          const { team } = assignment;
          let { size } = assignment;
          for (const player of clanPlayers) {
              if (size < maxTeamSize) {
                  result.set(player.id, team);
                  size += 1;
              }
              else {
                  result.set(player.id, LOBBY_TEAM_KICKED);
              }
          }
          teamPlayerCount.set(team, size);
      }
      for (const player of unclanned) {
          const assignment = pickTeam(teams, teamPlayerCount);
          if (!assignment) {
              break;
          }
          const { team, size } = assignment;
          if (size >= maxTeamSize) {
              continue;
          }
          teamPlayerCount.set(team, size + 1);
          result.set(player.id, team);
      }
      return result;
  }
  function pickTeam(teams, teamPlayerCount) {
      let chosenTeam = null;
      let chosenSize = 0;
      for (const team of teams) {
          const currentSize = teamPlayerCount.get(team) ?? 0;
          if (chosenTeam !== null && chosenSize <= currentSize) {
              continue;
          }
          chosenTeam = team;
          chosenSize = currentSize;
      }
      if (chosenTeam === null) {
          return null;
      }
      return { team: chosenTeam, size: chosenSize };
  }

  function readPersistedString(key) {
      if (typeof GM_getValue !== "function") {
          return null;
      }
      try {
          const value = GM_getValue(key, null);
          if (value === null || value === undefined) {
              return null;
          }
          return typeof value === "string" ? value : null;
      }
      catch {
          return null;
      }
  }
  function writePersistedString(key, value) {
      if (typeof GM_setValue !== "function") {
          return false;
      }
      try {
          GM_setValue(key, value);
          return true;
      }
      catch {
          return false;
      }
  }

  const TICK_MILLISECONDS = 100;
  const MAX_LOG_ENTRIES = 500;
  const FEATURED_PUBLIC_GAME_ORDER = [
      "special",
      "ffa",
      "team",
  ];
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
  const MISSILE_IMPACT_OVERLAY_ID = "missile-impact";
  const LEGACY_MISSILE_IMPACT_OVERLAY_ID = "missile-impact-telegraphs";
  const DONATION_DEDUP_TICK_WINDOW = 5;
  const WEB_SOCKET_DONATION_PENDING_MAX = 300;
  const WEB_SOCKET_DONATION_PENDING_TTL_MS = 30000;
  const TROOP_DONATION_OVERLAY_ID = "troop-donations";
  const GOLD_DONATION_OVERLAY_ID = "gold-donations";
  const TRADE_ROUTE_OVERLAY_ID = "trade-routes";
  const TRANSPORT_DESTINATION_OVERLAY_ID = "transport-destinations";
  const ATTACK_BORDER_OVERLAY_ID = "attack-borders";
  const LOBBY_CLAN_TAG_COUNTS_OVERLAY_ID = "lobby-clan-tag-counts";
  const ATTACK_BORDER_TROOP_COMPACT_THRESHOLD = 100000;
  const ATTACK_BORDER_TROOP_COMPACT_FORMATTER = new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
  });
  const ATTACK_FRONT_EDGE_GAP_MERGE_TILES = 2;
  const ATTACK_BORDER_ZOOM_EDGE_TINY_MAX = 1;
  const ATTACK_BORDER_ZOOM_EDGE_SMALL_MAX = 2;
  const ATTACK_BORDER_ZOOM_EDGE_MEDIUM_MAX = 4;
  const ATTACK_BORDER_ZOOM_EDGE_LARGE_MAX = 7;
  const ATTACK_BORDER_ZOOM_MIN_SCALE_TINY = 2.7;
  const ATTACK_BORDER_ZOOM_MIN_SCALE_SMALL = 2.3;
  const ATTACK_BORDER_ZOOM_MIN_SCALE_MEDIUM = 1.9;
  const ATTACK_BORDER_ZOOM_MIN_SCALE_LARGE = 1.45;
  const DEFAULT_WORKER_COUNT = 20;
  const USERNAME_STORAGE_KEY = "username";
  const SIDEBAR_STATE_STORAGE_KEY = "datafront:state";
  function normalizePersistedOverlayMap(value) {
      if (!value || typeof value !== "object") {
          return undefined;
      }
      const normalized = {};
      for (const [key, rawEnabled] of Object.entries(value)) {
          if (typeof rawEnabled === "boolean") {
              normalized[key] = rawEnabled;
          }
      }
      return Object.keys(normalized).length > 0 ? normalized : undefined;
  }
  function parsePersistedSidebarState(value) {
      let parsed = value;
      if (typeof parsed === "string") {
          try {
              parsed = JSON.parse(parsed);
          }
          catch {
              return null;
          }
      }
      if (!parsed || typeof parsed !== "object") {
          return null;
      }
      const { version, overlays } = parsed;
      if (version !== 1) {
          return null;
      }
      return {
          version: 1,
          overlays: normalizePersistedOverlayMap(overlays),
      };
  }
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
  function hashString(value) {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
          const char = value.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash |= 0;
      }
      return Math.abs(hash);
  }
  function formatOpenFrontNumber(value) {
      const num = Math.max(Number.isFinite(value) ? value : 0, 0);
      if (num >= 10000000) {
          return `${(Math.floor(num / 100000) / 10).toFixed(1)}M`;
      }
      if (num >= 1000000) {
          return `${(Math.floor(num / 10000) / 100).toFixed(2)}M`;
      }
      if (num >= 100000) {
          return `${Math.floor(num / 1000)}K`;
      }
      if (num >= 10000) {
          return `${(Math.floor(num / 100) / 10).toFixed(1)}K`;
      }
      if (num >= 1000) {
          return `${(Math.floor(num / 10) / 100).toFixed(2)}K`;
      }
      return Math.floor(num).toString();
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
          this.overlaysTemporarilyHidden = false;
          this.attackBorderSyncInFlight = false;
          this.attackBorderSyncQueued = false;
          this.displayEventPollingActive = false;
          this.displayEventPollingLastTimestamp = 0;
          this.lastProcessedDisplayUpdates = null;
          this.lastProcessedDisplayEventArray = null;
          this.lastProcessedDisplayEventArrayLength = 0;
          this.recentTroopDonations = new Map();
          this.recentGoldDonations = new Map();
          this.pendingWebSocketDonationIntents = [];
          this.lobbyQueueRefreshPromise = null;
          this.lobbyDetailsCache = new Map();
          this.lobbyWorkerInfoPromise = null;
          this.lastLobbyTeamLogKey = null;
          this.lastLiveGameTeamLogKey = null;
          this.localPlayerPublicId = null;
          this.latestFeaturedLobbySummaries = null;
          this.hostWindow =
              globalThis.unsafeWindow ??
                  (typeof window !== "undefined" ? window : null);
          this.hostDocument =
              globalThis.unsafeWindow
                  ?.document ?? globalThis.document;
          this.userMeHandler = (event) => {
              const custom = event;
              const detail = custom.detail;
              const candidate = typeof detail === "object" && detail !== null
                  ? detail.player?.publicId
                  : undefined;
              this.localPlayerPublicId =
                  typeof candidate === "string" && candidate.trim().length > 0
                      ? candidate.trim()
                      : null;
          };
          this.publicLobbiesHandler = (event) => {
              {
                  this.latestFeaturedLobbySummaries = null;
                  return;
              }
          };
          this.hostDocument.addEventListener("userMeResponse", this.userMeHandler);
          this.hostDocument.addEventListener("public-lobbies-update", this.publicLobbiesHandler);
          this.webSocketDonationCleanup = this.installWebSocketDonationHook();
          this.actionsState = this.createInitialActionsState();
          this.sidebarOverlays = [
              {
                  id: MISSILE_TRAJECTORY_OVERLAY_ID,
                  label: "Missile trajectories",
                  description: "Draws projected missile paths from each silo to your selected Atom or Hydrogen bomb target.",
                  enabled: false,
                  scope: "game",
              },
              {
                  id: HISTORICAL_MISSILE_OVERLAY_ID,
                  label: "Active missile trajectories",
                  description: "Shows the live flight paths for missiles currently in the air, colored by their owners.",
                  enabled: false,
                  scope: "game",
              },
              {
                  id: MISSILE_IMPACT_OVERLAY_ID,
                  label: "Missile impact",
                  description: "Shows rotating impact circles for active missiles, colored per team.",
                  enabled: false,
                  scope: "game",
              },
              {
                  id: TROOP_DONATION_OVERLAY_ID,
                  label: "Troop donations",
                  description: "Shows temporary arrows and labels across the map when players send troops to each other.",
                  enabled: false,
                  scope: "game",
              },
              {
                  id: GOLD_DONATION_OVERLAY_ID,
                  label: "Gold donations",
                  description: "Shows temporary arrows and labels across the map when players send gold to each other.",
                  enabled: false,
                  scope: "game",
              },
              {
                  id: TRADE_ROUTE_OVERLAY_ID,
                  label: "Trade ship routes",
                  description: "Displays projected trade ship paths, distances, and base gold when placing a new port.",
                  enabled: false,
                  scope: "game",
              },
              {
                  id: TRANSPORT_DESTINATION_OVERLAY_ID,
                  label: "Transport destinations",
                  description: "Highlights destination tiles for transport ships currently moving across the map.",
                  enabled: false,
                  scope: "game",
              },
              {
                  id: ATTACK_BORDER_OVERLAY_ID,
                  label: "Attack border labels",
                  description: "Shows active attack labels centered on the attacker side of shared territory borders.",
                  enabled: false,
                  scope: "game",
              },
              {
                  id: LOBBY_CLAN_TAG_COUNTS_OVERLAY_ID,
                  label: "Clan tag counts",
                  description: "Adds the count of queued players with your clan tag to each featured lobby card.",
                  enabled: false,
                  scope: "lobby",
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
              window.addEventListener("beforeunload", () => {
                  this.hostDocument.removeEventListener("userMeResponse", this.userMeHandler);
                  this.hostDocument.removeEventListener("public-lobbies-update", this.publicLobbiesHandler);
                  this.logSubscriptionCleanup();
                  this.webSocketDonationCleanup?.();
              }, { once: true });
          }
          if (typeof window !== "undefined") {
              this.scheduleGameDiscovery(true);
              this.startLobbyQueueUpdates();
              void this.refreshLocalPlayerPublicId();
          }
          this.restoreSidebarState();
          this.ensureAllEventActionsRunning();
      }
      installWebSocketDonationHook() {
          const hostWindow = this.hostWindow;
          if (!hostWindow || typeof hostWindow.WebSocket !== "function") {
              return null;
          }
          const messageListener = (message) => {
              const candidates = this.extractWebSocketDonationIntentCandidatesFromMessage(message);
              if (candidates.length > 0) {
                  this.enqueueWebSocketDonationIntentCandidates(candidates);
              }
          };
          DataStore.wsDonationListeners.add(messageListener);
          let hookState = DataStore.wsDonationHooksByWindow.get(hostWindow);
          if (!hookState) {
              const nativeWebSocket = hostWindow.WebSocket;
              const observedSockets = new WeakSet();
              const dispatchMessage = (message) => {
                  for (const listener of DataStore.wsDonationListeners) {
                      try {
                          listener(message);
                      }
                      catch (error) {
                          console.warn("WebSocket donation listener failed", error);
                      }
                  }
              };
              const attachSocket = (socket) => {
                  if (observedSockets.has(socket)) {
                      return;
                  }
                  observedSockets.add(socket);
                  socket.addEventListener("message", (event) => {
                      if (typeof event.data !== "string") {
                          return;
                      }
                      try {
                          const parsed = JSON.parse(event.data);
                          dispatchMessage(parsed);
                      }
                      catch {
                          // Ignore non-JSON messages.
                      }
                  });
              };
              const originalSend = nativeWebSocket.prototype.send;
              const patchedSend = function patchedWebSocketSend(data) {
                  attachSocket(this);
                  originalSend.call(this, data);
              };
              nativeWebSocket.prototype.send = patchedSend;
              const hostWindowMutable = hostWindow;
              const patchedWebSocket = function DataFrontWebSocket(url, protocols) {
                  const socket = protocols === undefined
                      ? new nativeWebSocket(url)
                      : new nativeWebSocket(url, protocols);
                  attachSocket(socket);
                  return socket;
              };
              hostWindowMutable.WebSocket = patchedWebSocket;
              hostWindowMutable.WebSocket.prototype = nativeWebSocket.prototype;
              Object.setPrototypeOf(hostWindowMutable.WebSocket, nativeWebSocket);
              const teardown = () => {
                  if (nativeWebSocket.prototype.send === patchedSend) {
                      nativeWebSocket.prototype.send = originalSend;
                  }
                  if (hostWindowMutable.WebSocket === patchedWebSocket) {
                      hostWindowMutable.WebSocket = nativeWebSocket;
                  }
              };
              hookState = {
                  refCount: 0,
                  teardown,
              };
              DataStore.wsDonationHooksByWindow.set(hostWindow, hookState);
          }
          hookState.refCount += 1;
          let cleanedUp = false;
          return () => {
              if (cleanedUp) {
                  return;
              }
              cleanedUp = true;
              DataStore.wsDonationListeners.delete(messageListener);
              const currentHook = DataStore.wsDonationHooksByWindow.get(hostWindow);
              if (!currentHook) {
                  return;
              }
              currentHook.refCount = Math.max(0, currentHook.refCount - 1);
              if (currentHook.refCount === 0) {
                  currentHook.teardown();
                  DataStore.wsDonationHooksByWindow.delete(hostWindow);
              }
          };
      }
      extractWebSocketDonationIntentCandidatesFromMessage(message) {
          if (!message || typeof message !== "object") {
              return [];
          }
          const payload = message;
          if (payload.type !== "turn") {
              return [];
          }
          const intents = payload.turn?.intents;
          if (!Array.isArray(intents) || intents.length === 0) {
              return [];
          }
          const candidates = [];
          const now = Date.now();
          for (const raw of intents) {
              const intent = raw;
              if (intent.type !== "donate_gold" && intent.type !== "donate_troops") {
                  continue;
              }
              const senderClientId = intent.clientID !== undefined && intent.clientID !== null
                  ? String(intent.clientID).trim()
                  : "";
              const recipientPlayerId = intent.recipient !== undefined && intent.recipient !== null
                  ? String(intent.recipient).trim()
                  : "";
              if (!senderClientId || !recipientPlayerId) {
                  continue;
              }
              const kind = intent.type === "donate_gold" ? "gold" : "troops";
              const amount = this.resolveDonationIntentAmount(intent, kind);
              if (amount === null || amount <= 0) {
                  continue;
              }
              const amountDisplay = this.formatDonationAmountDisplay(kind, amount);
              candidates.push({
                  kind,
                  senderClientId,
                  recipientPlayerId,
                  amountDisplay,
                  amountApprox: amount,
                  observedAtMs: now,
              });
          }
          return candidates;
      }
      resolveDonationIntentAmount(intent, kind) {
          const rawAmount = kind === "gold" ? intent.gold : intent.troops;
          if (typeof rawAmount === "number" && Number.isFinite(rawAmount)) {
              return Math.max(0, Math.floor(rawAmount));
          }
          const senderClientId = intent.clientID !== undefined && intent.clientID !== null
              ? String(intent.clientID).trim()
              : "";
          const recipientPlayerId = intent.recipient !== undefined && intent.recipient !== null
              ? String(intent.recipient).trim()
              : "";
          if (!senderClientId || !recipientPlayerId || !this.game) {
              return null;
          }
          const sender = this.resolvePlayerViewByClientId(senderClientId);
          const recipient = this.resolvePlayerById(recipientPlayerId);
          if (!sender || !recipient) {
              return null;
          }
          if (kind === "gold") {
              const senderGoldRaw = sender.gold();
              const senderGold = typeof senderGoldRaw === "bigint"
                  ? Number(senderGoldRaw)
                  : senderGoldRaw;
              if (!Number.isFinite(senderGold) || senderGold <= 0) {
                  return null;
              }
              return Math.max(0, Math.floor(senderGold / 3));
          }
          const config = this.game.config();
          const defaultDonation = typeof config.defaultDonationAmount === "function"
              ? config.defaultDonationAmount(sender)
              : Math.floor(sender.troops() / 3);
          if (!Number.isFinite(defaultDonation) || defaultDonation <= 0) {
              return null;
          }
          let amount = Math.max(0, Math.floor(defaultDonation));
          if (typeof config.maxTroops === "function") {
              const maxTroops = config.maxTroops(recipient);
              const capacityLeft = Math.floor(maxTroops - recipient.troops());
              if (Number.isFinite(capacityLeft)) {
                  amount = Math.min(amount, Math.max(0, capacityLeft));
              }
          }
          return amount > 0 ? amount : null;
      }
      formatDonationAmountDisplay(kind, rawAmount) {
          if (kind === "troops") {
              return formatOpenFrontNumber(rawAmount / 10);
          }
          return formatOpenFrontNumber(rawAmount);
      }
      enqueueWebSocketDonationIntentCandidates(candidates) {
          if (candidates.length === 0) {
              return;
          }
          for (const candidate of candidates) {
              this.pendingWebSocketDonationIntents.push(candidate);
          }
          if (this.pendingWebSocketDonationIntents.length >
              WEB_SOCKET_DONATION_PENDING_MAX) {
              this.pendingWebSocketDonationIntents.splice(0, this.pendingWebSocketDonationIntents.length -
                  WEB_SOCKET_DONATION_PENDING_MAX);
          }
      }
      attachActionsState(snapshot) {
          return {
              ...snapshot,
              currentLobbyClanTag: this.resolveCurrentLobbyClanTag(),
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
      loadPersistedSidebarState() {
          const raw = readPersistedString(SIDEBAR_STATE_STORAGE_KEY);
          if (!raw) {
              return null;
          }
          return parsePersistedSidebarState(raw);
      }
      restoreSidebarState() {
          const state = this.loadPersistedSidebarState();
          const overlays = state?.overlays;
          if (!overlays) {
              return;
          }
          for (const overlay of this.sidebarOverlays) {
              const enabled = this.resolvePersistedOverlayEnabled(overlays, overlay.id);
              if (typeof enabled === "boolean") {
                  this.setOverlayEnabled(overlay.id, enabled);
              }
          }
      }
      resolvePersistedOverlayEnabled(overlays, overlayId) {
          const currentValue = overlays[overlayId];
          if (typeof currentValue === "boolean") {
              return currentValue;
          }
          if (overlayId === MISSILE_IMPACT_OVERLAY_ID) {
              const legacyValue = overlays[LEGACY_MISSILE_IMPACT_OVERLAY_ID];
              if (typeof legacyValue === "boolean") {
                  return legacyValue;
              }
          }
          return undefined;
      }
      saveSidebarState() {
          const overlays = {};
          for (const overlay of this.sidebarOverlays) {
              overlays[overlay.id] = Boolean(overlay.enabled);
          }
          const payload = { version: 1, overlays };
          const saved = writePersistedString(SIDEBAR_STATE_STORAGE_KEY, JSON.stringify(payload));
          if (saved) {
              sidebarLogger.info("Saved sidebar state.");
          }
          else {
              console.warn("Failed to save sidebar state.");
          }
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
      ensureMissileImpactOverlay() {
          this.missileImpactOverlay =
              this.missileImpactOverlay ??
                  new MissileImpactOverlay({
                      resolveTransform: () => this.resolveTransformHandler(),
                  });
          return this.missileImpactOverlay;
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
      ensureTradeRouteOverlay() {
          this.tradeRouteOverlay =
              this.tradeRouteOverlay ??
                  new TradeRouteOverlay({
                      resolveTransform: () => this.resolveTransformHandler(),
                      resolveUiState: () => this.resolveUiState(),
                      resolveGame: () => this.game,
                      resolveLocalPlayerSmallId: () => this.resolveLocalPlayerSmallId(),
                  });
          return this.tradeRouteOverlay;
      }
      ensureTransportDestinationOverlay() {
          this.transportDestinationOverlay =
              this.transportDestinationOverlay ??
                  new TransportDestinationOverlay({
                      resolveTransform: () => this.resolveTransformHandler(),
                  });
          return this.transportDestinationOverlay;
      }
      ensureAttackBorderOverlay() {
          this.attackBorderOverlay =
              this.attackBorderOverlay ??
                  new AttackBorderOverlay({
                      resolveTransform: () => this.resolveTransformHandler(),
                  });
          return this.attackBorderOverlay;
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
          const localPlayer = this.resolveLocalPlayer();
          const localPlayerId = localPlayer
              ? this.safePlayerId(localPlayer)
              : undefined;
          const localTeam = (() => {
              if (!localPlayer) {
                  return null;
              }
              try {
                  const team = localPlayer.team?.();
                  return team ?? null;
              }
              catch {
                  return null;
              }
          })();
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
              let ownerTeam;
              if (owner) {
                  try {
                      const team = owner.team?.();
                      if (team) {
                          ownerTeam = team;
                      }
                  }
                  catch (error) {
                      console.warn("Failed to resolve missile owner team", error);
                  }
              }
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
                  ownerTeam,
                  isLocalOwner: !!ownerId && !!localPlayerId && ownerId === localPlayerId,
                  isLocalTeam: !!localTeam && !!ownerTeam && ownerTeam === localTeam,
                  unitType,
              };
              flights.push(flight);
          }
          return flights;
      }
      collectTradeRoutePorts(players, recordLookup) {
          if (!this.game) {
              return [];
          }
          let units;
          try {
              units = this.game.units("Port");
          }
          catch (error) {
              console.warn("Failed to enumerate ports for trade overlay", error);
              return [];
          }
          const localPlayer = this.resolveLocalPlayer();
          const localId = localPlayer ? this.safePlayerId(localPlayer) : null;
          const eligibility = new Map();
          for (const player of players) {
              const ownerId = this.safePlayerId(player);
              if (!ownerId) {
                  continue;
              }
              const status = this.determineTradeStatus(localPlayer, player);
              eligibility.set(ownerId, {
                  includeFromLocal: !status.stoppedBySelf,
                  includeToLocal: !status.stoppedByOther,
              });
          }
          const ports = [];
          for (const unit of units) {
              let owner;
              try {
                  owner = unit.owner();
              }
              catch (error) {
                  console.warn("Failed to resolve port owner", error);
                  continue;
              }
              const ownerId = this.safePlayerId(owner);
              if (!ownerId) {
                  continue;
              }
              const status = eligibility.get(ownerId);
              const includeFromLocal = ownerId === localId ? true : (status?.includeFromLocal ?? false);
              const includeToLocal = ownerId === localId ? true : (status?.includeToLocal ?? false);
              if (!includeFromLocal || !includeToLocal) {
                  continue;
              }
              const tile = this.describeTile(unit.tile());
              if (!tile || typeof tile.ref !== "number") {
                  continue;
              }
              const record = recordLookup.get(ownerId);
              ports.push({
                  id: String(unit.id()),
                  tileRef: tile.ref,
                  x: tile.x,
                  y: tile.y,
                  ownerId,
                  ownerSmallId: this.safePlayerSmallId(owner) ?? undefined,
                  ownerName: record?.name ?? this.safePlayerName(owner),
                  ownerColor: record?.color ?? this.resolvePlayerColor(owner),
                  includeFromLocal,
                  includeToLocal,
              });
          }
          return ports;
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
          const historicalEnabled = this.isOverlayEnabled(HISTORICAL_MISSILE_OVERLAY_ID);
          const impactEnabled = this.isOverlayEnabled(MISSILE_IMPACT_OVERLAY_ID);
          if (!historicalEnabled && !impactEnabled) {
              return;
          }
          const flights = this.collectHistoricalMissiles();
          if (historicalEnabled) {
              this.historicalMissileOverlay?.setTrajectories(flights);
          }
          if (impactEnabled) {
              this.missileImpactOverlay?.setTrajectories(flights);
          }
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
      syncTradeRouteOverlay(players, recordLookup) {
          if (!this.tradeRouteOverlay) {
              return;
          }
          let sourcePlayers = players;
          if (!sourcePlayers && this.game) {
              try {
                  sourcePlayers = this.game.playerViews();
              }
              catch (error) {
                  console.warn("Failed to refresh players for trade overlay", error);
                  sourcePlayers = [];
              }
          }
          sourcePlayers = sourcePlayers ?? [];
          let lookup = recordLookup;
          if (!lookup) {
              lookup = new Map();
              for (const record of this.snapshot.players) {
                  lookup.set(record.id, record);
              }
          }
          const ports = this.collectTradeRoutePorts(sourcePlayers, lookup);
          const localSmallId = this.resolveLocalPlayerSmallId();
          this.tradeRouteOverlay.setLocalPlayerSmallId(localSmallId);
          this.tradeRouteOverlay.setPortSummaries(ports);
      }
      collectTransportDestinations(ships, players) {
          const ownerColors = new Map();
          const ownerNames = new Map();
          for (const player of players) {
              if (player.name.trim().length > 0) {
                  ownerNames.set(player.id, player.name.trim());
              }
              if (typeof player.color === "string" && player.color.trim().length > 0) {
                  ownerColors.set(player.id, player.color.trim());
              }
          }
          const byDestination = new Map();
          for (const ship of ships) {
              if (ship.type !== "Transport" ||
                  ship.reachedTarget ||
                  !ship.destination) {
                  continue;
              }
              const current = ship.current;
              if (current &&
                  ((current.ref !== undefined &&
                      ship.destination.ref !== undefined &&
                      current.ref === ship.destination.ref) ||
                      (current.x === ship.destination.x &&
                          current.y === ship.destination.y))) {
                  continue;
              }
              const key = ship.destination.ref !== undefined
                  ? `ref:${ship.destination.ref}`
                  : `xy:${ship.destination.x},${ship.destination.y}`;
              const existing = byDestination.get(key);
              const ownerColor = ownerColors.get(ship.ownerId);
              const ownerName = ownerNames.get(ship.ownerId) ??
                  (ship.ownerName.trim().length > 0 ? ship.ownerName.trim() : null);
              if (existing) {
                  existing.count += 1;
                  if (ownerName) {
                      existing.ownerNames.add(ownerName);
                  }
                  if (existing.ownerId !== ship.ownerId) {
                      existing.ownerId = undefined;
                      existing.color = undefined;
                  }
                  else if (!existing.color && ownerColor) {
                      existing.color = ownerColor;
                  }
                  continue;
              }
              byDestination.set(key, {
                  x: ship.destination.x,
                  y: ship.destination.y,
                  count: 1,
                  ownerId: ship.ownerId,
                  color: ownerColor,
                  ownerNames: new Set(ownerName ? [ownerName] : []),
              });
          }
          const summaries = [];
          for (const aggregate of byDestination.values()) {
              const uniqueOwnerNames = Array.from(aggregate.ownerNames.values()).sort((a, b) => a.localeCompare(b));
              summaries.push({
                  x: aggregate.x,
                  y: aggregate.y,
                  count: aggregate.count,
                  ownerId: aggregate.ownerId,
                  color: aggregate.color,
                  label: this.formatTransportIncomingLabel(uniqueOwnerNames),
              });
          }
          return summaries.sort((a, b) => b.count - a.count);
      }
      formatTransportIncomingLabel(ownerNames) {
          if (ownerNames.length === 0) {
              return "Incoming";
          }
          if (ownerNames.length === 1) {
              return ownerNames[0];
          }
          if (ownerNames.length === 2) {
              return `${ownerNames[0]} + ${ownerNames[1]}`;
          }
          const preview = ownerNames.slice(0, 2).join(", ");
          return `${preview} +${ownerNames.length - 2}`;
      }
      syncTransportDestinationOverlay(ships = this.snapshot.ships, players = this.snapshot.players) {
          if (!this.transportDestinationOverlay) {
              return;
          }
          this.transportDestinationOverlay.setDestinations(this.collectTransportDestinations(ships, players));
      }
      syncAttackBorderOverlay(players) {
          if (!this.attackBorderOverlay || !this.attackBorderOverlay.isActive()) {
              return;
          }
          if (this.attackBorderSyncInFlight) {
              this.attackBorderSyncQueued = true;
              return;
          }
          this.attackBorderSyncInFlight = true;
          void this.computeAttackBorderLabels(players)
              .then((labels) => {
              if (!this.attackBorderOverlay || !this.attackBorderOverlay.isActive()) {
                  return;
              }
              this.attackBorderOverlay.setLabels(labels);
          })
              .catch((error) => {
              console.warn("Failed to refresh attack border overlay", error);
          })
              .finally(() => {
              this.attackBorderSyncInFlight = false;
              if (this.attackBorderSyncQueued) {
                  this.attackBorderSyncQueued = false;
                  this.syncAttackBorderOverlay();
              }
          });
      }
      async computeAttackBorderLabels(players) {
          const game = this.game;
          if (!game) {
              return [];
          }
          let sourcePlayers = players;
          if (!sourcePlayers) {
              try {
                  sourcePlayers = game.playerViews();
              }
              catch (error) {
                  console.warn("Failed to refresh players for attack overlay", error);
                  sourcePlayers = [];
              }
          }
          sourcePlayers = sourcePlayers ?? [];
          if (sourcePlayers.length === 0) {
              return [];
          }
          const attackerPairs = new Map();
          const attackers = new Map();
          for (const player of sourcePlayers) {
              const attackerSmallId = player.smallID();
              const outgoing = player.outgoingAttacks();
              if (!Array.isArray(outgoing) || outgoing.length === 0) {
                  continue;
              }
              for (const attack of outgoing) {
                  if (attack.retreating || attack.targetID <= 0) {
                      continue;
                  }
                  if (attack.targetID === attackerSmallId) {
                      continue;
                  }
                  const resolvedTroops = Math.max(0, this.resolveAttackTroops(attack));
                  if (resolvedTroops <= 0) {
                      continue;
                  }
                  let targetMap = attackerPairs.get(attackerSmallId);
                  if (!targetMap) {
                      targetMap = new Map();
                      attackerPairs.set(attackerSmallId, targetMap);
                  }
                  const existing = targetMap.get(attack.targetID) ?? [];
                  existing.push({
                      id: String(attack.id),
                      troops: resolvedTroops,
                      averagePosition: null,
                  });
                  targetMap.set(attack.targetID, existing);
                  attackers.set(attackerSmallId, player);
              }
          }
          if (attackerPairs.size === 0) {
              return [];
          }
          const borderRefsByAttacker = new Map();
          await Promise.all(Array.from(attackerPairs.keys()).map(async (attackerSmallId) => {
              const attacker = attackers.get(attackerSmallId);
              if (!attacker) {
                  return;
              }
              const refs = await this.resolvePlayerBorderTileRefs(attacker);
              borderRefsByAttacker.set(attackerSmallId, refs);
          }));
          await Promise.all(Array.from(attackerPairs.entries()).flatMap(([attackerSmallId, targetMap]) => {
              const attacker = attackers.get(attackerSmallId);
              return Array.from(targetMap.values()).flatMap((pairAttacks) => pairAttacks.map(async (attack) => {
                  attack.averagePosition = await this.resolveAttackAveragePosition(game, attacker, attackerSmallId, attack.id);
              }));
          }));
          const labels = [];
          for (const [attackerSmallId, targetMap] of attackerPairs.entries()) {
              const borderRefs = borderRefsByAttacker.get(attackerSmallId) ?? [];
              if (borderRefs.length === 0) {
                  continue;
              }
              const attackerBorderSet = new Set();
              for (const ref of borderRefs) {
                  if (game.ownerID(ref) === attackerSmallId) {
                      attackerBorderSet.add(ref);
                  }
              }
              if (attackerBorderSet.size === 0) {
                  continue;
              }
              const attacker = attackers.get(attackerSmallId);
              for (const [targetSmallId, pairAttacks] of targetMap.entries()) {
                  if (pairAttacks.length <= 0) {
                      continue;
                  }
                  const edges = [];
                  for (const ref of attackerBorderSet) {
                      const attackerX = game.x(ref);
                      const attackerY = game.y(ref);
                      const neighbors = game.neighbors(ref) ?? [];
                      for (const neighbor of neighbors) {
                          if (game.ownerID(neighbor) !== targetSmallId) {
                              continue;
                          }
                          const targetX = game.x(neighbor);
                          const targetY = game.y(neighbor);
                          const vertices = this.resolveSharedEdgeVertices(attackerX, attackerY, targetX, targetY);
                          if (!vertices) {
                              continue;
                          }
                          edges.push({
                              attackerRef: ref,
                              midpoint: {
                                  x: (attackerX + targetX + 1) / 2,
                                  y: (attackerY + targetY + 1) / 2,
                              },
                              vertexAKey: `${vertices[0].x},${vertices[0].y}`,
                              vertexBKey: `${vertices[1].x},${vertices[1].y}`,
                          });
                      }
                  }
                  if (edges.length <= 0) {
                      continue;
                  }
                  const vertexToEdges = new Map();
                  for (let index = 0; index < edges.length; index += 1) {
                      const edge = edges[index];
                      const aBucket = vertexToEdges.get(edge.vertexAKey) ?? [];
                      aBucket.push(index);
                      vertexToEdges.set(edge.vertexAKey, aBucket);
                      const bBucket = vertexToEdges.get(edge.vertexBKey) ?? [];
                      bBucket.push(index);
                      vertexToEdges.set(edge.vertexBKey, bBucket);
                  }
                  const visited = new Set();
                  const rawComponents = [];
                  for (let startIndex = 0; startIndex < edges.length; startIndex += 1) {
                      if (visited.has(startIndex)) {
                          continue;
                      }
                      const componentIndices = [];
                      const queue = [startIndex];
                      visited.add(startIndex);
                      while (queue.length > 0) {
                          const edgeIndex = queue.pop();
                          componentIndices.push(edgeIndex);
                          const edge = edges[edgeIndex];
                          const adjacent = [
                              ...(vertexToEdges.get(edge.vertexAKey) ?? []),
                              ...(vertexToEdges.get(edge.vertexBKey) ?? []),
                          ];
                          for (const nextIndex of adjacent) {
                              if (visited.has(nextIndex)) {
                                  continue;
                              }
                              visited.add(nextIndex);
                              queue.push(nextIndex);
                          }
                      }
                      if (componentIndices.length <= 0) {
                          continue;
                      }
                      const edgeMidpoints = componentIndices.map((edgeIndex) => edges[edgeIndex].midpoint);
                      const attackerRefs = componentIndices.map((edgeIndex) => edges[edgeIndex].attackerRef);
                      let minX = Number.POSITIVE_INFINITY;
                      let maxX = Number.NEGATIVE_INFINITY;
                      let minY = Number.POSITIVE_INFINITY;
                      let maxY = Number.NEGATIVE_INFINITY;
                      for (const midpoint of edgeMidpoints) {
                          if (midpoint.x < minX)
                              minX = midpoint.x;
                          if (midpoint.x > maxX)
                              maxX = midpoint.x;
                          if (midpoint.y < minY)
                              minY = midpoint.y;
                          if (midpoint.y > maxY)
                              maxY = midpoint.y;
                      }
                      rawComponents.push({
                          edgeIndices: componentIndices,
                          edgeMidpoints,
                          attackerRefs,
                          minX,
                          maxX,
                          minY,
                          maxY,
                      });
                  }
                  if (rawComponents.length <= 0) {
                      continue;
                  }
                  const componentsCanMerge = (a, b) => {
                      const dx = a.minX > b.maxX
                          ? a.minX - b.maxX
                          : b.minX > a.maxX
                              ? b.minX - a.maxX
                              : 0;
                      const dy = a.minY > b.maxY
                          ? a.minY - b.maxY
                          : b.minY > a.maxY
                              ? b.minY - a.maxY
                              : 0;
                      if (dx * dx + dy * dy >
                          ATTACK_FRONT_EDGE_GAP_MERGE_TILES *
                              ATTACK_FRONT_EDGE_GAP_MERGE_TILES) {
                          return false;
                      }
                      for (const aPoint of a.edgeMidpoints) {
                          for (const bPoint of b.edgeMidpoints) {
                              const ddx = aPoint.x - bPoint.x;
                              const ddy = aPoint.y - bPoint.y;
                              if (ddx * ddx + ddy * ddy <=
                                  ATTACK_FRONT_EDGE_GAP_MERGE_TILES *
                                      ATTACK_FRONT_EDGE_GAP_MERGE_TILES) {
                                  return true;
                              }
                          }
                      }
                      return false;
                  };
                  const components = [...rawComponents];
                  let merged = true;
                  while (merged) {
                      merged = false;
                      for (let i = 0; i < components.length; i += 1) {
                          for (let j = i + 1; j < components.length; j += 1) {
                              if (!componentsCanMerge(components[i], components[j])) {
                                  continue;
                              }
                              const mergedMidpoints = [
                                  ...components[i].edgeMidpoints,
                                  ...components[j].edgeMidpoints,
                              ];
                              const mergedRefs = [
                                  ...components[i].attackerRefs,
                                  ...components[j].attackerRefs,
                              ];
                              components[i] = {
                                  edgeIndices: [
                                      ...components[i].edgeIndices,
                                      ...components[j].edgeIndices,
                                  ],
                                  edgeMidpoints: mergedMidpoints,
                                  attackerRefs: mergedRefs,
                                  minX: Math.min(components[i].minX, components[j].minX),
                                  maxX: Math.max(components[i].maxX, components[j].maxX),
                                  minY: Math.min(components[i].minY, components[j].minY),
                                  maxY: Math.max(components[i].maxY, components[j].maxY),
                              };
                              components.splice(j, 1);
                              merged = true;
                              break;
                          }
                          if (merged) {
                              break;
                          }
                      }
                  }
                  const frontComponents = [];
                  for (const component of components) {
                      const edgeMidpoints = component.edgeMidpoints;
                      let centroidX = 0;
                      let centroidY = 0;
                      for (const midpoint of edgeMidpoints) {
                          centroidX += midpoint.x;
                          centroidY += midpoint.y;
                      }
                      centroidX /= edgeMidpoints.length;
                      centroidY /= edgeMidpoints.length;
                      // Pin the label to an actual shared-edge midpoint nearest the front center.
                      let anchor = edgeMidpoints[0];
                      let bestDist2 = Number.POSITIVE_INFINITY;
                      for (const midpoint of edgeMidpoints) {
                          const dx = midpoint.x - centroidX;
                          const dy = midpoint.y - centroidY;
                          const dist2 = dx * dx + dy * dy;
                          if (dist2 < bestDist2) {
                              bestDist2 = dist2;
                              anchor = midpoint;
                          }
                      }
                      let componentKey = Number.POSITIVE_INFINITY;
                      for (const candidate of component.attackerRefs) {
                          if (candidate < componentKey) {
                              componentKey = candidate;
                          }
                      }
                      frontComponents.push({
                          anchor,
                          edgeCount: edgeMidpoints.length,
                          componentKey,
                      });
                  }
                  const hasPositionedAttacks = pairAttacks.some((attack) => attack.averagePosition &&
                      Number.isFinite(attack.averagePosition.x) &&
                      Number.isFinite(attack.averagePosition.y));
                  if (hasPositionedAttacks) {
                      const troopsByFrontIndex = new Map();
                      for (const attack of pairAttacks) {
                          const position = attack.averagePosition;
                          if (!position ||
                              !Number.isFinite(position.x) ||
                              !Number.isFinite(position.y)) {
                              continue;
                          }
                          let nearestFrontIndex = -1;
                          let nearestDistanceSquared = Number.POSITIVE_INFINITY;
                          for (let componentIndex = 0; componentIndex < frontComponents.length; componentIndex += 1) {
                              const component = frontComponents[componentIndex];
                              const dx = position.x - component.anchor.x;
                              const dy = position.y - component.anchor.y;
                              const distanceSquared = dx * dx + dy * dy;
                              if (distanceSquared < nearestDistanceSquared) {
                                  nearestDistanceSquared = distanceSquared;
                                  nearestFrontIndex = componentIndex;
                              }
                          }
                          if (nearestFrontIndex < 0) {
                              continue;
                          }
                          const existing = troopsByFrontIndex.get(nearestFrontIndex);
                          if (!existing) {
                              troopsByFrontIndex.set(nearestFrontIndex, {
                                  troops: attack.troops,
                                  attackId: attack.id,
                              });
                              continue;
                          }
                          existing.troops += attack.troops;
                          if (attack.id.localeCompare(existing.attackId) < 0) {
                              existing.attackId = attack.id;
                          }
                      }
                      for (const [frontIndex, aggregate] of troopsByFrontIndex.entries()) {
                          const component = frontComponents[frontIndex];
                          if (!component) {
                              continue;
                          }
                          const troopText = this.formatAttackBorderTroopCount(aggregate.troops);
                          if (!troopText) {
                              continue;
                          }
                          const minScale = this.resolveAttackBorderLabelMinScale(component.edgeCount);
                          labels.push({
                              id: `attack-border-${attackerSmallId}-${targetSmallId}-${aggregate.attackId}-${component.componentKey}`,
                              x: component.anchor.x,
                              y: component.anchor.y,
                              text: troopText,
                              color: attacker
                                  ? (this.resolvePlayerColor(attacker) ?? undefined)
                                  : undefined,
                              minScale: minScale > 0 ? minScale : undefined,
                          });
                      }
                      continue;
                  }
                  const unassignedAttackIndices = new Set(pairAttacks.map((_, index) => index));
                  for (const component of frontComponents) {
                      const matchedAttack = this.selectAttackForFront(component.anchor, pairAttacks, unassignedAttackIndices);
                      if (!matchedAttack) {
                          continue;
                      }
                      const troopText = this.formatAttackBorderTroopCount(matchedAttack.troops);
                      if (!troopText) {
                          continue;
                      }
                      const minScale = this.resolveAttackBorderLabelMinScale(component.edgeCount);
                      labels.push({
                          id: `attack-border-${attackerSmallId}-${targetSmallId}-${matchedAttack.id}-${component.componentKey}`,
                          x: component.anchor.x,
                          y: component.anchor.y,
                          text: troopText,
                          color: attacker
                              ? (this.resolvePlayerColor(attacker) ?? undefined)
                              : undefined,
                          minScale: minScale > 0 ? minScale : undefined,
                      });
                  }
              }
          }
          labels.sort((a, b) => a.id.localeCompare(b.id));
          return labels;
      }
      async resolveAttackAveragePosition(game, attacker, attackerSmallId, attackId) {
          const extractPosition = (raw) => {
              if (!raw || typeof raw !== "object") {
                  return null;
              }
              const x = Number(raw.x);
              const y = Number(raw.y);
              if (!Number.isFinite(x) || !Number.isFinite(y)) {
                  return null;
              }
              return { x, y };
          };
          const attackerResolver = attacker?.attackAveragePosition;
          if (typeof attackerResolver === "function") {
              try {
                  const resolved = await attackerResolver.call(attacker, attackerSmallId, attackId);
                  const normalized = extractPosition(resolved);
                  if (normalized) {
                      return normalized;
                  }
              }
              catch (error) {
                  console.warn("Failed to resolve attack average position", error);
              }
          }
          const gameResolver = game.attackAveragePosition;
          if (typeof gameResolver !== "function") {
              return null;
          }
          try {
              const resolved = await gameResolver.call(game, attackerSmallId, attackId);
              return extractPosition(resolved);
          }
          catch (error) {
              console.warn("Failed to resolve attack average position", error);
              return null;
          }
      }
      selectAttackForFront(anchor, attacks, unassignedIndices) {
          if (attacks.length === 0) {
              return null;
          }
          const candidateIndices = unassignedIndices.size > 0
              ? [...unassignedIndices]
              : attacks.map((_, index) => index);
          if (candidateIndices.length === 0) {
              return null;
          }
          let nearestIndex = null;
          let nearestDistanceSquared = Number.POSITIVE_INFINITY;
          for (const index of candidateIndices) {
              const candidate = attacks[index];
              const position = candidate.averagePosition;
              if (!position ||
                  !Number.isFinite(position.x) ||
                  !Number.isFinite(position.y)) {
                  continue;
              }
              const dx = position.x - anchor.x;
              const dy = position.y - anchor.y;
              const distanceSquared = dx * dx + dy * dy;
              if (distanceSquared < nearestDistanceSquared) {
                  nearestDistanceSquared = distanceSquared;
                  nearestIndex = index;
              }
          }
          const selectedIndex = nearestIndex ?? candidateIndices[0];
          unassignedIndices.delete(selectedIndex);
          return attacks[selectedIndex] ?? null;
      }
      resolveSharedEdgeVertices(attackerX, attackerY, targetX, targetY) {
          if (targetX === attackerX + 1 && targetY === attackerY) {
              return [
                  { x: attackerX + 1, y: attackerY },
                  { x: attackerX + 1, y: attackerY + 1 },
              ];
          }
          if (targetX === attackerX - 1 && targetY === attackerY) {
              return [
                  { x: attackerX, y: attackerY },
                  { x: attackerX, y: attackerY + 1 },
              ];
          }
          if (targetX === attackerX && targetY === attackerY + 1) {
              return [
                  { x: attackerX, y: attackerY + 1 },
                  { x: attackerX + 1, y: attackerY + 1 },
              ];
          }
          if (targetX === attackerX && targetY === attackerY - 1) {
              return [
                  { x: attackerX, y: attackerY },
                  { x: attackerX + 1, y: attackerY },
              ];
          }
          return null;
      }
      async resolvePlayerBorderTileRefs(player) {
          const borderTilesGetter = player.borderTiles;
          if (typeof borderTilesGetter !== "function") {
              return [];
          }
          try {
              const payload = await borderTilesGetter.call(player);
              if (!payload || typeof payload !== "object") {
                  return [];
              }
              const refs = payload.borderTiles;
              return this.normalizeBorderTileRefs(refs);
          }
          catch (error) {
              console.warn("Failed to resolve player border tiles", error);
              return [];
          }
      }
      normalizeBorderTileRefs(raw) {
          if (!raw || typeof raw !== "object") {
              return [];
          }
          const iterable = raw[Symbol.iterator];
          if (typeof iterable !== "function") {
              return [];
          }
          const refs = [];
          for (const value of raw) {
              const numeric = Number(value);
              if (!Number.isFinite(numeric)) {
                  continue;
              }
              refs.push(numeric);
          }
          return refs;
      }
      resolveTransformHandler() {
          if (typeof document === "undefined") {
              return null;
          }
          const candidates = [
              this.hostDocument.querySelector("build-menu"),
              this.hostDocument.querySelector("emoji-table"),
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
          const controlPanel = this.hostDocument.querySelector("control-panel");
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
          const autoJoinClanLobby = this.createActionDefinition({
              name: "Join lobby with largest clan",
              code: "exports.run = ({ lobby, logger, state, events, snapshot }) => {\n" +
                  "  let inGame = snapshot.players.some(p => !p.isLobbyPlayer);\n" +
                  '  events.on("gameAttached", () => {\n' +
                  "    inGame = true;\n" +
                  "    state.lastJoinGameId = undefined;\n" +
                  "  });\n" +
                  '  events.on("gameDetached", () => {\n' +
                  "    inGame = false;\n" +
                  "    state.lastJoinGameId = undefined;\n" +
                  "    state.lastJoinedGameId = undefined;\n" +
                  "  });\n" +
                  "  const getQueueList = (queues) => {\n" +
                  "    if (Array.isArray(queues) && queues.length > 0) {\n" +
                  "      return queues;\n" +
                  "    }\n" +
                  "    if (Array.isArray(lobby.queues) && lobby.queues.length > 0) {\n" +
                  "      return lobby.queues;\n" +
                  "    }\n" +
                  "    return lobby.queue ? [lobby.queue] : [];\n" +
                  "  };\n" +
                  "  const analyzeQueue = (queue) => {\n" +
                  "    if (!queue) {\n" +
                  "      return null;\n" +
                  "    }\n" +
                  "    if (!queue.playerTeams) {\n" +
                  "      return null;\n" +
                  "    }\n" +
                  "    if (queue.playerCount >= queue.maxPlayers) {\n" +
                  "      return null;\n" +
                  "    }\n" +
                  "    const players = Array.isArray(queue.players) ? queue.players : [];\n" +
                  "    if (players.length === 0) {\n" +
                  "      return null;\n" +
                  "    }\n" +
                  "    const counts = new Map();\n" +
                  "    for (const entry of players) {\n" +
                  "      const tag = lobby.extractClanTag(entry.name);\n" +
                  "      if (!tag) continue;\n" +
                  "      counts.set(tag, (counts.get(tag) ?? 0) + 1);\n" +
                  "    }\n" +
                  "    let best = null;\n" +
                  "    for (const [tag, count] of counts.entries()) {\n" +
                  "      if (!best || count > best.count || (count === best.count && tag < best.tag)) {\n" +
                  "        best = { tag, count };\n" +
                  "      }\n" +
                  "    }\n" +
                  "    let teamSize = 0;\n" +
                  "    if (typeof queue.playerTeams === 'number') {\n" +
                  "      teamSize = Math.floor(queue.maxPlayers / queue.playerTeams);\n" +
                  "    } else if (queue.playerTeams === 'Duos') {\n" +
                  "      teamSize = 2;\n" +
                  "    } else if (queue.playerTeams === 'Trios') {\n" +
                  "      teamSize = 3;\n" +
                  "    } else if (queue.playerTeams === 'Quads') {\n" +
                  "      teamSize = 4;\n" +
                  "    } else if (queue.playerTeams === 'Humans Vs Nations') {\n" +
                  "      teamSize = Math.floor(queue.maxPlayers / 2);\n" +
                  "    }\n" +
                  "    if (best && teamSize > 0 && best.count >= teamSize) {\n" +
                  "      return null;\n" +
                  "    }\n" +
                  "    const slotsLeft = queue.maxPlayers - queue.playerCount;\n" +
                  "    const slotThreshold = Math.ceil(queue.maxPlayers * 0.2);\n" +
                  "    if (slotsLeft > slotThreshold) {\n" +
                  "      return null;\n" +
                  "    }\n" +
                  "    return { queue, best, teamSize, slotsLeft, slotThreshold };\n" +
                  "  };\n" +
                  "  const selectQueue = (queues) => {\n" +
                  "    let selected = null;\n" +
                  "    for (const queue of getQueueList(queues)) {\n" +
                  "      const candidate = analyzeQueue(queue);\n" +
                  "      if (!candidate) {\n" +
                  "        continue;\n" +
                  "      }\n" +
                  "      if (!selected) {\n" +
                  "        selected = candidate;\n" +
                  "        continue;\n" +
                  "      }\n" +
                  "      const selectedCount = selected.best?.count ?? 0;\n" +
                  "      const candidateCount = candidate.best?.count ?? 0;\n" +
                  "      if (candidateCount > selectedCount) {\n" +
                  "        selected = candidate;\n" +
                  "        continue;\n" +
                  "      }\n" +
                  "      if (candidateCount === selectedCount && candidate.slotsLeft < selected.slotsLeft) {\n" +
                  "        selected = candidate;\n" +
                  "      }\n" +
                  "    }\n" +
                  "    return selected;\n" +
                  "  };\n" +
                  "  const apply = (queues) => {\n" +
                  "    const selected = selectQueue(queues);\n" +
                  "    if (!selected) {\n" +
                  "      state.lastJoinGameId = undefined;\n" +
                  "      state.lastJoinedGameId = undefined;\n" +
                  "      state.lastAppliedDisplayName = undefined;\n" +
                  "      return;\n" +
                  "    }\n" +
                  "    const { queue, best, teamSize, slotsLeft, slotThreshold } = selected;\n" +
                  "    if (state.lastJoinedGameId === queue.gameId) {\n" +
                  "      return;\n" +
                  "    }\n" +
                  "    if (inGame) {\n" +
                  '      logger.info("Already in an active game; skipping join.");\n' +
                  "      state.lastJoinGameId = undefined;\n" +
                  "      return;\n" +
                  "    }\n" +
                  '    const currentName = (typeof lobby.getDisplayName === "function" && lobby.getDisplayName()) || "";\n' +
                  '    const baseName = currentName.replace(/^\\s*\\[[^\\]]+\\]\\s*/, "").trim() || currentName.trim() || "Player";\n' +
                  "    const nextName = lobby.buildNameWithClanTag(baseName, best?.tag);\n" +
                  "    if (state.lastAppliedDisplayName !== nextName) {\n" +
                  "      if (lobby.setDisplayName(nextName)) {\n" +
                  "        state.lastAppliedDisplayName = nextName;\n" +
                  '        logger.info(`Set lobby name to "${nextName}"`);\n' +
                  "      } else {\n" +
                  '        logger.warn("Failed to update lobby display name.");\n' +
                  "      }\n" +
                  "    }\n" +
                  "    const alreadyAttempted = state.lastJoinGameId === queue.gameId;\n" +
                  "    if (!alreadyAttempted) {\n" +
                  "      const joined = lobby.join(queue.gameId);\n" +
                  "      state.lastJoinGameId = queue.gameId;\n" +
                  "      if (joined) {\n" +
                  "        logger.info(`Joining lobby ${queue.gameId} (${queue.lobbyLabel || queue.modeName}) with ${nextName}`);\n" +
                  "        state.lastJoinedGameId = queue.gameId;\n" +
                  "      } else {\n" +
                  '        logger.warn("Could not request lobby join (maybe already in-game?)");\n' +
                  "      }\n" +
                  "    }\n" +
                  "  };\n" +
                  "  apply(snapshot.currentLobbyQueues);\n" +
                  '  events.on("lobbiesUpdated", (queues) => {\n' +
                  "    apply(queues);\n" +
                  "  });\n" +
                  "};",
              runMode: "event",
              description: "Automatically joins team game lobbies with the largest clan when 20% or fewer slots remain and the clan won't exceed team size. Once joined, stays in that game.",
              runIntervalTicks: 1,
              enabled: false,
              settings: [],
              timestamp: now,
          });
          const actions = [
              tradeBan,
              enableTrade,
              missileSiloAlerts,
              troopDonationLogger,
              goldDonationLogger,
              autoJoinClanLobby,
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
          this.sidebarLogs = [...this.sidebarLogs, this.enrichLogEntry(entry)];
          if (this.sidebarLogs.length > MAX_LOG_ENTRIES) {
              this.sidebarLogs = this.sidebarLogs.slice(-MAX_LOG_ENTRIES);
          }
          this.sidebarLogRevision += 1;
          this.snapshot = this.attachActionsState({ ...this.snapshot });
          this.notify();
      }
      async refreshLocalPlayerPublicId() {
          if (this.localPlayerPublicId) {
              return;
          }
          if (typeof fetch !== "function") {
              return;
          }
          try {
              const response = await fetch("/api/user_me", {
                  method: "GET",
                  cache: "no-store",
              });
              if (!response.ok) {
                  return;
              }
              const payload = (await response.json());
              const candidate = payload?.player
                  ?.publicId;
              if (typeof candidate === "string" && candidate.trim().length > 0) {
                  this.localPlayerPublicId = candidate.trim();
              }
          }
          catch {
              return;
          }
      }
      enrichLogEntry(entry, playerLookupOverride) {
          const tokens = entry.tokens;
          if (!tokens || tokens.length === 0) {
              return entry;
          }
          const playerLookup = playerLookupOverride ??
              new Map(this.snapshot.players.map((player) => [player.id, player]));
          let changed = false;
          const nextTokens = tokens.map((token) => {
              if (token.type !== "player") {
                  return token;
              }
              const record = playerLookup.get(token.id);
              const clan = record?.clan ?? extractClanTag(record?.name ?? "");
              const team = record?.team ?? "";
              const facets = { ...(token.facets ?? {}) };
              const mergeFacet = (key, values) => {
                  const normalizedValues = values
                      .map((value) => value.trim().toLowerCase())
                      .filter(Boolean);
                  if (normalizedValues.length === 0) {
                      return;
                  }
                  const existing = facets[key] ?? [];
                  const merged = new Set([
                      ...existing
                          .map((value) => value.trim().toLowerCase())
                          .filter(Boolean),
                      ...normalizedValues,
                  ]);
                  facets[key] = Array.from(merged);
              };
              mergeFacet("user", [token.label, token.id, record?.name ?? ""]);
              mergeFacet("player", [token.label, token.id, record?.name ?? ""]);
              if (record?.publicId) {
                  mergeFacet("publicid", [record.publicId]);
              }
              if (clan) {
                  mergeFacet("clan", [clan, `[${clan}]`, `clan ${clan}`]);
              }
              if (team) {
                  mergeFacet("team", [team, `team ${team}`]);
              }
              if (Object.keys(facets).length === Object.keys(token.facets ?? {}).length) {
                  const same = Object.entries(facets).every(([key, values]) => {
                      const prev = token.facets?.[key] ?? [];
                      if (prev.length !== values.length) {
                          return false;
                      }
                      for (let i = 0; i < values.length; i += 1) {
                          if (prev[i] !== values[i]) {
                              return false;
                          }
                      }
                      return true;
                  });
                  if (same) {
                      return token;
                  }
              }
              changed = true;
              return { ...token, facets };
          });
          return changed ? { ...entry, tokens: nextTokens } : entry;
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
          const hadPlayers = this.snapshot.players.length > 0;
          const nextPlayers = snapshot.players ?? [];
          const shouldBackfillLogFacets = !hadPlayers && nextPlayers.length > 0;
          if (shouldBackfillLogFacets && this.sidebarLogs.length > 0) {
              const playerLookup = new Map(nextPlayers.map((player) => [player.id, player]));
              this.sidebarLogs = this.sidebarLogs.map((entry) => this.enrichLogEntry(entry, playerLookup));
              this.sidebarLogRevision += 1;
          }
          this.snapshot = this.attachActionsState({
              ...snapshot,
              currentTimeMs: snapshot.currentTimeMs ?? Date.now(),
              ships: snapshot.ships ?? [],
          });
          this.notify();
      }
      setOverlaysTemporarilyHidden(hidden) {
          if (this.overlaysTemporarilyHidden === hidden) {
              return;
          }
          this.overlaysTemporarilyHidden = hidden;
          this.applyOverlayVisibility();
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
          this.syncOverlayRuntime(overlayId);
      }
      isOverlayEnabled(overlayId) {
          return this.sidebarOverlays.some((overlay) => overlay.id === overlayId && overlay.enabled);
      }
      applyOverlayVisibility() {
          const visible = !this.overlaysTemporarilyHidden;
          this.missileOverlay?.setVisible(visible);
          this.historicalMissileOverlay?.setVisible(visible);
          this.missileImpactOverlay?.setVisible(visible);
          this.troopDonationOverlay?.setVisible(visible);
          this.goldDonationOverlay?.setVisible(visible);
          this.tradeRouteOverlay?.setVisible(visible);
          this.transportDestinationOverlay?.setVisible(visible);
          this.attackBorderOverlay?.setVisible(visible);
      }
      syncOverlayRuntime(overlayId) {
          const shouldEnable = this.isOverlayEnabled(overlayId);
          const visible = !this.overlaysTemporarilyHidden;
          if (overlayId === MISSILE_TRAJECTORY_OVERLAY_ID) {
              if (!shouldEnable) {
                  this.missileOverlay?.disable();
                  return;
              }
              const effect = this.ensureMissileOverlay();
              effect.setVisible(visible);
              effect.setSiloPositions(this.collectMissileSiloPositions());
              effect.enable();
              return;
          }
          if (overlayId === HISTORICAL_MISSILE_OVERLAY_ID) {
              if (!shouldEnable) {
                  this.historicalMissileOverlay?.disable();
                  return;
              }
              const effect = this.ensureHistoricalMissileOverlay();
              effect.setVisible(visible);
              effect.setTrajectories(this.collectHistoricalMissiles());
              effect.enable();
              return;
          }
          if (overlayId === MISSILE_IMPACT_OVERLAY_ID) {
              if (!shouldEnable) {
                  this.missileImpactOverlay?.disable();
                  return;
              }
              const effect = this.ensureMissileImpactOverlay();
              effect.setVisible(visible);
              effect.setTrajectories(this.collectHistoricalMissiles());
              effect.enable();
              return;
          }
          if (overlayId === TROOP_DONATION_OVERLAY_ID) {
              if (!shouldEnable) {
                  this.troopDonationOverlay?.disable();
                  return;
              }
              const effect = this.ensureTroopDonationOverlay();
              effect.setVisible(visible);
              this.syncTroopDonationOverlay();
              effect.enable();
              return;
          }
          if (overlayId === GOLD_DONATION_OVERLAY_ID) {
              if (!shouldEnable) {
                  this.goldDonationOverlay?.disable();
                  return;
              }
              const effect = this.ensureGoldDonationOverlay();
              effect.setVisible(visible);
              this.syncGoldDonationOverlay();
              effect.enable();
              return;
          }
          if (overlayId === TRADE_ROUTE_OVERLAY_ID) {
              if (!shouldEnable) {
                  this.tradeRouteOverlay?.disable();
                  return;
              }
              const effect = this.ensureTradeRouteOverlay();
              effect.setVisible(visible);
              this.syncTradeRouteOverlay();
              effect.enable();
              return;
          }
          if (overlayId === TRANSPORT_DESTINATION_OVERLAY_ID) {
              if (!shouldEnable) {
                  this.transportDestinationOverlay?.disable();
                  return;
              }
              const effect = this.ensureTransportDestinationOverlay();
              effect.setVisible(visible);
              this.syncTransportDestinationOverlay();
              effect.enable();
              return;
          }
          if (overlayId === ATTACK_BORDER_OVERLAY_ID) {
              if (!shouldEnable) {
                  this.attackBorderSyncQueued = false;
                  this.attackBorderOverlay?.disable();
                  this.attackBorderOverlay?.clear();
                  return;
              }
              const effect = this.ensureAttackBorderOverlay();
              effect.setVisible(visible);
              effect.enable();
              this.syncAttackBorderOverlay();
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
              console.warn("Continuous sidebar actions are unavailable outside the browser.");
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
          const logger = createSidebarLogger(`Action ${run.name} [${run.id}]`, {
              emitToConsole: false,
          });
          return {
              game: this.buildActionGameApi(),
              lobby: this.buildActionLobbyApi(),
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
      buildActionLobbyApi() {
          return {
              queue: this.snapshot.currentLobbyQueue,
              queues: this.snapshot.currentLobbyQueues,
              extractClanTag,
              buildNameWithClanTag: (baseName, clanTag) => this.buildDisplayNameWithClan(baseName, clanTag),
              join: (gameId) => this.requestLobbyJoin(gameId),
              setDisplayName: (name) => this.applyLobbyDisplayName(name),
              getDisplayName: () => this.readLobbyDisplayName(),
          };
      }
      buildDisplayNameWithClan(baseName, clanTag) {
          const trimmedBase = (baseName ?? "").toString().trim();
          const safeBase = trimmedBase.length > 0 ? trimmedBase : "Player";
          const tag = (clanTag ?? "").trim();
          const candidate = tag ? `[${tag}] ${safeBase}` : safeBase;
          return Array.from(candidate).slice(0, 27).join("");
      }
      splitLobbyDisplayName(displayName) {
          const trimmed = (displayName ?? "").trim();
          const clanTag = extractClanTag(trimmed);
          if (!clanTag) {
              return {
                  baseName: trimmed,
              };
          }
          return {
              baseName: trimmed.replace(`[${clanTag}]`, "").trim(),
              clanTag,
          };
      }
      isTextInputElement(value) {
          if (!value || typeof value !== "object") {
              return false;
          }
          const candidate = value;
          return (candidate.type === "text" &&
              typeof candidate.value === "string" &&
              typeof candidate.dispatchEvent === "function");
      }
      readLobbyDisplayNameParts() {
          if (typeof window === "undefined") {
              return {};
          }
          const usernameInput = document.querySelector("username-input");
          if (!usernameInput) {
              const stored = readPersistedString(USERNAME_STORAGE_KEY);
              const trimmed = stored?.trim();
              if (!trimmed) {
                  return {};
              }
              const parts = this.splitLobbyDisplayName(trimmed);
              return {
                  displayName: trimmed,
                  clanTag: parts.clanTag,
              };
          }
          const componentValue = typeof usernameInput.getCurrentUsername === "function"
              ? usernameInput.getCurrentUsername().trim()
              : "";
          const textInputs = Array.from(usernameInput.querySelectorAll("input")).filter((input) => this.isTextInputElement(input));
          const tagInputValue = textInputs[0]?.value?.trim();
          const baseInputValue = textInputs[1]?.value?.trim();
          const combinedValue = baseInputValue && baseInputValue.length > 0
              ? this.buildDisplayNameWithClan(baseInputValue, tagInputValue)
              : componentValue;
          if (combinedValue && combinedValue.length > 0) {
              const parts = this.splitLobbyDisplayName(combinedValue);
              return {
                  displayName: combinedValue,
                  clanTag: tagInputValue || parts.clanTag,
              };
          }
          const stored = readPersistedString(USERNAME_STORAGE_KEY);
          const trimmed = stored?.trim();
          if (!trimmed) {
              return {};
          }
          const parts = this.splitLobbyDisplayName(trimmed);
          return {
              displayName: trimmed,
              clanTag: parts.clanTag,
          };
      }
      readLobbyDisplayName() {
          return this.readLobbyDisplayNameParts().displayName;
      }
      resolveCurrentLobbyClanTag() {
          const clanTag = this.readLobbyDisplayNameParts().clanTag;
          const trimmed = clanTag?.trim();
          return trimmed && trimmed.length > 0 ? trimmed : undefined;
      }
      requestLobbyJoin(gameId) {
          if (typeof document === "undefined") {
              return false;
          }
          if (this.game) {
              console.warn("Cannot join a lobby while already attached to a live game.");
              return false;
          }
          const fallbackQueue = this.snapshot.currentLobbyQueues?.[0] ?? this.snapshot.currentLobbyQueue;
          const target = (gameId ?? fallbackQueue?.gameId)?.trim();
          if (!target) {
              return false;
          }
          const clientID = this.generateLobbyClientId();
          try {
              const event = new CustomEvent("join-lobby", {
                  detail: { gameID: target, clientID },
                  bubbles: true,
                  composed: true,
              });
              document.dispatchEvent(event);
              sidebarLogger.info(`Requested lobby join for ${target} (client ${clientID}).`);
              return true;
          }
          catch (error) {
              sidebarLogger.error("Failed to dispatch lobby join request", error);
              return false;
          }
      }
      generateLobbyClientId() {
          // Generate an 8-character ID using the same alphabet as the game's generateID()
          // Excludes confusing characters: 0, O, l, I
          // Matches the game server validation pattern: /^[a-zA-Z0-9]+$/
          const alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
          let result = "";
          for (let i = 0; i < 8; i++) {
              result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          }
          return result;
      }
      applyLobbyDisplayName(name) {
          if (typeof window === "undefined") {
              return false;
          }
          if (typeof name !== "string") {
              return false;
          }
          const trimmed = name.trim();
          if (!trimmed) {
              return false;
          }
          const normalized = Array.from(trimmed).slice(0, 27).join("");
          const { baseName, clanTag } = this.splitLobbyDisplayName(normalized);
          writePersistedString(USERNAME_STORAGE_KEY, normalized);
          const usernameInput = document.querySelector("username-input");
          const textInputs = Array.from(usernameInput?.querySelectorAll("input") ?? []).filter((input) => this.isTextInputElement(input));
          if (textInputs.length >= 2) {
              const tagInput = textInputs[0];
              const baseInput = textInputs[1];
              if (tagInput) {
                  tagInput.value = clanTag ?? "";
                  tagInput.dispatchEvent(new Event("input", { bubbles: true }));
              }
              if (baseInput) {
                  baseInput.value = baseName;
                  baseInput.dispatchEvent(new Event("input", { bubbles: true }));
              }
          }
          else {
              const input = textInputs[0];
              if (input) {
                  input.value = normalized;
                  input.dispatchEvent(new Event("input", { bubbles: true }));
              }
          }
          sidebarLogger.info(`Updated lobby display name to "${normalized}".`);
          const nextSnapshot = this.attachActionsState({ ...this.snapshot });
          if (nextSnapshot.currentLobbyClanTag !== this.snapshot.currentLobbyClanTag) {
              this.snapshot = nextSnapshot;
              this.notify();
          }
          return true;
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
          this.attackBorderOverlay?.clear();
          this.lastLiveGameTeamLogKey = null;
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
                      console.warn(`${label} failed.`);
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
          const element = this.hostDocument.querySelector("player-panel");
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
                  const wasAttached = Boolean(this.game);
                  this.stopDisplayEventPolling();
                  this.game = discovered;
                  if (!wasAttached) {
                      this.emitActionEvent("gameAttached", null);
                  }
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
          const candidates = this.hostDocument.querySelectorAll("player-panel, leader-board, game-right-sidebar");
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
              const records = players.map((player) => this.createPlayerRecord(player, currentTimeMs, localPlayer));
              const recordLookup = new Map();
              for (const record of records) {
                  recordLookup.set(record.id, record);
              }
              const ships = this.createShipRecords(recordLookup);
              const hadLivePlayers = this.snapshot.players.some((player) => !player.isLobbyPlayer);
              const livePlayers = records.filter((player) => !player.isLobbyPlayer);
              if (livePlayers.length === 0) {
                  this.lastLiveGameTeamLogKey = null;
              }
              else {
                  const signature = this.buildPlayerTeamSignature(livePlayers);
                  const shouldLog = !hadLivePlayers || this.lastLiveGameTeamLogKey !== signature;
                  this.lastLiveGameTeamLogKey = signature;
                  if (shouldLog) {
                      this.logLiveGameTeams(livePlayers);
                  }
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
              this.syncTradeRouteOverlay(players, recordLookup);
              this.syncTransportDestinationOverlay(ships, records);
              this.syncAttackBorderOverlay(players);
              this.notify();
          }
          catch (error) {
              // If the game context changes while we're reading from it, try attaching again.
              console.warn("Failed to refresh sidebar data", error);
              this.game = null;
              this.emitActionEvent("gameDetached", null);
              this.resetLiveGameTracking();
              this.troopDonationOverlay?.clear();
              this.goldDonationOverlay?.clear();
              this.tradeRouteOverlay?.clear();
              this.transportDestinationOverlay?.clear();
              this.attackBorderOverlay?.clear();
              if (this.refreshHandle !== undefined) {
                  window.clearInterval(this.refreshHandle);
                  this.refreshHandle = undefined;
              }
              this.stopDisplayEventPolling();
              this.scheduleGameDiscovery();
          }
      }
      createShipRecords(playerRecords) {
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
              ships.push(this.createShipRecord(unit, type, playerRecords));
          }
          ships.sort((a, b) => a.ownerName.localeCompare(b.ownerName));
          this.pruneStaleShipMemory(new Set(ships.map((ship) => ship.id)));
          return ships;
      }
      createShipRecord(unit, type, playerRecords) {
          const owner = unit.owner();
          const ownerId = String(owner.id());
          const ownerName = owner.displayName();
          const shipId = String(unit.id());
          const troops = this.resolveShipTroops(shipId, unit, type);
          const origin = this.resolveShipOrigin(shipId, unit);
          const current = this.describeTile(unit.tile());
          const retreating = this.resolveShipRetreating(unit);
          const destination = this.resolveShipDestination(shipId, unit, type, retreating);
          const record = ownerId ? playerRecords.get(ownerId) : undefined;
          let ownerTeam = record?.team;
          if (!ownerTeam) {
              try {
                  const resolved = owner.team?.();
                  if (resolved) {
                      ownerTeam = resolved;
                  }
              }
              catch (error) {
                  console.warn("Failed to resolve ship owner team", error);
              }
          }
          const ownerClan = record?.clan ?? extractClanTag(ownerName);
          return {
              id: String(unit.id()),
              type,
              ownerId,
              ownerName,
              ownerClan,
              ownerTeam: ownerTeam ?? undefined,
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
          this.lastProcessedDisplayEventArray = null;
          this.lastProcessedDisplayEventArrayLength = 0;
          this.recentTroopDonations.clear();
          this.recentGoldDonations.clear();
          this.pendingWebSocketDonationIntents = [];
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
          const records = playerRecords ?? this.buildPlayerRecordLookupFromSnapshot();
          this.processPendingWebSocketDonationIntents(records);
          const rawDisplayEvents = this.extractRawDisplayEvents(updates);
          if (!rawDisplayEvents) {
              this.lastProcessedDisplayUpdates = updates;
              this.lastProcessedDisplayEventArray = null;
              this.lastProcessedDisplayEventArrayLength = 0;
              return;
          }
          const sameUpdatesObject = updates === this.lastProcessedDisplayUpdates;
          const sameArrayObject = rawDisplayEvents === this.lastProcessedDisplayEventArray;
          const previousLength = sameArrayObject
              ? this.lastProcessedDisplayEventArrayLength
              : 0;
          if (sameUpdatesObject &&
              sameArrayObject &&
              rawDisplayEvents.length <= previousLength) {
              return;
          }
          this.lastProcessedDisplayUpdates = updates;
          this.lastProcessedDisplayEventArray = rawDisplayEvents;
          this.lastProcessedDisplayEventArrayLength = rawDisplayEvents.length;
          const displayEvents = [];
          for (let index = previousLength; index < rawDisplayEvents.length; index += 1) {
              const entry = rawDisplayEvents[index];
              if (this.isDisplayMessageUpdate(entry)) {
                  displayEvents.push(entry);
              }
          }
          if (displayEvents.length === 0) {
              return;
          }
          const { troopDonations, goldDonations } = this.resolveDonationEvents(displayEvents, records);
          for (const troopDonation of troopDonations) {
              this.handleResolvedDonation("troops", troopDonation);
          }
          for (const goldDonation of goldDonations) {
              this.handleResolvedDonation("gold", goldDonation);
          }
      }
      processPendingWebSocketDonationIntents(playerRecords) {
          if (this.pendingWebSocketDonationIntents.length === 0) {
              return;
          }
          const unresolved = [];
          const expirationThreshold = Date.now() - WEB_SOCKET_DONATION_PENDING_TTL_MS;
          for (const candidate of this.pendingWebSocketDonationIntents) {
              if (candidate.observedAtMs <= expirationThreshold) {
                  continue;
              }
              const senderRecord = this.resolvePlayerRecordByClientId(candidate.senderClientId, playerRecords);
              const recipientRecord = playerRecords.get(candidate.recipientPlayerId);
              if (!senderRecord || !recipientRecord) {
                  unresolved.push(candidate);
              }
          }
          this.pendingWebSocketDonationIntents = unresolved;
      }
      handleResolvedDonation(kind, donation) {
          const store = kind === "troops" ? this.recentTroopDonations : this.recentGoldDonations;
          if (!this.registerDonation(donation, store)) {
              return;
          }
          if (kind === "troops") {
              const event = donation;
              this.emitActionEvent("troopsDonated", event);
              if (this.troopDonationOverlay?.isActive()) {
                  const senderView = this.resolvePlayerViewById(event.senderId);
                  this.troopDonationOverlay.registerDonation(event, {
                      fallbackColor: this.resolvePlayerColor(senderView),
                  });
              }
              return;
          }
          const event = donation;
          this.emitActionEvent("goldDonated", event);
          if (this.goldDonationOverlay?.isActive()) {
              const senderView = this.resolvePlayerViewById(event.senderId);
              this.goldDonationOverlay.registerDonation(event, {
                  fallbackColor: this.resolvePlayerColor(senderView),
              });
          }
      }
      extractRawDisplayEvents(updates) {
          if (!updates) {
              return null;
          }
          const raw = updates[GAME_UPDATE_TYPE_DISPLAY_EVENT];
          return Array.isArray(raw) ? raw : null;
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
      resolveDonationEvents(displayEvents, playerRecords) {
          const candidates = [];
          for (const event of displayEvents) {
              const troopParsed = this.parseTroopDonationMessage(event);
              if (troopParsed) {
                  candidates.push({
                      kind: "troops",
                      direction: troopParsed.direction,
                      amountDisplay: troopParsed.amountDisplay,
                      amountApprox: this.parseDonationAmount(troopParsed.amountDisplay),
                      otherName: troopParsed.otherName,
                      playerSmallId: event.playerID,
                  });
                  continue;
              }
              const goldParsed = this.parseGoldDonationMessage(event);
              if (goldParsed) {
                  candidates.push({
                      kind: "gold",
                      direction: goldParsed.direction,
                      amountDisplay: goldParsed.amountDisplay,
                      amountApprox: this.parseDonationAmount(goldParsed.amountDisplay),
                      otherName: goldParsed.otherName,
                      playerSmallId: event.playerID,
                  });
              }
          }
          const troopDonations = this.resolveDonationCandidates(candidates.filter((candidate) => candidate.kind === "troops"), playerRecords);
          const goldDonations = this.resolveDonationCandidates(candidates.filter((candidate) => candidate.kind === "gold"), playerRecords);
          return { troopDonations, goldDonations };
      }
      resolveDonationCandidates(candidates, playerRecords) {
          const resolved = [];
          if (candidates.length === 0) {
              return resolved;
          }
          const used = new Set();
          const nameCache = new Map();
          const amountKeyFor = (candidate) => this.buildDonationAmountKey(candidate.amountDisplay, candidate.amountApprox);
          const resolveName = (smallId) => {
              if (smallId === null) {
                  return null;
              }
              if (nameCache.has(smallId)) {
                  return nameCache.get(smallId) ?? null;
              }
              const name = this.resolveDisplayNameBySmallIdForDonation(smallId);
              const normalized = name ? this.normalizeDonationName(name) : null;
              nameCache.set(smallId, normalized);
              return normalized;
          };
          for (let i = 0; i < candidates.length; i += 1) {
              const candidate = candidates[i];
              if (candidate.direction !== "sent") {
                  continue;
              }
              if (used.has(i)) {
                  continue;
              }
              const senderSmallId = candidate.playerSmallId;
              if (senderSmallId === null) {
                  continue;
              }
              const senderName = resolveName(senderSmallId);
              if (!senderName) {
                  continue;
              }
              const recipientNameFromMessage = this.normalizeDonationName(candidate.otherName);
              const amountKey = amountKeyFor(candidate);
              let matchIndex = null;
              for (let j = 0; j < candidates.length; j += 1) {
                  if (j === i || used.has(j)) {
                      continue;
                  }
                  const other = candidates[j];
                  if (other.direction !== "received") {
                      continue;
                  }
                  if (other.playerSmallId === null) {
                      continue;
                  }
                  if (amountKeyFor(other) !== amountKey) {
                      continue;
                  }
                  const otherSenderName = this.normalizeDonationName(other.otherName);
                  if (otherSenderName !== senderName) {
                      continue;
                  }
                  const recipientName = resolveName(other.playerSmallId);
                  if (!recipientName || recipientName !== recipientNameFromMessage) {
                      continue;
                  }
                  matchIndex = j;
                  break;
              }
              if (matchIndex !== null) {
                  used.add(i);
                  used.add(matchIndex);
                  const recipientSmallId = candidates[matchIndex].playerSmallId;
                  const amountApprox = candidate.amountApprox ?? candidates[matchIndex].amountApprox ?? null;
                  const donation = this.createDonationEventFromSmallIds(senderSmallId, recipientSmallId, candidate.amountDisplay, amountApprox, playerRecords);
                  if (donation) {
                      resolved.push(donation);
                  }
              }
          }
          for (let i = 0; i < candidates.length; i += 1) {
              if (used.has(i)) {
                  continue;
              }
              const candidate = candidates[i];
              const actorSmallId = candidate.playerSmallId;
              if (actorSmallId === null) {
                  continue;
              }
              const otherView = this.findPlayerViewByNameUnique(candidate.otherName);
              if (!otherView) {
                  continue;
              }
              const otherSmallId = this.safePlayerSmallId(otherView);
              if (otherSmallId === null) {
                  continue;
              }
              const senderSmallId = candidate.direction === "sent" ? actorSmallId : otherSmallId;
              const recipientSmallId = candidate.direction === "sent" ? otherSmallId : actorSmallId;
              const donation = this.createDonationEventFromSmallIds(senderSmallId, recipientSmallId, candidate.amountDisplay, candidate.amountApprox, playerRecords);
              if (donation) {
                  resolved.push(donation);
              }
          }
          return resolved;
      }
      resolvePlayerRecordByClientId(clientId, records) {
          const normalized = clientId.trim();
          if (!normalized) {
              return null;
          }
          for (const record of records.values()) {
              if (record.clientID === normalized) {
                  return record;
              }
          }
          if (this.game && typeof this.game.playerByClientID === "function") {
              try {
                  const view = this.game.playerByClientID(normalized);
                  const id = view ? this.safePlayerId(view) : undefined;
                  if (!id) {
                      return null;
                  }
                  return records.get(id) ?? null;
              }
              catch {
                  return null;
              }
          }
          return null;
      }
      createDonationEventFromSmallIds(senderSmallId, recipientSmallId, amountDisplay, amountApprox, playerRecords) {
          const sender = this.buildPlayerSummaryFromSmallId(senderSmallId, playerRecords);
          const recipient = this.buildPlayerSummaryFromSmallId(recipientSmallId, playerRecords);
          if (!sender || !recipient) {
              return null;
          }
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
              amountDisplay,
              amountApprox,
              tick: this.getCurrentGameTick(),
          };
      }
      buildDonationAmountKey(amountDisplay, amountApprox) {
          const hasApprox = amountApprox !== null && amountApprox !== undefined;
          return hasApprox ? `~${amountApprox}` : amountDisplay.trim().toLowerCase();
      }
      normalizeDonationName(name) {
          return name.replace(/\s+/g, " ").trim();
      }
      resolveDisplayNameBySmallIdForDonation(smallId) {
          if (!this.game) {
              return null;
          }
          try {
              const entity = this.game.playerBySmallID(smallId);
              if ("displayName" in entity && typeof entity.displayName === "function") {
                  const name = entity.displayName();
                  return typeof name === "string" && name.trim() ? name.trim() : null;
              }
              if ("name" in entity && typeof entity.name === "function") {
                  const name = entity.name();
                  return typeof name === "string" && name.trim() ? name.trim() : null;
              }
          }
          catch {
              // Ignore name resolution failures for donation matching.
          }
          return null;
      }
      findPlayerViewByNameUnique(name) {
          if (!this.game) {
              return null;
          }
          const normalized = this.normalizeDonationName(name);
          if (!normalized) {
              return null;
          }
          let match = null;
          try {
              const players = this.game.playerViews();
              for (const player of players) {
                  let displayName = null;
                  try {
                      displayName = this.normalizeDonationName(player.displayName());
                  }
                  catch {
                      displayName = null;
                  }
                  if (!displayName || displayName !== normalized) {
                      continue;
                  }
                  if (match) {
                      return null;
                  }
                  match = player;
              }
          }
          catch (error) {
              console.warn("Failed to search players by name", error);
              return null;
          }
          return match;
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
          const params = update.params;
          const paramValue = (key) => {
              if (!params || typeof params !== "object") {
                  return null;
              }
              const value = params[key];
              if (typeof value === "string") {
                  const trimmed = value.trim();
                  return trimmed === "" ? null : trimmed;
              }
              if (typeof value === "number") {
                  return Number.isFinite(value) ? String(value) : null;
              }
              return null;
          };
          if (update.messageType === MESSAGE_TYPE_SENT_TROOPS_TO_PLAYER) {
              const troops = paramValue("troops");
              const name = paramValue("name");
              if (troops && name) {
                  return { direction: "sent", amountDisplay: troops, otherName: name };
              }
              if (!message) {
                  return null;
              }
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
              const troops = paramValue("troops");
              const name = paramValue("name");
              if (troops && name) {
                  return {
                      direction: "received",
                      amountDisplay: troops,
                      otherName: name,
                  };
              }
              if (!message) {
                  return null;
              }
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
          const params = update.params;
          const paramValue = (key) => {
              if (!params || typeof params !== "object") {
                  return null;
              }
              const value = params[key];
              if (typeof value === "string") {
                  const trimmed = value.trim();
                  return trimmed === "" ? null : trimmed;
              }
              if (typeof value === "number") {
                  return Number.isFinite(value) ? String(value) : null;
              }
              if (typeof value === "bigint") {
                  return value.toString();
              }
              return null;
          };
          if (update.messageType === MESSAGE_TYPE_SENT_GOLD_TO_PLAYER) {
              const gold = paramValue("gold");
              const name = paramValue("name");
              if (gold && name) {
                  return { direction: "sent", amountDisplay: gold, otherName: name };
              }
              if (!message) {
                  return null;
              }
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
              const gold = paramValue("gold");
              const name = paramValue("name");
              if (gold && name) {
                  return { direction: "received", amountDisplay: gold, otherName: name };
              }
              if (!message) {
                  return null;
              }
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
      safePlayerClientId(player) {
          try {
              if (typeof player.clientID === "function") {
                  const raw = player.clientID();
                  if (typeof raw === "string" && raw.trim()) {
                      return raw.trim();
                  }
              }
          }
          catch (error) {
              console.warn("Failed to resolve player clientID", error);
          }
          const rawClientId = player.data
              ?.clientID;
          if (typeof rawClientId === "string" && rawClientId.trim()) {
              return rawClientId.trim();
          }
          if (typeof rawClientId === "number" && Number.isFinite(rawClientId)) {
              return String(rawClientId);
          }
          return undefined;
      }
      resolvePlayerViewByClientId(clientId) {
          if (!this.game) {
              return null;
          }
          const normalized = clientId.trim();
          if (!normalized) {
              return null;
          }
          if (typeof this.game.playerByClientID === "function") {
              try {
                  const direct = this.game.playerByClientID(normalized);
                  if (this.isPlayerViewLike(direct)) {
                      return direct;
                  }
              }
              catch {
                  // Fall through to linear scan.
              }
          }
          try {
              const players = this.game.playerViews();
              for (const player of players) {
                  if (this.safePlayerClientId(player) === normalized) {
                      return player;
                  }
              }
          }
          catch {
              return null;
          }
          return null;
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
          const nonExpansionOutgoing = outgoingRaw.filter((attack) => attack.targetID !== 0);
          const outgoingAttacks = this.mapOutgoingAttacks(nonExpansionOutgoing);
          const expansions = outgoingRaw.length - nonExpansionOutgoing.length;
          const alliances = this.mapActiveAlliances(player);
          const goldValue = player.gold();
          const gold = typeof goldValue === "bigint" ? Number(goldValue) : goldValue;
          const troops = player.isAlive() ? player.troops() : 0;
          const tradeStatus = this.determineTradeStatus(localPlayer, player);
          const tradeStopped = tradeStatus.stopped;
          const tradeStoppedBySelf = tradeStatus.stoppedBySelf;
          const tradeStoppedByOther = tradeStatus.stoppedByOther;
          const isSelf = this.isSamePlayer(localPlayer, playerId);
          const clientID = this.safePlayerClientId(player);
          return {
              id: playerId,
              clientID,
              publicId: isSelf ? (this.localPlayerPublicId ?? undefined) : undefined,
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
              troops,
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
      formatAttackBorderTroopCount(rawTroops) {
          const normalized = Math.floor(Math.max(rawTroops, 0) / 10);
          if (normalized <= 0) {
              return null;
          }
          if (normalized < ATTACK_BORDER_TROOP_COMPACT_THRESHOLD) {
              return formatTroopCount(rawTroops);
          }
          try {
              return ATTACK_BORDER_TROOP_COMPACT_FORMATTER.format(normalized);
          }
          catch {
              return formatTroopCount(rawTroops);
          }
      }
      resolveAttackBorderLabelMinScale(edgeCount) {
          if (!Number.isFinite(edgeCount) || edgeCount <= 0) {
              return 0;
          }
          if (edgeCount <= ATTACK_BORDER_ZOOM_EDGE_TINY_MAX) {
              return ATTACK_BORDER_ZOOM_MIN_SCALE_TINY;
          }
          if (edgeCount <= ATTACK_BORDER_ZOOM_EDGE_SMALL_MAX) {
              return ATTACK_BORDER_ZOOM_MIN_SCALE_SMALL;
          }
          if (edgeCount <= ATTACK_BORDER_ZOOM_EDGE_MEDIUM_MAX) {
              return ATTACK_BORDER_ZOOM_MIN_SCALE_MEDIUM;
          }
          if (edgeCount <= ATTACK_BORDER_ZOOM_EDGE_LARGE_MAX) {
              return ATTACK_BORDER_ZOOM_MIN_SCALE_LARGE;
          }
          return 0;
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
      resolveLocalPlayerSmallId() {
          const local = this.resolveLocalPlayer();
          if (!local) {
              return null;
          }
          return this.safePlayerSmallId(local);
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
      startLobbyQueueUpdates() {
          if (typeof window === "undefined") {
              return;
          }
          if (this.lobbyQueueRefreshHandle !== undefined) {
              window.clearInterval(this.lobbyQueueRefreshHandle);
              this.lobbyQueueRefreshHandle = undefined;
          }
          {
              this.latestFeaturedLobbySummaries = null;
              this.lobbyQueueRefreshPromise = null;
              this.clearLobbyQueueSnapshot();
              return;
          }
      }
      enqueueLobbyQueueRefresh() {
          {
              this.clearLobbyQueueSnapshot();
              return;
          }
      }
      async performLobbyQueueRefresh() {
          {
              this.clearLobbyQueueSnapshot();
              return;
          }
      }
      clearLobbyQueueSnapshot() {
          const hadQueue = Boolean(this.snapshot.currentLobbyQueue);
          const hadQueues = (this.snapshot.currentLobbyQueues?.length ?? 0) > 0;
          const shouldDropLobbyPlayers = !this.game;
          const hadLobbyPlayers = shouldDropLobbyPlayers
              ? this.snapshot.players.some((player) => player.isLobbyPlayer)
              : false;
          if (!hadQueue && !hadQueues && !hadLobbyPlayers) {
              return;
          }
          this.lastLobbyTeamLogKey = null;
          if (shouldDropLobbyPlayers) {
              this.lastLiveGameTeamLogKey = null;
          }
          const players = shouldDropLobbyPlayers && hadLobbyPlayers
              ? this.snapshot.players.filter((player) => !player.isLobbyPlayer)
              : this.snapshot.players;
          const next = this.attachActionsState({
              ...this.snapshot,
              players,
              currentLobbyQueue: undefined,
              currentLobbyQueues: undefined,
          });
          if (hadQueue || hadQueues) {
              this.emitActionEvent("lobbiesUpdated", []);
          }
          this.snapshot = next;
          this.notify();
      }
      async resolveFeaturedLobbies() {
          {
              return [];
          }
      }
      readFeaturedLobbiesFromSelector() {
          const element = this.hostDocument.querySelector("game-mode-selector");
          if (!element) {
              return [];
          }
          return this.normalizePublicLobbyUpdatePayload(element.lobbies);
      }
      normalizeLobbySummary(input) {
          if (!input ||
              typeof input.gameID !== "string" ||
              input.gameID.length === 0) {
              return null;
          }
          const summary = {
              gameID: input.gameID,
          };
          if (typeof input.numClients === "number") {
              summary.numClients = input.numClients;
          }
          if (typeof input.msUntilStart === "number") {
              summary.msUntilStart = input.msUntilStart;
          }
          if (typeof input.startsAt === "number" && Number.isFinite(input.startsAt)) {
              summary.startsAt = input.startsAt;
          }
          if (input.publicGameType === "ffa" ||
              input.publicGameType === "team" ||
              input.publicGameType === "special") {
              summary.publicGameType = input.publicGameType;
          }
          if (input.gameConfig) {
              summary.gameConfig = {
                  gameMap: typeof input.gameConfig.gameMap === "string"
                      ? input.gameConfig.gameMap
                      : undefined,
                  gameMode: typeof input.gameConfig.gameMode === "string"
                      ? input.gameConfig.gameMode
                      : undefined,
                  maxPlayers: typeof input.gameConfig.maxPlayers === "number"
                      ? input.gameConfig.maxPlayers
                      : undefined,
                  playerTeams: typeof input.gameConfig.playerTeams === "number" ||
                      typeof input.gameConfig.playerTeams === "string"
                      ? input.gameConfig.playerTeams
                      : undefined,
              };
          }
          return summary;
      }
      normalizePublicLobbyUpdatePayload(payload) {
          if (!payload || typeof payload !== "object") {
              return [];
          }
          const candidate = payload;
          const summaries = [];
          const serverTime = typeof candidate.serverTime === "number" &&
              Number.isFinite(candidate.serverTime)
              ? candidate.serverTime
              : undefined;
          for (const publicGameType of FEATURED_PUBLIC_GAME_ORDER) {
              const entries = candidate.games?.[publicGameType];
              if (!Array.isArray(entries)) {
                  continue;
              }
              for (const entry of entries) {
                  const normalized = this.normalizeLobbySummary({
                      ...entry,
                      publicGameType,
                      startsAt: typeof entry?.startsAt === "number" &&
                          Number.isFinite(entry.startsAt)
                          ? entry.startsAt
                          : typeof entry?.msUntilStart === "number" &&
                              Number.isFinite(entry.msUntilStart) &&
                              serverTime !== undefined
                              ? serverTime + Math.max(0, entry.msUntilStart)
                              : undefined,
                  });
                  if (normalized) {
                      summaries.push(normalized);
                  }
              }
          }
          return this.prioritizeLobbySummaries(summaries);
      }
      prioritizeLobbySummaries(summaries) {
          const unique = new Map();
          for (const summary of summaries) {
              if (!unique.has(summary.gameID)) {
                  unique.set(summary.gameID, summary);
              }
          }
          const ordered = Array.from(unique.values());
          const prioritized = [];
          for (const publicGameType of FEATURED_PUBLIC_GAME_ORDER) {
              const match = ordered.find((summary) => summary.publicGameType === publicGameType);
              if (match) {
                  prioritized.push(match);
              }
          }
          for (const summary of ordered) {
              if (prioritized.length >= FEATURED_PUBLIC_GAME_ORDER.length) {
                  break;
              }
              if (!prioritized.some((entry) => entry.gameID === summary.gameID)) {
                  prioritized.push(summary);
              }
          }
          return prioritized;
      }
      formatLobbyQueueLabel(mapName, modeName) {
          const safeMapName = mapName.trim();
          const safeModeName = modeName.trim();
          if (safeMapName && safeModeName) {
              return `${safeMapName} • ${safeModeName}`;
          }
          return safeMapName || safeModeName || "Lobby queue";
      }
      async fetchPublicLobbySummaries() {
          {
              return [];
          }
      }
      async buildLobbyQueueInfo(summary) {
          {
              return null;
          }
      }
      deriveLobbyPlayerList(details) {
          const players = [];
          for (const client of details.clients) {
              const id = typeof client.clientID === "string" && client.clientID.length > 0
                  ? client.clientID
                  : `client-${players.length}`;
              const name = typeof client.username === "string" && client.username.trim().length > 0
                  ? client.username.trim()
                  : "Anonymous player";
              players.push({ id, name });
          }
          return players;
      }
      createLobbyQueuePlayers(queue) {
          const now = Date.now();
          const fallbackTeamName = queue.lobbyLabel || "Lobby queue";
          const normalizedPlayers = queue.players.map((entry, index) => {
              const trimmedName = entry.name?.trim() ?? "Anonymous player";
              const safeName = trimmedName.length > 0 ? trimmedName : "Anonymous player";
              const playerId = entry.id && entry.id.length > 0
                  ? `lobby:${queue.gameId}:${entry.id}`
                  : `lobby:${queue.gameId}:slot-${index + 1}`;
              return {
                  id: playerId,
                  name: safeName,
                  clan: extractClanTag(safeName),
                  lobbyPosition: index + 1,
              };
          });
          const predictedTeams = predictLobbyTeams(normalizedPlayers.map((player) => ({ id: player.id, name: player.name })), {
              modeName: queue.modeName,
              playerTeams: queue.playerTeams,
              maxPlayers: queue.maxPlayers,
          });
          return normalizedPlayers.map((player) => {
              const predictedTeam = predictedTeams.get(player.id);
              const wasKicked = predictedTeam === LOBBY_TEAM_KICKED;
              const teamLabel = !predictedTeam || wasKicked
                  ? fallbackTeamName
                  : `${fallbackTeamName} • ${predictedTeam}`;
              return {
                  id: player.id,
                  name: player.name,
                  clan: player.clan,
                  team: teamLabel,
                  color: undefined,
                  position: undefined,
                  traitorTargets: [],
                  tradeStopped: false,
                  tradeStoppedBySelf: false,
                  tradeStoppedByOther: false,
                  isSelf: false,
                  tiles: 0,
                  gold: 0,
                  troops: 0,
                  incomingAttacks: [],
                  outgoingAttacks: [],
                  defensiveSupports: [],
                  expansions: 0,
                  waiting: true,
                  eliminated: false,
                  disconnected: false,
                  traitor: false,
                  alliances: [],
                  lastUpdatedMs: now,
                  isLobbyPlayer: true,
                  lobbyGameId: queue.gameId,
                  lobbyLabel: queue.lobbyLabel,
                  lobbyPosition: player.lobbyPosition,
                  wasKickedFromLobby: wasKicked,
              };
          });
      }
      async fetchLobbyDetails(gameId) {
          {
              return null;
          }
      }
      normalizeLobbyDetails(details) {
          const summary = this.normalizeLobbySummary(details);
          if (!summary) {
              return null;
          }
          const clients = [];
          if (Array.isArray(details?.clients)) {
              for (const client of details.clients) {
                  clients.push({
                      clientID: typeof client.clientID === "string" && client.clientID.length > 0
                          ? client.clientID
                          : undefined,
                      username: typeof client.username === "string" && client.username.length > 0
                          ? client.username
                          : undefined,
                  });
              }
          }
          return {
              ...summary,
              clients,
          };
      }
      async resolveWorkerPath(gameId) {
          const info = await this.getLobbyWorkerInfo();
          const workerCount = Math.max(1, info.workerCount);
          const index = hashString(gameId) % workerCount;
          return `w${index}`;
      }
      async getLobbyWorkerInfo() {
          if (this.lobbyWorkerInfoPromise) {
              return this.lobbyWorkerInfoPromise;
          }
          this.lobbyWorkerInfoPromise = this.fetchLobbyWorkerInfo();
          return this.lobbyWorkerInfoPromise;
      }
      async fetchLobbyWorkerInfo() {
          {
              return { workerCount: DEFAULT_WORKER_COUNT };
          }
      }
      applyLobbyQueues(queues) {
          const normalizedQueues = [...queues];
          const players = normalizedQueues.flatMap((queue) => this.createLobbyQueuePlayers(queue));
          const primaryQueue = normalizedQueues[0];
          const nextSnapshot = this.attachActionsState({
              ...this.snapshot,
              players,
              currentLobbyQueue: primaryQueue,
              currentLobbyQueues: normalizedQueues,
              currentTimeMs: Date.now(),
          });
          const queuesChanged = !this.areLobbyQueueListsEqual(this.snapshot.currentLobbyQueues, normalizedQueues);
          const timeChanged = Math.abs(nextSnapshot.currentTimeMs - this.snapshot.currentTimeMs) >=
              1000;
          if (queuesChanged || timeChanged) {
              if (queuesChanged) {
                  this.logLobbyTeamPredictions(normalizedQueues, players);
                  for (let index = 0; index < normalizedQueues.length; index += 1) {
                      const queue = normalizedQueues[index];
                      this.emitActionEvent("lobbyQueueUpdated", {
                          queue,
                          index,
                          total: normalizedQueues.length,
                      });
                  }
                  this.emitActionEvent("lobbiesUpdated", normalizedQueues);
              }
              this.snapshot = nextSnapshot;
              this.notify();
          }
      }
      logLobbyTeamPredictions(queues, players) {
          if (players.length === 0) {
              return;
          }
          const scope = queues.map((queue) => queue.gameId).join(",");
          const signature = this.buildPlayerTeamSignature(players, scope);
          if (this.lastLobbyTeamLogKey === signature) {
              return;
          }
          this.lastLobbyTeamLogKey = signature;
      }
      logLiveGameTeams(players) {
          if (players.length === 0) {
              return;
          }
      }
      buildPlayerTeamSignature(players, scope) {
          const prefix = scope ? `${scope}::` : "";
          const entries = players
              .map((player) => `${player.id}:${player.team ?? ""}`)
              .sort();
          return `${prefix}${entries.join("|")}`;
      }
      areLobbyQueuesEqual(previous, next) {
          if (!previous && !next) {
              return true;
          }
          if (!previous || !next) {
              return false;
          }
          if (previous.gameId !== next.gameId ||
              previous.mapName !== next.mapName ||
              previous.modeName !== next.modeName ||
              previous.lobbyLabel !== next.lobbyLabel ||
              previous.playerCount !== next.playerCount ||
              previous.maxPlayers !== next.maxPlayers ||
              previous.startsAtMs !== next.startsAtMs ||
              previous.playerTeams !== next.playerTeams ||
              previous.publicGameType !== next.publicGameType) {
              return false;
          }
          if (previous.players.length !== next.players.length) {
              return false;
          }
          for (let i = 0; i < previous.players.length; i++) {
              const left = previous.players[i];
              const right = next.players[i];
              if (left.id !== right.id || left.name !== right.name) {
                  return false;
              }
          }
          return true;
      }
      areLobbyQueueListsEqual(previous, next) {
          const left = previous ?? [];
          const right = next ?? [];
          if (left.length !== right.length) {
              return false;
          }
          for (let index = 0; index < left.length; index += 1) {
              if (!this.areLobbyQueuesEqual(left[index], right[index])) {
                  return false;
              }
          }
          return true;
      }
      getLobbyStartTime(summary, details) {
          if (typeof summary.startsAt === "number" &&
              Number.isFinite(summary.startsAt)) {
              return summary.startsAt;
          }
          if (typeof details?.startsAt === "number" &&
              Number.isFinite(details.startsAt)) {
              return details.startsAt;
          }
          if (typeof details?.msUntilStart === "number" &&
              Number.isFinite(details.msUntilStart)) {
              return Date.now() + Math.max(0, details.msUntilStart);
          }
          if (typeof summary.msUntilStart === "number" &&
              Number.isFinite(summary.msUntilStart)) {
              return Date.now() + Math.max(0, summary.msUntilStart);
          }
          return undefined;
      }
  }
  DataStore.wsDonationListeners = new Set();
  DataStore.wsDonationHooksByWindow = new WeakMap();

  const datafrontTailwindCss = `#datafront .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}#datafront .pointer-events-none{pointer-events:none}#datafront .visible{visibility:visible}#datafront .static{position:static}#datafront .fixed{position:fixed}#datafront .absolute{position:absolute}#datafront .relative{position:relative}#datafront .sticky{position:sticky}#datafront .bottom-full{bottom:100%}#datafront .left-0{left:0}#datafront .left-1{left:.25rem}#datafront .left-2{left:.5rem}#datafront .right-0{right:0}#datafront .right-2{right:.5rem}#datafront .top-0{top:0}#datafront .top-1{top:.25rem}#datafront .top-1\\/2{top:50%}#datafront .z-10{z-index:10}#datafront .z-\\[2147483646\\]{z-index:2147483646}#datafront .z-\\[2147483647\\]{z-index:2147483647}#datafront .-mx-px{margin-left:-1px;margin-right:-1px}#datafront .-my-px{margin-top:-1px;margin-bottom:-1px}#datafront .mb-1{margin-bottom:.25rem}#datafront .mt-2{margin-top:.5rem}#datafront .mt-3{margin-top:.75rem}#datafront .block{display:block}#datafront .flex{display:flex}#datafront .inline-flex{display:inline-flex}#datafront .\\!table{display:table!important}#datafront .table{display:table}#datafront .grid{display:grid}#datafront .hidden{display:none}#datafront .h-10{height:2.5rem}#datafront .h-12{height:3rem}#datafront .h-2{height:.5rem}#datafront .h-3{height:.75rem}#datafront .h-3\\.5{height:.875rem}#datafront .h-4{height:1rem}#datafront .h-5{height:1.25rem}#datafront .h-6{height:1.5rem}#datafront .h-7{height:1.75rem}#datafront .h-8{height:2rem}#datafront .h-full{height:100%}#datafront .h-px{height:1px}#datafront .min-h-0{min-height:0}#datafront .min-h-\\[220px\\]{min-height:220px}#datafront .min-h-\\[72px\\]{min-height:72px}#datafront .min-h-full{min-height:100%}#datafront .w-10{width:2.5rem}#datafront .w-12{width:3rem}#datafront .w-2{width:.5rem}#datafront .w-3{width:.75rem}#datafront .w-3\\.5{width:.875rem}#datafront .w-32{width:8rem}#datafront .w-36{width:9rem}#datafront .w-4{width:1rem}#datafront .w-40{width:10rem}#datafront .w-44{width:11rem}#datafront .w-48{width:12rem}#datafront .w-5{width:1.25rem}#datafront .w-6{width:1.5rem}#datafront .w-7{width:1.75rem}#datafront .w-full{width:100%}#datafront .w-px{width:1px}#datafront .min-w-0{min-width:0}#datafront .min-w-\\[160px\\]{min-width:160px}#datafront .min-w-\\[200px\\]{min-width:200px}#datafront .min-w-\\[8rem\\]{min-width:8rem}#datafront .min-w-full{min-width:100%}#datafront .max-w-\\[10rem\\]{max-width:10rem}#datafront .max-w-full{max-width:100%}#datafront .max-w-xs{max-width:20rem}#datafront .flex-1{flex:1 1 0%}#datafront .shrink-0{flex-shrink:0}#datafront .border-collapse{border-collapse:collapse}#datafront .-translate-y-1{--tw-translate-y:-0.25rem}#datafront .-translate-y-1,#datafront .-translate-y-1\\/2{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}#datafront .-translate-y-1\\/2{--tw-translate-y:-50%}#datafront .translate-x-full{--tw-translate-x:100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}#datafront .\\!transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))!important}#datafront .transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}#datafront .cursor-col-resize{cursor:col-resize}#datafront .cursor-default{cursor:default}#datafront .cursor-not-allowed{cursor:not-allowed}#datafront .cursor-pointer{cursor:pointer}#datafront .cursor-row-resize{cursor:row-resize}#datafront .select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}#datafront .resize{resize:both}#datafront .appearance-none{-webkit-appearance:none;-moz-appearance:none;appearance:none}#datafront .flex-row{flex-direction:row}#datafront .flex-col{flex-direction:column}#datafront .flex-wrap{flex-wrap:wrap}#datafront .items-start{align-items:flex-start}#datafront .items-end{align-items:flex-end}#datafront .items-center{align-items:center}#datafront .items-baseline{align-items:baseline}#datafront .justify-start{justify-content:flex-start}#datafront .justify-end{justify-content:flex-end}#datafront .justify-center{justify-content:center}#datafront .justify-between{justify-content:space-between}#datafront .gap-1{gap:.25rem}#datafront .gap-2{gap:.5rem}#datafront .gap-3{gap:.75rem}#datafront .gap-4{gap:1rem}#datafront .gap-6{gap:1.5rem}#datafront :is(.space-y-1>:not([hidden])~:not([hidden])){--tw-space-y-reverse:0;margin-top:calc(.25rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.25rem*var(--tw-space-y-reverse))}#datafront :is(.space-y-2>:not([hidden])~:not([hidden])){--tw-space-y-reverse:0;margin-top:calc(.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.5rem*var(--tw-space-y-reverse))}#datafront :is(.space-y-3>:not([hidden])~:not([hidden])){--tw-space-y-reverse:0;margin-top:calc(.75rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.75rem*var(--tw-space-y-reverse))}#datafront :is(.space-y-4>:not([hidden])~:not([hidden])){--tw-space-y-reverse:0;margin-top:calc(1rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem*var(--tw-space-y-reverse))}#datafront .overflow-auto{overflow:auto}#datafront .overflow-hidden{overflow:hidden}#datafront .overflow-x-auto{overflow-x:auto}#datafront .overflow-y-hidden{overflow-y:hidden}#datafront .truncate{overflow:hidden;text-overflow:ellipsis}#datafront .truncate,#datafront .whitespace-nowrap{white-space:nowrap}#datafront .whitespace-pre-wrap{white-space:pre-wrap}#datafront .break-words{overflow-wrap:break-word}#datafront .rounded{border-radius:.25rem}#datafront .rounded-2xl{border-radius:1rem}#datafront .rounded-full{border-radius:9999px}#datafront .rounded-lg{border-radius:.5rem}#datafront .rounded-md{border-radius:.375rem}#datafront .rounded-sm{border-radius:.125rem}#datafront .rounded-b-2xl{border-bottom-right-radius:1rem;border-bottom-left-radius:1rem}#datafront .rounded-r-full{border-top-right-radius:9999px;border-bottom-right-radius:9999px}#datafront .border{border-width:1px}#datafront .border-b{border-bottom-width:1px}#datafront .border-l{border-left-width:1px}#datafront .border-r{border-right-width:1px}#datafront .border-t{border-top-width:1px}#datafront .border-none{border-style:none}#datafront .\\!border-rose-500{--tw-border-opacity:1!important;border-color:rgb(244 63 94/var(--tw-border-opacity,1))!important}#datafront .border-amber-400{--tw-border-opacity:1;border-color:rgb(251 191 36/var(--tw-border-opacity,1))}#datafront .border-amber-400\\/40{border-color:rgba(251,191,36,.4)}#datafront .border-emerald-400{--tw-border-opacity:1;border-color:rgb(52 211 153/var(--tw-border-opacity,1))}#datafront .border-emerald-400\\/60{border-color:rgba(52,211,153,.6)}#datafront .border-rose-500{--tw-border-opacity:1;border-color:rgb(244 63 94/var(--tw-border-opacity,1))}#datafront .border-rose-500\\/40{border-color:rgba(244,63,94,.4)}#datafront .border-rose-500\\/50{border-color:rgba(244,63,94,.5)}#datafront .border-sky-400{--tw-border-opacity:1;border-color:rgb(56 189 248/var(--tw-border-opacity,1))}#datafront .border-sky-400\\/40{border-color:rgba(56,189,248,.4)}#datafront .border-sky-500{--tw-border-opacity:1;border-color:rgb(14 165 233/var(--tw-border-opacity,1))}#datafront .border-sky-500\\/40{border-color:rgba(14,165,233,.4)}#datafront .border-sky-500\\/50{border-color:rgba(14,165,233,.5)}#datafront .border-sky-500\\/60{border-color:rgba(14,165,233,.6)}#datafront .border-sky-500\\/70{border-color:rgba(14,165,233,.7)}#datafront .border-slate-500{--tw-border-opacity:1;border-color:rgb(100 116 139/var(--tw-border-opacity,1))}#datafront .border-slate-600{--tw-border-opacity:1;border-color:rgb(71 85 105/var(--tw-border-opacity,1))}#datafront .border-slate-600\\/50{border-color:rgba(71,85,105,.5)}#datafront .border-slate-700{--tw-border-opacity:1;border-color:rgb(51 65 85/var(--tw-border-opacity,1))}#datafront .border-slate-700\\/70{border-color:rgba(51,65,85,.7)}#datafront .border-slate-700\\/80{border-color:rgba(51,65,85,.8)}#datafront .border-slate-800{--tw-border-opacity:1;border-color:rgb(30 41 59/var(--tw-border-opacity,1))}#datafront .border-slate-800\\/60{border-color:rgba(30,41,59,.6)}#datafront .border-slate-800\\/70{border-color:rgba(30,41,59,.7)}#datafront .border-slate-800\\/80{border-color:rgba(30,41,59,.8)}#datafront .border-slate-900{--tw-border-opacity:1;border-color:rgb(15 23 42/var(--tw-border-opacity,1))}#datafront .border-slate-900\\/70{border-color:rgba(15,23,42,.7)}#datafront .border-slate-900\\/80{border-color:rgba(15,23,42,.8)}#datafront .bg-amber-400{--tw-bg-opacity:1;background-color:rgb(251 191 36/var(--tw-bg-opacity,1))}#datafront .bg-amber-400\\/15{background-color:rgba(251,191,36,.15)}#datafront .bg-amber-500{--tw-bg-opacity:1;background-color:rgb(245 158 11/var(--tw-bg-opacity,1))}#datafront .bg-amber-500\\/20{background-color:rgba(245,158,11,.2)}#datafront .bg-black{--tw-bg-opacity:1;background-color:rgb(0 0 0/var(--tw-bg-opacity,1))}#datafront .bg-black\\/70{background-color:rgba(0,0,0,.7)}#datafront .bg-emerald-100{--tw-bg-opacity:1;background-color:rgb(209 250 229/var(--tw-bg-opacity,1))}#datafront .bg-emerald-500{--tw-bg-opacity:1;background-color:rgb(16 185 129/var(--tw-bg-opacity,1))}#datafront .bg-emerald-500\\/20{background-color:rgba(16,185,129,.2)}#datafront .bg-emerald-500\\/40{background-color:rgba(16,185,129,.4)}#datafront .bg-emerald-950{--tw-bg-opacity:1;background-color:rgb(2 44 34/var(--tw-bg-opacity,1))}#datafront .bg-red-500{--tw-bg-opacity:1;background-color:rgb(239 68 68/var(--tw-bg-opacity,1))}#datafront .bg-rose-500{--tw-bg-opacity:1;background-color:rgb(244 63 94/var(--tw-bg-opacity,1))}#datafront .bg-rose-500\\/10{background-color:rgba(244,63,94,.1)}#datafront .bg-rose-500\\/15{background-color:rgba(244,63,94,.15)}#datafront .bg-rose-500\\/20{background-color:rgba(244,63,94,.2)}#datafront .bg-sky-400{--tw-bg-opacity:1;background-color:rgb(56 189 248/var(--tw-bg-opacity,1))}#datafront .bg-sky-400\\/15{background-color:rgba(56,189,248,.15)}#datafront .bg-sky-500{--tw-bg-opacity:1;background-color:rgb(14 165 233/var(--tw-bg-opacity,1))}#datafront .bg-sky-500\\/10{background-color:rgba(14,165,233,.1)}#datafront .bg-sky-500\\/20{background-color:rgba(14,165,233,.2)}#datafront .bg-slate-300{--tw-bg-opacity:1;background-color:rgb(203 213 225/var(--tw-bg-opacity,1))}#datafront .bg-slate-600{--tw-bg-opacity:1;background-color:rgb(71 85 105/var(--tw-bg-opacity,1))}#datafront .bg-slate-600\\/60{background-color:rgba(71,85,105,.6)}#datafront .bg-slate-700{--tw-bg-opacity:1;background-color:rgb(51 65 85/var(--tw-bg-opacity,1))}#datafront .bg-slate-700\\/60{background-color:rgba(51,65,85,.6)}#datafront .bg-slate-800{--tw-bg-opacity:1;background-color:rgb(30 41 59/var(--tw-bg-opacity,1))}#datafront .bg-slate-800\\/50{background-color:rgba(30,41,59,.5)}#datafront .bg-slate-800\\/60{background-color:rgba(30,41,59,.6)}#datafront .bg-slate-800\\/70{background-color:rgba(30,41,59,.7)}#datafront .bg-slate-800\\/80{background-color:rgba(30,41,59,.8)}#datafront .bg-slate-900{--tw-bg-opacity:1;background-color:rgb(15 23 42/var(--tw-bg-opacity,1))}#datafront .bg-slate-900\\/40{background-color:rgba(15,23,42,.4)}#datafront .bg-slate-900\\/70{background-color:rgba(15,23,42,.7)}#datafront .bg-slate-900\\/80{background-color:rgba(15,23,42,.8)}#datafront .bg-slate-900\\/90{background-color:rgba(15,23,42,.9)}#datafront .bg-slate-900\\/95{background-color:rgba(15,23,42,.95)}#datafront .bg-slate-950{--tw-bg-opacity:1;background-color:rgb(2 6 23/var(--tw-bg-opacity,1))}#datafront .bg-slate-950\\/40{background-color:rgba(2,6,23,.4)}#datafront .bg-slate-950\\/60{background-color:rgba(2,6,23,.6)}#datafront .bg-slate-950\\/70{background-color:rgba(2,6,23,.7)}#datafront .bg-slate-950\\/80{background-color:rgba(2,6,23,.8)}#datafront .bg-slate-950\\/95{background-color:rgba(2,6,23,.95)}#datafront .bg-transparent{background-color:transparent}#datafront .bg-none{background-image:none}#datafront .p-3{padding:.75rem}#datafront .p-4{padding:1rem}#datafront .p-6{padding:1.5rem}#datafront .px-0{padding-left:0;padding-right:0}#datafront .px-1{padding-left:.25rem;padding-right:.25rem}#datafront .px-1\\.5{padding-left:.375rem;padding-right:.375rem}#datafront .px-2{padding-left:.5rem;padding-right:.5rem}#datafront .px-2\\.5{padding-left:.625rem;padding-right:.625rem}#datafront .px-3{padding-left:.75rem;padding-right:.75rem}#datafront .px-4{padding-left:1rem;padding-right:1rem}#datafront .py-0{padding-top:0;padding-bottom:0}#datafront .py-0\\.5{padding-top:.125rem;padding-bottom:.125rem}#datafront .py-1{padding-top:.25rem;padding-bottom:.25rem}#datafront .py-1\\.5{padding-top:.375rem;padding-bottom:.375rem}#datafront .py-2{padding-top:.5rem;padding-bottom:.5rem}#datafront .py-4{padding-top:1rem;padding-bottom:1rem}#datafront .py-8{padding-top:2rem;padding-bottom:2rem}#datafront .pb-3{padding-bottom:.75rem}#datafront .pl-1{padding-left:.25rem}#datafront .pr-7{padding-right:1.75rem}#datafront .pt-4{padding-top:1rem}#datafront .text-left{text-align:left}#datafront .text-center{text-align:center}#datafront .text-right{text-align:right}#datafront .align-top{vertical-align:top}#datafront .font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}#datafront .text-\\[0\\.65rem\\]{font-size:.65rem}#datafront .text-\\[0\\.6rem\\]{font-size:.6rem}#datafront .text-\\[0\\.75rem\\]{font-size:.75rem}#datafront .text-\\[0\\.7rem\\]{font-size:.7rem}#datafront .text-base{font-size:1rem;line-height:1.5rem}#datafront .text-lg{font-size:1.125rem;line-height:1.75rem}#datafront .text-sm{font-size:.875rem;line-height:1.25rem}#datafront .text-xs{font-size:.75rem;line-height:1rem}#datafront .font-bold{font-weight:700}#datafront .font-medium{font-weight:500}#datafront .font-semibold{font-weight:600}#datafront .uppercase{text-transform:uppercase}#datafront .capitalize{text-transform:capitalize}#datafront .italic{font-style:italic}#datafront .leading-none{line-height:1}#datafront .tracking-wide{letter-spacing:.025em}#datafront .tracking-widest{letter-spacing:.1em}#datafront .text-amber-200{--tw-text-opacity:1;color:rgb(253 230 138/var(--tw-text-opacity,1))}#datafront .text-amber-300{--tw-text-opacity:1;color:rgb(252 211 77/var(--tw-text-opacity,1))}#datafront .text-emerald-100{--tw-text-opacity:1;color:rgb(209 250 229/var(--tw-text-opacity,1))}#datafront .text-emerald-200{--tw-text-opacity:1;color:rgb(167 243 208/var(--tw-text-opacity,1))}#datafront .text-inherit{color:inherit}#datafront .text-rose-200{--tw-text-opacity:1;color:rgb(254 205 211/var(--tw-text-opacity,1))}#datafront .text-rose-400{--tw-text-opacity:1;color:rgb(251 113 133/var(--tw-text-opacity,1))}#datafront .text-sky-100{--tw-text-opacity:1;color:rgb(224 242 254/var(--tw-text-opacity,1))}#datafront .text-sky-200{--tw-text-opacity:1;color:rgb(186 230 253/var(--tw-text-opacity,1))}#datafront .text-sky-300{--tw-text-opacity:1;color:rgb(125 211 252/var(--tw-text-opacity,1))}#datafront .text-sky-400{--tw-text-opacity:1;color:rgb(56 189 248/var(--tw-text-opacity,1))}#datafront .text-slate-100{--tw-text-opacity:1;color:rgb(241 245 249/var(--tw-text-opacity,1))}#datafront .text-slate-200{--tw-text-opacity:1;color:rgb(226 232 240/var(--tw-text-opacity,1))}#datafront .text-slate-300{--tw-text-opacity:1;color:rgb(203 213 225/var(--tw-text-opacity,1))}#datafront .text-slate-400{--tw-text-opacity:1;color:rgb(148 163 184/var(--tw-text-opacity,1))}#datafront .text-slate-50{--tw-text-opacity:1;color:rgb(248 250 252/var(--tw-text-opacity,1))}#datafront .text-slate-500{--tw-text-opacity:1;color:rgb(100 116 139/var(--tw-text-opacity,1))}#datafront .text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}#datafront .opacity-40{opacity:.4}#datafront .opacity-50{opacity:.5}#datafront .shadow{--tw-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1);--tw-shadow-colored:0 1px 3px 0 var(--tw-shadow-color),0 1px 2px -1px var(--tw-shadow-color)}#datafront .shadow,#datafront .shadow-2xl{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}#datafront .shadow-2xl{--tw-shadow:0 25px 50px -12px rgba(0,0,0,.25);--tw-shadow-colored:0 25px 50px -12px var(--tw-shadow-color)}#datafront .shadow-inner{--tw-shadow:inset 0 2px 4px 0 rgba(0,0,0,.05);--tw-shadow-colored:inset 0 2px 4px 0 var(--tw-shadow-color)}#datafront .shadow-inner,#datafront .shadow-xl{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}#datafront .shadow-xl{--tw-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);--tw-shadow-colored:0 20px 25px -5px var(--tw-shadow-color),0 8px 10px -6px var(--tw-shadow-color)}#datafront .ring-0{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(var(--tw-ring-offset-width)) var(--tw-ring-color)}#datafront .ring-0,#datafront .ring-1{box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}#datafront .ring-1{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)}#datafront .ring-emerald-400{--tw-ring-opacity:1;--tw-ring-color:rgb(52 211 153/var(--tw-ring-opacity,1))}#datafront .ring-sky-500{--tw-ring-opacity:1;--tw-ring-color:rgb(14 165 233/var(--tw-ring-opacity,1))}#datafront .blur{--tw-blur:blur(8px);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}#datafront .\\!filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)!important}#datafront .filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}#datafront .backdrop-blur{--tw-backdrop-blur:blur(8px)}#datafront .backdrop-blur,#datafront .backdrop-blur-sm{backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}#datafront .backdrop-blur-sm{--tw-backdrop-blur:blur(4px)}#datafront .transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}#datafront .transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}#datafront .transition-transform{transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}#datafront .duration-150{transition-duration:.15s}#datafront .ease-out{transition-timing-function:cubic-bezier(0,0,.2,1)}#datafront .placeholder\\:text-slate-500::-moz-placeholder{--tw-text-opacity:1;color:rgb(100 116 139/var(--tw-text-opacity,1))}#datafront .placeholder\\:text-slate-500::placeholder{--tw-text-opacity:1;color:rgb(100 116 139/var(--tw-text-opacity,1))}#datafront .last\\:border-r-0:last-child{border-right-width:0}#datafront .hover\\:\\!border-rose-500\\/70:hover{border-color:rgba(244,63,94,.7)!important}#datafront .hover\\:border-rose-500\\/60:hover{border-color:rgba(244,63,94,.6)}#datafront .hover\\:border-sky-500\\/60:hover{border-color:rgba(14,165,233,.6)}#datafront .hover\\:border-sky-500\\/70:hover{border-color:rgba(14,165,233,.7)}#datafront .hover\\:bg-emerald-500\\/50:hover{background-color:rgba(16,185,129,.5)}#datafront .hover\\:bg-rose-500\\/20:hover{background-color:rgba(244,63,94,.2)}#datafront .hover\\:bg-sky-500\\/10:hover{background-color:rgba(14,165,233,.1)}#datafront .hover\\:bg-sky-500\\/20:hover{background-color:rgba(14,165,233,.2)}#datafront .hover\\:bg-sky-500\\/30:hover{background-color:rgba(14,165,233,.3)}#datafront .hover\\:bg-slate-700\\/80:hover{background-color:rgba(51,65,85,.8)}#datafront .hover\\:bg-slate-800\\/40:hover{background-color:rgba(30,41,59,.4)}#datafront .hover\\:bg-slate-800\\/50:hover{background-color:rgba(30,41,59,.5)}#datafront .hover\\:bg-slate-800\\/60:hover{background-color:rgba(30,41,59,.6)}#datafront .hover\\:bg-slate-800\\/70:hover{background-color:rgba(30,41,59,.7)}#datafront .hover\\:bg-slate-800\\/80:hover{background-color:rgba(30,41,59,.8)}#datafront .hover\\:bg-slate-900\\/40:hover{background-color:rgba(15,23,42,.4)}#datafront .hover\\:bg-transparent:hover{background-color:transparent}#datafront .hover\\:\\!text-rose-200:hover{--tw-text-opacity:1!important;color:rgb(254 205 211/var(--tw-text-opacity,1))!important}#datafront .hover\\:text-rose-300:hover{--tw-text-opacity:1;color:rgb(253 164 175/var(--tw-text-opacity,1))}#datafront .hover\\:text-sky-100:hover{--tw-text-opacity:1;color:rgb(224 242 254/var(--tw-text-opacity,1))}#datafront .hover\\:text-sky-200:hover{--tw-text-opacity:1;color:rgb(186 230 253/var(--tw-text-opacity,1))}#datafront .hover\\:text-slate-50:hover{--tw-text-opacity:1;color:rgb(248 250 252/var(--tw-text-opacity,1))}#datafront .focus\\:border-transparent:focus{border-color:transparent}#datafront .focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}#datafront .focus\\:ring-0:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(var(--tw-ring-offset-width)) var(--tw-ring-color)}#datafront .focus\\:ring-0:focus,#datafront .focus\\:ring-2:focus{box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}#datafront .focus\\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)}#datafront .focus\\:ring-sky-500:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(14 165 233/var(--tw-ring-opacity,1))}#datafront .focus\\:ring-sky-500\\/50:focus{--tw-ring-color:rgba(14,165,233,.5)}#datafront .focus\\:ring-sky-500\\/60:focus{--tw-ring-color:rgba(14,165,233,.6)}#datafront .focus\\:ring-sky-500\\/70:focus{--tw-ring-color:rgba(14,165,233,.7)}#datafront .focus-visible\\:ring-2:focus-visible{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}#datafront .focus-visible\\:ring-sky-500\\/60:focus-visible{--tw-ring-color:rgba(14,165,233,.6)}#datafront :is(.group:hover .group-hover\\:bg-sky-400\\/60){background-color:rgba(56,189,248,.6)}@media (min-width:640px){#datafront .sm\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (min-width:768px){#datafront .md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}`;

  function createSessionId() {
      if (typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function") {
          return crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function ensureTailwind(targetDocument) {
      const existing = targetDocument.getElementById("datafront-tailwind");
      if (existing) {
          return;
      }
      const style = targetDocument.createElement("style");
      style.id = "datafront-tailwind";
      style.textContent = datafrontTailwindCss;
      targetDocument.head.appendChild(style);
  }
  class SidebarWindowManager {
      constructor() {
          this.store = new DataStore();
          this.instances = new Set();
          this.appsByWindow = new Map();
          this.selectedPlayerId = null;
          this.searchFilter = "";
          this.createPrimarySidebar();
      }
      updateData(snapshot) {
          this.pruneClosedWindows();
          this.store.update(snapshot);
      }
      createPrimarySidebar() {
          const uiWindow = window;
          const app = new SidebarApp(this.store, {
              enableOverlayAlignment: true,
              onRequestNewWindow: () => this.openAdditionalWindow(),
              onPlayerDetailsSelected: (playerId) => this.handlePlayerDetailsSelected(uiWindow, playerId),
              onSearchFilterChanged: (query) => this.handleSearchFilterChanged(uiWindow, query),
              windowMode: "embedded",
          }, document, uiWindow);
          this.instances.add(app);
          this.appsByWindow.set(uiWindow, app);
          this.syncAppSelection(app);
      }
      pruneClosedWindows() {
          const staleApps = [];
          for (const [uiWindow, app] of this.appsByWindow.entries()) {
              if (uiWindow === window) {
                  continue;
              }
              if (uiWindow.closed) {
                  staleApps.push(app);
              }
          }
          for (const app of staleApps) {
              this.removeInstance(app);
          }
      }
      preparePopupDocument(targetDocument) {
          targetDocument.open();
          targetDocument.write(`<!doctype html>
<meta charset="utf-8">
<title>DataFront</title>
<style>
  html,body{height:100%;margin:0;background:#020617;color:#e2e8f0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .df-status{display:flex;align-items:center;justify-content:center;height:100%;padding:16px;box-sizing:border-box}
</style>
<script data-openfront-sidebar-popup-bootstrap>
(() => {
  const RETRY_MS = 1000;
  let lastSessionId = "";

  const attemptRegister = () => {
    try {
      const opener = window.opener;
      const api = opener && opener.dataFront;
      if (!api || typeof api.registerPopup !== "function") {
        return;
      }
      const sessionId = api.sessionId;
      if (typeof sessionId !== "string" || !sessionId) {
        return;
      }
      if (sessionId === lastSessionId) {
        return;
      }
      api.registerPopup(window);
      lastSessionId = sessionId;
    } catch {
      // ignore
    }
  };

  attemptRegister();
  setInterval(attemptRegister, RETRY_MS);
  window.addEventListener("focus", attemptRegister);
  window.addEventListener("pageshow", attemptRegister);
  window.addEventListener("beforeunload", () => {
    try {
      const opener = window.opener;
      const api = opener && opener.dataFront;
      if (api && typeof api.unregisterPopup === "function") {
        api.unregisterPopup(window.name);
      }
    } catch {
      // ignore
    }
  });
})();
</script>
<body><div class="df-status">Connecting to main window…</div></body>`);
          targetDocument.close();
      }
      removeInstance(app) {
          if (this.instances.delete(app)) {
              app.destroy();
          }
          for (const [key, value] of this.appsByWindow.entries()) {
              if (value === app) {
                  this.appsByWindow.delete(key);
              }
          }
      }
      syncAppSelection(app) {
          if (this.selectedPlayerId) {
              app.syncPlayerSelection(this.selectedPlayerId);
          }
          if (this.searchFilter) {
              app.syncSearchFilter(this.searchFilter);
          }
      }
      handlePlayerDetailsSelected(sourceWindow, playerId) {
          const source = this.appsByWindow.get(sourceWindow);
          if (!source) {
              return;
          }
          const normalized = playerId.trim();
          if (!normalized) {
              return;
          }
          this.selectedPlayerId = normalized;
          for (const instance of this.instances) {
              if (instance === source) {
                  continue;
              }
              instance.syncPlayerSelection(normalized);
          }
      }
      handleSearchFilterChanged(sourceWindow, query) {
          const source = this.appsByWindow.get(sourceWindow);
          if (!source) {
              return;
          }
          const normalized = query.trim();
          this.searchFilter = normalized;
          for (const instance of this.instances) {
              if (instance === source) {
                  continue;
              }
              instance.syncSearchFilter(normalized);
          }
      }
      registerPopup(popupWindow) {
          this.pruneClosedWindows();
          if (!popupWindow || popupWindow.closed) {
              return;
          }
          if (this.appsByWindow.has(popupWindow)) {
              return;
          }
          const targetDocument = popupWindow.document;
          try {
              if (targetDocument.body) {
                  targetDocument.body.replaceChildren();
              }
          }
          catch {
              // ignore
          }
          ensureTailwind(targetDocument);
          const uiWindow = popupWindow;
          const app = new SidebarApp(this.store, {
              enableOverlayAlignment: false,
              onRequestNewWindow: () => this.openAdditionalWindow(),
              onPlayerDetailsSelected: (playerId) => this.handlePlayerDetailsSelected(uiWindow, playerId),
              onSearchFilterChanged: (query) => this.handleSearchFilterChanged(uiWindow, query),
              windowMode: "standalone",
          }, targetDocument, uiWindow);
          this.instances.add(app);
          this.appsByWindow.set(uiWindow, app);
          this.syncAppSelection(app);
      }
      unregisterPopup(popupName) {
          this.pruneClosedWindows();
          const normalized = popupName.trim();
          if (!normalized) {
              return;
          }
          for (const [uiWindow, app] of this.appsByWindow.entries()) {
              if (uiWindow === window) {
                  continue;
              }
              if (uiWindow.name === normalized) {
                  this.removeInstance(app);
                  return;
              }
          }
      }
      openAdditionalWindow() {
          const popup = window.open("", `datafront-${Date.now()}`, "width=460,height=900,resizable=yes,scrollbars=yes");
          if (!popup) {
              alert("Pop-out window was blocked. Please allow pop-ups for this site or keep the sidebar embedded.");
              return;
          }
          this.preparePopupDocument(popup.document);
          this.registerPopup(popup);
      }
  }
  let windowManager = null;
  async function initializeSidebar() {
      const hostWindow = unsafeWindow ?? window;
      if (hostWindow.dataFront) {
          return;
      }
      ensureTailwind(document);
      windowManager = new SidebarWindowManager();
      const sessionId = createSessionId();
      hostWindow.dataFront = {
          updateData: (snapshot) => windowManager?.updateData(snapshot),
          logger: sidebarLogger,
          sessionId,
          registerPopup: (popupWindow) => windowManager?.registerPopup(popupWindow),
          unregisterPopup: (popupName) => windowManager?.unregisterPopup(popupName),
      };
  }
  if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => void initializeSidebar());
  }
  else {
      void initializeSidebar();
  }

})();
