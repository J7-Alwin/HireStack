import { SortOrder } from "../enums/order.enum";

export function buildSortCondition(sortBy?: string, sortOrder?: SortOrder): Record<string, SortOrder> {
  const defaultField = "createdAt";
  const defaultOrder = SortOrder.DESC;

  const field = sortBy || defaultField;
  const order = sortOrder || defaultOrder;

  // Handle simple nested fields (e.g., "company.name" -> { company: { name: order } })
  if (field.includes(".")) {
    const parts = field.split(".");
    let current: Record<string, any> = {};
    const result = current;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = order;
      } else {
        current[part] = {};
        current = current[part];
      }
    }
    return result as Record<string, SortOrder>;
  }

  return { [field]: order };
}
