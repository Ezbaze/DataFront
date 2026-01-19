import { SidebarApp } from "./app";
import { DataStore } from "./data";
import { sidebarLogger } from "./logger";
import { SidebarWindowHandle } from "./types";
import { datafrontTailwindCss } from "./generated/tailwind";

declare global {
  interface Window {
    dataFront?: SidebarWindowHandle;
  }
}

function createSessionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ensureTailwind(targetDocument: Document): void {
  const existing = targetDocument.getElementById("datafront-tailwind");
  if (existing) {
    return;
  }
  const style = targetDocument.createElement("style");
  style.id = "datafront-tailwind";
  style.textContent = datafrontTailwindCss;
  targetDocument.head.appendChild(style);
}

class SidebarWindowManager {
  private readonly store = new DataStore();
  private readonly instances = new Set<SidebarApp>();
  private readonly appsByWindow = new Map<Window, SidebarApp>();
  private selectedPlayerId: string | null = null;
  private searchFilter = "";

  constructor() {
    this.createPrimarySidebar();
  }

  updateData(snapshot: Parameters<SidebarWindowHandle["updateData"]>[0]): void {
    this.pruneClosedWindows();
    this.store.update(snapshot);
  }

  private createPrimarySidebar(): void {
    const uiWindow = window;
    const app = new SidebarApp(
      this.store,
      {
        enableOverlayAlignment: true,
        onRequestNewWindow: () => this.openAdditionalWindow(),
        onPlayerDetailsSelected: (playerId) =>
          this.handlePlayerDetailsSelected(uiWindow, playerId),
        onSearchFilterChanged: (query) =>
          this.handleSearchFilterChanged(uiWindow, query),
        windowMode: "embedded",
      },
      document,
      uiWindow,
    );
    this.instances.add(app);
    this.appsByWindow.set(uiWindow, app);
    this.syncAppSelection(app);
  }

  private pruneClosedWindows(): void {
    const staleApps: SidebarApp[] = [];
    for (const [uiWindow, app] of this.appsByWindow.entries()) {
      if (uiWindow === window) {
        continue;
      }
      if (uiWindow.closed) {
        staleApps.push(app);
      }
    }
    for (const app of staleApps) {
      this.removeInstance(app);
    }
  }

  private preparePopupDocument(targetDocument: Document): void {
    targetDocument.open();
    targetDocument.write(
      `<!doctype html>
<meta charset="utf-8">
<title>DataFront</title>
<style>
  html,body{height:100%;margin:0;background:#020617;color:#e2e8f0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .df-status{display:flex;align-items:center;justify-content:center;height:100%;padding:16px;box-sizing:border-box}
</style>
<script data-openfront-sidebar-popup-bootstrap>
(() => {
  const RETRY_MS = 1000;
  let lastSessionId = "";

  const attemptRegister = () => {
    try {
      const opener = window.opener;
      const api = opener && opener.dataFront;
      if (!api || typeof api.registerPopup !== "function") {
        return;
      }
      const sessionId = api.sessionId;
      if (typeof sessionId !== "string" || !sessionId) {
        return;
      }
      if (sessionId === lastSessionId) {
        return;
      }
      api.registerPopup(window);
      lastSessionId = sessionId;
    } catch {
      // ignore
    }
  };

  attemptRegister();
  setInterval(attemptRegister, RETRY_MS);
  window.addEventListener("focus", attemptRegister);
  window.addEventListener("pageshow", attemptRegister);
  window.addEventListener("beforeunload", () => {
    try {
      const opener = window.opener;
      const api = opener && opener.dataFront;
      if (api && typeof api.unregisterPopup === "function") {
        api.unregisterPopup(window.name);
      }
    } catch {
      // ignore
    }
  });
})();
</script>
<body><div class="df-status">Connecting to main window…</div></body>`,
    );
    targetDocument.close();
  }

  private removeInstance(app: SidebarApp): void {
    if (this.instances.delete(app)) {
      app.destroy();
    }
    for (const [key, value] of this.appsByWindow.entries()) {
      if (value === app) {
        this.appsByWindow.delete(key);
      }
    }
  }

  private syncAppSelection(app: SidebarApp): void {
    if (this.selectedPlayerId) {
      app.syncPlayerSelection(this.selectedPlayerId);
    }
    if (this.searchFilter) {
      app.syncSearchFilter(this.searchFilter);
    }
  }

  private handlePlayerDetailsSelected(
    sourceWindow: Window,
    playerId: string,
  ): void {
    const source = this.appsByWindow.get(sourceWindow);
    if (!source) {
      return;
    }
    const normalized = playerId.trim();
    if (!normalized) {
      return;
    }
    this.selectedPlayerId = normalized;
    for (const instance of this.instances) {
      if (instance === source) {
        continue;
      }
      instance.syncPlayerSelection(normalized);
    }
  }

  private handleSearchFilterChanged(sourceWindow: Window, query: string): void {
    const source = this.appsByWindow.get(sourceWindow);
    if (!source) {
      return;
    }
    const normalized = query.trim();
    this.searchFilter = normalized;
    for (const instance of this.instances) {
      if (instance === source) {
        continue;
      }
      instance.syncSearchFilter(normalized);
    }
  }

  registerPopup(popupWindow: Window): void {
    this.pruneClosedWindows();

    if (!popupWindow || popupWindow.closed) {
      return;
    }
    if (this.appsByWindow.has(popupWindow)) {
      return;
    }

    const targetDocument = popupWindow.document;
    try {
      if (targetDocument.body) {
        targetDocument.body.replaceChildren();
      }
    } catch {
      // ignore
    }

    ensureTailwind(targetDocument);

    const uiWindow = popupWindow;
    const app = new SidebarApp(
      this.store,
      {
        enableOverlayAlignment: false,
        onRequestNewWindow: () => this.openAdditionalWindow(),
        onPlayerDetailsSelected: (playerId) =>
          this.handlePlayerDetailsSelected(uiWindow, playerId),
        onSearchFilterChanged: (query) =>
          this.handleSearchFilterChanged(uiWindow, query),
        windowMode: "standalone",
      },
      targetDocument,
      uiWindow,
    );

    this.instances.add(app);
    this.appsByWindow.set(uiWindow, app);
    this.syncAppSelection(app);
  }

  unregisterPopup(popupName: string): void {
    this.pruneClosedWindows();

    const normalized = popupName.trim();
    if (!normalized) {
      return;
    }

    for (const [uiWindow, app] of this.appsByWindow.entries()) {
      if (uiWindow === window) {
        continue;
      }
      if (uiWindow.name === normalized) {
        this.removeInstance(app);
        return;
      }
    }
  }

  openAdditionalWindow(): void {
    const popup = window.open(
      "",
      `datafront-${Date.now()}`,
      "width=460,height=900,resizable=yes,scrollbars=yes",
    );
    if (!popup) {
      alert(
        "Pop-out window was blocked. Please allow pop-ups for this site or keep the sidebar embedded.",
      );
      return;
    }

    this.preparePopupDocument(popup.document);
    this.registerPopup(popup);
  }
}

let windowManager: SidebarWindowManager | null = null;

async function initializeSidebar(): Promise<void> {
  const hostWindow = unsafeWindow ?? window;
  if (hostWindow.dataFront) {
    return;
  }
  ensureTailwind(document);
  windowManager = new SidebarWindowManager();
  const sessionId = createSessionId();
  hostWindow.dataFront = {
    updateData: (snapshot) => windowManager?.updateData(snapshot),
    logger: sidebarLogger,
    sessionId,
    registerPopup: (popupWindow) => windowManager?.registerPopup(popupWindow),
    unregisterPopup: (popupName) => windowManager?.unregisterPopup(popupName),
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => void initializeSidebar());
} else {
  void initializeSidebar();
}

export {};
