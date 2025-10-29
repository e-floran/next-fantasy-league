"use client";

import { CSSProperties, useMemo } from "react";
import { buildHistoryMap } from "../utils/data";
import { createStyles } from "../utils/style";
import { parseRanking } from "../utils/utils";

export default function History() {
  const styles = createStyles<CSSProperties>()({
    historyTable: {
      margin: "0 auto",
    },
    totalCells: {
      border: "1px solid #e45e04",
    },
  });

  const historyByOwnerId = buildHistoryMap();
  const tableContent = useMemo(() => {
    const ownersArray: {
      ownerName: string;
      seasons: number;
      titles: number;
      totalPoints: number;
      average: number;
      bestSeason: number;
    }[] = [];
    historyByOwnerId.forEach((value) => {
      ownersArray.push({
        ownerName: value.ownerName,
        seasons: value.seasonsRankings.length,
        titles: value.seasonsRankings.filter((season) => season.ranking === 1)
          .length,
        totalPoints: value.totalPoints,
        average: value.totalPoints / value.seasonsRankings.length,
        bestSeason: Math.min(
          ...value.seasonsRankings.map((season) => season.ranking)
        ),
      });
    });
    return ownersArray
      .sort((a, b) => {
        return b.totalPoints - a.totalPoints;
      })
      .map((owner) => {
        return (
          <tr key={owner.ownerName}>
            <td>{owner.ownerName}</td>
            <td>{owner.seasons}</td>
            <td>{owner.titles}</td>
            <td style={styles.totalCells}>{owner.totalPoints}</td>
            <td>{owner.average.toFixed(2)}</td>
            <td>{parseRanking(owner.bestSeason)}</td>
          </tr>
        );
      });
  }, [historyByOwnerId, styles.totalCells]);

  return (
    <main>
      <section>
        <h2>Classement historique</h2>
        <table style={styles.historyTable}>
          <thead>
            <tr>
              <th>Manager</th>
              <th>Saisons</th>
              <th>Titres</th>
              <th
                style={styles.totalCells}
                title="Un point est attribué pour chaque place au classement (1 point pour la 14e place, 2 pour la 13e place...) plus 3 points bonus pour le podium et encore 5 points bonus pour le titre."
              >
                Total points*
              </th>
              <th>Moyenne</th>
              <th>Meilleure saison</th>
            </tr>
          </thead>
          <tbody>{tableContent}</tbody>
        </table>
      </section>
      <section>
        <p>
          * : Un point est attribué pour chaque place au classement (1 point
          pour la 14e place, 2 pour la 13e place...) plus 3 points bonus pour le
          podium et encore 5 points bonus pour le titre.
        </p>
      </section>
    </main>
  );
}
