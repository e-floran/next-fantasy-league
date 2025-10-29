import { CSSProperties } from "react";
import { createStyles } from "../../utils/style";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

interface CheckboxProps {
  labelText?: string;
  isChecked: boolean;
  onChange: () => void;
}
export const CustomCheckbox = ({
  labelText,
  isChecked,
  onChange,
}: CheckboxProps) => {
  const styles = createStyles<CSSProperties>()({
    label: {
      display: "block",
      cursor: "pointer",
      userSelect: "none",
      paddingLeft: labelText ? "2rem" : "0",
      position: "relative",
      overflow: "hidden",
      minWidth: labelText ? "4rem" : "0",
    },
    checkbox: {
      opacity: 0,
      cursor: "pointer",
      position: "absolute",
    },
    icon: {
      position: labelText ? "absolute" : "static",
      fontSize: "1.25rem",
      left: 0,
    },
  });

  return (
    <label style={styles.label}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        style={styles.checkbox}
      />
      {isChecked ? (
        <CheckBoxIcon style={styles.icon} />
      ) : (
        <CheckBoxOutlineBlankIcon style={styles.icon} />
      )}
      {labelText}
    </label>
  );
};
