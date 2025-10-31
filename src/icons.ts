import {
  ArrowDown,
  Columns3,
  createElement,
  Plus,
  SquareSplitHorizontal,
  SquareSplitVertical,
  Trash,
  X,
} from "lucide";

const ICONS = {
  "split-horizontal": SquareSplitVertical,
  "split-vertical": SquareSplitHorizontal,
  close: X,
  plus: Plus,
  trash: Trash,
  "arrow-down": ArrowDown,
  columns: Columns3,
} as const;

type IconKind = keyof typeof ICONS;

export function renderIcon(kind: IconKind, className: string): SVGSVGElement {
  const iconNode = ICONS[kind];
  const svg = createElement(iconNode) as SVGSVGElement;
  if (className) {
    svg.setAttribute("class", className);
  }
  svg.setAttribute("aria-hidden", "true");
  return svg;
}
