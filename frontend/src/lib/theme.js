// Central design tokens. Keep colors, radii, and semantic risk mappings
// here so every component reads from one source of truth.

export const RISK_COLORS = {
  Low: { text: '#15803d', bg: '#eaf6ef', border: '#cbe9d6', ribbon: '#15803d' },
  Medium: { text: '#b4650c', bg: '#fbf1e2', border: '#f0dcb8', ribbon: '#b4650c' },
  High: { text: '#b4232f', bg: '#fbeaec', border: '#f0c7cb', ribbon: '#b4232f' },
};

export function riskTokens(level) {
  return RISK_COLORS[level] || RISK_COLORS.Low;
}

export const BRAND = {
  ink: '#10151f',
  petrol: '#0e6e76',
  petrolDark: '#0a545a',
  petrolLight: '#e4f3f3',
  sand: '#f7f5f1',
  sandDeep: '#efece5',
  line: '#e4e1d9',
};
