export const SidebarRole = {
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
} as const;

export type SidebarRoleValue = (typeof SidebarRole)[keyof typeof SidebarRole];
