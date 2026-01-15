import {
  PanelGroupNode,
  PanelLeafNode,
  PanelNode,
  PanelOrientation,
  SortState,
  ViewType,
} from "./types";

const DEFAULT_SORT_STATES: Record<ViewType, SortState> = {
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

export function createLeaf(view: ViewType): PanelLeafNode {
  return {
    id: `leaf-${++leafIdCounter}`,
    type: "leaf",
    view,
    expandedRows: new Set<string>(),
    expandedGroups: new Set<string>(),
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

export function createGroup(
  orientation: PanelOrientation,
  children: PanelNode[],
): PanelGroupNode {
  const count = Math.max(children.length, 1);
  return {
    id: `group-${++groupIdCounter}`,
    type: "group",
    orientation,
    children,
    sizes: new Array(count).fill(1 / count),
  };
}

export function createDefaultRootNode(): PanelNode {
  const clanmatesLeaf = createLeaf("clanmates");
  const logsLeaf = createLeaf("logs");
  const group = createGroup("horizontal", [clanmatesLeaf, logsLeaf]);
  group.sizes = [0.8, 0.2];
  return group;
}

export interface PanelParentInfo {
  parent: PanelGroupNode;
  index: number;
}

export function findPanelParent(
  current: PanelNode,
  target: PanelNode,
): PanelParentInfo | null {
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

export function splitPanelLeaf(
  rootNode: PanelNode,
  leaf: PanelLeafNode,
  orientation: PanelOrientation,
): PanelNode {
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
    const fallbackSize =
      parent.children.length > 0 ? 1 / parent.children.length : 1;
    const inferredSize = Math.max(1 - otherSizes, 0);
    const currentSize =
      parent.sizes[index] ?? (inferredSize > 0 ? inferredSize : fallbackSize);
    const newSize = currentSize / 2;
    parent.sizes[index] = currentSize - newSize;
    parent.children.splice(index + 1, 0, newLeaf);
    parent.sizes.splice(index + 1, 0, newSize);
  } else {
    const replacement = createGroup(orientation, [leaf, newLeaf]);
    parent.children[index] = replacement;
  }

  return rootNode;
}
