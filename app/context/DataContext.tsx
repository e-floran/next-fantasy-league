"use client";
import {
  createContext,
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { getDataByTeamId } from "../utils/utils";
import { Team, TeamDetailsData, UnpickablePlayer } from "../utils/types";
import rosters from "../assets/teams/rosters.json";

interface ContextData {
  teams: Team[];
  activeTeamId: number;
  setActiveTeamId: Dispatch<SetStateAction<number>>;
  selectedKeepers: number[];
  setSelectedKeepers: Dispatch<SetStateAction<number[]>>;
  dataByTeamId: Map<number, TeamDetailsData>;
  unpickablePlayers: UnpickablePlayer[];
  lastUpdate: Date;
  handleDataRefresh: (
    newTeams: Team[],
    newUnpickables: UnpickablePlayer[],
    newUpdate: Date
  ) => void;
  isUpdating: boolean;
  setIsUpdating: Dispatch<SetStateAction<boolean>>;
}

export const DataContext = createContext<ContextData>({} as ContextData);

export const DataProvider = ({ children }: { children: ReactElement }) => {
  const {
    teams: baseTeams,
    unpickablePlayers: baseUnpickablePlayers,
    lastUpdate: baseLastUpdate,
  } = rosters;

  const [activeTeamId, setActiveTeamId] = useState(0);
  const [selectedKeepers, setSelectedKeepers] = useState<number[]>([]);
  const [teams, setTeams] = useState<Team[]>(baseTeams);
  const [unpickablePlayers, setUnpickablePlayers] = useState<
    UnpickablePlayer[]
  >(baseUnpickablePlayers);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date(baseLastUpdate));
  const [isUpdating, setIsUpdating] = useState(false);

  const dataByTeamId = useMemo(() => {
    return getDataByTeamId(teams, selectedKeepers);
  }, [selectedKeepers, teams]);

  const handleDataRefresh = useCallback(
    (newTeams: Team[], newUnpickables: UnpickablePlayer[], newUpdate: Date) => {
      setTeams(newTeams);
      setUnpickablePlayers(newUnpickables);
      setLastUpdate(newUpdate);
      setIsUpdating(false);
    },
    []
  );

  return (
    <DataContext.Provider
      value={{
        teams,
        activeTeamId,
        setActiveTeamId,
        selectedKeepers,
        setSelectedKeepers,
        dataByTeamId,
        unpickablePlayers,
        lastUpdate,
        handleDataRefresh,
        isUpdating,
        setIsUpdating,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
