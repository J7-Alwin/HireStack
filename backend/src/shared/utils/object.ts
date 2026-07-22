export const objectUtils = {
  pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  },

  omit: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  },

  removeUndefined: <T extends Record<string, any>>(obj: T): Partial<T> => {
    const result = { ...obj };
    for (const key of Object.keys(result)) {
      if (result[key] === undefined) {
        delete result[key];
      }
    }
    return result;
  },
};
