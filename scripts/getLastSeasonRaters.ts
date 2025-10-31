import { RatedRawPlayer } from "../app/utils/types";
import { downloadElement } from "../app/utils/utils";

export async function getLastSeasonRaters() {
  let raters: RatedRawPlayer[] = [];
  const ratersHeaders = {
    "X-Fantasy-Filter": {
      players: {
        filterSlotIds: { value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
        limit: 1000,
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
            "002024",
            "102024",
            "012024",
            "022024",
            "032024",
            "042024",
          ],
        },
      },
    },
  };
  const ratersUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/2025/segments/0/leagues/3409?scoringPeriodId=7&view=kona_player_info&view=mStatRatings`;
  const ratersReq = new Request(ratersUrl);
  ratersReq.headers.set(
    "X-Fantasy-Filter",
    JSON.stringify(ratersHeaders["X-Fantasy-Filter"])
  );
  await fetch(ratersReq)
    .then((response) => response.json())
    .then((json: { players: RatedRawPlayer[] }) => {
      raters = json.players
        .filter((player) => player.ratings[0].statRankings.length > 0)
        .map((player) => {
          return {
            id: player.id,
            keeperValue: player.keeperValue,
            keeperValueFuture: player.keeperValueFuture,
            onteamId: player.onteamId,
            ratings: {
              "0": player.ratings[0],
            },
            player: {
              fullName: player.player.fullName,
              id: player.player.id,
              stats: player.player.stats,
              injured: player.player.injured,
            },
          };
        });
    })
    .catch((error) => console.log(error));

  downloadElement(raters, "newrater2025");
}
