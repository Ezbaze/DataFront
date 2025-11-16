import type { GameSnapshot, SidebarActionsState } from "../../types";

export const EMPTY_ACTIONS_STATE: SidebarActionsState = {
  revision: 0,
  runningRevision: 0,
  actions: [],
  running: [],
};

export function getActionsState(snapshot: GameSnapshot): SidebarActionsState {
  return snapshot.sidebarActions ?? EMPTY_ACTIONS_STATE;
}
