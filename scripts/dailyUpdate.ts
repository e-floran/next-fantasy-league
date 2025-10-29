import { addNewPlayers, checkUnpickablePlayersStatus } from "../app/utils/data";
import {
  RatedRawPlayer,
  RawTeam,
  Team,
  UnpickablePlayer,
} from "../app/utils/types";
import rosters from "../app/assets/teams/rosters.json";
import rater2024 from "../app/assets/rater/rater2024.json";
import { downloadElement } from "../app/utils/utils";
import { Dispatch, SetStateAction } from "react";

const raterUrl =
  "https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/2025/segments/0/leagues/3409?scoringPeriodId=7&view=kona_player_info&view=mStatRatings";

export async function dailyUpdate(
  setIsUpdating: Dispatch<SetStateAction<boolean>>,
  handleDataRefresh?: (
    newTeams: Team[],
    newUnpickables: UnpickablePlayer[],
    newUpdate: Date
  ) => void
) {
  setIsUpdating(true);
  console.log("🚀 Starting daily update...");

  const newRosters: RawTeam[] = [];
  let newRaters: RatedRawPlayer[] = [];

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

  console.log("📊 Fetching rater data from:", raterUrl);
  const raterStartTime = Date.now();

  const req = new Request(raterUrl);
  req.headers.set(
    "X-Fantasy-Filter",
    JSON.stringify(ratersHeaders["X-Fantasy-Filter"])
  );

  console.log("📋 Rater request headers:", req.headers.get("X-Fantasy-Filter"));

  await fetch(req)
    .then((response) => {
      console.log(
        `✅ Rater response received (${Date.now() - raterStartTime}ms):`,
        response.status,
        response.statusText
      );
      return response.json();
    })
    .then((json: { players: RatedRawPlayer[] }) => {
      newRaters = [...json.players];
      console.log(`📈 Retrieved ${newRaters.length} rater entries`);
    })
    .catch((error) => {
      console.error("❌ Rater fetch failed:", error);
      console.error("🔍 Error details:", {
        message: error.message,
        stack: error.stack,
        url: raterUrl,
      });
    });

  console.log("🏀 Starting team rosters fetch...");
  for (let i = 1; i < 17; i++) {
    const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/2026/segments/0/leagues/3409?rosterForTeamId=${i}&view=mRoster`;
    console.log(`📥 Fetching team ${i} roster...`);
    const teamStartTime = Date.now();

    await fetch(url)
      .then((response) => {
        console.log(
          `✅ Team ${i} response (${Date.now() - teamStartTime}ms):`,
          response.status,
          response.statusText
        );
        return response.json();
      })
      .then((json: { teams: RawTeam[] }) => {
        console.log(`🔍 Team ${i} API response structure:`, {
          hasTeams: !!json.teams,
          teamsLength: json.teams?.length || 0,
          teamIds: json.teams?.map((t) => t.id) || [],
          fullResponse: json,
        });

        const teamRoster = json.teams.find((team) => team.id === i);
        if (teamRoster) {
          console.log(`📊 Team ${i} details:`, {
            id: teamRoster.id,
            hasRoster: !!teamRoster.roster,
            entriesCount: teamRoster.roster?.entries?.length || 0,
            rosterStructure: teamRoster.roster,
          });
          newRosters.push(teamRoster);
          console.log(
            `📋 Team ${i} roster added (${
              teamRoster.roster?.entries?.length || 0
            } players)`
          );
        } else {
          console.warn(`⚠️ Team ${i} not found in response`);
          console.log(
            `🔍 Available teams in response:`,
            json.teams?.map((t) => ({ id: t.id, name: t.name }))
          );
        }
      })
      .catch((error) => {
        console.error(`❌ Team ${i} fetch failed:`, error);
        console.error("🔍 Error details:", {
          message: error.message,
          stack: error.stack,
          url: url,
          teamId: i,
        });
      });
  }

  console.log(`📊 Processing data - ${newRosters.length} teams fetched`);
  console.log(
    `🔍 Team IDs successfully fetched:`,
    newRosters.map((team) => team.id)
  );

  const ratedPlayers = rater2024 as unknown as RatedRawPlayer[];

  const outputRosters = addNewPlayers(
    rosters.teams,
    newRosters,
    ratedPlayers,
    newRaters
  );

  console.log("🔄 Checking unpickable players status...");
  const unpickablePlayers = await checkUnpickablePlayersStatus(
    rosters.unpickablePlayers
  );
  console.log(`📋 ${unpickablePlayers.length} unpickable players after check`);

  const output = {
    lastUpdate: new Date(),
    teams: outputRosters,
    unpickablePlayers,
  };
  if (handleDataRefresh) {
    handleDataRefresh(outputRosters, unpickablePlayers, output.lastUpdate);
    return;
  }
  downloadElement(output, "rosters", setIsUpdating);
  console.log("✅ Daily update completed successfully");
}
