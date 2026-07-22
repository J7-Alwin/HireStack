export function buildFilterConditions(filters: Record<string, unknown>): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    // Support simple arrays as IN clause
    if (Array.isArray(value)) {
      where[key] = { in: value };
    } else if (typeof value === "object") {
      // Support nested objects like range filters { gte: 10 }
      where[key] = value;
    } else {
      // Standard exact match
      where[key] = value;
    }
  }

  return where;
}
