"use client";

import { ReactElement } from "react";
import { useContext } from "react";
import { DataContext } from "../context/DataContext";

export default function InjuryReport(): ReactElement {
  const { unpickablePlayers } = useContext(DataContext);

  return (
    <main>
      <section>
        <h2>Joueurs blessés à ne pas drafter/pick</h2>
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Nom</th>
            </tr>
          </thead>
          <tbody>
            {unpickablePlayers.map((player) => (
              <tr key={player.id}>
                <td style={player.outForSeason ? { color: "red" } : undefined}>
                  {player.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Les joueurs blessés jusqu&apos;à la fin de la saison sont en rouge.
        </p>
      </section>
    </main>
  );
}
