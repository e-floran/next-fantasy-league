import { useEffect, useState } from "react";
import { PlayerWithAdvancedStats } from "../components/advancedStats/AdvancedTable";
import { PlayerWithProjection } from "../components/teamDetails/RosterTable";
import { TeamSortableData } from "../components/teamsSummary/SummaryTable";

export function useSortColumns<T>({ options }: { options: T[] }) {
  const [sortOrder, setSortOrder] = useState("desc");
  const [columnIcon, setColumnIcon] = useState("");
  const [sortColumn, setSortColumn] = useState<
    | keyof PlayerWithAdvancedStats
    | keyof PlayerWithProjection
    | keyof TeamSortableData
  >("fullName");
  const [sortedOptions, setSortedOptions] = useState<T[]>(options);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setColumnIcon(columnIcon === "↓" ? "↑" : "↓");
  };

  const sortColumnByArgument = (column: keyof T) => {
    toggleSortOrder();
    setSortColumn(
      column as
        | keyof PlayerWithAdvancedStats
        | keyof PlayerWithProjection
        | keyof TeamSortableData
    );
    const sortedOptionsList = [...(options ?? [])].sort((a, b) => {
      if (typeof a[column] === "string" && typeof b[column] === "string") {
        if (sortOrder === "asc") {
          return a[column].localeCompare(b[column]);
        } else {
          return b[column].localeCompare(a[column]);
        }
      } else if (
        typeof a[column] === "number" &&
        typeof b[column] === "number"
      ) {
        if (sortOrder === "asc") {
          return a[column] - b[column];
        } else {
          return b[column] - a[column];
        }
      } else if (Array.isArray(a[column]) && Array.isArray(b[column])) {
        if (sortOrder === "asc") {
          return a[column].length - b[column].length;
        } else {
          return b[column].length - a[column].length;
        }
      } else {
        return 0;
      }
    });
    setSortedOptions(sortedOptionsList);
  };

  useEffect(() => {
    setSortColumn("fullName");
    setSortedOptions(options);
  }, [options]);

  return {
    sortOrder,
    setSortOrder,
    columnIcon,
    setColumnIcon,
    sortColumn,
    setSortColumn,
    sortedOptions,
    setSortedOptions,
    toggleSortOrder,
    sortColumnByArgument,
  };
}
