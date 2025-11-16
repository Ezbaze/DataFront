import type {
  GameSnapshot,
  PanelLeafNode,
  SidebarActionSetting,
  SidebarRunningActionStatus,
  SortState,
  SortKey,
} from "../../types";
import type { ViewActionHandlers, ViewLifecycleCallbacks } from "./types";
import { createElement, formatTimestamp } from "../../utils";
import {
  RUNNING_ACTIONS_TABLE_HEADERS,
  TABLE_CELL_BASE_CLASS,
  applyRowSelectionIndicator,
  compareSortValues,
  createPlayerNameElement,
  createTableShell,
  getColumnVisibilitySignature,
  getVisibleHeaders,
} from "./helpers";
import { describeRunMode, formatRunStatus, getRunModeLabel } from "./actions";
import { getActionsState } from "./state";
import { SidebarRole } from "../../sidebarRoles";

export function renderRunningActionsView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions: ViewActionHandlers;
}): HTMLElement {
  const { leaf, snapshot, existingContainer, actions, sortState, onSort } =
    options;
  const state = getActionsState(snapshot);
  const signature = `${state.runningRevision}:${state.selectedRunningActionId ?? ""}:${state.running.length}`;
  const sortSignature = `${sortState.key}:${sortState.direction}`;
  const isContainer =
    !!existingContainer &&
    existingContainer.dataset.sidebarRole === SidebarRole.RunningActions;
  const visibleHeaders = getVisibleHeaders(
    leaf,
    leaf.view,
    RUNNING_ACTIONS_TABLE_HEADERS,
  );
  const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
  if (
    isContainer &&
    existingContainer.dataset.signature === signature &&
    existingContainer.dataset.sortState === sortSignature &&
    existingContainer.dataset.columnVisibilitySignature === visibilitySignature
  ) {
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
  });
  container.dataset.signature = signature;
  container.dataset.sortState = sortSignature;
  container.dataset.columnVisibilitySignature = visibilitySignature;

  const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
  const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
  const getStatusRank = (run: (typeof state.running)[number]) => {
    const rank = {
      running: 0,
      completed: 1,
      stopped: 2,
      failed: 3,
    } as const;
    return rank[run.status] ?? 4;
  };

  if (state.running.length === 0) {
    const row = createElement("tr", "hover:bg-transparent");
    const cell = createElement(
      "td",
      `${cellBaseClass} text-center text-slate-400`,
      "No actions are currently running.",
    );
    cell.colSpan = Math.max(1, visibleHeaders.length);
    row.appendChild(cell);
    tbody.appendChild(row);
    return container;
  }

  const runs = [...state.running];
  if (sortState.key === "label") {
    runs.sort((a, b) =>
      compareSortValues(
        a.name.toLowerCase(),
        b.name.toLowerCase(),
        sortState.direction,
      ),
    );
  } else if (sortState.key === "status") {
    runs.sort((a, b) => {
      const cmp = compareSortValues(
        getStatusRank(a),
        getStatusRank(b),
        sortState.direction,
      );
      if (cmp !== 0) {
        return cmp;
      }
      return compareSortValues(
        a.name.toLowerCase(),
        b.name.toLowerCase(),
        "asc",
      );
    });
  }

  for (const run of runs) {
    const isSelected = state.selectedRunningActionId === run.id;
    const row = createElement(
      "tr",
      "cursor-pointer transition-colors hover:bg-slate-800/40",
    );
    applyRowSelectionIndicator(row, isSelected);
    row.dataset.runningActionId = run.id;
    row.addEventListener("click", () => {
      actions.selectRunningAction?.(run.id);
    });

    const nameCell = createElement("td", `${cellBaseClass} text-left`);
    const nameLine = createElement("div", "flex flex-wrap items-center gap-2");
    const nameLabel = createPlayerNameElement(run.name, undefined, {
      className:
        "font-semibold text-slate-100 transition-colors hover:text-sky-200",
    });
    nameLine.appendChild(nameLabel);
    nameCell.appendChild(nameLine);

    const statusCell = createElement("td", `${cellBaseClass} text-left`);
    statusCell.appendChild(createRunStatusBadge(run.status));
    const modeCell = createElement(
      "td",
      `${cellBaseClass} text-[0.75rem] uppercase tracking-wide text-slate-400`,
      getRunModeLabel(run.runMode),
    );
    const startedCell = createElement(
      "td",
      `${cellBaseClass} text-[0.75rem] text-slate-300`,
      formatTimestamp(run.startedAtMs),
    );

    const controlsCell = createElement("td", `${cellBaseClass} text-right`);
    const stopButton = createElement(
      "button",
      "rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20",
      "Stop",
    );
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

export function renderRunningActionDetailView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  existingContainer?: HTMLElement;
  lifecycle?: ViewLifecycleCallbacks;
  actions: ViewActionHandlers;
}): HTMLElement {
  const { leaf, snapshot, existingContainer, actions } = options;
  const state = getActionsState(snapshot);
  const selectedRun = state.running.find(
    (run) => run.id === state.selectedRunningActionId,
  );
  const signature = selectedRun
    ? `${state.runningRevision}:${selectedRun.id}:${selectedRun.lastUpdatedMs}`
    : `${state.runningRevision}:none`;
  const isContainer =
    !!existingContainer &&
    existingContainer.dataset.sidebarRole === SidebarRole.RunningActionDetail;
  const container = isContainer
    ? existingContainer
    : createElement(
        "div",
        "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm",
      );
  container.className =
    "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
  container.dataset.sidebarRole = SidebarRole.RunningActionDetail;
  container.dataset.sidebarView = leaf.view;
  if (container.dataset.signature === signature) {
    return container;
  }
  container.dataset.signature = signature;

  if (!selectedRun) {
    container.replaceChildren(
      createElement(
        "div",
        "flex h-full items-center justify-center p-6 text-center text-sm text-slate-400",
        state.running.length === 0
          ? "No actions are currently running."
          : "Select a running action to adjust its settings.",
      ),
    );
    return container;
  }

  const layout = createElement(
    "div",
    "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100",
  );

  const header = createElement(
    "div",
    "flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-3",
  );
  const headerText = createElement("div", "flex flex-col gap-1");
  const titleLine = createElement(
    "div",
    "flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-100",
  );
  titleLine.appendChild(createElement("span", "", selectedRun.name));
  titleLine.appendChild(createRunStatusBadge(selectedRun.status));
  headerText.appendChild(titleLine);
  const trimmedDescription = selectedRun.description?.trim() ?? "";
  if (trimmedDescription !== "") {
    headerText.appendChild(
      createElement("div", "text-sm text-slate-400", trimmedDescription),
    );
  }
  headerText.appendChild(
    createElement(
      "div",
      "text-[0.7rem] text-slate-400",
      describeRunMode(selectedRun.runMode),
    ),
  );
  header.appendChild(headerText);
  const stopButton = createElement(
    "button",
    "rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20",
    "Stop action",
  );
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
  meta.appendChild(
    createSummaryStat("Status", formatRunStatus(selectedRun.status)),
  );
  meta.appendChild(
    createSummaryStat("Started", formatTimestamp(selectedRun.startedAtMs)),
  );
  meta.appendChild(
    createSummaryStat(
      "Last update",
      formatTimestamp(selectedRun.lastUpdatedMs),
    ),
  );
  layout.appendChild(meta);

  if (selectedRun.runMode === "continuous") {
    const intervalField = createElement(
      "label",
      "flex w-full max-w-xs flex-col gap-1",
    );
    intervalField.appendChild(
      createElement(
        "span",
        "text-xs uppercase tracking-wide text-slate-400",
        "Run every (ticks)",
      ),
    );
    const intervalInput = document.createElement("input");
    intervalInput.type = "number";
    intervalInput.min = "1";
    intervalInput.className =
      "w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
    intervalInput.value = String(selectedRun.runIntervalTicks ?? 1);
    intervalInput.addEventListener("change", () => {
      const numeric = Number(intervalInput.value);
      const normalized =
        Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
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
  settingsSection.appendChild(
    createElement(
      "span",
      "text-xs uppercase tracking-wide text-slate-400",
      "Runtime settings",
    ),
  );
  const settingsList = createElement("div", "flex flex-col gap-3");
  if (selectedRun.settings.length === 0) {
    settingsList.appendChild(
      createElement(
        "p",
        "text-[0.75rem] text-slate-400",
        "This action does not expose any runtime settings.",
      ),
    );
  } else {
    for (const setting of selectedRun.settings) {
      settingsList.appendChild(
        createRunningSettingField(selectedRun.id, setting, actions),
      );
    }
  }
  settingsSection.appendChild(settingsList);
  layout.appendChild(settingsSection);

  container.replaceChildren(layout);
  return container;
}

function createRunStatusBadge(status: SidebarRunningActionStatus): HTMLElement {
  const baseClass =
    "rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide";
  const styles: Record<SidebarRunningActionStatus, string> = {
    running: "bg-emerald-500/20 text-emerald-200",
    completed: "bg-sky-500/20 text-sky-200",
    stopped: "bg-amber-500/20 text-amber-200",
    failed: "bg-rose-500/20 text-rose-200",
  };
  const className = `${baseClass} ${styles[status] ?? "bg-slate-700/60 text-slate-200"}`;
  return createElement("span", className, formatRunStatus(status));
}

function createSummaryStat(label: string, value: string): HTMLElement {
  const wrapper = createElement(
    "div",
    "rounded-md border border-slate-800/70 bg-slate-900/70 px-3 py-2",
  );
  const title = createElement(
    "div",
    "text-[0.65rem] uppercase tracking-wide text-slate-400",
    label,
  );
  const content = createElement(
    "div",
    "font-mono text-base text-slate-100",
    value,
  );
  wrapper.appendChild(title);
  wrapper.appendChild(content);
  return wrapper;
}

function createRunningSettingField(
  runId: string,
  setting: SidebarActionSetting,
  actions: ViewActionHandlers,
): HTMLElement {
  const field = createElement(
    "div",
    "rounded-md border border-slate-800/70 bg-slate-900/70 p-3",
  );
  const header = createElement(
    "div",
    "flex items-center justify-between gap-2",
  );
  const rawLabel = setting.label?.trim() ?? "";
  const rawKey = setting.key?.trim() ?? "";
  const displayLabel =
    rawLabel !== "" ? rawLabel : rawKey !== "" ? rawKey : "Setting";
  header.appendChild(
    createElement("div", "text-sm font-medium text-slate-100", displayLabel),
  );
  header.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      setting.type,
    ),
  );
  field.appendChild(header);
  if (setting.key) {
    field.appendChild(
      createElement(
        "div",
        "text-[0.65rem] text-slate-500",
        `Key: ${setting.key}`,
      ),
    );
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
        actions.updateRunningActionSetting?.(
          runId,
          setting.id,
          Number.isFinite(numeric) ? numeric : 0,
        );
      });
      controlContainer.appendChild(input);
      break;
    }
    case "toggle": {
      const wrapper = createElement(
        "label",
        "flex items-center gap-2 text-xs text-slate-200",
      );
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
