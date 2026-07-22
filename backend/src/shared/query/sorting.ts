import { SortOrder } from "../enums/order.enum";

export type PrismaSortCondition = {
  [key: string]: SortOrder | PrismaSortCondition;
};

export function buildSortCondition(sortBy?: string, sortOrder?: SortOrder): PrismaSortCondition {
  const defaultField = "createdAt";
  const defaultOrder = SortOrder.DESC;

  const field = sortBy || defaultField;
  const order = sortOrder || defaultOrder;

  // Handle simple nested fields (e.g., "company.name" -> { company: { name: order } })
  if (field.includes(".")) {
    const parts = field.split(".");
    const result: PrismaSortCondition = {};
    let current = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = order;
      } else {
        const next: PrismaSortCondition = {};
        current[part] = next;
        current = next;
      }
    }
    return result;
  }

  return { [field]: order };
}
