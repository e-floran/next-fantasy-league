import { CSSProperties, useState } from "react";
import { StatsCategories } from "../../utils/types";
import { CustomButton } from "../generic/CustomButton";
import { CustomCheckbox } from "../generic/CustomCheckbox";

interface FiltersProps {
  containerStyle: CSSProperties;
  handleCategoryToggle: (category: StatsCategories) => void;
  categoriesToOmit: StatsCategories[];
}
export const RaterFilters = ({
  containerStyle,
  handleCategoryToggle,
  categoriesToOmit,
}: FiltersProps) => {
  const [openFilters, setOpenFilters] = useState(false);

  return (
    <article style={containerStyle}>
      <CustomButton
        buttonText="Exclure"
        onClickButton={() => setOpenFilters(!openFilters)}
      />
      {openFilters &&
        (Object.keys(StatsCategories) as Array<StatsCategories>).map(
          (category) => (
            <CustomCheckbox
              labelText={category}
              onChange={() => handleCategoryToggle(category)}
              isChecked={categoriesToOmit.includes(category)}
              key={category}
            />
          )
        )}
    </article>
  );
};
