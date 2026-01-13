import type {
  ActionRunMode,
  GameSnapshot,
  PanelLeafNode,
  SidebarActionDefinitionUpdate,
  SidebarActionSetting,
  SidebarActionSettingType,
  SidebarActionSettingValue,
  SidebarActionsState,
  SidebarLogEntry,
  SidebarLogLevel,
  SidebarLogToken,
  SidebarRunningActionStatus,
  SortDirection,
  SortKey,
  SortState,
  ViewType,
  ViewActionHandlers,
  ViewLifecycleCallbacks,
  ViewRenderOptions,
  LogViewRenderOptions,
  RequestRender,
  ViewUiContext,
} from "./types";
import { createElement, formatTimestamp } from "../../utils";
import { ensureSortState, getDefaultDirection } from "./helpers";
import { renderClanView, renderPlayersView, renderTeamView } from "./players";
import { renderShipView } from "./ships";
import { renderPlayerPanelView } from "./player-panel";
import { renderActionsDirectoryView, renderActionEditorView } from "./actions";
import {
  renderRunningActionsView,
  renderRunningActionDetailView,
} from "./running-actions";
import { renderLogView } from "./logs";
import { renderOverlayView } from "./overlays";

const DEFAULT_ACTIONS: ViewActionHandlers = {
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

export function buildViewContent(
  leaf: PanelLeafNode,
  snapshot: GameSnapshot,
  requestRender: RequestRender,
  ui: ViewUiContext,
  existingContainer?: HTMLElement,
  lifecycle?: ViewLifecycleCallbacks,
  actions?: ViewActionHandlers,
  searchFilter?: string,
): HTMLElement {
  const view = leaf.view;
  const sortState = ensureSortState(leaf, view);
  const viewActions = actions ?? DEFAULT_ACTIONS;
  const handleSort = (key: SortKey) => {
    const current = ensureSortState(leaf, view);
    const direction =
      current.key === key
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
      return createElement(
        "div",
        "text-slate-200 text-sm",
        "Unsupported view",
        ui.document,
      );
  }
}

export {
  hideColumnVisibilityMenu,
  isColumnVisibilitySupported,
  showColumnVisibilityMenu,
} from "./helpers";
export type { ViewActionHandlers, ViewLifecycleCallbacks } from "./types";
