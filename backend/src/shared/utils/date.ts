import dayjs from "dayjs";

export const dateUtils = {
  format: (date?: Date | string | number, formatStr = "YYYY-MM-DD HH:mm:ss"): string => {
    return dayjs(date).format(formatStr);
  },

  addDays: (date: Date | string | number, days: number): Date => {
    return dayjs(date).add(days, "day").toDate();
  },

  addMinutes: (date: Date | string | number, minutes: number): Date => {
    return dayjs(date).add(minutes, "minute").toDate();
  },

  isBefore: (date1: Date | string | number, date2: Date | string | number): boolean => {
    return dayjs(date1).isBefore(dayjs(date2));
  },

  isAfter: (date1: Date | string | number, date2: Date | string | number): boolean => {
    return dayjs(date1).isAfter(dayjs(date2));
  },

  isValid: (date: any): boolean => {
    return dayjs(date).isValid();
  },
};
