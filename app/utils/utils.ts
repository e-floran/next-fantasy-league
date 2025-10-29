import { Dispatch, SetStateAction } from "react";
import {
  PlayerCategoriesRaters,
  PlayerDetailedStats,
  Team,
  TeamDetailsData,
} from "./types";

export const parseNegativeValue = (value: number, limit?: number): number => {
  const trueLimit = limit ?? 0;
  return value < trueLimit ? trueLimit : value;
};

export const computeNewSalary = (
  salary: number,
  keeperHistory: number,
  omitDelta: boolean,
  raterDelta: number
) => {
  const valueWithKeeps =
    keeperHistory >= 2 ? salary + (keeperHistory - 1) * 5 : salary;
  if (!raterDelta || omitDelta) {
    return valueWithKeeps;
  }
  if (raterDelta < -3) {
    return valueWithKeeps - 5;
  } else if (raterDelta < -2.5) {
    return valueWithKeeps - 4;
  } else if (raterDelta < -2) {
    return valueWithKeeps - 3;
  } else if (raterDelta < -1.5) {
    return valueWithKeeps - 2;
  } else if (raterDelta < -1) {
    return valueWithKeeps - 1;
  } else if (raterDelta < -0.5) {
    return valueWithKeeps;
  } else if (raterDelta < 0.5) {
    return valueWithKeeps + 1;
  } else if (raterDelta < 1.5) {
    return valueWithKeeps + 2;
  } else if (raterDelta < 2) {
    return valueWithKeeps + 3;
  } else if (raterDelta < 3) {
    return valueWithKeeps + 4;
  } else {
    return valueWithKeeps + 5;
  }
};

export const getNewSalariesByPlayerId = (team?: Team) => {
  const salariesMap = new Map<number, number>();
  team?.roster.forEach((player) => {
    salariesMap.set(
      player.id,
      parseNegativeValue(
        computeNewSalary(
          player.salary,
          player.keeperHistory.length,
          player.previousRater === 0,
          player.currentRater - parseNegativeValue(player.previousRater)
        ),
        1
      )
    );
  });
  return salariesMap;
};

const getTeamTotalProjectedSalary = (
  newSalariesByPlayerId: Map<number, number>
) => {
  const salaries: number[] = [];
  newSalariesByPlayerId.forEach((value) => {
    salaries.push(value);
  });
  if (!salaries.length) {
    return 0;
  }
  return salaries.reduce((partialSum, a) => partialSum + a, 0);
};

const getTeamKeepersSalaries = (
  newSalariesByPlayerId: Map<number, number>,
  keepers?: number[]
) => {
  const salaries: number[] = [];
  if (!keepers || keepers.length === 0) {
    return 0;
  }
  keepers.forEach((id) => {
    const value = newSalariesByPlayerId.get(id);
    if (value) {
      salaries.push(value);
    }
  });
  if (salaries.length === 0) {
    return 0;
  }
  return salaries.reduce((partialSum, a) => partialSum + a, 0);
};

export const reduceStats = (stats: PlayerDetailedStats[]) => {
  return stats.reduce(
    (partialSum, a) => {
      return {
        FGA: partialSum.FGA + a.FGA,
        FGM: partialSum.FGM + a.FGM,
        FTA: partialSum.FTA + a.FTA,
        FTM: partialSum.FTM + a.FTM,
        "3PM": partialSum["3PM"] + a["3PM"],
        REB: partialSum.REB + a.REB,
        AST: partialSum.AST + a.AST,
        STL: partialSum.STL + a.STL,
        BLK: partialSum.BLK + a.BLK,
        TO: partialSum.TO + a.TO,
        PTS: partialSum.PTS + a.PTS,
      };
    },
    {
      FGA: 0,
      FGM: 0,
      FTA: 0,
      FTM: 0,
      "3PM": 0,
      REB: 0,
      AST: 0,
      STL: 0,
      BLK: 0,
      TO: 0,
      PTS: 0,
    }
  );
};

export const getTeamTotals = (
  team: Team,
  newSalariesByPlayerId: Map<number, number>,
  keepers: number[]
) => {
  const rater2024 = team.roster
    .map((player) => player.previousRater)
    .reduce((partialSum, a) => partialSum + a, 0);
  const rater2025 = team.roster
    .map((player) => player.currentRater)
    .reduce((partialSum, a) => partialSum + a, 0);
  const currentSalary = team.roster
    .filter((player) => !player.injuredSpot)
    .map((player) => player.salary)
    .reduce((partialSum, a) => partialSum + a, 0);

  const stats: PlayerDetailedStats = reduceStats(
    team.roster.map((player) => player.detailedStats!)
  );

  const projectedSalary = getTeamTotalProjectedSalary(newSalariesByPlayerId);
  const projectedKeepersSalaries = getTeamKeepersSalaries(
    newSalariesByPlayerId,
    keepers
  );

  return {
    rater2025,
    rater2024,
    currentSalary,
    projectedSalary,
    projectedKeepersSalaries,
    stats,
  };
};

export const parseRanking = (ranking: number) => {
  if (ranking < 1) {
    return "erreur";
  } else if (ranking === 1) {
    return "1er";
  } else {
    return `${ranking}e`;
  }
};

export const getTeamStatsAfterTrade = (
  teamStats: PlayerDetailedStats,
  outStats: PlayerDetailedStats,
  inStats: PlayerDetailedStats
): PlayerCategoriesRaters => {
  const fg =
    teamStats.FGM / teamStats.FGA -
    (teamStats.FGM - outStats.FGM + inStats.FGM) /
      (teamStats.FGA - outStats.FGA + inStats.FGA);
  const ft =
    teamStats.FTM / teamStats.FTA -
    (teamStats.FTM - outStats.FTM + inStats.FTM) /
      (teamStats.FTA - outStats.FTA + inStats.FTA);

  return {
    FG: fg,
    FT: ft,
    "3PM": inStats["3PM"] - outStats["3PM"],
    REB: inStats.REB - outStats.REB,
    AST: inStats.AST - outStats.AST,
    STL: inStats.STL - outStats.STL,
    BLK: inStats.BLK - outStats.BLK,
    TO: inStats.TO - outStats.TO,
    PTS: inStats.PTS - outStats.PTS,
  };
};

export const getDataByTeamId = (teams: Team[], selectedKeepers: number[]) => {
  const dataMap = new Map<number, TeamDetailsData>();
  teams.forEach((team) => {
    const newSalariesByPlayerId = getNewSalariesByPlayerId(team);
    const teamData = getTeamTotals(
      team,
      newSalariesByPlayerId,
      selectedKeepers
    );
    dataMap.set(team.id, { newSalariesByPlayerId, totals: teamData, team });
  });
  return dataMap;
};

export const downloadElement = (
  data: unknown,
  fileName: string,
  setIsUpdating?: Dispatch<SetStateAction<boolean>>
) => {
  const element = document.createElement("a");
  const textFile = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });
  element.href = URL.createObjectURL(textFile);
  element.download = fileName + ".json";
  document.body.appendChild(element);
  element.click();
  if (setIsUpdating) {
    setIsUpdating(false);
  }
};
