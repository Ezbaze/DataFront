import type {
  GameSnapshot,
  PanelLeafNode,
  SortState,
  SortKey,
} from "../../types";
import type { ViewActionHandlers, ViewUiContext } from "./types";
import { createElement as createElementBase } from "../../utils";
import {
  OVERLAY_TABLE_HEADERS,
  TABLE_CELL_BASE_CLASS,
  compareSortValues,
  createTableShell,
  getColumnVisibilitySignature,
  getVisibleHeaders,
} from "./helpers";
import { SidebarRole } from "../../sidebarRoles";

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

export function renderOverlayView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  ui: ViewUiContext;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions: ViewActionHandlers;
}): HTMLElement {
  return withViewDocument(options.ui.document, () => {
    const { leaf, snapshot, existingContainer, actions, sortState, onSort } =
      options;
    const overlays = snapshot.sidebarOverlays ?? [];
    const revision = snapshot.sidebarOverlayRevision ?? 0;
    const signature = `${revision}:${overlays
      .map(
        (overlay) =>
          `${overlay.id}:${overlay.enabled ? 1 : 0}:${overlay.scope}:${overlay.label}`,
      )
      .join("|")}`;
    const sortSignature = `${sortState.key}:${sortState.direction}`;
    const isOverlayContainer =
      !!existingContainer &&
      existingContainer.dataset.sidebarRole === SidebarRole.OverlaysDirectory;
    const visibleHeaders = getVisibleHeaders(
      leaf,
      leaf.view,
      OVERLAY_TABLE_HEADERS,
    );
    const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
    if (
      isOverlayContainer &&
      existingContainer.dataset.signature === signature &&
      existingContainer.dataset.sortState === sortSignature &&
      existingContainer.dataset.columnVisibilitySignature ===
        visibilitySignature
    ) {
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
      const cell = createElement(
        "td",
        `${cellBaseClass} text-center text-slate-400`,
        "No overlays available.",
      );
      cell.colSpan = Math.max(1, visibleHeaders.length);
      row.appendChild(cell);
      tbody.appendChild(row);
      return container;
    }

    const sortedOverlays = [...overlays];
    if (sortState.key === "label") {
      sortedOverlays.sort((a, b) =>
        compareSortValues(
          a.label.toLowerCase(),
          b.label.toLowerCase(),
          sortState.direction,
        ),
      );
    } else if (sortState.key === "scope") {
      sortedOverlays.sort((a, b) =>
        compareSortValues(a.scope, b.scope, sortState.direction),
      );
    } else if (sortState.key === "status") {
      sortedOverlays.sort((a, b) =>
        compareSortValues(
          a.enabled ? 1 : 0,
          b.enabled ? 1 : 0,
          sortState.direction,
        ),
      );
    }

    for (const overlay of sortedOverlays) {
      const row = createElement(
        "tr",
        "transition-colors hover:bg-slate-800/40",
      );
      const nameCell = createElement("td", `${cellBaseClass} text-left`);
      const nameStack = createElement("div", "flex flex-col gap-1");
      const nameLabel = createElement(
        "span",
        "font-semibold text-slate-100",
        overlay.label,
      );
      nameStack.appendChild(nameLabel);
      nameCell.appendChild(nameStack);

      const scopeCell = createElement("td", `${cellBaseClass} text-left`);
      scopeCell.textContent = overlay.scope === "lobby" ? "Lobby" : "Game";

      const statusCell = createElement("td", `${cellBaseClass} text-right`);
      const toggleWrapper = createElement("div", "flex justify-end");
      const toggleButton = createElement(
        "button",
        "relative inline-flex h-6 w-12 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60",
      );
      toggleButton.type = "button";
      toggleButton.setAttribute("role", "switch");
      const srToggleLabel = createElement("span", "sr-only", "Toggle overlay");
      const toggleKnob = createElement(
        "span",
        "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out",
      );
      toggleButton.appendChild(srToggleLabel);
      toggleButton.appendChild(toggleKnob);
      const updateToggleAppearance = (enabled: boolean) => {
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
