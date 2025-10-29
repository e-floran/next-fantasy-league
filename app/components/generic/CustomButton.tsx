import { CSSProperties } from "react";
import { createStyles } from "../../utils/style";
import { merge } from "lodash";

interface ButtonProps {
  buttonText: string;
  isDisabled?: boolean;
  onClickButton: () => void;
  customStyle?: CSSProperties;
}
export const CustomButton = ({
  buttonText,
  isDisabled,
  onClickButton,
  customStyle,
}: ButtonProps) => {
  const styles = createStyles<CSSProperties>()({
    button: {
      borderRadius: "0.75rem",
      border: "1px solid transparent",
      padding: "0.5rem 1rem",
      fontSize: "1rem",
      fontWeight: 500,
      fontFamily: "inherit",
      cursor: "pointer",
      maxWidth: "15rem",
      maxHeight: "2.5rem",
      lineBreak: "auto",
      whiteSpace: "nowrap",
      transition: "all 0.5s",
    },
  });

  const mergedStyle = customStyle
    ? merge(styles.button, customStyle)
    : styles.button;

  return (
    <button style={mergedStyle} disabled={isDisabled} onClick={onClickButton}>
      {buttonText}
    </button>
  );
};
