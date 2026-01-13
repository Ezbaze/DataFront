import type { GameSnapshot, PlayerRecord } from "../../types";
import {
  createElement as createElementBase,
  formatCountdown,
  formatNumber,
  formatTroopCount,
} from "../../utils";
import { createPlayerNameElement } from "./helpers";
import type { ViewRenderOptions } from "./types";
import { computePlayerMetrics, getActiveAlliances } from "./players";
import { isTradeStoppedByOther, isTradeStoppedBySelf } from "../../trade";
import { SidebarRole } from "../../sidebarRoles";

let viewDocument: Document = document;

function withViewDocument<T>(doc: Document, fn: () => T): T {
  const previous = viewDocument;
  viewDocument = doc;
  try {
    return fn();
  } finally {
    viewDocument = previous;
  }
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  textContent?: string,
): HTMLElementTagNameMap[K] {
  return createElementBase(tag, className, textContent, viewDocument);
}

export function renderPlayerPanelView(options: ViewRenderOptions): HTMLElement {
  return withViewDocument(options.ui.document, () => {
    const { leaf, snapshot, existingContainer } = options;
    const containerClass =
      "relative flex-1 overflow-auto border border-slate-900/70 bg-slate-950/60 backdrop-blur-sm";
    const canReuse =
      !!existingContainer &&
      existingContainer.dataset.sidebarRole === SidebarRole.PlayerPanel &&
      existingContainer.dataset.sidebarView === leaf.view;
    const container = canReuse
      ? existingContainer
      : createElement("div", containerClass);
    container.className = containerClass;
    container.dataset.sidebarRole = SidebarRole.PlayerPanel;
    container.dataset.sidebarView = leaf.view;

    const content = createElement(
      "div",
      "flex min-h-full flex-col gap-6 p-4 text-sm text-slate-100",
    );

    const playerId = leaf.selectedPlayerId;
    if (!playerId) {
      content.appendChild(
        createElement(
          "p",
          "text-slate-400 italic",
          "Select a player from any table to view their details.",
        ),
      );
    } else {
      const player = snapshot.players.find((entry) => entry.id === playerId);
      if (!player) {
        content.appendChild(
          createElement(
            "p",
            "text-slate-400 italic",
            "That player is no longer available in the latest snapshot.",
          ),
        );
      } else {
        const header = createElement("div", "space-y-3");
        const title = createElement(
          "div",
          "flex flex-wrap items-baseline justify-between gap-3",
        );
        const name = createPlayerNameElement(player.name, player.position, {
          asBlock: true,
          className:
            "text-lg font-semibold text-slate-100 transition-colors hover:text-sky-200",
          document: viewDocument,
        });
        title.appendChild(name);

        const meta = [player.clan, player.team].filter(Boolean).join(" • ");
        if (meta) {
          title.appendChild(
            createElement(
              "div",
              "text-xs uppercase tracking-wide text-slate-400",
              meta,
            ),
          );
        }
        header.appendChild(title);

        const summary = createElement(
          "div",
          "grid gap-3 sm:grid-cols-3 text-[0.75rem]",
        );
        summary.appendChild(
          createSummaryStat("Tiles", formatNumber(player.tiles)),
        );
        summary.appendChild(
          createSummaryStat("Gold", formatNumber(player.gold)),
        );
        summary.appendChild(
          createSummaryStat("Troops", formatTroopCount(player.troops)),
        );
        header.appendChild(summary);

        const playerStoppedBySelf = isTradeStoppedBySelf(player);
        const playerStoppedByOther = isTradeStoppedByOther(player);
        if (playerStoppedBySelf || playerStoppedByOther) {
          let tradeMessage = "Trading is currently stopped with this player.";
          if (playerStoppedBySelf && playerStoppedByOther) {
            tradeMessage =
              "Trading is currently stopped by both you and this player.";
          } else if (playerStoppedBySelf) {
            tradeMessage = "You have stopped trading with this player.";
          } else {
            tradeMessage = "This player has stopped trading with you.";
          }
          header.appendChild(
            createElement(
              "p",
              "text-[0.7rem] font-semibold uppercase tracking-wide text-amber-300",
              tradeMessage,
            ),
          );
        }

        content.appendChild(header);
        content.appendChild(renderPlayerDetails(player, snapshot));
      }
    }

    container.replaceChildren(content);
    return container;
  });
}

function renderPlayerDetails(
  player: PlayerRecord,
  snapshot: GameSnapshot,
): HTMLElement {
  const wrapper = createElement(
    "div",
    "space-y-4 text-[0.75rem] text-slate-100",
  );

  const metrics = computePlayerMetrics(player, snapshot);
  const badgeRow = createElement("div", "flex flex-wrap gap-2");
  badgeRow.appendChild(createBadge("⚠️ Incoming", metrics.incoming));
  badgeRow.appendChild(createBadge("⚔️ Outgoing", metrics.outgoing));
  badgeRow.appendChild(createBadge("🌱 Expanding", metrics.expanding));
  badgeRow.appendChild(createBadge("🤝 Alliances", metrics.alliances));
  badgeRow.appendChild(createBadge("📡 Disconnected", metrics.disconnected));
  badgeRow.appendChild(createBadge("🕱 Traitor", metrics.traitor));
  badgeRow.appendChild(createBadge("⏳ Waiting", metrics.waiting));
  badgeRow.appendChild(createBadge("☠️ Eliminated", metrics.eliminated));
  badgeRow.appendChild(
    createBadge("🛡️ Stable", metrics.stable, metrics.stable > 0),
  );
  wrapper.appendChild(badgeRow);

  const grid = createElement("div", "grid gap-4 md:grid-cols-2");
  grid.appendChild(
    createDetailSection(
      "Incoming attacks",
      player.incomingAttacks,
      (attack) => `${attack.from} – ${formatTroopCount(attack.troops)} troops`,
    ),
  );
  grid.appendChild(
    createDetailSection(
      "Outgoing attacks",
      player.outgoingAttacks,
      (attack) =>
        `${attack.target} – ${formatTroopCount(attack.troops)} troops`,
    ),
  );
  grid.appendChild(
    createDetailSection(
      "Defensive supports",
      player.defensiveSupports,
      (support) =>
        `${support.ally} – ${formatTroopCount(support.troops)} troops`,
    ),
  );

  const activeAlliances = getActiveAlliances(player, snapshot);
  grid.appendChild(
    createDetailSection("Alliances", activeAlliances, (pact) => {
      const expiresAt = pact.startedAtMs + snapshot.allianceDurationMs;
      const countdown = formatCountdown(expiresAt, snapshot.currentTimeMs);
      return `${pact.partner} – expires in ${countdown}`;
    }),
  );

  if (player.traitor || player.traitorTargets.length) {
    grid.appendChild(
      createDetailSection(
        "Traitor activity",
        player.traitorTargets,
        (target) => `Betrayed ${target}`,
      ),
    );
  }

  wrapper.appendChild(grid);
  return wrapper;
}

function createDetailSection<T>(
  title: string,
  entries: T[],
  toLabel: (entry: T) => string,
): HTMLElement {
  const section = createElement("section", "space-y-2");
  const heading = createElement(
    "h4",
    "font-semibold uppercase text-slate-300 tracking-wide text-[0.7rem]",
    title,
  );
  section.appendChild(heading);
  if (!entries.length) {
    section.appendChild(
      createElement("p", "text-slate-500 italic", "No records."),
    );
    return section;
  }
  const list = createElement("ul", "space-y-2");
  for (const entry of entries) {
    const item = createElement(
      "li",
      "rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2",
    );
    item.appendChild(
      createElement("div", "font-medium text-slate-200", toLabel(entry)),
    );
    list.appendChild(item);
  }
  section.appendChild(list);
  return section;
}

function createBadge(
  label: string,
  value: number,
  highlight = value > 0,
): HTMLElement {
  const badge = createElement(
    "span",
    `inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.65rem] font-semibold ${
      highlight
        ? "bg-sky-500/20 text-sky-200 border border-sky-500/40"
        : "bg-slate-800/80 text-slate-300"
    }`,
  );
  const [emoji, ...rest] = label.split(" ");
  const emojiSpan = createElement("span", "text-base");
  emojiSpan.textContent = emoji;
  badge.appendChild(emojiSpan);
  badge.appendChild(createElement("span", "", rest.join(" ")));
  badge.appendChild(
    createElement("span", "font-mono text-[0.7rem]", String(value)),
  );
  return badge;
}

function createSummaryStat(label: string, value: string): HTMLElement {
  const wrapper = createElement(
    "div",
    "rounded-md border border-slate-800/70 bg-slate-900/70 px-3 py-2",
  );
  const title = createElement(
    "div",
    "text-[0.65rem] uppercase tracking-wide text-slate-400",
    label,
  );
  const content = createElement(
    "div",
    "font-mono text-base text-slate-100",
    value,
  );
  wrapper.appendChild(title);
  wrapper.appendChild(content);
  return wrapper;
}
