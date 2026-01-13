import type {
  GameSnapshot,
  PanelLeafNode,
  ShipRecord,
  SortKey,
  SortState,
  TileSummary,
} from "../../types";
import {
  createElement as createElementBase,
  focusTile,
  formatTroopCount,
} from "../../utils";
import {
  applyPersistentHover,
  attachImmediateTileFocus,
  cellClassForColumn,
  compareSortValues,
  createPlayerNameElement,
  createTableShell,
  getVisibleHeaders,
  SHIP_HEADERS,
} from "./helpers";
import type { ViewRenderOptions } from "./types";

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

export function renderShipView(options: ViewRenderOptions): HTMLElement {
  return withViewDocument(options.ui.document, () => {
    const { leaf, snapshot, sortState, onSort, existingContainer } = options;
    const visibleHeaders = getVisibleHeaders(leaf, leaf.view, SHIP_HEADERS);
    const { container, tbody } = createTableShell({
      sortState,
      onSort,
      existingContainer,
      view: leaf.view,
      headers: visibleHeaders,
      document: viewDocument,
    });
    const playerLookup = new Map(
      snapshot.players.map((player) => [player.id, player]),
    );
    const ships = [...snapshot.ships].sort((a, b) =>
      compareShips({ a, b, sortState }),
    );

    for (const ship of ships) {
      const rowKey = `ship:${ship.id}`;
      const row = createElement(
        "tr",
        "hover:bg-slate-800/50 transition-colors",
      );
      applyPersistentHover(row, leaf, rowKey, "bg-slate-800/50");
      row.dataset.rowKey = rowKey;

      for (const column of visibleHeaders) {
        const td = createElement(
          "td",
          cellClassForColumn(column, getShipExtraCellClass(column.key)),
        );
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
            td.appendChild(
              createPlayerNameElement(ship.ownerName, ownerRecord?.position, {
                className:
                  "inline-flex max-w-full items-center gap-1 text-left text-slate-200 hover:text-sky-200",
                document: viewDocument,
              }),
            );
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

function getShipExtraCellClass(key: SortKey): string {
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

function getShipCellValue(key: SortKey, ship: ShipRecord): string {
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

function compareShips(options: {
  a: ShipRecord;
  b: ShipRecord;
  sortState: SortState;
}): number {
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

function getShipSortValue(ship: ShipRecord, key: SortKey): number | string {
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

function tileSortValue(summary?: TileSummary): string {
  if (!summary) {
    return "";
  }
  const x = summary.x.toString().padStart(5, "0");
  const y = summary.y.toString().padStart(5, "0");
  const owner = summary.ownerName?.toLowerCase() ?? "";
  return `${x}:${y}:${owner}`;
}

function formatTileSummary(summary?: TileSummary): string {
  if (!summary) {
    return "–";
  }
  const coords = `${summary.x}, ${summary.y}`;
  return summary.ownerName ? `${coords} (${summary.ownerName})` : coords;
}

function deriveShipStatus(ship: ShipRecord): string {
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
  if (
    ship.current &&
    ship.destination &&
    ship.current.ref === ship.destination.ref
  ) {
    return "Stationed";
  }
  return "En route";
}

function createCoordinateButton(summary?: TileSummary): HTMLElement {
  if (!summary) {
    return createElement("span", "text-slate-500", "–");
  }
  const label = formatTileSummary(summary);
  const button = createElement(
    "button",
    "inline-flex max-w-full items-center rounded-sm px-0 text-left text-sky-300 transition-colors hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60",
    label,
  );
  button.type = "button";
  button.title = `Focus on ${label}`;
  attachImmediateTileFocus(button, () => {
    focusTile(summary);
  });
  return button;
}
