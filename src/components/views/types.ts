import type {
  ActionRunMode,
  GameSnapshot,
  PanelLeafNode,
  PlayerRecord,
  ShipRecord,
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
  TileSummary,
  ViewType,
} from "../../types";

export type {
  ActionRunMode,
  GameSnapshot,
  PanelLeafNode,
  PlayerRecord,
  ShipRecord,
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
  TileSummary,
  ViewType,
} from "../../types";

export type RequestRender = () => void;

export interface ViewLifecycleCallbacks {
  registerCleanup?: (cleanup: () => void) => void;
}

export interface ViewActionHandlers {
  toggleTrading: (playerIds: string[], stopped: boolean) => void;
  showPlayerDetails: (playerId: string) => void;
  focusPlayer?: (playerId: string) => void;
  focusTeam?: (teamId: string) => void;
  focusClan?: (clanId: string) => void;
  createAction?: () => void;
  selectAction?: (actionId?: string) => void;
  setActionEnabled?: (actionId: string, enabled: boolean) => void;
  saveAction?: (
    actionId: string,
    update: SidebarActionDefinitionUpdate,
  ) => void;
  deleteAction?: (actionId: string) => void;
  startAction?: (actionId: string) => void;
  selectRunningAction?: (runningId?: string) => void;
  stopRunningAction?: (runningId: string) => void;
  updateRunningActionSetting?: (
    runningId: string,
    settingId: string,
    value: SidebarActionSettingValue,
  ) => void;
  setRunningActionInterval?: (runId: string, ticks: number) => void;
  clearLogs?: () => void;
  setOverlayEnabled?: (overlayId: string, enabled: boolean) => void;
}

export interface ViewRenderOptions {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  requestRender: RequestRender;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions: ViewActionHandlers;
  lifecycle?: ViewLifecycleCallbacks;
}

export interface LogViewRenderOptions {
  leaf: PanelLeafNode;
  snapshot: GameSnapshot;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  existingContainer?: HTMLElement;
  actions?: ViewActionHandlers;
}

export interface ColumnVisibilityMenuOptions {
  leaf: PanelLeafNode;
  anchor: HTMLElement;
  onChange?: () => void;
}

export interface ActionEditorSettingState {
  id: string;
  key: string;
  label: string;
  type: SidebarActionSettingType;
  value: SidebarActionSettingValue;
}

export interface ActionEditorFormState {
  id: string;
  name: string;
  runMode: ActionRunMode;
  enabled: boolean;
  description: string;
  runIntervalTicks: number;
  code: string;
  settings: ActionEditorSettingState[];
}

/**
 * The action editor keeps a cached representation of the current form state on
 * the container element so the DOM can be safely reused between renders.
 */
export interface ActionEditorContainer extends HTMLElement {
  formState?: ActionEditorFormState;
}
