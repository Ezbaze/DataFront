import { CirclePoundSterling, Users, createElement } from "lucide";
import type {
  SidebarDonationEvent,
  SidebarGoldDonationEvent,
  SidebarTroopDonationEvent,
} from "./types";

type LucideIconNode = Parameters<typeof createElement>[0];

export interface TransformHandlerLike {
  boundingRect(): DOMRect;
  screenToWorldCoordinates(
    screenX: number,
    screenY: number,
  ): {
    x: number;
    y: number;
  };
  worldToScreenCoordinates(cell: { x: number; y: number }): {
    x: number;
    y: number;
  };
  scale: number;
}

export interface UiStateLike {
  ghostStructure: string | null;
}

export interface MissileSiloSummary {
  x: number;
  y: number;
  ready: boolean;
  ownerId?: string;
  color?: string;
}

export interface MissileFlightSummary {
  id: string;
  origin: { x: number; y: number };
  target: { x: number; y: number };
  current: { x: number; y: number } | null;
  split?: { x: number; y: number } | null;
  color?: string;
  ownerId?: string;
  unitType?: string;
}

interface MissileTrajectoryOverlayOptions {
  resolveTransform: () => TransformHandlerLike | null;
  resolveUiState: () => UiStateLike | null;
}

interface Point {
  x: number;
  y: number;
}

function computeMirvSplitPoint(start: Point, target: Point): Point {
  const startTileX = Math.floor(start.x);
  const targetTileX = Math.floor(target.x);
  const targetTileY = Math.floor(target.y);
  const splitTileX = Math.floor((startTileX + targetTileX) / 2);
  const splitTileY = Math.max(0, targetTileY - 500) + 50;
  return { x: splitTileX + 0.5, y: splitTileY + 0.5 } satisfies Point;
}

export class MissileTrajectoryOverlay {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D | null;
  private rafHandle: number | null = null;
  private pointer: Point | null = null;
  private lastValidPointer: Point | null = null;
  private siloPositions: MissileSiloSummary[] = [];
  private active = false;
  private attached = false;
  private hostElement: HTMLElement | null = null;
  private cleanupCallbacks: Array<() => void> = [];
  private cssWidth = 0;
  private cssHeight = 0;
  private pixelRatio = 1;
  private offsetLeft = 0;
  private offsetTop = 0;

  constructor(private readonly options: MissileTrajectoryOverlayOptions) {
    if (typeof document === "undefined") {
      throw new Error(
        "MissileTrajectoryOverlay requires a browser environment",
      );
    }

    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "fixed";
    this.canvas.style.left = "0";
    this.canvas.style.top = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "30";
    this.canvas.style.display = "none";
    this.context = this.canvas.getContext("2d");
  }

  setSiloPositions(positions: readonly MissileSiloSummary[]): void {
    this.siloPositions = positions.map((position) => ({ ...position }));
  }

  enable(): void {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }
    if (this.active) {
      return;
    }
    this.active = true;
    this.ensureAttached();
    this.canvas.style.display = "block";
    this.updateCanvasSize();
    this.registerEventListeners();
    this.render();
    this.scheduleRender();
  }

  disable(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.canvas.style.display = "none";
    this.cancelRender();
    this.cleanupEventListeners();
    this.pointer = null;
    this.lastValidPointer = null;
    this.clearCanvas();
  }

  dispose(): void {
    this.disable();
    if (this.attached) {
      this.canvas.remove();
      this.attached = false;
      this.hostElement = null;
    }
  }

  private registerEventListeners(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (this.cleanupCallbacks.length > 0) {
      return;
    }

    const handlePointer = (event: PointerEvent) => {
      this.pointer = { x: event.clientX, y: event.clientY };
    };
    const handlePointerLeave = () => {
      this.pointer = null;
    };
    const handleResize = () => {
      this.updateCanvasSize();
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("pointerdown", handlePointer, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);
    window.addEventListener("resize", handleResize);

    this.cleanupCallbacks = [
      () => window.removeEventListener("pointermove", handlePointer),
      () => window.removeEventListener("pointerdown", handlePointer),
      () => window.removeEventListener("pointerleave", handlePointerLeave),
      () => window.removeEventListener("blur", handlePointerLeave),
      () => window.removeEventListener("resize", handleResize),
    ];
  }

  private cleanupEventListeners(): void {
    if (this.cleanupCallbacks.length === 0) {
      return;
    }
    for (const cleanup of this.cleanupCallbacks) {
      try {
        cleanup();
      } catch {
        // Ignore listener cleanup failures; browser will detach them on navigation.
      }
    }
    this.cleanupCallbacks = [];
  }

  private scheduleRender(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (this.rafHandle !== null) {
      return;
    }
    const loop = () => {
      this.rafHandle = window.requestAnimationFrame(loop);
      this.render();
    };
    this.rafHandle = window.requestAnimationFrame(loop);
  }

  private cancelRender(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (this.rafHandle !== null) {
      window.cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  private updateCanvasSize(): void {
    if (!this.context || typeof window === "undefined") {
      return;
    }
    this.ensureAttached();
    const transform = this.options.resolveTransform?.();
    const rect = transform?.boundingRect?.();
    const width = rect?.width ?? window.innerWidth;
    const height = rect?.height ?? window.innerHeight;
    const left = rect?.left ?? 0;
    const top = rect?.top ?? 0;
    const ratio = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (
      this.canvas.width !== pixelWidth ||
      this.canvas.height !== pixelHeight
    ) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }
    if (this.canvas.style.width !== `${width}px`) {
      this.canvas.style.width = `${width}px`;
    }
    if (this.canvas.style.height !== `${height}px`) {
      this.canvas.style.height = `${height}px`;
    }
    const host = this.hostElement;
    let relativeLeft = left;
    let relativeTop = top;
    if (host && host !== document.body) {
      const hostRect = host.getBoundingClientRect();
      relativeLeft = left - hostRect.left;
      relativeTop = top - hostRect.top;
      if (this.canvas.style.position !== "absolute") {
        this.canvas.style.position = "absolute";
      }
      this.ensureContainerPositioned(host);
    } else {
      if (this.canvas.style.position !== "fixed") {
        this.canvas.style.position = "fixed";
      }
    }
    if (this.canvas.style.left !== `${relativeLeft}px`) {
      this.canvas.style.left = `${relativeLeft}px`;
    }
    if (this.canvas.style.top !== `${relativeTop}px`) {
      this.canvas.style.top = `${relativeTop}px`;
    }
    this.context.setTransform(ratio, 0, 0, ratio, -left * ratio, -top * ratio);
    this.cssWidth = width;
    this.cssHeight = height;
    this.pixelRatio = ratio;
    this.offsetLeft = left;
    this.offsetTop = top;
  }

  private clearCanvas(): void {
    if (!this.context) {
      return;
    }
    this.updateCanvasSize();
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();
    this.maskSidebarRegion();
  }

  private resolveHostElement(): HTMLElement | null {
    if (typeof document === "undefined") {
      return null;
    }
    const transform = this.options.resolveTransform?.();
    const candidateCanvas = (
      transform as unknown as { canvas?: HTMLCanvasElement | null } | undefined
    )?.canvas;
    if (candidateCanvas instanceof HTMLCanvasElement) {
      return candidateCanvas.parentElement ?? candidateCanvas;
    }
    const fallbackCanvas = document.querySelector("canvas");
    if (fallbackCanvas instanceof HTMLCanvasElement) {
      return fallbackCanvas.parentElement ?? fallbackCanvas;
    }
    return document.body;
  }

  private ensureAttached(): void {
    if (typeof document === "undefined") {
      return;
    }
    let container = this.resolveHostElement();
    if (!container) {
      return;
    }
    if (container instanceof HTMLCanvasElement) {
      container = container.parentElement ?? document.body;
    }
    if (!(container instanceof HTMLElement)) {
      return;
    }
    if (this.canvas.parentElement !== container) {
      this.canvas.remove();
      container.appendChild(this.canvas);
    }
    this.hostElement = container;
    this.attached = true;
  }

  private ensureContainerPositioned(container: HTMLElement): void {
    if (typeof window === "undefined") {
      return;
    }
    if (container === document.body) {
      return;
    }
    const position = window.getComputedStyle(container).position;
    if (position === "static") {
      container.style.position = "relative";
    }
  }

  private render(): void {
    const ctx = this.context;
    if (!ctx) {
      return;
    }

    this.updateCanvasSize();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
    this.maskSidebarRegion();

    if (!this.active) {
      return;
    }

    const transform = this.options.resolveTransform();
    const uiState = this.options.resolveUiState();
    if (!transform || !uiState || !this.isNukeSelected(uiState)) {
      return;
    }
    if (this.siloPositions.length === 0) {
      return;
    }

    const rect = transform.boundingRect?.();

    let pointer = this.pointer;
    if (pointer && rect && !this.isPointerInside(rect, pointer)) {
      pointer = null;
    }

    if (pointer && this.isPointerOverSidebar(pointer)) {
      pointer = null;
    }

    pointer = pointer ?? this.lastValidPointer;

    if (!pointer) {
      return;
    }

    if (rect && !this.isPointerInside(rect, pointer)) {
      return;
    }

    this.lastValidPointer = pointer;

    const worldCell = transform.screenToWorldCoordinates(pointer.x, pointer.y);
    if (!this.isFinitePoint(worldCell)) {
      return;
    }

    const targetCell = { x: worldCell.x, y: worldCell.y };
    const targetWorld = {
      x: targetCell.x + 0.5,
      y: targetCell.y + 0.5,
    } satisfies Point;
    const targetScreen = transform.worldToScreenCoordinates(targetWorld);
    if (!this.isFinitePoint(targetScreen)) {
      return;
    }

    if (this.siloPositions.length === 0) {
      return;
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;

    const activeIndex = this.resolveActiveSiloIndex(targetCell);
    const mirvSelected = this.isMirvSelected(uiState);

    let referenceStart: Point | null = null;
    let activeStart: Point | null = null;

    for (let index = 0; index < this.siloPositions.length; index++) {
      const silo = this.siloPositions[index];
      const startWorld = this.toCellCenter(silo);
      const distance = this.distanceBetween(startWorld, targetWorld);
      if (!Number.isFinite(distance) || distance === 0) {
        continue;
      }

      const startScreen = transform.worldToScreenCoordinates(startWorld);
      if (!this.isFinitePoint(startScreen)) {
        continue;
      }

      const color = this.normalizeColor(silo.color);
      ctx.save();
      ctx.globalAlpha = index === activeIndex ? 1 : 0.2;
      ctx.strokeStyle = color;

      if (mirvSelected) {
        this.drawMirvTrajectory(
          ctx,
          transform,
          startWorld,
          targetWorld,
          color,
          index === activeIndex,
        );
      } else {
        const controls = this.computeControlPoints(startWorld, targetWorld);
        const control1Screen = transform.worldToScreenCoordinates(
          controls.control1,
        );
        const control2Screen = transform.worldToScreenCoordinates(
          controls.control2,
        );
        if (
          this.isFinitePoint(control1Screen) &&
          this.isFinitePoint(control2Screen)
        ) {
          ctx.beginPath();
          ctx.moveTo(startScreen.x, startScreen.y);
          ctx.bezierCurveTo(
            control1Screen.x,
            control1Screen.y,
            control2Screen.x,
            control2Screen.y,
            targetScreen.x,
            targetScreen.y,
          );
          ctx.stroke();
        }
      }

      ctx.restore();

      referenceStart = referenceStart ?? startWorld;
      if (index === activeIndex) {
        activeStart = startWorld;
      }
    }

    const siloRadius = Math.max(2, 4 - transform.scale * 0.15);
    for (let index = 0; index < this.siloPositions.length; index++) {
      const silo = this.siloPositions[index];
      const color = this.normalizeColor(silo.color);
      const screen = transform.worldToScreenCoordinates(
        this.toCellCenter(silo),
      );
      if (!this.isFinitePoint(screen)) {
        continue;
      }
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, siloRadius, 0, Math.PI * 2);
      ctx.save();
      ctx.globalAlpha = index === activeIndex ? 0.85 : 0.3;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }

    const activeColor =
      (activeIndex !== null
        ? this.normalizeColor(this.siloPositions[activeIndex]?.color)
        : this.normalizeColor()) ?? "rgba(2, 132, 199, 0.95)";
    if (mirvSelected) {
      this.drawMirvTargetIndicators(
        ctx,
        transform,
        targetWorld,
        activeColor,
        transform.scale,
        activeStart ?? referenceStart ?? null,
      );
    } else {
      const targetRadius = Math.max(3.5, 5 - transform.scale * 0.2);
      ctx.beginPath();
      ctx.arc(targetScreen.x, targetScreen.y, targetRadius, 0, Math.PI * 2);
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = activeColor;
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = activeColor;
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    this.maskSidebarRegion();
  }

  private isFinitePoint(
    point: { x: number; y: number } | null | undefined,
  ): point is Point {
    return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
  }

  private isPointerInside(rect: DOMRect, pointer: Point): boolean {
    return (
      pointer.x >= rect.left &&
      pointer.x <= rect.right &&
      pointer.y >= rect.top &&
      pointer.y <= rect.bottom
    );
  }

  private isPointerOverSidebar(pointer: Point): boolean {
    if (typeof document === "undefined") {
      return false;
    }
    const sidebar = document.getElementById("openfront-strategic-sidebar");
    if (!sidebar) {
      return false;
    }
    const rect = sidebar.getBoundingClientRect();
    return this.isPointerInside(rect, pointer);
  }

  private maskSidebarRegion(): void {
    if (!this.context || typeof document === "undefined") {
      return;
    }
    const sidebar = document.getElementById("openfront-strategic-sidebar");
    if (!sidebar) {
      return;
    }
    const rect = sidebar.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const ratio = this.pixelRatio || 1;
    const offsetLeft = this.offsetLeft || 0;
    const offsetTop = this.offsetTop || 0;
    const x = (rect.left - offsetLeft) * ratio;
    const y = (rect.top - offsetTop) * ratio;
    const width = rect.width * ratio;
    const height = rect.height * ratio;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }

    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(x, y, width, height);
    this.context.restore();
  }

  private isNukeSelected(uiState: UiStateLike): boolean {
    const selection = this.normalizeSelection(uiState.ghostStructure);
    if (!selection) {
      return false;
    }
    return (
      selection === "atom bomb" ||
      selection === "hydrogen bomb" ||
      selection === "mirv"
    );
  }

  private isMirvSelected(uiState: UiStateLike): boolean {
    const selection = this.normalizeSelection(uiState.ghostStructure);
    return selection === "mirv";
  }

  private toCellCenter(point: { x: number; y: number }): Point {
    return { x: point.x + 0.5, y: point.y + 0.5 } satisfies Point;
  }

  private normalizeSelection(value: string | null | undefined): string | null {
    if (typeof value !== "string") {
      return null;
    }
    const normalized = value.replace(/\s+/g, " ").trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  private drawMirvTrajectory(
    ctx: CanvasRenderingContext2D,
    transform: TransformHandlerLike,
    startWorld: Point,
    targetWorld: Point,
    color: string,
    emphasize: boolean,
  ): void {
    const startScreen = transform.worldToScreenCoordinates(startWorld);
    if (!this.isFinitePoint(startScreen)) {
      return;
    }

    const splitWorld = computeMirvSplitPoint(startWorld, targetWorld);
    const splitScreen = transform.worldToScreenCoordinates(splitWorld);
    if (!this.isFinitePoint(splitScreen)) {
      return;
    }

    const splitControls = this.computeControlPoints(startWorld, splitWorld);
    const splitControl1 = transform.worldToScreenCoordinates(
      splitControls.control1,
    );
    const splitControl2 = transform.worldToScreenCoordinates(
      splitControls.control2,
    );
    if (
      !this.isFinitePoint(splitControl1) ||
      !this.isFinitePoint(splitControl2)
    ) {
      return;
    }

    const baseAlpha = emphasize ? 1 : 0.25;

    ctx.save();
    ctx.lineWidth = 2;
    ctx.globalAlpha = baseAlpha * 0.9;
    ctx.beginPath();
    ctx.moveTo(startScreen.x, startScreen.y);
    ctx.bezierCurveTo(
      splitControl1.x,
      splitControl1.y,
      splitControl2.x,
      splitControl2.y,
      splitScreen.x,
      splitScreen.y,
    );
    ctx.stroke();

    const warheadControls = this.computeControlPoints(
      splitWorld,
      targetWorld,
      false,
    );
    const warheadControl1 = transform.worldToScreenCoordinates(
      warheadControls.control1,
    );
    const warheadControl2 = transform.worldToScreenCoordinates(
      warheadControls.control2,
    );
    const targetScreen = transform.worldToScreenCoordinates(targetWorld);
    if (
      this.isFinitePoint(warheadControl1) &&
      this.isFinitePoint(warheadControl2) &&
      this.isFinitePoint(targetScreen)
    ) {
      ctx.save();
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = baseAlpha * 0.75;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(splitScreen.x, splitScreen.y);
      ctx.bezierCurveTo(
        warheadControl1.x,
        warheadControl1.y,
        warheadControl2.x,
        warheadControl2.y,
        targetScreen.x,
        targetScreen.y,
      );
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  private drawMirvTargetIndicators(
    ctx: CanvasRenderingContext2D,
    transform: TransformHandlerLike,
    targetWorld: Point,
    activeColor: string,
    scale: number,
    referenceStart: Point | null,
  ): void {
    const targetScreen = transform.worldToScreenCoordinates(targetWorld);
    if (!this.isFinitePoint(targetScreen)) {
      return;
    }

    const primaryRadius = Math.max(3.5, 5 - scale * 0.2);
    ctx.beginPath();
    ctx.arc(targetScreen.x, targetScreen.y, primaryRadius, 0, Math.PI * 2);
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = activeColor;
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = activeColor;
    ctx.stroke();
    ctx.restore();

    if (referenceStart) {
      const splitWorld = computeMirvSplitPoint(referenceStart, targetWorld);
      const splitScreen = transform.worldToScreenCoordinates(splitWorld);
      if (this.isFinitePoint(splitScreen)) {
        const splitRadius = Math.max(2.2, 4 - scale * 0.18);
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = activeColor;
        ctx.beginPath();
        ctx.arc(splitScreen.x, splitScreen.y, splitRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  private computeControlPoints(
    start: Point,
    end: Point,
    distanceBasedHeight = true,
  ): { control1: Point; control2: Point } {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxHeight = distanceBasedHeight ? Math.max(distance / 3, 50) : 0;
    const control1: Point = {
      x: start.x + dx / 4,
      y: Math.max(start.y + dy / 4 - maxHeight, 0),
    } satisfies Point;
    const control2: Point = {
      x: start.x + (dx * 3) / 4,
      y: Math.max(start.y + (dy * 3) / 4 - maxHeight, 0),
    } satisfies Point;
    return { control1, control2 };
  }

  private resolveActiveSiloIndex(target: Point): number | null {
    if (this.siloPositions.length === 0) {
      return null;
    }

    const candidates: Array<{
      index: number;
      distance: number;
      ready: boolean;
    }> = [];
    for (let index = 0; index < this.siloPositions.length; index++) {
      const silo = this.siloPositions[index];
      const distance = this.manhattanDistance(silo, target);
      if (!Number.isFinite(distance)) {
        continue;
      }
      candidates.push({ index, distance, ready: silo.ready });
    }

    if (candidates.length === 0) {
      return null;
    }

    const ready = candidates.filter((candidate) => candidate.ready);
    const pool = ready.length > 0 ? ready : candidates;

    let best: { index: number; distance: number } | null = null;
    for (const candidate of pool) {
      if (best === null || candidate.distance < best.distance) {
        best = candidate;
      }
    }

    return best?.index ?? null;
  }

  private manhattanDistance(
    a: { x: number; y: number },
    b: { x: number; y: number },
  ): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private distanceBetween(a: Point, b: Point): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private normalizeColor(color?: string): string {
    if (color && color.trim()) {
      return color.trim();
    }
    return "rgb(56, 189, 248)";
  }
}

interface HistoricalMissileOverlayOptions {
  resolveTransform: () => TransformHandlerLike | null;
}

export class HistoricalMissileTrajectoryOverlay {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D | null;
  private rafHandle: number | null = null;
  private trajectories: MissileFlightSummary[] = [];
  private attached = false;
  private active = false;
  private hostElement: HTMLElement | null = null;
  private cssWidth = 0;
  private cssHeight = 0;
  private pixelRatio = 1;
  private offsetLeft = 0;
  private offsetTop = 0;

  constructor(private readonly options: HistoricalMissileOverlayOptions) {
    if (typeof document === "undefined") {
      throw new Error(
        "HistoricalMissileTrajectoryOverlay requires a browser environment",
      );
    }

    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "fixed";
    this.canvas.style.left = "0";
    this.canvas.style.top = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "29";
    this.canvas.style.display = "none";
    this.context = this.canvas.getContext("2d");
  }

  setTrajectories(trajectories: readonly MissileFlightSummary[]): void {
    this.trajectories = trajectories.map((entry) => ({ ...entry }));
  }

  enable(): void {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }
    if (this.active) {
      return;
    }
    this.active = true;
    this.ensureAttached();
    this.canvas.style.display = "block";
    this.updateCanvasSize();
    this.render();
    this.scheduleRender();
  }

  disable(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.canvas.style.display = "none";
    this.cancelRender();
    this.clearCanvas();
  }

  dispose(): void {
    this.disable();
    if (this.attached) {
      this.canvas.remove();
      this.attached = false;
      this.hostElement = null;
    }
  }

  private scheduleRender(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (this.rafHandle !== null) {
      return;
    }
    const loop = () => {
      this.rafHandle = window.requestAnimationFrame(loop);
      this.render();
    };
    this.rafHandle = window.requestAnimationFrame(loop);
  }

  private cancelRender(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (this.rafHandle !== null) {
      window.cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  private updateCanvasSize(): void {
    if (!this.context || typeof window === "undefined") {
      return;
    }
    this.ensureAttached();
    const transform = this.options.resolveTransform?.();
    const rect = transform?.boundingRect?.();
    const width = rect?.width ?? window.innerWidth;
    const height = rect?.height ?? window.innerHeight;
    const left = rect?.left ?? 0;
    const top = rect?.top ?? 0;
    const ratio = window.devicePixelRatio || 1;
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (
      this.canvas.width !== pixelWidth ||
      this.canvas.height !== pixelHeight
    ) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }
    if (this.canvas.style.width !== `${width}px`) {
      this.canvas.style.width = `${width}px`;
    }
    if (this.canvas.style.height !== `${height}px`) {
      this.canvas.style.height = `${height}px`;
    }
    const host = this.hostElement;
    let relativeLeft = left;
    let relativeTop = top;
    if (host && host !== document.body) {
      const hostRect = host.getBoundingClientRect();
      relativeLeft = left - hostRect.left;
      relativeTop = top - hostRect.top;
      if (this.canvas.style.position !== "absolute") {
        this.canvas.style.position = "absolute";
      }
      this.ensureContainerPositioned(host);
    } else {
      if (this.canvas.style.position !== "fixed") {
        this.canvas.style.position = "fixed";
      }
    }
    if (this.canvas.style.left !== `${relativeLeft}px`) {
      this.canvas.style.left = `${relativeLeft}px`;
    }
    if (this.canvas.style.top !== `${relativeTop}px`) {
      this.canvas.style.top = `${relativeTop}px`;
    }
    this.context.setTransform(ratio, 0, 0, ratio, -left * ratio, -top * ratio);
    this.cssWidth = width;
    this.cssHeight = height;
    this.pixelRatio = ratio;
    this.offsetLeft = left;
    this.offsetTop = top;
  }

  private clearCanvas(): void {
    if (!this.context) {
      return;
    }
    this.updateCanvasSize();
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();
    this.maskSidebarRegion();
  }

  private resolveHostElement(): HTMLElement | null {
    if (typeof document === "undefined") {
      return null;
    }
    const transform = this.options.resolveTransform?.();
    const candidateCanvas = (
      transform as unknown as { canvas?: HTMLCanvasElement | null } | undefined
    )?.canvas;
    if (candidateCanvas instanceof HTMLCanvasElement) {
      return candidateCanvas.parentElement ?? candidateCanvas;
    }
    const fallbackCanvas = document.querySelector("canvas");
    if (fallbackCanvas instanceof HTMLCanvasElement) {
      return fallbackCanvas.parentElement ?? fallbackCanvas;
    }
    return document.body;
  }

  private ensureAttached(): void {
    if (typeof document === "undefined") {
      return;
    }
    let container = this.resolveHostElement();
    if (!container) {
      return;
    }
    if (container instanceof HTMLCanvasElement) {
      container = container.parentElement ?? document.body;
    }
    if (!(container instanceof HTMLElement)) {
      return;
    }
    if (this.canvas.parentElement !== container) {
      this.canvas.remove();
      container.appendChild(this.canvas);
    }
    this.hostElement = container;
    this.attached = true;
  }

  private ensureContainerPositioned(container: HTMLElement): void {
    if (typeof window === "undefined") {
      return;
    }
    if (container === document.body) {
      return;
    }
    const position = window.getComputedStyle(container).position;
    if (position === "static") {
      container.style.position = "relative";
    }
  }

  private render(): void {
    const ctx = this.context;
    if (!ctx) {
      return;
    }

    this.updateCanvasSize();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
    this.maskSidebarRegion();

    if (!this.active) {
      return;
    }

    const transform = this.options.resolveTransform();
    if (!transform) {
      return;
    }

    if (this.trajectories.length === 0) {
      return;
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;

    for (const trajectory of this.trajectories) {
      const variant = this.resolveTrajectoryVariant(trajectory);
      const isMirvWarhead = variant === "mirv-warhead";
      const isMirv = variant === "mirv";
      const origin = this.toCellCenter(trajectory.origin);
      const target = this.toCellCenter(trajectory.target);
      const startScreen = transform.worldToScreenCoordinates(origin);
      const targetScreen = transform.worldToScreenCoordinates(target);
      if (
        !this.isFinitePoint(startScreen) ||
        !this.isFinitePoint(targetScreen)
      ) {
        continue;
      }

      const color = this.normalizeColor(trajectory.color);
      const strokeAlpha = isMirvWarhead ? 0.65 : isMirv ? 0.75 : 0.8;
      const lineWidth = isMirvWarhead ? 1.5 : 2;
      let markerWorld: Point | null = target;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.globalAlpha = strokeAlpha;
      ctx.lineWidth = lineWidth;

      if (isMirv) {
        const splitWorld = trajectory.split
          ? this.toCellCenter(trajectory.split)
          : computeMirvSplitPoint(origin, target);
        const splitScreen = transform.worldToScreenCoordinates(splitWorld);
        const splitControls = this.computeControlPoints(origin, splitWorld);
        const splitControl1 = transform.worldToScreenCoordinates(
          splitControls.control1,
        );
        const splitControl2 = transform.worldToScreenCoordinates(
          splitControls.control2,
        );
        if (
          this.isFinitePoint(splitScreen) &&
          this.isFinitePoint(splitControl1) &&
          this.isFinitePoint(splitControl2)
        ) {
          ctx.beginPath();
          ctx.moveTo(startScreen.x, startScreen.y);
          ctx.bezierCurveTo(
            splitControl1.x,
            splitControl1.y,
            splitControl2.x,
            splitControl2.y,
            splitScreen.x,
            splitScreen.y,
          );
          ctx.stroke();
          markerWorld = splitWorld;
        }
      } else {
        const controls = this.computeControlPoints(
          origin,
          target,
          !isMirvWarhead,
        );
        const control1 = transform.worldToScreenCoordinates(controls.control1);
        const control2 = transform.worldToScreenCoordinates(controls.control2);
        const targetScreen = transform.worldToScreenCoordinates(target);
        if (
          this.isFinitePoint(control1) &&
          this.isFinitePoint(control2) &&
          this.isFinitePoint(targetScreen)
        ) {
          if (isMirvWarhead) {
            ctx.setLineDash([4, 3]);
          }
          ctx.beginPath();
          ctx.moveTo(startScreen.x, startScreen.y);
          ctx.bezierCurveTo(
            control1.x,
            control1.y,
            control2.x,
            control2.y,
            targetScreen.x,
            targetScreen.y,
          );
          ctx.stroke();
        }
      }

      ctx.restore();

      const originScreen = startScreen;
      const originRadius = Math.max(
        isMirvWarhead ? 1.8 : 2,
        (isMirvWarhead ? 3.5 : 4) - transform.scale * 0.15,
      );
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha = isMirvWarhead ? 0.35 : 0.4;
      ctx.beginPath();
      ctx.arc(originScreen.x, originScreen.y, originRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (markerWorld) {
        const markerScreen = transform.worldToScreenCoordinates(markerWorld);
        if (this.isFinitePoint(markerScreen)) {
          const targetRadius = Math.max(
            isMirvWarhead ? 2.8 : isMirv ? 3 : 3.5,
            (isMirvWarhead ? 4.5 : 5) - transform.scale * 0.2,
          );
          ctx.save();
          ctx.fillStyle = color;
          ctx.globalAlpha = isMirvWarhead ? 0.75 : isMirv ? 0.8 : 0.85;
          ctx.beginPath();
          ctx.arc(markerScreen.x, markerScreen.y, targetRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (trajectory.current) {
        const currentScreen = transform.worldToScreenCoordinates(
          this.toCellCenter(trajectory.current),
        );
        if (this.isFinitePoint(currentScreen)) {
          const currentRadius = Math.max(
            isMirvWarhead ? 2 : 2.5,
            (isMirvWarhead ? 3.8 : 4.5) - transform.scale * 0.18,
          );
          ctx.save();
          ctx.fillStyle = color;
          ctx.globalAlpha = isMirvWarhead ? 0.95 : 1;
          ctx.beginPath();
          ctx.arc(
            currentScreen.x,
            currentScreen.y,
            currentRadius,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.restore();
        }
      }
    }

    ctx.restore();

    this.maskSidebarRegion();
  }

  private maskSidebarRegion(): void {
    if (!this.context || typeof document === "undefined") {
      return;
    }
    const sidebar = document.getElementById("openfront-strategic-sidebar");
    if (!sidebar) {
      return;
    }
    const rect = sidebar.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const ratio = this.pixelRatio || 1;
    const offsetLeft = this.offsetLeft || 0;
    const offsetTop = this.offsetTop || 0;
    const x = (rect.left - offsetLeft) * ratio;
    const y = (rect.top - offsetTop) * ratio;
    const width = rect.width * ratio;
    const height = rect.height * ratio;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }

    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(x, y, width, height);
    this.context.restore();
  }

  private isFinitePoint(
    point: { x: number; y: number } | null | undefined,
  ): point is Point {
    return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
  }

  private toCellCenter(point: { x: number; y: number }): Point {
    return { x: point.x + 0.5, y: point.y + 0.5 } satisfies Point;
  }

  private computeControlPoints(
    start: Point,
    end: Point,
    distanceBasedHeight = true,
  ): { control1: Point; control2: Point } {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxHeight = distanceBasedHeight ? Math.max(distance / 3, 50) : 0;
    const control1: Point = {
      x: start.x + dx / 4,
      y: Math.max(start.y + dy / 4 - maxHeight, 0),
    } satisfies Point;
    const control2: Point = {
      x: start.x + (dx * 3) / 4,
      y: Math.max(start.y + (dy * 3) / 4 - maxHeight, 0),
    } satisfies Point;
    return { control1, control2 };
  }

  private resolveTrajectoryVariant(
    trajectory: MissileFlightSummary,
  ): "mirv" | "mirv-warhead" | "standard" {
    const normalized = trajectory.unitType
      ?.toString()
      .replace(/\s+/g, "")
      .toLowerCase();
    if (normalized === "mirvwarhead") {
      return "mirv-warhead";
    }
    if (normalized === "mirv") {
      return "mirv";
    }
    return "standard";
  }

  private normalizeColor(color?: string): string {
    if (color && color.trim()) {
      return color.trim();
    }
    return "rgb(56, 189, 248)";
  }
}

const SVG_NS = "http://www.w3.org/2000/svg";

export interface TroopDonationOverlayPlayerSnapshot {
  id: string;
  name: string;
  x?: number | null;
  y?: number | null;
  color?: string;
  alive: boolean;
}

interface DonationOverlayOptions {
  resolveTransform: () => TransformHandlerLike | null;
  now?: () => number;
  labelIcon?: LucideIconNode;
}

interface DonationEntry {
  id: string;
  senderId: string;
  recipientId: string;
  label: HTMLDivElement;
  line: SVGLineElement;
  marker: SVGMarkerElement;
  createdAt: number;
  lifespanMs: number;
  fadeMs: number;
  baseColor?: string;
  strokeColor: string;
  fallbackColor?: string;
}

interface DonationRegistrationOptions {
  fallbackColor?: string;
}

class DonationOverlay<TDonation extends SidebarDonationEvent> {
  private readonly container: HTMLDivElement;
  private readonly svg: SVGSVGElement;
  private readonly defs: SVGDefsElement;
  private readonly labelLayer: HTMLDivElement;
  private readonly entries = new Map<string, DonationEntry>();
  private readonly playerSnapshots = new Map<
    string,
    TroopDonationOverlayPlayerSnapshot
  >();
  private readonly colorContext: CanvasRenderingContext2D | null;
  private readonly labelIcon?: LucideIconNode;
  private rafHandle: number | null = null;
  private attached = false;
  private active = false;
  private hostElement: HTMLElement | null = null;
  private offsetLeft = 0;
  private offsetTop = 0;
  private cssWidth = 0;
  private cssHeight = 0;
  private nextEntryId = 0;

  constructor(protected readonly options: DonationOverlayOptions) {
    if (typeof document === "undefined") {
      throw new Error("DonationOverlay requires a browser environment");
    }

    this.container = document.createElement("div");
    this.container.style.position = "fixed";
    this.container.style.left = "0";
    this.container.style.top = "0";
    this.container.style.width = "100%";
    this.container.style.height = "100%";
    this.container.style.pointerEvents = "none";
    this.container.style.zIndex = "31";
    this.container.style.display = "none";
    this.container.style.fontFamily =
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    this.svg = document.createElementNS(SVG_NS, "svg");
    this.svg.setAttribute("xmlns", SVG_NS);
    this.svg.setAttribute("fill", "none");
    this.svg.style.position = "absolute";
    this.svg.style.left = "0";
    this.svg.style.top = "0";
    this.svg.style.width = "100%";
    this.svg.style.height = "100%";
    this.svg.style.pointerEvents = "none";

    this.defs = document.createElementNS(SVG_NS, "defs");
    this.svg.appendChild(this.defs);

    this.labelLayer = document.createElement("div");
    this.labelLayer.style.position = "absolute";
    this.labelLayer.style.left = "0";
    this.labelLayer.style.top = "0";
    this.labelLayer.style.width = "100%";
    this.labelLayer.style.height = "100%";
    this.labelLayer.style.pointerEvents = "none";

    this.container.appendChild(this.svg);
    this.container.appendChild(this.labelLayer);

    const colorCanvas = document.createElement("canvas");
    this.colorContext = colorCanvas.getContext("2d");
    this.labelIcon = options.labelIcon;
  }

  enable(): void {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }
    if (this.active) {
      return;
    }
    this.active = true;
    this.ensureAttached();
    this.container.style.display = "block";
    this.updateContainerFrame();
    this.render();
    this.scheduleRender();
  }

  disable(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.container.style.display = "none";
    this.cancelRender();
    this.clearEntries();
  }

  dispose(): void {
    this.disable();
    if (this.attached) {
      this.container.remove();
      this.attached = false;
      this.hostElement = null;
    }
  }

  isActive(): boolean {
    return this.active;
  }

  registerDonation(
    donation: TDonation,
    options?: DonationRegistrationOptions,
  ): void {
    if (!this.active) {
      return;
    }
    const now = this.now();
    const id = `donation-${this.nextEntryId}`;
    this.nextEntryId += 1;

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("stroke-width", "2.5");
    line.setAttribute("stroke-linecap", "round");
    line.style.opacity = "0";
    this.svg.appendChild(line);

    const marker = this.createArrowMarker("rgba(59, 130, 246, 0.9)");
    line.setAttribute("marker-end", `url(#${marker.id})`);

    const label = document.createElement("div");
    label.style.position = "absolute";
    label.style.padding = "4px 8px";
    label.style.borderRadius = "6px";
    label.style.fontSize = "0.7rem";
    label.style.fontWeight = "600";
    label.style.letterSpacing = "0.02em";
    label.style.color = "#e2e8f0";
    label.style.background = "rgba(15, 23, 42, 0.85)";
    label.style.boxShadow = "0 4px 12px rgba(2, 6, 23, 0.35)";
    label.style.whiteSpace = "nowrap";
    label.style.transform = "translate(-50%, -50%)";
    label.style.opacity = "0";
    label.style.display = "inline-flex";
    label.style.alignItems = "center";
    label.style.gap = "6px";

    const text = document.createElement("span");
    text.textContent = `${donation.amountDisplay} • ${donation.senderName} → ${donation.recipientName}`;

    const icon = this.createLabelIcon();
    if (icon) {
      label.appendChild(icon);
    }
    label.appendChild(text);
    this.labelLayer.appendChild(label);

    const entry: DonationEntry = {
      id,
      senderId: donation.senderId,
      recipientId: donation.recipientId,
      label,
      line,
      marker,
      createdAt: now,
      lifespanMs: 8000,
      fadeMs: 1600,
      strokeColor: "rgba(59, 130, 246, 0.9)",
      fallbackColor: options?.fallbackColor,
    };

    this.entries.set(id, entry);
  }

  private createLabelIcon(): SVGSVGElement | null {
    if (!this.labelIcon) {
      return null;
    }

    const svg = createElement(this.labelIcon) as SVGSVGElement;
    svg.setAttribute("aria-hidden", "true");
    svg.style.width = "14px";
    svg.style.height = "14px";
    svg.style.flexShrink = "0";
    svg.style.color = "inherit";
    return svg;
  }

  setPlayerSnapshots(
    snapshots: readonly TroopDonationOverlayPlayerSnapshot[],
  ): void {
    this.playerSnapshots.clear();
    for (const snapshot of snapshots) {
      this.playerSnapshots.set(snapshot.id, snapshot);
    }
  }

  clear(): void {
    this.playerSnapshots.clear();
    this.clearEntries();
  }

  private createArrowMarker(color: string): SVGMarkerElement {
    const marker = document.createElementNS(SVG_NS, "marker");
    marker.id = `donation-arrow-${this.nextEntryId}-${Math.floor(
      Math.random() * 1_000_000,
    )}`;
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.setAttribute("fill", color);
    marker.appendChild(path);
    this.defs.appendChild(marker);
    return marker;
  }

  private now(): number {
    if (typeof performance !== "undefined" && performance.now) {
      return this.options.now?.() ?? performance.now();
    }
    return this.options.now?.() ?? Date.now();
  }

  private scheduleRender(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (this.rafHandle !== null) {
      return;
    }
    const loop = () => {
      this.rafHandle = window.requestAnimationFrame(loop);
      this.render();
    };
    this.rafHandle = window.requestAnimationFrame(loop);
  }

  private cancelRender(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (this.rafHandle !== null) {
      window.cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  private updateContainerFrame(): void {
    if (typeof window === "undefined") {
      return;
    }
    this.ensureAttached();
    const transform = this.options.resolveTransform?.();
    const rect = transform?.boundingRect?.();
    const width = rect?.width ?? window.innerWidth;
    const height = rect?.height ?? window.innerHeight;
    const left = rect?.left ?? 0;
    const top = rect?.top ?? 0;

    if (this.cssWidth !== width) {
      this.container.style.width = `${width}px`;
      this.cssWidth = width;
    }
    if (this.cssHeight !== height) {
      this.container.style.height = `${height}px`;
      this.cssHeight = height;
    }

    let relativeLeft = left;
    let relativeTop = top;
    const host = this.hostElement;
    if (host && host !== document.body) {
      const hostRect = host.getBoundingClientRect();
      relativeLeft = left - hostRect.left;
      relativeTop = top - hostRect.top;
      if (this.container.style.position !== "absolute") {
        this.container.style.position = "absolute";
      }
      this.ensureContainerPositioned(host);
    } else if (this.container.style.position !== "fixed") {
      this.container.style.position = "fixed";
    }

    if (this.container.style.left !== `${relativeLeft}px`) {
      this.container.style.left = `${relativeLeft}px`;
    }
    if (this.container.style.top !== `${relativeTop}px`) {
      this.container.style.top = `${relativeTop}px`;
    }

    this.offsetLeft = left;
    this.offsetTop = top;

    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  private ensureAttached(): void {
    if (typeof document === "undefined") {
      return;
    }
    let container = this.resolveHostElement();
    if (!container) {
      return;
    }
    if (container instanceof HTMLCanvasElement) {
      container = container.parentElement ?? document.body;
    }
    if (!(container instanceof HTMLElement)) {
      return;
    }
    if (this.container.parentElement !== container) {
      this.container.remove();
      container.appendChild(this.container);
    }
    this.hostElement = container;
    this.attached = true;
  }

  private resolveHostElement(): HTMLElement | null {
    if (typeof document === "undefined") {
      return null;
    }
    const transform = this.options.resolveTransform?.();
    const candidateCanvas = (
      transform as unknown as { canvas?: HTMLCanvasElement | null } | undefined
    )?.canvas;
    if (candidateCanvas instanceof HTMLCanvasElement) {
      return candidateCanvas.parentElement ?? candidateCanvas;
    }
    const fallbackCanvas = document.querySelector("canvas");
    if (fallbackCanvas instanceof HTMLCanvasElement) {
      return fallbackCanvas.parentElement ?? fallbackCanvas;
    }
    return document.body;
  }

  private ensureContainerPositioned(container: HTMLElement): void {
    if (typeof window === "undefined") {
      return;
    }
    if (container === document.body) {
      return;
    }
    const position = window.getComputedStyle(container).position;
    if (position === "static") {
      container.style.position = "relative";
    }
  }

  private render(): void {
    if (!this.active) {
      return;
    }
    const transform = this.options.resolveTransform?.();
    if (!transform) {
      this.hideAllEntries();
      return;
    }

    this.updateContainerFrame();
    const now = this.now();
    const removals: string[] = [];

    for (const [id, entry] of this.entries) {
      const sender = this.playerSnapshots.get(entry.senderId);
      const recipient = this.playerSnapshots.get(entry.recipientId);

      if (!sender || !recipient) {
        removals.push(id);
        continue;
      }

      if (!sender.alive || !recipient.alive) {
        removals.push(id);
        continue;
      }

      if (
        sender.x === undefined ||
        sender.x === null ||
        sender.y === undefined ||
        sender.y === null ||
        recipient.x === undefined ||
        recipient.x === null ||
        recipient.y === undefined ||
        recipient.y === null
      ) {
        this.hideEntry(entry);
        continue;
      }

      const start = transform.worldToScreenCoordinates({
        x: sender.x,
        y: sender.y,
      });
      const end = transform.worldToScreenCoordinates({
        x: recipient.x,
        y: recipient.y,
      });

      const localStartX = start.x - this.offsetLeft;
      const localStartY = start.y - this.offsetTop;
      const localEndX = end.x - this.offsetLeft;
      const localEndY = end.y - this.offsetTop;

      entry.line.setAttribute("x1", localStartX.toFixed(2));
      entry.line.setAttribute("y1", localStartY.toFixed(2));
      entry.line.setAttribute("x2", localEndX.toFixed(2));
      entry.line.setAttribute("y2", localEndY.toFixed(2));
      entry.line.style.display = "";

      const midpointX = (localStartX + localEndX) / 2;
      const midpointY = (localStartY + localEndY) / 2;
      entry.label.style.left = `${midpointX}px`;
      entry.label.style.top = `${midpointY}px`;
      entry.label.style.display = "inline-flex";

      const baseColor =
        sender.color ?? entry.baseColor ?? entry.fallbackColor ?? "#38bdf8";
      if (baseColor !== entry.baseColor) {
        entry.baseColor = baseColor;
        entry.strokeColor = this.darkenColor(baseColor);
        entry.line.setAttribute("stroke", entry.strokeColor);
        this.updateMarkerColor(entry.marker, entry.strokeColor);
      }

      const elapsed = now - entry.createdAt;
      if (elapsed >= entry.lifespanMs) {
        removals.push(id);
        continue;
      }
      const fadeStart = entry.lifespanMs - entry.fadeMs;
      let opacity = 1;
      if (elapsed > fadeStart) {
        opacity = Math.max(0, 1 - (elapsed - fadeStart) / entry.fadeMs);
      }
      entry.line.style.opacity = opacity.toFixed(3);
      entry.label.style.opacity = opacity.toFixed(3);
    }

    for (const id of removals) {
      this.removeEntry(id);
    }
  }

  private hideAllEntries(): void {
    for (const entry of this.entries.values()) {
      this.hideEntry(entry);
    }
  }

  private hideEntry(entry: DonationEntry): void {
    entry.line.style.display = "none";
    entry.label.style.display = "none";
  }

  private clearEntries(): void {
    for (const id of Array.from(this.entries.keys())) {
      this.removeEntry(id);
    }
  }

  private removeEntry(id: string): void {
    const entry = this.entries.get(id);
    if (!entry) {
      return;
    }
    entry.line.remove();
    entry.label.remove();
    entry.marker.remove();
    this.entries.delete(id);
  }

  private updateMarkerColor(marker: SVGMarkerElement, color: string): void {
    const path = marker.firstElementChild as SVGPathElement | null;
    if (path) {
      path.setAttribute("fill", color);
    }
  }

  private darkenColor(color: string): string {
    const parsed = this.parseColor(color);
    if (!parsed) {
      return "rgba(30, 64, 175, 0.9)";
    }
    const factor = 0.5;
    const r = Math.max(0, Math.min(255, Math.round(parsed.r * factor)));
    const g = Math.max(0, Math.min(255, Math.round(parsed.g * factor)));
    const b = Math.max(0, Math.min(255, Math.round(parsed.b * factor)));
    const alpha = Math.max(0, Math.min(1, parsed.a));
    return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
  }

  private parseColor(
    color: string,
  ): { r: number; g: number; b: number; a: number } | null {
    if (!color || typeof color !== "string") {
      return null;
    }
    if (!this.colorContext) {
      return null;
    }
    try {
      this.colorContext.fillStyle = "#000";
      this.colorContext.fillStyle = color;
      const computed = this.colorContext.fillStyle;
      if (typeof computed !== "string" || !computed) {
        return null;
      }
      if (computed.startsWith("#")) {
        const hex = computed.slice(1);
        if (hex.length === 6) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          return { r, g, b, a: 1 };
        }
      }
      const match = /rgba?\(([^)]+)\)/.exec(computed);
      if (!match) {
        return null;
      }
      const parts = match[1]
        .split(",")
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
      if (parts.length < 3) {
        return null;
      }
      const [rRaw, gRaw, bRaw, aRaw] = parts;
      const r = this.parseChannel(rRaw);
      const g = this.parseChannel(gRaw);
      const b = this.parseChannel(bRaw);
      const a = aRaw !== undefined ? Number(aRaw) : 1;
      if ([r, g, b].some((value) => Number.isNaN(value))) {
        return null;
      }
      return { r, g, b, a: Number.isFinite(a) ? a : 1 };
    } catch {
      return null;
    }
  }

  private parseChannel(value: string): number {
    if (value.endsWith("%")) {
      const percentage = Number(value.slice(0, -1));
      if (!Number.isFinite(percentage)) {
        return NaN;
      }
      return Math.max(0, Math.min(255, Math.round((percentage / 100) * 255)));
    }
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return Math.max(0, Math.min(255, Math.round(numeric)));
    }
    return NaN;
  }
}

export class TroopDonationOverlay extends DonationOverlay<SidebarTroopDonationEvent> {
  constructor(options: DonationOverlayOptions) {
    super({ ...options, labelIcon: options.labelIcon ?? Users });
  }
}

export class GoldDonationOverlay extends DonationOverlay<SidebarGoldDonationEvent> {
  constructor(options: DonationOverlayOptions) {
    super({ ...options, labelIcon: options.labelIcon ?? CirclePoundSterling });
  }
}
