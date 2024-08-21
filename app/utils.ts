export const labelize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.replace("_", " ").slice(1);

export const readableNumber = (num: number): string =>
  num.toLocaleString("en-GB", { notation: "compact" }).replace(",", ".");
