export enum AcquisitionTypeEnum {
  DRAFT = "DRAFT",
  ADD = "ADD",
  TRADE = "TRADE",
}

export enum StatsCategories {
  FG = "FG",
  FT = "FT",
  "3PM" = "3PM",
  REB = "REB",
  AST = "AST",
  STL = "STL",
  BLK = "BLK",
  TO = "TO",
  PTS = "PTS",
}

export enum FilterCategories {
  TEAM = "team",
  RATER = "rater",
  SALARY = "salary",
  GAMES = "games",
  PROJECTION = "projection",
}

export enum DetailedStatsCategories {
  FGA = "FGA",
  FGM = "FGM",
  FTA = "FTA",
  FTM = "FTM",
  "3PM" = "3PM",
  REB = "REB",
  AST = "AST",
  STL = "STL",
  BLK = "BLK",
  TO = "TO",
  PTS = "PTS",
}

export type PlayerCategoriesRaters = { [key in StatsCategories]: number };

export type PlayerDetailedStats = { [key in DetailedStatsCategories]: number };

export interface Player {
  id: number;
  fullName: string;
  salary: number;
  keeperHistory: string[];
  previousRater: number;
  currentRater: number;
  injuredSpot: boolean;
  gamesPlayed: number;
  categoriesRaters: PlayerCategoriesRaters;
  previousCategoriesRaters: PlayerCategoriesRaters;
  detailedStats: PlayerDetailedStats;
  hasNotPlayedLastSeason?: boolean;
}

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  roster: Player[];
}

export interface TeamDetailsData {
  team: Team;
  newSalariesByPlayerId: Map<number, number>;
  totals: {
    rater2025: number;
    rater2024: number;
    currentSalary: number;
    projectedSalary: number;
    projectedKeepersSalaries: number;
    stats: PlayerDetailedStats;
  };
}

export interface PlayerRatings {
  totalRating: number;
  statRankings: { forStat: number; rating: number }[];
}

export interface RawPlayerStats {
  "13": number; // FGM
  "14": number; // FGA
  "15": number; // FTM
  "16": number; // FTA
  "26": number; // AST
  "27": number; // BLK
  "29": number; // PTS
  "30": number; // REB
  "31": number; // STL
  "32": number; // TO
  "33": number; // 3PM
  "42": number; // games played
}

export interface RatedRawPlayer {
  id: number;
  keeperValue: number;
  keeperValueFuture: number;
  onteamId: number;
  ratings: {
    "0": PlayerRatings;
  };
  player: {
    fullName: string;
    id: number;
    stats: {
      id: string;
      stats: RawPlayerStats;
    }[];
    injured: boolean;
  };
}

export interface RawPlayer {
  lineupSlotId: number;
  playerId: number;
  acquisitionType: AcquisitionTypeEnum;
  playerPoolEntry: Omit<RatedRawPlayer, "ratings">;
}

export interface RawTeam {
  id: number;
  name: string;
  roster: { entries: RawPlayer[] };
}

export interface UnpickablePlayer {
  name: string;
  id: number;
  outForSeason?: boolean | undefined;
}

export interface SeasonRanking {
  season: number;
  ranking: number;
  teamName: string;
  points: number;
}

export interface HistoryRanking {
  totalPoints: number;
  ownerName: string;
  seasonsRankings: SeasonRanking[];
}

interface FilterMinMax {
  min?: number;
  max?: number;
}
export interface FiltersType {
  team?: string;
  rater?: FilterMinMax;
  salary?: FilterMinMax;
  games?: FilterMinMax;
  projection?: FilterMinMax;
}
