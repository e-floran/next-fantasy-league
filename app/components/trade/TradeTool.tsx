"use client";
import { CSSProperties, ReactElement, useMemo, useState } from "react";
import { createStyles } from "../../utils/style";
import { TradeTeam } from "./TradeTeam";
import { TradeResults } from "./TradeResults";
import { useContext } from "react";
import { DataContext } from "../../context/DataContext";

export const TradeTool = (): ReactElement => {
  const { dataByTeamId } = useContext(DataContext);

  const styles = createStyles<CSSProperties>()({
    section: {
      width: "100%",
    },
    container: {
      display: "flex",
      flexFlow: "row nowrap",
      justifyContent: "space-between",
    },
  });

  const [firstTeam, setFirstTeam] = useState<number>(0);
  const [secondTeam, setSecondTeam] = useState<number>(0);
  const [selectedFirstTeamPlayers, setSelectedFirstTeamPlayers] = useState<
    number[]
  >([]);
  const [selectedSecondTeamPlayers, setSelectedSecondTeamPlayers] = useState<
    number[]
  >([]);

  const salariesAfterTrade = useMemo(() => {
    const firstTeamBeforeTrade = dataByTeamId.get(firstTeam);
    const secondTeamBeforeTrade = dataByTeamId.get(secondTeam);
    if (
      !firstTeam ||
      !secondTeam ||
      !selectedFirstTeamPlayers.length ||
      !selectedSecondTeamPlayers.length ||
      !firstTeamBeforeTrade ||
      !secondTeamBeforeTrade
    ) {
      return undefined;
    }

    const firstTeamSalaries = firstTeamBeforeTrade?.totals.currentSalary;
    const secondTeamSalaries = secondTeamBeforeTrade?.totals.currentSalary;
    const firstTeamOutSalaries = firstTeamBeforeTrade?.team.roster
      .filter((player) => selectedFirstTeamPlayers.includes(player.id))
      .map((player) => player.salary)
      .reduce((partialSum, a) => partialSum + a, 0);
    const secondTeamOutSalaries = secondTeamBeforeTrade?.team.roster
      .filter((player) => selectedSecondTeamPlayers.includes(player.id))
      .map((player) => player.salary)
      .reduce((partialSum, a) => partialSum + a, 0);

    return {
      firstTeam:
        firstTeamSalaries - firstTeamOutSalaries + secondTeamOutSalaries,
      secondTeam:
        secondTeamSalaries - secondTeamOutSalaries + firstTeamOutSalaries,
    };
  }, [
    dataByTeamId,
    firstTeam,
    secondTeam,
    selectedFirstTeamPlayers,
    selectedSecondTeamPlayers,
  ]);

  return (
    <section style={styles.section}>
      <h2>Test de transfert</h2>
      <div style={styles.container}>
        <TradeTeam
          dataByTeamId={dataByTeamId}
          setTeam={setFirstTeam}
          teamId={firstTeam}
          title="Équipe 1"
          selectedPlayers={selectedFirstTeamPlayers}
          setSelectedPlayers={setSelectedFirstTeamPlayers}
          salariesAfterTrade={salariesAfterTrade?.firstTeam}
        />
        <TradeTeam
          dataByTeamId={dataByTeamId}
          setTeam={setSecondTeam}
          teamId={secondTeam}
          title="Équipe 2"
          selectedPlayers={selectedSecondTeamPlayers}
          setSelectedPlayers={setSelectedSecondTeamPlayers}
          salariesAfterTrade={salariesAfterTrade?.secondTeam}
        />
      </div>
      <TradeResults
        firstTeam={firstTeam}
        secondTeam={secondTeam}
        selectedFirstTeamPlayers={selectedFirstTeamPlayers}
        selectedSecondTeamPlayers={selectedSecondTeamPlayers}
      />
    </section>
  );
};
