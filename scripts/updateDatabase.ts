/* eslint-disable @typescript-eslint/no-explicit-any */
// import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
// import * as path from "path";

// config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

import { addNewPlayers, checkUnpickablePlayersStatus } from "../app/utils/data";
import {
  RatedRawPlayer,
  RawTeam,
  Team,
  UnpickablePlayer,
} from "../app/utils/types";

const LEAGUE_ID = 3409;
const CURRENT_SEASON = 2026;
const LAST_SEASON = CURRENT_SEASON - 1;

async function fetchFromDatabase(): Promise<{
  teams: Team[];
  unpickablePlayers: UnpickablePlayer[];
}> {
  console.log("📥 Fetching current data from database...");

  // Fetch teams
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .order("id");

  if (teamsError) throw teamsError;
  console.log(`✅ Fetched ${teamsData.length} teams`);

  // Fetch all players with relations
  const { data: playersData, error: playersError } = await supabase.from(
    "players"
  ).select(`
      *,
      keeper_history (season),
      player_stats (*),
      player_raters (*)
    `);

  if (playersError) throw playersError;
  console.log(`✅ Fetched ${playersData.length} players`);

  // Transform to Team[] format
  const teams: Team[] = teamsData.map((team) => {
    const teamPlayers = playersData
      .filter((p) => p.team_id === team.id)
      .map(transformPlayerFromDb);

    return {
      id: team.id,
      name: team.name,
      abbreviation: team.abbreviation,
      roster: teamPlayers,
    };
  });

  const unpickablePlayers: UnpickablePlayer[] = playersData
    .filter((p) => p.is_unpickable)
    .map((p) => ({
      id: p.id,
      name: p.full_name,
      outForSeason: false, // This info needs to be fetched from ESPN
    }));

  console.log(
    `📊 Loaded ${teams.length} teams and ${unpickablePlayers.length} unpickable players`
  );
  return { teams, unpickablePlayers };
}

function transformPlayerFromDb(dbPlayer: any) {
  const currentRater = dbPlayer.player_raters?.find(
    (r: any) => r.season === CURRENT_SEASON.toString()
  );
  const previousRater = dbPlayer.player_raters?.find(
    (r: any) => r.season === LAST_SEASON.toString()
  );
  const stats = dbPlayer.player_stats?.[0];

  return {
    id: dbPlayer.id,
    fullName: dbPlayer.full_name,
    salary: dbPlayer.salary,
    keeperHistory: dbPlayer.keeper_history?.map((kh: any) => kh.season) || [],
    gamesPlayed: dbPlayer.games_played,
    previousRater: previousRater?.total_rater || 0,
    currentRater: currentRater?.total_rater || 0,
    injuredSpot: dbPlayer.injured_spot,
    hasNotPlayedLastSeason: dbPlayer.has_not_played_last_season,
    categoriesRaters: {
      FG: currentRater?.fg_rater || 0,
      FT: currentRater?.ft_rater || 0,
      "3PM": currentRater?.three_pm_rater || 0,
      REB: currentRater?.reb_rater || 0,
      AST: currentRater?.ast_rater || 0,
      STL: currentRater?.stl_rater || 0,
      BLK: currentRater?.blk_rater || 0,
      TO: currentRater?.to_rater || 0,
      PTS: currentRater?.pts_rater || 0,
    },
    previousCategoriesRaters: {
      FG: previousRater?.fg_rater || 0,
      FT: previousRater?.ft_rater || 0,
      "3PM": previousRater?.three_pm_rater || 0,
      REB: previousRater?.reb_rater || 0,
      AST: previousRater?.ast_rater || 0,
      STL: previousRater?.stl_rater || 0,
      BLK: previousRater?.blk_rater || 0,
      TO: previousRater?.to_rater || 0,
      PTS: previousRater?.pts_rater || 0,
    },
    detailedStats: {
      FGA: stats?.fga || 0,
      FGM: stats?.fgm || 0,
      FTM: stats?.ftm || 0,
      FTA: stats?.fta || 0,
      "3PM": stats?.three_pm || 0,
      REB: stats?.reb || 0,
      AST: stats?.ast || 0,
      STL: stats?.stl || 0,
      BLK: stats?.blk || 0,
      TO: stats?.turnovers || 0,
      PTS: stats?.pts || 0,
    },
  };
}

async function fetchFromESPN() {
  console.log("🏀 Fetching data from ESPN API...");

  const ratersUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${CURRENT_SEASON}/segments/0/leagues/${LEAGUE_ID}?scoringPeriodId=12&view=kona_player_info`;
  const rostersUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${CURRENT_SEASON}/segments/0/leagues/${LEAGUE_ID}?view=mRoster&view=mTeam`;

  const ratersHeaders = {
    "X-Fantasy-Filter": {
      players: {
        filterSlotIds: { value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
        limit: 750,
        offset: 0,
        sortRating: {
          additionalValue: null,
          sortAsc: false,
          sortPriority: 1,
          value: 0,
        },
        filterRanksForScoringPeriodIds: { value: [7] },
        filterRanksForRankTypes: { value: ["STANDARD"] },
        filterStatsForTopScoringPeriodIds: {
          value: 5,
          additionalValue: [
            `00${CURRENT_SEASON}`,
            `10${CURRENT_SEASON}`,
            `00${LAST_SEASON}`,
            `01${CURRENT_SEASON}`,
            `02${CURRENT_SEASON}`,
            `03${CURRENT_SEASON}`,
            `04${CURRENT_SEASON}`,
          ],
        },
      },
    },
  };

  const ratersReq = new Request(ratersUrl);
  ratersReq.headers.set(
    "X-Fantasy-Filter",
    JSON.stringify(ratersHeaders["X-Fantasy-Filter"])
  );

  const [ratersResponse, rostersResponse] = await Promise.all([
    fetch(ratersReq),
    fetch(rostersUrl),
  ]);

  const ratersJson = await ratersResponse.json();
  const rostersJson = await rostersResponse.json();

  console.log(`✅ Fetched ${ratersJson.players?.length || 0} player ratings`);
  console.log(`✅ Fetched ${rostersJson.teams?.length || 0} team rosters`);

  return {
    currentRaters: ratersJson.players as RatedRawPlayer[],
    lastSeasonRaters: ratersJson.players as RatedRawPlayer[],
    newRosters: rostersJson.teams as RawTeam[],
  };
}

async function updateDatabase(
  updatedTeams: Team[],
  updatedUnpickables: UnpickablePlayer[]
) {
  console.log("💾 Updating database...");

  for (const team of updatedTeams) {
    console.log(`📝 Updating team ${team.id} (${team.name})...`);

    for (const player of team.roster) {
      console.log(`  👤 Updating player ${player.id} (${player.fullName})...`);

      // Update player basic info
      const { error: playerError } = await supabase.from("players").upsert(
        {
          id: player.id,
          team_id: team.id,
          full_name: player.fullName,
          salary: player.salary,
          games_played: player.gamesPlayed,
          injured_spot: player.injuredSpot,
          is_unpickable: false,
          has_not_played_last_season: player.hasNotPlayedLastSeason || false,
        },
        { onConflict: "id" }
      );

      if (playerError) {
        console.error(`❌ Error updating player ${player.id}:`, playerError);
        continue;
      }

      // Update keeper history
      if (player.keeperHistory.length > 0) {
        const keeperHistoryData = player.keeperHistory.map((season) => ({
          player_id: player.id,
          season: season,
        }));

        const { error: keeperError } = await supabase
          .from("keeper_history")
          .upsert(keeperHistoryData, { onConflict: "player_id,season" });

        if (keeperError) {
          console.error(
            `❌ Error updating keeper history for player ${player.id}:`,
            keeperError
          );
        }
      }

      // Update player stats
      const { error: statsError } = await supabase.from("player_stats").upsert(
        {
          player_id: player.id,
          fga: player.detailedStats.FGA,
          fgm: player.detailedStats.FGM,
          ftm: player.detailedStats.FTM,
          fta: player.detailedStats.FTA,
          three_pm: player.detailedStats["3PM"],
          reb: player.detailedStats.REB,
          ast: player.detailedStats.AST,
          stl: player.detailedStats.STL,
          blk: player.detailedStats.BLK,
          turnovers: player.detailedStats.TO,
          pts: player.detailedStats.PTS,
        },
        { onConflict: "player_id" }
      );

      if (statsError) {
        console.error(
          `❌ Error updating stats for player ${player.id}:`,
          statsError
        );
      }

      // Update ONLY current season raters (2026)
      // Previous season data (2025) should not be modified by daily updates
      const { error: ratersError } = await supabase
        .from("player_raters")
        .upsert(
          {
            player_id: player.id,
            season: CURRENT_SEASON.toString(),
            total_rater: player.currentRater,
            fg_rater: player.categoriesRaters.FG,
            ft_rater: player.categoriesRaters.FT,
            three_pm_rater: player.categoriesRaters["3PM"],
            reb_rater: player.categoriesRaters.REB,
            ast_rater: player.categoriesRaters.AST,
            stl_rater: player.categoriesRaters.STL,
            blk_rater: player.categoriesRaters.BLK,
            to_rater: player.categoriesRaters.TO,
            pts_rater: player.categoriesRaters.PTS,
          },
          { onConflict: "player_id,season" }
        );

      if (ratersError) {
        console.error(
          `❌ Error updating raters for player ${player.id}:`,
          ratersError
        );
      }
    }
  }

  // Update unpickable players
  console.log(`🏥 Updating ${updatedUnpickables.length} unpickable players...`);
  for (const unpickable of updatedUnpickables) {
    const { error } = await supabase.from("players").upsert(
      {
        id: unpickable.id,
        team_id: null,
        full_name: unpickable.name,
        salary: 1,
        games_played: 0,
        injured_spot: true,
        is_unpickable: true,
        has_not_played_last_season: false,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error(
        `❌ Error updating unpickable player ${unpickable.id}:`,
        error
      );
    }
  }

  console.log("✅ Database update completed!");
}

async function main() {
  try {
    console.log("🚀 Starting database update process...\n");
    console.log("Environment check:", {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    });

    // Fetch current data from database
    const { teams: previousTeams, unpickablePlayers } =
      await fetchFromDatabase();

    // Fetch fresh data from ESPN
    const { currentRaters, lastSeasonRaters, newRosters } =
      await fetchFromESPN();

    // Process roster changes
    console.log("\n🔄 Processing roster changes...");
    const updatedTeams = addNewPlayers(
      previousTeams,
      newRosters,
      lastSeasonRaters,
      currentRaters
    );

    // Check unpickable players status
    console.log("\n🏥 Checking unpickable players status...");
    const updatedUnpickables = await checkUnpickablePlayersStatus(
      unpickablePlayers
    );

    // Update database
    console.log("\n💾 Updating database with fresh data...");
    await updateDatabase(updatedTeams, updatedUnpickables);

    console.log("\n✅ Database update completed successfully!");
    console.log(`📊 Final stats:`, {
      teams: updatedTeams.length,
      totalPlayers: updatedTeams.reduce((sum, t) => sum + t.roster.length, 0),
      unpickablePlayers: updatedUnpickables.length,
    });

    // Exit with success code
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during update:", error);
    // Exit with error code
    process.exit(1);
  }
}

main();
