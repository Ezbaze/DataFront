import type { PanelLeafNode, SortKey, SortState } from "../../types";
import type { PlayerRecord } from "../../types";
import {
  copyTextToClipboard,
  createElement as createElementBase,
  formatTroopCount,
  showContextMenu,
} from "../../utils";
import { isTradeStoppedByOther, isTradeStoppedBySelf } from "../../trade";
import {
  applyPersistentHover,
  ATTACK_HEADERS,
  cellClassForColumn,
  compareSortValues,
  createTableShell,
  createPlayerNameElement,
  getVisibleHeaders,
} from "./helpers";
import type { ViewRenderOptions } from "./types";

type AttackViewEntry = {
  id: string;
  attacker: string;
  target: string;
  troops: number;
};

type PlayerContextTarget = {
  id: string;
  publicId?: string;
  name: string;
  tradeStopped: boolean;
  tradeStoppedBySelf?: boolean;
  tradeStoppedByOther?: boolean;
  isSelf: boolean;
};

let viewDocument: Document = document;

function withViewDocument<T>(doc: Document, fn: () => T): T {
  const previous = viewDocument;
  viewDocument = doc;
  try {
    return fn();
  } finally {
    viewDocument = previous;
  }
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  textContent?: string,
): HTMLElementTagNameMap[K] {
  return createElementBase(tag, className, textContent, viewDocument);
}

const playerContextTargets = new WeakMap<HTMLElement, PlayerContextTarget>();

function normalizePlayerLabel(label: string): string {
  return (
    label
      .trim()
      // Strip leading clan tags like "[NU] Alice"
      .replace(/^\[[^\]]+\]\s*/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase()
  );
}

function registerContextMenuDelegation(
  container: HTMLElement,
  actions: ViewRenderOptions["actions"],
): void {
  if (container.dataset.contextMenuDelegated === "true") {
    return;
  }

  const handleContextMenu = (event: MouseEvent) => {
    const targetElement =
      event.target instanceof HTMLElement ? event.target : null;
    if (!targetElement) {
      return;
    }
    const menuTarget = targetElement.closest<HTMLElement>(
      '[data-context-target="player"]',
    );
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
        document: viewDocument,
        items: [
          {
            label: "Copy username",
            onSelect: () => void copyTextToClipboard(target.name, viewDocument),
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
      document: viewDocument,
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
          onSelect: () => void copyTextToClipboard(target.name, viewDocument),
        },
        {
          label: "Copy player id",
          onSelect: () =>
            void copyTextToClipboard(
              target.publicId ?? target.id,
              viewDocument,
            ),
        },
      ],
    });
  };

  container.addEventListener("contextmenu", handleContextMenu);
  container.dataset.contextMenuDelegated = "true";
}

export function renderAttacksView(options: ViewRenderOptions): HTMLElement {
  return withViewDocument(options.ui.document, () => {
    const { leaf, snapshot, sortState, onSort, existingContainer, actions } =
      options;
    const visibleHeaders = getVisibleHeaders(leaf, leaf.view, ATTACK_HEADERS);
    const { container, tbody } = createTableShell({
      sortState,
      onSort,
      existingContainer,
      view: leaf.view,
      headers: visibleHeaders,
      document: viewDocument,
    });
    registerContextMenuDelegation(container, actions);

    const playerByName = buildPlayerNameIndex(snapshot.players);
    const attacks = collectAttacks(snapshot.players).sort((a, b) =>
      compareAttacks({ a, b, sortState }),
    );

    for (const attack of attacks) {
      const rowKey = `attack:${attack.id}`;
      const row = createElement(
        "tr",
        "hover:bg-slate-800/50 transition-colors",
      );
      applyPersistentHover(row, leaf, rowKey, "bg-slate-800/50");
      row.dataset.rowKey = rowKey;

      for (const column of visibleHeaders) {
        const td = createElement(
          "td",
          cellClassForColumn(
            column,
            getAttackExtraCellClass(column.key as SortKey),
          ),
        );
        if (column.key === "label" || column.key === "owner") {
          const name = column.key === "label" ? attack.attacker : attack.target;
          const player =
            playerByName.get(normalizePlayerLabel(name)) ??
            playerByName.get(name.toLowerCase());
          const button = createPlayerNameElement(name, player?.position, {
            className:
              "inline-flex max-w-full items-center gap-1 text-left text-slate-200 hover:text-sky-200",
            document: viewDocument,
          });
          button.dataset.contextTarget = "player";
          td.dataset.contextTarget = "player";
          if (player) {
            const contextTarget: PlayerContextTarget = {
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
          } else {
            const contextTarget: PlayerContextTarget = {
              id: "",
              name,
              tradeStopped: false,
              isSelf: false,
            };
            playerContextTargets.set(button, contextTarget);
            playerContextTargets.set(td, contextTarget);
          }
          td.appendChild(button);
        } else {
          td.textContent = getAttackCellValue(column.key as SortKey, attack);
        }
        row.appendChild(td);
      }

      tbody.appendChild(row);
    }

    if (attacks.length === 0) {
      const row = createElement("tr", "text-slate-400");
      const td = createElement(
        "td",
        "border-b border-slate-900/80 px-3 py-4 text-center",
        "No active attacks.",
      );
      td.colSpan = visibleHeaders.length;
      row.appendChild(td);
      tbody.appendChild(row);
    }

    return container;
  });
}

function collectAttacks(
  players: Array<{
    name: string;
    outgoingAttacks: Array<{ id: string; target: string; troops: number }>;
  }>,
): AttackViewEntry[] {
  const byId = new Map<string, AttackViewEntry>();
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

function buildPlayerNameIndex(
  players: PlayerRecord[],
): Map<string, PlayerRecord> {
  const map = new Map<string, PlayerRecord>();
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

function getAttackExtraCellClass(key: SortKey): string {
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

function getAttackCellValue(key: SortKey, attack: AttackViewEntry): string {
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

function compareAttacks(options: {
  a: AttackViewEntry;
  b: AttackViewEntry;
  sortState: SortState;
}): number {
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

function getAttackSortValue(
  entry: AttackViewEntry,
  key: SortKey,
): number | string {
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
