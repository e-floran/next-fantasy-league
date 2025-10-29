import { CSSProperties, useMemo } from "react";
import { TeamDetailsData } from "../../utils/types";
import { createStyles } from "../../utils/style";

export const RosterStats = ({
  activeTeamData,
}: {
  activeTeamData: TeamDetailsData;
}) => {
  const styles = createStyles<CSSProperties>()({
    section: {
      display: "flex",
      flexFlow: "row wrap",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      gap: "0.5rem",
    },
    article: {
      display: "flex",
      flexFlow: "column nowrap",
      justifyContent: "flex-start",
      alignItems: "center",
      minWidth: "4rem",
    },
  });

  const teamStats = useMemo(() => {
    const stats = activeTeamData.totals.stats;
    return {
      FG: ((stats.FGM / stats.FGA) * 100).toFixed(2) + "%",
      FT: ((stats.FTM / stats.FTA) * 100).toFixed(2) + "%",
      "3PM": stats["3PM"].toFixed(2),
      REB: stats.REB.toFixed(2),
      AST: stats.AST.toFixed(2),
      STL: stats.STL.toFixed(2),
      BLK: stats.BLK.toFixed(2),
      TO: stats.TO.toFixed(2),
      PTS: stats.PTS.toFixed(2),
    };
  }, [activeTeamData]);

  return (
    <section style={styles.section}>
      <h2>Statistiques du roster actuel</h2>
      {Object.entries(teamStats).map((stat, index) => {
        return (
          <article key={index} style={styles.article}>
            <p>{stat[0]}</p>
            <p>{stat[1]}</p>
          </article>
        );
      })}
    </section>
  );
};
