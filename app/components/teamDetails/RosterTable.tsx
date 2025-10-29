import { CSSProperties, ReactElement, useContext, useMemo } from "react";
import { createStyles, rootColors } from "../../utils/style";
import { Player, TeamDetailsData } from "../../utils/types";
import { CustomButton } from "../generic/CustomButton";
import { useSortColumns } from "../../hooks/useSortColumns";
import { CustomCheckbox } from "../generic/CustomCheckbox";
import { DataContext } from "../../context/DataContext";

interface RosterTableProps {
  activeTeamData: TeamDetailsData;
}

export interface PlayerWithProjection extends Player {
  projectedSalary: number;
}

export const RosterTable = ({
  activeTeamData,
}: RosterTableProps): ReactElement => {
  const { selectedKeepers, setSelectedKeepers } = useContext(DataContext);

  const styles = createStyles<CSSProperties>()({
    section: {
      display: "flex",
      flexFlow: "column nowrap",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    columnHeader: {
      cursor: "pointer",
    },
    injuredPlayer: {
      position: "relative",
      top: "0.25rem",
    },
  });

  const handleCheckboxClick = (playerId: number) => {
    if (selectedKeepers.includes(playerId)) {
      setSelectedKeepers((prev) => prev.filter((id) => id !== playerId));
    } else if (selectedKeepers.length < 6) {
      setSelectedKeepers((prev) => [...prev, playerId]);
    }
  };

  const players = useMemo(() => {
    const playersWithProjection: PlayerWithProjection[] =
      activeTeamData.team.roster.map((player) => {
        return {
          ...player,
          projectedSalary:
            activeTeamData.newSalariesByPlayerId.get(player.id) || 0,
        };
      });
    return playersWithProjection;
  }, [activeTeamData.newSalariesByPlayerId, activeTeamData.team.roster]);

  const { columnIcon, sortColumn, sortedOptions, sortColumnByArgument } =
    useSortColumns({ options: players });

  return (
    <section style={styles.section}>
      <table>
        <thead>
          <tr>
            <th
              style={styles.columnHeader}
              onClick={() => sortColumnByArgument("fullName")}
            >
              {"Nom"} {sortColumn === "fullName" ? columnIcon : null}
            </th>
            <th
              style={styles.columnHeader}
              onClick={() => sortColumnByArgument("previousRater")}
            >
              {"Rater 2024"}{" "}
              {sortColumn === "previousRater" ? columnIcon : null}
            </th>
            <th
              style={styles.columnHeader}
              onClick={() => sortColumnByArgument("currentRater")}
            >
              {"Rater 2025"} {sortColumn === "currentRater" ? columnIcon : null}
            </th>
            <th
              style={styles.columnHeader}
              onClick={() => sortColumnByArgument("keeperHistory")}
            >
              {"Saisons keeper"}
              {sortColumn === "keeperHistory" ? columnIcon : null}
            </th>
            <th
              style={styles.columnHeader}
              onClick={() => sortColumnByArgument("salary")}
            >
              Salaire {sortColumn === "salary" ? columnIcon : null}
            </th>
            <th
              style={styles.columnHeader}
              onClick={() => sortColumnByArgument("projectedSalary")}
            >
              Saison prochaine{" "}
              {sortColumn === "projectedSalary" ? columnIcon : null}
            </th>
            <th>Test keepers</th>
          </tr>
        </thead>
        <tbody>
          {sortedOptions.map((player) => {
            return (
              <tr
                style={player.injuredSpot ? { color: "red" } : undefined}
                key={player.id}
              >
                <td>{player.fullName}</td>
                <td
                  style={
                    player.previousRater === 0
                      ? { color: rootColors.primary }
                      : undefined
                  }
                >
                  {player.previousRater.toFixed(2)}
                </td>
                <td>{player.currentRater.toFixed(2)}</td>
                <td>{player.keeperHistory.length}</td>
                <td>{player.salary}</td>
                <td>{activeTeamData?.newSalariesByPlayerId.get(player.id)}</td>
                <td>
                  <CustomCheckbox
                    isChecked={selectedKeepers.includes(player.id)}
                    onChange={() => handleCheckboxClick(player.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Totaux</td>
            <td>{activeTeamData?.totals?.rater2024.toFixed(2)}</td>
            <td>{activeTeamData?.totals?.rater2025.toFixed(2)}</td>
            <td>-</td>
            <td>{activeTeamData?.totals?.currentSalary}</td>
            <td>{activeTeamData?.totals?.projectedSalary}</td>
            <td>{activeTeamData?.totals?.projectedKeepersSalaries}</td>
          </tr>
        </tfoot>
      </table>
      {!!selectedKeepers.length && (
        <CustomButton
          buttonText="Vider les keepers"
          onClickButton={() => setSelectedKeepers([])}
        />
      )}
      <p>
        Les joueurs dont le rater de la saison dernière est en orange n'ont pas
        joué et n'auront donc pas d'évolution du salaire liée au rater.
      </p>
    </section>
  );
};
