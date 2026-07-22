export const stringUtils = {
  capitalize: (text: string): string => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  truncate: (text: string, length = 100, suffix = "..."): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + suffix;
  },

  clean: (text: string): string => {
    return text.replace(/\s+/g, " ").trim();
  },
};
