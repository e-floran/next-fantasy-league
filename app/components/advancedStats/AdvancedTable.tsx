import { CSSProperties, useCallback, useMemo } from "react";
import rosters from "../../assets/teams/rosters.json";
import {
  FiltersType,
  Player,
  StatsCategories,
  TeamDetailsData,
} from "../../utils/types";
import { useSortColumns } from "../../hooks/useSortColumns";
import { PlayerWithProjection } from "../teamDetails/RosterTable";
import { useContext } from "react";
import { DataContext } from "../../context/DataContext";

export interface PlayerWithAdvancedStats extends PlayerWithProjection {
  raterBySalary: number;
  oldRaterBySalary: number;
  raterByGames: number;
  team: string;
  raterByProjectedSalary: number;
}

interface AdvancedTableProps {
  headerStyle: CSSProperties;
  cellStyle: CSSProperties;
  categoriesToOmit: StatsCategories[];
  advancedFilters: FiltersType;
}

export const AdvancedTable = ({
  headerStyle,
  cellStyle,
  categoriesToOmit,
  advancedFilters,
}: AdvancedTableProps) => {
  const { dataByTeamId } = useContext(DataContext);

  const averageGamesPlayed = useMemo(() => {
    const gamesPlayed = rosters.teams
      .map((team) => team.roster)
      .flat()
      .map((player) => player.gamesPlayed);
    return gamesPlayed.reduce((a, b) => a + b) / gamesPlayed.length;
  }, []);

  const parsePlayerToAdvanced = useCallback(
    (
      player: Player,
      teamName: string,
      teamData: TeamDetailsData | undefined
    ): PlayerWithAdvancedStats => {
      let newCurrentRater = player.currentRater;
      let newPreviousRater = player.previousRater;
      if (categoriesToOmit.length) {
        categoriesToOmit.forEach((category) => {
          newCurrentRater -= player.categoriesRaters[category];
          newPreviousRater -= player.previousCategoriesRaters[category];
        });
      }
      const projectedSalary =
        teamData?.newSalariesByPlayerId.get(player.id) || 0;
      const raterByProjectedSalary = projectedSalary
        ? newCurrentRater / projectedSalary
        : 0;
      return {
        ...player,
        currentRater: newCurrentRater,
        previousRater: newPreviousRater,
        raterBySalary: newCurrentRater / player.salary,
        oldRaterBySalary: player.previousRater / player.salary,
        raterByGames: player.gamesPlayed
          ? (newCurrentRater / player.gamesPlayed) * averageGamesPlayed
          : 0,
        team: teamName,
        projectedSalary,
        raterByProjectedSalary,
      };
    },
    [averageGamesPlayed, categoriesToOmit]
  );

  const flatPlayers = useMemo(() => {
    return rosters.teams
      .map((team) => {
        const teamData = dataByTeamId.get(team.id);
        return team.roster.map((player) => {
          return parsePlayerToAdvanced(player, team.abbreviation, teamData);
        });
      })
      .flat()
      .filter((player) => {
        return (
          (advancedFilters.team
            ? advancedFilters.team === player.team
            : true) &&
          (advancedFilters.rater?.min
            ? advancedFilters.rater.min <= player.currentRater
            : true) &&
          (advancedFilters.rater?.max
            ? advancedFilters.rater.max >= player.currentRater
            : true) &&
          (advancedFilters.salary?.min
            ? advancedFilters.salary.min <= player.salary
            : true) &&
          (advancedFilters.salary?.max
            ? advancedFilters.salary.max >= player.salary
            : true) &&
          (advancedFilters.projection?.min
            ? advancedFilters.projection.min <= player.projectedSalary
            : true) &&
          (advancedFilters.projection?.max
            ? advancedFilters.projection.max >= player.projectedSalary
            : true) &&
          (advancedFilters.games?.min
            ? advancedFilters.games.min <= player.gamesPlayed
            : true) &&
          (advancedFilters.games?.max
            ? advancedFilters.games.max >= player.gamesPlayed
            : true)
        );
      });
  }, [advancedFilters, parsePlayerToAdvanced, dataByTeamId]);

  // const isLocal = location.hostname === "localhost";

  const { columnIcon, sortColumn, sortedOptions, sortColumnByArgument } =
    useSortColumns({ options: flatPlayers });

  return (
    <table>
      <thead>
        <th>Rk</th>
        <th>Team</th>
        <th
          style={headerStyle}
          onClick={() => sortColumnByArgument("fullName")}
        >
          Nom {sortColumn === "fullName" ? columnIcon : null}
        </th>
        <th
          style={headerStyle}
          onClick={() => sortColumnByArgument("currentRater")}
        >
          Rater {sortColumn === "currentRater" ? columnIcon : null}
        </th>
        <th style={headerStyle} onClick={() => sortColumnByArgument("salary")}>
          Salaire {sortColumn === "salary" ? columnIcon : null}
        </th>
        <th
          style={headerStyle}
          onClick={() => sortColumnByArgument("raterBySalary")}
        >
          R / salaire {sortColumn === "raterBySalary" ? columnIcon : null}
        </th>
        {/* {isLocal && ( */}
        <>
          {/* <th
              style={headerStyle}
              onClick={() => sortColumnByArgument("previousRater")}
            >
              Ancien rater {sortColumn === "previousRater" ? columnIcon : null}
            </th>
            <th
              style={headerStyle}
              onClick={() => sortColumnByArgument("oldRaterBySalary")}
            >
              Ancien rater/salaire{" "}
              {sortColumn === "oldRaterBySalary" ? columnIcon : null}
            </th> */}
          <th
            style={headerStyle}
            onClick={() => sortColumnByArgument("projectedSalary")}
          >
            Projection {sortColumn === "projectedSalary" ? columnIcon : null}
          </th>
          <th
            style={headerStyle}
            onClick={() => sortColumnByArgument("raterByProjectedSalary")}
          >
            R / projection{" "}
            {sortColumn === "raterByProjectedSalary" ? columnIcon : null}
          </th>
        </>
        <th
          style={headerStyle}
          onClick={() => sortColumnByArgument("gamesPlayed")}
        >
          Matchs joués
        </th>
        <th
          style={headerStyle}
          onClick={() => sortColumnByArgument("raterByGames")}
        >
          R / match
        </th>
      </thead>
      <tbody>
        {sortedOptions.map((player, index) => {
          return (
            <tr key={player.id}>
              <td>{index + 1}</td>
              <td>{player.team}</td>
              <td style={cellStyle}>{player.fullName}</td>
              <td style={cellStyle}>{player.currentRater.toFixed(2)}</td>
              <td style={cellStyle}>{player.salary}</td>
              <td style={cellStyle}>{player.raterBySalary.toFixed(2)}</td>
              {/* {isLocal && ( */}
              <>
                {/* <td style={cellStyle}>{player.previousRater.toFixed(2)}</td>
                  <td style={cellStyle}>
                    {player.oldRaterBySalary.toFixed(2)}
                  </td> */}
                <td style={cellStyle}>{player.projectedSalary}</td>
                <td style={cellStyle}>
                  {player.raterByProjectedSalary.toFixed(2)}
                </td>
              </>
              {/* )} */}
              <td style={cellStyle}>{player.gamesPlayed}</td>
              <td style={cellStyle}>{player.raterByGames.toFixed(2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
