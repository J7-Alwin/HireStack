export const numberUtils = {
  formatCurrency: (value: number, currency = "USD", locale = "en-US"): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  },

  round: (value: number, precision = 2): number => {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  },

  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },
};
