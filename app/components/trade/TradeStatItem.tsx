"use client";
import { CSSProperties, useMemo } from "react";
import { createStyles } from "../../utils/style";
import { StatsCategories } from "../../utils/types";

export const TradeStatItem = ({
  name,
  value,
}: {
  name: string;
  value: number;
}) => {
  const styles = createStyles<CSSProperties>()({
    statItem: {
      color: value > 0 ? "green" : value < 0 ? "red" : "inherit",
    },
  });
  const isPercentage = useMemo(() => {
    return name === StatsCategories.FG || name === StatsCategories.FT;
  }, [name]);

  return (
    <li>
      {name}:
      <span style={styles.statItem}>{` ${
        isPercentage ? (value * 100).toFixed(2) + "%" : value.toFixed(2)
      }`}</span>
    </li>
  );
};
