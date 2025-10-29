"use client";
import {
  createContext,
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getDataByTeamId } from "../utils/utils";
import { Team, TeamDetailsData, UnpickablePlayer } from "../utils/types";

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
  const [activeTeamId, setActiveTeamId] = useState(0);
  const [selectedKeepers, setSelectedKeepers] = useState<number[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [unpickablePlayers, setUnpickablePlayers] = useState<
    UnpickablePlayer[]
  >([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  const dataByTeamId = useMemo(() => {
    return getDataByTeamId(teams, selectedKeepers);
  }, [selectedKeepers, teams]);

  const fetchTeamsData = async () => {
    try {
      const response = await fetch("/api/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const rostersData = await fetchTeamsData();
        setTeams(rostersData.teams);
        setUnpickablePlayers(rostersData.unpickablePlayers || []);
        setLastUpdate(new Date()); // You might want to store this in the database
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

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
