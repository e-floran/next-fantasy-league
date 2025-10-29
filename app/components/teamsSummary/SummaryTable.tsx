"use client";
import { ReactElement, useMemo } from "react";
import { useSortColumns } from "../../hooks/useSortColumns";
import { useContext } from "react";
import { DataContext } from "../../context/DataContext";

export interface TeamSortableData {
  id: number;
  name: string;
  currentSalaries: number;
  currentMargin: number;
  previousRaters: number;
  currentRaters: number;
}

export const SummaryTable = (): ReactElement => {
  const { dataByTeamId } = useContext(DataContext);

  const sortableTeams = useMemo(() => {
    const sortableTeamsData: TeamSortableData[] = [];
    dataByTeamId.forEach((team) => {
      sortableTeamsData.push({
        name: team.team.name,
        currentSalaries: team.totals.currentSalary,
        currentMargin: 220 - team.totals.currentSalary,
        previousRaters: team.totals.rater2024,
        currentRaters: team.totals.rater2025,
        id: team.team.id,
      });
    });
    return sortableTeamsData;
  }, [dataByTeamId]);

  const { columnIcon, sortColumn, sortedOptions, sortColumnByArgument } =
    useSortColumns({ options: sortableTeams });

  const tableContent = useMemo(() => {
    return sortedOptions.map((team) => (
      <tr key={team.id}>
        <td>{team.name}</td>
        <td>{team.currentSalaries}</td>
        <td>{team.currentMargin}</td>
        <td>{team.previousRaters.toFixed(2)}</td>
        <td>{team.currentRaters.toFixed(2)}</td>
      </tr>
    ));
  }, [sortedOptions]);

  return (
    <section>
      <h2>Masses salariales</h2>
      <table>
        <thead>
          <tr>
            <th
              onClick={() => sortColumnByArgument("name")}
              style={{
                cursor: "pointer",
              }}
            >
              Équipe {sortColumn === "name" ? columnIcon : null}
            </th>
            <th
              onClick={() => sortColumnByArgument("currentSalaries")}
              style={{
                cursor: "pointer",
              }}
            >
              Salaires {sortColumn === "currentSalaries" ? columnIcon : null}
            </th>
            <th
              onClick={() => sortColumnByArgument("currentMargin")}
              style={{
                cursor: "pointer",
              }}
            >
              Marge {sortColumn === "currentMargin" ? columnIcon : null}
            </th>
            <th
              onClick={() => sortColumnByArgument("previousRaters")}
              style={{
                cursor: "pointer",
              }}
            >
              PR passé {sortColumn === "previousRaters" ? columnIcon : null}
            </th>
            <th
              onClick={() => sortColumnByArgument("currentRaters")}
              style={{
                cursor: "pointer",
              }}
            >
              PR actuel {sortColumn === "currentRaters" ? columnIcon : null}
            </th>
          </tr>
        </thead>
        <tbody>{tableContent}</tbody>
      </table>
    </section>
  );
};
