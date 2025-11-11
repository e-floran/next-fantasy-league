"use client";

import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useMemo,
} from "react";
import { TeamDetailsData } from "./utils/types";
import { ButtonsGroup } from "./components/teamDetails/ButtonsGroup";
import { RosterTable } from "./components/teamDetails/RosterTable";
import { RosterStats } from "./components/teamDetails/RosterStats";
import { DataContext } from "./context/DataContext";

export interface DetailsProps {
  selectedKeepers: number[];
  setSelectedKeepers: Dispatch<SetStateAction<number[]>>;
  activeTeamId: number;
  setActiveTeamId: Dispatch<SetStateAction<number>>;
  dataByTeamId: Map<number, TeamDetailsData>;
}

export default function Home(): ReactElement {
  const { activeTeamId, dataByTeamId, teams } = useContext(DataContext);
  const activeTeamData = useMemo(() => {
    return dataByTeamId.get(activeTeamId);
  }, [activeTeamId, dataByTeamId]);

  if (!teams || teams.length === 0) {
    return (
      <main>
        <p>Chargement des données...</p>
      </main>
    );
  }

  return (
    <main>
      <ButtonsGroup />
      {activeTeamData && <RosterTable activeTeamData={activeTeamData} />}
      {activeTeamData && <RosterStats activeTeamData={activeTeamData} />}
    </main>
  );
}
