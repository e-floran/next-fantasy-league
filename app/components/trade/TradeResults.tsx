"use client";
import { CSSProperties, ReactElement, useMemo } from "react";
import { createStyles } from "../../utils/style";
import { getTeamStatsAfterTrade, reduceStats } from "../../utils/utils";
import { TradeStatItem } from "./TradeStatItem";
import { useContext } from "react";
import { DataContext } from "../../context/DataContext";

interface TradeProps {
  firstTeam: number;
  secondTeam: number;
  selectedFirstTeamPlayers: number[];
  selectedSecondTeamPlayers: number[];
}

export const TradeResults = ({
  firstTeam,
  secondTeam,
  selectedFirstTeamPlayers,
  selectedSecondTeamPlayers,
}: TradeProps): ReactElement => {
  const { dataByTeamId } = useContext(DataContext);

  const styles = createStyles<CSSProperties>()({
    container: {
      marginTop: "1rem",
      display: "flex",
      flexFlow: "row wrap",
      justifyContent: "space-between",
    },
    list: {
      margin: "0 auto",
    },
  });

  const statsAfterTrade = useMemo(() => {
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

    const firstTeamOutStats = reduceStats(
      firstTeamBeforeTrade.team.roster
        .filter((player) => selectedFirstTeamPlayers.includes(player.id))
        .map((player) => player.detailedStats)
    );
    const secondTeamOutStats = reduceStats(
      secondTeamBeforeTrade.team.roster
        .filter((player) => selectedSecondTeamPlayers.includes(player.id))
        .map((player) => player.detailedStats)
    );

    return {
      firstTeam: getTeamStatsAfterTrade(
        firstTeamBeforeTrade.totals.stats,
        firstTeamOutStats,
        secondTeamOutStats
      ),
      secondTeam: getTeamStatsAfterTrade(
        secondTeamBeforeTrade.totals.stats,
        secondTeamOutStats,
        firstTeamOutStats
      ),
    };
  }, [
    dataByTeamId,
    firstTeam,
    secondTeam,
    selectedFirstTeamPlayers,
    selectedSecondTeamPlayers,
  ]);

  if (!statsAfterTrade) {
    return <></>;
  }

  return (
    <article style={styles.container}>
      <h3>Évolutions statistiques par match</h3>
      <ul style={styles.list}>
        {Object.entries(statsAfterTrade.firstTeam).map((value, index) => {
          return <TradeStatItem name={value[0]} value={value[1]} key={index} />;
        })}
      </ul>
      <ul style={styles.list}>
        {Object.entries(statsAfterTrade.secondTeam).map((value, index) => {
          return <TradeStatItem name={value[0]} value={value[1]} key={index} />;
        })}
      </ul>
    </article>
  );
};
