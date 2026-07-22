export const arrayUtils = {
  unique: <T>(arr: T[]): T[] => {
    return Array.from(new Set(arr));
  },

  groupBy: <T, K extends string | number | symbol>(arr: T[], getKey: (item: T) => K): Record<K, T[]> => {
    return arr.reduce((acc, item) => {
      const key = getKey(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<K, T[]>);
  },

  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },
};
