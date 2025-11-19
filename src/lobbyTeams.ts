import { LobbyTeamCountConfig } from "./types";
import { extractClanTag } from "./utils";

const TEAM_COLOR_SEQUENCE = [
  "Red",
  "Blue",
  "Yellow",
  "Green",
  "Purple",
  "Orange",
  "Teal",
] as const;

const TEAM_CONFIG_DUOS = "Duos";
const TEAM_CONFIG_TRIOS = "Trios";
const TEAM_CONFIG_QUADS = "Quads";
const TEAM_CONFIG_HUMANS_VS_NATIONS = "Humans Vs Nations";

export const LOBBY_TEAM_KICKED = "kicked";

interface LobbyPlayerSeed {
  id: string;
  name: string;
}

interface NormalizedPlayer extends LobbyPlayerSeed {
  clan?: string;
}

export interface LobbyTeamPredictionOptions {
  modeName?: string;
  playerTeams?: LobbyTeamCountConfig;
  /**
   * When provided, use this capacity to derive the concrete number of teams
   * for Duos/Trios/Quads instead of the current queue size. This mirrors how
   * the game resolves team presets against the participant count at start.
   */
  maxPlayers?: number;
}

export function predictLobbyTeams(
  players: LobbyPlayerSeed[],
  options: LobbyTeamPredictionOptions,
): Map<string, string> {
  if (!players.length) {
    return new Map();
  }

  const { playerTeams } = options;
  if (!playerTeams) {
    return new Map();
  }

  if (playerTeams === TEAM_CONFIG_HUMANS_VS_NATIONS) {
    return new Map();
  }

  const configuredMaxPlayers =
    typeof options.maxPlayers === "number" &&
    Number.isFinite(options.maxPlayers)
      ? options.maxPlayers
      : null;
  const playerCountForTeams =
    configuredMaxPlayers && configuredMaxPlayers > 0
      ? Math.max(players.length, configuredMaxPlayers)
      : players.length;

  const teamLabels = buildTeamLabels(playerTeams, playerCountForTeams);
  if (teamLabels.length < 2) {
    return new Map();
  }

  const normalizedPlayers: NormalizedPlayer[] = players.map((player) => ({
    ...player,
    clan: extractClanTag(player.name) ?? undefined,
  }));

  const assignments = assignTeams(
    normalizedPlayers,
    teamLabels,
    playerCountForTeams,
  );
  return assignments;
}

function buildTeamLabels(
  config: LobbyTeamCountConfig,
  expectedPlayers: number,
): string[] {
  let teamCount: number | null = null;
  if (typeof config === "number") {
    teamCount = Number.isFinite(config) ? config : null;
  } else {
    switch (config) {
      case TEAM_CONFIG_DUOS:
        teamCount = Math.ceil(expectedPlayers / 2);
        break;
      case TEAM_CONFIG_TRIOS:
        teamCount = Math.ceil(expectedPlayers / 3);
        break;
      case TEAM_CONFIG_QUADS:
        teamCount = Math.ceil(expectedPlayers / 4);
        break;
      default:
        teamCount = null;
        break;
    }
  }

  if (teamCount === null || !Number.isFinite(teamCount) || teamCount < 2) {
    return [];
  }

  if (teamCount < TEAM_COLOR_SEQUENCE.length + 1) {
    return TEAM_COLOR_SEQUENCE.slice(0, teamCount);
  }

  return Array.from({ length: teamCount }, (_, index) => `Team ${index + 1}`);
}

function assignTeams(
  players: NormalizedPlayer[],
  teams: string[],
  playerCount: number,
): Map<string, string> {
  const result = new Map<string, string>();
  const teamPlayerCount = new Map<string, number>();
  const clanGroups = new Map<string, NormalizedPlayer[]>();
  const unclanned: NormalizedPlayer[] = [];

  for (const player of players) {
    if (player.clan) {
      const clanKey = player.clan;
      if (!clanGroups.has(clanKey)) {
        clanGroups.set(clanKey, []);
      }
      clanGroups.get(clanKey)!.push(player);
    } else {
      unclanned.push(player);
    }
  }

  const maxTeamSize = Math.ceil(playerCount / teams.length);
  if (!Number.isFinite(maxTeamSize) || maxTeamSize <= 0) {
    return result;
  }

  const sortedClans = Array.from(clanGroups.values()).sort(
    (a, b) => b.length - a.length,
  );
  for (const clanPlayers of sortedClans) {
    const assignment = pickTeam(teams, teamPlayerCount);
    if (!assignment) {
      break;
    }
    const { team } = assignment;
    let { size } = assignment;
    for (const player of clanPlayers) {
      if (size < maxTeamSize) {
        result.set(player.id, team);
        size += 1;
      } else {
        result.set(player.id, LOBBY_TEAM_KICKED);
      }
    }
    teamPlayerCount.set(team, size);
  }

  for (const player of unclanned) {
    const assignment = pickTeam(teams, teamPlayerCount);
    if (!assignment) {
      break;
    }
    const { team, size } = assignment;
    if (size >= maxTeamSize) {
      continue;
    }
    teamPlayerCount.set(team, size + 1);
    result.set(player.id, team);
  }

  return result;
}

function pickTeam(
  teams: string[],
  teamPlayerCount: Map<string, number>,
): { team: string; size: number } | null {
  let chosenTeam: string | null = null;
  let chosenSize = 0;
  for (const team of teams) {
    const currentSize = teamPlayerCount.get(team) ?? 0;
    if (chosenTeam !== null && chosenSize <= currentSize) {
      continue;
    }
    chosenTeam = team;
    chosenSize = currentSize;
  }
  if (chosenTeam === null) {
    return null;
  }
  return { team: chosenTeam, size: chosenSize };
}
