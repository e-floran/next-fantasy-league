import { CSSProperties, useCallback, useState } from "react";
import { FiltersType, FilterCategories } from "../../utils/types";
import { CustomButton } from "../generic/CustomButton";
import { CustomCheckbox } from "../generic/CustomCheckbox";
import { createStyles } from "../../utils/style";

interface FiltersProps {
  advancedFilters: FiltersType;
  handleFilterChange: (
    filterName: FilterCategories,
    filterValue?: string
  ) => void;
}

export const AdvancedFilters = ({
  advancedFilters,
  handleFilterChange,
}: FiltersProps) => {
  const styles = createStyles<CSSProperties>()({
    filtersContainer: {
      display: "flex",
      flexFlow: "row wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "0.25rem",
      margin: "0.5rem 0",
    },
    input: {
      borderRadius: "0.75rem",
      border: "none",
      padding: "0.5rem 1rem",
      fontSize: "1rem",
      fontFamily: "inherit",
      width: "3rem",
      margin: "0 0.25rem 0.25rem 0.25rem",
    },
    checkBoxesContainer: {
      display: "flex",
      flexFlow: "row wrap",
      justifyContent: "space-evenly",
      alignItems: "center",
      width: "calc(100% - 10rem)",
    },
    subFiltersContainer: {
      display: "flex",
      flexFlow: "row wrap",
      justifyContent: "space-evenly",
      alignItems: "center",
      width: "calc(100% - 10rem)",
      marginLeft: "10rem",
    },
    inputContainer: {
      display: "flex",
      flexFlow: "row wrap",
      justifyContent: "center",
      alignItems: "flex-end",
    },
    inputLabel: {
      width: "100%",
      textAlign: "center",
    },
  });

  const [openFilters, setOpenFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCategories[]>([]);

  // const isLocal = location.hostname === "localhost";

  const handleFilterToggle = useCallback(
    (newFilter: FilterCategories) => {
      if (activeFilters.includes(newFilter)) {
        setActiveFilters((prev) =>
          prev.filter((filter) => filter !== newFilter)
        );
        handleFilterChange(newFilter);
      } else {
        setActiveFilters([...activeFilters, newFilter]);
      }
    },
    [activeFilters, handleFilterChange]
  );

  return (
    <article style={styles.filtersContainer}>
      <CustomButton
        buttonText="Filtrer"
        onClickButton={() => setOpenFilters(!openFilters)}
      />
      {openFilters && (
        <>
          <div style={styles.checkBoxesContainer}>
            {(Object.values(FilterCategories) as Array<FilterCategories>)
              .filter((filter) => {
                // if (isLocal) {
                return filter;
                // }
                // return filter !== FilterCategories.PROJECTION;
              })
              .map((filter) => (
                <CustomCheckbox
                  labelText={filter}
                  onChange={() => handleFilterToggle(filter)}
                  isChecked={activeFilters.includes(filter)}
                  key={filter}
                />
              ))}
          </div>
          <div style={styles.subFiltersContainer}>
            {activeFilters.includes(FilterCategories.TEAM) && (
              <div
                style={{
                  ...styles.inputContainer,
                  paddingTop: "1rem",
                }}
              >
                <input
                  type="text"
                  style={styles.input}
                  value={advancedFilters.team ?? ""}
                  onChange={(event) =>
                    handleFilterChange(
                      FilterCategories.TEAM,
                      event.currentTarget.value
                    )
                  }
                  placeholder="team"
                />
              </div>
            )}
            {activeFilters.includes(FilterCategories.RATER) && (
              <div style={styles.inputContainer}>
                <p style={styles.inputLabel}>rater</p>
                <input
                  type="number"
                  style={styles.input}
                  value={advancedFilters.rater?.min}
                  onChange={(event) =>
                    handleFilterChange(
                      FilterCategories.RATER,
                      "min:" + event.currentTarget.value
                    )
                  }
                  placeholder="min"
                />
                <input
                  type="number"
                  style={styles.input}
                  value={advancedFilters.rater?.max}
                  onChange={(event) =>
                    handleFilterChange(
                      FilterCategories.RATER,
                      "max:" + event.currentTarget.value
                    )
                  }
                  placeholder="max"
                />
              </div>
            )}
            {activeFilters.includes(FilterCategories.SALARY) && (
              <div style={styles.inputContainer}>
                <p style={styles.inputLabel}>salaire</p>
                <input
                  type="number"
                  style={styles.input}
                  value={advancedFilters.salary?.min}
                  onChange={(event) =>
                    handleFilterChange(
                      FilterCategories.SALARY,
                      "min:" + event.currentTarget.value
                    )
                  }
                  placeholder="min"
                />
                <input
                  type="number"
                  style={styles.input}
                  value={advancedFilters.salary?.max}
                  onChange={(event) =>
                    handleFilterChange(
                      FilterCategories.SALARY,
                      "max:" + event.currentTarget.value
                    )
                  }
                  placeholder="max"
                />
              </div>
            )}
            {activeFilters.includes(FilterCategories.PROJECTION) && (
              <div style={styles.inputContainer}>
                <p style={styles.inputLabel}>projection</p>
                <input
                  type="number"
                  style={styles.input}
                  value={advancedFilters.projection?.min}
                  onChange={(event) =>
                    handleFilterChange(
                      FilterCategories.PROJECTION,
                      "min:" + event.currentTarget.value
                    )
                  }
                  placeholder="min"
                />
                <input
                  type="number"
                  style={styles.input}
                  value={advancedFilters.projection?.max}
                  onChange={(event) =>
                    handleFilterChange(
                      FilterCategories.PROJECTION,
                      "max:" + event.currentTarget.value
                    )
                  }
                  placeholder="max"
                />
              </div>
            )}
            {activeFilters.includes(FilterCategories.GAMES) && (
              <div style={styles.inputContainer}>
                <p style={styles.inputLabel}>matchs</p>
                <input
                  type="number"
                  style={styles.input}
                  value={advancedFilters.games?.min}
                  onChange={(event) =>
                    handleFilterChange(
                      FilterCategories.GAMES,
                      "min:" + event.currentTarget.value
                    )
                  }
                  placeholder="min"
                />
                <input
                  type="number"
                  style={styles.input}
                  value={advancedFilters.games?.max}
                  onChange={(event) =>
                    handleFilterChange(
                      FilterCategories.GAMES,
                      "max:" + event.currentTarget.value
                    )
                  }
                  placeholder="max"
                />
              </div>
            )}
          </div>
        </>
      )}
    </article>
  );
};
