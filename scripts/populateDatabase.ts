import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

if (!supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Player {
  id: number;
  fullName: string;
  salary: number;
  keeperHistory: string[];
  gamesPlayed: number;
  previousRater: number;
  currentRater: number;
  injuredSpot: boolean;
  hasNotPlayedLastSeason?: boolean;
  categoriesRaters: {
    FG: number;
    FT: number;
    "3PM": number;
    REB: number;
    AST: number;
    STL: number;
    BLK: number;
    TO: number;
    PTS: number;
  };
  previousCategoriesRaters: {
    FG: number;
    FT: number;
    "3PM": number;
    REB: number;
    AST: number;
    STL: number;
    BLK: number;
    TO: number;
    PTS: number;
  };
  detailedStats: {
    FGA: number;
    FGM: number;
    FTM: number;
    FTA: number;
    "3PM": number;
    REB: number;
    AST: number;
    STL: number;
    BLK: number;
    TO: number;
    PTS: number;
  };
}

interface Team {
  id: number;
  name: string;
  abbreviation: string;
  roster: Player[];
}

interface RostersData {
  teams: Team[];
  unpickablePlayers?: Player[];
}

async function populateDatabase() {
  console.log("Starting database population...");

  // Read rosters.json
  const rostersPath = path.join(__dirname, "../app/assets/teams/rosters.json");
  const rostersData: RostersData = JSON.parse(
    fs.readFileSync(rostersPath, "utf-8")
  );

  try {
    // 1. Insert teams
    console.log("Inserting teams...");
    const teamsToInsert = rostersData.teams.map((team) => ({
      id: team.id,
      name: team.name,
      abbreviation: team.abbreviation,
    }));

    const { error: teamsError } = await supabase
      .from("teams")
      .upsert(teamsToInsert, { onConflict: "id" });

    if (teamsError) throw teamsError;
    console.log(`✓ Inserted ${teamsToInsert.length} teams`);

    // 2. Collect all players
    const allPlayers: Array<Player & { teamId: number | null }> = [];

    for (const team of rostersData.teams) {
      for (const player of team.roster) {
        allPlayers.push({ ...player, teamId: team.id });
      }
    }

    if (rostersData.unpickablePlayers) {
      for (const player of rostersData.unpickablePlayers) {
        allPlayers.push({ ...player, teamId: null });
      }
    }

    console.log(`Processing ${allPlayers.length} players...`);

    // 3. Insert players
    console.log("Inserting players...");
    const playersToInsert = allPlayers.map((player) => ({
      id: player.id,
      team_id: player.teamId,
      full_name: player.fullName,
      salary: player.salary,
      games_played: player.gamesPlayed,
      injured_spot: player.injuredSpot,
      is_unpickable: player.teamId === null,
      has_not_played_last_season: player.hasNotPlayedLastSeason || false,
    }));

    const { error: playersError } = await supabase
      .from("players")
      .upsert(playersToInsert, { onConflict: "id" });

    if (playersError) throw playersError;
    console.log(`✓ Inserted ${playersToInsert.length} players`);

    // 4. Insert keeper history
    console.log("Inserting keeper history...");
    const keeperHistoryToInsert = [];
    for (const player of allPlayers) {
      for (const season of player.keeperHistory) {
        keeperHistoryToInsert.push({
          player_id: player.id,
          season: season,
        });
      }
    }

    if (keeperHistoryToInsert.length > 0) {
      const { error: keeperError } = await supabase
        .from("keeper_history")
        .upsert(keeperHistoryToInsert, { onConflict: "player_id,season" });

      if (keeperError) throw keeperError;
    }
    console.log(
      `✓ Inserted ${keeperHistoryToInsert.length} keeper history records`
    );

    // 5. Insert player stats
    console.log("Inserting player stats...");
    const statsToInsert = allPlayers.map((player) => ({
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
    }));

    const { error: statsError } = await supabase
      .from("player_stats")
      .upsert(statsToInsert, { onConflict: "player_id" });

    if (statsError) throw statsError;
    console.log(`✓ Inserted ${statsToInsert.length} player stats`);

    // 6. Insert player raters
    console.log("Inserting player raters...");
    const ratersToInsert = [];

    for (const player of allPlayers) {
      // Current season (2025)
      ratersToInsert.push({
        player_id: player.id,
        season: "2025",
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
      });

      // Previous season (2024)
      ratersToInsert.push({
        player_id: player.id,
        season: "2024",
        total_rater: player.previousRater,
        fg_rater: player.previousCategoriesRaters.FG,
        ft_rater: player.previousCategoriesRaters.FT,
        three_pm_rater: player.previousCategoriesRaters["3PM"],
        reb_rater: player.previousCategoriesRaters.REB,
        ast_rater: player.previousCategoriesRaters.AST,
        stl_rater: player.previousCategoriesRaters.STL,
        blk_rater: player.previousCategoriesRaters.BLK,
        to_rater: player.previousCategoriesRaters.TO,
        pts_rater: player.previousCategoriesRaters.PTS,
      });
    }

    const { error: ratersError } = await supabase
      .from("player_raters")
      .upsert(ratersToInsert, { onConflict: "player_id,season" });

    if (ratersError) throw ratersError;
    console.log(`✓ Inserted ${ratersToInsert.length} player raters`);

    console.log("\n✅ Database population completed successfully!");
  } catch (error) {
    console.error("❌ Error populating database:", error);
    throw error;
  }
}

// Run the script
populateDatabase();
