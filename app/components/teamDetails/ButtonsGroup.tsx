import { CSSProperties, ReactElement, useContext, useMemo } from "react";
import { createStyles } from "../../utils/style";
import { CustomButton } from "../generic/CustomButton";
import { DataContext } from "../../context/DataContext";

export const ButtonsGroup = (): ReactElement => {
  const { activeTeamId, setActiveTeamId, setSelectedKeepers, dataByTeamId } =
    useContext(DataContext);
  const styles = createStyles<CSSProperties>()({
    buttonsGroup: {
      display: "flex",
      flexFlow: "row wrap",
      justifyContent: "space-between",
      alignItems: "start",
      gap: "0.5rem",
    },
    h2: {
      width: "100%",
    },
    button: {
      width: "45%",
    },
  });

  const teamsIds = useMemo(() => {
    const ids = Array.from(dataByTeamId.keys());
    return ids;
  }, [dataByTeamId]);

  const buttons = useMemo(() => {
    const buttonsArray: ReactElement[] = [];
    teamsIds.forEach((teamId) => {
      const team = dataByTeamId.get(teamId)?.team;
      if (!team) {
        return;
      }
      buttonsArray.push(
        <CustomButton
          key={team.id}
          buttonText={team.name}
          isDisabled={activeTeamId === team.id}
          onClickButton={() => {
            setActiveTeamId(team.id);
            setSelectedKeepers([]);
          }}
          customStyle={styles.button}
        />
      );
    });
    return buttonsArray;
  }, [
    activeTeamId,
    dataByTeamId,
    setActiveTeamId,
    setSelectedKeepers,
    styles.button,
    teamsIds,
  ]);

  return (
    <section style={styles.buttonsGroup}>
      <h2 style={styles.h2}>Effectif</h2>
      {buttons}
    </section>
  );
};
