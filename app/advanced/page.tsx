"use client";

import { CSSProperties, ReactElement, useCallback, useState } from "react";
import { FilterCategories, FiltersType, StatsCategories } from "../utils/types";
import { createStyles } from "../utils/style";
import { RaterFilters } from "../components/advancedStats/RaterFilters";
import { AdvancedTable } from "../components/advancedStats/AdvancedTable";
import { AdvancedFilters } from "../components/advancedStats/AdvancedFilters";

export default function AdvancedStats(): ReactElement {
  const [categoriesToOmit, setCategoriesToOmit] = useState<StatsCategories[]>(
    []
  );
  const [advancedFilters, setAdvancedFilters] = useState<FiltersType>({});

  const styles = createStyles<CSSProperties>()({
    columnHeader: {
      cursor: "pointer",
    },
    filtersContainer: {
      display: "flex",
      flexFlow: "row wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "0.25rem",
      margin: "0.5rem 0",
    },
    filtersTitle: {
      width: "fit-content",
    },
    tableCell: {
      maxWidth: "calc(100% / 9)",
    },
  });

  const handleCategoryToggle = useCallback(
    (category: StatsCategories) => {
      if (categoriesToOmit.includes(category)) {
        setCategoriesToOmit((prev) => prev.filter((cat) => cat !== category));
        return;
      }
      setCategoriesToOmit((prev) => [...prev, category]);
    },
    [categoriesToOmit]
  );

  const handleFilterChange = useCallback(
    (filterName: FilterCategories, filterValue?: string) => {
      if (filterName === FilterCategories.TEAM) {
        setAdvancedFilters((prev) => {
          return { ...prev, team: filterValue };
        });
      } else if (filterValue) {
        const parsedValue = filterValue.split(":");
        setAdvancedFilters((prev) => {
          return {
            ...prev,
            [filterName]: {
              ...prev[filterName],
              [parsedValue[0]]: parsedValue[1],
            },
          };
        });
      } else {
        setAdvancedFilters((prev) => {
          return { ...prev, [filterName]: filterValue };
        });
      }
    },
    [setAdvancedFilters]
  );

  return (
    <main>
      <section>
        <h2>Statistiques avancées</h2>
        <RaterFilters
          containerStyle={styles.filtersContainer}
          handleCategoryToggle={handleCategoryToggle}
          categoriesToOmit={categoriesToOmit}
        />
        <AdvancedFilters
          advancedFilters={advancedFilters}
          handleFilterChange={handleFilterChange}
        />
        <AdvancedTable
          headerStyle={styles.columnHeader}
          cellStyle={styles.tableCell}
          categoriesToOmit={categoriesToOmit}
          advancedFilters={advancedFilters}
        />
      </section>
      <section>
        <p>
          * : Les chiffres pour le rater par matchs joués sont multipliés par le
          nombre moyen de matchs joués, pour avoir des chiffres plus lisibles.
        </p>
      </section>
    </main>
  );
}
