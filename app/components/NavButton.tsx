import { CSSProperties } from "react";
import { createStyles, rootColors } from "../utils/style";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";
import Link from "next/link";

interface ButtonProps {
  buttonIcon: OverridableComponent<SvgIconTypeMap<object, "svg">> & {
    muiName: string;
  };
  // isDisabled?: boolean;
  onClickButton: () => void;
  navigateTo: string;
}
export const NavButton = ({
  buttonIcon,
  // isDisabled,
  onClickButton,
  navigateTo,
}: ButtonProps) => {
  const styles = createStyles<CSSProperties>()({
    button: {
      borderRadius: "1.25rem",
      border: "none",
      fontSize: "1rem",
      cursor: "pointer",
      width: "2rem",
      height: "2rem",
      transition: "all 0.5s ease",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: rootColors.primary,
      backgroundColor: rootColors.fontColor,
      textDecoration: "none",
      "&:hover": {
        backgroundColor: rootColors.primary,
        color: rootColors.fontColor,
      },
    },
  });

  const NavIcon = buttonIcon;

  return (
    <Link href={navigateTo} onClick={onClickButton} style={styles.button}>
      <NavIcon />
    </Link>
  );
};
