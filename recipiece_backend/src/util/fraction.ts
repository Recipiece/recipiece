const UNICODE_FRACTION_MAP: { readonly [key: string]: string } = {
  "½": "1/2",
  "#1$2": "1/2",
  "⅓": "1/3",
  "#1$3": "1/3",
  "⅔": "2/3",
  "#2$3": "2/3",
  "¼": "1/4",
  "#1$4": "1/4",
  "¾": "3/4",
  "#3$4": "3/4",
  "⅕": "1/5",
  "#1$5": "1/5",
  "⅖": "2/5",
  "#2$5": "2/5",
  "⅗": "3/5",
  "#3$5": "3/5",
  "⅘": "4/5",
  "#4$5": "4/5",
  "⅙": "1/6",
  "#1$6": "1/6",
  "⅚": "5/6",
  "#5$6": "5/6",
  "⅐": "1/7",
  "#1$7": "1/7",
  "⅛": "1/8",
  "#1$8": "1/8",
  "⅜": "3/8",
  "#3$8": "3/8",
  "⅝": "5/8",
  "#5$8": "5/8",
  "⅞": "7/8",
  "#7$8": "7/8",
  "⅑": "1/9",
  "#1$9": "1/9",
  "⅒": "1/10",
  "#1$10": "1/10",
};

export function replaceUnicodeFractions(text: string) {
  let val = text;
  Object.keys(UNICODE_FRACTION_MAP).forEach((replacer) => {
    val = val.replaceAll(replacer, UNICODE_FRACTION_MAP[replacer]);
  });
  return val;
}
