import { createClient } from "@supabase/supabase-js";
import rater2025 from "../app/assets/rater/rater2025.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface RatedPlayer {
  id: number;
  ratings: {
    "0": {
      totalRating: number;
      statRankings: Array<{
        forStat: number;
        rating: number;
      }>;
    };
  };
  player: {
    fullName: string;
    injured: boolean;
  };
}

// Mapping from ESPN stat IDs to our database column names
const STAT_MAPPING: Record<number, string> = {
  19: "fg_rater", // FG%
  20: "ft_rater", // FT%
  17: "three_pm_rater", // 3PM
  6: "reb_rater", // REB
  3: "ast_rater", // AST
  2: "stl_rater", // STL
  1: "blk_rater", // BLK
  11: "to_rater", // TO
  0: "pts_rater", // PTS
};

async function correctRater2025() {
  try {
    console.log("🚀 Starting 2025 season rater correction...\n");

    // Step 1: Delete all existing 2024 and 2025 season raters
    // console.log("🗑️  Deleting all existing 2024 and 2025 season raters...");
    // const { error: delete2024Error, count: count2024 } = await supabase
    //   .from("player_raters")
    //   .delete({ count: "exact" })
    //   .eq("season", "2024");

    // if (delete2024Error) {
    //   throw new Error(
    //     `Failed to delete 2024 raters: ${delete2024Error.message}`
    //   );
    // }
    // console.log(
    //   `✅ Deleted ${count2024 || 0} existing 2024 season rater entries`
    // );

    // const { error: delete2025Error, count: count2025 } = await supabase
    //   .from("player_raters")
    //   .delete({ count: "exact" })
    //   .eq("season", "2025");

    // if (delete2025Error) {
    //   throw new Error(
    //     `Failed to delete 2025 raters: ${delete2025Error.message}`
    //   );
    // }
    // console.log(
    //   `✅ Deleted ${count2025 || 0} existing 2025 season rater entries\n`
    // );

    // Step 2: Read the rater2025.json file
    // const raterFilePath = path.join(
    //   __dirname,
    //   "../app/assets/rater/rater2025.json"
    // );

    // if (!fs.existsSync(raterFilePath)) {
    //   throw new Error(`File not found: ${raterFilePath}`);
    // }

    console.log("📖 Reading rater2025.json...");
    const raterData: RatedPlayer[] = rater2025;

    console.log(`✅ Found ${raterData.length} players in rater2025.json\n`);

    // Step 2.5: Get list of existing player IDs from database
    console.log("📋 Fetching existing player IDs from database...");
    const { data: existingPlayers, error: playersError } = await supabase
      .from("players")
      .select("id");

    if (playersError) {
      throw new Error(`Failed to fetch players: ${playersError.message}`);
    }

    const existingPlayerIds = new Set(existingPlayers.map((p) => p.id));
    console.log(`✅ Found ${existingPlayerIds.size} players in database\n`);

    // Step 3: Create missing players
    const missingPlayers = raterData.filter(
      (player) => !existingPlayerIds.has(player.id)
    );
    console.log(
      `🆕 Found ${missingPlayers.length} players not in database, creating them...`
    );

    if (missingPlayers.length > 0) {
      const playersToInsert = missingPlayers.map((player) => ({
        id: player.id,
        team_id: null, // No team assignment
        full_name: player.player.fullName,
        salary: 1, // Default minimum salary
        games_played: 0,
        injured_spot: player.player.injured || false,
        is_unpickable: false,
        has_not_played_last_season: false,
      }));

      const BATCH_SIZE = 500;
      for (let i = 0; i < playersToInsert.length; i += BATCH_SIZE) {
        const batch = playersToInsert.slice(i, i + BATCH_SIZE);

        const { error: insertError } = await supabase
          .from("players")
          .insert(batch);

        if (insertError) {
          console.error(
            `❌ Error inserting player batch starting at index ${i}:`,
            insertError.message
          );
        } else {
          console.log(
            `✅ Inserted ${Math.min(
              i + BATCH_SIZE,
              playersToInsert.length
            )} / ${playersToInsert.length} missing players...`
          );
        }
      }
    }

    let insertedCount = 0;
    let errorCount = 0;
    const ratersToInsert = [];

    // Step 4: Build the array of raters to insert
    console.log("\n📊 Processing rater data...");
    for (const player of raterData) {
      try {
        const playerId = player.id;
        const totalRater = player.ratings["0"].totalRating;
        const statRankings = player.ratings["0"].statRankings;

        // Build the rater object
        const raterInsert: Record<string, number | string> = {
          player_id: playerId,
          season: "2025",
          total_rater: totalRater,
          // Initialize all categories to 0
          fg_rater: 0,
          ft_rater: 0,
          three_pm_rater: 0,
          reb_rater: 0,
          ast_rater: 0,
          stl_rater: 0,
          blk_rater: 0,
          to_rater: 0,
          pts_rater: 0,
        };

        // Map stat rankings to database columns
        statRankings.forEach((stat) => {
          const columnName = STAT_MAPPING[stat.forStat];
          if (columnName) {
            raterInsert[columnName] = stat.rating;
          } else {
            console.warn(
              `⚠️  Unknown stat ID ${stat.forStat} for player ${playerId}`
            );
          }
        });

        ratersToInsert.push(raterInsert);
      } catch (error) {
        console.error(`❌ Error processing player ${player.id}:`, error);
        errorCount++;
      }
    }

    // Step 5: Insert all raters in batches
    console.log(`\n📥 Inserting ${ratersToInsert.length} player raters...`);
    const BATCH_SIZE = 500;

    for (let i = 0; i < ratersToInsert.length; i += BATCH_SIZE) {
      const batch = ratersToInsert.slice(i, i + BATCH_SIZE);

      const { error } = await supabase.from("player_raters").insert(batch);

      if (error) {
        console.error(
          `❌ Error inserting batch starting at index ${i}:`,
          error.message
        );
        console.error(`🔍 Error details:`, error);
        errorCount += batch.length;
      } else {
        insertedCount += batch.length;
        console.log(
          `✅ Inserted ${insertedCount} / ${ratersToInsert.length} players...`
        );
      }
    }

    console.log("\n📊 Correction Summary:");
    console.log(`🆕 Missing players created: ${missingPlayers.length}`);
    console.log(`✅ Successfully inserted raters: ${insertedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log("\n🎉 2025 season rater correction completed!");
  } catch (error) {
    console.error("💥 Fatal error:", error);
    throw error;
  }
}

correctRater2025()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
