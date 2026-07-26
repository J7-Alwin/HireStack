import { v4 as uuidv4, validate as uuidValidate } from "uuid";

export const uuidUtils = {
  generate: (): string => {
    return uuidv4();
  },

  validate: (uuid: string): boolean => {
    return uuidValidate(uuid);
  },
};
