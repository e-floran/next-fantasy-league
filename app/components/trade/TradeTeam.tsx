"use client";
import {
  CSSProperties,
  Dispatch,
  ReactElement,
  SetStateAction,
  useMemo,
} from "react";
import { createStyles } from "../../utils/style";
import { TeamDetailsData } from "../../utils/types";
import { CustomCheckbox } from "../generic/CustomCheckbox";

interface TradeTeamProps {
  dataByTeamId: Map<number, TeamDetailsData>;
  setTeam: Dispatch<SetStateAction<number>>;
  teamId: number;
  title: string;
  selectedPlayers: number[];
  setSelectedPlayers: Dispatch<SetStateAction<number[]>>;
  salariesAfterTrade?: number;
}

export const TradeTeam = ({
  dataByTeamId,
  setTeam,
  teamId,
  title,
  selectedPlayers,
  setSelectedPlayers,
  salariesAfterTrade,
}: TradeTeamProps): ReactElement => {
  const styles = createStyles<CSSProperties>()({
    article: {
      width: "50%",
      display: "flex",
      flexFlow: "column nowrap",
      justifyContent: "start",
      alignItems: "center",
    },
    select: {
      maxWidth: "80%",
    },
  });

  const selectOptionsRendering = () => {
    const options: ReactElement[] = [
      <option key="0" value="0">
        Choisissez
      </option>,
    ];
    const sortedTeams: { id: number; name: string }[] = [];
    dataByTeamId.forEach((team) => {
      sortedTeams.push({ id: team.team.id, name: team.team.name });
    });
    sortedTeams.forEach((team) => {
      const option = (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      );
      options.push(option);
    });
    return options;
  };

  const activeTeamPlayers = useMemo(() => {
    return dataByTeamId.get(teamId)?.team.roster;
  }, [dataByTeamId, teamId]);

  const handleCheckboxClick = (playerId: number) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers((prev) => prev.filter((id) => id !== playerId));
    } else if (selectedPlayers.length < 6) {
      setSelectedPlayers((prev) => [...prev, playerId]);
    }
  };

  return (
    <article style={styles.article}>
      <h3>{title}</h3>
      <select
        name={`team_${teamId}`}
        onChange={(event) => setTeam(Number(event.target.value))}
        value={teamId}
        style={styles.select}
      >
        {selectOptionsRendering()}
      </select>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Salaire</th>
            <th>Choisir</th>
          </tr>
        </thead>
        <tbody>
          {activeTeamPlayers?.map((player) => {
            return (
              <tr key={player.id}>
                <td>{player.fullName}</td>
                <td>{player.salary}</td>
                <td>
                  <CustomCheckbox
                    isChecked={selectedPlayers.includes(player.id)}
                    onChange={() => handleCheckboxClick(player.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
        {salariesAfterTrade !== undefined && (
          <tfoot>
            <td>Résultat</td>
            <td>{salariesAfterTrade}</td>
            <td> - </td>
          </tfoot>
        )}
      </table>
    </article>
  );
};
