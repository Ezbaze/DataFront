import type {
  ActionRunMode,
  GameSnapshot,
  PanelLeafNode,
  SidebarRunningActionStatus,
  SidebarActionDefinitionUpdate,
  SidebarActionSetting,
  SidebarActionSettingType,
  SidebarActionSettingValue,
  SidebarActionsState,
  SortState,
  SortKey,
} from "../../types";
import type {
  ViewActionHandlers,
  ViewLifecycleCallbacks,
  ViewUiContext,
  ActionEditorContainer,
  ActionEditorFormState,
  ActionEditorSettingState,
} from "./types";
import {
  createElement as createElementBase,
  formatTimestamp,
} from "../../utils";
import {
  ACTIONS_TABLE_HEADERS,
  TABLE_CELL_BASE_CLASS,
  applyRowSelectionIndicator,
  compareSortValues,
  createPlayerNameElement,
  createTableShell,
  getColumnVisibilitySignature,
  getVisibleHeaders,
} from "./helpers";
import { getActionsState } from "./state";
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

let editorSettingIdCounter = 0;

function nextEditorSettingId(): string {
  editorSettingIdCounter += 1;
  return `editor-setting-${editorSettingIdCounter}`;
}

export function getRunModeLabel(mode: ActionRunMode): string {
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

export function describeRunMode(mode: ActionRunMode): string {
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

export function formatRunStatus(status: SidebarRunningActionStatus): string {
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

function defaultValueForType(
  type: SidebarActionSettingType,
): SidebarActionSettingValue {
  switch (type) {
    case "number":
      return 0;
    case "toggle":
      return false;
    default:
      return "";
  }
}

export function renderActionsDirectoryView(options: {
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
    const state = getActionsState(snapshot);
    const runningSignature =
      state.running.length === 0
        ? "none"
        : state.running
            .map((run) =>
              [run.id, run.actionId, run.status, run.lastUpdatedMs ?? "0"].join(
                ":",
              ),
            )
            .sort()
            .join("|");
    const signature = `${state.revision}:${state.runningRevision}:${state.selectedActionId ?? ""}:${runningSignature}`;
    const sortSignature = `${sortState.key}:${sortState.direction}`;
    const isDirectoryContainer =
      !!existingContainer &&
      existingContainer.dataset.sidebarRole === SidebarRole.ActionsDirectory;
    const visibleHeaders = getVisibleHeaders(
      leaf,
      leaf.view,
      ACTIONS_TABLE_HEADERS,
    );
    const visibilitySignature = getColumnVisibilitySignature(visibleHeaders);
    if (
      isDirectoryContainer &&
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
      existingContainer: isDirectoryContainer ? existingContainer : undefined,
      view: leaf.view,
      headers: visibleHeaders,
      role: SidebarRole.ActionsDirectory,
      document: viewDocument,
    });
    container.dataset.signature = signature;
    container.dataset.sortState = sortSignature;
    container.dataset.columnVisibilitySignature = visibilitySignature;

    const runningLookup = new Set(state.running.map((run) => run.actionId));
    const cellBaseClass = `${TABLE_CELL_BASE_CLASS} align-top`;
    const visibleKeys = new Set(visibleHeaders.map((header) => header.key));
    const getStatusRank = (action: SidebarActionsState["actions"][number]) => {
      if (runningLookup.has(action.id)) {
        return 0;
      }
      return action.enabled ? 1 : 2;
    };
    const getEnabledRank = (action: SidebarActionsState["actions"][number]) =>
      action.enabled ? 0 : 1;

    if (state.actions.length === 0) {
      const row = createElement("tr", "hover:bg-transparent");
      const cell = createElement(
        "td",
        `${cellBaseClass} text-center text-slate-400`,
        "No actions yet. Create a new action to get started.",
      );
      cell.colSpan = Math.max(1, visibleHeaders.length);
      row.appendChild(cell);
      tbody.appendChild(row);
    } else {
      const sortedActions = [...state.actions];
      if (sortState.key === "label") {
        sortedActions.sort((a, b) =>
          compareSortValues(
            a.name.toLowerCase(),
            b.name.toLowerCase(),
            sortState.direction,
          ),
        );
      } else if (sortState.key === "status") {
        sortedActions.sort((a, b) => {
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
      } else if (sortState.key === "enabled") {
        sortedActions.sort((a, b) => {
          const cmp = compareSortValues(
            getEnabledRank(a),
            getEnabledRank(b),
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

      for (const action of sortedActions) {
        const isSelected = state.selectedActionId === action.id;
        const isRunning = runningLookup.has(action.id);
        const row = createElement(
          "tr",
          "cursor-pointer transition-colors hover:bg-slate-800/40",
        );
        applyRowSelectionIndicator(row, isSelected);
        row.dataset.actionId = action.id;
        row.addEventListener("click", () => {
          actions.selectAction?.(action.id);
        });

        const nameCell = createElement("td", `${cellBaseClass} text-left`);
        const nameLine = createElement(
          "div",
          "flex flex-wrap items-center gap-2",
        );
        const nameLabel = createPlayerNameElement(action.name, undefined, {
          className:
            "font-semibold text-slate-100 transition-colors hover:text-sky-200",
          document: viewDocument,
        });
        nameLine.appendChild(nameLabel);
        nameCell.appendChild(nameLine);

        const statusCell = createElement("td", `${cellBaseClass} text-left`);
        const statusBadges = createElement(
          "div",
          "flex flex-wrap items-center gap-2",
        );
        const updateStatusBadges = (enabled: boolean) => {
          statusBadges.replaceChildren();
          if (isRunning) {
            statusBadges.appendChild(createActionStatusBadge("Running"));
          }
          if (!enabled) {
            statusBadges.appendChild(createActionStatusBadge("Disabled"));
          } else if (!isRunning) {
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
        const toggleButton = createElement(
          "button",
          "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60",
        ) as HTMLButtonElement;
        toggleButton.type = "button";
        toggleButton.setAttribute("role", "switch");
        const srToggleLabel = createElement("span", "sr-only", "Toggle action");
        const toggleKnob = createElement(
          "span",
          "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out",
        );
        toggleButton.appendChild(srToggleLabel);
        toggleButton.appendChild(toggleKnob);
        const runButton = createElement(
          "button",
          "rounded-md border border-sky-500/50 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/20",
          "Run",
        );
        runButton.type = "button";
        const updateRunButton = (enabled: boolean) => {
          if (enabled) {
            runButton.disabled = false;
            runButton.classList.remove(
              "cursor-not-allowed",
              "opacity-40",
              "pointer-events-none",
              "hover:bg-sky-500/10",
            );
            runButton.classList.add("hover:bg-sky-500/20");
            runButton.title = "";
          } else {
            runButton.disabled = true;
            runButton.classList.add(
              "cursor-not-allowed",
              "opacity-40",
              "pointer-events-none",
              "hover:bg-sky-500/10",
            );
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

        const editButton = createElement(
          "button",
          "rounded-md border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-sky-200",
          "Edit",
        );
        editButton.type = "button";
        editButton.addEventListener("click", (event) => {
          event.stopPropagation();
          actions.selectAction?.(action.id);
        });

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
  });
}

export function renderActionEditorView(options: {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  ui: ViewUiContext;
  existingContainer?: ActionEditorContainer;
  lifecycle?: ViewLifecycleCallbacks;
  actions: ViewActionHandlers;
}): HTMLElement {
  return withViewDocument(options.ui.document, () => {
    const { leaf, snapshot, existingContainer, actions } = options;
    const state = getActionsState(snapshot);
    const selectedAction = state.actions.find(
      (action) => action.id === state.selectedActionId,
    );
    const signature = selectedAction
      ? `${state.revision}:${selectedAction.id}:${selectedAction.updatedAtMs}`
      : `${state.revision}:none`;
    const prior = existingContainer;
    const isEditorContainer =
      !!prior && prior.dataset.sidebarRole === SidebarRole.ActionEditor;
    const container: ActionEditorContainer = isEditorContainer
      ? (prior as ActionEditorContainer)
      : (createElement(
          "div",
          "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm",
        ) as ActionEditorContainer);
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
      container.replaceChildren(
        createElement(
          "div",
          "flex h-full items-center justify-center p-6 text-center text-sm text-slate-400",
          state.actions.length === 0
            ? "Create an action to begin editing its script."
            : "Select an action from the Actions view to edit its script and settings.",
        ),
      );
      return container;
    }

    const formState: ActionEditorFormState = {
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

    const layout = createElement(
      "div",
      "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100",
    );

    const header = createElement(
      "div",
      "flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/70 pb-3",
    );
    const initialTitle = formState.name.trim();
    const titlePreview = createElement(
      "div",
      "text-lg font-semibold text-slate-100",
      initialTitle === "" ? "Untitled action" : formState.name,
    );
    const descriptionPreview = createElement(
      "div",
      "text-sm text-slate-400",
      formState.description.trim() === ""
        ? "Add a description..."
        : formState.description,
    );
    if (formState.description.trim() === "") {
      descriptionPreview.classList.add("italic", "text-slate-500");
    }
    const headerText = createElement("div", "flex flex-col gap-1");
    headerText.appendChild(titlePreview);
    headerText.appendChild(descriptionPreview);
    header.appendChild(headerText);

    const headerMeta = createElement(
      "div",
      "flex flex-col items-end gap-2 text-right text-[0.7rem] text-slate-400",
    );
    const enabledToggleWrapper = createElement("div", "flex items-center");
    const enabledToggle = createElement(
      "button",
      "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/60",
    ) as HTMLButtonElement;
    enabledToggle.type = "button";
    enabledToggle.setAttribute("role", "switch");
    const srEnabledLabel = createElement("span", "sr-only", "Toggle action");
    const enabledToggleKnob = createElement(
      "span",
      "pointer-events-none absolute left-1 h-4 w-4 rounded-full shadow transition-transform duration-150 ease-out",
    );
    enabledToggle.appendChild(srEnabledLabel);
    enabledToggle.appendChild(enabledToggleKnob);
    const updateToggleAppearance = (enabled: boolean) => {
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
    const headerMode = createElement(
      "div",
      "",
      describeRunMode(formState.runMode),
    );
    headerMeta.appendChild(headerMode);
    headerMeta.appendChild(
      createElement(
        "div",
        "text-[0.65rem] uppercase tracking-wide text-slate-500",
        `Last updated ${formatTimestamp(selectedAction.updatedAtMs)}`,
      ),
    );
    header.appendChild(headerMeta);
    layout.appendChild(header);

    const nameField = createElement("label", "flex flex-col gap-1");
    nameField.appendChild(
      createElement(
        "span",
        "text-xs uppercase tracking-wide text-slate-400",
        "Name",
      ),
    );
    const nameInput = viewDocument.createElement("input");
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
    descriptionField.appendChild(
      createElement(
        "span",
        "text-xs uppercase tracking-wide text-slate-400",
        "Description",
      ),
    );
    const descriptionInput = viewDocument.createElement("textarea");
    descriptionInput.className =
      "min-h-[72px] w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
    descriptionInput.value = formState.description;
    descriptionInput.addEventListener("input", () => {
      formState.description = descriptionInput.value;
      const trimmed = descriptionInput.value.trim();
      if (trimmed === "") {
        descriptionPreview.textContent = "Add a description...";
        descriptionPreview.classList.add("italic", "text-slate-500");
      } else {
        descriptionPreview.textContent = descriptionInput.value;
        descriptionPreview.classList.remove("italic", "text-slate-500");
      }
    });
    descriptionField.appendChild(descriptionInput);
    layout.appendChild(descriptionField);

    const runConfigRow = createElement("div", "flex flex-wrap gap-4");
    const modeField = createElement("label", "flex flex-col gap-1");
    modeField.appendChild(
      createElement(
        "span",
        "text-xs uppercase tracking-wide text-slate-400",
        "Run mode",
      ),
    );
    const modeSelect = viewDocument.createElement("select");
    modeSelect.className =
      "w-48 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
    for (const option of [
      { value: "continuous", label: "Continuous" },
      { value: "once", label: "Run once" },
      { value: "event", label: "Event-driven" },
    ]) {
      const opt = viewDocument.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      modeSelect.appendChild(opt);
    }
    modeSelect.value = formState.runMode;
    modeField.appendChild(modeSelect);
    runConfigRow.appendChild(modeField);

    const intervalField = createElement("label", "flex flex-col gap-1");
    intervalField.appendChild(
      createElement(
        "span",
        "text-xs uppercase tracking-wide text-slate-400",
        "Run every (ticks)",
      ),
    );
    const intervalInput = viewDocument.createElement("input");
    intervalInput.type = "number";
    intervalInput.min = "1";
    intervalInput.className =
      "w-40 rounded-md border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
    intervalInput.value = String(formState.runIntervalTicks);
    intervalInput.addEventListener("change", () => {
      const numeric = Number(intervalInput.value);
      const normalized =
        Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
      intervalInput.value = String(normalized);
      formState.runIntervalTicks = normalized;
    });
    intervalField.appendChild(intervalInput);
    if (formState.runMode !== "continuous") {
      intervalField.classList.add("hidden");
    }
    runConfigRow.appendChild(intervalField);

    modeSelect.addEventListener("change", () => {
      formState.runMode = modeSelect.value as ActionRunMode;
      headerMode.textContent = describeRunMode(formState.runMode);
      intervalField.classList.toggle(
        "hidden",
        formState.runMode !== "continuous",
      );
    });

    layout.appendChild(runConfigRow);

    const codeField = createElement("div", "flex flex-col gap-2");
    codeField.appendChild(
      createElement(
        "span",
        "text-xs uppercase tracking-wide text-slate-400",
        "Script",
      ),
    );
    const codeArea = viewDocument.createElement("textarea");
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
    const settingsHeader = createElement(
      "div",
      "flex items-center justify-between gap-2",
    );
    settingsHeader.appendChild(
      createElement(
        "span",
        "text-xs uppercase tracking-wide text-slate-400",
        "Settings",
      ),
    );
    const settingsList = createElement("div", "flex flex-col gap-3");
    const removeSetting = (settingId: string) => {
      const index = formState.settings.findIndex(
        (entry) => entry.id === settingId,
      );
      if (index !== -1) {
        formState.settings.splice(index, 1);
      }
    };
    for (const setting of formState.settings) {
      settingsList.appendChild(
        createActionSettingEditorCard(formState, setting, removeSetting),
      );
    }
    const addSettingButton = createElement(
      "button",
      "rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-sky-500/60 hover:text-sky-200",
      "Add setting",
    );
    addSettingButton.type = "button";
    addSettingButton.addEventListener("click", () => {
      const newSetting: ActionEditorSettingState = {
        id: nextEditorSettingId(),
        key: "",
        label: "",
        type: "text",
        value: "",
      };
      formState.settings.push(newSetting);
      settingsList.appendChild(
        createActionSettingEditorCard(formState, newSetting, removeSetting),
      );
    });
    settingsHeader.appendChild(addSettingButton);
    settingsSection.appendChild(settingsHeader);
    if (formState.settings.length === 0) {
      settingsSection.appendChild(
        createElement(
          "p",
          "text-[0.75rem] text-slate-400",
          "Add settings to expose configurable values that can be adjusted while the action runs.",
        ),
      );
    }
    settingsSection.appendChild(settingsList);
    layout.appendChild(settingsSection);

    const footer = createElement(
      "div",
      "flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70 pt-4",
    );
    const leftControls = createElement("div", "flex items-center gap-2");
    const runButton = createElement(
      "button",
      "rounded-md border border-sky-500/60 bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/30",
      "Run action",
    );
    runButton.type = "button";
    const applyRunButtonState = (enabled: boolean) => {
      if (enabled) {
        runButton.disabled = false;
        runButton.classList.remove(
          "cursor-not-allowed",
          "opacity-40",
          "pointer-events-none",
          "hover:bg-sky-500/10",
        );
        runButton.classList.add("hover:bg-sky-500/20");
        runButton.title = "";
      } else {
        runButton.disabled = true;
        runButton.classList.add(
          "cursor-not-allowed",
          "opacity-40",
          "pointer-events-none",
          "hover:bg-sky-500/10",
        );
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
    const deleteButton = createElement(
      "button",
      "rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-colors hover:bg-rose-500/20",
      "Delete",
    );
    deleteButton.type = "button";
    deleteButton.addEventListener("click", () => {
      actions.deleteAction?.(selectedAction.id);
    });
    const saveButton = createElement(
      "button",
      "rounded-md border border-sky-500/60 bg-sky-500/20 px-4 py-1.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/30",
      "Save changes",
    );
    saveButton.type = "button";
    saveButton.addEventListener("click", () => {
      const update: SidebarActionDefinitionUpdate = {
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
          value:
            setting.type === "number"
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

function createActionStatusBadge(status: "Enabled" | "Running" | "Disabled") {
  const baseClass =
    "rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide";
  const styles: Record<"Enabled" | "Running" | "Disabled", string> = {
    Enabled: "bg-sky-500/20 text-sky-200",
    Running: "bg-emerald-500/20 text-emerald-200",
    Disabled: "bg-slate-700/60 text-slate-200",
  };
  return createElement("span", `${baseClass} ${styles[status]}`, status);
}

function createActionSettingEditorCard(
  formState: ActionEditorFormState,
  setting: ActionEditorSettingState,
  onRemove: (settingId: string) => void,
): HTMLElement {
  const card = createElement(
    "div",
    "rounded-md border border-slate-800/70 bg-slate-900/70 p-3",
  );
  const header = createElement("div", "flex flex-wrap items-center gap-3");

  const labelField = createElement(
    "label",
    "flex min-w-[160px] flex-1 flex-col gap-1",
  );
  labelField.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      "Label",
    ),
  );
  const labelInput = viewDocument.createElement("input");
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
  keyField.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      "Key",
    ),
  );
  const keyInput = viewDocument.createElement("input");
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
  typeField.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      "Type",
    ),
  );
  const typeSelect = viewDocument.createElement("select");
  typeSelect.className =
    "rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/70";
  for (const option of [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "toggle", label: "Toggle" },
  ]) {
    const opt = viewDocument.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    typeSelect.appendChild(opt);
  }
  typeSelect.value = setting.type;
  typeField.appendChild(typeSelect);
  header.appendChild(typeField);

  const removeButton = createElement(
    "button",
    "rounded-md border border-slate-700 bg-transparent px-2 py-1 text-xs text-slate-300 transition-colors hover:border-rose-500/60 hover:text-rose-300",
    "Remove",
  );
  removeButton.type = "button";
  removeButton.addEventListener("click", (event) => {
    event.preventDefault();
    onRemove(setting.id);
    card.remove();
  });
  header.appendChild(removeButton);
  card.appendChild(header);

  const valueWrapper = createElement("div", "mt-3 flex flex-col gap-1");
  valueWrapper.appendChild(
    createElement(
      "span",
      "text-[0.65rem] uppercase tracking-wide text-slate-400",
      "Value",
    ),
  );
  const valueContainer = createElement("div", "flex items-center gap-2");
  const updateValue = (value: SidebarActionSettingValue) => {
    setting.value = value;
  };
  let control = createSettingValueInput(setting, updateValue);
  valueContainer.appendChild(control);
  valueWrapper.appendChild(valueContainer);
  card.appendChild(valueWrapper);

  typeSelect.addEventListener("change", () => {
    const nextType = typeSelect.value as SidebarActionSettingType;
    setting.type = nextType;
    setting.value = defaultValueForType(nextType);
    control = createSettingValueInput(setting, updateValue);
    valueContainer.replaceChildren(control);
  });

  return card;
}

function createSettingValueInput(
  setting: ActionEditorSettingState,
  onChange: (value: SidebarActionSettingValue) => void,
): HTMLElement {
  switch (setting.type) {
    case "number": {
      const input = viewDocument.createElement("input");
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
      const wrapper = createElement(
        "label",
        "flex items-center gap-2 text-xs text-slate-200",
      );
      const toggle = viewDocument.createElement("input");
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
      const input = viewDocument.createElement("input");
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
