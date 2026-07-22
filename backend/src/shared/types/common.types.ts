export type Nullable<T> = T | null;

export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
