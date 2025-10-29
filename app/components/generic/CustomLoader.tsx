import { CSSProperties } from "react";
import { createStyles, rootColors } from "../../utils/style";
import "./customLoader.css";

export const CustomLoader = () => {
  const styles = createStyles<CSSProperties>()({
    container: {
      width: "100%",
      padding: "1rem",
      display: "flex",
      flexFlow: "column nowrap",
      alignItems: "center",
      gap: "3rem",
    },
    progressContainer: {
      width: "100%",
      height: "2rem",
      backgroundColor: rootColors.fontColor,
    },
    progressBar: {
      height: "2rem",
      width: "0%",
      background: rootColors.primary,
      animation: "progress 20s 1 linear",
    },
  });
  return (
    <article style={styles.container}>
      <div style={styles.progressContainer}>
        <div style={styles.progressBar} />
      </div>
    </article>
  );
};
