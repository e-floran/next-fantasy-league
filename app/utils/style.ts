export const createStyles =
  <TValue>() =>
  <T extends Record<PropertyKey, TValue>>(v: T): T =>
    v;

export const rootColors = {
  primary: "#e45e04",
  background: "#242424",
  fontColor: "#ffeede",
  componentBackground: "#030100",
};
