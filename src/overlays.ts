import { CirclePoundSterling, Ship, Users, createElement } from "lucide";
import type {
  SidebarDonationEvent,
  SidebarGoldDonationEvent,
  SidebarTroopDonationEvent,
} from "./types";
import { SIDEBAR_ID } from "./constants";

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
  ownerTeam?: string;
  isLocalOwner?: boolean;
  isLocalTeam?: boolean;
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
  private visible = true;

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
    this.canvas.style.display = this.visible ? "block" : "none";
    this.updateCanvasSize();
    this.registerEventListeners();
    this.render();
    this.scheduleRender();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!this.active) {
      return;
    }
    this.canvas.style.display = this.visible ? "block" : "none";
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
    const sidebar = document.getElementById(SIDEBAR_ID);
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
    const sidebar = document.getElementById(SIDEBAR_ID);
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
  private visible = true;

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
    this.canvas.style.display = this.visible ? "block" : "none";
    this.updateCanvasSize();
    this.render();
    this.scheduleRender();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!this.active) {
      return;
    }
    this.canvas.style.display = this.visible ? "block" : "none";
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
    const sidebar = document.getElementById(SIDEBAR_ID);
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
    const normalized = this.normalizeUnitType(trajectory.unitType);
    if (normalized === "mirvwarhead") {
      return "mirv-warhead";
    }
    if (normalized === "mirv") {
      return "mirv";
    }
    return "standard";
  }

  private normalizeUnitType(unitType?: string): string | null {
    if (typeof unitType !== "string") {
      return null;
    }
    const normalized = unitType.replace(/\s+/g, "").toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  private normalizeColor(color?: string): string {
    if (color && color.trim()) {
      return color.trim();
    }
    return "rgb(56, 189, 248)";
  }
}

interface MissileImpactOverlayOptions {
  resolveTransform: () => TransformHandlerLike | null;
}

export class MissileImpactOverlay {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D | null;
  private rafHandle: number | null = null;
  private trajectories: MissileFlightSummary[] = [];
  private readonly teamColors = new Map<string, string>();
  private attached = false;
  private active = false;
  private hostElement: HTMLElement | null = null;
  private cssWidth = 0;
  private cssHeight = 0;
  private pixelRatio = 1;
  private offsetLeft = 0;
  private offsetTop = 0;
  private visible = true;

  constructor(private readonly options: MissileImpactOverlayOptions) {
    if (typeof document === "undefined") {
      throw new Error("MissileImpactOverlay requires a browser environment");
    }

    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "fixed";
    this.canvas.style.left = "0";
    this.canvas.style.top = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "28";
    this.canvas.style.display = "none";
    this.context = this.canvas.getContext("2d");
  }

  setTrajectories(trajectories: readonly MissileFlightSummary[]): void {
    this.trajectories = trajectories.map((entry) => ({ ...entry }));
    for (const trajectory of this.trajectories) {
      const teamKey = this.normalizeTeamKey(trajectory.ownerTeam);
      if (!teamKey || this.teamColors.has(teamKey)) {
        continue;
      }
      this.teamColors.set(teamKey, this.normalizeColor(trajectory.color));
    }
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
    this.canvas.style.display = this.visible ? "block" : "none";
    this.updateCanvasSize();
    this.render();
    this.scheduleRender();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!this.active) {
      return;
    }
    this.canvas.style.display = this.visible ? "block" : "none";
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

    if (!this.active || this.trajectories.length === 0) {
      return;
    }

    const transform = this.options.resolveTransform();
    if (!transform) {
      return;
    }

    const nowMs = performance.now();
    const renderedTargets = new Set<string>();
    for (const trajectory of this.trajectories) {
      if (trajectory.isLocalOwner || trajectory.isLocalTeam) {
        // OpenFront already shows local/team impact rings.
        continue;
      }

      const impact = this.resolveImpactRadii(trajectory.unitType);
      if (!impact) {
        continue;
      }

      const teamKey =
        this.normalizeTeamKey(trajectory.ownerTeam) ??
        (trajectory.ownerId ? `player:${trajectory.ownerId}` : "unknown");
      const dedupeKey = `${teamKey}:${impact.inner}:${impact.outer}:${trajectory.target.x}:${trajectory.target.y}`;
      if (renderedTargets.has(dedupeKey)) {
        continue;
      }
      renderedTargets.add(dedupeKey);

      const target = this.toCellCenter(trajectory.target);
      const color = this.resolveTeamColor(teamKey, trajectory.color);
      this.drawImpactRing(
        ctx,
        transform,
        target,
        impact,
        color,
        this.hashString(teamKey) % 360,
        nowMs,
      );
    }

    this.maskSidebarRegion();
  }

  private maskSidebarRegion(): void {
    if (!this.context || typeof document === "undefined") {
      return;
    }
    const sidebar = document.getElementById(SIDEBAR_ID);
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

  private resolveImpactRadii(
    unitType?: string,
  ): { inner: number; outer: number } | null {
    const normalized = this.normalizeUnitType(unitType);
    if (!normalized) {
      return null;
    }
    switch (normalized) {
      case "atombomb":
        return { inner: 12, outer: 30 };
      case "hydrogenbomb":
        return { inner: 80, outer: 100 };
      case "mirvwarhead":
      case "mirv":
        return { inner: 12, outer: 18 };
      default:
        return null;
    }
  }

  private drawImpactRing(
    ctx: CanvasRenderingContext2D,
    transform: TransformHandlerLike,
    targetWorld: Point,
    radii: { inner: number; outer: number },
    color: string,
    dashSeed: number,
    nowMs: number,
  ): void {
    const center = transform.worldToScreenCoordinates(targetWorld);
    if (!this.isFinitePoint(center)) {
      return;
    }

    const scale = Math.max(transform.scale, 0.01);
    const innerRadius = Math.max(3, radii.inner * scale);
    const outerRadius = Math.max(innerRadius + 2, radii.outer * scale);
    const circumference = 2 * Math.PI * outerRadius;
    const numDash = Math.max(12, Math.floor(outerRadius / 6));
    const dashSize = circumference / (numDash * 2);
    const dashPeriod = dashSize * 2;
    const animatedOffset = ((nowMs / 1000) * 20 * scale) % dashPeriod;
    const seededOffset = ((dashSeed % 360) / 360) * dashPeriod;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.arc(center.x, center.y, innerRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.24;
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = Math.max(2, scale);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.setLineDash([dashSize, dashSize]);
    ctx.lineDashOffset = seededOffset + animatedOffset;
    ctx.arc(center.x, center.y, outerRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private normalizeUnitType(unitType?: string): string | null {
    if (typeof unitType !== "string") {
      return null;
    }
    const normalized = unitType.replace(/\s+/g, "").toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  private normalizeTeamKey(teamId?: string): string | null {
    if (typeof teamId !== "string") {
      return null;
    }
    const normalized = teamId.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  private resolveTeamColor(teamKey: string, fallbackColor?: string): string {
    const known = this.teamColors.get(teamKey);
    if (known) {
      return known;
    }
    const normalizedFallback = this.normalizeColor(fallbackColor);
    this.teamColors.set(teamKey, normalizedFallback);
    return normalizedFallback;
  }

  private hashString(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  private isFinitePoint(
    point: { x: number; y: number } | null | undefined,
  ): point is Point {
    return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
  }

  private toCellCenter(point: { x: number; y: number }): Point {
    return { x: point.x + 0.5, y: point.y + 0.5 } satisfies Point;
  }

  private normalizeColor(color?: string): string {
    if (color && color.trim()) {
      return color.trim();
    }
    return "rgb(56, 189, 248)";
  }
}

interface TradeRouteOverlayOptions {
  resolveTransform: () => TransformHandlerLike | null;
  resolveUiState: () => UiStateLike | null;
  resolveGame: () => TradeRouteGameAdapter | null;
  resolveLocalPlayerSmallId: () => number | null;
}

interface TransportDestinationOverlayOptions {
  resolveTransform: () => TransformHandlerLike | null;
}

export interface TransportDestinationSummary {
  x: number;
  y: number;
  count: number;
  label?: string;
  ownerId?: string;
  color?: string;
}

export class TransportDestinationOverlay {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D | null;
  private readonly colorContext: CanvasRenderingContext2D | null;
  private rafHandle: number | null = null;
  private destinations: TransportDestinationSummary[] = [];
  private attached = false;
  private active = false;
  private hostElement: HTMLElement | null = null;
  private cssWidth = 0;
  private cssHeight = 0;
  private pixelRatio = 1;
  private offsetLeft = 0;
  private offsetTop = 0;
  private visible = true;

  constructor(private readonly options: TransportDestinationOverlayOptions) {
    if (typeof document === "undefined") {
      throw new Error(
        "TransportDestinationOverlay requires a browser environment",
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
    this.colorContext = document.createElement("canvas").getContext("2d");
  }

  setDestinations(destinations: readonly TransportDestinationSummary[]): void {
    this.destinations = destinations
      .filter(
        (entry) =>
          Number.isFinite(entry.x) &&
          Number.isFinite(entry.y) &&
          Number.isFinite(entry.count) &&
          entry.count > 0,
      )
      .map((entry) => ({
        ...entry,
        count: Math.max(1, Math.floor(entry.count)),
      }));
  }

  clear(): void {
    this.destinations = [];
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
    this.canvas.style.display = this.visible ? "block" : "none";
    this.updateCanvasSize();
    this.render();
    this.scheduleRender();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!this.active) {
      return;
    }
    this.canvas.style.display = this.visible ? "block" : "none";
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
    } else if (this.canvas.style.position !== "fixed") {
      this.canvas.style.position = "fixed";
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

    if (!this.active || this.destinations.length === 0) {
      return;
    }

    const transform = this.options.resolveTransform?.();
    if (!transform) {
      return;
    }

    const nowMs =
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
        ? performance.now()
        : Date.now();

    for (let index = 0; index < this.destinations.length; index += 1) {
      const destination = this.destinations[index];
      const center = transform.worldToScreenCoordinates(
        this.toCellCenter(destination),
      );
      if (!this.isFinitePoint(center)) {
        continue;
      }

      const radius = this.resolveMarkerRadius(destination.count);
      const markerVisible = this.isScreenPointInsideViewport(center, radius);
      const labelVisible = this.isScreenPointInsideViewport(center);
      if (!markerVisible && !labelVisible) {
        continue;
      }

      const pulse = 0.65 + 0.35 * Math.sin(nowMs / 600 + index * 0.9);
      const color = this.normalizeColor(destination.color);

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      if (markerVisible) {
        ctx.globalAlpha = 0.22 + pulse * 0.16;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.92;
        ctx.lineWidth = Math.max(2, Math.min(4, radius / 3));
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(15, 23, 42, 0.9)";
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(center.x, center.y, Math.max(2, radius * 0.45), 0, Math.PI * 2);
        ctx.stroke();

        if (destination.count > 1) {
          const fontSize = Math.max(10, Math.min(14, radius + 3));
          ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.95;
          ctx.strokeStyle = "rgba(15, 23, 42, 0.95)";
          ctx.strokeText(String(destination.count), center.x, center.y);
          ctx.fillStyle = "#f8fafc";
          ctx.fillText(String(destination.count), center.x, center.y);
        }
      }

      if (labelVisible) {
        this.drawLabel(
          ctx,
          center,
          radius,
          destination.label,
          color,
          transform.scale,
        );
      }
      ctx.restore();
    }

    this.maskSidebarRegion();
  }

  private maskSidebarRegion(): void {
    if (!this.context || typeof document === "undefined") {
      return;
    }
    const sidebar = document.getElementById(SIDEBAR_ID);
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

  private resolveMarkerRadius(count: number): number {
    const safeCount = Math.max(1, Math.floor(count));
    return Math.min(18, 6 + Math.log2(safeCount) * 3);
  }

  private drawLabel(
    ctx: CanvasRenderingContext2D,
    center: Point,
    radius: number,
    rawLabel: string | undefined,
    accentColor: string,
    transformScale: number,
  ): void {
    const zoomScale = this.resolveLabelZoomScale(transformScale);
    if (zoomScale <= 0.36) {
      return;
    }

    const label = this.normalizeLabel(
      rawLabel,
      this.resolveLabelMaxChars(zoomScale),
    );
    if (!label) {
      return;
    }

    const fontSize = Math.max(8, Math.min(12, Math.round(11 * zoomScale)));
    const horizontalPadding = Math.max(
      4,
      Math.min(8, Math.round(6 * zoomScale)),
    );
    const boxHeight = Math.max(13, Math.min(22, Math.round(18 * zoomScale)));
    const offset = Math.max(8, Math.round((radius + 12) * zoomScale));
    const centerY = Math.max(boxHeight / 2 + 2, center.y - offset);

    ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(label).width;
    const boxWidth = Math.max(28, Math.ceil(textWidth + horizontalPadding * 2));
    const boxX = center.x - boxWidth / 2;
    const boxY = centerY - boxHeight / 2;
    const cornerRadius = Math.max(3, Math.min(6, Math.round(5 * zoomScale)));

    this.roundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, cornerRadius);
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.shadowColor = "rgba(2, 6, 23, 0.35)";
    ctx.shadowBlur = Math.max(4, 8 * zoomScale);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.max(1, 3 * zoomScale);
    ctx.globalAlpha = 0.96;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    this.roundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, cornerRadius);
    ctx.strokeStyle = this.mixLabelBorderColor(accentColor);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = Math.max(0.75, Math.min(1.1, 0.9 * zoomScale));
    ctx.stroke();

    ctx.fillStyle = "#e2e8f0";
    ctx.globalAlpha = 0.98;
    ctx.fillText(label, center.x, centerY + 0.5);
  }

  private roundedRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
    const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - safeRadius,
      y + height,
    );
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
  }

  private normalizeLabel(
    rawLabel: string | undefined,
    maxChars: number,
  ): string | null {
    if (typeof rawLabel !== "string") {
      return null;
    }
    const trimmed = rawLabel.trim();
    if (!trimmed) {
      return null;
    }
    if (trimmed.length <= maxChars) {
      return trimmed;
    }
    return `${trimmed.slice(0, maxChars - 1)}…`;
  }

  private resolveLabelZoomScale(transformScale: number): number {
    const numericScale = Number.isFinite(transformScale) ? transformScale : 1;
    return Math.max(0.35, Math.min(1, numericScale / 1.8));
  }

  private resolveLabelMaxChars(zoomScale: number): number {
    const clamped = Math.max(0.35, Math.min(1, zoomScale));
    return Math.max(10, Math.min(34, Math.round(10 + clamped * 24)));
  }

  private mixLabelBorderColor(accentColor: string): string {
    const parsed = this.parseColor(accentColor);
    if (!parsed) {
      return "rgba(148, 163, 184, 0.75)";
    }
    const blendWith = { r: 148, g: 163, b: 184 };
    const weight = 0.5;
    const r = Math.round(parsed.r * weight + blendWith.r * (1 - weight));
    const g = Math.round(parsed.g * weight + blendWith.g * (1 - weight));
    const b = Math.round(parsed.b * weight + blendWith.b * (1 - weight));
    return `rgba(${r}, ${g}, ${b}, 0.75)`;
  }

  private parseColor(
    color: string,
  ): { r: number; g: number; b: number; a: number } | null {
    if (!color || typeof color !== "string") {
      return null;
    }

    const context = this.colorContext;
    if (!context) {
      return null;
    }

    try {
      context.fillStyle = "#000";
      context.fillStyle = color;
      const computed = context.fillStyle;
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

  private isFinitePoint(
    point: { x: number; y: number } | null | undefined,
  ): point is Point {
    return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
  }

  private isScreenPointInsideViewport(point: Point, padding = 0): boolean {
    if (this.cssWidth <= 0 || this.cssHeight <= 0) {
      return false;
    }
    return (
      point.x >= this.offsetLeft - padding &&
      point.x <= this.offsetLeft + this.cssWidth + padding &&
      point.y >= this.offsetTop - padding &&
      point.y <= this.offsetTop + this.cssHeight + padding
    );
  }

  private toCellCenter(point: { x: number; y: number }): Point {
    return { x: point.x + 0.5, y: point.y + 0.5 } satisfies Point;
  }

  private normalizeColor(color?: string): string {
    if (typeof color === "string" && color.trim().length > 0) {
      return color.trim();
    }
    return "rgb(56, 189, 248)";
  }
}

export interface TradeRoutePortSummary {
  id: string;
  tileRef: number;
  x: number;
  y: number;
  ownerId: string;
  ownerSmallId?: number;
  ownerName?: string;
  ownerColor?: string;
  includeFromLocal: boolean;
  includeToLocal: boolean;
}

interface TradeRouteGameAdapter {
  ref(x: number, y: number): number;
  x(ref: number): number;
  y(ref: number): number;
  isValidCoord(x: number, y: number): boolean;
  neighbors(ref: number): number[];
  isWater(ref: number): boolean;
  ownerID(ref: number): number;
  cost?(ref: number): number;
  manhattanDist?(a: number, b: number): number;
  config?(): TradeRouteConfigAdapter | null | undefined;
}

interface TradeRouteConfigAdapter {
  tradeShipGold?(distance: number, numPorts: number): number | bigint;
}

interface TradeRouteRouteSummary {
  portId: string;
  ownerColor: string;
  ownerName: string;
  distance: number;
  baseGold: number;
  path: Point[];
  midpoint: Point;
  includeFromLocal: boolean;
  includeToLocal: boolean;
}

interface RouteLabelEntry {
  container: HTMLDivElement;
  distanceText: HTMLSpanElement;
  usernameText: HTMLSpanElement;
  goldText: HTMLSpanElement;
}

export interface AttackBorderLabelSummary {
  id: string;
  x: number;
  y: number;
  text: string;
  color?: string;
  minScale?: number;
}

interface AttackBorderOverlayOptions {
  resolveTransform: () => TransformHandlerLike | null;
}

interface AttackBorderLabelEntry {
  container: HTMLDivElement;
  icon: SVGSVGElement;
  text: HTMLSpanElement;
}

class MinPriorityQueue<T extends { fScore: number }> {
  private readonly heap: T[] = [];

  enqueue(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    const root = this.heap[0];
    const tail = this.heap.pop();
    if (this.heap.length > 0 && tail !== undefined) {
      this.heap[0] = tail;
      this.bubbleDown(0);
    }
    return root;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].fScore <= this.heap[index].fScore) {
        break;
      }
      [this.heap[parent], this.heap[index]] = [
        this.heap[index],
        this.heap[parent],
      ];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      if (
        left < length &&
        this.heap[left].fScore < this.heap[smallest].fScore
      ) {
        smallest = left;
      }
      if (
        right < length &&
        this.heap[right].fScore < this.heap[smallest].fScore
      ) {
        smallest = right;
      }
      if (smallest === index) {
        return;
      }
      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }
}

export class TradeRouteOverlay {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D | null;
  private readonly labelContainer: HTMLDivElement;
  private cleanupCallbacks: Array<() => void> = [];
  private pointer: Point | null = null;
  private attached = false;
  private active = false;
  private hostElement: HTMLElement | null = null;
  private cssWidth = 0;
  private cssHeight = 0;
  private pixelRatio = 1;
  private offsetLeft = 0;
  private offsetTop = 0;
  private rafHandle: number | null = null;
  private portSummaries: TradeRoutePortSummary[] = [];
  private portsRevision = 0;
  private routes: TradeRouteRouteSummary[] = [];
  private labelPool: Map<string, RouteLabelEntry> = new Map();
  private lastLocalSmallId: number | null = null;
  private lastComputation = {
    pointerRef: null as number | null,
    candidateRef: null as number | null,
    portsRevision: -1,
    localSmallId: null as number | null,
  };
  private visible = true;

  constructor(private readonly options: TradeRouteOverlayOptions) {
    if (typeof document === "undefined") {
      throw new Error("TradeRouteOverlay requires a browser environment");
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

    this.labelContainer = document.createElement("div");
    this.labelContainer.style.position = "fixed";
    this.labelContainer.style.left = "0";
    this.labelContainer.style.top = "0";
    this.labelContainer.style.width = "100%";
    this.labelContainer.style.height = "100%";
    this.labelContainer.style.pointerEvents = "none";
    this.labelContainer.style.zIndex = "31";
    this.labelContainer.style.display = "none";
    this.labelContainer.style.fontFamily =
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  }

  setPortSummaries(summaries: readonly TradeRoutePortSummary[]): void {
    const next = summaries.map((summary) => ({ ...summary }));
    if (!this.arePortSummariesEqual(next)) {
      this.portSummaries = next;
      this.portsRevision += 1;
    }
  }

  setLocalPlayerSmallId(smallId: number | null): void {
    if (this.lastLocalSmallId !== smallId) {
      this.lastLocalSmallId = smallId;
      this.lastComputation.pointerRef = null;
    }
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
    this.canvas.style.display = this.visible ? "block" : "none";
    this.labelContainer.style.display = this.visible ? "block" : "none";
    this.updateCanvasSize();
    this.registerEventListeners();
    this.render();
    this.scheduleRender();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!this.active) {
      return;
    }
    const display = this.visible ? "block" : "none";
    this.canvas.style.display = display;
    this.labelContainer.style.display = display;
  }

  disable(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.canvas.style.display = "none";
    this.labelContainer.style.display = "none";
    this.cancelRender();
    this.cleanupEventListeners();
    this.routes = [];
    this.hideAllLabels();
    this.clearCanvas();
  }

  dispose(): void {
    this.disable();
    if (this.attached) {
      this.canvas.remove();
      this.labelContainer.remove();
      this.attached = false;
      this.hostElement = null;
    }
  }

  clear(): void {
    this.routes = [];
    this.hideAllLabels();
    this.clearCanvas();
    this.lastComputation = {
      pointerRef: null,
      candidateRef: null,
      portsRevision: -1,
      localSmallId: this.lastLocalSmallId,
    };
  }

  private arePortSummariesEqual(next: TradeRoutePortSummary[]): boolean {
    if (this.portSummaries.length !== next.length) {
      return false;
    }
    const current = new Map(
      this.portSummaries.map((entry) => [entry.id, entry]),
    );
    for (const summary of next) {
      const existing = current.get(summary.id);
      if (!existing) {
        return false;
      }
      if (
        existing.tileRef !== summary.tileRef ||
        existing.ownerId !== summary.ownerId ||
        existing.ownerSmallId !== summary.ownerSmallId ||
        existing.ownerColor !== summary.ownerColor ||
        existing.includeFromLocal !== summary.includeFromLocal ||
        existing.includeToLocal !== summary.includeToLocal
      ) {
        return false;
      }
    }
    return true;
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
        // Ignore cleanup failures.
      }
    }
    this.cleanupCallbacks = [];
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
    if (this.labelContainer.parentElement !== container) {
      this.labelContainer.remove();
      container.appendChild(this.labelContainer);
    }
    this.hostElement = container;
    this.attached = true;
    this.ensureContainerPositioned(container);
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
      if (this.labelContainer.style.position !== "absolute") {
        this.labelContainer.style.position = "absolute";
      }
      this.ensureContainerPositioned(host);
    } else {
      if (this.canvas.style.position !== "fixed") {
        this.canvas.style.position = "fixed";
      }
      if (this.labelContainer.style.position !== "fixed") {
        this.labelContainer.style.position = "fixed";
      }
    }

    if (this.canvas.style.left !== `${relativeLeft}px`) {
      this.canvas.style.left = `${relativeLeft}px`;
    }
    if (this.canvas.style.top !== `${relativeTop}px`) {
      this.canvas.style.top = `${relativeTop}px`;
    }

    if (this.labelContainer.style.left !== `${relativeLeft}px`) {
      this.labelContainer.style.left = `${relativeLeft}px`;
    }
    if (this.labelContainer.style.top !== `${relativeTop}px`) {
      this.labelContainer.style.top = `${relativeTop}px`;
    }
    if (this.labelContainer.style.width !== `${width}px`) {
      this.labelContainer.style.width = `${width}px`;
    }
    if (this.labelContainer.style.height !== `${height}px`) {
      this.labelContainer.style.height = `${height}px`;
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
      this.hideAllLabels();
      return;
    }

    const transform = this.options.resolveTransform();
    const uiState = this.options.resolveUiState();
    if (!transform || !this.isPortSelected(uiState)) {
      this.routes = [];
      this.hideAllLabels();
      return;
    }

    const pointer = this.resolvePointer(transform);
    if (!pointer) {
      this.routes = [];
      this.hideAllLabels();
      return;
    }

    const game = this.options.resolveGame();
    if (!game) {
      this.routes = [];
      this.hideAllLabels();
      return;
    }

    const pointerRef = this.toTileRef(game, pointer);
    if (pointerRef === null) {
      this.routes = [];
      this.hideAllLabels();
      return;
    }

    const localSmallId = this.options.resolveLocalPlayerSmallId?.() ?? null;
    const candidateRef = this.findPortSpawnRef(game, pointerRef, localSmallId);

    if (
      this.lastComputation.pointerRef !== pointerRef ||
      this.lastComputation.candidateRef !== candidateRef ||
      this.lastComputation.portsRevision !== this.portsRevision ||
      this.lastComputation.localSmallId !== localSmallId
    ) {
      this.routes = this.computeRoutes(game, candidateRef);
      this.lastComputation = {
        pointerRef,
        candidateRef,
        portsRevision: this.portsRevision,
        localSmallId,
      };
    }

    this.drawRoutes(transform);
    this.updateLabels(transform);
    this.maskSidebarRegion();
  }

  private resolvePointer(transform: TransformHandlerLike): Point | null {
    let pointer = this.pointer;
    const rect = transform.boundingRect?.();
    if (pointer && rect && !this.isPointerInside(rect, pointer)) {
      pointer = null;
    }
    if (pointer && this.isPointerOverSidebar(pointer)) {
      pointer = null;
    }
    return pointer ?? null;
  }

  private toTileRef(
    game: TradeRouteGameAdapter,
    pointer: Point,
  ): number | null {
    const transform = this.options.resolveTransform?.();
    if (!transform) {
      return null;
    }
    const world = transform.screenToWorldCoordinates(pointer.x, pointer.y);
    if (!this.isFinitePoint(world)) {
      return null;
    }
    const tileX = Math.floor(world.x);
    const tileY = Math.floor(world.y);
    if (!Number.isFinite(tileX) || !Number.isFinite(tileY)) {
      return null;
    }
    if (!game.isValidCoord(tileX, tileY)) {
      return null;
    }
    try {
      return game.ref(tileX, tileY);
    } catch {
      return null;
    }
  }

  private computeRoutes(
    game: TradeRouteGameAdapter,
    candidateRef: number | null,
  ): TradeRouteRouteSummary[] {
    if (candidateRef === null) {
      return [];
    }

    const results: TradeRouteRouteSummary[] = [];
    const destPoint: Point = {
      x: game.x(candidateRef) + 0.5,
      y: game.y(candidateRef) + 0.5,
    } satisfies Point;

    for (const port of this.portSummaries) {
      if (!port.includeFromLocal || !port.includeToLocal) {
        continue;
      }
      if (port.tileRef === candidateRef) {
        continue;
      }
      const pathRefs = this.findRoutePath(game, port.tileRef, candidateRef);
      if (!pathRefs || pathRefs.length < 2) {
        continue;
      }
      const distance = pathRefs.length - 1;
      if (distance <= 0) {
        continue;
      }

      const path: Point[] = pathRefs.map((ref) => ({
        x: game.x(ref) + 0.5,
        y: game.y(ref) + 0.5,
      }));

      const midpoint = path[Math.floor(path.length / 2)] ?? destPoint;
      const ownerColor = this.normalizeColor(port.ownerColor);
      const resolvedOwnerId =
        typeof port.ownerId === "string"
          ? port.ownerId.trim()
          : `${port.ownerId}`;
      const ownerName =
        port.ownerName?.trim() ||
        (resolvedOwnerId ? `Player ${resolvedOwnerId}` : "Unknown player");
      const baseGold = this.computeBaseGold(game, distance);

      results.push({
        portId: port.id,
        ownerColor,
        ownerName,
        distance,
        baseGold,
        path,
        midpoint,
        includeFromLocal: port.includeFromLocal,
        includeToLocal: port.includeToLocal,
      });
    }

    return results;
  }

  private drawRoutes(transform: TransformHandlerLike): void {
    const ctx = this.context;
    if (!ctx) {
      return;
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.4;

    for (const route of this.routes) {
      if (route.path.length < 2) {
        continue;
      }
      ctx.save();
      ctx.strokeStyle = route.ownerColor;
      ctx.globalAlpha = 0.85;

      ctx.beginPath();
      let started = false;
      for (const point of route.path) {
        const screen = transform.worldToScreenCoordinates(point);
        if (!this.isFinitePoint(screen)) {
          started = false;
          break;
        }
        if (!started) {
          ctx.moveTo(screen.x, screen.y);
          started = true;
        } else {
          ctx.lineTo(screen.x, screen.y);
        }
      }
      if (started) {
        ctx.stroke();
      }
      ctx.restore();

      this.drawEndpoint(transform, route.path[0], route.ownerColor, 0.6);
      this.drawEndpoint(
        transform,
        route.path[route.path.length - 1],
        route.ownerColor,
        0.85,
      );
    }

    ctx.restore();
  }

  private drawEndpoint(
    transform: TransformHandlerLike,
    point: Point,
    color: string,
    alpha: number,
  ): void {
    const ctx = this.context;
    if (!ctx) {
      return;
    }
    const screen = transform.worldToScreenCoordinates(point);
    if (!this.isFinitePoint(screen)) {
      return;
    }
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    const radius = Math.max(2.8, 4.5 - transform.scale * 0.15);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private updateLabels(transform: TransformHandlerLike): void {
    const used = new Set<string>();

    for (const route of this.routes) {
      const key = route.portId;
      const entry = this.ensureLabelEntry(key);
      used.add(key);

      entry.distanceText.textContent = `${route.distance.toLocaleString()} tiles`;
      entry.usernameText.textContent = route.ownerName;
      entry.goldText.textContent = `${route.baseGold.toLocaleString()} gold`;

      entry.container.style.color = route.ownerColor;

      const midpointScreen = transform.worldToScreenCoordinates(route.midpoint);
      if (!this.isFinitePoint(midpointScreen)) {
        entry.container.style.display = "none";
        continue;
      }

      entry.container.style.left = `${midpointScreen.x}px`;
      entry.container.style.top = `${midpointScreen.y}px`;
      entry.container.style.display = "inline-flex";
    }

    for (const [key, entry] of this.labelPool.entries()) {
      if (used.has(key)) {
        continue;
      }
      entry.container.remove();
      this.labelPool.delete(key);
    }
  }

  private ensureLabelEntry(key: string): RouteLabelEntry {
    let entry = this.labelPool.get(key);
    if (!entry) {
      entry = this.createRouteLabel();
      this.labelPool.set(key, entry);
    }
    return entry;
  }

  private createRouteLabel(): RouteLabelEntry {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.padding = "4px 8px";
    container.style.borderRadius = "6px";
    container.style.fontSize = "0.7rem";
    container.style.fontWeight = "600";
    container.style.letterSpacing = "0.02em";
    container.style.color = "#e2e8f0";
    container.style.background = "rgba(15, 23, 42, 0.85)";
    container.style.boxShadow = "0 4px 12px rgba(2, 6, 23, 0.35)";
    container.style.whiteSpace = "nowrap";
    container.style.transform = "translate(-50%, -50%)";
    container.style.display = "none";
    container.style.alignItems = "center";
    container.style.gap = "6px";

    const shipIcon = createElement(Ship) as SVGSVGElement;
    shipIcon.setAttribute("aria-hidden", "true");
    shipIcon.style.width = "14px";
    shipIcon.style.height = "14px";
    shipIcon.style.flexShrink = "0";
    shipIcon.style.color = "inherit";

    const distanceText = document.createElement("span");
    distanceText.textContent = "";

    const distanceSeparator = document.createElement("span");
    distanceSeparator.textContent = "•";
    distanceSeparator.setAttribute("aria-hidden", "true");

    const goldIcon = createElement(CirclePoundSterling) as SVGSVGElement;
    goldIcon.setAttribute("aria-hidden", "true");
    goldIcon.style.width = "14px";
    goldIcon.style.height = "14px";
    goldIcon.style.flexShrink = "0";
    goldIcon.style.color = "inherit";

    const goldText = document.createElement("span");
    goldText.textContent = "";

    const goldSeparator = document.createElement("span");
    goldSeparator.textContent = "•";
    goldSeparator.setAttribute("aria-hidden", "true");

    const usernameText = document.createElement("span");
    usernameText.textContent = "";

    container.appendChild(shipIcon);
    container.appendChild(distanceText);
    container.appendChild(distanceSeparator);
    container.appendChild(goldIcon);
    container.appendChild(goldText);
    container.appendChild(goldSeparator);
    container.appendChild(usernameText);
    this.labelContainer.appendChild(container);

    return { container, distanceText, usernameText, goldText };
  }

  private hideAllLabels(): void {
    for (const entry of this.labelPool.values()) {
      entry.container.style.display = "none";
    }
  }

  private findPortSpawnRef(
    game: TradeRouteGameAdapter,
    pointerRef: number,
    localSmallId: number | null,
  ): number | null {
    if (localSmallId === null) {
      return null;
    }
    const originX = game.x(pointerRef);
    const originY = game.y(pointerRef);
    const radius = 20;
    let bestRef: number | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let dx = -radius; dx <= radius; dx++) {
      const x = originX + dx;
      for (let dy = -radius; dy <= radius; dy++) {
        const y = originY + dy;
        const manhattan = Math.abs(dx) + Math.abs(dy);
        if (manhattan > radius) {
          continue;
        }
        if (!game.isValidCoord(x, y)) {
          continue;
        }
        let ref: number;
        try {
          ref = game.ref(x, y);
        } catch {
          continue;
        }
        if (this.isWaterTile(game, ref)) {
          continue;
        }
        let ownerIdMatches = false;
        try {
          ownerIdMatches = game.ownerID(ref) === localSmallId;
        } catch {
          continue;
        }
        if (!ownerIdMatches) {
          continue;
        }
        if (!this.hasAdjacentWater(game, ref)) {
          continue;
        }
        if (manhattan < bestDistance) {
          bestDistance = manhattan;
          bestRef = ref;
        }
      }
    }

    return bestRef;
  }

  private isWaterTile(game: TradeRouteGameAdapter, ref: number): boolean {
    try {
      return game.isWater(ref);
    } catch {
      return false;
    }
  }

  private hasAdjacentWater(game: TradeRouteGameAdapter, ref: number): boolean {
    try {
      return game.neighbors(ref).some((neighbor) => game.isWater(neighbor));
    } catch {
      return false;
    }
  }

  private findRoutePath(
    game: TradeRouteGameAdapter,
    startRef: number,
    destRef: number,
  ): number[] | null {
    if (startRef === destRef) {
      return [startRef];
    }

    const open = new MinPriorityQueue<{ ref: number; fScore: number }>();
    const cameFrom = new Map<number, number>();
    const gScore = new Map<number, number>();
    const visited = new Set<number>();

    gScore.set(startRef, 0);
    open.enqueue({
      ref: startRef,
      fScore: this.heuristic(game, startRef, destRef),
    });

    const maxIterations = 75000;
    let iterations = 0;

    while (!open.isEmpty() && iterations < maxIterations) {
      iterations += 1;
      const current = open.dequeue();
      if (!current) {
        break;
      }
      const currentRef = current.ref;
      if (currentRef === destRef) {
        return this.reconstructPath(cameFrom, currentRef);
      }
      if (visited.has(currentRef)) {
        continue;
      }
      visited.add(currentRef);

      let neighbors: number[];
      try {
        neighbors = game.neighbors(currentRef);
      } catch {
        continue;
      }

      for (const neighbor of neighbors) {
        if (
          !this.isTraversable(game, currentRef, neighbor, startRef, destRef)
        ) {
          continue;
        }

        const stepCost = this.computeTraversalCost(game, neighbor);
        if (!Number.isFinite(stepCost) || stepCost <= 0) {
          continue;
        }

        const currentCost = gScore.get(currentRef) ?? Infinity;
        const tentative = currentCost + stepCost;
        if (tentative >= (gScore.get(neighbor) ?? Infinity)) {
          continue;
        }

        cameFrom.set(neighbor, currentRef);
        gScore.set(neighbor, tentative);
        open.enqueue({
          ref: neighbor,
          fScore: tentative + this.heuristic(game, neighbor, destRef),
        });
      }
    }

    return null;
  }

  private reconstructPath(
    cameFrom: Map<number, number>,
    current: number,
  ): number[] {
    const path: number[] = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!;
      path.unshift(current);
    }
    return path;
  }

  private isTraversable(
    game: TradeRouteGameAdapter,
    from: number,
    to: number,
    startRef: number,
    destRef: number,
  ): boolean {
    if (to === destRef) {
      return true;
    }
    if (from === startRef) {
      try {
        return game.isWater(to);
      } catch {
        return false;
      }
    }
    try {
      return game.isWater(from) && game.isWater(to);
    } catch {
      return false;
    }
  }

  private heuristic(
    game: TradeRouteGameAdapter,
    from: number,
    to: number,
  ): number {
    const distance = this.computeManhattanDistance(game, from, to);
    if (!Number.isFinite(distance) || distance <= 0) {
      return 0;
    }
    return distance * 2;
  }

  private computeManhattanDistance(
    game: TradeRouteGameAdapter,
    from: number,
    to: number,
  ): number {
    try {
      if (typeof game.manhattanDist === "function") {
        const resolved = game.manhattanDist(from, to);
        if (Number.isFinite(resolved)) {
          return Math.max(0, resolved);
        }
      }
    } catch {
      // fall back to coordinate-based distance
    }

    try {
      const dx = Math.abs(game.x(from) - game.x(to));
      const dy = Math.abs(game.y(from) - game.y(to));
      const sum = dx + dy;
      return Number.isFinite(sum) ? Math.max(0, sum) : 0;
    } catch {
      return 0;
    }
  }

  private computeTraversalCost(
    game: TradeRouteGameAdapter,
    ref: number,
  ): number {
    try {
      if (typeof game.cost === "function") {
        const resolved = game.cost(ref);
        if (Number.isFinite(resolved) && resolved > 0) {
          return resolved;
        }
      }
    } catch {
      // fall through to default cost
    }
    return 1;
  }

  private computeBaseGold(
    game: TradeRouteGameAdapter,
    distance: number,
  ): number {
    if (distance <= 0) {
      return 0;
    }

    const configBaseGold = this.computeBaseGoldFromGameConfig(game, distance);
    if (configBaseGold !== null) {
      return configBaseGold;
    }

    const ratio = distance / (distance + 50);
    const base = Math.floor(100_000 * ratio + 100 * distance);
    return base;
  }

  private computeBaseGoldFromGameConfig(
    game: TradeRouteGameAdapter,
    distance: number,
  ): number | null {
    let config: TradeRouteConfigAdapter | null | undefined;
    try {
      config = typeof game.config === "function" ? game.config() : null;
    } catch {
      return null;
    }

    const tradeShipGold = config?.tradeShipGold;
    if (typeof tradeShipGold !== "function") {
      return null;
    }

    let result: unknown;
    try {
      result = tradeShipGold.call(config, distance, 1);
    } catch {
      return null;
    }

    if (typeof result === "number" && Number.isFinite(result)) {
      return Math.floor(result);
    }
    if (typeof result === "bigint") {
      const numeric = Number(result);
      return Number.isFinite(numeric) ? Math.floor(numeric) : null;
    }
    return null;
  }

  private isPortSelected(uiState: UiStateLike | null): boolean {
    const selection = this.normalizeSelection(uiState?.ghostStructure);
    return selection === "port";
  }

  private normalizeSelection(value: string | null | undefined): string | null {
    if (typeof value !== "string") {
      return null;
    }
    const normalized = value.replace(/\s+/g, " ").trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
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
    const sidebar = document.getElementById(SIDEBAR_ID);
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
    const sidebar = document.getElementById(SIDEBAR_ID);
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

  private normalizeColor(color?: string): string {
    if (color && color.trim()) {
      return color.trim();
    }
    return "rgba(56, 189, 248, 0.95)";
  }

  private isFinitePoint(
    point: { x: number; y: number } | null | undefined,
  ): point is Point {
    return !!point && Number.isFinite(point.x) && Number.isFinite(point.y);
  }
}

const SVG_NS = "http://www.w3.org/2000/svg";

export class AttackBorderOverlay {
  private readonly container: HTMLDivElement;
  private readonly labelLayer: HTMLDivElement;
  private readonly labelPool: Map<string, AttackBorderLabelEntry> = new Map();
  private labelSummaries: AttackBorderLabelSummary[] = [];
  private rafHandle: number | null = null;
  private attached = false;
  private active = false;
  private hostElement: HTMLElement | null = null;
  private offsetLeft = 0;
  private offsetTop = 0;
  private cssWidth = 0;
  private cssHeight = 0;
  private visible = true;

  constructor(private readonly options: AttackBorderOverlayOptions) {
    if (typeof document === "undefined") {
      throw new Error("AttackBorderOverlay requires a browser environment");
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

    this.labelLayer = document.createElement("div");
    this.labelLayer.style.position = "absolute";
    this.labelLayer.style.left = "0";
    this.labelLayer.style.top = "0";
    this.labelLayer.style.width = "100%";
    this.labelLayer.style.height = "100%";
    this.labelLayer.style.pointerEvents = "none";
    this.container.appendChild(this.labelLayer);
  }

  setLabels(summaries: readonly AttackBorderLabelSummary[]): void {
    this.labelSummaries = summaries.map((summary) => ({ ...summary }));
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
    this.container.style.display = this.visible ? "block" : "none";
    this.updateContainerFrame();
    this.render();
    this.scheduleRender();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!this.active) {
      return;
    }
    this.container.style.display = this.visible ? "block" : "none";
  }

  disable(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.container.style.display = "none";
    this.cancelRender();
    this.hideAllLabels();
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

  clear(): void {
    this.labelSummaries = [];
    for (const entry of this.labelPool.values()) {
      entry.container.remove();
    }
    this.labelPool.clear();
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
      this.hideAllLabels();
      return;
    }

    this.updateContainerFrame();
    this.updateLabels(transform);
  }

  private updateLabels(transform: TransformHandlerLike): void {
    const used = new Set<string>();

    for (const summary of this.labelSummaries) {
      if (!Number.isFinite(summary.x) || !Number.isFinite(summary.y)) {
        continue;
      }
      const entry = this.ensureLabelEntry(summary.id);
      used.add(summary.id);

      entry.text.textContent = summary.text;
      entry.container.style.color = summary.color ?? "#e2e8f0";
      const minScale = summary.minScale ?? 0;
      if (transform.scale < minScale) {
        entry.container.style.display = "none";
        continue;
      }
      const screen = transform.worldToScreenCoordinates({
        x: summary.x,
        y: summary.y,
      });
      if (!this.isFinitePoint(screen)) {
        entry.container.style.display = "none";
        continue;
      }
      const localX = screen.x - this.offsetLeft;
      const localY = screen.y - this.offsetTop;
      entry.container.style.left = `${localX}px`;
      entry.container.style.top = `${localY}px`;
      entry.container.style.display = "inline-flex";
    }

    for (const [key, entry] of this.labelPool.entries()) {
      if (used.has(key)) {
        continue;
      }
      entry.container.remove();
      this.labelPool.delete(key);
    }
  }

  private ensureLabelEntry(key: string): AttackBorderLabelEntry {
    let entry = this.labelPool.get(key);
    if (!entry) {
      entry = this.createLabel();
      this.labelPool.set(key, entry);
    }
    return entry;
  }

  private createLabel(): AttackBorderLabelEntry {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.padding = "3px 6px";
    container.style.borderRadius = "5px";
    container.style.fontSize = "clamp(0.52rem, 0.62vw, 0.62rem)";
    container.style.lineHeight = "1";
    container.style.fontWeight = "600";
    container.style.letterSpacing = "0.02em";
    container.style.color = "#e2e8f0";
    container.style.background = "rgba(15, 23, 42, 0.85)";
    container.style.boxShadow = "0 4px 12px rgba(2, 6, 23, 0.35)";
    container.style.whiteSpace = "nowrap";
    container.style.transform = "translate(-50%, -50%)";
    container.style.display = "none";
    container.style.alignItems = "center";
    container.style.gap = "5px";

    const icon = createElement(Users) as SVGSVGElement;
    icon.setAttribute("aria-hidden", "true");
    icon.style.width = "9px";
    icon.style.height = "9px";
    icon.style.flexShrink = "0";
    icon.style.color = "inherit";

    const text = document.createElement("span");
    text.textContent = "";
    container.appendChild(icon);
    container.appendChild(text);
    this.labelLayer.appendChild(container);

    return { container, icon, text };
  }

  private hideAllLabels(): void {
    for (const entry of this.labelPool.values()) {
      entry.container.style.display = "none";
    }
  }

  private isFinitePoint(
    point: { x: number; y: number } | null | undefined,
  ): point is Point {
    return Boolean(
      point && Number.isFinite(point.x) && Number.isFinite(point.y),
    );
  }
}

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
  private visible = true;

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
    this.container.style.display = this.visible ? "block" : "none";
    this.updateContainerFrame();
    this.render();
    this.scheduleRender();
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!this.active) {
      return;
    }
    this.container.style.display = this.visible ? "block" : "none";
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
