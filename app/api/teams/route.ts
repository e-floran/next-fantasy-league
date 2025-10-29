/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all teams
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .order("id");

    if (teamsError) throw teamsError;

    // Fetch all players with their related data
    const { data: players, error: playersError } = await supabase.from(
      "players"
    ).select(`
        *,
        keeper_history (season),
        player_stats (*),
        player_raters (*)
      `);

    if (playersError) throw playersError;

    // Transform the data to match the expected format
    const teamsWithRosters = teams.map((team) => {
      const teamPlayers = players
        .filter((p) => p.team_id === team.id)
        .map((player) => transformPlayer(player));

      return {
        id: team.id,
        name: team.name,
        abbreviation: team.abbreviation,
        roster: teamPlayers,
      };
    });

    // Get unpickable players
    const unpickablePlayers = players
      .filter((p) => p.is_unpickable)
      .map((player) => transformPlayer(player));

    return NextResponse.json({
      teams: teamsWithRosters,
      unpickablePlayers,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

function transformPlayer(dbPlayer: any) {
  // Find current season (2025) and previous season (2024) raters
  const currentRater = dbPlayer.player_raters?.find(
    (r: any) => r.season === "2025"
  );
  const previousRater = dbPlayer.player_raters?.find(
    (r: any) => r.season === "2024"
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
