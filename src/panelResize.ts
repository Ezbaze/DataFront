import { PanelGroupNode } from "./types";
import { clamp } from "./utils";

export function startPanelResize(
  group: PanelGroupNode,
  index: number,
  event: PointerEvent,
): void {
  const wrapper = group.element?.wrapper;
  if (!wrapper) {
    return;
  }

  const findChildWrapper = (targetIndex: number): HTMLElement | null => {
    const targetValue = String(targetIndex);
    for (let i = 0; i < wrapper.children.length; i += 1) {
      const child = wrapper.children[i];
      if (
        child instanceof HTMLElement &&
        child.dataset.panelChild === targetValue
      ) {
        return child;
      }
    }
    return null;
  };

  const childA = findChildWrapper(index);
  const childB = findChildWrapper(index + 1);
  if (!childA || !childB) {
    return;
  }

  event.preventDefault();
  const orientation = group.orientation;
  const rectA = childA.getBoundingClientRect();
  const rectB = childB.getBoundingClientRect();
  const totalPixels =
    orientation === "horizontal"
      ? rectA.height + rectB.height
      : rectA.width + rectB.width;
  const initialPixelsA =
    orientation === "horizontal" ? rectA.height : rectA.width;
  const sizeA = group.sizes[index] ?? 1;
  const sizeB = group.sizes[index + 1] ?? 1;
  const combinedShareRaw = sizeA + sizeB;
  const combinedShare = combinedShareRaw > 0 ? combinedShareRaw : 1;
  const startCoord =
    orientation === "horizontal" ? event.clientY : event.clientX;
  const originalUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = "none";

  const onMove = (moveEvent: PointerEvent) => {
    const currentCoord =
      orientation === "horizontal" ? moveEvent.clientY : moveEvent.clientX;
    const delta = currentCoord - startCoord;
    const rawRatioA =
      totalPixels === 0 ? 0.5 : (initialPixelsA + delta) / totalPixels;
    const baseMinRatio = 0.15;
    const baseMaxRatio = 0.85;
    const minPanelPixels = 200;
    let minRatio = baseMinRatio;
    let maxRatio = baseMaxRatio;
    if (orientation === "horizontal") {
      const minRatioFromPixels =
        totalPixels === 0 ? 0 : minPanelPixels / totalPixels;
      const maxRatioFromPixels = totalPixels === 0 ? 1 : 1 - minRatioFromPixels;
      minRatio = Math.max(minRatio, Math.min(minRatioFromPixels, baseMaxRatio));
      maxRatio = Math.min(maxRatio, Math.max(maxRatioFromPixels, baseMinRatio));
      if (minRatio > maxRatio) {
        const middle = (minRatio + maxRatio) / 2;
        minRatio = middle;
        maxRatio = middle;
      }
    }
    const ratioA = clamp(rawRatioA, minRatio, maxRatio);
    const ratioB = 1 - ratioA;
    const nextSizeA = combinedShare * ratioA;
    const nextSizeB = combinedShare * ratioB;
    group.sizes[index] = nextSizeA;
    group.sizes[index + 1] = nextSizeB;
    childA.style.flex = `${nextSizeA} 1 0%`;
    childB.style.flex = `${nextSizeB} 1 0%`;
  };

  const stop = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", stop);
    window.removeEventListener("pointercancel", stop);
    document.body.style.userSelect = originalUserSelect;
  };

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
}
