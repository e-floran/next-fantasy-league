import {
  AcquisitionTypeEnum,
  DetailedStatsCategories,
  HistoryRanking,
  Player,
  PlayerCategoriesRaters,
  PlayerDetailedStats,
  PlayerRatings,
  RawPlayerStats,
  RatedRawPlayer,
  RawPlayer,
  RawTeam,
  StatsCategories,
  Team,
  UnpickablePlayer,
} from "./types";
import historyData from "../assets/history/history.json";

const RaterCategories = new Map([
  [19, StatsCategories.FG],
  [20, StatsCategories.FT],
  [17, StatsCategories["3PM"]],
  [6, StatsCategories.REB],
  [3, StatsCategories.AST],
  [2, StatsCategories.STL],
  [1, StatsCategories.BLK],
  [11, StatsCategories.TO],
  [0, StatsCategories.PTS],
]);

const basePlayerRaters: PlayerCategoriesRaters = {
  [StatsCategories.FG]: 0,
  [StatsCategories.FT]: 0,
  [StatsCategories["3PM"]]: 0,
  [StatsCategories.REB]: 0,
  [StatsCategories.AST]: 0,
  [StatsCategories.STL]: 0,
  [StatsCategories.BLK]: 0,
  [StatsCategories.TO]: 0,
  [StatsCategories.PTS]: 0,
};

const RawStatsCategories = new Map([
  ["13", DetailedStatsCategories.FGM],
  ["14", DetailedStatsCategories.FGA],
  ["15", DetailedStatsCategories.FTM],
  ["16", DetailedStatsCategories.FTA],
  ["33", DetailedStatsCategories["3PM"]],
  ["30", DetailedStatsCategories.REB],
  ["26", DetailedStatsCategories.AST],
  ["31", DetailedStatsCategories.STL],
  ["27", DetailedStatsCategories.BLK],
  ["32", DetailedStatsCategories.TO],
  ["29", DetailedStatsCategories.PTS],
]);
const rawStatsKeys = [
  "13",
  "14",
  "15",
  "16",
  "26",
  "27",
  "29",
  "30",
  "31",
  "32",
  "33",
];

const basePlayerStats: PlayerDetailedStats = {
  [DetailedStatsCategories.FGA]: 0,
  [DetailedStatsCategories.FGM]: 0,
  [DetailedStatsCategories.FTM]: 0,
  [DetailedStatsCategories.FTA]: 0,
  [DetailedStatsCategories["3PM"]]: 0,
  [DetailedStatsCategories.REB]: 0,
  [DetailedStatsCategories.AST]: 0,
  [DetailedStatsCategories.STL]: 0,
  [DetailedStatsCategories.BLK]: 0,
  [DetailedStatsCategories.TO]: 0,
  [DetailedStatsCategories.PTS]: 0,
};

const filterPlayerKeys = (rawPlayer: RawPlayer): Player => {
  return {
    id: rawPlayer.playerId,
    fullName: rawPlayer.playerPoolEntry.player.fullName,
    keeperHistory: [],
    salary: rawPlayer.playerPoolEntry.keeperValueFuture,
    previousRater: 0,
    currentRater: 0,
    gamesPlayed: 0,
    injuredSpot: rawPlayer.lineupSlotId === 13,
    categoriesRaters: basePlayerRaters,
    previousCategoriesRaters: basePlayerRaters,
    detailedStats: basePlayerStats,
  };
};

const buildPlayerRaters = (
  rawRater: PlayerRatings | undefined
): PlayerCategoriesRaters => {
  const output = basePlayerRaters;
  if (rawRater) {
    rawRater.statRankings.forEach((value) => {
      const key = RaterCategories.get(value.forStat);
      if (key) {
        output[key] = value.rating;
      }
    });
  }
  return { ...output };
};

const buildPlayerStats = (
  rawStats: RawPlayerStats | undefined
): PlayerDetailedStats => {
  const output = basePlayerStats;
  if (rawStats) {
    for (const [key, value] of Object.entries(rawStats)) {
      if (rawStatsKeys.includes(key)) {
        const parsedKey = RawStatsCategories.get(key);
        if (parsedKey) {
          output[parsedKey] = value;
        }
      }
    }
  }
  return { ...output };
};

const addFreeAgent = (
  newPlayer: RawPlayer,
  lastSeasonRaters: RatedRawPlayer[],
  rosterToBuild: Player[],
  currentRater: PlayerRatings | undefined,
  gamesPlayed: number,
  rawStats: RawPlayerStats | undefined
) => {
  const parsedPlayer = filterPlayerKeys(newPlayer);
  const previousRaters = lastSeasonRaters.find(
    (ratedPlayer) => ratedPlayer.id === parsedPlayer.id
  )?.ratings["0"];
  parsedPlayer.previousRater = previousRaters ? previousRaters.totalRating : 0;
  parsedPlayer.currentRater = currentRater?.totalRating ?? 0;
  parsedPlayer.gamesPlayed = gamesPlayed;
  parsedPlayer.categoriesRaters = buildPlayerRaters(currentRater);
  parsedPlayer.previousCategoriesRaters = buildPlayerRaters(previousRaters);
  parsedPlayer.detailedStats = buildPlayerStats(rawStats);
  rosterToBuild.push(parsedPlayer);
};

const initPlayersMap = (
  playersByPlayerId: Map<number, Player>,
  previousRosters: Team[]
) => {
  previousRosters.forEach((team) => {
    team.roster.forEach((player) => {
      playersByPlayerId.set(player.id, player);
    });
  });
};

const addTradedPlayer = (
  newPlayer: RawPlayer,
  playersByPlayerId: Map<number, Player>,
  previousRosters: Team[],
  rosterToBuild: Player[],
  lastSeasonRaters: RatedRawPlayer[],
  currentRater: PlayerRatings | undefined,
  gamesPlayed: number,
  rawStats: RawPlayerStats | undefined
) => {
  if (playersByPlayerId.size === 0) {
    initPlayersMap(playersByPlayerId, previousRosters);
  }
  const playerToAdd = playersByPlayerId.get(newPlayer.playerId);
  if (!playerToAdd) {
    addFreeAgent(
      newPlayer,
      lastSeasonRaters,
      rosterToBuild,
      currentRater,
      gamesPlayed,
      rawStats
    );
    return;
  }
  rosterToBuild.push({
    ...playerToAdd,
    injuredSpot: newPlayer.lineupSlotId === 13,
    currentRater: currentRater?.totalRating ?? 0,
    gamesPlayed,
    categoriesRaters: buildPlayerRaters(currentRater),
    detailedStats: buildPlayerStats(rawStats),
  });
};

export const addNewPlayers = (
  previousRosters: Team[],
  newRosters: RawTeam[],
  lastSeasonRaters: RatedRawPlayer[],
  currentRaters: RatedRawPlayer[]
): Team[] => {
  console.log(
    `🔄 Processing ${newRosters.length} new rosters against ${previousRosters.length} previous rosters`
  );
  const outputRosters: Team[] = [];

  const playersByPlayerId: Map<number, Player> = new Map();

  newRosters.forEach((newTeam) => {
    console.log(`🏀 Processing team ${newTeam.id}:`, {
      hasRoster: !!newTeam.roster,
      hasEntries: !!newTeam.roster?.entries,
      entriesLength: newTeam.roster?.entries?.length || 0,
    });

    const newRoster = newTeam.roster.entries;
    const oldTeam: Team | undefined = previousRosters.find(
      (team) => team.id === newTeam.id
    );
    if (!oldTeam) {
      console.warn(`⚠️ No matching previous team found for team ${newTeam.id}`);
      return;
    }

    console.log(`📊 Team ${newTeam.id} (${oldTeam.name}):`, {
      newRosterSize: newRoster?.length || 0,
      oldRosterSize: oldTeam.roster?.length || 0,
      oldTeamPlayers:
        oldTeam.roster?.map((p) => ({ id: p.id, name: p.fullName })) || [],
    });

    const rosterToBuild: Player[] = [];

    newRoster.forEach((newPlayer) => {
      console.log(`👤 Processing player ${newPlayer.playerId}:`, {
        fullName: newPlayer.playerPoolEntry?.player?.fullName,
        acquisitionType: newPlayer.acquisitionType,
        isInOldTeam: oldTeam.roster.some(
          (oldPlayer) => oldPlayer.id === newPlayer.playerId
        ),
      });

      const currentRater = currentRaters.find(
        (ratedPlayer) => ratedPlayer.id === newPlayer.playerId
      );

      const gamesPlayed =
        newPlayer.playerPoolEntry.player.stats.find(
          (statsEntry) => statsEntry.id === "002025"
        )?.stats[42] ?? 0;
      const rawStats = newPlayer.playerPoolEntry.player.stats.find(
        (statsEntry) => statsEntry.id === "002025"
      )?.stats;

      const isPlayerInOldTeam = oldTeam.roster.some(
        (oldPlayer) => oldPlayer.id === newPlayer.playerId
      );

      if (!isPlayerInOldTeam) {
        console.log(
          `🆕 New player ${newPlayer.playerId} (${newPlayer.playerPoolEntry?.player?.fullName}) - acquisition type: ${newPlayer.acquisitionType}`
        );

        if (newPlayer.acquisitionType === AcquisitionTypeEnum.ADD) {
          console.log(
            `➕ Adding as free agent: ${newPlayer.playerPoolEntry?.player?.fullName}`
          );
          addFreeAgent(
            newPlayer,
            lastSeasonRaters,
            rosterToBuild,
            currentRater?.ratings[0],
            gamesPlayed,
            rawStats
          );
        } else if (newPlayer.acquisitionType === AcquisitionTypeEnum.TRADE) {
          console.log(
            `↔️ Adding as traded player: ${newPlayer.playerPoolEntry?.player?.fullName}`
          );
          addTradedPlayer(
            newPlayer,
            playersByPlayerId,
            previousRosters,
            rosterToBuild,
            lastSeasonRaters,
            currentRater?.ratings[0],
            gamesPlayed,
            rawStats
          );
        } else if (newPlayer.acquisitionType === AcquisitionTypeEnum.DRAFT) {
          console.log(
            `🎯 Adding drafted player: ${newPlayer.playerPoolEntry?.player?.fullName}`
          );
          addFreeAgent(
            newPlayer,
            lastSeasonRaters,
            rosterToBuild,
            currentRater?.ratings[0],
            gamesPlayed,
            rawStats
          );
        } else {
          console.log(
            `❓ Unknown acquisition type for ${newPlayer.playerPoolEntry?.player?.fullName}: ${newPlayer.acquisitionType}`
          );
        }
      } else {
        console.log(
          `♻️ Existing keeper: ${newPlayer.playerPoolEntry?.player?.fullName}`
        );
        const previousPlayer = oldTeam.roster.find(
          (oldPlayer) => oldPlayer.id === newPlayer.playerId
        );
        if (previousPlayer) {
          const previousRaters = lastSeasonRaters.find(
            (ratedPlayer) => ratedPlayer.id === previousPlayer.id
          )?.ratings["0"];
          rosterToBuild.push({
            ...previousPlayer,
            injuredSpot: newPlayer.lineupSlotId === 13,
            currentRater: currentRater?.ratings[0].totalRating ?? 0,
            gamesPlayed,
            categoriesRaters: buildPlayerRaters(currentRater?.ratings[0]),
            previousCategoriesRaters: buildPlayerRaters(previousRaters),
            detailedStats: buildPlayerStats(rawStats),
          });
        }
      }
    });
    console.log(
      `✅ Team ${newTeam.id} final roster: ${rosterToBuild.length} players`
    );
    outputRosters.push({ ...oldTeam, roster: rosterToBuild });
  });

  console.log(`🎯 Final output: ${outputRosters.length} teams processed`);
  return outputRosters.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
};

export const checkUnpickablePlayersStatus = async (
  players: UnpickablePlayer[]
) => {
  console.log(`🏥 Checking status of ${players.length} unpickable players...`);
  let outputPlayers = [...players];
  const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/2025/segments/0/leagues/3409?scoringPeriodId=12&view=kona_playercard`;

  for (const player of outputPlayers) {
    if (player.outForSeason) {
      console.log(`⏭️ Skipping ${player.name} (out for season)`);
      continue;
    }

    console.log(
      `🔍 Checking injury status for ${player.name} (ID: ${player.id})`
    );
    const checkStartTime = Date.now();

    const ratersHeaders = {
      "X-Fantasy-Filter": {
        players: {
          filterIds: { value: [player.id] },
          filterStatsForTopScoringPeriodIds: {
            value: 82,
            additionalValue: [
              "002025",
              "102025",
              "002024",
              "012025",
              "022025",
              "032025",
              "042025",
            ],
          },
        },
      },
    };
    const req = new Request(url);
    req.headers.set(
      "X-Fantasy-Filter",
      JSON.stringify(ratersHeaders["X-Fantasy-Filter"])
    );

    await fetch(req)
      .then((response) => {
        console.log(
          `✅ Player ${player.name} response (${
            Date.now() - checkStartTime
          }ms):`,
          response.status,
          response.statusText
        );
        return response.json();
      })
      .then((json: { players: RatedRawPlayer[] }) => {
        if (!json.players[0].player.injured) {
          console.log(
            `🎉 ${player.name} is no longer injured - removing from unpickable list`
          );
          outputPlayers = outputPlayers.filter(
            (injuredPlayer) => injuredPlayer.id !== player.id
          );
        } else {
          console.log(`🏥 ${player.name} is still injured`);
        }
      })
      .catch((error) => {
        console.error(`❌ Failed to check ${player.name}:`, error);
        console.error("🔍 Error details:", {
          message: error.message,
          stack: error.stack,
          playerId: player.id,
          playerName: player.name,
        });
      });
  }

  console.log(
    `✅ Unpickable players check completed - ${outputPlayers.length} players remaining`
  );
  return outputPlayers.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
};

const buildSeasonRankingPoint = (ranking: number) => {
  let rankingPoints = 15 - ranking;
  if (ranking < 4) {
    rankingPoints += 3;
  }
  if (ranking === 1) {
    rankingPoints += 5;
  }
  return rankingPoints;
};

const historyUsersMap = new Map([
  ["{D4FECFB1-F07A-4F75-BECF-B1F07A3F7549}", "Captain Teemo"],
  ["{5C013B45-8513-47C4-81B5-26066376781B}", "BK"],
  ["{04294649-19F7-4D19-BADC-920F4DF3C3B5}", "RBC"],
  ["{30DF025F-A7EE-43D4-9F02-5FA7EED3D475}", "Jumping Othello"],
  ["{24C076F8-363B-45DF-8076-F8363B85DF78}", "Piebar"],
  ["{EC71D7EF-A963-4FEB-982D-792C3546A88C}", "PacificBeardMan"],
  ["{38F0AA49-CFB8-4C73-B0AA-49CFB8DC733F}", "gpolin"],
  ["{3BA10345-1472-40B5-A103-45147230B51F}", "Nemausus"],
  ["{9E7C628C-D9AE-4B1D-BC62-8CD9AEBB1D6A}", "Hans Gruber"],
  ["{7CF55C66-844A-4428-B55C-66844A542839}", "Power RennesGers"],
  ["{5D7F50B5-D1B9-4E2E-BF50-B5D1B9EE2E52}", "Kevince Carter"],
  ["{6A45E5C1-C0CA-4105-BBF2-C62A10D33D3D}", "Recto"],
  ["{4694F412-284D-44D1-B6BB-3BF0660197DB}", "Laow"],
  ["{1961241D-50EC-464F-A124-1D50EC864F65}", "Gotham Ballers"],
  ["{4C49A5AB-4A6E-47BC-AFD2-627657AE2BF3}", "Lagiggz"],
  ["{E2E54577-06C7-4092-8049-DE0F0FFA8151}", "Yohann"],
  ["{C64D0C89-0439-4251-BADE-811DEA058414}", "Slamdunk"],
  ["{F68FE751-C8C6-4B24-B062-8AE15738F52E}", "Taggart BC"],
  ["{474A5D21-8C15-4640-9860-3934F2E7DD76}", "Toronto Dutchie"],
  ["{27C3600E-723C-495F-8360-0E723C695F07}", "Buster Keaton"],
  ["{FA794109-3032-415A-91F9-7ADD0680175A}", "Makun"],
  ["{90996E98-4623-4E68-9AFE-EE2CDB96841E}", "OJ Mayo"],
  ["{DF803A2C-833A-4749-B635-0FAFDEC2AB79}", "Straka"],
  ["{C8B88300-53A5-4E37-B01C-0A4953EA5852}", "Evgeni Flowsky"],
  ["{B20FF95F-6C77-465C-801E-948B93D5DD53}", "Alcuin"],
  ["{1AD77E1C-58E5-42B1-9B82-A909162D7193}", "Real Mateus"],
  ["{7DB34B70-7989-4236-BB39-17513B492270}", "Phoenix"],
  ["{479E4B9D-C9CC-4E83-882D-40FB9C400D85}", "Eagle Warriors"],
  ["{06BBF389-1B6C-44FD-99D5-53B74C478194}", "Dkeuss"],
  ["{B9BDB736-3D7C-47F7-B833-075FCBE7FA08}", "Coyen"],
  ["{4F6331EB-6FAE-4C6C-9C41-BD3E20AE5F74}", "Barbenoir"],
  ["{759DE964-CA02-4EE7-ACFD-62EE77A059B1}", "Grand Tatou"],
]);

export const buildHistoryMap = () => {
  const historyByOwnerId = new Map<string, HistoryRanking>();
  historyData.forEach((season) => {
    season.teams.forEach((team) => {
      team.owners.forEach((owner) => {
        if (historyUsersMap.has(owner)) {
          let data = historyByOwnerId.get(owner);
          const seasonPoints = buildSeasonRankingPoint(
            team.rankCalculatedFinal
          );
          if (data) {
            data.seasonsRankings.push({
              season: season.seasonId,
              ranking: team.rankCalculatedFinal,
              teamName: team.name,
              points: seasonPoints,
            });
            data.totalPoints += seasonPoints;
          } else {
            data = {
              ownerName: historyUsersMap.get(owner) ?? "",
              totalPoints: seasonPoints,
              seasonsRankings: [
                {
                  season: season.seasonId,
                  ranking: team.rankCalculatedFinal,
                  teamName: team.name,
                  points: buildSeasonRankingPoint(team.rankCalculatedFinal),
                },
              ],
            };
          }
          historyByOwnerId.set(owner, data);
        }
      });
    });
  });
  return historyByOwnerId;
};
