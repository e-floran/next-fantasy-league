"use client";
import { CSSProperties, useContext } from "react";
import { DataContext } from "../context/DataContext";
import { createStyles, rootColors } from "../utils/style";
import { CustomLoader } from "./generic/CustomLoader";

export const Updater = () => {
  const styles = createStyles<CSSProperties>()({
    container: {
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100vw",
      display: "flex",
      flexFlow: "column nowrap",
      justifyContent: "center",
      alignItems: "center",
      padding: "3rem",
      zIndex: 100,
      backgroundColor: "#ffeede6b",
    },
    textBox: {
      padding: "1rem",
      borderRadius: "0.75rem",
      backgroundColor: rootColors.fontColor,
      color: rootColors.background,
    },
  });
  const { isUpdating } = useContext(DataContext);
  if (isUpdating) {
    return (
      <section style={styles.container}>
        <article style={styles.textBox}>
          <p>Mise à jour en cours</p>
        </article>
        <CustomLoader />
      </section>
    );
  }
};
